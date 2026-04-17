import * as React from 'react'
import { cn } from './cn'

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

export function Select({ className, label, children, ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-2 text-xs font-medium tracking-wide text-slate-200/80">
          {label}
        </div>
      ) : null}
      <select
        className={cn(
          'w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-500/25',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

