type ApiErrorPayload = {
  message?: string
  error?: string
  status?: number
  timestamp?: string
  path?: string
}

async function readJsonSafe(res: Response) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export class ApiError extends Error {
  status: number
  payload: unknown
  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export async function apiFetch<T>(
  path: string,
  opts?: { method?: string; body?: unknown; token?: string | null },
) {
  const res = await fetch(path, {
    method: opts?.method ?? (opts?.body ? 'POST' : 'GET'),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  })

  const payload = await readJsonSafe(res)
  if (!res.ok) {
    const p = payload as ApiErrorPayload | string | null
    const msg =
      (typeof p === 'object' && p && (p.message || p.error)) ||
      (typeof p === 'string' ? p : null) ||
      `Request failed (${res.status})`
    throw new ApiError(String(msg), res.status, payload)
  }
  return payload as T
}

export const authApi = {
  signup: async (body: { username: string; password: string }) =>
    apiFetch<string>('/auth/signup', { method: 'POST', body }),
  login: async (body: { username: string; password: string }) =>
    apiFetch<string>('/auth/login', { method: 'POST', body }),
}

export type MeasurementType = 'LengthUnit' | 'WeightUnit' | 'TemperatureUnit' | 'VolumeUnit'

export type QuantityDTO = {
  value: number
  unit: string
  measurementType: MeasurementType
}

export type QuantityMeasurementDTO = {
  thisValue: number
  thisUnit: string
  thisMeasurementType: string
  thatValue: number
  thatUnit: string
  thatMeasurementType: string
  operation: string
  resultString: string
  resultValue: number
  resultUnit: string
  resultMeasurementType: string
  errorMessage: string
  error: boolean
}

export const measurementApi = {
  convert: async (params: { thisQuantity: QuantityDTO; targetUnit: string; token?: string | null }) =>
    apiFetch<QuantityMeasurementDTO>('/api/measurements/convert', {
      method: 'POST',
      body: { thisQuantity: params.thisQuantity, targetUnit: params.targetUnit },
      token: params.token,
    }),
  compare: async (params: { thisQuantity: QuantityDTO; thatQuantity: QuantityDTO; token?: string | null }) =>
    apiFetch<QuantityMeasurementDTO>('/api/measurements/compare', {
      method: 'POST',
      body: { thisQuantity: params.thisQuantity, thatQuantity: params.thatQuantity },
      token: params.token,
    }),
  add: async (params: { thisQuantity: QuantityDTO; thatQuantity: QuantityDTO; targetUnit?: string; token?: string | null }) =>
    apiFetch<QuantityMeasurementDTO>('/api/measurements/add', {
      method: 'POST',
      body: { thisQuantity: params.thisQuantity, thatQuantity: params.thatQuantity, targetUnit: params.targetUnit ?? null },
      token: params.token,
    }),
  subtract: async (params: { thisQuantity: QuantityDTO; thatQuantity: QuantityDTO; targetUnit?: string; token?: string | null }) =>
    apiFetch<QuantityMeasurementDTO>('/api/measurements/subtract', {
      method: 'POST',
      body: { thisQuantity: params.thisQuantity, thatQuantity: params.thatQuantity, targetUnit: params.targetUnit ?? null },
      token: params.token,
    }),
  divide: async (params: { thisQuantity: QuantityDTO; thatQuantity: QuantityDTO; token?: string | null }) =>
    apiFetch<QuantityMeasurementDTO>('/api/measurements/divide', {
      method: 'POST',
      body: { thisQuantity: params.thisQuantity, thatQuantity: params.thatQuantity },
      token: params.token,
    }),
  history: async (params?: { token?: string | null }) =>
    apiFetch<QuantityMeasurementDTO[]>('/api/measurements/history', { token: params?.token ?? null }),
}

