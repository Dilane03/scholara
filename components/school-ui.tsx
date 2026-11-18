'use client'

import { useState } from 'react'
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Download, FileUp, MoreHorizontal, Search, ShieldCheck, Users } from 'lucide-react'

export function StatusBadge({ value }: { value: string }) {
  const kind = /à jour|confirm|validée|actif|présent|accepté|up to date/i.test(value) ? 'success' : /retard|absent|refus|incomplet|urgent/i.test(value) ? 'danger' : /attente|provisoire|partiel|pré-inscription|late/i.test(value) ? 'warning' : 'neutral'
  return <span className={`status-badge ${kind}`}><i aria-hidden="true"/>{value}</span>
}

export function StatCard({ label, value, detail, tone = 'navy', icon: Icon }: { label: string; value: string; detail: string; tone?: string; icon: React.ElementType }) {
  return <article className="stat-card"><div className="stat-top"><span className={`stat-icon ${tone}`}><Icon size={18}/></span></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">{detail}</div><div className={`stat-accent ${tone}`}/></article>
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return <div className="empty-state"><span><Users size={20}/></span><b>{title}</b><small>{hint}</small></div>
}

export function FormStepper({ steps, current }: { steps: string[]; current: number }) {
  return <ol className="form-stepper" aria-label="Étapes du formulaire">{steps.map((step, index) => <li key={step} className={index === current ? 'current' : index < current ? 'complete' : ''}><span>{index < current ? <Check size={14}/> : index + 1}</span><small>{step}</small></li>)}</ol>
}

export function ConfirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: { title: string; message: string; confirmLabel: string; cancelLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><span className="dialog-icon"><AlertTriangle size={20}/></span><h2 id="confirm-title">{title}</h2><p>{message}</p><div><button className="button-secondary" onClick={onCancel}>{cancelLabel}</button><button className="button-primary" onClick={onConfirm}>{confirmLabel}</button></div></section></div>
}

export function DataTable<T extends object>({ rows, columns, rowKey, emptyTitle, emptyHint, onExport }: { rows: T[]; columns: { key: keyof T; label: string; render?: (row: T) => React.ReactNode }[]; rowKey: keyof T; emptyTitle: string; emptyHint: string; onExport?: () => void }) {
  const [query, setQuery] = useState('')
  const filtered = rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()))
  return <section className="data-table-wrap"><div className="table-toolbar"><label className="table-search"><Search size={16}/><input aria-label="Rechercher dans la liste" placeholder="Rechercher dans la liste…" value={query} onChange={(event) => setQuery(event.target.value)}/></label><div className="table-actions"><button className="button-secondary" onClick={onExport}><Download size={15}/> Exporter</button><button className="button-secondary" onClick={() => document.getElementById('excel-import')?.click()}><FileUp size={15}/> Import Excel</button><input className="sr-only" id="excel-import" type="file" accept=".xlsx,.xls,.csv" aria-label="Importer un fichier Excel"/></div></div><div className="table-scroll"><table><thead><tr>{columns.map((column) => <th key={String(column.key)}>{column.label}</th>)}<th aria-label="Actions"/></tr></thead><tbody>{filtered.map((row) => <tr key={String(row[rowKey])}>{columns.map((column) => <td key={String(column.key)}>{column.render ? column.render(row) : String(row[column.key] ?? '')}</td>)}<td><button className="table-more" aria-label={`Actions ${String(row[rowKey])}`}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState title={emptyTitle} hint={emptyHint}/>}</div><div className="table-pagination"><small>Affichage de {filtered.length ? 1 : 0} à {filtered.length} sur {filtered.length} résultats</small><div><button aria-label="Page précédente" disabled><ChevronLeft size={15}/></button><button className="page-number" aria-current="page">1</button><button aria-label="Page suivante" disabled><ChevronRight size={15}/></button></div></div></section>
}
