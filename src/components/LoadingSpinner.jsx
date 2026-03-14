// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full">
            <div className="relative w-16 h-16">
                <motion.div
                    className="absolute inset-0 border-4 border-slate-200 dark:border-white/10 rounded-full"
                />
                <motion.div
                    className="absolute inset-0 border-4 border-neon-green rounded-full border-t-transparent border-l-transparent dark:border-t-transparent dark:border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        </div>
    );
}
