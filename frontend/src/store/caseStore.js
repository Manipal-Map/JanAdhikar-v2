import { create } from 'zustand'

const useCaseStore = create((set, get) => ({
  stage: 'IDLE',
  setStage: (stage) => set({ stage }),

  caseId: null,
  setCaseId: (caseId) => set({ caseId }),

  userProblem: '',
  setUserProblem: (userProblem) => set({ userProblem }),

  // ── Classification & Triage Confirmation ──
  classifyResult: null,
  setClassifyResult: (classifyResult) => set({ classifyResult }),
  triageConfirmed: false,
  setTriageConfirmed: (triageConfirmed) => set({ triageConfirmed }),

  // ── Chat / Info Gathering ──
  chatMessages: [],
  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setChatMessages: (chatMessages) => set({ chatMessages }),

  extractedFacts: {},
  setExtractedFacts: (extractedFacts) => set({ extractedFacts }),

  formData: {},
  setFormData: (formData) => set({ formData }),

  // ── RTI Department/Jurisdiction Resolution ──
  departmentInfo: null,
  setDepartmentInfo: (departmentInfo) => set({ departmentInfo }),
  departmentConfirmed: false,
  setDepartmentConfirmed: (v) => set({ departmentConfirmed: v }),

  // ── RTI Pipeline Results ──
  rtiPrediction: null,
  setRtiPrediction: (rtiPrediction) => set({ rtiPrediction }),
  rtiDraft: null,
  setRtiDraft: (rtiDraft) => set({ rtiDraft }),

  // ── Grievance Pipeline Results ──
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
      userProblem: '',
      classifyResult: null,
      triageConfirmed: false,
      chatMessages: [],
      extractedFacts: {},
      formData: {},
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
