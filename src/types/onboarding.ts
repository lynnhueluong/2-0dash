// types/onboarding.ts
export interface OnboardingFormData {
  name: string;
  email: string;
  city: string;
  tenKView: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AirtableRecord {
  fields: {
    Name: string;
    Email: string;
    City: string;
    '10,000-ft view': string;
  };
}