'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

// 🧊 3D მბრუნავი ენის კუბი (GE / EN)
const LanguageCube = ({ lang, setLang }: { lang: 'ka' | 'en', setLang: any }) => {
  return (
    <div 
      className="relative h-10 w-10 cursor-pointer pointer-events-auto select-none"
      onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        animate={{ rotateX: lang === 'ka' ? 0 : -90 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 bg-white text-black flex items-center justify-center rounded-sm backface-hidden font-black text-[10px]">GE</div>
        <div 
          className="absolute inset-0 bg-emerald-500 text-black flex items-center justify-center rounded-sm backface-hidden font-black text-[10px]"
          style={{ transform: 'rotateX(90deg) translateZ(20px)' }}
        >EN</div>
      </motion.div>
    </div>
  )
}

const translations = {
  ka: {
    heroTag: "ინფლუენსერ მარკეტინგის მომავალი",
    tokens: "ჩემი ტოკენები",
    signup: "რეგისტრაცია",
    sections: [
      {
        id: 'influencer',
        title: 'Influencers',
        color: '#10b981',
        text: 'ინფლუენსერები შეძლებენ უკეთ მოახდინონ საკუთარი გავლენის მონეტიზაცია - შეეძლებათ აიღონ საკომისიო მათი გამომწერების ტრანზაქციებიდან. საკუთარ აუდიტორიას ყოველ ფეხის ნაბიჯზე შეუქმნიან ფასდაკლებებს და ბენეფიტურ სერვისებს.'
      },
      {
        id: 'brand',
        title: 'Brands',
        color: '#3b82f6',
        text: 'ბრენდები შეძლებენ უფასოდ დაიწყონ თანამშრომლობა მათ რჩეულ ინფლუენსერებთან და გადაუხადონ საკომისიო, მათი მეშვეობით დაგენერირებული გაყიდვებიდან. ზუსტად დათვალონ ინფლუენსერის პერფორმანსი: რა მოცულობის პროდუქცია გაიყიდა მისი მეშვეობით, რამდენი მომხმარებელი მოიყვანა და რამდენად ლოიალურები არიან ინფლუენსერის გამომწერები მათ მიმართ.'
      },
      {
        id: 'user',
        title: 'Users',
        color: '#ffffff',
        text: 'გამომწერები მათი საყვარელი კონტენტ კრეატორებისგან მიიღებენ რეალურ სარგებელს: დაზოგავენ თანხას ყოველდღიურ საჭიროებებზე, მათთვის საყვარელ ბრენდებთან.'
      }
    ]
  },
  en: {
    heroTag: "The Future of Influencer Marketing",
    tokens: "MY TOKENS",
    signup: "SIGNUP",
    sections: [
      {
        id: 'influencer',
        title: 'Influencers',
        color: '#10b981',
        text: 'Influencers can effectively convert their impact into revenue, earning commissions from their followers\' transactions. Create exclusive discounts and beneficial services for your audience at every single step.'
      },
      {
        id: 'brand',
        title: 'Brands',
        color: '#3b82f6',
        text: 'Brands can start collaborating with influencers for free and pay commissions only on generated sales. Precisely track performance: measure sales volume, customer acquisition, and audience loyalty.'
      },
      {
        id: 'user',
        title: 'Users',
        color: '#ffffff',
        text: 'Followers receive real benefits from their favorite creators: saving money on daily essentials and with the brands they love.'
      }
    ]
  }
}

export default function NeuralInterface() {
  const [lang, setLang] = useState<'ka' | 'en'>('ka')
  const [expanded, setExpanded] = useState<string | null>(null)
  const t = translations[lang]
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#000000] text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* 🛰️ Nav (Strict & Serious Style) */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-24 flex items-center justify-between px-10 bg-transparent">
        <h1 className="text-2xl font-black italic tracking-tighter cursor-pointer text-white mix-blend-difference" onClick={() => router.push('/')}>INFLUX</h1>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/wallet')} className="relative px-8 py-2.5 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest italic border border-white/10 hover:border-white transition-all active:scale-95">
              {t.tokens}
            </button>
            <button onClick={() => router.push('/signup')} className="relative px-8 py-2.5 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest italic border border-white/10 hover:border-white transition-all ml-1 active:scale-95">
              {t.signup}
            </button>
          </div>
          <LanguageCube lang={lang} setLang={setLang} />
        </div>
      </nav>

      {/* 🌪️ HERO: FUTURISTIC CHAMELEON LOGO */}
      <section className="h-screen flex flex-col items-center justify-center p-6 text-center relative">
        <motion.div 
          animate={{ 
            color: ["#ffffff", "#10b981", "#3b82f6", "#ffffff"],
            textShadow: [
              "0 0 40px rgba(255,255,255,0)", 
              "0 0 80px rgba(16,185,129,0.7)", 
              "0 0 80px rgba(59,130,246,0.7)", 
              "0 0 40px rgba(255,255,255,0)"
            ] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="z-10"
        >
          <h2 className="text-[18vw] font-black italic leading-none tracking-tighter cursor-default">
            INFLUX
          </h2>
        </motion.div>
        
        {/* 🐍 TAGLINE: CYBORG SNAKE BORDER */}
        <div className="mt-8 relative group p-1.5 overflow-hidden">
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none z-0"
            style={{ background: "conic-gradient(from 0deg, #10b981, transparent 40%)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-[2px] rounded-full bg-black pointer-events-none z-1" />

          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="relative z-10 text-xs md:text-2xl font-black tracking-[0.2em] uppercase italic text-white p-4 px-10"
          >
            {t.heroTag}
          </motion.p>
        </div>
      </section>

      {/* 🧩 INTERACTIVE MODULES */}
      <section className="max-w-6xl mx-auto px-6 pb-40 space-y-4">
        {t.sections.map((section) => (
          <motion.div 
            key={section.id}
            layout
            onClick={() => setExpanded(expanded === section.id ? null : section.id)}
            className="cursor-pointer relative overflow-hidden"
          >
            <motion.div 
              layout
              className={`p-12 rounded-[40px] border transition-all duration-700 ${
                expanded === section.id 
                ? 'bg-white/[0.04] border-white/20' 
                : 'bg-black border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 
                  className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter transition-colors duration-700"
                  style={{ color: expanded === section.id ? section.color : '#333' }}
                >
                  {section.title}
                </h3>
                <motion.div 
                  animate={{ scale: expanded === section.id ? 1.4 : 1 }}
                  className="h-3 w-3 rounded-full"
                  style={{ 
                    backgroundColor: section.color,
                    boxShadow: `0 0 20px ${section.color}`,
                    opacity: expanded === section.id ? 1 : 0.2
                  }}
                />
              </div>

              <AnimatePresence>
                {expanded === section.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pt-16 text-2xl md:text-4xl font-black italic uppercase leading-[1.1] tracking-tight text-gray-200">
                      {section.text}
                    </p>
                    <div className="mt-12 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ))}
      </section>

      {/* 🛡️ SECURITY BAR (MINIMAL) */}
      <section className="py-24 border-t border-white/5 flex flex-col items-center bg-black">
         <div className="opacity-40 hover:opacity-100 transition-all duration-700">
            <span className="text-xs md:text-sm font-black italic tracking-[0.8em] text-gray-600 uppercase">
               SECURED BY BANK-GRADE ENCRYPTION
            </span>
         </div>
      </section>

      <Footer />
    </main>
  )
}