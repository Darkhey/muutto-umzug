import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers';
import { Home, Users, PawPrint, Baby, Car, Briefcase, HeartPulse, Languages } from 'lucide-react';
import { useState, useEffect } from 'react';

const HouseholdModulePage = () => {
  const { households, loading: householdsLoading, updateHousehold } = useHouseholds();
  const currentHousehold = households[0]; // Assuming the first household is the active one for now
  const { members, loading: membersLoading } = useHouseholdMembers(currentHousehold?.id);

  const [householdName, setHouseholdName] = useState('');
  const [householdSize, setHouseholdSize] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [hasPets, setHasPets] = useState(false);
  const [petsCount, setPetsCount] = useState<string>('');
  const [hasChildren, setHasChildren] = useState(false);
  const [childrenCount, setChildrenCount] = useState<string>('');
  const [hasVehicles, setHasVehicles] = useState(false);
  const [vehiclesCount, setVehiclesCount] = useState<string>('');
  const [isSelfEmployed, setIsSelfEmployed] = useState(false);
  const [needsCare, setNeedsCare] = useState(false);
  const [language, setLanguage] = useState('');
  const [allergies, setAllergies] = useState('');

  useEffect(() => {
    if (currentHousehold) {
      setHouseholdName(currentHousehold.name);
      setHouseholdSize(String(currentHousehold.household_size));
      setPropertyType(currentHousehold.property_type);
      setHasPets(currentHousehold.pets_count > 0);
      setPetsCount(String(currentHousehold.pets_count));
      setHasChildren(currentHousehold.children_count > 0);
      setChildrenCount(String(currentHousehold.children_count));
      setHasVehicles(currentHousehold.owns_car || false); // Assuming owns_car maps to hasVehicles
      setIsSelfEmployed(currentHousehold.is_self_employed || false);
      // Add other fields as they become available in ExtendedHousehold
    }
  }, [currentHousehold]);

  const handleSaveHousehold = async () => {
    if (!currentHousehold) return;
    await updateHousehold(currentHousehold.id, {
      name: householdName,
      household_size: parseInt(householdSize),
      property_type: propertyType as 'miete' | 'eigentum',
      pets_count: hasPets ? parseInt(petsCount) : 0,
      children_count: hasChildren ? parseInt(childrenCount) : 0,
      owns_car: hasVehicles,
      is_self_employed: isSelfEmployed,
      // Add other fields to update
    });
  };

  if (householdsLoading) {
    return <div className="text-center py-8">Lade Haushaltsdaten...</div>;
  }

  if (!currentHousehold) {
    return <div className="text-center py-8">Kein Haushalt gefunden. Bitte erstellen Sie zuerst einen Haushalt.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Haushaltsmodul: {currentHousehold.name}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" /> Allgemeine Konfigurationen</CardTitle>
          <CardDescription>Verwalte die grundlegenden Informationen deines Haushalts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="householdName">Haushaltsname</Label>
            <Input id="householdName" value={householdName} onChange={(e) => setHouseholdName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="householdSize">Haushaltsgröße</Label>
            <Input id="householdSize" type="number" value={householdSize} onChange={(e) => setHouseholdSize(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="propertyType">Wohnform</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Wähle eine Wohnform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="miete">Miete</SelectItem>
                <SelectItem value="eigentum">Eigentum</SelectItem>
                <SelectItem value="zwischenloesung">Zwischenlösung</SelectItem>
                <SelectItem value="mobil">Mobil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Haushaltsmitglieder</CardTitle>
          <CardDescription>Verwalte die Mitglieder deines Haushalts und ihre Rollen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {membersLoading ? (
            <p>Lade Mitglieder...</p>
          ) : members.length === 0 ? (
            <p>Keine Mitglieder gefunden.</p>
          ) : (
            <ul className="space-y-2">
              {members.map(member => (
                <li key={member.id} className="flex items-center justify-between border p-2 rounded-md">
                  <span>{member.name} ({member.email})</span>
                  <Badge variant="secondary">{member.role || 'Keine Rolle'}</Badge>
                </li>
              ))}
            </ul>
          )}
          <Button>Mitglied hinzufügen</Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Besondere Merkmale</CardTitle>
          <CardDescription>Gib zusätzliche Details an, die für deinen Umzug relevant sein könnten.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="hasPets" checked={hasPets} onCheckedChange={(checked: boolean) => setHasPets(checked)} />
            <Label htmlFor="hasPets" className="flex items-center gap-2"><PawPrint className="h-4 w-4" /> Haustiere</Label>
          </div>
          {hasPets && (
            <div>
              <Label htmlFor="petsCount">Anzahl Haustiere</Label>
              <Input id="petsCount" type="number" value={petsCount} onChange={(e) => setPetsCount(e.target.value)} />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="hasChildren" checked={hasChildren} onCheckedChange={(checked: boolean) => setHasChildren(checked)} />
            <Label htmlFor="hasChildren" className="flex items-center gap-2"><Baby className="h-4 w-4" /> Kinder</Label>
          </div>
          {hasChildren && (
            <div>
              <Label htmlFor="childrenCount">Anzahl Kinder</Label>
              <Input id="childrenCount" type="number" value={childrenCount} onChange={(e) => setChildrenCount(e.target.value)} />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="hasVehicles" checked={hasVehicles} onCheckedChange={(checked: boolean) => setHasVehicles(checked)} />
            <Label htmlFor="hasVehicles" className="flex items-center gap-2"><Car className="h-4 w-4" /> Fahrzeuge</Label>
          </div>
          {hasVehicles && (
            <div>
              <Label htmlFor="vehiclesCount">Anzahl Fahrzeuge</Label>
              <Input id="vehiclesCount" type="number" value={vehiclesCount} onChange={(e) => setVehiclesCount(e.target.value)} />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox id="isSelfEmployed" checked={isSelfEmployed} onCheckedChange={(checked: boolean) => setIsSelfEmployed(checked)} />
            <Label htmlFor="isSelfEmployed" className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Selbstständig</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="needsCare" checked={needsCare} onCheckedChange={(checked: boolean) => setNeedsCare(checked)} />
            <Label htmlFor="needsCare" className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Pflegebedürftige / Senioren im Haushalt</Label>
          </div>

          <div>
            <Label htmlFor="language">Spracheinstellungen</Label>
            <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="z.B. Deutsch, Englisch" />
          </div>

          <div>
            <Label htmlFor="allergies">Allergien oder barrierefreie Anforderungen</Label>
            <Input id="allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="z.B. Rollstuhlgerecht, keine Teppiche" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveHousehold}>Haushalt speichern</Button>
      </div>
    </div>
  );
};

export default HouseholdModulePage;
