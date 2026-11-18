'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Mail } from 'lucide-react'
import { translations } from '@/mocks/translations'
import type { Language } from '@/mocks/school'

export default function ActivatePage() {
  const [language,setLanguage]=useState<Language>('fr')
  const [sent,setSent]=useState(false)
  const t=translations[language]
  return <main className="auth-page"><section className="auth-aside"><Link className="auth-brand" href="/"><span className="brand-mark"><GraduationCap size={22}/></span><span>Campus<small>GESTION SCOLAIRE</small></span></Link><div className="auth-aside-copy"><span className="auth-kicker">COLLÈGE LES HORIZONS</span><h1>{language==='fr'?'Votre espace scolaire commence ici.':'Your school portal starts here.'}</h1><p>{language==='fr'?'Activez votre accès personnel pour retrouver les informations qui comptent.':'Activate your personal account to access what matters.'}</p></div><span className="auth-aside-footer">Yaoundé · Cameroun · 2025–2026</span></section><section className="auth-main"><div className="auth-top"><Link href="/login" className="auth-back"><ArrowLeft size={15}/>{t.backLogin}</Link><button className="language-button" onClick={()=>setLanguage(language==='fr'?'en':'fr')}>{language.toUpperCase()}</button></div><div className="auth-card"><div className="auth-form-icon"><Mail size={21}/></div><span className="auth-kicker">{language==='fr'?'ACCÈS SÉCURISÉ':'SECURE ACCESS'}</span><h2>{t.activationTitle}</h2><p>{t.activationSubtitle}</p>{sent?<div className="auth-success"><CheckCircle2 size={22}/><b>{language==='fr'?'Vérifiez votre boîte de réception':'Check your inbox'}</b><span>{language==='fr'?'Si un dossier correspond, un lien d’activation à usage unique vient d’être envoyé.':'If an account matches, a one-time activation link has been sent.'}</span></div>:<form className="auth-form" onSubmit={(e)=>{e.preventDefault();setSent(true)}}><label>{t.identifier}<input type="email" required autoComplete="email" placeholder="nom@exemple.cm"/></label><button className="auth-submit" type="submit">{t.sendLink}<ArrowRight size={16}/></button></form>}<div className="auth-demo-hint">{t.oneTimeLink}</div><div className="auth-activation"><span>{language==='fr'?'Vous avez déjà un compte ?':'Already have an account?'}</span><Link href="/login">{t.signIn}<ArrowRight size={14}/></Link></div></div></section></main>
}
