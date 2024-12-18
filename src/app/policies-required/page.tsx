// src/app/policies-required/page.tsx
export default function PoliciesRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Policies Acceptance Required</h1>
        <p className="mb-4">Please accept all required policies to continue.</p>
        <a 
          href="/api/auth/login" 
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Review Policies
        </a>
      </div>
    </div>
  );
}