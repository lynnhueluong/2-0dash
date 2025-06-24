import { UserProfile } from '@auth0/nextjs-auth0/client';

declare module '@auth0/nextjs-auth0/client' {
  interface UserProfile {
    user_metadata?: {
      onboardingCompleted?: boolean;
      profileData?: {
        name?: string;
        preferredName?: string;
        pronouns?: string;
        careerStage?: string;
        skills?: string[];
      };
    };
  }
} 