// types/onboarding.ts
export interface OnboardingFormData {
  name: string;
  email: string;
  city: string;
  tenKView: string;
}

export interface OnboardingState {
  isComplete: boolean;
  currentStep: number;

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

export interface OnboardingFormData {
  name: string;
  email: string;
  city: string;
  tenKView: string;
  careerStage?: string;
  breadAndButter?: string;
  otherSkills?: string;
  currentRole?: string;
  currentCompany?: string;
  pronouns?: string;
  identityPreference?: string[];
}


export interface ProgressiveProfileFormProps {
  onComplete?: (formData: OnboardingFormData) => Promise<void>;
}

export interface ProfileFormData {
  chaosIndicators: string[];
  frustrationTriggers: string[];
  opportunityBlockers: string[];
  energyState: string[];
  unhingedMoves: string[];
  bagelPreference: string;
  existentialCrisis: string;
}
