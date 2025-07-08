import { Suspense, lazy } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthPage } from '@/components/auth/AuthPage'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import LoadingScreen from '@/components/LoadingScreen'
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
    return <LoadingScreen />;
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