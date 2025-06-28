import { useState, useEffect } from 'react'
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
        .catch(() => {})
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  const handleSelect = (s: Suggestion) => {
    onChange(s.display_name)
    onSelect?.({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) })
    setShow(false)
  }

  return (
    <div className={cn('relative', className)}>
      <Input
        value={value}
        onChange={e => {
          onChange(e.target.value)
          setQuery(e.target.value)
          setShow(true)
        }}
        placeholder={placeholder}
        onFocus={() => setShow(true)}
        autoComplete="off"
      />
      {show && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
          {suggestions.map(s => (
            <li
              key={s.display_name}
              className="cursor-pointer px-2 py-1 text-sm hover:bg-gray-100"
              onMouseDown={() => handleSelect(s)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
