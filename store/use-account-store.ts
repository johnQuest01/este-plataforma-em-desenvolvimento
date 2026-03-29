import { create } from 'zustand';

interface AccountStoreState {
  isSubmitting: boolean;
  submissionError: string | null;
  submissionSuccess: string | null;
  setIsSubmitting: (status: boolean) => void;
  setSubmissionError: (error: string | null) => void;
  setSubmissionSuccess: (message: string | null) => void;
  clearNotifications: () => void;
}

export const useAccountStore = create<AccountStoreState>((set) => ({
  isSubmitting: false,
  submissionError: null,
  submissionSuccess: null,
  setIsSubmitting: (status) => set({ isSubmitting: status }),
  setSubmissionError: (error) => set({ submissionError: error, submissionSuccess: null }),
  setSubmissionSuccess: (message) => set({ submissionSuccess: message, submissionError: null }),
  clearNotifications: () => set({ submissionError: null, submissionSuccess: null }),
}));