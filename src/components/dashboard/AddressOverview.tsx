import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, Edit, ExternalLink } from 'lucide-react'
import { ExtendedHousehold } from '@/types/household'

interface AddressOverviewProps {
  household?: ExtendedHousehold
  onEditAddresses?: () => void
}

export const AddressOverview = ({ household, onEditAddresses }: AddressOverviewProps) => {
  if (!household) return null

  const { old_address, new_address, postal_code } = household

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank')
  }

  const calculateRoute = () => {
    if (old_address && new_address) {
      const origin = encodeURIComponent(old_address)
      const destination = encodeURIComponent(new_address)
      window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Adressen
          </CardTitle>
          {onEditAddresses && (
            <Button variant="ghost" size="sm" onClick={onEditAddresses}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-muted-foreground">Aktuelle Adresse</span>
          </div>
          <div className="pl-5">
            {old_address ? (
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-relaxed">{old_address}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={() => openInMaps(old_address)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nicht angegeben</p>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-2">
          <Navigation className="h-5 w-5 text-muted-foreground rotate-90" />
        </div>

        {/* New Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-muted-foreground">Neue Adresse</span>
          </div>
          <div className="pl-5">
            {new_address ? (
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-relaxed">{new_address}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={() => openInMaps(new_address)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nicht angegeben</p>
            )}
          </div>
        </div>

        {/* Postal Code */}
        {postal_code && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Postleitzahl</span>
              <span className="text-sm font-medium">{postal_code}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          {old_address && new_address && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={calculateRoute}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Route berechnen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}