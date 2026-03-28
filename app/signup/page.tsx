'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<'gate' | 'auth'>('gate')
  const [role, setRole] = useState<'influencer' | 'brand'>('influencer')
  const [isLogin, setIsLogin] = useState(true)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 🛡️ დინამიური თემა როლების მიხედვით
  const theme = {
    text: role === 'influencer' ? 'text-emerald-500' : 'text-blue-500',
    border: role === 'influencer' ? 'border-emerald-500' : 'border-blue-500',
    bg: role === 'influencer' ? 'bg-emerald-500' : 'bg-blue-500',
    glow: role === 'influencer' ? 'shadow-[0_0_20px_#10b98133]' : 'shadow-[0_0_20px_#3b82f633]',
    accent: role === 'influencer' ? 'accent-emerald-500' : 'accent-blue-500'
  }

  // 🛡️ უსაფრთხოების ვალიდაცია
  const isPasswordStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword
  
  const canSubmit = isLogin 
    ? (email.includes('@') && password.length > 0) 
    : (fullName.length > 2 && email.includes('@') && isPasswordStrong && passwordsMatch && termsAccepted)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)
    
    try {
      if (isLogin) {
        // 🔑 Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
        const userRole = profile?.role || role
        router.push(userRole === 'brand' ? '/dashboard/brand' : '/dashboard/influencer')

      } else {
        // 📝 Sign Up
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { 
              role: role, 
              full_name: fullName,
              account_status: 'pending' 
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/${role}/settings`
          }
        })
        if (signUpError) throw signUpError
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 📧 წარმატების ეკრანი
  if (success) {
    return (
      <main className="h-screen w-full bg-[#010201] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`relative w-full max-w-sm bg-[#040d08]/90 border ${theme.border}/20 rounded-[50px] p-10 backdrop-blur-xl shadow-2xl text-center`}>
          <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center border ${theme.border}/30 ${theme.bg}/10`}>
            <span className="text-2xl">📧</span>
          </div>
          <h2 className={`text-xl font-black uppercase tracking-widest ${theme.text} mb-4`}>Email Sent</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed mb-6 font-medium">
            A confirmation link has been sent to <span className="text-white font-bold">{email}</span>. Please check your inbox.
          </p>
          <button onClick={() => { setSuccess(false); setIsLogin(true); setStep('auth'); }} className={`w-full bg-white/5 border border-white/10 hover:${theme.border}/50 py-4 rounded-full text-[9px] font-black uppercase tracking-widest text-white transition-all`}>
            Back to Login
          </button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="h-screen w-full bg-[#010201] flex items-center justify-center p-6 relative overflow-hidden font-sans text-white uppercase font-black">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-emerald-500 to-transparent" />
        <div className="absolute right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
        className={`relative w-full max-w-sm bg-[#040d08]/90 border ${theme.border}/20 rounded-[50px] p-10 backdrop-blur-xl shadow-2xl`}>
        
        <div className="relative z-10 pt-4">
          <AnimatePresence mode="wait">
            {step === 'gate' ? (
              <motion.div key="gate" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <p className="text-[10px] font-black tracking-[0.5em] text-center text-gray-500 uppercase mb-8 italic">Choose your role</p>
                <button onClick={() => { setRole('influencer'); setStep('auth'); setIsLogin(false); }} className="w-full flex items-center justify-between p-6 bg-emerald-950/10 rounded-[30px] border border-emerald-500/10 hover:border-emerald-500/40 transition-all group italic">
                  <span className="text-[11px] text-emerald-500 uppercase tracking-widest">Influencer</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                </button>
                <button onClick={() => { setRole('brand'); setStep('auth'); setIsLogin(false); }} className="w-full flex items-center justify-between p-6 bg-blue-950/10 rounded-[30px] border border-blue-500/10 hover:border-blue-500/40 transition-all group italic">
                  <span className="text-[11px] text-blue-500 uppercase tracking-widest">Brand</span>
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                </button>
                <div className="pt-4 text-center">
                  <span onClick={() => { setStep('auth'); setIsLogin(true); }} className="text-[9px] text-gray-500 tracking-widest cursor-pointer hover:text-white transition-colors">
                    Already have an account? Login
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="auth" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6 italic">
                <div className="flex justify-between items-center">
                  <button onClick={() => setStep('gate')} className="text-[8px] text-gray-500 tracking-widest hover:text-white transition-colors">← Back</button>
                  <span className={`text-[8px] tracking-[0.3em] ${theme.text} bg-white/5 px-2 py-1 rounded`}>{role} mode</span>
                </div>
                
                <h3 className={`text-xl ${theme.text}`}>{isLogin ? 'Login' : 'Sign Up'}</h3>
                
                <form onSubmit={handleAuth} className="space-y-4">
                  {error && (
                    <div className="p-3 border border-red-500/30 bg-red-500/10 rounded-xl text-red-500 text-[8px] tracking-widest text-center">
                      {error}
                    </div>
                  )}

                  {!isLogin && (
                    <input type="text" placeholder={role === 'brand' ? "BRAND NAME" : "FULL NAME"} required value={fullName} onChange={(e) => setFullName(e.target.value)} className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] text-white focus:${theme.border} outline-none tracking-widest transition-all placeholder:text-gray-700`} />
                  )}
                  
                  <input type="email" placeholder="EMAIL ADDRESS" required value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] text-white focus:${theme.border} outline-none tracking-widest transition-all placeholder:text-gray-700`} />
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input type="password" placeholder="PASSWORD" required value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-white/5 border ${!isLogin && password.length > 0 ? (isPasswordStrong ? `${theme.border}/50` : 'border-red-500/50') : 'border-white/5'} rounded-2xl py-4 px-6 text-[10px] text-white outline-none tracking-widest transition-all placeholder:text-gray-700`} />
                      {!isLogin && password.length > 0 && (
                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[8px] ${isPasswordStrong ? theme.text : 'text-red-500'}`}>
                          {isPasswordStrong ? 'STRONG' : 'WEAK'}
                        </span>
                      )}
                    </div>

                    {!isLogin && (
                      <div className="relative">
                        <input type="password" placeholder="CONFIRM PASSWORD" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-white/5 border ${confirmPassword.length > 0 ? (passwordsMatch ? `${theme.border}/50` : 'border-red-500/50') : 'border-white/5'} rounded-2xl py-4 px-6 text-[10px] text-white outline-none tracking-widest transition-all placeholder:text-gray-700`} />
                        {confirmPassword.length > 0 && (
                          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[8px] ${passwordsMatch ? theme.text : 'text-red-500'}`}>
                            {passwordsMatch ? 'MATCH' : 'ERROR'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="flex items-start gap-3 py-2">
                      <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className={`mt-0.5 w-3 h-3 rounded bg-black border-white/10 ${theme.accent}`} />
                      <label htmlFor="terms" className="text-[7px] text-gray-500 uppercase tracking-widest leading-relaxed font-normal">
                        I agree to the <span className={theme.text}>Terms</span> and <span className={theme.text}>Privacy Policy</span>.
                      </label>
                    </div>
                  )}
                  
                  <button type="submit" disabled={loading || !canSubmit} className={`w-full bg-white text-black py-5 rounded-[25px] font-black text-[10px] tracking-[0.3em] transition-all duration-500 disabled:opacity-20 disabled:cursor-not-allowed ${theme.glow}`}>
                    {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
                  </button>
                </form>

                <p onClick={() => setIsLogin(!isLogin)} className="text-center text-[8px] text-gray-600 tracking-widest cursor-pointer hover:text-white transition-colors">
                  {isLogin ? "New user? Sign Up" : "Already have an account? Login"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  )
}