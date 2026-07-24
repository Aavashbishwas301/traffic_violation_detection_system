import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({ className, variant = "default", ...props }) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    destructive: "border-transparent bg-rose-600 text-slate-50 hover:bg-rose-600/80",
    outline: "text-slate-950",
    success: "border-transparent bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    warning: "border-transparent bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}
