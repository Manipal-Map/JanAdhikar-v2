import { create } from 'zustand'

/**
 * Global case state machine
 *
 * Stages:
 *  IDLE → INITIALIZING → CLASSIFYING → [RTI_GATHERING | GRIEVANCE_GATHERING | OUT_OF_SCOPE]
 *       → PREDICTING → IMPROVING → GRIEVANCE_ANALYZING → COMPLETE
 */
const useCaseStore = create((set, get) => ({
  // ── Stage ──────────────────────────────────────────────────────────────
  stage: 'IDLE',
  setStage: (stage) => set({ stage }),

  // ── Case metadata ──────────────────────────────────────────────────────
  caseId: null,
  setCaseId: (caseId) => set({ caseId }),

  // ── Classification result ──────────────────────────────────────────────
  classifyResult: null,
  setClassifyResult: (classifyResult) => set({ classifyResult }),

  // ── Chat / info gathering ──────────────────────────────────────────────
  chatMessages: [],
  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setChatMessages: (chatMessages) => set({ chatMessages }),

  extractedFacts: {},
  setExtractedFacts: (extractedFacts) => set({ extractedFacts }),

  formData: {},
  setFormData: (formData) => set({ formData }),

  formSubmitted: false,
  setFormSubmitted: (v) => set({ formSubmitted: v }),

  // ── RTI pipeline results ───────────────────────────────────────────────
  rtiPrediction: null,
  setRtiPrediction: (rtiPrediction) => set({ rtiPrediction }),

  rtiDraft: null,
  setRtiDraft: (rtiDraft) => set({ rtiDraft }),

  // ── Grievance result ───────────────────────────────────────────────────
  grievanceResult: null,
  setGrievanceResult: (grievanceResult) => set({ grievanceResult }),

  // ── Error state ────────────────────────────────────────────────────────
  error: null,
  setError: (error) => set({ error }),

  // ── Loading flags ──────────────────────────────────────────────────────
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  // ── Full reset ─────────────────────────────────────────────────────────
  reset: () =>
    set({
      stage: 'IDLE',
      caseId: null,
      classifyResult: null,
      chatMessages: [],
      extractedFacts: {},
      formData: {},
      formSubmitted: false,
      rtiPrediction: null,
      rtiDraft: null,
      grievanceResult: null,
      error: null,
      isLoading: false,
    }),
}))

export default useCaseStore
