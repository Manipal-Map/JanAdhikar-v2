import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import useCaseStore from './store/caseStore'
import GatewayView     from './views/GatewayView'
import RTIView         from './views/RTIView'
import GrievanceView   from './views/GrievanceView'
import OutOfScopeView  from './views/OutOfScopeView'

// Stages → view mapping
const STAGE_VIEW = {
  IDLE:                'gateway',
  INITIALIZING:        'gateway',
  CLASSIFYING:         'gateway',
  RTI_GATHERING:       'rti',
  PREDICTING:          'rti',
  IMPROVING:           'rti',
  GRIEVANCE_GATHERING: 'grievance',
  GRIEVANCE_ANALYZING: 'grievance',
  COMPLETE:            'complete',    // determined by route below
  OUT_OF_SCOPE:        'out-of-scope',
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export default function App() {
  const { stage, classifyResult, reset } = useCaseStore()

  // Resolve which view to render
  let view = STAGE_VIEW[stage] || 'gateway'
  if (stage === 'COMPLETE') {
    view = classifyResult?.route === 'RTI' ? 'rti' : 'grievance'
  }

  return (
    <div className="relative">
      {/* Global restart button (visible outside gateway) */}
      {view !== 'gateway' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={reset}
          title="Start a new case"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-navy-700 hover:bg-navy-600 border border-white/10 text-slate-400 hover:text-white text-sm font-medium rounded-full shadow-2xl transition-all duration-200"
        >
          <RotateCcw size={14} />
          New Case
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {view === 'gateway'      && <GatewayView />}
          {view === 'rti'          && <RTIView />}
          {view === 'grievance'    && <GrievanceView />}
          {view === 'out-of-scope' && <OutOfScopeView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
