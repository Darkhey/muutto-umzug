import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, MapPin, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const triggerFetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    if (query.length < 3) {
      setSuggestions([])
      setInternalError(null)
      setIsValid(false)
      return
    }

    setLoading(true)
    setInternalError(null)
    
    const controller = new AbortController()
    abortControllerRef.current = controller

    const requestTimeout = setTimeout(() => controller.abort(), 10000)

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
        if (controller.signal.aborted) return;
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
          console.warn('Address lookup timed out or was aborted')
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
        if (abortControllerRef.current === controller) {
          setLoading(false)
        }
      })
  }, [query])

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      triggerFetch()
    }, 500) // Wait 500ms after user stops typing

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query, triggerFetch])

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
            // setQuery is handled by useEffect
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
        <div className="text-sm text-red-600 mt-1 flex items-center justify-between" role="alert">
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {displayError}
          </span>
          <Button variant="link" size="sm" onClick={triggerFetch} className="p-0 h-auto text-sm text-red-600 hover:text-red-700">
            <RefreshCw className="h-3 w-3 mr-1" />
            Erneut versuchen
          </Button>
        </div>
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
          {loading && !internalError && (
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
