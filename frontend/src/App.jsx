import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import useCaseStore from './store/caseStore'
import GatewayView from './views/GatewayView'
import RTIView from './views/RTIView'
import GrievanceView from './views/GrievanceView'
import OutOfScopeView from './views/OutOfScopeView'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export default function App() {
  const { stage, classifyResult, reset } = useCaseStore()

  // Determine which view to show
  let currentView = 'gateway'
  if (stage === 'RTI_GATHERING' || stage === 'PREDICTING' || stage === 'IMPROVING' || (stage === 'COMPLETE' && classifyResult?.route === 'RTI')) {
    currentView = 'rti'
  } else if (stage === 'GRIEVANCE_GATHERING' || stage === 'GRIEVANCE_ANALYZING' || (stage === 'COMPLETE' && classifyResult?.route === 'Rights/Grievance')) {
    currentView = 'grievance'
  } else if (stage === 'OUT_OF_SCOPE') {
    currentView = 'out-of-scope'
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      {/* Global Restart Button */}
      {currentView !== 'gateway' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={reset}
          title="Start a new case"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-sm font-semibold rounded-full shadow-lg transition-all duration-200"
        >
          <RotateCcw size={14} />
          New Case
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {currentView === 'gateway' && <GatewayView />}
          {currentView === 'rti' && <RTIView />}
          {currentView === 'grievance' && <GrievanceView />}
          {currentView === 'out-of-scope' && <OutOfScopeView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
