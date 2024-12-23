// src/app/api/auth/[auth0]/route.ts
import { handleLogin, handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const GET = handleAuth({
 signup: handleLogin({
   returnTo: 'https://the20.co/onboarding',
   authorizationParams: {
     prompt: 'signup',
     screen_hint: 'signup',
   }
 }),
 login: handleLogin({
   returnTo: 'https://the20.co/onboarding',
   authorizationParams: {
     prompt: 'login',
   }
 }),
 async callback(req: NextRequest) {
   const searchParams = req.nextUrl.searchParams;
   const stateParam = searchParams.get('state');
   
   let returnTo = 'https://the20.co/onboarding';
   
   if (stateParam) {
     try {
       const decodedState = JSON.parse(
         Buffer.from(stateParam, 'base64').toString()
       );
       returnTo = decodedState.returnTo || returnTo;
     } catch (parseError) {
       console.error('Failed to parse state:', parseError);
     }
   }

   return handleAuth().callback(req, {
     returnTo
   });
 }
});

export const POST = handleAuth();