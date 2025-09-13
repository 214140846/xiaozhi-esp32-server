/**
 * 主题上下文 - 管理应用主题状态
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'ui-theme',
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 从localStorage读取保存的主题设置
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && (stored === 'light' || stored === 'dark')) {
          return stored as Theme;
        }
      } catch (error) {
        console.warn('[ThemeContext] 无法从localStorage读取主题设置:', error);
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // 移除之前的主题类名
    root.classList.remove('light', 'dark');
    
    // 添加当前主题类名
    root.classList.add(theme);
    
    // 保存主题到localStorage
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn('[ThemeContext] 无法保存主题设置到localStorage:', error);
    }
  }, [theme, storageKey]);

  const setTheme = (newTheme: Theme) => {
    console.log(`[ThemeContext] 切换主题到: ${newTheme}`);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};