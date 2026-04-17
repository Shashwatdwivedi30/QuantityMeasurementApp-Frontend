import * as React from 'react'
import { cn } from './cn'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'secondary', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed'
  const variants: Record<NonNullable<Props['variant']>, string> = {
    primary:
      'gradient-btn text-white shadow-[0_10px_30px_rgba(99,102,241,0.25)] hover:shadow-[0_18px_48px_rgba(99,102,241,0.35)] hover:-translate-y-[1px]',
    secondary:
      'glass text-slate-100 hover:bg-white/7 hover:border-white/15 hover:-translate-y-[1px]',
    ghost: 'text-slate-200/80 hover:text-slate-100 hover:bg-white/5',
  }

  return <button className={cn(base, variants[variant], className)} {...props} />
}

