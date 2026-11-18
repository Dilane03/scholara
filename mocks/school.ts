export type SchoolRole = 'super_admin' | 'principal' | 'censor' | 'secretary' | 'accountant' | 'head_teacher' | 'teacher' | 'department_head' | 'parent' | 'student'
export type Language = 'fr' | 'en'
export type Section = 'overview' | 'students' | 'classes' | 'attendance' | 'grades' | 'bulletins' | 'finance' | 'communication' | 'resources' | 'documents' | 'users' | 'audit' | 'settings'

export const school = { name: 'Collège Les Horizons', location: 'Yaoundé, Cameroun', year: '2025–2026', initials: 'CH' }

export const roleNames: Record<SchoolRole, { fr: string; en: string }> = {
  super_admin: { fr: 'Administrateur général', en: 'General administrator' }, principal: { fr: 'Directeur / Principal', en: 'Principal' }, censor: { fr: 'Censeur', en: 'Censor' }, secretary: { fr: 'Secrétaire', en: 'Secretary' }, accountant: { fr: 'Comptable', en: 'Accountant' }, head_teacher: { fr: 'Professeur principal', en: 'Head teacher' }, teacher: { fr: 'Enseignant', en: 'Teacher' }, department_head: { fr: 'Chef de département', en: 'Department head' }, parent: { fr: 'Parent', en: 'Parent' }, student: { fr: 'Élève', en: 'Student' },
}

export const roleSections: Record<SchoolRole, Section[]> = {
  super_admin: ['overview','students','classes','attendance','grades','bulletins','finance','communication','resources','documents','users','audit','settings'],
  principal: ['overview','students','classes','attendance','grades','bulletins','finance','communication','documents','users','audit','settings'],
  censor: ['overview','students','classes','attendance','grades','bulletins','communication','documents'],
  secretary: ['overview','students','classes','attendance','communication','documents'],
  accountant: ['overview','students','finance','documents'],
  head_teacher: ['overview','classes','attendance','grades','bulletins','communication','resources'],
  teacher: ['overview','classes','attendance','grades','communication','resources'],
  department_head: ['overview','classes','grades','resources'],
  parent: ['overview','attendance','bulletins','finance','communication','resources'],
  student: ['overview','attendance','grades','resources','communication'],
}

export const stats = [
  { key: 'studentsEnrolled', value: '1 248', change: '+4,8 %', tone: 'navy' },
  { key: 'attendanceRate', value: '94,2 %', change: '+1,2 %', tone: 'teal' },
  { key: 'gradesPending', value: '18', change: 'À valider', tone: 'amber' },
  { key: 'collectionsMonth', value: '8,4 M', change: 'FCFA ce mois', tone: 'green' },
]

export const classes = [
  { name: '6e A', stream: 'Premier cycle', students: 42, capacity: 45, teacher: 'Mme Chantal Mvondo', attendance: 96, color: 'blue' },
  { name: '3e C', stream: 'Premier cycle', students: 38, capacity: 40, teacher: 'M. Serge Tchoumi', attendance: 91, color: 'teal' },
  { name: '2nde C', stream: 'Second cycle · Général', students: 35, capacity: 40, teacher: 'Mme Mireille Nguemo', attendance: 94, color: 'violet' },
  { name: '1ère D', stream: 'Second cycle · Général', students: 32, capacity: 36, teacher: 'M. Alain Fotso', attendance: 89, color: 'amber' },
  { name: 'Tle F3', stream: 'Technique · Électrotechnique', students: 27, capacity: 30, teacher: 'M. Patrick Mbarga', attendance: 92, color: 'teal' },
  { name: '2nde G1', stream: 'Technique · Comptabilité', students: 31, capacity: 32, teacher: 'Mme Odette Fokam', attendance: 90, color: 'blue' },
]

export const students = [
  { id: 'CEH-25-00418', name: 'Kevin Mballa', className: '3e C', stream: 'Général', guardian: 'M. Jean Mballa', phone: '+237 6 99 21 44 08', status: 'Actif', fees: 'À jour' },
  { id: 'CEH-25-00417', name: 'Grâce Ngono', className: '6e A', stream: 'Général', guardian: 'Mme Solange Ngono', phone: '+237 6 77 42 16 90', status: 'Dossier incomplet', fees: 'Partiel' },
  { id: 'CEH-25-00416', name: 'Brice Tchinda', className: 'Tle F3', stream: 'Électrotechnique', guardian: 'M. André Tchinda', phone: '+237 6 75 88 30 12', status: 'Actif', fees: 'En retard' },
  { id: 'CEH-25-00415', name: 'Esther Nguemo', className: '2nde C', stream: 'Général', guardian: 'Mme Mireille Nguemo', phone: '+237 6 90 55 32 11', status: 'Pré-inscription', fees: '—' },
  { id: 'CEH-25-00414', name: 'Yannick Fotso', className: '1ère D', stream: 'Général', guardian: 'M. Alain Fotso', phone: '+237 6 78 44 09 21', status: 'Actif', fees: 'Partiel' },
  { id: 'CEH-25-00413', name: 'Arielle Mbarga', className: '2nde G1', stream: 'Comptabilité', guardian: 'Mme Aline Mbarga', phone: '+237 6 94 11 06 72', status: 'Actif', fees: 'À jour' },
  { id: 'CEH-25-00412', name: 'Samuel Njoya', className: '6e A', stream: 'Général', guardian: 'M. Paul Njoya', phone: '+237 6 71 28 64 51', status: 'Dossier incomplet', fees: 'En retard' },
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
  { label: 'À jour', value: 68, color: 'bg-teal-600' }, { label: 'Partiel', value: 21, color: 'bg-amber-400' }, { label: 'En retard', value: 11, color: 'bg-rose-400' },
]

export const attendanceRoster = students.slice(0, 7).map((student, index) => ({ ...student, presence: (['present', 'present', 'late', 'absent', 'present', 'present', 'unmarked'] as const)[index] }))
export const evaluations = [
  { student: 'Kevin Mballa', subject: 'Mathématiques', assessment: 'Composition 1', value: '15/20', status: 'Provisoire' },
  { student: 'Grâce Ngono', subject: 'Mathématiques', assessment: 'Composition 1', value: '12/20', status: 'Provisoire' },
  { student: 'Brice Tchinda', subject: 'Mathématiques', assessment: 'Composition 1', value: 'Absent', status: 'Provisoire' },
  { student: 'Esther Nguemo', subject: 'Mathématiques', assessment: 'Composition 1', value: '17/20', status: 'Validée' },
]
export const announcements = [
  { title: 'Réunion des parents d’élèves', audience: 'Toutes les classes', date: '18/11/2025', urgent: true, body: 'La réunion trimestrielle se tiendra samedi 22 novembre à 9 h dans la salle polyvalente.' },
  { title: 'Calendrier des compositions', audience: 'Second cycle', date: '17/11/2025', urgent: false, body: 'Le calendrier des compositions du premier trimestre est disponible au secrétariat.' },
  { title: 'Rappel des frais du trimestre', audience: 'Familles concernées', date: '15/11/2025', urgent: false, body: 'Merci de vous rapprocher de la comptabilité pour régulariser les échéances du trimestre.' },
]
export const payments = [
  { receipt: 'REC-25-01842', student: 'Kevin Mballa', reason: 'Tranche 2 · Scolarité', amount: 125000, method: 'Mobile Money', date: '18/11/2025', status: 'Confirmé' },
  { receipt: 'REC-25-01841', student: 'Grâce Ngono', reason: 'Frais d’inscription', amount: 50000, method: 'Espèces', date: '18/11/2025', status: 'En attente' },
  { receipt: 'REC-25-01840', student: 'Brice Tchinda', reason: 'Tranche 1 · Scolarité', amount: 175000, method: 'Virement', date: '17/11/2025', status: 'Confirmé' },
  { receipt: 'REC-25-01839', student: 'Yannick Fotso', reason: 'Frais d’examen', amount: 25000, method: 'Chèque', date: '17/11/2025', status: 'Confirmé' },
]
