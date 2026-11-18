'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, KeyRound } from 'lucide-react'
import { translations } from '@/mocks/translations'
import type { Language } from '@/mocks/school'

export default function ForgotPasswordPage() {
  const [language,setLanguage]=useState<Language>('fr')
  const [sent,setSent]=useState(false)
  const t=translations[language]
  return <main className="auth-page"><section className="auth-aside"><Link className="auth-brand" href="/"><span className="brand-mark"><GraduationCap size={22}/></span><span>Campus<small>GESTION SCOLAIRE</small></span></Link><div className="auth-aside-copy"><span className="auth-kicker">COLLÈGE LES HORIZONS</span><h1>{language==='fr'?'Un accès protégé, toujours récupérable.':'A secure account you can always recover.'}</h1><p>{language==='fr'?'Nous vous aidons à reprendre accès à votre espace sans exposer vos informations.':'We help you regain access without exposing your information.'}</p></div><span className="auth-aside-footer">Yaoundé · Cameroun · 2025–2026</span></section><section className="auth-main"><div className="auth-top"><Link href="/login" className="auth-back"><ArrowLeft size={15}/>{t.backLogin}</Link><button className="language-button" onClick={()=>setLanguage(language==='fr'?'en':'fr')}>{language.toUpperCase()}</button></div><div className="auth-card"><div className="auth-form-icon"><KeyRound size={21}/></div><span className="auth-kicker">{language==='fr'?'AIDE À LA CONNEXION':'ACCOUNT RECOVERY'}</span><h2>{t.resetTitle}</h2><p>{t.resetSubtitle}</p>{sent?<div className="auth-success"><CheckCircle2 size={22}/><b>{language==='fr'?'Demande prise en compte':'Request received'}</b><span>{language==='fr'?'Si cette adresse est enregistrée, un lien de réinitialisation vient d’être envoyé.':'If this email is registered, a reset link has been sent.'}</span></div>:<form className="auth-form" onSubmit={(e)=>{e.preventDefault();setSent(true)}}><label>{t.identifier}<input type="email" required autoComplete="email" placeholder="nom@exemple.cm"/></label><button className="auth-submit" type="submit">{t.sendReset}<ArrowRight size={16}/></button></form>}<div className="auth-activation"><span>{language==='fr'?'Vous n’avez pas de compte activé ?':'Need to activate your account?'}</span><Link href="/activate">{t.activate}<ArrowRight size={14}/></Link></div></div></section></main>
}
