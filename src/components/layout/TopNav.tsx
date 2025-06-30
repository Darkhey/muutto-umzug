import { Link, useLocation } from 'react-router-dom'

interface Item {
  label: string
  to: string
}

const items: Item[] = [
  { label: 'Dashboard', to: '/' },
  { label: 'Timeline', to: '/timeline' },
  { label: 'Umzugstag', to: '/moving-day' },
  { label: 'Settings', to: '/settings' }
]

export const TopNav = () => {
  const location = useLocation()
  return (
    <nav className="border-b border-border bg-background" role="navigation" aria-label="Main navigation">
      <ul className="flex space-x-6 px-4 py-2">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`${location.pathname === item.to ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
              aria-current={location.pathname === item.to ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
