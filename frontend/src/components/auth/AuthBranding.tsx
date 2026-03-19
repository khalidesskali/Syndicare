import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

export function AuthBranding() {
  return (
    <div className="w-full md:w-[45%] bg-slate-950 p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
      {/* Subtle gradient glowing orbs for the premium modern look */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Syndicare</span>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-6 leading-[1.15]"
        >
          Manage your <br/> properties with <br/> unparalleled ease.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-slate-400 text-base max-w-sm leading-relaxed"
        >
          The modern property management system designed exclusively for transparency, speed, and reliability.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 flex items-center gap-4 text-sm text-slate-500 font-medium"
      >
        <div className="h-[1px] bg-gradient-to-r from-white/20 to-transparent flex-1" />
        <span>Trusted by thousands of syndics</span>
      </motion.div>
    </div>
  );
}
