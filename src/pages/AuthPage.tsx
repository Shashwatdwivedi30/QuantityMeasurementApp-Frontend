import { useMemo, useState } from 'react'
import { ArrowRight, Eye, EyeOff, LogIn, Sparkles, UserPlus } from 'lucide-react'
import { useAuth } from '../state/auth/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type Mode = 'login' | 'signup'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.1-.1-2.1-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.4 35.4 26.8 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.6 5.1C9.2 39.7 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.3l.1.1 6.3 5.2C39 37.2 44 33 44 24c0-1.1-.1-2.1-.4-3.5z"
      />
    </svg>
  )
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="glass group rounded-2xl p-4 transition hover:-translate-y-[2px] hover:border-white/15">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-500/20 ring-1 ring-white/10">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <div className="mt-1 text-xs leading-relaxed text-slate-300/70">
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthPage() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>('') // placeholder area requested
  const [info, setInfo] = useState<string>('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const heading = useMemo(
    () => (mode === 'login' ? 'Welcome back' : 'Create your account'),
    [mode],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login({ email, password })
      } else {
        await signup({ fullName, email, password })
        setMode('login')
        setPassword('')
        setInfo('Account created. Please login to continue.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  function onGoogleClick() {
    // Placeholder handler for future OAuth/Firebase integration.
    // eslint-disable-next-line no-console
    console.log('Google OAuth placeholder')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.16]" />

      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/25 via-indigo-500/15 to-purple-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[-80px] h-[520px] w-[520px] rounded-full bg-gradient-to-r from-purple-500/25 via-indigo-500/10 to-blue-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          {/* Left */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80">
              <Sparkles className="h-4 w-4 text-indigo-300" />
              Premium dark UI • Glassmorphism
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
              <span className="gradient-text">Quantity Measurement</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300/80 sm:text-base">
              Smart, Accurate, Fast Unit Calculations
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <FeatureCard
                title="Length"
                description="Convert and compare distances with precision."
                icon={<span className="text-blue-300">⟷</span>}
              />
              <FeatureCard
                title="Weight"
                description="Quick mass conversions for daily use."
                icon={<span className="text-indigo-300">⚖</span>}
              />
              <FeatureCard
                title="Temperature"
                description="Celsius, Fahrenheit, Kelvin—instantly."
                icon={<span className="text-purple-300">°</span>}
              />
              <FeatureCard
                title="Volume"
                description="From litres to gallons, seamlessly."
                icon={<span className="text-fuchsia-300">⟐</span>}
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-center">
            <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-slate-100">
                    {heading}
                  </div>
                  <div className="mt-1 text-xs text-slate-300/70">
                    {mode === 'login'
                      ? 'Login to continue to your dashboard.'
                      : 'Sign up to start measuring in seconds.'}
                  </div>
                </div>
                <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={[
                      'rounded-xl px-3 py-2 text-xs font-medium transition',
                      mode === 'login'
                        ? 'bg-white/10 text-slate-100'
                        : 'text-slate-300/70 hover:text-slate-100',
                    ].join(' ')}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={[
                      'rounded-xl px-3 py-2 text-xs font-medium transition',
                      mode === 'signup'
                        ? 'bg-white/10 text-slate-100'
                        : 'text-slate-300/70 hover:text-slate-100',
                    ].join(' ')}
                  >
                    Signup
                  </button>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                {mode === 'signup' ? (
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Johnson"
                    autoComplete="name"
                    required
                  />
                ) : null}
                <Input
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
                <Input
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  type={showPassword ? 'text' : 'password'}
                  required
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="rounded-lg p-2 text-slate-200/70 transition hover:bg-white/5 hover:text-slate-100"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />

                {error ? (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    {error}
                  </div>
                ) : info ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                    {info}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-300/50">
                    {/* placeholder area requested */}
                    &nbsp;
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full py-2.5"
                  type="submit"
                  disabled={busy}
                >
                  {mode === 'login' ? (
                    <>
                      <LogIn className="h-4 w-4" /> Login <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" /> Signup <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="h-px w-full bg-white/10" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#070A12] px-3 text-[11px] text-slate-300/50">
                    or
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={onGoogleClick}
                  className="w-full justify-center py-2.5"
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>

                <div className="pt-1 text-center text-[11px] text-slate-300/60">
                  By continuing you agree to our <span className="text-slate-200/80">Terms</span> and{' '}
                  <span className="text-slate-200/80">Privacy Policy</span>.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

