# Claude Code Assistant

**An advanced extension for VS Code, Cursor, and Windsurf that integrates Claude Code with a modern interface, intelligent permission system, and comprehensive conversation management.**


https://github.com/user-attachments/assets/383b7191-2d78-4b2b-b8c1-91846d892772


---

## Key Features

### Advanced Chat Interface

- **Modern React UI**: Interface completely built with React 18, TypeScript and Tailwind CSS
- **Intelligent Messages**: Support for different message types (user, Claude, tools, errors)
- **Syntax Highlighting**: Automatic code highlighting using Shiki with dynamic themes
- **Collapsible Content**: Long results auto-collapse for better UX

### Tool System

- **Tool Execution**: Detailed visualization of tool use with technical information
- **Structured Results**: Intelligent formatting of tool outputs

### Advanced Permission System

- **Granular Permissions**: Fine control over which tools Claude can execute
- **Interactive Dialogs**: Modern interface for approving/denying permissions
- **Always Allow**: Option to permanently allow tools
- **Smart Patterns**: Automatic recognition of similar commands
- **[Soon] MCP Integration**: Complete integration with Model Context Protocol

### Conversation Management

- **Complete History**: All conversations are automatically saved
- **Search and Filter**: Find conversations by content or date
- **Context Switching**: Load previous conversations with complete context
- **Persistent Sessions**: Claude maintains context between sessions

---

## **Compatibility**

| Editor       | Status      |
| ------------ | ----------- |
| **VS Code**  | ✅ Complete |
| **Cursor**   | ✅ Complete |
| **Windsurf** | ✅ Complete |

---

## **Installation**

### **Local Development**

```bash
# Clone repository
git clone https://github.com/Alorse/claude-code-assistant.git
cd claude-code-assistant

# Install main dependencies
pnpm install

# Generate .vsix file
pnpm dlx @vscode/vsce package --no-dependencies
```

### **VSIX Installation**

1. Open your editor
2. Go to the Extensions view: `Ctrl+Shift+X`
3. Click on the "..." button in the top-right corner
4. Select "Install from VSIX"
5. Select the generated `.vsix` file

---

## **Configuration**

### **Prerequisites**

- **Claude CLI** installed and configured
- **Node.js 18+**

---

## **Advanced Usage**

### **Operation Modes**

- **Thinking Mode**: Claude "thinks out loud" before responding
- **Plan Mode**: Claude creates a detailed plan before executing

---

## **Contributing**

### **Guidelines**

1. **Fork** the project
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

---

## **License**

**MIT License** - See [LICENSE](https://github.com/Alorse/claude-code-assistant/blob/main/LICENSE) for complete details.

---

## **Acknowledgments**

- **Anthropic** for Claude and the incredible API
- **Andre Pimenta** for the original [claude-code-chat](https://github.com/andrepimenta/claude-code-chat)

---

## **Support**

- **Issues**: [GitHub Issues](https://github.com/Alorse/claude-code-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Alorse/claude-code-assistant/discussions)

---

<div align="center">

**⭐ If this extension is useful to you, consider giving it a star on GitHub ⭐**

[🐛 Report Bug](https://github.com/Alorse/claude-code-assistant/issues) • [✨ Request Feature](https://github.com/Alorse/claude-code-assistant/issues)

</div>
