import React from 'react';
import { BoxManagementModule } from '@/components/boxes/BoxManagementModule';
import { useAuth } from '@/contexts/AuthContext';
import { useHouseholds } from '@/hooks/useHouseholds';
import LoadingScreen from '@/components/LoadingScreen';

export function BoxManagement() {
  const { user } = useAuth();
  const { households, loading: householdsLoading } = useHouseholds();

  // Use the first household as the active one, similar to other modules
  const activeHousehold = households && households.length > 0 ? households[0] : null;

  if (householdsLoading || !user) {
    return <LoadingScreen />;
  }

  if (!activeHousehold) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Kein aktiver Haushalt gefunden
          </h1>
          <p className="text-gray-600">
            Bitte erstellen Sie zuerst einen Haushalt oder wählen Sie einen aus, um die Kartonverwaltung zu nutzen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kartonverwaltung
        </h1>
        <p className="text-gray-600">
          Verwalte deine Umzugskartons mit KI-gestützter Bilderkennung und intelligenter Suche.
        </p>
      </div>

      <BoxManagementModule householdId={activeHousehold.id} />
    </div>
  );
}