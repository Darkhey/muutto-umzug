
interface TimelineLegendProps {
  colors: Record<string, string>
}

export const TimelineLegend = ({ colors }: TimelineLegendProps) => {
  const legendItems = [
    { key: 'kritisch', label: 'Kritisch' },
    { key: 'hoch', label: 'Hoch' },
    { key: 'mittel', label: 'Mittel' },
    { key: 'niedrig', label: 'Niedrig' },
    { key: 'completed', label: 'Erledigt' }
  ]

  return (
    <div className="mt-4 flex flex-wrap gap-4 text-xs">
      {legendItems.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[key] }}></div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
