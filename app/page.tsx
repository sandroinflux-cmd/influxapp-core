'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

// 🧊 3D მბრუნავი ენის კუბი
const LanguageCube = ({ lang, setLang }: { lang: 'ka' | 'en', setLang: any }) => {
  return (
    <div 
      className="relative h-10 w-10 cursor-pointer pointer-events-auto select-none"
      onClick={() => setLang(lang === 'en' ? 'ka' : 'en')}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        animate={{ rotateX: lang === 'en' ? 0 : -90 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 bg-emerald-500 text-black flex items-center justify-center rounded-sm backface-hidden font-black text-[10px]">EN</div>
        <div 
          className="absolute inset-0 bg-white text-black flex items-center justify-center rounded-sm backface-hidden font-black text-[10px]"
          style={{ transform: 'rotateX(90deg) translateZ(20px)' }}
        >GE</div>
      </motion.div>
    </div>
  )
}

const translations = {
  ka: {
    heroTag: "ინფლუენსერ მარკეტინგის მომავალი",
    cta: "JOIN THE SYSTEM",
    tokens: "MY TOKENS",
    sections: [
      { id: 'influencer', title: 'Influencers', color: '#10b981', text: 'ინფლუენსერები შეძლებენ უკეთ მოახდინონ საკუთარი გავლენის მონეტიზაცია - აიღონ საკომისიო ყოველი ტრანზაქციიდან.' },
      { id: 'brand', title: 'Brands', color: '#3b82f6', text: 'ბრენდები შეძლებენ უფასოდ დაიწყონ თანამშრომლობა და გადაუხადონ საკომისიო მხოლოდ გაყიდვებიდან.' },
      { id: 'user', title: 'Users', color: '#ffffff', text: 'გამომწერები მიიღებენ რეალურ სარგებელს და დაზოგავენ თანხას მათ საყვარელ ბრენდებთან.' }
    ]
  },
  en: {
    heroTag: "The Future of Influencer Marketing",
    cta: "JOIN THE SYSTEM",
    tokens: "MY TOKENS",
    sections: [
      { id: 'influencer', title: 'Influencers', color: '#10b981', text: 'Influencers can effectively convert their impact into revenue, earning commissions from their followers\' transactions.' },
      { id: 'brand', title: 'Brands', color: '#3b82f6', text: 'Brands can start collaborating with influencers for free and pay commissions only on generated sales.' },
      { id: 'user', title: 'Users', color: '#ffffff', text: 'Followers receive real benefits from their favorite creators and save money on daily essentials.' }
    ]
  }
}

export default function NeuralInterface() {
  const [lang, setLang] = useState<'ka' | 'en'>('en')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [hoveredContact, setHoveredContact] = useState<string | null>(null)
  const t = translations[lang]
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#000000] text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-black italic uppercase font-black">
      
      {/* 🛰️ Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-24 flex items-center justify-between px-6 md:px-10 bg-transparent">
        <h1 className="text-2xl tracking-tighter cursor-pointer" onClick={() => router.push('/')}>INFLUX</h1>
        <LanguageCube lang={lang} setLang={setLang} />
      </nav>

      {/* 🌪️ HERO SECTION */}
      <section className="h-screen flex flex-col items-center justify-center p-6 text-center relative">
        <motion.div 
          animate={{ color: ["#ffffff", "#10b981", "#3b82f6", "#ffffff"] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="z-10"
        >
          <h2 className="text-[17vw] md:text-[14vw] leading-none tracking-tighter cursor-default select-none font-[1000]">INFLUX</h2>
        </motion.div>
        
        <div className="mt-8 relative group p-1 overflow-hidden rounded-full">
          <motion.div className="absolute inset-0 rounded-full z-0" style={{ background: "conic-gradient(from 0deg, #10b981, transparent 40%)" }} animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
          <div className="absolute inset-[2px] rounded-full bg-black z-1" />
          <p className="relative z-10 text-[10px] md:text-xl tracking-tight text-white p-3 px-8 md:px-12 opacity-60 font-medium lowercase">{t.heroTag}</p>
        </div>

        {/* 🔘 ELEGANT HERO BUTTONS */}
        <div className="mt-12 flex flex-col md:flex-row gap-4 z-20 w-full max-w-xs md:max-w-xl px-6">
          <motion.button 
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/signup')}
            className="flex-1 py-5 bg-white text-black text-sm md:text-base tracking-tighter rounded-full transition-all shadow-xl font-[1000]"
          >
            {t.cta}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/wallet')}
            className="flex-1 py-5 bg-white text-black text-sm md:text-base tracking-tighter rounded-full transition-all shadow-xl font-[1000]"
          >
            {t.tokens}
          </motion.button>
        </div>
      </section>

      {/* 🧩 HIGH-VISIBILITY MODULES */}
      <section className="max-w-6xl mx-auto px-6 pb-40 space-y-6">
        {t.sections.map((section) => (
          <motion.div 
            key={section.id} layout
            onClick={() => setExpanded(expanded === section.id ? null : section.id)}
            whileHover={{ scale: 1.01 }}
            className={`cursor-pointer p-10 md:p-16 rounded-[45px] border transition-all duration-500 ${
              expanded === section.id 
              ? 'bg-white/[0.07] border-white/20' 
              : 'bg-black border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 
                className="text-5xl md:text-9xl tracking-tighter transition-all duration-500"
                style={{ color: expanded === section.id ? section.color : 'rgba(255,255,255,0.4)' }}
              >
                {section.title}
              </h3>
              <motion.div 
                animate={{ 
                  scale: expanded === section.id ? [1, 1.4, 1] : 1,
                  opacity: expanded === section.id ? 1 : 0.3
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: section.color, boxShadow: `0 0 20px ${section.color}` }}
              />
            </div>

            <AnimatePresence>
              {expanded === section.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="pt-16 text-2xl md:text-4xl leading-tight text-white max-w-5xl tracking-tight">
                    {section.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </section>

      {/* 📞 SMART LOGO CONTACT TERMINAL */}
      <section className="max-w-4xl mx-auto px-6 pb-60 text-center">
        <div className="flex justify-center items-center gap-10 md:gap-16 mb-10">
          
          {/* WhatsApp / Phone Icon */}
          <div className="flex flex-col items-center gap-4">
            <a 
              href="https://wa.me/995500050608" 
              target="_blank"
              onMouseEnter={() => setHoveredContact('500 05 06 08')}
              onMouseLeave={() => setHoveredContact(null)}
              className="group w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center transition-all duration-300 hover:bg-emerald-500 hover:scale-110 shadow-xl"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10 text-black transition-transform group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.623 1.432h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>

          {/* Email Icon */}
          <div className="flex flex-col items-center gap-4">
            <a 
              href="mailto:sandro@influxapp.io"
              onMouseEnter={() => setHoveredContact('sandro@influxapp.io')}
              onMouseLeave={() => setHoveredContact(null)}
              className="group w-20 h-20 md:w-24 md:h-24 bg-black border border-white/10 rounded-full flex items-center justify-center transition-all duration-300 hover:border-white hover:scale-110 shadow-xl"
            >
              <svg className="w-8 h-8 md:w-10 md:h-10 text-white transition-transform group-hover:-translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* 📟 DYNAMIC INFO DISPLAY */}
        <div className="h-10">
          <AnimatePresence mode="wait">
            {hoveredContact ? (
              <motion.p 
                key={hoveredContact}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg md:text-2xl font-black italic tracking-tighter text-white"
              >
                {hoveredContact}
              </motion.p>
            ) : (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.2 }} 
                className="text-[8px] tracking-[0.5em] text-gray-500 font-black uppercase italic"
              >
                INTERACT TO REVEAL CHANNEL
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  )
}