export type SchoolRole = 'direction' | 'secretariat' | 'accountant' | 'teacher' | 'parent' | 'student'

export const school = {
  name: 'Collège Les Horizons',
  location: 'Yaoundé, Cameroun',
  year: '2025–2026',
  initials: 'CH',
}

export const roleNames: Record<SchoolRole, { fr: string; en: string }> = {
  direction: { fr: 'Direction', en: 'Administration' },
  secretariat: { fr: 'Secrétariat', en: 'School office' },
  accountant: { fr: 'Comptabilité', en: 'Accounting' },
  teacher: { fr: 'Enseignant', en: 'Teacher' },
  parent: { fr: 'Parent', en: 'Parent' },
  student: { fr: 'Élève', en: 'Student' },
}

export const stats = [
  { key: 'students', value: '1 248', change: '+4,8%', tone: 'navy' },
  { key: 'attendance', value: '94,2 %', change: '+1,2%', tone: 'teal' },
  { key: 'pending', value: '18', change: 'À valider', tone: 'amber' },
  { key: 'collections', value: '8,4 M', change: 'FCFA ce mois', tone: 'green' },
]

export const classes = [
  { name: '6e A', level: 'Premier cycle', students: 42, teacher: 'Mme Chantal Mvondo', attendance: 96, color: 'blue' },
  { name: '3e C', level: 'Premier cycle', students: 38, teacher: 'M. Serge Tchoumi', attendance: 91, color: 'teal' },
  { name: '2nde C', level: 'Second cycle · Général', students: 35, teacher: 'Mme Mireille Nguemo', attendance: 94, color: 'violet' },
  { name: '1ère D', level: 'Second cycle · Général', students: 32, teacher: 'M. Alain Fotso', attendance: 89, color: 'amber' },
]

export const activities = [
  { name: 'Notes de mathématiques', detail: '1ère D · M. Alain Fotso', time: 'Il y a 12 min', kind: 'note' },
  { name: 'Nouvelle pré-inscription', detail: 'Famille Ngono · 6e', time: 'Il y a 48 min', kind: 'student' },
  { name: 'Paiement de scolarité reçu', detail: 'Kevin Mballa · 3e C', time: 'Aujourd’hui, 09:32', kind: 'payment' },
]

export const schedule = [
  { time: '07:30', subject: 'Mathématiques', className: '3e C', room: 'Salle 12', teacher: 'M. Tchoumi' },
  { time: '09:30', subject: 'Physique', className: '1ère D', room: 'Labo sciences', teacher: 'Mme Nguemo' },
  { time: '11:00', subject: 'Français', className: '2nde C', room: 'Salle 08', teacher: 'M. Fotso' },
]

export const feeStatus = [
  { label: 'À jour', value: 68, color: 'bg-teal-600' },
  { label: 'Partiel', value: 21, color: 'bg-amber-400' },
  { label: 'En retard', value: 11, color: 'bg-rose-400' },
]
