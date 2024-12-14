import Image from 'next/image';
import { motion } from 'framer-motion';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function AuthFlow() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {user && user.picture && (
        <div className="relative w-16 h-16 rounded-full overflow-hidden">
          <Image
            src={user.picture}
            alt="Profile picture"
            fill
            sizes="(max-width: 64px) 100vw, 64px"
            className="object-cover"
            priority
          />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {user ? (
          <div className="text-center">
            <h2 className="text-xl font-bold">Welcome, {user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ) : (
          <p>Please log in to continue</p>
        )}
      </motion.div>
    </div>
  );
}