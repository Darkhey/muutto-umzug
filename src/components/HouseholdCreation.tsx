import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface HouseholdCreationProps {
  onSubmit: (household: { name: string; members: string[]; nextDeadline: string }) => void;
  onCancel: () => void;
}

export const HouseholdCreation = ({ onSubmit, onCancel }: HouseholdCreationProps) => {
  const [householdName, setHouseholdName] = useState('');
  const [newMember, setNewMember] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [moveDate, setMoveDate] = useState('');

  const addMember = () => {
    if (newMember.trim()) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (householdName.trim() && moveDate) {
      onSubmit({
        name: householdName.trim(),
        members: members.filter(member => member.trim()),
        nextDeadline: moveDate
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">Neuen Haushalt erstellen</CardTitle>
            <CardDescription>
              Richte deinen Umzugs-Haushalt ein und lade deine Familie oder Mitbewohner ein.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Household Name */}
              <div className="space-y-2">
                <Label htmlFor="householdName">Name des Haushalts</Label>
                <Input
                  id="householdName"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="z.B. Familie Müller Umzug"
                  required
                />
              </div>

              {/* Move Date */}
              <div className="space-y-2">
                <Label htmlFor="moveDate">Geplantes Umzugsdatum</Label>
                <Input
                  id="moveDate"
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  required
                />
              </div>

              {/* Members */}
              <div className="space-y-4">
                <Label>Haushaltsmitglieder</Label>
                
                {/* Existing Members */}
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {members.map((member, index) => (
                      member.trim() && (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {member}
                          <button
                            type="button"
                            onClick={() => removeMember(index)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    ))}
                  </div>
                )}

                {/* Add Member */}
                <div className="flex gap-2">
                  <Input
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    placeholder="Name des Mitglieds"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                  />
                  <Button type="button" onClick={addMember} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Füge alle Personen hinzu, die beim Umzug helfen werden.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!householdName.trim() || !moveDate}
                >
                  Haushalt erstellen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200 mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Was passiert als nächstes?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Du erhältst eine personalisierte Umzugs-Checkliste</li>
              <li>• Alle Mitglieder können Aufgaben übernehmen und verfolgen</li>
              <li>• Wichtige Fristen werden automatisch berechnet</li>
              <li>• Du bekommst rechtliche Hinweise für deinen Umzug</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
