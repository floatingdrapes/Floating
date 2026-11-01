import { ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface BackToHomeButtonProps {
  onClick: () => void;
  className?: string;
  variant?: 'inline' | 'floating';
}

export default function BackToHomeButton({ onClick, className = '', variant = 'inline' }: BackToHomeButtonProps) {
  const handleGoBack = () => {
    onClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (variant === 'floating') {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGoBack}
        className={`fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#0099ff] border-2 border-white/20 text-white shadow-[0_4px_20px_rgba(0,153,255,0.45)] hover:bg-[#0088ee] hover:shadow-[0_6px_24px_rgba(0,153,255,0.6)] transition-all duration-300 cursor-pointer ${className}`}
        title="Back to Homepage"
        id="floating-home-button"
      >
        <Home className="h-5 w-5 text-white" />
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: -3 }}
      onClick={handleGoBack}
      className={`inline-flex items-center space-x-2 text-xs font-bold tracking-[0.15em] text-[#88ccff] uppercase bg-[#051f38] border border-[#0066aa]/50 hover:border-[#0099ff] hover:text-white hover:bg-[#07284a] px-4 py-2 rounded-xl shadow-sm transition-all duration-300 group cursor-pointer mb-8 ${className}`}
      id="inline-back-to-home"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 duration-300 text-[#0099ff]" />
      <span>Back to Home</span>
    </motion.button>
  );
}
