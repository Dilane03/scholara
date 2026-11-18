'use client'

import { useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpenCheck, CalendarDays, Check, ChevronDown, CircleHelp, ClipboardList, CreditCard, GraduationCap, LayoutDashboard, LogOut, Menu, Moon, MoreHorizontal, Search, Settings, ShieldCheck, Sun, Users, Wallet, X } from 'lucide-react'
import { activities, classes, feeStatus, roleNames, schedule, school, stats, type SchoolRole } from '@/mocks/school'
import { translations } from '@/mocks/translations'

type Language = 'fr' | 'en'
const menu = [
  { key: 'overview', icon: LayoutDashboard }, { key: 'students', icon: Users }, { key: 'classes', icon: GraduationCap },
  { key: 'attendance', icon: CalendarDays }, { key: 'grades', icon: BookOpenCheck }, { key: 'finance', icon: Wallet },
  { key: 'communication', icon: ClipboardList }, { key: 'reports', icon: Activity },
] as const
const roles: SchoolRole[] = ['direction', 'secretariat', 'accountant', 'teacher', 'parent', 'student']
const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

export default function Page() {
  const [language, setLanguage] = useState<Language>('fr')
  const [role, setRole] = useState<SchoolRole>('direction')
  const [dark, setDark] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [active, setActive] = useState('overview')
  const [search, setSearch] = useState('')
  const t = translations[language]
  const visibleClasses = useMemo(() => classes.filter((item) => `${item.name} ${item.teacher}`.toLowerCase().includes(search.toLowerCase())), [search])

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="app-shell min-h-screen bg-[#f5f7fa] text-[#202a38] dark:bg-[#111a25] dark:text-slate-100">
        <aside className="sidebar hidden lg:flex">
          <div className="brand-row"><div className="brand-mark"><GraduationCap size={22} /></div><span>{t.appName}<small>GESTION SCOLAIRE</small></span></div>
          <div className="school-switch"><div className="school-emblem">CH</div><div className="min-w-0"><b>{school.name}</b><small>{school.location}</small></div><ChevronDown size={15} /></div>
          <div className="nav-caption">MENU PRINCIPAL</div>
          <nav className="side-nav" aria-label="Navigation principale">
            {menu.map(({ key, icon: Icon }) => <button key={key} onClick={() => setActive(key)} className={`nav-item ${active === key ? 'selected' : ''}`}><Icon size={18} /><span>{t[key as keyof typeof t]}</span>{key === 'grades' && <span className="nav-count">18</span>}</button>)}
          </nav>
          <div className="sidebar-bottom"><div className="academic-card"><div className="academic-icon"><CalendarDays size={16} /></div><div><small>{t.academicYear}</small><b>{school.year}</b></div><ChevronDown size={14} /></div><button className="nav-item"><Settings size={18} /><span>{t.settings}</span></button><div className="sidebar-user"><div className="avatar avatar-navy">MN</div><div><b>Marie Ngo Meka</b><small>Administratrice</small></div><MoreHorizontal size={18} /></div></div>
        </aside>

        {mobileMenu && <div className="mobile-overlay lg:hidden" onClick={() => setMobileMenu(false)}><aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div className="brand-mark"><GraduationCap size={21} /></div><b>{t.appName}</b><button aria-label="Fermer le menu" onClick={() => setMobileMenu(false)}><X size={20} /></button></div><div className="school-switch"><div className="school-emblem">CH</div><div className="min-w-0"><b>{school.name}</b><small>{school.location}</small></div><ChevronDown size={15} /></div><nav className="side-nav">{menu.map(({key,icon:Icon})=><button key={key} onClick={()=>{setActive(key);setMobileMenu(false)}} className={`nav-item ${active===key?'selected':''}`}><Icon size={18}/><span>{t[key]}</span></button>)}</nav></aside></div>}

        <div className="main-column">
          <header className="topbar"><div className="topbar-left"><button className="icon-button lg:hidden" onClick={() => setMobileMenu(true)} aria-label="Ouvrir le menu"><Menu size={20} /></button><div className="breadcrumb"><span>{school.name}</span><span className="crumb-divider">/</span><b>{t.overview}</b></div></div><div className="topbar-actions"><label className="search-box"><Search size={16}/><input aria-label={t.search} placeholder={t.search} value={search} onChange={(event)=>setSearch(event.target.value)}/><kbd>⌘ K</kbd></label><button className="icon-button notification-button" aria-label={t.notifications}><Bell size={19}/><i /></button><button className="icon-button" aria-label={t.theme} onClick={()=>setDark(!dark)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button><button className="language-button" onClick={()=>setLanguage(language==='fr'?'en':'fr')} aria-label={`${t.language}: ${language.toUpperCase()}`}><span className="language-globe">◎</span>{language.toUpperCase()}<ChevronDown size={13}/></button><button className="profile-button"><div className="avatar avatar-navy">MN</div><span><b>Marie Ngo Meka</b><small>Administratrice</small></span><ChevronDown size={14}/></button></div></header>
          <main className="dashboard">
            <div className="mobile-school-name lg:hidden"><div className="school-emblem">CH</div><div><b>{school.name}</b><small>{school.location}</small></div></div>
            <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> {language==='fr'?'MARDI 18 NOVEMBRE 2025':'TUESDAY, NOVEMBER 18, 2025'} <span className="eyebrow-divider">·</span> {school.year}</div><h1>{t.welcome}</h1><p>{t.welcomeSub}</p></div><div className="role-select-wrap"><label htmlFor="active-role">{t.role}</label><div className="role-select"><ShieldCheck size={16}/><select id="active-role" value={role} onChange={(event)=>setRole(event.target.value as SchoolRole)}>{roles.map((item)=><option key={item} value={item}>{roleNames[item][language]}</option>)}</select><ChevronDown size={14}/></div></div></div>
            <section className="stats-grid" aria-label="Indicateurs de l'établissement">
              {stats.map((item,index)=>{const Icon=[Users,CalendarDays,BookOpenCheck,Wallet][index];return <article className="stat-card" key={item.key}><div className="stat-top"><span className={`stat-icon ${item.tone}`}><Icon size={18}/></span><button className="stat-more" aria-label={t.seeDetails}><MoreHorizontal size={19}/></button></div><div className="stat-label">{t[item.key as keyof typeof t]}</div><div className="stat-value">{item.value}{index===3&&<span className="currency">M FCFA</span>}</div><div className="stat-foot"><span className={`stat-change ${index===2?'neutral':''}`}>{index===3?'':<ArrowUpRight size={13}/>} {item.change}</span><span>{index===1?t.presentToday:index===2?t.pendingReview:index===3?t.thisMonth:t.enrolled}</span></div><div className={`stat-accent ${item.tone}`}/></article>})}
            </section>
            <div className="main-grid">
              <section className="panel classes-panel"><div className="panel-heading"><div><h2>{t.classesOverview}</h2><p>{language==='fr'?'Répartition des effectifs par niveau':'Student distribution by grade level'}</p></div><button className="text-action" onClick={()=>setActive('classes')}>{t.seeAll}<ArrowRight size={15}/></button></div><div className="class-list">{visibleClasses.map((item)=><div className="class-row" key={item.name}><div className={`class-avatar ${item.color}`}><GraduationCap size={18}/></div><div className="class-main"><div className="class-title"><b>{item.name}</b><span className="level-pill">{item.level}</span></div><small>{item.teacher}</small></div><div className="class-students"><b>{item.students}</b><small>{t.studentsCount}</small></div><div className="attendance-col"><div className="attendance-meta"><small>{t.attendanceShort}</small><b>{item.attendance}%</b></div><div className="progress-track"><span style={{width:`${item.attendance}%`}}/></div></div><button className="row-more" aria-label={`${t.seeDetails} ${item.name}`}><MoreHorizontal size={18}/></button></div>)}</div><button className="all-classes" onClick={()=>setActive('classes')}>{language==='fr'?'Consulter la liste complète des classes':'Browse all classes'}<ArrowRight size={15}/></button></section>
              <section className="panel activity-panel"><div className="panel-heading"><div><h2>{t.recentActivity}</h2><p>{language==='fr'?'Les dernières actions sur la plateforme':'Latest actions on the platform'}</p></div><button className="icon-button panel-menu" aria-label={t.seeDetails}><MoreHorizontal size={19}/></button></div><div className="activity-list">{activities.map((item,index)=><div className="activity-row" key={item.name}><div className={`activity-icon activity-${item.kind}`}>{index===0?<BookOpenCheck size={16}/>:index===1?<Users size={16}/>:<CreditCard size={16}/>}</div><div className="activity-copy"><b>{language==='fr'?item.name: index===0?'Mathematics grades':index===1?'New pre-enrollment':'Tuition payment received'}</b><small>{item.detail}</small><span>{language==='fr'?item.time:index===0?'12 min ago':index===1?'48 min ago':'Today, 9:32 AM'}</span></div></div>)}</div><button className="activity-footer">{language==='fr'?'Voir le journal d’activité':'View activity log'}<ArrowRight size={15}/></button></section>
            </div>
            <div className="secondary-grid">
              <section className="panel schedule-panel"><div className="panel-heading"><div><h2>{t.todaySchedule}</h2><p>{t.scheduleSub}</p></div><button className="text-action">{t.viewTimetable}<ArrowRight size={15}/></button></div><div className="schedule-list">{schedule.map((item,index)=><div className="schedule-row" key={item.time}><div className="schedule-time"><b>{item.time}</b><span>{index===0?'AM':''}</span></div><div className={`schedule-color color-${index}`}/><div className="schedule-content"><b>{item.subject}</b><small>{item.className} <span>·</span> {item.room}</small></div><div className="teacher-avatar">{item.teacher.split(' ').slice(-1)[0].slice(0,1)}{item.teacher.split(' ').slice(-1)[0].slice(1,2)}</div><small className="teacher-name">{item.teacher}</small></div>)}</div></section>
              <section className="panel finance-panel"><div className="panel-heading"><div><h2>{t.financeOverview}</h2><p>{t.financeSub}</p></div><button className="icon-button panel-menu" aria-label={t.seeDetails}><MoreHorizontal size={19}/></button></div><div className="finance-total"><div><small>{t.totalCollected}</small><b>8 420 000 <span>FCFA</span></b></div><span className="finance-growth"><ArrowUpRight size={14}/> 12,6%</span></div><div className="fee-bar">{feeStatus.map(item=><span key={item.label} className={item.color} style={{width:`${item.value}%`}}/>)}</div><div className="fee-legend">{feeStatus.map((item,index)=><div key={item.label}><span className={`legend-dot ${item.color}`}/><small>{t[index===0?'paid':index===1?'partial':'overdue']}</small><b>{item.value}%</b></div>)}</div></section>
            </div>
            <section className="quick-actions"><div><span className="quick-icon"><Check size={17}/></span><div><b>{t.quickAccess}</b><small>{language==='fr'?'Les actions que vous utilisez le plus':'Your most-used actions'}</small></div></div><div className="quick-buttons"><button onClick={()=>setActive('students')}><Users size={16}/>{t.addStudent}<ArrowRight size={14}/></button><button onClick={()=>setActive('finance')}><CreditCard size={16}/>{t.recordPayment}<ArrowRight size={14}/></button><button onClick={()=>setActive('grades')}><BookOpenCheck size={16}/>{t.validateGrades}<ArrowRight size={14}/></button></div></section>
            <footer className="page-footer"><span>© 2025 Campus · {school.name}</span><span><button>{t.help}</button><i/> {language==='fr'?'Données hébergées au Cameroun':'Data hosted in Cameroon'}</span></footer>
          </main>
        </div>
        <nav className="bottom-nav lg:hidden" aria-label="Navigation mobile">{[{key:'overview',icon:LayoutDashboard},{key:'students',icon:Users},{key:'classes',icon:GraduationCap},{key:'finance',icon:Wallet}].map(({key,icon:Icon})=><button key={key} className={active===key?'active':''} onClick={()=>setActive(key)}><Icon size={19}/><span>{t[key as keyof typeof t]}</span></button>)}<button onClick={()=>setMobileMenu(true)}><Menu size={19}/><span>{language==='fr'?'Plus':'More'}</span></button></nav>
      </div>
    </div>
  )
}
