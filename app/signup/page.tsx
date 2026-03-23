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
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const theme = {
    text: role === 'influencer' ? 'text-emerald-500' : 'text-blue-500',
    border: role === 'influencer' ? 'border-emerald-500' : 'border-blue-500',
    bg: role === 'influencer' ? 'bg-emerald-500' : 'bg-blue-500',
    glow: role === 'influencer' ? 'shadow-[0_0_20px_#10b98133]' : 'shadow-[0_0_20px_#3b82f633]'
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isLogin) {
        // 🔑 ლოგინის ლოგიკა
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        // 🔍 ვამოწმებთ როლს ბაზიდან სწორი რედირექტისთვის
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        const userRole = profile?.role || role
        router.push(userRole === 'brand' ? '/dashboard/brand' : '/dashboard/influencer')

      } else {
        // 📝 რეგისტრაციის ლოგიკა
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { role, full_name: fullName },
            // 🚀 აქ დაემატა ?next=/dashboard
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
          }
        })
        if (error) throw error
        
        alert('Verification email sent! After confirming, you can login.')
        setIsLogin(true)
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-screen w-full bg-[#010201] flex items-center justify-center p-6 relative overflow-hidden font-sans">
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
                <p className="text-[10px] font-black tracking-[0.5em] text-center text-gray-500 uppercase mb-8 italic">Access Protocol</p>
                <button onClick={() => { setRole('influencer'); setStep('auth'); }} className="w-full flex items-center justify-between p-6 bg-emerald-950/10 rounded-[30px] border border-emerald-500/10 hover:border-emerald-500/40 transition-all group italic">
                  <span className="text-[11px] text-emerald-500 uppercase font-black tracking-widest">Influencer Node</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                </button>
                <button onClick={() => { setRole('brand'); setStep('auth'); }} className="w-full flex items-center justify-between p-6 bg-blue-950/10 rounded-[30px] border border-blue-500/10 hover:border-blue-500/40 transition-all group italic">
                  <span className="text-[11px] text-blue-500 uppercase font-black tracking-widest">Brand Core</span>
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="auth" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6 italic uppercase font-black">
                <button onClick={() => setStep('gate')} className="text-[8px] text-gray-500 tracking-widest hover:text-white transition-colors">← System Back</button>
                <h3 className={`text-xl ${theme.text}`}>Initialize {isLogin ? 'Login' : 'Signup'}</h3>
                
                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <input type="text" placeholder="ENTITY NAME" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] text-white focus:${theme.border} outline-none tracking-widest transition-all`} />
                  )}
                  <input type="email" placeholder="EMAIL" required value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] text-white focus:${theme.border} outline-none tracking-widest transition-all`} />
                  <input type="password" placeholder="PASSWORD" required value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] text-white focus:${theme.border} outline-none tracking-widest transition-all`} />
                  
                  <button type="submit" disabled={loading} className={`w-full bg-white text-black py-5 rounded-[25px] font-black text-[10px] tracking-[0.3em] transition-all duration-500 ${theme.glow}`}>
                    {loading ? 'SYNCING...' : isLogin ? 'Access Matrix' : 'Generate Key'}
                  </button>
                </form>

                <p onClick={() => setIsLogin(!isLogin)} className="text-center text-[8px] text-gray-600 tracking-widest cursor-pointer hover:text-white">
                  {isLogin ? "New Identity? Sign Up" : "Existing Key? Login"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  )
}