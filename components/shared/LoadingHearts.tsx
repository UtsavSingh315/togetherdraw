import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface LoadingHeartsProps {
  message?: string;
}

export const LoadingHearts = ({
  message = "Connecting hearts...",
}: LoadingHeartsProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}>
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-muted-foreground font-nunito text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}>
        {message}
      </motion.p>
    </div>
  );
};
