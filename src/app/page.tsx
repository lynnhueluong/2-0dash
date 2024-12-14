// src/app/page.tsx
import AuthFlow from "@/components/framer/AuthFlow"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <AuthFlow 
        buttonText="Get Started"
        buttonColor="#0099ff"
        redirectUrl="/dashboard"
        showUserProfile={true}
        theme="light"
      />
    </main>
  );
}