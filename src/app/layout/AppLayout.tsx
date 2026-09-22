import { Moon, Sun } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { GlobalFiltersBar } from '@/app/filters/GlobalFiltersBar'
import { NAV_ITEMS } from '@/app/nav'
import { ThemeProvider, useAppTheme } from './ThemeContext'

export function AppLayout() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}

function AppShell() {
  const { search } = useLocation()
  const { theme, toggle } = useAppTheme()
  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      <nav
        aria-label="Principal"
        className="flex gap-1 overflow-x-auto border-b border-slate-200 p-3 md:flex-col md:border-r md:border-b-0 dark:border-slate-800"
      >
        <span className="hidden px-3 py-2 text-lg font-bold md:block">Dashgeral</span>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={{ pathname: to, search }}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={16} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="min-w-0 p-4 md:p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <GlobalFiltersBar />
          <button
            type="button"
            onClick={toggle}
            aria-label="Alternar tema"
            className="rounded-md border border-slate-300 p-2 dark:border-slate-700"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
