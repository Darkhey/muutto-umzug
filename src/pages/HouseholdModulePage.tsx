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
import { Home, Users, PawPrint, Baby, Car, Briefcase, HeartPulse, Languages, Edit, Save, X, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const HouseholdModulePage = () => {
  const { households, loading: householdsLoading, updateHousehold } = useHouseholds();
  const currentHousehold = households[0];
  const { members, loading: membersLoading } = useHouseholdMembers(currentHousehold?.id || '');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (currentHousehold) {
      setFormData({
        name: currentHousehold.name || '',
        household_size: currentHousehold.household_size || 1,
        property_type: currentHousehold.property_type || '',
        pets_count: currentHousehold.pets_count || 0,
        children_count: currentHousehold.children_count || 0,
        owns_car: currentHousehold.owns_car || false,
        is_self_employed: currentHousehold.is_self_employed || false,
        // QoL fields - assuming they exist in your DB, add them to household type
        needs_care: currentHousehold.needs_care || false,
        main_language: currentHousehold.main_language || '',
        special_needs: currentHousehold.special_needs || '',
      });
    }
  }, [currentHousehold]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!currentHousehold) return;

    const promise = updateHousehold(currentHousehold.id, {
        ...formData,
        household_size: Number(formData.household_size),
        pets_count: Number(formData.pets_count),
        children_count: Number(formData.children_count),
    });

    toast.promise(promise, {
      loading: 'Änderungen werden gespeichert...',
      success: 'Haushalt erfolgreich aktualisiert!',
      error: 'Fehler beim Speichern des Haushalts.',
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentHousehold) {
        // Reset form data to original state
        setFormData({
            name: currentHousehold.name || '',
            household_size: currentHousehold.household_size || 1,
            property_type: currentHousehold.property_type || '',
            pets_count: currentHousehold.pets_count || 0,
            children_count: currentHousehold.children_count || 0,
            owns_car: currentHousehold.owns_car || false,
            is_self_employed: currentHousehold.is_self_employed || false,
            needs_care: currentHousehold.needs_care || false,
            main_language: currentHousehold.main_language || '',
            special_needs: currentHousehold.special_needs || '',
        });
    }
    setIsEditing(false);
  };

  if (householdsLoading) {
    return <div className="text-center py-8">Lade Haushaltsdaten...</div>;
  }

  if (!currentHousehold) {
    return <div className="text-center py-8">Kein Haushalt gefunden. Bitte erstellen Sie zuerst einen Haushalt.</div>;
  }

  const renderDetail = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-4 items-center">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="col-span-2 text-sm">{value}</dd>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Haushalts-Übersicht</h1>
            <div>
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                        <Button variant="outline" onClick={handleCancel}><X className="mr-2 h-4 w-4"/> Abbrechen</Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/> Bearbeiten</Button>
                )}
            </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" /> Allgemeine Infos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
                <>
                    <div>
                        <Label htmlFor="householdName">Haushaltsname</Label>
                        <Input id="householdName" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="householdSize">Haushaltsgröße</Label>
                        <Input id="householdSize" type="number" value={formData.household_size} onChange={(e) => handleInputChange('household_size', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="propertyType">Wohnform</Label>
                        <Select value={formData.property_type} onValueChange={(v) => handleInputChange('property_type', v)}>
                            <SelectTrigger><SelectValue placeholder="Wähle..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="miete">Miete</SelectItem>
                                <SelectItem value="eigentum">Eigentum</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
            ) : (
                <dl className="space-y-2">
                    {renderDetail("Haushaltsname", formData.name)}
                    {renderDetail("Haushaltsgröße", `${formData.household_size} Person(en)`)}
                    {renderDetail("Wohnform", formData.property_type)}
                </dl>
            )}
          </CardContent>
        </Card>

        {/* Members Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Mitglieder</CardTitle>
          </CardHeader>
          <CardContent>
            {membersLoading ? <p>Lade Mitglieder...</p> : (
                <ul className="space-y-2">
                    {members.map(member => (
                        <li key={member.id} className="flex items-center justify-between border p-2 rounded-md">
                        <span>{member.name} ({member.email})</span>
                        <Badge variant="secondary">{member.role || 'Keine Rolle'}</Badge>
                        </li>
                    ))}
                </ul>
            )}
            <Button variant="outline" className="mt-4 w-full"><PlusCircle className="mr-2 h-4 w-4"/> Mitglied einladen</Button>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Besondere Merkmale</CardTitle>
            <CardDescription>Diese Details helfen uns, deinen Umzug besser zu planen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Familie & Haustiere</Label>
                        <div className="flex items-center gap-2">
                            <Baby className="h-4 w-4 text-muted-foreground"/>
                            <Label htmlFor="childrenCount" className="flex-1">Anzahl Kinder</Label>
                            <Input id="childrenCount" type="number" value={formData.children_count} onChange={(e) => handleInputChange('children_count', e.target.value)} className="w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                            <PawPrint className="h-4 w-4 text-muted-foreground"/>
                            <Label htmlFor="petsCount" className="flex-1">Anzahl Haustiere</Label>
                            <Input id="petsCount" type="number" value={formData.pets_count} onChange={(e) => handleInputChange('pets_count', e.target.value)} className="w-20" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Beruf & Mobilität</Label>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="isSelfEmployed" className="flex items-center gap-2"><Briefcase className="h-4 w-4"/> Selbstständig</Label>
                            <Checkbox id="isSelfEmployed" checked={formData.is_self_employed} onCheckedChange={(c) => handleInputChange('is_self_employed', c)} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="ownsCar" className="flex items-center gap-2"><Car className="h-4 w-4"/> Auto vorhanden</Label>
                            <Checkbox id="ownsCar" checked={formData.owns_car} onCheckedChange={(c) => handleInputChange('owns_car', c)} />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Zusätzliche Bedürfnisse</Label>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="needsCare" className="flex items-center gap-2"><HeartPulse className="h-4 w-4"/> Pflegebedürftige Personen</Label>
                            <Checkbox id="needsCare" checked={formData.needs_care} onCheckedChange={(c) => handleInputChange('needs_care', c)} />
                        </div>
                        <div>
                            <Label htmlFor="main_language">Hauptsprache im Haushalt</Label>
                            <Input id="main_language" value={formData.main_language} onChange={(e) => handleInputChange('main_language', e.target.value)} placeholder="z.B. Deutsch, Englisch"/>
                        </div>
                        <div>
                            <Label htmlFor="special_needs">Besondere Anforderungen (Allergien, Barrierefreiheit)</Label>
                            <Input id="special_needs" value={formData.special_needs} onChange={(e) => handleInputChange('special_needs', e.target.value)} placeholder="z.B. Katzenallergie, rollstuhlgerecht"/>
                        </div>
                    </div>
                </div>
            ) : (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {renderDetail("Kinder", `${formData.children_count}`)}
                    {renderDetail("Haustiere", `${formData.pets_count}`)}
                    {renderDetail("Selbstständig", formData.is_self_employed ? 'Ja' : 'Nein')}
                    {renderDetail("Auto vorhanden", formData.owns_car ? 'Ja' : 'Nein')}
                    {renderDetail("Pflegebedarf", formData.needs_care ? 'Ja' : 'Nein')}
                    {renderDetail("Hauptsprache", formData.main_language || '-')}
                    {renderDetail("Besonderheiten", formData.special_needs || '-')}
                </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HouseholdModulePage;