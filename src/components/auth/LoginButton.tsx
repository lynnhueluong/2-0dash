// src/components/auth/LoginButton.tsx
import { motion } from 'framer-motion';

export const LoginButton = () => {
  return (
    <motion.a
      href="/api/auth/login"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
    >
      Sign In
    </motion.a>
  );
};
