import { Link } from 'react-router-dom'

interface Item {
  label: string
  to: string
}

const items: Item[] = [
  { label: 'Impressum', to: '/impressum' },
  { label: 'Datenschutz', to: '/datenschutz' },
  { label: 'AGB', to: '/agb' },
  { label: 'Kontakt', to: '/kontakt' }
]

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background" role="contentinfo">
      <ul className="flex flex-wrap justify-center space-x-4 p-4 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="hover:text-primary">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  )
}
