import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHouseholds } from '@/hooks/useHouseholds'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, ArrowLeft, Plus } from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'

interface TimeSlot {
  time: string
  note: string
}

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = []
  for (let hour = 6; hour <= 22; hour++) {
    for (const quarter of [0, 15, 30, 45]) {
      const time = `${hour.toString().padStart(2, '0')}:${quarter
        .toString()
        .padStart(2, '0')}`
      slots.push({ time, note: '' })
    }
  }
  return slots
}

const getBestPractices = (household: ExtendedHousehold) => {
  const tips = [
    'Beginne frühzeitig mit dem Beladen des Umzugswagens.',
    'Halte eine Checkliste bereit, um nichts zu vergessen.',
    'Plane ausreichend Verpflegung für deine Helfer.',
    'Reserviere Parkmöglichkeiten vor beiden Wohnungen.'
  ]
  if (household.children_count > 0) {
    tips.push('Organisiere eine Kinderbetreuung für den Umzugstag.')
  }
  if (household.pets_count > 0) {
    tips.push('Richte einen ruhigen Ort für deine Haustiere ein.')
  }
  return tips
}

const MovingDay = () => {
  const navigate = useNavigate()
  const { households } = useHouseholds()
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>()
  const household = households?.find(h => h.id === selectedHouseholdId) || households?.[0]

  const initialSlots = useMemo(() => generateTimeSlots(), [])
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots)
  const [helperName, setHelperName] = useState('')
  const [helpers, setHelpers] = useState<string[]>([])

  useEffect(() => {
    if (households && households.length > 0 && !selectedHouseholdId) {
      setSelectedHouseholdId(households[0].id)
    }
  }, [households, selectedHouseholdId])

  // Load saved data for the selected household
  useEffect(() => {
    if (!selectedHouseholdId) return
    const storedSlots = localStorage.getItem(`moving_day_slots_${selectedHouseholdId}`)
    const storedHelpers = localStorage.getItem(`moving_day_helpers_${selectedHouseholdId}`)
    if (storedSlots) {
      try {
        setSlots(JSON.parse(storedSlots))
      } catch (err) {
        console.error('Failed to parse stored slots', err)
      }
    } else {
      setSlots(initialSlots)
    }
    if (storedHelpers) {
      try {
        setHelpers(JSON.parse(storedHelpers))
      } catch (err) {
        console.error('Failed to parse stored helpers', err)
      }
    } else {
      setHelpers([])
    }
  }, [selectedHouseholdId, initialSlots])

  // Persist data
  useEffect(() => {
    if (selectedHouseholdId) {
      localStorage.setItem(`moving_day_slots_${selectedHouseholdId}`, JSON.stringify(slots))
    }
  }, [slots, selectedHouseholdId])

  useEffect(() => {
    if (selectedHouseholdId) {
      localStorage.setItem(`moving_day_helpers_${selectedHouseholdId}`, JSON.stringify(helpers))
    }
  }, [helpers, selectedHouseholdId])

  const updateSlot = (index: number, value: string) => {
    setSlots(prev => prev.map((s, i) => (i === index ? { ...s, note: value } : s)))
  }

  const addHelper = () => {
    if (helperName.trim()) {
      setHelpers(prev => [...prev, helperName.trim()])
      setHelperName('')
    }
  }

  const tips = household ? getBestPractices(household) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Umzugstag planen</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              {household ? (
                <Badge variant="outline" className="bg-green-50 text-green-800">
                  {new Date(household.move_date).toLocaleDateString('de-DE')}
                </Badge>
              ) : (
                'Umzugstag'
              )}
            </CardTitle>
            {households && households.length > 1 && (
              <div className="mt-2">
                <Select value={selectedHouseholdId} onValueChange={setSelectedHouseholdId}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Haushalt wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {households.map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="font-semibold mb-2">Best Practices</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {tips.map(tip => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Zeitplan (15&nbsp;Minuten)</h3>
              <div className="overflow-x-auto max-h-[400px] border rounded">
                <table
                  className="min-w-full text-sm"
                  role="grid"
                  aria-label="Umzugstag Zeitplan"
                >
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Uhrzeit</th>
                      <th scope="col">Aufgabe oder Notiz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot, i) => (
                      <tr key={slot.time} className="border-b last:border-b-0" role="row">
                        <td className="w-20 px-2 py-1 text-right text-gray-600" role="gridcell">
                          {slot.time}
                        </td>
                        <td className="p-1" role="gridcell">
                          <input
                            aria-label={`Aufgabe für ${slot.time}`}
                            type="text"
                            value={slot.note}
                            onChange={e => updateSlot(i, e.target.value)}
                            className="w-full border px-2 py-1 rounded"
                            placeholder="Aufgabe oder Notiz"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Helfer verwalten</h3>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Name"
                  value={helperName}
                  onChange={e => setHelperName(e.target.value)}
                />
                <Button variant="outline" onClick={addHelper}>
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>
              {helpers.length > 0 && (
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {helpers.map(h => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-gray-600 mt-2">
                {helpers.length} Helfer eingetragen
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MovingDay
