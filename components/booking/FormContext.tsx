'use client';

import { createContext, useContext } from 'react';

interface FormContextType {
  formData: any;
  updateFormData: (data: any) => void;
  user: any;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = FormContext.Provider;

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};