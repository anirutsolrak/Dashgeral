import { createContext, useContext, type ReactNode } from 'react'
import { useTheme } from './useTheme'

type ThemeValue = ReturnType<typeof useTheme>

const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useTheme()
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppTheme(): ThemeValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useAppTheme must be used within a ThemeProvider')
  return ctx
}
