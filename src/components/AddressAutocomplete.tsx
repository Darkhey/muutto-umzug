import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Loader2, MapPin, CheckCircle, AlertTriangle } from 'lucide-react'

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
  label?: string
  required?: boolean
  error?: string
  helpText?: string
}

export const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Adresse eingeben...',
  className,
  label,
  required = false,
  error,
  helpText
}: AddressAutocompleteProps) => {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [highlight, setHighlight] = useState(-1)
  const [isValid, setIsValid] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastFetchRef = useRef(0)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([])
      setInternalError(null)
      setIsValid(false)
      return
    }

    const now = Date.now()
    if (now - lastFetchRef.current < 300) {
      return
    }
    lastFetchRef.current = now

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      setLoading(true)
      setInternalError(null)
      const requestTimeout = setTimeout(() => controller.abort(), 5000)
      fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query
        )}&countrycodes=de,at,ch&limit=5`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'de',
            'User-Agent': 'muutto-umzug/1.0 (+https://www.muutto.xyz)'
          }
        }
      )
        .then(res => res.json())
        .then((data: unknown) => {
          if (!Array.isArray(data)) {
            throw new Error('Ungültige Antwort vom Server')
          }
          const valid = data.filter(
            (d): d is Suggestion =>
              d &&
              typeof d.display_name === 'string' &&
              typeof d.lat === 'string' &&
              typeof d.lon === 'string'
          )
          setSuggestions(valid.slice(0, 5))
          setIsValid(valid.length > 0)
        })
        .catch(err => {
          if (err.name === 'AbortError') {
            console.warn('Address lookup timed out')
            setInternalError('Adresssuche hat zu lange gedauert')
          } else {
            console.error('Address lookup failed', err)
            setInternalError('Adressen konnten nicht geladen werden')
          }
          setSuggestions([])
          setIsValid(false)
        })
        .finally(() => {
          clearTimeout(requestTimeout)
          setLoading(false)
        })
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
    const lat = parseFloat(s.lat)
    const lon = parseFloat(s.lon)
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      console.error('Invalid coordinates in suggestion', s)
      setInternalError('Ungültige Koordinaten')
      return
    }
    onChange(s.display_name)
    onSelect?.({ lat, lon })
    setShow(false)
    setIsValid(true)
  }

  const displayError = error || internalError

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <MapPin className="h-5 w-5" />
        </div>
        
        <Input
          ref={inputRef}
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
            } else if (e.key === 'Escape') {
              e.preventDefault()
              setShow(false)
            }
          }}
          autoComplete="off"
          className={cn(
            'pl-10 pr-10 py-3 h-12 border-2 transition-colors',
            displayError 
              ? 'border-red-500 focus:border-red-500' 
              : isValid && value 
                ? 'border-green-500 focus:border-green-500' 
                : 'focus:border-blue-500'
          )}
          required={required}
          aria-invalid={!!displayError}
          aria-describedby={`${displayError ? 'address-error' : ''} ${helpText ? 'address-help' : ''}`}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
        
        {!loading && isValid && value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
        
        {!loading && displayError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {displayError && (
        <p id="address-error" className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
          <AlertTriangle className="h-3 w-3" />
          {displayError}
        </p>
      )}
      
      {helpText && !displayError && (
        <p id="address-help" className="text-sm text-gray-600 mt-1">
          {helpText}
        </p>
      )}
      
      {show && (suggestions.length > 0 || loading) && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg"
        >
          {loading && (
            <li className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Suche Adressen...
            </li>
          )}
          {suggestions.map((s, i) => (
            <li
              role="option"
              aria-selected={i === highlight}
              key={s.display_name}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 flex items-start gap-2',
                i === highlight && 'bg-gray-100'
              )}
              onClick={() => handleSelect(s)}
            >
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span>{s.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}