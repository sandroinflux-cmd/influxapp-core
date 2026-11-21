export async function getBogToken() {
  const clientId = process.env.BOG_CLIENT_ID
  const secretKey = process.env.BOG_SECRET_KEY

  if (!clientId || !secretKey) {
    throw new Error('BOG Credentials are missing in environment variables')
  }

  const authString = Buffer.from(`${clientId}:${secretKey}`).toString('base64')
  const response = await fetch('https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to authenticate with BOG')
  }

  const data = await response.json()
  if (!data?.access_token) throw new Error('Failed to authenticate with BOG')
  return data.access_token as string
}

const PAYMENT_STATES = new Set([
  'completed',
  'approved',
  'success',
  'paid',
  'rejected',
  'failed',
  'cancelled',
  'canceled',
  'processing',
  'created',
  'pending',
  'refunded',
  'refunded_partially',
  'refund_requested',
  'auth_requested',
  'blocked',
  'partial_completed',
])

/** Receipt payloads are sometimes wrapped in `body` / `data`. */
export function unwrapBogOrder(payload: any): any {
  let current = payload
  for (let depth = 0; depth < 3; depth += 1) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return current
    const hasOrder =
      'order_status' in current ||
      'purchase_units' in current ||
      'payment_detail' in current ||
      'external_order_id' in current
    if (hasOrder) return current
    const nested = current.body ?? current.data
    if (!nested || nested === current || typeof nested !== 'object' || Array.isArray(nested)) return current
    current = nested
  }
  return current
}

export async function fetchBogOrder(orderId: string) {
  const token = await getBogToken()
  // Create-order is POST /ecommerce/orders. Status lives on the receipt URL
  // returned as _links.details.href.
  const response = await fetch(
    `https://api.bog.ge/payments/v1/receipt/${encodeURIComponent(orderId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Language': 'ka',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    }
  )

  if (!response.ok) {
    console.error('[BOG verify] order lookup failed', { orderId, status: response.status })
    throw new Error(`BOG verification failed (${response.status})`)
  }

  return unwrapBogOrder(await response.json())
}

function statusKeyFrom(value: unknown) {
  if (value && typeof value === 'object') {
    return String((value as { key?: unknown }).key || '').trim().toLowerCase()
  }
  if (typeof value === 'string') return value.trim().toLowerCase()
  return ''
}

function descriptionIsSuccess(description: string) {
  const text = description.trim().toLowerCase()
  if (!text) return false
  if (/(unsuccessful|declin|reject|fail|error|უარყოფ)/.test(text)) return false
  return (
    text.includes('successful payment') ||
    text.includes('წარმატებული გადახდა') ||
    text === 'success' ||
    text === 'successful' ||
    text === 'approved' ||
    text === 'paid' ||
    text === 'completed'
  )
}

export function bogStatusKey(order: any) {
  const source = unwrapBogOrder(order)
  const orderStatusKey = statusKeyFrom(source?.order_status)
  if (orderStatusKey) return orderStatusKey

  const statusKey = statusKeyFrom(source?.status)
  if (statusKey && PAYMENT_STATES.has(statusKey)) return statusKey

  const detail = source?.payment_detail
  const code = String(detail?.code ?? '').trim()
  // 100 is BOG's successful-payment response code. 200 is only a pre-authorization.
  if (code === '100') return 'completed'
  if (descriptionIsSuccess(String(detail?.code_description || ''))) return 'success'
  return ''
}
