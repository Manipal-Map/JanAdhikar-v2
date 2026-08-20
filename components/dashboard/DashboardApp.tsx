'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useCaseStore from '@/store/caseStore';
import GatewayView from '@/views/GatewayView';
import RTIView from '@/views/RTIView';
import GrievanceView from '@/views/GrievanceView';
import RTIResultView from '@/views/RTIResultView';
import GrievanceResultView from '@/views/GrievanceResultView';
import OutOfScopeView from '@/views/OutOfScopeView';

export default function DashboardApp() {
  // Fix: Cast the store to 'any' to bypass strict TS inference errors
  const { stage, userProblem, setUserProblem } = useCaseStore() as any;
  const router = useRouter();

  // On mount: if landing page saved a problem text via sessionStorage, pre-populate it
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedProblem = sessionStorage.getItem('janadhikar_problem');
    if (savedProblem && !userProblem) {
      setUserProblem(savedProblem);
      sessionStorage.removeItem('janadhikar_problem');
    }
  }, [userProblem, setUserProblem]);

  if (stage === 'IDLE' || stage === 'INITIALIZING' || stage === 'CLASSIFYING' || stage === 'CLASSIFIED_CONFIRM') {
    return <GatewayView />;
  }
  if (stage === 'RTI_GATHERING') return <RTIView />;
  if (stage === 'GRIEVANCE_GATHERING') return <GrievanceView />;
  if (stage === 'PREDICTING' || stage === 'IMPROVING' || stage === 'RTI_PREDICTED' || stage === 'RTI_COMPLETED') {
    return <RTIResultView />;
  }
  if (stage === 'COMPLETE' || stage === 'GRIEVANCE_COMPLETED' || stage === 'GRIEVANCE_ANALYZING') {
    return <GrievanceResultView />;
  }
  if (stage === 'OUT_OF_SCOPE') return <OutOfScopeView />;

  return <GatewayView />;
}
