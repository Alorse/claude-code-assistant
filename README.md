# 🤖 Claude Code Assistant

**An advanced extension for VS Code, Cursor, and Windsurf that integrates Claude Code with a modern interface, intelligent permission system, and comprehensive conversation management.**

---

## 🌟 **Key Features**

### 💬 **Advanced Chat Interface**
- **Modern React UI**: Interface completely built with React 18, TypeScript and Tailwind CSS
- **Intelligent Messages**: Support for different message types (user, Claude, tools, errors)
- **Syntax Highlighting**: Automatic code highlighting using Shiki with dynamic themes
- **Collapsible Content**: Long results auto-collapse for better UX
- **Reminder System**: Intelligent handling of `<system-reminder>` tags

### 🔧 **Tool System**
- **Tool Execution**: Detailed visualization of tool use with technical information
- **Structured Results**: Intelligent formatting of tool outputs
- **Action Buttons**: Integrated "Open file" and "Copy content" buttons
- **Status Monitoring**: Visual indicators of execution and results

### 🛡️ **Advanced Permission System**
- **Granular Permissions**: Fine control over which tools Claude can execute
- **Interactive Dialogs**: Modern interface for approving/denying permissions
- **Always Allow**: Option to permanently allow tools
- **Smart Patterns**: Automatic recognition of similar commands
- **MCP Integration**: Complete integration with Model Context Protocol

### 📚 **Conversation Management**
- **Complete History**: All conversations are automatically saved
- **Search and Filter**: Find conversations by content or date
- **Context Switching**: Load previous conversations with complete context
- **Persistent Sessions**: Claude maintains context between sessions

### 🎨 **User Experience**
- **Automatic Theming**: Automatically adapts to VS Code/Cursor/Windsurf themes
- **Optimized Performance**: Smart re-renders and memoization
- **Visual States**: Loading, processing, and error indicators
- **Keyboard Shortcuts**: Complete support for keyboard shortcuts

---

## 🚀 **Compatibility**

| Editor | Status | Features |
|--------|--------|----------|
| **VS Code** | ✅ Complete | All features available |
| **Cursor** | ✅ Complete | Native integration with AI features |
| **Windsurf** | ✅ Complete | Full support for Codeium X |

---

## 🏗️ **Technical Architecture**

```
claude-code-assistant/
├── src/                          # 🔧 Main extension code
│   ├── extension.ts             # Entry point
│   ├── core/                    # Core logic
│   │   └── ClaudeAssistantProvider.ts  # Main provider
│   ├── services/                # Modular services
│   │   ├── ClaudeService.ts     # Claude CLI communication
│   │   ├── ConversationService.ts # Conversation management
│   │   └── BackupService.ts     # Backup system
│   ├── utils/                   # Shared utilities
│   └── webview/                 # Webview communication
├── webview-ui/                   # 🎨 React application
│   ├── src/
│   │   ├── components/          # Modular components
│   │   │   ├── ChatContainer.tsx      # Main container
│   │   │   ├── MessageList.tsx        # Message list
│   │   │   ├── ToolUseMessage.tsx     # Tool visualization
│   │   │   ├── PermissionRequest.tsx  # Permission dialogs
│   │   │   └── SystemReminderToggle.tsx # Reminder system
│   │   ├── context/             # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   └── utils/               # UI utilities
├── mcp-permissions.js            # 🛡️ MCP server for permissions
└── tests/                        # 🧪 Testing suite
```

---

## 🛠️ **Technologies**

### **Backend (Extension)**
- **TypeScript** - Complete type safety
- **Node.js** - Main runtime
- **ESBuild** - Ultra-fast bundling
- **VS Code API** - Native integration

### **Frontend (Webview)**
- **React 18** - Modern UI framework
- **TypeScript** - Strict typing
- **Tailwind CSS** - Utility-first CSS
- **Vite** - Next-generation build tool
- **Shiki** - Advanced syntax highlighting

### **Integration Systems**
- **MCP (Model Context Protocol)** - Permission management
- **Claude CLI** - Anthropic communication
- **File System Watchers** - File monitoring

---

## 📦 **Installation**

### **From VS Code Marketplace**
1. Open VS Code/Cursor/Windsurf
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Claude Code Assistant"
4. Click "Install"

### **Local Development**
```bash
# Clone repository
git clone https://github.com/Alorse/claude-code-assistant.git
cd claude-code-assistant

# Install main dependencies
pnpm install

# Install webview dependencies
cd webview-ui && pnpm install

# Complete build
pnpm run build
```

---

## 🔧 **Configuration**

### **Prerequisites**
- **Claude CLI** installed and configured
- **Node.js 18+**
- **Git** (for automatic backups)

### **Initial Setup**
1. Install Claude CLI: `npm install -g @anthropic-ai/claude-3-5-sonnet`
2. Configure your API key: `claude config`
3. Restart VS Code/Cursor/Windsurf
4. Open the extension with `Ctrl+Shift+C`

---

## 🎯 **Advanced Usage**

### **Operation Modes**
- **🤔 Thinking Mode**: Claude "thinks out loud" before responding
- **📋 Plan Mode**: Claude creates a detailed plan before executing
- **⚡ Direct Mode**: Direct responses without additional processing

### **Permission Management**
```typescript
// Automatic permission configuration
{
  "alwaysAllow": {
    "Write": true,           // Always allow file writing
    "Read": true,            // Always allow reading
    "Bash": ["git add *", "npm install *"]  // Specific commands
  }
}
```

### **Shortcuts**
- `Ctrl+Shift+C` - Open/close chat
- `Ctrl+Enter` - Send message
- `Ctrl+Shift+P` - Activate Plan Mode
- `Ctrl+Shift+T` - Activate Thinking Mode
- `Ctrl+H` - Open conversation history

---

## 🔄 **Migration and Compatibility**

### **From claude-code-router-chat**
This extension is a **complete migration** with substantial improvements:

#### ✅ **Migrated Features**
- ✅ Basic chat with Claude
- ✅ Session and model management
- ✅ Plan and Thinking modes
- ✅ Workspace integration
- ✅ Backup system

#### 🆕 **New Features**
- 🆕 **Visual permission system**
- 🆕 **Complete conversation management**
- 🆕 **Modern React UI**
- 🆕 **Syntax highlighting**
- 🆕 **Tool components**
- 🆕 **Optimized performance**

---

## 🧪 **Testing and Quality**

```bash
# Complete testing
pnpm run test

# Testing with coverage
pnpm run test:coverage

# Linting and formatting
pnpm run lint
pnpm run format

# E2E testing
pnpm run test:e2e
```

### **Quality Metrics**
- **Test Coverage**: >90%
- **TypeScript**: Strict mode
- **Performance**: <100ms render time
- **Bundle Size**: <500kb total

---

## 📈 **Roadmap**

### **v1.1.0** 🎯
- [ ] Plugin system for extensions
- [ ] Conversation templates
- [ ] Configuration export/import
- [ ] Advanced usage metrics

### **v1.2.0** 🚀
- [ ] Multi-workspace support
- [ ] Collaborative editing
- [ ] Cloud conversation sync
- [ ] Public API for integrations

### **v2.0.0** 🌟
- [ ] Multiple LLM support
- [ ] Workflow automation
- [ ] Custom UI themes
- [ ] Advanced debugging tools

---

## 🤝 **Contributing**

### **Guidelines**
1. **Fork** the project
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Local Development**
```bash
# Complete setup
pnpm install && cd webview-ui && pnpm install

# Development with hot reload
pnpm run dev

# Testing before PR
pnpm run test && pnpm run lint
```

---

## 📄 **License**

**MIT License** - See [LICENSE](https://github.com/Alorse/claude-code-assistant/blob/main/LICENSE) for complete details.

---

## 🙏 **Acknowledgments**

- **Anthropic** for Claude and the incredible API

---

## 📧 **Support**

- **Issues**: [GitHub Issues](https://github.com/Alorse/claude-code-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Alorse/claude-code-assistant/discussions)
- **Documentation**: [Complete Wiki](https://github.com/Alorse/claude-code-assistant/wiki)

---

<div align="center">

**⭐ If this extension is useful to you, consider giving it a star on GitHub ⭐**

[🐛 Report Bug](https://github.com/Alorse/claude-code-assistant/issues) • [✨ Request Feature](https://github.com/Alorse/claude-code-assistant/issues) • [📖 Documentation](https://github.com/Alorse/claude-code-assistant/wiki)

</div>