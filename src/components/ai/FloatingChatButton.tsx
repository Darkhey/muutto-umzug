import { useState } from 'react'
import { Bot, MessageCircle, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AIAssistant } from './AIAssistant'
import { ExtendedHousehold } from '@/types/household'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/hooks/use-mobile'

interface FloatingChatButtonProps {
  household?: ExtendedHousehold
}

export const FloatingChatButton = ({ household }: FloatingChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const isMobile = useIsMobile()

  if (!user || !household) {
    return null
  }

  const ChatContent = () => (
    <AIAssistant household={household} className="border-0 shadow-none h-[500px] md:h-[600px]" />
  )

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border-0 group"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
            <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            muutto KI-Assistent
            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Mobile Sheet */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[90vh] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="h-5 w-5 text-indigo-600" />
                  <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
                </div>
                muutto KI-Assistent
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-xs">
                  GPT-4
                </Badge>
              </SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100%-80px)]">
              <ChatContent />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Dialog */}
      {!isMobile && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl h-[700px] p-0 gap-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="h-5 w-5 text-indigo-600" />
                  <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
                </div>
                muutto KI-Assistent
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-xs">
                  Powered by GPT-4
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="h-[calc(100%-80px)]">
              <ChatContent />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}