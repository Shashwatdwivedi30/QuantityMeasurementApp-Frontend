import * as React from 'react'
import { cn } from './cn'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  rightSlot?: React.ReactNode
}

export function Input({ className, label, rightSlot, ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-2 text-xs font-medium tracking-wide text-slate-200/80">
          {label}
        </div>
      ) : null}
      <div className="relative">
        <input
          className={cn(
            'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400/70 outline-none transition focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-500/25',
            rightSlot ? 'pr-12' : '',
            className,
          )}
          {...props}
        />
        {rightSlot ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightSlot}
          </div>
        ) : null}
      </div>
    </label>
  )
}

