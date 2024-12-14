import { UserProvider } from '@auth0/nextjs-auth0/client';
import AuthFlow from '@/components/framer/AuthFlow';

const AuthPage = () => {
  return (
    <UserProvider>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome to 2.0 Dash</h1>
          <AuthFlow
            buttonText="Get Started"
            buttonColor="bg-blue-600"
            redirectUrl="/dashboard"
            showUserProfile={true}
            theme="light"
          />
        </div>
      </div>
    </UserProvider>
  );
};

export default AuthPage;