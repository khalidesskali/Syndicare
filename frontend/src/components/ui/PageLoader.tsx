import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl">
      <div className="relative flex flex-col items-center gap-6">
        {/* Glowing aura behind the logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-500/20 rounded-full blur-[30px] animate-pulse pointer-events-none" />
        
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-xl ring-4 ring-slate-900/5"
        >
          <Building2 className="h-8 w-8 text-white" />
        </motion.div>

        <div className="flex flex-col items-center gap-2">
          {/* Custom slim linear progress or circular spinner */}
          <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-100/50">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "linear",
              }}
              className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-indigo-600 to-transparent"
            />
          </div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[14px] font-semibold text-slate-500 tracking-wide"
          >
            Syndicare
          </motion.span>
        </div>
      </div>
    </div>
  );
}
