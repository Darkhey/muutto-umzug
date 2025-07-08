
import { ExtendedHousehold } from '@/types/household'

export const generatePersonalizedWelcomeMessage = (household: ExtendedHousehold): string => {
  const moveDate = new Date(household.move_date)
  const today = new Date()
  const daysUntilMove = Math.ceil((moveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  let message = `Hallo! 👋 Willkommen zurück bei muutto!\n\n`
  
  // Household context
  message += `Ich sehe, dass dein Umzug "${household.name}" `
  
  if (daysUntilMove > 0) {
    message += `in ${daysUntilMove} Tagen (${moveDate.toLocaleDateString('de-DE')}) ansteht. `
  } else if (daysUntilMove === 0) {
    message += `heute stattfindet! 🚚 `
  } else {
    message += `vor ${Math.abs(daysUntilMove)} Tagen stattgefunden hat. `
  }

  // Household composition
  const householdDetails = []
  if (household.household_size > 1) {
    householdDetails.push(`${household.household_size} Personen`)
  }
  if (household.children_count > 0) {
    householdDetails.push(`${household.children_count} ${household.children_count === 1 ? 'Kind' : 'Kinder'}`)
  }
  if (household.pets_count > 0) {
    householdDetails.push(`${household.pets_count} ${household.pets_count === 1 ? 'Haustier' : 'Haustiere'}`)
  }

  if (householdDetails.length > 0) {
    message += `Für euren Haushalt mit ${householdDetails.join(', ')} `
  }

  // Property type context
  if (household.property_type === 'miete') {
    message += `ziehe ich alle wichtigen Mieterthemen in meine Empfehlungen ein. `
  } else {
    message += `berücksichtige ich alle Aspekte des Eigentumswechsels. `
  }

  message += `\n\n**Basierend auf deiner Situation kann ich dir heute helfen bei:**\n`

  // Personalized suggestions based on days until move
  if (daysUntilMove > 60) {
    message += `• **Frühe Planung**: Ummeldungen und Kündigungsfristen\n`
    message += `• **Kostenplanung**: Budgetschätzung für deinen Umzug\n`
  } else if (daysUntilMove > 14) {
    message += `• **Konkrete Vorbereitung**: Umzugsunternehmen und Helfer organisieren\n`
    message += `• **Behördengänge**: Checkliste für alle Ummeldungen\n`
  } else if (daysUntilMove > 0) {
    message += `• **Last-Minute-Tipps**: Was jetzt noch wichtig ist\n`
    message += `• **Umzugstag-Planung**: Ablaufplan und Notfall-Tipps\n`
  } else {
    message += `• **Nach dem Umzug**: Wichtige Schritte in der neuen Wohnung\n`
    message += `• **Nachbereitung**: Kautionsrückgabe und Dokumentation\n`
  }

  // Special considerations
  if (household.children_count > 0) {
    message += `• **Umzug mit Kindern**: Spezielle Tipps und Behördengänge\n`
  }
  if (household.pets_count > 0) {
    message += `• **Tierhaltung**: Ummeldung und Eingewöhnung der Haustiere\n`
  }

  message += `\n💡 **Stelle mir gerne deine erste Frage!** Ich kenne alle Details zu deinem Umzug und kann dir passende, praktische Tipps geben.`

  return message
}

export const buildHouseholdContext = (household: ExtendedHousehold) => {
  const moveDate = new Date(household.move_date)
  const today = new Date()
  const daysUntilMove = Math.ceil((moveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return {
    name: household.name,
    moveDate: household.move_date,
    daysUntilMove,
    householdSize: household.household_size,
    childrenCount: household.children_count,
    petsCount: household.pets_count,
    propertyType: household.property_type,
    postalCode: household.postal_code,
    oldAddress: household.old_address,
    newAddress: household.new_address,
    livingSpace: household.living_space,
    rooms: household.rooms,
    furnitureVolume: household.furniture_volume,
    progress: household.progress,
    nextDeadline: household.nextDeadline,
    memberCount: household.members?.length || 0,
    hasChildren: household.created_by_user_profile?.has_children,
    hasPets: household.created_by_user_profile?.has_pets,
    ownsCar: household.created_by_user_profile?.owns_car,
    isSelfEmployed: household.created_by_user_profile?.is_self_employed,
    // wantsNotifications: household.created_by_user_profile?.wants_notifications,
  }
}
