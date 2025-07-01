import { Suspense, lazy } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthPage } from '@/components/auth/AuthPage'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { useLocation } from 'react-router-dom'
import JoinHousehold from './JoinHousehold'

const ModularDashboard = lazy(() =>
  import('@/components/dashboard/ModularDashboard')
);

const Index = () => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const inviteCode = searchParams.get('invite')

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

  if (inviteCode) {
    return <JoinHousehold code={inviteCode} />
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div>
      <Suspense fallback={<DashboardSkeleton />}>
        <ModularDashboard />
      </Suspense>
    </div>
  );
};

export default Index;