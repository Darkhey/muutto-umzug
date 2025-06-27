
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Calendar, Plus, Home, User } from 'lucide-react';
import { HouseholdCreation } from './HouseholdCreation';
import { TaskList } from './TaskList';

interface Household {
  id: string;
  name: string;
  members: string[];
  progress: number;
  nextDeadline: string;
}

export const Dashboard = () => {
  const [activeHousehold, setActiveHousehold] = useState<Household | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([
    {
      id: '1',
      name: 'Familie Müller Umzug',
      members: ['Max', 'Anna', 'Tom'],
      progress: 35,
      nextDeadline: '2025-01-15'
    }
  ]);

  const handleCreateHousehold = (household: Omit<Household, 'id' | 'progress'>) => {
    const newHousehold = {
      ...household,
      id: Date.now().toString(),
      progress: 0
    };
    setHouseholds([...households, newHousehold]);
    setActiveHousehold(newHousehold);
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return <HouseholdCreation onSubmit={handleCreateHousehold} onCancel={() => setShowCreateForm(false)} />;
  }

  if (activeHousehold) {
    return <TaskList household={activeHousehold} onBack={() => setActiveHousehold(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Umzugs<span className="text-blue-600">Begleiter</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Dein persönlicher KI-Assistent für einen stressfreien Umzug
          </p>
        </div>

        {/* Stats Cards */}
        {households.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Umzüge</CardTitle>
                <Home className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{households.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Erledigte Aufgaben</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">47</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nächste Frist</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-orange-600">in 12 Tagen</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Households Grid */}
        {households.length === 0 ? (
          <Card className="bg-white shadow-lg text-center py-12">
            <CardContent>
              <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Willkommen bei deinem Umzugs-Begleiter!
              </h3>
              <p className="text-gray-600 mb-6">
                Erstelle deinen ersten Haushalt und lass uns gemeinsam deinen Umzug planen.
              </p>
              <Button onClick={() => setShowCreateForm(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Ersten Haushalt erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Deine Haushalte</h2>
              <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Neuer Haushalt
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {households.map((household) => (
                <Card key={household.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{household.name}</span>
                      <Badge variant="secondary">{household.progress}%</Badge>
                    </CardTitle>
                    <CardDescription>
                      Nächste Frist: {new Date(household.nextDeadline).toLocaleDateString('de-DE')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Fortschritt</span>
                          <span>{household.progress}%</span>
                        </div>
                        <Progress value={household.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {household.members.length} Mitglieder
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => setActiveHousehold(household)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Öffnen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white mt-8">
          <CardHeader>
            <CardTitle className="text-white">💡 Tipp des Tages</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Beginne mit der Kündigung deines alten Mietvertrags mindestens 3 Monate vor dem geplanten Auszug. 
              So vermeidest du unnötige Kosten und Stress!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
