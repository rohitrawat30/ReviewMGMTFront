const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

console.log('[API] BASE_URL =', BASE_URL)

async function request(path, body) {
  const url = `${BASE_URL}${path}`
  console.log(`[API] → POST ${url}`, body)

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (networkErr) {
    console.error(`[API] Network error on POST ${url}:`, networkErr.message)
    throw new Error(`Network error: ${networkErr.message}`)
  }

  console.log(`[API] ← ${res.status} ${res.statusText} from ${url}`)

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    console.error(`[API] Error response:`, error)
    throw new Error(error?.message || `Request failed: ${res.status}`)
  }

  const data = await res.json()
  console.log(`[API] Response data:`, data)
  return data
}

/**
 * Generate an AI review from rating + keywords.
 * Returns { review: string }
 */
export function generateReview({ rating, keywords }) {
  return request('/api/review/generate', { rating, keywords })
}

/**
 * Submit the final review for routing decision.
 * Returns { action: 'redirect' | 'connectCustomer' }
 */
export function submitReview({ rating, comment }) {
  return request('/api/review/submit', { rating, comment })
}
