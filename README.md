# 🤖 Claude Code Assistant

**Una extensión avanzada para VS Code, Cursor, y Windsurf que integra Claude Code con una interfaz moderna, sistema de permisos inteligente y gestión completa de conversaciones.**

---

## 🌟 **Características Principales**

### 💬 **Interfaz de Chat Avanzada**
- **UI React Moderna**: Interfaz completamente construida con React 18, TypeScript y Tailwind CSS
- **Mensajes Inteligentes**: Soporte para diferentes tipos de mensajes (usuario, Claude, herramientas, errores)
- **Syntax Highlighting**: Resaltado de código automático usando Shiki con temas dinámicos
- **Contenido Colapsable**: Los resultados largos se colapsan automáticamente para mejor UX
- **Sistema de Recordatorios**: Manejo inteligente de `<system-reminder>` tags

### 🔧 **Sistema de Herramientas**
- **Ejecutión de Herramientas**: Visualización detallada de tool use con información técnica
- **Resultados Estructurados**: Formateo inteligente de outputs de herramientas
- **Botones de Acción**: "Abrir archivo" y "Copiar contenido" integrados
- **Monitoreo de Estado**: Indicadores visuales de ejecución y resultados

### 🛡️ **Sistema de Permisos Avanzado**
- **Permisos Granulares**: Control fino sobre qué herramientas puede ejecutar Claude
- **Diálogos Interactivos**: Interfaz moderna para aprobar/denegar permisos
- **Always Allow**: Opción para permitir herramientas permanentemente
- **Patrones Inteligentes**: Reconocimiento automático de comandos similares
- **MCP Integration**: Integración completa con Model Context Protocol

### 📚 **Gestión de Conversaciones**
- **Historial Completo**: Todas las conversaciones se guardan automáticamente
- **Búsqueda y Filtrado**: Encuentra conversaciones por contenido o fecha
- **Cambio de Contexto**: Carga conversaciones anteriores con contexto completo
- **Sesiones Persistentes**: Claude mantiene el contexto entre sesiones

### 🎨 **Experiencia de Usuario**
- **Theming Automático**: Se adapta automáticamente a los temas de VS Code/Cursor/Windsurf
- **Performance Optimizada**: Re-renders inteligentes y memoización
- **Estados Visuales**: Indicadores de carga, procesamiento y errores
- **Keyboard Shortcuts**: Soporte completo para atajos de teclado

---

## 🚀 **Compatibilidad**

| Editor | Estado | Características |
|--------|--------|----------------|
| **VS Code** | ✅ Completo | Todas las características disponibles |
| **Cursor** | ✅ Completo | Integración nativa con AI features |
| **Windsurf** | ✅ Completo | Soporte completo para Codeium X |

---

## 🏗️ **Arquitectura Técnica**

```
claude-code-assistant/
├── src/                          # 🔧 Código principal de la extensión
│   ├── extension.ts             # Punto de entrada
│   ├── core/                    # Lógica central
│   │   └── ClaudeAssistantProvider.ts  # Provider principal
│   ├── services/                # Servicios modulares
│   │   ├── ClaudeService.ts     # Comunicación con Claude CLI
│   │   ├── ConversationService.ts # Gestión de conversaciones
│   │   └── BackupService.ts     # Sistema de backups
│   ├── utils/                   # Utilidades compartidas
│   └── webview/                 # Comunicación webview
├── webview-ui/                   # 🎨 Aplicación React
│   ├── src/
│   │   ├── components/          # Componentes modulares
│   │   │   ├── ChatContainer.tsx      # Container principal
│   │   │   ├── MessageList.tsx        # Lista de mensajes
│   │   │   ├── ToolUseMessage.tsx     # Visualización de herramientas
│   │   │   ├── PermissionRequest.tsx  # Diálogos de permisos
│   │   │   └── SystemReminderToggle.tsx # Sistema de recordatorios
│   │   ├── context/             # Contextos React
│   │   ├── hooks/               # Hooks personalizados
│   │   └── utils/               # Utilidades UI
├── mcp-permissions.js            # 🛡️ Servidor MCP para permisos
└── tests/                        # 🧪 Suite de testing
```

---

## 🛠️ **Tecnologías**

### **Backend (Extensión)**
- **TypeScript** - Type safety completo
- **Node.js** - Runtime principal
- **ESBuild** - Bundling ultra-rápido
- **VS Code API** - Integración nativa

### **Frontend (Webview)**
- **React 18** - Framework UI moderno
- **TypeScript** - Tipado estricto
- **Tailwind CSS** - Utility-first CSS
- **Vite** - Build tool de nueva generación
- **Shiki** - Syntax highlighting avanzado

### **Sistemas de Integración**
- **MCP (Model Context Protocol)** - Gestión de permisos
- **Claude CLI** - Comunicación con Anthropic
- **File System Watchers** - Monitoreo de archivos

---

## 📦 **Instalación**

### **Desde VS Code Marketplace**
1. Abre VS Code/Cursor/Windsurf
2. Ve a Extensions (`Ctrl+Shift+X`)
3. Busca "Claude Code Assistant"
4. Haz clic en "Install"

### **Desarrollo Local**
```bash
# Clonar repositorio
git clone https://github.com/[usuario]/claude-code-assistant.git
cd claude-code-assistant

# Instalar dependencias principales
pnpm install

# Instalar dependencias del webview
cd webview-ui && pnpm install

# Build completo
pnpm run build
```

---

## 🔧 **Configuración**

### **Prerequisitos**
- **Claude CLI** instalado y configurado
- **Node.js 18+**
- **Git** (para backups automáticos)

### **Primera Configuración**
1. Instala Claude CLI: `npm install -g @anthropic-ai/claude-3-5-sonnet`
2. Configura tu API key: `claude config`
3. Reinicia VS Code/Cursor/Windsurf
4. Abre la extensión con `Ctrl+Shift+C`

---

## 🎯 **Uso Avanzado**

### **Modos de Operación**
- **🤔 Thinking Mode**: Claude "piensa en voz alta" antes de responder
- **📋 Plan Mode**: Claude crea un plan detallado antes de ejecutar
- **⚡ Direct Mode**: Respuestas directas sin procesamiento adicional

### **Gestión de Permisos**
```typescript
// Configuración de permisos automáticos
{
  "alwaysAllow": {
    "Write": true,           // Siempre permitir escritura de archivos
    "Read": true,            // Siempre permitir lectura
    "Bash": ["git add *", "npm install *"]  // Comandos específicos
  }
}
```

### **Shortcuts**
- `Ctrl+Shift+C` - Abrir/cerrar chat
- `Ctrl+Enter` - Enviar mensaje
- `Ctrl+Shift+P` - Activar Plan Mode
- `Ctrl+Shift+T` - Activar Thinking Mode
- `Ctrl+H` - Abrir historial de conversaciones

---

## 🔄 **Migración y Compatibilidad**

### **Desde claude-code-router-chat**
Esta extensión es una **migración completa** con mejoras sustanciales:

#### ✅ **Características Migradas**
- ✅ Chat básico con Claude
- ✅ Gestión de sesiones y modelos
- ✅ Modos Plan y Thinking
- ✅ Integración con workspace
- ✅ Sistema de backups

#### 🆕 **Nuevas Características**
- 🆕 **Sistema de permisos visual**
- 🆕 **Gestión completa de conversaciones**
- 🆕 **UI React moderna**
- 🆕 **Syntax highlighting**
- 🆕 **Componentes de herramientas**
- 🆕 **Performance optimizada**

---

## 🧪 **Testing y Calidad**

```bash
# Testing completo
pnpm run test

# Testing con coverage
pnpm run test:coverage

# Linting y formatting
pnpm run lint
pnpm run format

# Testing E2E
pnpm run test:e2e
```

### **Métricas de Calidad**
- **Test Coverage**: >90%
- **TypeScript**: Strict mode
- **Performance**: <100ms render time
- **Bundle Size**: <500kb total

---

## 📈 **Roadmap**

### **v1.1.0** 🎯
- [ ] Plugin system para extensiones
- [ ] Templates de conversación
- [ ] Export/import de configuraciones
- [ ] Métricas de uso avanzadas

### **v1.2.0** 🚀
- [ ] Multi-workspace support
- [ ] Collaborative editing
- [ ] Cloud sync de conversaciones
- [ ] API pública para integraciones

### **v2.0.0** 🌟
- [ ] Soporte para múltiples LLMs
- [ ] Workflow automation
- [ ] Custom UI themes
- [ ] Advanced debugging tools

---

## 🤝 **Contribución**

### **Guidelines**
1. **Fork** el proyecto
2. **Crear feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit cambios**: `git commit -m 'Add amazing feature'`
4. **Push**: `git push origin feature/amazing-feature`
5. **Abrir Pull Request**

### **Desarrollo Local**
```bash
# Setup completo
pnpm install && cd webview-ui && pnpm install

# Desarrollo con hot reload
pnpm run dev

# Testing antes de PR
pnpm run test && pnpm run lint
```

---

## 📄 **Licencia**

**MIT License** - Ver [LICENSE](LICENSE) para detalles completos.

---

## 🙏 **Agradecimientos**

- **Anthropic** por Claude y la increíble API
- **VS Code Team** por la excelente plataforma de extensiones
- **Cursor Team** por las innovaciones en AI-powered coding
- **Windsurf Team** por el soporte avanzado de Codeium X
- **React Community** por el ecosistema robusto
- **Comunidad Open Source** por las librerías y herramientas

---

## 📧 **Soporte**

- **Issues**: [GitHub Issues](https://github.com/[usuario]/claude-code-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[usuario]/claude-code-assistant/discussions)
- **Documentation**: [Wiki completa](https://github.com/[usuario]/claude-code-assistant/wiki)

---

<div align="center">

**⭐ Si esta extensión te es útil, considera darle una estrella en GitHub ⭐**

[🐛 Reportar Bug](https://github.com/[usuario]/claude-code-assistant/issues) • [✨ Solicitar Feature](https://github.com/[usuario]/claude-code-assistant/issues) • [📖 Documentación](https://github.com/[usuario]/claude-code-assistant/wiki)

</div>