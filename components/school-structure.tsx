'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, GraduationCap, Plus, ShieldCheck, Users, X } from 'lucide-react'
import { classes, schedule, students, type SchoolRole } from '@/mocks/school'
import { translations } from '@/mocks/translations'
import { schoolApi } from '@/lib/api'
import { ConfirmDialog, StatCard, StatusBadge, EmptyState } from '@/components/school-ui'

type Copy = { [Key in keyof typeof translations.fr]: string }
type RequestStatus = 'En attente' | 'Acceptée' | 'Refusée'
type ExceptionRequest = { id: string; student: string; className: string; reason: string; status: RequestStatus }
type StructureTab = 'classes' | 'subjects' | 'teachers' | 'timetable' | 'assignments'
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const subjects = ['Mathématiques', 'Français', 'Anglais', 'Physique', 'Chimie', 'Informatique', 'Électrotechnique', 'Comptabilité', 'Histoire-Géographie']
const teachers = ['Mme Chantal Mvondo', 'M. Serge Tchoumi', 'Mme Mireille Nguemo', 'M. Alain Fotso', 'M. Patrick Mbarga', 'Mme Odette Fokam']
const defaultRequests: ExceptionRequest[] = [
  { id: 'DER-25-014', student: 'Arielle Mbarga', className: '6e A', reason: 'Maintenir la fratrie dans le même établissement', status: 'En attente' },
  { id: 'DER-25-013', student: 'Brice Tchinda', className: 'Tle F3', reason: 'Redoublement avec accord du conseil', status: 'Acceptée' },
  { id: 'DER-25-012', student: 'Samuel Njoya', className: '3e C', reason: 'Capacité dépassée', status: 'Refusée' },
]
const timetable = [
  { day: 'Lundi', time: '07:30', subject: 'Mathématiques', className: '3e C', room: 'Salle 12', teacher: 'M. Serge Tchoumi' },
  { day: 'Lundi', time: '09:30', subject: 'Physique', className: '1ère D', room: 'Labo sciences', teacher: 'Mme Mireille Nguemo' },
  { day: 'Mardi', time: '08:30', subject: 'Français', className: '2nde C', room: 'Salle 08', teacher: 'M. Alain Fotso' },
  { day: 'Mercredi', time: '10:00', subject: 'Électrotechnique', className: 'Tle F3', room: 'Atelier 2', teacher: 'M. Patrick Mbarga' },
  { day: 'Jeudi', time: '07:30', subject: 'Comptabilité', className: '2nde G1', room: 'Salle 16', teacher: 'Mme Odette Fokam' },
  { day: 'Vendredi', time: '11:00', subject: 'Mathématiques', className: '6e A', room: 'Salle 04', teacher: 'Mme Chantal Mvondo' },
]
const tabs: { id: StructureTab; fr: string; en: string }[] = [
  { id: 'classes', fr: 'Classes & filières', en: 'Classes & programs' }, { id: 'subjects', fr: 'Matières', en: 'Subjects' },
  { id: 'teachers', fr: 'Enseignants', en: 'Teachers' }, { id: 'timetable', fr: 'Emploi du temps', en: 'Timetable' }, { id: 'assignments', fr: 'Affectations', en: 'Assignments' },
]

export function SchoolStructure({ t, role, language, notify }: { t: Copy; role: SchoolRole; language: 'fr' | 'en'; notify: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState<StructureTab>('classes')
  const [requests, setRequests] = useState(defaultRequests)
  const [classData, setClassData] = useState(classes)
  const [subjectData, setSubjectData] = useState(subjects)
  const [teacherData, setTeacherData] = useState(teachers.map((teacher, index) => ({ teacher, subject: subjects[index], className: classes[index]?.name ?? classes[0].name })))
  const [assignedStudents, setAssignedStudents] = useState<Set<string>>(new Set())
  const [createType, setCreateType] = useState<'class' | 'subject' | 'assignment' | null>(null)
  const [pendingDecision, setPendingDecision] = useState<{ id: string; status: Exclude<RequestStatus, 'En attente'> } | null>(null)
  const [createDraft, setCreateDraft] = useState({ name: '', stream: 'Premier cycle', capacity: '40', teacher: teachers[0], subject: subjects[0], className: classes[0].name })
  const [selectedClass, setSelectedClass] = useState('6e A')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [reason, setReason] = useState('')
  const [day, setDay] = useState('Lundi')
  const [weekOffset, setWeekOffset] = useState(0)
  const [busy, setBusy] = useState(false)
  const isApprover = ['principal', 'super_admin'].includes(role)
  const canAssign = ['secretary', 'principal', 'super_admin'].includes(role)
  const visibleTabs = tabs.filter((item) => item.id !== 'assignments' || canAssign || isApprover)
  const pendingCount = requests.filter((item) => item.status === 'En attente').length
  const classItem = classData.find((item) => item.name === selectedClass) ?? classData[0]
  const roster = useMemo(() => students.filter((student) => !assignedStudents.has(student.name) && !requests.some((request) => request.student === student.name && request.status === 'En attente')), [requests, assignedStudents])
  const notifyInLanguage = (fr: string, en: string) => notify(language === 'fr' ? fr : en)

  const requestAssignment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedStudent) return
    if (classItem.students < classItem.capacity) {
      setBusy(true)
      try {
        await schoolApi.assignStudent({ student: selectedStudent, className: selectedClass })
        setAssignedStudents((current) => new Set(current).add(selectedStudent))
        setClassData((current) => current.map((item) => item.name === selectedClass ? { ...item, students: Math.min(item.capacity, item.students + 1) } : item))
        notifyInLanguage(`${selectedStudent} affecté(e) en ${selectedClass}.`, `${selectedStudent} assigned to ${selectedClass}.`)
        setSelectedStudent(''); setReason('')
      } catch { notify(t.errorGeneric) } finally { setBusy(false) }
      return
    }
    if (!reason.trim()) return
    setBusy(true)
    try {
      const created = await schoolApi.createAssignmentRequest({ student: selectedStudent, className: selectedClass, reason })
      setRequests((current) => [{ id: created.id, student: selectedStudent, className: selectedClass, reason, status: 'En attente' }, ...current])
      notify(t.exceptionSent); setSelectedStudent(''); setReason(''); setActiveTab('assignments')
    } catch { notify(t.errorGeneric) } finally { setBusy(false) }
  }
  const decide = async (id: string, status: Exclude<RequestStatus, 'En attente'>) => {
    try {
      await schoolApi.updateAssignmentRequest(id, status)
      const request = requests.find((item) => item.id === id)
      setRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item))
      if (status === 'Acceptée' && request) {
        setAssignedStudents((current) => new Set(current).add(request.student))
        setClassData((current) => current.map((item) => item.name === request.className ? { ...item, students: item.students + 1 } : item))
      }
      notifyInLanguage(status === 'Acceptée' ? 'Dérogation acceptée.' : 'Dérogation refusée.', status === 'Acceptée' ? 'Exception accepted.' : 'Exception declined.')
    } catch { notify(t.errorGeneric) }
  }
  const saveStructureEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!createType || busy) return
    setBusy(true)
    try {
      if (createType === 'class') {
        const name = createDraft.name.trim()
        const capacity = Number(createDraft.capacity)
        if (!name || !Number.isInteger(capacity) || capacity < 1 || classData.some((item) => item.name.toLowerCase() === name.toLowerCase())) return
        await schoolApi.createClass({ name, stream: createDraft.stream, capacity, teacher: createDraft.teacher })
        setClassData((current) => [{ name, stream: createDraft.stream, students: 0, capacity, teacher: createDraft.teacher, attendance: 0, color: 'blue' }, ...current])
        notifyInLanguage(`Classe ${name} créée.`, `Class ${name} created.`)
      } else if (createType === 'subject') {
        const name = createDraft.name.trim()
        if (!name || subjectData.some((item) => item.toLowerCase() === name.toLowerCase())) return
        await schoolApi.createSubject({ name, stream: createDraft.stream })
        setSubjectData((current) => [...current, name])
        notifyInLanguage(`Matière ${name} ajoutée.`, `Subject ${name} added.`)
      } else {
        await schoolApi.createTeacherAssignment({ teacher: createDraft.teacher, subject: createDraft.subject, className: createDraft.className })
        setTeacherData((current) => [...current, { teacher: createDraft.teacher, subject: createDraft.subject, className: createDraft.className }])
        notifyInLanguage('Affectation enregistrée.', 'Teacher assignment saved.')
      }
      setCreateType(null); setCreateDraft((current) => ({ ...current, name: '' }))
    } catch { notify(t.errorGeneric) } finally { setBusy(false) }
  }
  const downloadTimetable = () => {
    const rows = timetable.map((item) => `${item.day};${item.time};${item.className};${item.subject};${item.room};${item.teacher}`).join('\r\n')
    const url = URL.createObjectURL(new Blob(['Jour;Heure;Classe;Matière;Salle;Enseignant\r\n', rows], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'emploi-du-temps.csv'; link.click(); URL.revokeObjectURL(url)
  }
  const dateLabel = new Date(2025, 10, 17 + weekOffset * 7).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return <>
    <div className="stats-grid compact-stats"><StatCard label={t.classLabel} value="32" detail={language === 'fr' ? 'Général et technique' : 'General and technical'} tone="navy" icon={GraduationCap}/><StatCard label={t.studentsEnrolled} value="1 248" detail={language === 'fr' ? 'Effectifs affectés' : 'Assigned students'} tone="teal" icon={Users}/><StatCard label={t.pendingAssignments} value={String(pendingCount)} detail={language === 'fr' ? 'Dérogations à traiter' : 'Exceptions to review'} tone="amber" icon={Clock3}/><StatCard label={t.assignments} value="84" detail={language === 'fr' ? 'Enseignants affectés' : 'Teacher assignments'} tone="green" icon={ShieldCheck}/></div>
    <section className="panel"><div className="structure-tabs" role="tablist" aria-label={t.structureTitle}>{visibleTabs.map((item) => <button key={item.id} role="tab" aria-selected={activeTab === item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => setActiveTab(item.id)}>{language === 'fr' ? item.fr : item.en}{item.id === 'assignments' && pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}</button>)}</div>
      {activeTab === 'classes' && <div className="structure-content"><div className="panel-heading"><div><h2>{t.structureTitle}</h2><p>{language === 'fr' ? 'Effectifs, capacités et filières de l’établissement' : 'School enrollment, capacity and programs'}</p></div>{['principal', 'super_admin'].includes(role) && <button className="button-secondary" onClick={() => setCreateType('class')}><Plus/>{language === 'fr' ? 'Nouvelle classe' : 'New class'}</button>}</div><div className="class-cards">{classData.map((item) => <article className="class-detail-card" key={item.name}><div className="class-card-top"><span className={`class-avatar ${item.color}`}><GraduationCap/></span><StatusBadge value={item.students >= item.capacity ? (language === 'fr' ? 'Complet' : 'Full') : (language === 'fr' ? 'Places disponibles' : 'Seats available')}/></div><h3>{item.name}</h3><p>{item.stream}</p><div className="capacity-row"><span>{item.students} / {item.capacity} {t.studentsCount}</span><b>{Math.round(item.students / item.capacity * 100)}%</b></div><div className="progress-track"><span style={{ width: `${Math.min(100, item.students / item.capacity * 100)}%` }}/></div><small>{t.teacher} · {item.teacher}</small>{canAssign && <button className="text-action" onClick={() => { setSelectedClass(item.name); setActiveTab('assignments') }}>{language === 'fr' ? 'Affecter un élève' : 'Assign a student'}<ChevronRight/></button>}</article>)}</div></div>}
      {activeTab === 'subjects' && <div className="structure-content"><div className="panel-heading"><div><h2>{language === 'fr' ? 'Matières enseignées' : 'Subjects taught'}</h2><p>{language === 'fr' ? 'Répartition par cycle et par filière' : 'Distribution by cycle and program'}</p></div>{['principal', 'super_admin', 'department_head'].includes(role) && <button className="button-secondary" onClick={() => setCreateType('subject')}><Plus/>{language === 'fr' ? 'Ajouter une matière' : 'Add subject'}</button>}</div><div className="subject-grid">{subjectData.map((subject, index) => <article className="subject-card" key={subject}><span className="subject-index">{String(index + 1).padStart(2, '0')}</span><div><b>{subject}</b><small>{index > 5 ? 'Filières techniques' : 'Enseignement général'}</small></div><span className="level-pill">{index > 5 ? 'Technique' : 'Général'}</span></article>)}</div></div>}
      {activeTab === 'teachers' && <div className="structure-content"><div className="panel-heading"><div><h2>{language === 'fr' ? 'Enseignants & affectations' : 'Teachers & assignments'}</h2><p>{language === 'fr' ? 'Classes principales et matières attribuées' : 'Head classes and assigned subjects'}</p></div>{['principal', 'super_admin', 'department_head'].includes(role) && <button className="button-secondary" onClick={() => setCreateType('assignment')}><Plus/>{language === 'fr' ? 'Nouvelle affectation' : 'New assignment'}</button>}</div><div className="table-scroll"><table><thead><tr><th>{t.teacher}</th><th>{language === 'fr' ? 'Matière' : 'Subject'}</th><th>{t.classLabel}</th><th>{language === 'fr' ? 'Rôle' : 'Role'}</th></tr></thead><tbody>{teacherData.map((assignment, index) => <tr key={`${assignment.teacher}-${assignment.subject}-${assignment.className}`}><td><b>{assignment.teacher}</b></td><td>{assignment.subject}</td><td>{assignment.className}</td><td><StatusBadge value={index % 2 ? (language === 'fr' ? 'Enseignant' : 'Teacher') : (language === 'fr' ? 'Professeur principal' : 'Head teacher')}/></td></tr>)}</tbody></table></div></div>}
      {activeTab === 'timetable' && <div className="structure-content"><div className="timetable-toolbar"><div><h2>{language === 'fr' ? 'Emploi du temps hebdomadaire' : 'Weekly timetable'}</h2><p>{language === 'fr' ? 'Semaine du' : 'Week of'} {dateLabel}</p></div><div className="table-actions"><button className="icon-button" aria-label={language === 'fr' ? 'Semaine précédente' : 'Previous week'} onClick={() => setWeekOffset((value) => value - 1)}><ChevronLeft/></button><button className="icon-button" aria-label={language === 'fr' ? 'Semaine suivante' : 'Next week'} onClick={() => setWeekOffset((value) => value + 1)}><ChevronRight/></button><button className="button-secondary" onClick={downloadTimetable}><CalendarDays/>{t.export}</button></div></div><div className="day-tabs" role="tablist" aria-label={language === 'fr' ? 'Jour de la semaine' : 'Weekday'}>{days.map((item) => <button key={item} className={day === item ? 'active' : ''} onClick={() => setDay(item)}>{language === 'fr' ? item : ({ Lundi: 'Monday', Mardi: 'Tuesday', Mercredi: 'Wednesday', Jeudi: 'Thursday', Vendredi: 'Friday' }[item])}</button>)}</div><div className="schedule-list">{timetable.filter((item) => item.day === day).map((item, index) => <div className="schedule-row" key={`${item.day}-${item.time}`}><div className="schedule-time"><b>{item.time}</b></div><div className={`schedule-color color-${index % 3}`}/><div className="schedule-content"><b>{item.subject} · {item.className}</b><small>{item.room} · {item.teacher}</small></div><StatusBadge value={language === 'fr' ? 'Programmé' : 'Scheduled'}/></div>)}{timetable.every((item) => item.day !== day) && <EmptyState title={language === 'fr' ? 'Aucun cours planifié' : 'No lessons scheduled'} hint={language === 'fr' ? 'Aucun cours pour ce jour.' : 'No lessons for this day.'}/>}</div></div>}
      {activeTab === 'assignments' && <div className="structure-content"><div className="panel-heading"><div><h2>{language === 'fr' ? 'Affectation des élèves en classe' : 'Assign students to classes'}</h2><p>{language === 'fr' ? 'Une demande de dérogation est requise lorsque la classe est complète.' : 'An exception request is required when a class is full.'}</p></div></div><form className="assignment-form" onSubmit={(event) => void requestAssignment(event)}><label>{t.studentName}<select required value={selectedStudent} onChange={(event) => setSelectedStudent(event.target.value)}><option value="">{language === 'fr' ? 'Choisir un élève' : 'Select a student'}</option>{roster.map((student) => <option key={student.id} value={student.name}>{student.name} · {student.id}</option>)}</select></label><label>{t.classLabel}<select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>{classData.map((item) => <option key={item.name} value={item.name}>{item.name} · {item.students}/{item.capacity}</option>)}</select></label>{classItem.students >= classItem.capacity && <label className="assignment-reason">{language === 'fr' ? 'Motif de dérogation' : 'Reason for exception'}<input required value={reason} onChange={(event) => setReason(event.target.value)} placeholder={language === 'fr' ? 'Expliquez la demande' : 'Explain the request'}/></label>}<button className="button-primary" type="submit" disabled={busy || !selectedStudent}>{busy ? t.loading : classItem.students >= classItem.capacity ? t.requestException : language === 'fr' ? 'Affecter en classe' : 'Assign to class'}</button></form>{classItem.students >= classItem.capacity && <p className="form-section-note">{language === 'fr' ? `${selectedClass} est complète (${classItem.students}/${classItem.capacity}). Toute dérogation attend la décision du directeur.` : `${selectedClass} is full (${classItem.students}/${classItem.capacity}). Exceptions require principal approval.`}</p>}<div className="request-list-heading"><h3>{language === 'fr' ? 'Demandes de dérogation' : 'Exception requests'}</h3><span>{pendingCount} {language === 'fr' ? 'en attente' : 'pending'}</span></div><div className="table-scroll"><table><thead><tr><th>{language === 'fr' ? 'Référence' : 'Reference'}</th><th>{t.studentName}</th><th>{t.classLabel}</th><th>{language === 'fr' ? 'Motif' : 'Reason'}</th><th>{t.status}</th><th>{t.actions}</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td><b className="mono-id">{request.id}</b></td><td>{request.student}</td><td>{request.className}</td><td>{request.reason}</td><td><StatusBadge value={language === 'fr' ? request.status : request.status === 'En attente' ? 'Pending' : request.status === 'Acceptée' ? 'Accepted' : 'Declined'}/></td><td>{request.status === 'En attente' && isApprover ? <div className="decision-actions"><button className="button-secondary" onClick={() => setPendingDecision({ id: request.id, status: 'Acceptée' })} aria-label={language === 'fr' ? 'Accepter la demande' : 'Approve request'}><Check/></button><button className="button-secondary" onClick={() => setPendingDecision({ id: request.id, status: 'Refusée' })} aria-label={language === 'fr' ? 'Refuser la demande' : 'Decline request'}><X/></button></div> : <span className="table-muted">{request.status === 'En attente' ? (language === 'fr' ? 'Décision du directeur requise' : 'Principal decision required') : '—'}</span>}</td></tr>)}</tbody></table>{requests.length === 0 && <EmptyState title={t.noData} hint={t.noResultsHint}/>}</div></div>}
    </section>
    {createType && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateType(null) }}><section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="structure-editor-title"><div className="dialog-heading"><div><h2 id="structure-editor-title">{createType === 'class' ? (language === 'fr' ? 'Créer une classe' : 'Create class') : createType === 'subject' ? (language === 'fr' ? 'Ajouter une matière' : 'Add subject') : (language === 'fr' ? 'Affecter un enseignant' : 'Assign a teacher')}</h2><p>{language === 'fr' ? 'Les changements sont enregistrés dans le module de structure.' : 'Changes are saved in the school structure module.'}</p></div><button className="icon-button" aria-label={language === 'fr' ? 'Fermer' : 'Close'} onClick={() => setCreateType(null)}><X/></button></div><form className="inline-form" onSubmit={(event) => void saveStructureEntry(event)}>{createType !== 'assignment' ? <label>{createType === 'class' ? t.classLabel : language === 'fr' ? 'Nom de la matière' : 'Subject name'}<input required value={createDraft.name} onChange={(event) => setCreateDraft((current) => ({ ...current, name: event.target.value }))}/></label> : <label>{t.teacher}<select value={createDraft.teacher} onChange={(event) => setCreateDraft((current) => ({ ...current, teacher: event.target.value }))}>{teachers.map((teacher) => <option key={teacher}>{teacher}</option>)}</select></label>}{createType !== 'assignment' && <label>{language === 'fr' ? 'Filière / cycle' : 'Program / cycle'}<select value={createDraft.stream} onChange={(event) => setCreateDraft((current) => ({ ...current, stream: event.target.value }))}><option>Premier cycle</option><option>Second cycle · Général</option><option>Technique · Électrotechnique</option><option>Technique · Comptabilité</option></select></label>}{createType === 'class' && <><label>{t.capacity}<input type="number" min="1" max="100" required value={createDraft.capacity} onChange={(event) => setCreateDraft((current) => ({ ...current, capacity: event.target.value }))}/></label><label>{t.teacher}<select value={createDraft.teacher} onChange={(event) => setCreateDraft((current) => ({ ...current, teacher: event.target.value }))}>{teachers.map((teacher) => <option key={teacher}>{teacher}</option>)}</select></label></>}{createType === 'assignment' && <><label>{language === 'fr' ? 'Matière' : 'Subject'}<select value={createDraft.subject} onChange={(event) => setCreateDraft((current) => ({ ...current, subject: event.target.value }))}>{subjectData.map((subject) => <option key={subject}>{subject}</option>)}</select></label><label>{t.classLabel}<select value={createDraft.className} onChange={(event) => setCreateDraft((current) => ({ ...current, className: event.target.value }))}>{classData.map((item) => <option key={item.name}>{item.name}</option>)}</select></label></>}<div className="dialog-actions"><button type="button" className="button-secondary" onClick={() => setCreateType(null)}>{t.cancel}</button><button className="button-primary" type="submit" disabled={busy}>{busy ? t.loading : language === 'fr' ? 'Enregistrer' : 'Save'}</button></div></form></section></div>}
    {pendingDecision && <ConfirmDialog title={language === 'fr' ? 'Confirmer la décision' : 'Confirm decision'} message={language === 'fr' ? `Confirmer la décision « ${pendingDecision.status.toLowerCase()} » pour cette demande de dérogation ?` : `Confirm ${pendingDecision.status.toLowerCase()} for this exception request?`} confirmLabel={language === 'fr' ? 'Confirmer' : 'Confirm'} cancelLabel={t.cancel} onCancel={() => setPendingDecision(null)} onConfirm={() => { const decision = pendingDecision; setPendingDecision(null); void decide(decision.id, decision.status) }}/ >}
  </>
}
