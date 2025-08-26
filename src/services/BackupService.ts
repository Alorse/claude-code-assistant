import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";

const exec = promisify(cp.exec);

export interface CommitInfo {
  sha: string;
  message: string;
  timestamp: string;
  displayTimestamp: string;
}

export class BackupService {
  private backupRepoPath?: string;

  constructor(
    private workspacePath: string,
    private messageHandler: (message: { type: string; data: any }) => void,
  ) {
    this.initializeBackupRepo();
  }

  async createBackupCommit(userMessage: string): Promise<CommitInfo | null> {
    try {
      if (!this.backupRepoPath) {
        console.log("No backup repo configured");
        return null;
      }

      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-");
      const displayTimestamp = now.toISOString();
      const commitMessage = `Before: ${userMessage.substring(0, 50)}${userMessage.length > 50 ? "..." : ""}`;

      // Copy current workspace to backup repo
      await this.copyWorkspaceToBackup();

      // Create git commit in backup repo
      const { stdout: addOutput } = await exec("git add -A", {
        cwd: this.backupRepoPath,
      });
      console.log("Git add output:", addOutput);

      const { stdout: commitOutput } = await exec(
        `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
        { cwd: this.backupRepoPath },
      );
      console.log("Git commit output:", commitOutput);

      // Get commit SHA
      const { stdout: shaOutput } = await exec("git rev-parse HEAD", {
        cwd: this.backupRepoPath,
      });
      const sha = shaOutput.trim();

      const commitInfo: CommitInfo = {
        sha,
        message: commitMessage,
        timestamp,
        displayTimestamp,
      };

      // Show restore option in UI
      this.messageHandler({
        type: "showRestoreOption",
        data: commitInfo,
      });

      console.log(
        `Created backup commit: ${sha.substring(0, 8)} - ${commitMessage}`,
      );
      return commitInfo;
    } catch (error: any) {
      console.error("Failed to create backup commit:", error.message);
      return null;
    }
  }

  async restoreFromCommit(commitSha: string): Promise<void> {
    try {
      if (!this.backupRepoPath) {
        throw new Error("No backup repo configured");
      }

      // Get commit info
      const { stdout: logOutput } = await exec(
        `git log --format="%H %s" -1 ${commitSha}`,
        { cwd: this.backupRepoPath },
      );

      const [sha, ...messageParts] = logOutput.trim().split(" ");
      const message = messageParts.join(" ");

      // Checkout the commit
      await exec(`git checkout ${commitSha}`, { cwd: this.backupRepoPath });

      // Copy files back to workspace
      await this.copyBackupToWorkspace();

      // Go back to main branch
      await exec("git checkout main", { cwd: this.backupRepoPath });

      this.messageHandler({
        type: "restoreSuccess",
        data: {
          message: `Successfully restored to: ${message}`,
          commitSha: commitSha,
        },
      });
    } catch (error: any) {
      console.error("Failed to restore commit:", error.message);
      throw error;
    }
  }

  private async initializeBackupRepo(): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration("claudeCodeAssistant");
      const backupEnabled = config.get<boolean>("backup.enabled", false);

      if (!backupEnabled) {
        console.log("Backup is disabled");
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        console.log("No workspace folder found");
        return;
      }

      // Create backup directory in .claude folder
      const claudeDir = path.join(this.workspacePath, ".claude");
      this.backupRepoPath = path.join(claudeDir, "backup");

      if (!fs.existsSync(this.backupRepoPath)) {
        fs.mkdirSync(this.backupRepoPath, { recursive: true });

        // Initialize git repo
        await exec("git init", { cwd: this.backupRepoPath });
        await exec("git checkout -b main", { cwd: this.backupRepoPath });

        // Configure git user if not already set
        try {
          await exec('git config user.name "Claude Code Assistant"', {
            cwd: this.backupRepoPath,
          });
          await exec('git config user.email "claude@assistant.local"', {
            cwd: this.backupRepoPath,
          });
        } catch (error) {
          console.log("Git user config already set or failed to set");
        }

        console.log("Initialized backup repository at:", this.backupRepoPath);
      }
    } catch (error) {
      console.error("Failed to initialize backup repo:", error);
      this.backupRepoPath = undefined;
    }
  }

  private async copyWorkspaceToBackup(): Promise<void> {
    if (!this.backupRepoPath) {
      throw new Error("Backup repo not initialized");
    }

    // Get list of files to copy (excluding .git, node_modules, etc.)
    const filesToCopy = await this.getWorkspaceFiles();

    // Clear backup directory (except .git)
    await this.clearBackupDirectory();

    // Copy files
    for (const file of filesToCopy) {
      const srcPath = path.join(this.workspacePath, file);
      const destPath = path.join(this.backupRepoPath, file);

      // Ensure directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }

  private async copyBackupToWorkspace(): Promise<void> {
    if (!this.backupRepoPath) {
      throw new Error("Backup repo not initialized");
    }

    // Get list of files in backup
    const filesToRestore = await this.getBackupFiles();

    // Copy files back to workspace
    for (const file of filesToRestore) {
      const srcPath = path.join(this.backupRepoPath, file);
      const destPath = path.join(this.workspacePath, file);

      // Ensure directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }

  private async getWorkspaceFiles(): Promise<string[]> {
    const files: string[] = [];
    const excludePatterns = [
      ".git",
      "node_modules",
      ".claude",
      ".vscode",
      "*.log",
      ".env*",
      "dist",
      "build",
      "coverage",
    ];

    const walkDir = (dir: string, basePath = ""): void => {
      const entries = fs.readdirSync(path.join(this.workspacePath, dir));

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativePath = path.join(basePath, entry);
        const absolutePath = path.join(this.workspacePath, fullPath);

        // Skip excluded patterns
        if (
          excludePatterns.some(
            (pattern) =>
              entry.includes(pattern.replace("*", "")) ||
              relativePath.includes(pattern.replace("*", "")),
          )
        ) {
          continue;
        }

        const stat = fs.statSync(absolutePath);

        if (stat.isDirectory()) {
          walkDir(fullPath, relativePath);
        } else {
          files.push(relativePath);
        }
      }
    };

    walkDir("");
    return files;
  }

  private async getBackupFiles(): Promise<string[]> {
    if (!this.backupRepoPath) {
      return [];
    }

    const files: string[] = [];

    const walkDir = (dir: string, basePath = ""): void => {
      const fullDir = path.join(this.backupRepoPath!, dir);
      if (!fs.existsSync(fullDir)) return;

      const entries = fs.readdirSync(fullDir);

      for (const entry of entries) {
        if (entry === ".git") continue; // Skip .git directory

        const fullPath = path.join(fullDir, entry);
        const relativePath = path.join(basePath, entry);

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(path.join(dir, entry), relativePath);
        } else {
          files.push(relativePath);
        }
      }
    };

    walkDir("");
    return files;
  }

  private async clearBackupDirectory(): Promise<void> {
    if (!this.backupRepoPath) {
      return;
    }

    const entries = fs.readdirSync(this.backupRepoPath);

    for (const entry of entries) {
      if (entry === ".git") continue; // Don't delete .git directory

      const fullPath = path.join(this.backupRepoPath, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
    }
  }

  getBackupRepoPath(): string | undefined {
    return this.backupRepoPath;
  }
}
