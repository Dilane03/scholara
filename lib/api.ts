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
  createPreEnrollment: (data: { matricule?: string }) => request<{ id: string }>('/students/pre-enrollments', { id: data.matricule || `CEH-26-${String(Date.now()).slice(-5)}` }, post(data)),
  importStudents: (data: { name: string; className: string; stream: string; guardian: string; phone: string }[]) => request<{ students: (typeof students)[number][] }>('/students/import', { students: data.map((row, index) => ({ ...row, id: `CEH-26-${String(Date.now() + index).slice(-5)}`, status: 'Actif', fees: '—' })) }, post({ students: data })),
  getClasses: () => request('/classes', classes),
  createClass: (data: { name: string; stream: string; capacity: number; teacher: string }) => request('/classes', { saved: true }, post(data)),
  createSubject: (data: { name: string; stream: string }) => request('/subjects', { saved: true }, post(data)),
  createTeacherAssignment: (data: { teacher: string; subject: string; className: string }) => request('/classes/teacher-assignments', { saved: true }, post(data)),
  assignStudent: (data: unknown) => request('/classes/assignments', { assigned: true }, post(data)),
  createAssignmentRequest: (data: unknown) => request<{ id: string }>('/classes/assignment-exceptions', { id: `DER-26-${String(Date.now()).slice(-4)}` }, post(data)),
  updateAssignmentRequest: (id: string, status: 'Acceptée' | 'Refusée') => request('/classes/assignment-exceptions', { id, status }, post({ id, status })),

  getAttendance: () => request('/attendance/today', attendanceRoster),
  submitAttendance: (data: unknown) => request('/attendance', { saved: true }, post(data)),
  submitJustification: (data: unknown) => request('/attendance/justifications', { id: Date.now(), status: 'Déposé' }, post(data)),
  updateJustification: (id: number, status: string, message: string) => request(`/attendance/justifications/${id}/status`, { id, status, message }, post({ status, message })),
  getGrades: () => request('/grades', evaluations),
  saveGrades: (data: unknown) => request('/grades/drafts', { saved: true }, post(data)),
  createAssessment: (data: unknown) => request('/grades/assessments', { saved: true }, post(data)),
  validateGrades: (data: unknown) => request('/grades/validate', { saved: true, locked: true }, post(data)),
  requestGradeCorrection: (data: unknown) => request('/grades/corrections', { status: 'À autoriser' }, post(data)),
  authorizeGradeCorrection: (data: unknown) => request('/grades/corrections/authorize', { status: 'Autorisée' }, post(data)),
  saveHeadTeacherComments: (data: unknown) => request('/grades/comments', { saved: true }, post(data)),
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
