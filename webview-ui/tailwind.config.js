/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // VS Code color variables - these will be mapped via CSS variables
        background: "var(--vscode-editor-background)",
        foreground: "var(--vscode-editor-foreground)",
        border: "var(--vscode-panel-border)",
        input: {
          background: "var(--vscode-input-background)",
          foreground: "var(--vscode-input-foreground)",
          border: "var(--vscode-input-border)",
        },
        button: {
          background: "var(--vscode-button-background)",
          foreground: "var(--vscode-button-foreground)",
          hover: "var(--vscode-button-hoverBackground)",
        },
        panel: {
          background: "var(--vscode-panel-background)",
          border: "var(--vscode-panel-border)",
        },
        description: "var(--vscode-descriptionForeground)",
        focus: "var(--vscode-focusBorder)",
      },
      fontFamily: {
        vscode: "var(--vscode-font-family)",
        editor: "var(--vscode-editor-font-family)",
      },
      fontSize: {
        vscode: "var(--vscode-editor-font-size)",
      },
    },
  },
  plugins: [],
};
