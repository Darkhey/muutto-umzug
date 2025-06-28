import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Sparkles, Home, Users, Calendar, ArrowRight, Star } from 'lucide-react'

interface OnboardingSuccessProps {
  householdName: string
  moveDate: string
  onContinue: () => void
}

export const OnboardingSuccess = ({ householdName, moveDate, onContinue }: OnboardingSuccessProps) => {
  const [showContent, setShowContent] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      title: 'Haushalt erstellt',
      description: `"${householdName}" wurde erfolgreich angelegt`
    },
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: 'Checkliste generiert',
      description: 'Personalisierte Aufgaben für deinen Umzug erstellt'
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: 'Team bereit',
      description: 'Alle Mitglieder können jetzt mithelfen'
    }
  ]

  useEffect(() => {
    // Show content with delay for smooth animation
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Animate steps one by one
    if (showContent) {
      steps.forEach((_, index) => {
        setTimeout(() => setCurrentStep(index + 1), (index + 1) * 800)
      })
    }
  }, [showContent])

  const getDaysUntilMove = () => {
    const today = new Date()
    const move = new Date(moveDate)
    const diffTime = move.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysUntilMove = getDaysUntilMove()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className={`bg-white/90 backdrop-blur-sm shadow-2xl border-0 transition-all duration-1000 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          <CardContent className="p-12 text-center">
            {/* Success Animation */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-r from-green-500 to-blue-600 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-white animate-bounce" />
              </div>
            </div>

            {/* Main Success Message */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Herzlichen Glückwunsch! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Dein Umzug ist jetzt perfekt organisiert
              </p>
              <p className="text-lg text-gray-500">
                Noch <span className="font-bold text-blue-600">{daysUntilMove} Tage</span> bis zu deinem großen Tag
              </p>
            </div>

            {/* Animated Steps */}
            <div className="space-y-6 mb-10">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-700 ${
                    currentStep > index 
                      ? 'bg-gradient-to-r from-gray-50 to-blue-50 scale-100 opacity-100' 
                      : 'scale-95 opacity-50'
                  }`}
                >
                  <div className={`transition-all duration-500 ${
                    currentStep > index ? 'scale-100' : 'scale-75'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {currentStep > index && (
                    <CheckCircle className="h-6 w-6 text-green-500 ml-auto animate-bounce" />
                  )}
                </div>
              ))}
            </div>

            {/* What's Next */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-8">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center justify-center gap-2">
                <Star className="h-5 w-5" />
                Was dich jetzt erwartet:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-blue-800">Personalisierte Checkliste</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-blue-800">Automatische Erinnerungen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-blue-800">KI-Assistent verfügbar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-blue-800">Team-Kollaboration</span>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={onContinue}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Home className="mr-2 h-5 w-5" />
              Zum Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-sm text-gray-500 mt-6">
              Bereit für einen stressfreien Umzug? Lass uns loslegen! ✨
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}