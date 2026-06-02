/** URL del Web App de Google Apps Script (misma para alumnos y profesores). */
export const LAB_API_URL =
  'https://script.google.com/macros/s/AKfycbyqAHhMcX7QG1_02-oixEQRLBqEBdcU9vkeoRJNYfCUsE2OLXZcHg3qMy8bg5QMH1vu7w/exec'

export async function labFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  return res.json() as Promise<T>
}
