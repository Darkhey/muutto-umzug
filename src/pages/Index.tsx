import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/Dashboard';
import { ModularDashboard } from '@/components/dashboard/ModularDashboard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AuthPage } from '@/components/auth/AuthPage';

const Index = () => {
  const { user, loading } = useAuth();
  const [useModularDashboard, setUseModularDashboard] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div>
      {/* Dashboard Toggle */}
      <div className="fixed top-4 right-4 z-50 bg-white p-2 rounded-lg shadow-lg flex items-center gap-2">
        <Label htmlFor="dashboard-toggle" className="text-xs">
          Modulares Dashboard
        </Label>
        <Switch
          id="dashboard-toggle"
          checked={useModularDashboard}
          onCheckedChange={setUseModularDashboard}
        />
      </div>

      {useModularDashboard ? <ModularDashboard /> : <Dashboard />}
    </div>
  );
};

export default Index;