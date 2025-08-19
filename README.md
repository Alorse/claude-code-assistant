# Claude Code Assistant

Una extensión moderna de VS Code que integra las funcionalidades de Claude Code en una interfaz de usuario React completamente optimizada y arquitecturalmente sólida.

## 🌟 Características

- ✅ **Interfaz React Modern**: UI construida con React, TypeScript y Tailwind CSS
- ✅ **Arquitectura Limpia**: Separación clara entre extensión y webview UI
- ✅ **Compatibilidad VS Code**: Integración nativa con el ecosistema de VS Code
- ✅ **Theming Inteligente**: Soporte automático para temas dark/light de VS Code
- ✅ **Performance Optimizada**: Build process con esbuild y Vite para máximo rendimiento

## 🏗️ Arquitectura

```
claude-code-assistant/
├── src/                      # Código principal de la extensión
│   ├── extension.ts         # Punto de entrada de la extensión
│   ├── core/               # Lógica central del negocio
│   ├── services/          # Servicios compartidos
│   ├── utils/             # Utilidades
│   └── webview/           # Manejo de comunicación con webview
├── webview-ui/            # Aplicación React para la UI
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── context/      # Contextos React (Theme, VSCode)
│   │   ├── hooks/        # Hooks personalizados
│   │   └── utils/        # Utilidades del UI
│   └── styles/           # Estilos globales y variables de tema
└── tests/                # Archivos de prueba
```

## 🚀 Tecnologías

### Extensión Principal
- **TypeScript**: Lenguaje principal
- **ESBuild**: Bundling rápido y eficiente
- **VS Code API**: Integración nativa

### Webview UI
- **React 18**: Framework de UI
- **TypeScript**: Type safety completo
- **Tailwind CSS**: Framework de CSS utility-first
- **Vite**: Build tool moderno y rápido

### Herramientas de Desarrollo
- **pnpm**: Gestor de paquetes eficiente
- **ESLint + Prettier**: Calidad y formato de código
- **Vitest**: Framework de testing unitario

## 🔧 Desarrollo

### Prerequisitos
- Node.js 18+
- pnpm
- VS Code

### Instalación
```bash
# Clonar el repositorio
git clone <repo-url>
cd claude-code-assistant

# Instalar dependencias principales
pnpm install

# Instalar dependencias del webview
cd webview-ui && pnpm install
```

### Scripts de Desarrollo
```bash
# Build completo del proyecto
pnpm run build

# Desarrollo con watch mode
pnpm run dev

# Solo extensión
pnpm run build:extension
pnpm run watch:extension

# Solo webview UI
pnpm run build:webview
pnpm run watch:webview

# Linting y formateo
pnpm run lint
pnpm run format

# Testing
pnpm run test
```

### Debugging
1. Abrir el proyecto en VS Code
2. Presionar `F5` para lanzar una nueva ventana de VS Code con la extensión
3. El webview React soporta hot reload durante el desarrollo

## 📁 Estructura de Componentes

### Componentes Principales
- **ChatContainer**: Componente principal que maneja el estado del chat
- **Header**: Barra superior con controles de sesión
- **MessageList**: Lista de mensajes con scroll automático
- **MessageItem**: Componente individual de mensaje con copy/paste
- **InputArea**: Área de entrada con controles y modos
- **StatusBar**: Barra de estado con indicadores visuales

### Contextos
- **VSCodeContext**: Maneja la comunicación con la extensión
- **ThemeContext**: Gestiona el theming automático de VS Code

### Hooks Personalizados
- **useVSCodeMessages**: Manejo tipado de mensajes VS Code
- Adicionales según necesidades

## 🎨 Sistema de Theming

El sistema de theming está diseñado para ser flexible y mantener consistencia con VS Code:

```typescript
// Contexto de tema que detecta automáticamente el tema de VS Code
const ThemeContext = createContext<ThemeContextType>();

// CSS variables que se mapean automáticamente
:root {
  --background: var(--vscode-editor-background);
  --foreground: var(--vscode-editor-foreground);
  --border: var(--vscode-panel-border);
  // ... más variables
}
```

## 🔗 Comunicación Extensión-Webview

La comunicación entre la extensión y el webview React está tipada y estructurada:

```typescript
// Tipos de mensaje definidos
interface SendMessageRequest {
  type: 'sendMessage';
  text: string;
  planMode?: boolean;
  thinkingMode?: boolean;
}

// Hook para manejo de mensajes
const { postMessage } = useVSCode();
postMessage({ type: 'sendMessage', text: 'Hello Claude!' });
```

## 🧪 Testing

```bash
# Ejecutar tests unitarios
pnpm run test

# Tests con coverage
pnpm run test:coverage

# Tests E2E (VS Code extension testing)
pnpm run test:e2e
```

## 📦 Build y Packaging

```bash
# Build de producción
pnpm run build

# Crear paquete VSIX
pnpm run package

# Publicar a VS Code Marketplace
pnpm run publish
```

## 🔄 Migración desde claude-code-router-chat

Esta extensión es una migración completa de la extensión original `claude-code-router-chat` con las siguientes mejoras:

### ✅ Completado
- [x] Arquitectura modular y escalable
- [x] UI React con componentes reutilizables
- [x] Sistema de theming automático
- [x] Build process optimizado
- [x] Estructura de proyecto limpia
- [x] Comunicación tipada extensión-webview

### 🚧 En Progreso
- [ ] Migración completa de todas las funcionalidades
- [ ] Testing comprehensivo
- [ ] Documentación de API

### 📋 Funcionalidades Migradas
- ✅ Chat básico con Claude
- ✅ Gestión de sesiones
- ✅ Modos Plan y Thinking
- ✅ Selector de modelos
- ✅ Integración con VS Code

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📝 License

Ver `LICENSE` file para detalles.

## 🙏 Acknowledgments

- Basado en la extensión original `claude-code-router-chat`
- Inspirado en las mejores prácticas de extensiones VS Code
- UI/UX siguiendo las guías de diseño de VS Code
