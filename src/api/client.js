const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.message || `Request failed: ${res.status}`)
  }

  return res.json()
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
