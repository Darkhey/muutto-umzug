import { useEffect, useState } from "react"
import { getTimeOfDay, loadingMessages } from "@/modules/LoadingMessages"

export const useLoadingMessage = (interval = 4000) => {
  const [message, setMessage] = useState<string>("Starte Umzug…")

  useEffect(() => {
    const group = getTimeOfDay()
    const tick = () => {
      const messages = loadingMessages[group]
      const random = messages[Math.floor(Math.random() * messages.length)]
      setMessage(random)
    }
    tick() // direkt initial setzen
    const id = setInterval(tick, interval)
    return () => clearInterval(id)
  }, [interval])

  return message
}