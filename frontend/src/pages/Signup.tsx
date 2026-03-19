import { motion } from "framer-motion";
import { AuthBranding } from "@/components/auth/AuthBranding";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Signup() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 selection:bg-indigo-500/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1000px] bg-white rounded-[24px] shadow-2xl xl:shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row border border-slate-100"
      >
        <AuthBranding />
        <SignupForm />
      </motion.div>
    </div>
  );
}
