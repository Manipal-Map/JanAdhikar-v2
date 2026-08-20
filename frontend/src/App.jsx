import useCaseStore from './store/caseStore'
import GatewayView from './views/GatewayView'
import RTIView from './views/RTIView'
import GrievanceView from './views/GrievanceView'
import RTIResultView from './views/RTIResultView'
import GrievanceResultView from './views/GrievanceResultView'

export default function App() {
  const { stage } = useCaseStore()

  if (stage === 'IDLE' || stage === 'INITIALIZING' || stage === 'CLASSIFYING' || stage === 'CLASSIFIED_CONFIRM') {
    return <GatewayView />
  }

  if (stage === 'RTI_GATHERING') {
    return <RTIView />
  }

  if (stage === 'GRIEVANCE_GATHERING') {
    return <GrievanceView />
  }

  if (stage === 'PREDICTING' || stage === 'IMPROVING' || stage === 'RTI_PREDICTED' || stage === 'RTI_COMPLETED') {
    return <RTIResultView />
  }

  if (stage === 'COMPLETE' || stage === 'GRIEVANCE_COMPLETED') {
    return <GrievanceResultView />
  }

  return <GatewayView />
}
