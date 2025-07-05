import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { useDistanceCalculation } from '@/hooks/useDistanceCalculation';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Home, MapPin, Link, ArrowRight, ArrowLeft, CheckCircle, Star, Sparkles, Mail, User, Building, Ruler, DoorOpen, Package2, AlertTriangle, Save, Crown } from 'lucide-react';
import { PropertyType, HouseholdRole } from '@/types/database';
import { HOUSEHOLD_ROLES } from '@/config/roles';
import { PROPERTY_TYPES } from '@/config/app';
import { validateName, validateFutureDate, validatePostalCode } from '@/utils/validation';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { UpgradeCTA } from '@/components/premium/UpgradeCTA';
import { useMoves } from '@/hooks/useMoves';
import { useHouseholds } from '@/hooks/useHouseholds';

interface OnboardingData {
  householdName: string;
  moveDate: string;
  householdSize: number;
  childrenCount: number;
  petsCount: number;
  ownsCar: boolean;
  isSelfEmployed: boolean;
  propertyType: PropertyType | '';
  postalCode: string;
  oldAddress: string;
  newAddress: string;
  livingSpace: number;
  rooms: number;
  furnitureVolume: number;
  adUrl?: string | null;
  members: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

interface OnboardingFlowProps {
  initialData?: Partial<OnboardingData> | null;
  initialStep?: number;
  onComplete: (data: OnboardingData) => Promise<void>;
  onSkip: () => void;
  onSaveDraft?: (data: Partial<OnboardingData>, step: number) => Promise<boolean>;
  onBackToDrafts?: () => void;
}

export const OnboardingFlow = (props: OnboardingFlowProps) => {
  return (
    <div>OnboardingFlow-Komponente (Platzhalter)</div>
  );
};