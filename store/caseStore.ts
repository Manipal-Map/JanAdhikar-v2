import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useCaseStore = create(
  persist(
    (set, get) => ({
      stage: 'IDLE',
      setStage: (stage) => set({ stage }),
      language: 'English',
      setLanguage: (language) => set({ language }),
      caseId: null,
      setCaseId: (caseId) => set({ caseId }),
      userProblem: '',
      setUserProblem: (userProblem) => set({ userProblem }),
      classifyResult: null,
      setClassifyResult: (classifyResult) => set({ classifyResult }),
      triageConfirmed: false,
      setTriageConfirmed: (triageConfirmed) => set({ triageConfirmed }),
      formData: {},
      setFormData: (formData) => set({ formData }),
      departmentInfo: null,
      setDepartmentInfo: (departmentInfo) => set({ departmentInfo }),
      departmentConfirmed: false,
      setDepartmentConfirmed: (v) => set({ departmentConfirmed: v }),
      rtiPrediction: null,
      setRtiPrediction: (rtiPrediction) => set({ rtiPrediction }),
      rtiDraft: null,
      setRtiDraft: (rtiDraft) => set({ rtiDraft }),
      grievanceResult: null,
      setGrievanceResult: (grievanceResult) => set({ grievanceResult }),
      error: null,
      setError: (error) => set({ error }),
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),

      hydrateState: (caseId, backendData) => {
        const route = backendData.route;
        let newStage = 'IDLE';

        if (backendData.status === 'classified') {
          newStage = route === 'RTI' ? 'RTI_GATHERING' : 'GRIEVANCE_GATHERING';
        } else if (backendData.status === 'rti_drafted') {
          newStage = 'PREDICTING';
        } else if (backendData.status === 'rti_predicted') {
          newStage = 'IMPROVING';
        } else if (backendData.status === 'rti_completed' || backendData.status === 'grievance_completed') {
          newStage = 'COMPLETE';
        }

        set({
          caseId: caseId,
          language: backendData.language || 'English',
          userProblem: backendData.user_problem || '',
          classifyResult: {
            route: backendData.route,
            sub_category: backendData.sub_category,
            form_schema: backendData.form_schema || [],
            reasoning: "Resumed from saved passkey."
          },
          triageConfirmed: true,
          formData: backendData.form_data || {},
          departmentInfo: backendData.department_info || null,
          departmentConfirmed: !!backendData.department_info,
          rtiPrediction: backendData.prediction_result || null,
          rtiDraft: backendData.improved_draft || backendData.initial_draft || null,
          grievanceResult: backendData.grievance_pack || null,
          stage: newStage,
        });
      },

      reset: () =>
        set({
          stage: 'IDLE',
          caseId: null,
          userProblem: '',
          classifyResult: null,
          triageConfirmed: false,
          formData: {},
          departmentInfo: null,
          departmentConfirmed: false,
          rtiPrediction: null,
          rtiDraft: null,
          grievanceResult: null,
          error: null,
          isLoading: false,
        }),
    }),
    {
      name: 'janadhikar_case_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      })),
    }
  )
)

export default useCaseStore
