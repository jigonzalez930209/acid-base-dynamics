/** URL del Web App de Google Apps Script (misma para alumnos y profesores). */
export const LAB_API_URL =
  'https://script.google.com/macros/s/AKfycbyofFmXAdaMRCe0R9aPQgwO4-0U8lKFOXXxieJjD-2XaO4baUYREsmNQQ29eqwoVRN-4w/exec'

export async function labFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  return res.json() as Promise<T>
}
