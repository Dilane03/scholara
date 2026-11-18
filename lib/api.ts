import { activities, classes, feeStatus, schedule, stats } from '@/mocks/school'

const API_BASE = '/api/v1'

async function request<T>(path: string, fallback: T): Promise<T> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') {
    const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`Erreur API (${response.status})`)
    return response.json() as Promise<T>
  }
  await new Promise((resolve) => setTimeout(resolve, 160))
  return fallback
}

export const schoolApi = {
  getOverview: () => request('/dashboard/overview', { stats, classes, activities, schedule, feeStatus }),
  getStudents: () => request('/students', [] as { id: string; name: string; className: string }[]),
  getNotifications: () => request('/notifications', [] as { id: string; title: string }[]),
}
