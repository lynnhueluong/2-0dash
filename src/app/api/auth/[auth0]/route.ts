// pages/api/auth/[...auth0].ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  login: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      // Add any additional parameters you want to pass to Auth0
      prompt: 'login',
    }
  })
});