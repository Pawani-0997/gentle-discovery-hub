import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BEZIER = [0.16, 1, 0.3, 1] as const;

interface AuthPageProps {
  onClose: () => void;
}

export default function AuthPage({ onClose }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to confirm your account!");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.6, ease: BEZIER }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      <div className="px-6 pt-6 pb-32 max-w-md mx-auto">
        <button onClick={onClose} className="p-2.5 bg-card rounded-full mb-8 cursor-pointer">
          <ArrowLeft size={20} className="text-foreground" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: BEZIER }}
        >
          <h1 className="text-4xl mb-2">
            {mode === "login" ? "Welcome back" : "Join HobbyPulse"}
          </h1>
          <p className="text-muted-foreground mb-10">
            {mode === "login"
              ? "Sign in to continue your journey"
              : "Create an account to save your progress"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-card rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-card rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3.5 bg-card rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 shadow-ceramic-lg cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {mode === "login" ? "Sign In" : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-medium cursor-pointer"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
