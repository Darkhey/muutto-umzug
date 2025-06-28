import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Suggestion {
  display_name: string
  lat: string
  lon: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (s: { lat: number; lon: number }) => void
  placeholder?: string
  className?: string
}

export const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder,
  className
}: AddressAutocompleteProps) => {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      setLoading(true)
      fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query
        )}`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'de'
          }
        }
      )
        .then(res => res.json())
        .then((data: Suggestion[]) => {
          setSuggestions(data.slice(0, 5))
        })
        .catch(err => {
          console.error('Address lookup failed', err)
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShow(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleSelect = (s: Suggestion) => {
    onChange(s.display_name)
    onSelect?.({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) })
    setShow(false)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        value={value}
        onChange={e => {
          onChange(e.target.value)
          setQuery(e.target.value)
          setShow(true)
        }}
        placeholder={placeholder}
        onFocus={() => setShow(true)}
        onKeyDown={e => {
          if (!show) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlight(h => (h + 1) % suggestions.length)
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlight(h => (h - 1 + suggestions.length) % suggestions.length)
          } else if (e.key === 'Enter') {
            if (highlight >= 0 && suggestions[highlight]) {
              e.preventDefault()
              handleSelect(suggestions[highlight])
            }
          }
        }}
        autoComplete="off"
      />
      {show && (suggestions.length > 0 || loading) && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg"
        >
          {loading && (
            <li className="px-2 py-1 text-sm text-gray-500">Lade...</li>
          )}
          {suggestions.map((s, i) => (
            <li
              role="option"
              aria-selected={i === highlight}
              key={s.display_name}
              className={cn(
                'cursor-pointer px-2 py-1 text-sm hover:bg-gray-100',
                i === highlight && 'bg-gray-100'
              )}
              onClick={() => handleSelect(s)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
