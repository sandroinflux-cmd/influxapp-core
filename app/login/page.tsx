'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation' // 🚀 დავამატეთ ნავიგაცია

export default function AuthPage() {
  const router = useRouter() // 🚀 ინიციალიზაცია
  const [step, setStep] = useState<'gate' | 'auth'>('gate')
  const [role, setRole] = useState<'influencer' | 'brand'>('influencer')
  const [isLogin, setIsLogin] = useState(true)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  // ინფლუენსერის პირდაპირი გადაყვანა
  const handleInfluencerDirect = () => {
    setRole('influencer')
    router.push('/dashboard/influencer') // 🎯 პირდაპირი გადასვლა
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: role }
          }
        })
        if (error) throw error
        alert('Check your email for confirmation!')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-screen w-full bg-[#010201] flex items-center justify-center p-6 overflow-hidden relative">
      
      {/* 1. NEON CORRIDOR */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ y: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-[3px] h-[35%] bg-emerald-500 blur-[2px] shadow-[0_0_30px_#10b981]" />
        <motion.div animate={{ y: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }} className="absolute right-0 w-[3px] h-[35%] bg-blue-500 blur-[2px] shadow-[0_0_30px_#3b82f6]" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm bg-[#040d08]/95 border border-emerald-500/30 rounded-[60px] p-10 backdrop-blur-[100px] shadow-[0_50px_150px_rgba(0,0,0,1)] overflow-hidden"
      >
        
        {/* 2. GIGANTIC 3D ORB BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-10 pt-20">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
            className="relative w-[500px] h-[500px] rounded-full border border-emerald-500/20"
            style={{ transform: 'rotateX(65deg) rotateY(-15deg)' }} 
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_#10b981_0%,_transparent_75%)]" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute inset-[-20px] border-dashed border border-emerald-500/10 rounded-full" />
          </motion.div>
        </div>

        <div className="relative z-10">
          {/* 3. INFLUX AESTHETIC LOGO */}
          <div className="flex flex-col items-center mb-12">
            <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] mb-1">
              Influ<span className="text-emerald-500 italic drop-shadow-[0_0_20px_#10b981]">X</span>
            </h1>
            <p className="text-[9px] font-black tracking-[0.6em] text-emerald-500 uppercase italic opacity-70">Access Protocol</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'gate' ? (
              
              /* STEP 1: THE GATE (როლის არჩევა) */
              <motion.div 
                key="gate"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="space-y-5"
              >
                {/* 🎯 ინფლუენსერის ღილაკი - ახლა პირდაპირ გადაჰყავხარ */}
                <button 
                  onClick={handleInfluencerDirect}
                  className="w-full flex items-center justify-between gap-4 p-7 bg-emerald-950/10 rounded-[35px] border border-emerald-500/10 group hover:border-emerald-500/40 transition-all shadow-inner active:scale-95"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[12px] text-emerald-500 uppercase tracking-widest mb-1 font-black italic leading-none">Influencer</span>
                    <span className="text-[8px] text-gray-500 uppercase tracking-wider font-bold mt-2 leading-none">Access My Vault</span>
                  </div>
                  <svg className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>

                <button 
                  onClick={() => { setRole('brand'); setStep('auth'); }}
                  className="w-full flex items-center justify-between gap-4 p-7 bg-blue-950/10 rounded-[35px] border border-blue-500/10 group hover:border-blue-500/40 transition-all shadow-inner active:scale-95"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[12px] text-blue-500 uppercase tracking-widest mb-1 font-black italic leading-none">Brand</span>
                    <span className="text-[8px] text-gray-500 uppercase tracking-wider font-bold mt-2 leading-none">Command Center</span>
                  </div>
                  <svg className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </motion.div>

            ) : (
              
              /* STEP 2: AUTH FORM */
              <motion.div 
                key="auth"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <button onClick={() => setStep('gate')} className="text-gray-600 hover:text-emerald-500 text-[9px] uppercase tracking-[0.3em] font-bold mb-8 flex items-center gap-2 transition-colors">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Return to Gate
                </button>
                
                <h3 className={`text-2xl font-black mb-10 tracking-tighter ${role === 'influencer' ? 'text-emerald-500' : 'text-blue-500'}`}>
                  Initialize {isLogin ? 'Login' : 'Signup'}
                </h3>

                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <input 
                      type="text" placeholder="FULL NAME" required
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all tracking-widest placeholder:text-gray-700"
                    />
                  )}
                  <input 
                    type="email" placeholder="EMAIL ADDRESS" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all tracking-widest placeholder:text-gray-700"
                  />
                  <input 
                    type="password" placeholder="PASSWORD" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all tracking-widest placeholder:text-gray-700"
                  />

                  <button 
                    type="submit" disabled={loading}
                    className="w-full bg-white text-black py-5 rounded-[30px] font-black text-[12px] tracking-[0.4em] uppercase hover:bg-emerald-600 hover:text-white transition-all duration-700 active:scale-95 shadow-2xl mt-4"
                  >
                    {loading ? 'Verifying...' : isLogin ? 'Access Portal' : 'Generate Key'}
                  </button>
                </form>

                <p 
                  onClick={() => setIsLogin(!isLogin)}
                  className="mt-8 text-center text-[8px] text-gray-600 uppercase tracking-[0.3em] font-bold cursor-pointer hover:text-emerald-400 transition-colors"
                >
                  {isLogin ? "Generate New Key? Sign Up" : "Already Holder? Access Portal"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  )
}