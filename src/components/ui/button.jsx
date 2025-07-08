import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Button component
export function Button({ children, className = "", size = "base", ...props }) {
  const base = "rounded-2xl bg-green-600 text-white hover:bg-green-700 font-medium transition-all";
  const sizes = {
    sm: "text-sm px-4 py-2",
    base: "text-base px-5 py-2.5",
    lg: "text-lg px-6 py-3"
  };

  return (
    <button className={`${base} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}