import { create } from 'zustand'

const useCaseStore = create((set, get) => ({
  stage: 'IDLE',
  setStage: (stage) => set({ stage }),
  caseId: null,
  setCaseId: (caseId) => set({ caseId }),
  classifyResult: null,
  setClassifyResult: (classifyResult) => set({ classifyResult }),
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

  // ── RTI Department/jurisdiction resolution ──────────────────────────────
  departmentInfo: null,
  setDepartmentInfo: (departmentInfo) => set({ departmentInfo }),
  departmentConfirmed: false,
  setDepartmentConfirmed: (v) => set({ departmentConfirmed: v }),

  // ── RTI pipeline results ───────────────────────────────────────────────
  rtiPrediction: null,
  setRtiPrediction: (rtiPrediction) => set({ rtiPrediction }),
  rtiDraft: null,
  setRtiDraft: (rtiDraft) => set({ rtiDraft }),

  // ── Grievance result ───────────────────────────────────────────────────
  grievanceResult: null,
  setGrievanceResult: (grievanceResult) => set({ grievanceResult }),

  error: null,
  setError: (error) => set({ error }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      stage: 'IDLE',
      caseId: null,
      classifyResult: null,
      chatMessages: [],
      extractedFacts: {},
      formData: {},
      formSubmitted: false,
      departmentInfo: null,
      departmentConfirmed: false,
      rtiPrediction: null,
      rtiDraft: null,
      grievanceResult: null,
      error: null,
      isLoading: false,
    }),
}))

export default useCaseStore
