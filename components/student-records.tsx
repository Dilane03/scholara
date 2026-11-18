'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import readXlsxFile from 'read-excel-file/browser'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, LockKeyhole, Search, Upload, UserRound, X } from 'lucide-react'
import { classes, evaluations, students, type Language, type SchoolRole } from '@/mocks/school'
import { translations } from '@/mocks/translations'
import { schoolApi } from '@/lib/api'
import { FormStepper, StatCard, StatusBadge, EmptyState } from '@/components/school-ui'

const pageSize = 5
const permittedHealthRoles: SchoolRole[] = ['principal', 'censor', 'super_admin']
type Student = (typeof students)[number]
type Copy = { [Key in keyof typeof translations.fr]: string }
type StudentTab = 'identity' | 'school' | 'documents' | 'attendance' | 'grades' | 'finance' | 'history' | 'health'
type EnrollmentDraft = Record<string, string | boolean | string[]>
type ImportRow = { line: number; name: string; className: string; stream: string; guardian: string; phone: string; errors: string[] }

const tabs: { key: StudentTab; fr: string; en: string }[] = [
  { key: 'identity', fr: 'Identité', en: 'Identity' }, { key: 'school', fr: 'Scolarité', en: 'Schooling' },
  { key: 'documents', fr: 'Documents', en: 'Documents' }, { key: 'attendance', fr: 'Absences', en: 'Attendance' },
  { key: 'grades', fr: 'Notes', en: 'Grades' }, { key: 'finance', fr: 'Finances', en: 'Finance' },
  { key: 'history', fr: 'Historique', en: 'History' }, { key: 'health', fr: 'Santé', en: 'Health' },
]
const enrollmentSteps = [
  { fr: 'Identité', en: 'Identity' }, { fr: 'Contacts', en: 'Contacts' }, { fr: 'Scolarité antérieure', en: 'Previous schooling' },
  { fr: 'Tuteurs', en: 'Guardians' }, { fr: 'Urgence', en: 'Emergency' }, { fr: 'Documents', en: 'Documents' },
]
const requiredDocuments = ['Acte de naissance', 'Bulletins de l’année précédente', 'Photo 4×4', 'Certificat de scolarité']
const emptyDraft: EnrollmentDraft = { matricule: '', firstName: '', lastName: '', birthDate: '', gender: 'Féminin', email: '', phone: '', previousSchool: '', previousClass: '', targetClass: '6e A', stream: 'Général', guardian1: '', guardian1Phone: '', guardian2: '', guardian2Phone: '', emergencyName: '', emergencyPhone: '', documents: [], provisional: true }
function parseCsv(text: string): unknown[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index++ }
    else if (char === '"') quoted = !quoted
    else if (!quoted && (char === ';' || char === ',' || char === '\\t')) { row.push(cell.trim()); cell = '' }
    else if (!quoted && (char === '\\n' || char === '\\r')) { if (char === '\\r' && text[index + 1] === '\\n') index++; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = '' }
    else cell += char
  }
  if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row) }
  return rows
}

export function StudentRecords({ t, language, role, search, setSearch, notify }: { t: Copy; language: Language; role: SchoolRole; search: string; setSearch: (value: string) => void; notify: (message: string) => void }) {
  const [records, setRecords] = useState<Student[]>(students)
  const [classFilter, setClassFilter] = useState('')
  const [streamFilter, setStreamFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Student | null>(null)
  const [enrollmentOpen, setEnrollmentOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const filtered = useMemo(() => records.filter((student) => {
    const matchesQuery = `${student.name} ${student.id} ${student.className} ${student.guardian} ${student.phone}`.toLowerCase().includes(search.trim().toLowerCase())
    return matchesQuery && (!classFilter || student.className === classFilter) && (!streamFilter || student.stream === streamFilter) && (!statusFilter || student.status === statusFilter)
  }), [records, search, classFilter, streamFilter, statusFilter])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => { setPage(1) }, [search, classFilter, streamFilter, statusFilter])

  const exportRecords = () => {
    const headings = ['Matricule', 'Élève', 'Classe', 'Filière', 'Responsable', 'Téléphone', 'Statut']
    const csv = [headings, ...filtered.map((s) => [s.id, s.name, s.className, s.stream, s.guardian, s.phone, s.status])]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'dossiers-eleves.csv'; link.click(); URL.revokeObjectURL(url)
  }
  const createStudent = async (draft: EnrollmentDraft) => {
    const payload = { ...draft, documents: draft.documents, provisional: Boolean(draft.provisional) }
    const response = await schoolApi.createPreEnrollment({ ...payload, matricule: String(draft.matricule) })
    const name = `${draft.firstName} ${draft.lastName}`.trim()
    const item: Student = { id: response.id, name, className: String(draft.targetClass), stream: String(draft.stream), guardian: String(draft.guardian1), phone: String(draft.guardian1Phone), status: draft.provisional && (draft.documents as string[]).length < requiredDocuments.length ? 'Pré-inscription' : 'Actif', fees: '—' }
    setRecords((current) => [item, ...current])
    notify(language === 'fr' ? `Pré-inscription créée · ${response.id}` : `Pre-enrollment created · ${response.id}`)
  }

  return <>
    <div className="stats-grid compact-stats"><StatCard label={t.studentsEnrolled} value="1 248" detail="+42 ce trimestre" tone="navy" icon={UserRound}/><StatCard label={t.enrollmentReview} value="24" detail="Nécessite une vérification" tone="amber" icon={FileText}/><StatCard label={t.incompleteFiles} value="17" detail="Documents manquants" tone="teal" icon={FileSpreadsheet}/><StatCard label={t.pendingAssignments} value="5" detail="Demandes en cours" tone="green" icon={LockKeyhole}/></div>
    <section className="panel student-records-panel">
      <div className="panel-heading"><div><h2>{t.studentList}</h2><p>{language === 'fr' ? 'Dossiers de l’année scolaire active' : 'Student files for the active school year'}</p></div><div className="table-actions">{['secretary', 'principal', 'super_admin'].includes(role) && <button className="button-secondary" onClick={() => setImportOpen(true)}><Upload data-icon="inline-start"/>{t.importExcel}</button>}{role === 'secretary' && <button className="button-primary" onClick={() => setEnrollmentOpen(true)}>{t.newEnrollment}</button>}</div></div>
      <div className="filter-row">
        <label className="table-search"><Search aria-hidden="true"/><input aria-label={t.search} placeholder={t.search} value={search} onChange={(event) => setSearch(event.target.value)}/></label>
        <label><span className="sr-only">{t.classLabel}</span><select aria-label={t.classLabel} value={classFilter} onChange={(event) => setClassFilter(event.target.value)}><option value="">{t.classLabel} · {t.filters}</option>{classes.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
        <label><span className="sr-only">{t.stream}</span><select aria-label={t.stream} value={streamFilter} onChange={(event) => setStreamFilter(event.target.value)}><option value="">{t.stream}</option>{Array.from(new Set(records.map((s) => s.stream))).map((stream) => <option key={stream}>{stream}</option>)}</select></label>
        <label><span className="sr-only">{t.status}</span><select aria-label={t.status} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">{t.status}</option>{Array.from(new Set(records.map((s) => s.status))).map((status) => <option key={status}>{status}</option>)}</select></label>
        <div className="table-actions"><button className="button-secondary" onClick={exportRecords}><Download/>{language === 'fr' ? 'Excel / CSV' : 'Excel / CSV'}</button><button className="button-secondary" onClick={() => window.print()}><FileText/>PDF</button></div>
      </div>
      <div className="table-scroll"><table><thead><tr><th>{t.matricule}</th><th>{t.studentName}</th><th>{t.classLabel}</th><th>{t.stream}</th><th>{t.guardian}</th><th>{t.status}</th><th>{t.actions}</th></tr></thead><tbody>{visible.map((student) => <tr key={student.id}><td><b className="mono-id">{student.id}</b></td><td><button className="student-detail-link" onClick={() => setSelected(student)}>{student.name}</button></td><td>{student.className}</td><td>{student.stream}</td><td>{student.guardian}<small className="table-subline">{student.phone}</small></td><td><StatusBadge value={student.status}/></td><td><button className="table-more" aria-label={`${t.seeDetails} ${student.name}`} onClick={() => setSelected(student)}><ArrowRight/></button></td></tr>)}</tbody></table>{visible.length === 0 && <EmptyState title={t.noResults} hint={t.noResultsHint}/>}</div>
      <div className="table-pagination"><small>{filtered.length ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} / ${filtered.length}` : `0 / 0`} {language === 'fr' ? 'dossiers' : 'files'}</small><div><button aria-label={t.previous} disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft/></button><button className="page-number" aria-current="page">{page} / {pageCount}</button><button aria-label={t.next} disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRight/></button></div></div>
    </section>
    {selected && <StudentDetail student={selected} language={language} role={role} onClose={() => setSelected(null)}/>}
    {enrollmentOpen && <EnrollmentWizard t={t} language={language} onClose={() => setEnrollmentOpen(false)} onCreate={createStudent} notify={notify}/>}
    {importOpen && <StudentImport language={language} onClose={() => setImportOpen(false)} onImport={(items) => { setRecords((current) => [...items, ...current]); notify(language === 'fr' ? `${items.length} dossier(s) importé(s).` : `${items.length} file(s) imported.`); setImportOpen(false) }}/ >}
  </>
}

function EnrollmentWizard({ t, language, onClose, onCreate, notify }: { t: Copy; language: Language; onClose: () => void; onCreate: (draft: EnrollmentDraft) => Promise<void>; notify: (message: string) => void }) {
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<EnrollmentDraft>(emptyDraft)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => { const generated = `CEH-26-${String(Date.now()).slice(-5)}`; try { const saved = window.localStorage.getItem('campus-enrollment-draft'); if (saved) { const restored = JSON.parse(saved) as EnrollmentDraft; setDraft({ ...emptyDraft, ...restored, matricule: String(restored.matricule || generated) }) } else setDraft({ ...emptyDraft, matricule: generated }) } catch { window.localStorage.removeItem('campus-enrollment-draft'); setDraft({ ...emptyDraft, matricule: generated }) } }, [])
  useEffect(() => { window.localStorage.setItem('campus-enrollment-draft', JSON.stringify(draft)) }, [draft])
  const setField = (key: string, value: string | boolean | string[]) => setDraft((current) => ({ ...current, [key]: value }))
  const value = (key: string) => String(draft[key] ?? '')
  const next = () => { if (formRef.current?.reportValidity()) setStep((current) => Math.min(enrollmentSteps.length - 1, current + 1)) }
  const complete = async () => {
    if (busy) return
    setBusy(true)
    try { await onCreate(draft); window.localStorage.removeItem('campus-enrollment-draft'); onClose() }
    catch { notify(t.errorGeneric) }
    finally { setBusy(false) }
  }
  const field = (key: string, label: string, required = false, type = 'text', placeholder = '') => <label key={key}>{label}<input type={type} required={required} placeholder={placeholder} value={value(key)} onChange={(event) => setField(key, event.target.value)}/></label>
  const chosenDocs = (draft.documents as string[]) ?? []
  const stepContent = [
    <div className="enrollment-fields" key="identity">{field('firstName', t.firstName, true, 'text', 'Ex. Arielle')}{field('lastName', t.lastName, true, 'text', 'Ex. Mbarga')}{field('birthDate', t.birthDate, true, 'date')}<label>Sexe<select value={value('gender')} onChange={(event) => setField('gender', event.target.value)}><option>Féminin</option><option>Masculin</option></select></label></div>,
    <div className="enrollment-fields" key="contacts">{field('email', 'E-mail de l’élève', false, 'email')}{field('phone', 'Téléphone de l’élève', false, 'tel', '+237 6…')}<p className="form-section-note">Les coordonnées du ou des tuteurs sont saisies dans les étapes suivantes.</p></div>,
    <div className="enrollment-fields" key="school">{field('previousSchool', t.previousSchool, true)}{field('previousClass', 'Dernière classe fréquentée', true)}<label>{t.classLabel}<select value={value('targetClass')} onChange={(event) => setField('targetClass', event.target.value)}>{classes.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label>{t.stream}<select value={value('stream')} onChange={(event) => setField('stream', event.target.value)}>{Array.from(new Set(classes.map((item) => item.stream))).map((stream) => <option key={stream}>{stream}</option>)}</select></label></div>,
    <div className="enrollment-fields" key="guardians">{field('guardian1', 'Tuteur principal · nom complet', true)}{field('guardian1Phone', 'Téléphone du tuteur principal', true, 'tel', '+237 6…')}{field('guardian2', 'Second tuteur · nom complet')}{field('guardian2Phone', 'Téléphone du second tuteur', false, 'tel', '+237 6…')}</div>,
    <div className="enrollment-fields" key="emergency">{field('emergencyName', 'Contact d’urgence · nom complet', true)}{field('emergencyPhone', 'Téléphone d’urgence', true, 'tel', '+237 6…')}<p className="form-section-note">Ce contact sera utilisé uniquement en cas de nécessité.</p></div>,
    <div className="enrollment-fields" key="documents"><fieldset className="document-checks"><legend>{t.requiredDocuments}</legend>{requiredDocuments.map((document) => <label key={document}><input type="checkbox" checked={chosenDocs.includes(document)} onChange={(event) => setField('documents', event.target.checked ? [...chosenDocs, document] : chosenDocs.filter((item) => item !== document))}/>{document}</label>)}</fieldset><label className="checkbox-label"><input type="checkbox" checked={Boolean(draft.provisional)} onChange={(event) => setField('provisional', event.target.checked)}/>{t.provisionalEnrollment}</label>{chosenDocs.length < requiredDocuments.length && !draft.provisional && <p className="validation-message" role="alert">Veuillez joindre les pièces manquantes ou autoriser l’inscription provisoire.</p>}<label className="matricule-input">{t.matricule}<span><LockKeyhole/><input aria-readonly="true" readOnly value={value('matricule')} /></span></label></div>,
  ]
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="form-dialog enrollment-dialog" role="dialog" aria-modal="true" aria-labelledby="enroll-title"><div className="dialog-heading"><div><h2 id="enroll-title">{t.newEnrollment}</h2><p>{t.draft}</p></div><button className="icon-button" aria-label={language === 'fr' ? 'Fermer' : 'Close'} onClick={onClose}><X/></button></div><FormStepper steps={enrollmentSteps.map((item) => language === 'fr' ? item.fr : item.en)} current={step}/><form ref={formRef} onSubmit={(event) => event.preventDefault()}>{stepContent[step]}<div className="dialog-actions"><button className="button-secondary" type="button" onClick={() => step === 0 ? onClose() : setStep((current) => current - 1)}>{step === 0 ? t.cancel : <><ArrowLeft/>{t.back}</>}</button>{step < enrollmentSteps.length - 1 ? <button className="button-primary" type="button" onClick={next}>{t.continue}<ArrowRight/></button> : <button className="button-primary" type="button" onClick={() => void complete()} disabled={busy || (chosenDocs.length < requiredDocuments.length && !draft.provisional)}>{busy ? t.loading : <><Check/>{t.finishEnrollment}</>}</button>}</div></form></section></div>
}

function StudentDetail({ student, language, role, onClose }: { student: Student; language: Language; role: SchoolRole; onClose: () => void }) {
  const [tab, setTab] = useState<StudentTab>('identity')
  const visibleTabs = tabs.filter((item) => item.key !== 'health' || permittedHealthRoles.includes(role))
  const tabLabel = (item: (typeof tabs)[number]) => language === 'fr' ? item.fr : item.en
  const values: Partial<Record<StudentTab, React.ReactNode>> = {
    identity: <div className="record-grid"><Info label="Matricule" value={student.id}/><Info label={language === 'fr' ? 'Nom complet' : 'Full name'} value={student.name}/><Info label="Classe" value={student.className}/><Info label="Filière" value={student.stream}/><Info label="Responsable" value={student.guardian}/><Info label="Téléphone" value={student.phone}/></div>,
    school: <div className="record-grid"><Info label="Année scolaire" value="2025–2026"/><Info label="Statut" value={student.status}/><Info label="Établissement précédent" value="Collège bilingue de Yaoundé"/><Info label="Classe précédente" value="4e"/></div>,
    documents: <div className="role-action-list">{requiredDocuments.map((item, index) => <div key={item}><FileText/><b>{item}</b><StatusBadge value={index < 3 ? (language === 'fr' ? 'Reçu' : 'Received') : (language === 'fr' ? 'Manquant' : 'Missing')}/></div>)}</div>,
    attendance: <div className="role-action-list"><div><span className="schedule-dot"/><b>12/11/2025</b><span>Absence · Journée complète</span><StatusBadge value="Justifiée"/></div><div><span className="schedule-dot"/><b>06/11/2025</b><span>Retard · 08:12</span><StatusBadge value="En retard"/></div></div>,
    grades: <div className="table-scroll"><table><thead><tr><th>Matière</th><th>Évaluation</th><th>Note</th><th>Statut</th></tr></thead><tbody>{evaluations.filter((item) => item.student === student.name).map((item) => <tr key={item.assessment}><td>{item.subject}</td><td>{item.assessment}</td><td>{item.value}</td><td><StatusBadge value={item.status}/></td></tr>)}</tbody></table></div>,
    finance: <div className="record-grid"><Info label="Situation" value={student.fees}/><Info label="Solde dû" value="125 000 FCFA"/><Info label="Dernier paiement" value="18/11/2025"/><Info label="Reçu" value="REC-25-01842"/></div>,
    history: <div className="role-action-list"><div><span className="schedule-dot"/><b>18/11/2025</b><span>Dossier consulté par le secrétariat</span></div><div><span className="schedule-dot teal-dot"/><b>02/09/2025</b><span>Inscription validée · {student.className}</span></div></div>,
    health: <div className="record-grid"><Info label="Groupe sanguin" value="O+"/><Info label="Allergies connues" value="Aucune déclarée"/><Info label="Personne à contacter" value={student.guardian}/></div>,
  }
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="form-dialog record-dialog" role="dialog" aria-modal="true" aria-labelledby="record-title"><div className="dialog-heading"><div><p className="eyebrow">{student.id}</p><h2 id="record-title">{student.name}</h2><p>{student.className} · {student.stream}</p></div><button className="icon-button" aria-label={language === 'fr' ? 'Fermer' : 'Close'} onClick={onClose}><X/></button></div><div className="record-tabs" role="tablist">{visibleTabs.map((item) => <button key={item.key} role="tab" aria-selected={tab === item.key} onClick={() => setTab(item.key)}>{tabLabel(item)}</button>)}</div><div className="record-tab-content">{values[tab] ?? <EmptyState title="Aucune donnée" hint="Les informations ne sont pas disponibles."/>}</div></section></div>
}
function Info({ label, value }: { label: string; value: string }) { return <div className="record-info"><small>{label}</small><b>{value}</b></div> }

function StudentImport({ language, onClose, onImport }: { language: Language; onClose: () => void; onImport: (students: Student[]) => void }) {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const validRows = rows.filter((row) => row.errors.length === 0)
  const openFile = async (file?: File) => {
    if (!file) return
    setLoading(true); setError(''); setFileName(file.name)
    try {
      const data = file.name.toLowerCase().endsWith('.csv') ? parseCsv(await file.text()) : (await readXlsxFile(file))[0]?.data ?? []
      const parsed = data.slice(1).map((cells, index) => {
        const [name, className, stream, guardian, phone] = cells.map((cell) => String(cell ?? '').trim())
        const errors: string[] = []
        if (!name) errors.push(language === 'fr' ? 'Nom manquant' : 'Name missing')
        if (!className || !classes.some((item) => item.name.toLowerCase() === className.toLowerCase())) errors.push(language === 'fr' ? 'Classe inconnue' : 'Unknown class')
        if (!guardian) errors.push(language === 'fr' ? 'Responsable manquant' : 'Guardian missing')
        if (!phone) errors.push(language === 'fr' ? 'Téléphone manquant' : 'Phone missing')
        return { line: index + 2, name, className, stream: stream || 'Général', guardian, phone, errors }
      })
      setRows(parsed)
    } catch { setRows([]); setError(language === 'fr' ? 'Fichier illisible. Utilisez le modèle avec les colonnes : Élève, Classe, Filière, Responsable, Téléphone.' : 'Could not read file. Use the template columns: Student, Class, Program, Guardian, Phone.') }
    finally { setLoading(false) }
  }
  const confirmImport = async () => {
    if (saving || validRows.length === 0) return
    setSaving(true)
    try {
      const response = await schoolApi.importStudents(validRows.map(({ line, errors, ...row }) => row))
      onImport(response.students.map((item) => ({ ...item, fees: '—', status: 'Actif' })))
    } catch {
      setError(language === 'fr' ? 'L’import a échoué. Vérifiez votre connexion et réessayez.' : 'Import failed. Check your connection and try again.')
    } finally { setSaving(false) }
  }
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="form-dialog import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title"><div className="dialog-heading"><div><h2 id="import-title">{language === 'fr' ? 'Importer les dossiers élèves' : 'Import student files'}</h2><p>{language === 'fr' ? 'Téléversez un classeur Excel pour vérifier les lignes avant import.' : 'Upload an Excel workbook to validate rows before importing.'}</p></div><button className="icon-button" aria-label="Fermer" onClick={onClose}><X/></button></div><label className="upload-dropzone"><FileSpreadsheet/><b>{fileName || (language === 'fr' ? 'Choisir un fichier Excel' : 'Choose an Excel file')}</b><small>.xlsx · .csv</small><input type="file" accept=".xlsx,.csv" onChange={(event) => void openFile(event.target.files?.[0])}/></label>{error && <p className="validation-message" role="alert">{error}</p>}{loading && <p role="status">{language === 'fr' ? 'Lecture du classeur…' : 'Reading workbook…'}</p>}{rows.length > 0 && <><div className="import-summary"><StatusBadge value={`${validRows.length} ${language === 'fr' ? 'prêtes' : 'ready'}`}/><StatusBadge value={`${rows.length - validRows.length} ${language === 'fr' ? 'à corriger' : 'need review'}`}/></div><div className="table-scroll import-table"><table><thead><tr><th>#</th><th>{language === 'fr' ? 'Élève' : 'Student'}</th><th>{language === 'fr' ? 'Classe' : 'Class'}</th><th>{language === 'fr' ? 'Responsable' : 'Guardian'}</th><th>{language === 'fr' ? 'Téléphone' : 'Phone'}</th><th>{language === 'fr' ? 'Vérification' : 'Validation'}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.line} className={row.errors.length ? 'import-row-error' : ''}><td>{row.line}</td><td>{row.name || '—'}</td><td>{row.className || '—'}</td><td>{row.guardian || '—'}</td><td>{row.phone || '—'}</td><td>{row.errors.length ? row.errors.join(' · ') : language === 'fr' ? 'Prête' : 'Ready'}</td></tr>)}</tbody></table></div></>}<div className="dialog-actions"><button className="button-secondary" onClick={onClose}>{language === 'fr' ? 'Annuler' : 'Cancel'}</button><button className="button-primary" disabled={!validRows.length || loading || saving} onClick={() => void confirmImport()}><Check/>{saving ? (language === 'fr' ? 'Importation…' : 'Importing…') : language === 'fr' ? `Importer ${validRows.length} dossier(s)` : `Import ${validRows.length} file(s)`}</button></div></section></div>
}
