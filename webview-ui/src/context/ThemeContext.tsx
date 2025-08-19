import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('auto');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Function to detect VS Code theme
    const detectVSCodeTheme = () => {
      // Check if we're in VS Code webview
      const body = document.body;
      const computedStyle = getComputedStyle(body);
      const backgroundColor = computedStyle.getPropertyValue('--vscode-editor-background');
      
      if (backgroundColor) {
        // Parse the background color to determine if it's dark
        const rgb = backgroundColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const [r, g, b] = rgb.map(Number);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          setIsDark(brightness < 128);
        }
      } else {
        // Fallback: check for dark class or prefer dark media query
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
      }
    };

    // Initial detection
    detectVSCodeTheme();

    // Listen for VS Code theme changes
    const observer = new MutationObserver(() => {
      detectVSCodeTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (theme === 'auto') {
        detectVSCodeTheme();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [theme]);

  useEffect(() => {
    // Update CSS variables based on theme
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    
    // Update the theme color meta tag
    const themeColor = isDark ? '#1e1e1e' : '#ffffff';
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);
  }, [isDark]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
