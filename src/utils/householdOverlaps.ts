import { ExtendedHousehold } from '@/types/household'

export interface HouseholdOverlap {
  type: 'move_date_conflict' | 'address_overlap' | 'member_duplicate' | 'timeline_conflict' | 'resource_conflict'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedHouseholds: string[]
  suggestedAction?: string
  data?: any
}

export interface OverlapAnalysis {
  overlaps: HouseholdOverlap[]
  hasConflicts: boolean
  criticalIssues: number
  warnings: number
  recommendations: string[]
}

/**
 * Analysiert Überlappungen zwischen mehreren Haushalten
 */
export function analyzeHouseholdOverlaps(households: ExtendedHousehold[]): OverlapAnalysis {
  const overlaps: HouseholdOverlap[] = []
  const recommendations: string[] = []

  if (households.length < 2) {
    return {
      overlaps: [],
      hasConflicts: false,
      criticalIssues: 0,
      warnings: 0,
      recommendations: ['Keine Überlappungen bei einem einzelnen Haushalt']
    }
  }

  // 1. Umzugstermin-Konflikte analysieren
  const moveDateOverlaps = analyzeMoveDateOverlaps(households)
  overlaps.push(...moveDateOverlaps)

  // 2. Adress-Überlappungen prüfen
  const addressOverlaps = analyzeAddressOverlaps(households)
  overlaps.push(...addressOverlaps)

  // 3. Mitglieder-Duplikate finden
  const memberOverlaps = analyzeMemberOverlaps(households)
  overlaps.push(...memberOverlaps)

  // 4. Timeline-Konflikte identifizieren
  const timelineOverlaps = analyzeTimelineOverlaps(households)
  overlaps.push(...timelineOverlaps)

  // 5. Ressourcen-Konflikte prüfen
  const resourceOverlaps = analyzeResourceOverlaps(households)
  overlaps.push(...resourceOverlaps)

  // Empfehlungen generieren
  if (moveDateOverlaps.length > 0) {
    recommendations.push('Überprüfen Sie die Umzugstermine auf logische Abfolge')
  }
  if (addressOverlaps.length > 0) {
    recommendations.push('Stellen Sie sicher, dass Auszug vor Einzug stattfindet')
  }
  if (memberOverlaps.length > 0) {
    recommendations.push('Lösen Sie doppelte Mitglieder-Einträge auf')
  }

  const criticalIssues = overlaps.filter(o => o.severity === 'critical').length
  const warnings = overlaps.filter(o => o.severity === 'high' || o.severity === 'medium').length

  return {
    overlaps,
    hasConflicts: overlaps.length > 0,
    criticalIssues,
    warnings,
    recommendations
  }
}

/**
 * Analysiert Konflikte bei Umzugsterminen
 */
function analyzeMoveDateOverlaps(households: ExtendedHousehold[]): HouseholdOverlap[] {
  const overlaps: HouseholdOverlap[] = []
  
  // Sortiere Haushalte nach Umzugstermin
  const sortedHouseholds = [...households].sort((a, b) => 
    new Date(a.move_date).getTime() - new Date(b.move_date).getTime()
  )

  // Prüfe auf zu enge zeitliche Abfolge (weniger als 1 Tag zwischen Umzügen)
  for (let i = 0; i < sortedHouseholds.length - 1; i++) {
    const current = sortedHouseholds[i]
    const next = sortedHouseholds[i + 1]
    
    const currentDate = new Date(current.move_date)
    const nextDate = new Date(next.move_date)
    const daysDiff = Math.ceil((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff < 1) {
      overlaps.push({
        type: 'move_date_conflict',
        severity: 'critical',
        title: 'Umzüge am gleichen Tag',
        description: `${current.name} und ${next.name} sind für den gleichen Tag geplant`,
        affectedHouseholds: [current.id, next.id],
        suggestedAction: 'Verschieben Sie einen der Umzüge um mindestens einen Tag',
        data: { daysDiff, currentDate, nextDate }
      })
    } else if (daysDiff < 3) {
      overlaps.push({
        type: 'move_date_conflict',
        severity: 'high',
        title: 'Sehr enge Umzugstermine',
        description: `${current.name} und ${next.name} sind nur ${daysDiff} Tage auseinander`,
        affectedHouseholds: [current.id, next.id],
        suggestedAction: 'Erwägen Sie mehr Zeit zwischen den Umzügen',
        data: { daysDiff, currentDate, nextDate }
      })
    }
  }

  return overlaps
}

/**
 * Analysiert Adress-Überlappungen (Auszug vor Einzug)
 */
function analyzeAddressOverlaps(households: ExtendedHousehold[]): HouseholdOverlap[] {
  const overlaps: HouseholdOverlap[] = []
  
  for (let i = 0; i < households.length; i++) {
    for (let j = i + 1; j < households.length; j++) {
      const household1 = households[i]
      const household2 = households[j]
      
      // Prüfe ob neue Adresse von Haushalt 1 = alte Adresse von Haushalt 2
      if (household1.new_address && household2.old_address && 
          household1.new_address.toLowerCase().trim() === household2.old_address.toLowerCase().trim()) {
        
        const household1Date = new Date(household1.move_date)
        const household2Date = new Date(household2.move_date)
        
        if (household1Date > household2Date) {
          overlaps.push({
            type: 'address_overlap',
            severity: 'critical',
            title: 'Auszug vor Einzug',
            description: `${household1.name} zieht in die Wohnung ein, aus der ${household2.name} noch nicht ausgezogen ist`,
            affectedHouseholds: [household1.id, household2.id],
            suggestedAction: 'Verschieben Sie den Einzug von ' + household1.name + ' nach dem Auszug von ' + household2.name,
            data: { 
              household1Date, 
              household2Date, 
              address: household1.new_address 
            }
          })
        } else {
          overlaps.push({
            type: 'address_overlap',
            severity: 'medium',
            title: 'Adress-Überlappung erkannt',
            description: `${household1.name} und ${household2.name} teilen sich eine Adresse`,
            affectedHouseholds: [household1.id, household2.id],
            suggestedAction: 'Bestätigen Sie, dass dies korrekt ist',
            data: { 
              household1Date, 
              household2Date, 
              address: household1.new_address 
            }
          })
        }
      }
    }
  }

  return overlaps
}

/**
 * Analysiert doppelte Mitglieder zwischen Haushalten
 */
function analyzeMemberOverlaps(households: ExtendedHousehold[]): HouseholdOverlap[] {
  const overlaps: HouseholdOverlap[] = []
  const memberMap = new Map<string, { householdId: string, memberName: string }[]>()
  
  // Sammle alle Mitglieder
  households.forEach(household => {
    household.members?.forEach(member => {
      const email = member.email.toLowerCase()
      if (!memberMap.has(email)) {
        memberMap.set(email, [])
      }
      memberMap.get(email)!.push({
        householdId: household.id,
        memberName: member.name
      })
    })
  })

  // Finde Duplikate
  memberMap.forEach((entries, email) => {
    if (entries.length > 1) {
      const householdNames = entries.map(e => e.memberName).join(', ')
      overlaps.push({
        type: 'member_duplicate',
        severity: 'high',
        title: 'Doppelte Mitglieder gefunden',
        description: `${householdNames} ist in mehreren Haushalten registriert`,
        affectedHouseholds: entries.map(e => e.householdId),
        suggestedAction: 'Entscheiden Sie, in welchem Haushalt das Mitglied bleiben soll',
        data: { email, entries }
      })
    }
  })

  return overlaps
}

/**
 * Analysiert Timeline-Konflikte (Aufgaben, die sich überschneiden)
 */
function analyzeTimelineOverlaps(households: ExtendedHousehold[]): HouseholdOverlap[] {
  const overlaps: HouseholdOverlap[] = []
  
  // Hier könnte man die Tasks der Haushalte analysieren
  // Für jetzt erstellen wir eine grundlegende Analyse basierend auf Umzugsterminen
  
  const moveDates = households.map(h => ({
    id: h.id,
    name: h.name,
    date: new Date(h.move_date),
    householdSize: h.household_size
  }))

  // Prüfe auf zu viele Umzüge in kurzer Zeit
  const now = new Date()
  const upcomingMoves = moveDates.filter(m => m.date > now)
  
  if (upcomingMoves.length > 2) {
    const next30Days = upcomingMoves.filter(m => {
      const daysDiff = Math.ceil((m.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff <= 30
    })

    if (next30Days.length > 2) {
      overlaps.push({
        type: 'timeline_conflict',
        severity: 'medium',
        title: 'Viele Umzüge in kurzer Zeit',
        description: `${next30Days.length} Umzüge sind in den nächsten 30 Tagen geplant`,
        affectedHouseholds: next30Days.map(m => m.id),
        suggestedAction: 'Erwägen Sie, einige Umzüge zu verschieben',
        data: { upcomingMoves: next30Days.length, totalMoves: upcomingMoves.length }
      })
    }
  }

  return overlaps
}

/**
 * Analysiert Ressourcen-Konflikte (Umzugsunternehmen, etc.)
 */
function analyzeResourceOverlaps(households: ExtendedHousehold[]): HouseholdOverlap[] {
  const overlaps: HouseholdOverlap[] = []
  
  // Prüfe auf ähnliche Umzugstermine (gleiche Woche)
  const weeklyGroups = new Map<string, ExtendedHousehold[]>()
  
  households.forEach(household => {
    const date = new Date(household.move_date)
    const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`
    
    if (!weeklyGroups.has(weekKey)) {
      weeklyGroups.set(weekKey, [])
    }
    weeklyGroups.get(weekKey)!.push(household)
  })

  weeklyGroups.forEach((householdsInWeek, weekKey) => {
    if (householdsInWeek.length > 1) {
      const totalPeople = householdsInWeek.reduce((sum, h) => sum + h.household_size, 0)
      
      if (totalPeople > 10) {
        overlaps.push({
          type: 'resource_conflict',
          severity: 'medium',
          title: 'Hohe Umzugsbelastung',
          description: `${householdsInWeek.length} Haushalte mit ${totalPeople} Personen ziehen in der gleichen Woche um`,
          affectedHouseholds: householdsInWeek.map(h => h.id),
          suggestedAction: 'Erwägen Sie, Umzugsunternehmen frühzeitig zu buchen',
          data: { weekKey, householdCount: householdsInWeek.length, totalPeople }
        })
      }
    }
  })

  return overlaps
}

/**
 * Hilfsfunktion: Woche des Jahres berechnen
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Generiert eine Zusammenfassung der Überlappungsanalyse
 */
export function generateOverlapSummary(analysis: OverlapAnalysis): string {
  if (!analysis.hasConflicts) {
    return '✅ Keine Überlappungen oder Konflikte gefunden'
  }

  let summary = `⚠️ ${analysis.criticalIssues} kritische und ${analysis.warnings} Warnungen gefunden:\n\n`

  analysis.overlaps.forEach(overlap => {
    const severityIcon = overlap.severity === 'critical' ? '🚨' : 
                        overlap.severity === 'high' ? '⚠️' : 
                        overlap.severity === 'medium' ? '⚡' : 'ℹ️'
    
    summary += `${severityIcon} ${overlap.title}\n`
    summary += `   ${overlap.description}\n`
    if (overlap.suggestedAction) {
      summary += `   💡 ${overlap.suggestedAction}\n`
    }
    summary += '\n'
  })

  return summary
} 