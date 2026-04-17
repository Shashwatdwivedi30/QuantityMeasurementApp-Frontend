import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  Clock,
  LogOut,
  RefreshCcw,
  Trash2,
  User,
} from 'lucide-react'
import { measurementApi, type MeasurementType, type QuantityMeasurementDTO } from '../lib/api'
import { useAuth } from '../state/auth/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

type ActionType = 'Conversion' | 'Arithmetic' | 'Comparison'
type ArithmeticOp = 'ADD' | 'SUBTRACT' | 'DIVIDE'

const measurementTypes: { key: MeasurementType; label: string }[] = [
  { key: 'LengthUnit', label: 'Length' },
  { key: 'WeightUnit', label: 'Weight' },
  { key: 'TemperatureUnit', label: 'Temperature' },
  { key: 'VolumeUnit', label: 'Volume' },
]

const unitsByType: Record<MeasurementType, { unit: string; label: string }[]> = {
  LengthUnit: [
    { unit: 'FEET', label: 'Feet' },
    { unit: 'INCHES', label: 'Inches' },
    { unit: 'YARDS', label: 'Yards' },
    { unit: 'CENTIMETERS', label: 'Centimeters' },
    { unit: 'MILLIMETERS', label: 'Millimeters' },
    { unit: 'METERS', label: 'Meters' },
    { unit: 'KILOMETERS', label: 'Kilometers' },
  ],
  WeightUnit: [
    { unit: 'MILLIGRAM', label: 'Milligram' },
    { unit: 'GRAM', label: 'Gram' },
    { unit: 'KILOGRAM', label: 'Kilogram' },
    { unit: 'OUNCE', label: 'Ounce' },
    { unit: 'POUND', label: 'Pound' },
    { unit: 'TONNE', label: 'Tonne' },
  ],
  TemperatureUnit: [
    { unit: 'CELSIUS', label: 'Celsius' },
    { unit: 'FAHRENHEIT', label: 'Fahrenheit' },
    { unit: 'KELVIN', label: 'Kelvin' },
  ],
  VolumeUnit: [
    { unit: 'LITRE', label: 'Litre' },
    { unit: 'MILLILITRE', label: 'Millilitre' },
    { unit: 'GALLON', label: 'Gallon' },
    { unit: 'CUBIC_METER', label: 'Cubic meter (m³)' },
    { unit: 'CUP', label: 'Cup (US)' },
  ],
}

function shortEmail(email?: string | null) {
  if (!email) return 'user'
  const [u, d] = email.split('@')
  if (!d) return email
  return `${u.slice(0, 2)}…@${d}`
}

export function DashboardPage() {
  const { user, token, logout } = useAuth()

  const [measurementType, setMeasurementType] = useState<MeasurementType>('LengthUnit')
  const [actionType, setActionType] = useState<ActionType>('Conversion')
  const [arithOp, setArithOp] = useState<ArithmeticOp>('ADD')

  const unitOptions = unitsByType[measurementType]

  const [valueA, setValueA] = useState<string>('1')
  const [unitA, setUnitA] = useState(unitOptions[0]?.unit ?? '')
  const [valueB, setValueB] = useState<string>('2')
  const [unitB, setUnitB] = useState(unitOptions[1]?.unit ?? unitOptions[0]?.unit ?? '')
  const [targetUnit, setTargetUnit] = useState(unitOptions[0]?.unit ?? '')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>('')
  const [result, setResult] = useState<QuantityMeasurementDTO | null>(null)

  const [history, setHistory] = useState<QuantityMeasurementDTO[]>([])

  useEffect(() => {
    const next = unitsByType[measurementType]
    setUnitA(next[0]?.unit ?? '')
    setUnitB(next[1]?.unit ?? next[0]?.unit ?? '')
    setTargetUnit(next[0]?.unit ?? '')
    setResult(null)
    setError('')
    // Temperature arithmetic is not supported by backend model; force safe defaults.
    if (measurementType === 'TemperatureUnit' && actionType === 'Arithmetic') {
      setActionType('Conversion')
    }
  }, [measurementType])

  useEffect(() => {
    // When action changes, keep units consistent and avoid stale selections
    const next = unitsByType[measurementType]
    if (!next.some((u) => u.unit === unitA)) setUnitA(next[0]?.unit ?? '')
    if (!next.some((u) => u.unit === unitB)) setUnitB(next[1]?.unit ?? next[0]?.unit ?? '')
    if (!next.some((u) => u.unit === targetUnit)) setTargetUnit(next[0]?.unit ?? '')
    setResult(null)
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionType])

  async function refreshHistory() {
    try {
      const h = await measurementApi.history({ token })
      setHistory(h.slice().reverse().slice(0, 10))
    } catch {
      // history is non-critical UI
    }
  }

  useEffect(() => {
    void refreshHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resultText = useMemo(() => {
    if (!result) return null
    if (result.error) return result.errorMessage || 'Operation failed'
    if (result.resultString) return result.resultString
    if (typeof result.resultValue === 'number' && result.resultUnit) {
      return `${result.resultValue} ${result.resultUnit}`
    }
    return 'Done'
  }, [result])

  async function onCalculate() {
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const a = Number(valueA)
      const b = Number(valueB)
      if (!Number.isFinite(a)) throw new Error('Please enter a valid value')
      if ((actionType === 'Arithmetic' || actionType === 'Comparison') && !Number.isFinite(b)) {
        throw new Error('Please enter a valid second value')
      }

      if (actionType === 'Conversion') {
        const res = await measurementApi.convert({
          thisQuantity: { value: a, unit: unitA, measurementType },
          targetUnit,
          token,
        })
        setResult(res)
      } else if (actionType === 'Comparison') {
        const res = await measurementApi.compare({
          thisQuantity: { value: a, unit: unitA, measurementType },
          thatQuantity: { value: b, unit: unitB, measurementType },
          token,
        })
        setResult(res)
      } else {
        const base = {
          thisQuantity: { value: a, unit: unitA, measurementType },
          thatQuantity: { value: b, unit: unitB, measurementType },
          token,
        }
        const res =
          arithOp === 'ADD'
            ? await measurementApi.add({ ...base, targetUnit })
            : arithOp === 'SUBTRACT'
              ? await measurementApi.subtract({ ...base, targetUnit })
              : await measurementApi.divide(base)
        setResult(res)
      }

      await refreshHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  function clearHistory() {
    setHistory([])
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.14]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-purple-500/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-500/20 ring-1 ring-white/10">
              <Calculator className="h-5 w-5 text-indigo-200" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Quantity Measurement</div>
              <div className="text-xs text-slate-300/65">Dashboard</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button onClick={() => void refreshHistory()} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
          {/* Sidebar */}
          <aside className="glass rounded-3xl p-5">
            <div className="text-xs font-semibold tracking-wide text-slate-200/70">
              Measurement Type
            </div>
            <div className="mt-3 space-y-2">
              {measurementTypes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setMeasurementType(t.key)}
                  className={[
                    'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition',
                    measurementType === t.key
                      ? 'border-indigo-400/30 bg-white/8 text-slate-100'
                      : 'border-white/10 bg-white/5 text-slate-200/80 hover:bg-white/7 hover:border-white/15',
                  ].join(' ')}
                >
                  <span>{t.label}</span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] leading-relaxed text-slate-300/70">
              <span className="text-slate-200/80">Active:</span> {measurementType} <br />
              <span className="text-slate-200/80">Units:</span> {unitOptions.map((u) => u.label).join(', ')}
            </div>

            <div className="mt-6 text-xs font-semibold tracking-wide text-slate-200/70">
              Action Type
            </div>
            <div className="mt-3 space-y-2">
              {(['Conversion', 'Arithmetic', 'Comparison'] as ActionType[]).map((a) => {
                const disabled = measurementType === 'TemperatureUnit' && a === 'Arithmetic'
                return (
                <button
                  key={a}
                  onClick={() => {
                    if (!disabled) setActionType(a)
                  }}
                  disabled={disabled}
                  className={[
                    'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition',
                    disabled ? 'opacity-50 cursor-not-allowed' : '',
                    actionType === a
                      ? 'border-indigo-400/30 bg-white/8 text-slate-100'
                      : 'border-white/10 bg-white/5 text-slate-200/80 hover:bg-white/7 hover:border-white/15',
                  ].join(' ')}
                >
                  <span>{a}</span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </button>
              )})}
            </div>

            {actionType === 'Arithmetic' ? (
              <div className="mt-4">
                <Select
                  label="Arithmetic Operation"
                  value={arithOp}
                  onChange={(e) => setArithOp(e.target.value as ArithmeticOp)}
                >
                  <option value="ADD">Add</option>
                  <option value="SUBTRACT">Subtract</option>
                  <option value="DIVIDE">Divide</option>
                </Select>
              </div>
            ) : null}
          </aside>

          {/* Main */}
          <main className="glass rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-slate-100">Measurement Calculator</div>
                <div className="mt-1 text-xs text-slate-300/70">
                  Select units, enter values, and calculate instantly.
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                label="Value"
                value={valueA}
                onChange={(e) => setValueA(e.target.value)}
                inputMode="decimal"
              />
              <Select label="Unit" value={unitA} onChange={(e) => setUnitA(e.target.value)}>
                {unitOptions.map((u) => (
                  <option key={u.unit} value={u.unit}>
                    {u.label}
                  </option>
                ))}
              </Select>

              {actionType !== 'Conversion' ? (
                <>
                  <Input
                    label="Second Value"
                    value={valueB}
                    onChange={(e) => setValueB(e.target.value)}
                    inputMode="decimal"
                  />
                  <Select label="Second Unit" value={unitB} onChange={(e) => setUnitB(e.target.value)}>
                    {unitOptions.map((u) => (
                      <option key={u.unit} value={u.unit}>
                        {u.label}
                      </option>
                    ))}
                  </Select>
                </>
              ) : null}

              {actionType !== 'Comparison' ? (
                <div className="md:col-span-2">
                  <Select
                    label={actionType === 'Conversion' ? 'Convert to' : 'Target Unit (optional)'}
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                  >
                    {unitOptions.map((u) => (
                      <option key={u.unit} value={u.unit}>
                        {u.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={() => void onCalculate()} disabled={busy} className="px-6 py-3">
                Calculate <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setResult(null)
                  setError('')
                }}
              >
                Clear result
              </Button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs font-semibold tracking-wide text-slate-200/70">
                Result
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-100">
                {resultText ?? (
                  <span className="text-slate-300/60">
                    Run a calculation to see output here.
                  </span>
                )}
              </div>
              {result && !result.error ? (
                <div className="mt-2 text-xs text-slate-300/65">
                  Operation: <span className="text-slate-200/80">{result.operation}</span>
                </div>
              ) : null}
            </div>
          </main>

          {/* Right */}
          <aside className="space-y-6">
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <User className="h-5 w-5 text-slate-200/80" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Profile</div>
                    <div className="mt-0.5 text-xs text-slate-300/70">{user?.email}</div>
                  </div>
                </div>
                <Button variant="ghost" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300/70">
                Signed in as <span className="text-slate-100">{shortEmail(user?.email)}</span>
              </div>
            </div>

            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-200/80" />
                  <div className="text-sm font-semibold text-slate-100">Recent History</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => void refreshHistory()} className="gap-2">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={clearHistory} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {history.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300/60">
                    No recent operations yet.
                  </div>
                ) : (
                  history.map((h, idx) => (
                    <div
                      key={`${h.operation}-${idx}-${h.resultString}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/15 hover:bg-white/7"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs font-semibold text-slate-100">
                          {h.operation}
                        </div>
                        <div className="text-[11px] text-slate-300/60">
                          {h.thisMeasurementType}
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-300/70">
                        {h.resultString || `${h.resultValue} ${h.resultUnit}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

