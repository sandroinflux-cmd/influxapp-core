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

export async function fetchBogOrder(orderId: string) {
  const token = await getBogToken()
  const response = await fetch(
    `https://api.bog.ge/payments/v1/ecommerce/orders/${encodeURIComponent(orderId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Language': 'ka',
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error(`BOG verification failed (${response.status})`)
  }

  return response.json()
}

export function bogStatusKey(order: any) {
  const status = order?.order_status ?? order?.status
  if (status && typeof status === 'object') {
    return String(status.key || '').trim().toLowerCase()
  }
  return String(status || '').trim().toLowerCase()
}
