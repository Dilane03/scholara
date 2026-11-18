import { activities, attendanceRoster, classes, evaluations, feeStatus, payments, schedule, stats, students } from '@/mocks/school'

const API_BASE = '/api/v1'

async function request<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') {
    const response = await fetch(`${API_BASE}${path}`, { ...init, headers: { Accept: 'application/json', ...init?.headers } })
    if (!response.ok) throw new Error(`Erreur API (${response.status})`)
    return response.json() as Promise<T>
  }
  await new Promise((resolve) => setTimeout(resolve, 100))
  return fallback
}
const post = (data: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

export const schoolApi = {
  getOverview: () => request('/dashboard/overview', { stats, classes, activities, schedule, feeStatus }),
  getStudents: () => request('/students', students),
  createPreEnrollment: (data: unknown) => request('/students/pre-enrollments', { id: 'CEH-26-00501' }, post(data)),
  getClasses: () => request('/classes', classes),
  getAttendance: () => request('/attendance/today', attendanceRoster),
  submitAttendance: (data: unknown) => request('/attendance', { saved: true }, post(data)),
  getGrades: () => request('/grades', evaluations),
  saveGrades: (data: unknown) => request('/grades/drafts', { saved: true }, post(data)),
  getPayments: () => request('/finance/payments', payments),
  createPayment: (data: unknown) => request('/finance/payments', { receipt: 'REC-26-00001' }, post(data)),
  getAnnouncements: () => request('/announcements', [] as typeof import('@/mocks/school').announcements),
  publishAnnouncement: (data: unknown) => request('/announcements', { published: true }, post(data)),
  getNotifications: () => request('/notifications', [] as { id: string; title: string }[]),
  getResources: () => request('/resources', [
    { title: 'Fiche de révision — Fonctions', subject: 'Mathématiques · 3e C', kind: 'PDF', size: '248 Ko' },
    { title: 'Travaux pratiques — Circuits électriques', subject: 'Électrotechnique · Tle F3', kind: 'PDF', size: '412 Ko' },
    { title: 'Méthode de commentaire composé', subject: 'Français · 1ère D', kind: 'PDF', size: '196 Ko' },
  ]),
}
