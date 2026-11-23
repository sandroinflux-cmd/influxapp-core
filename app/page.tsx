'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BrandMark from '@/components/BrandMark'
import Footer from '@/components/Footer'

const translations = {
  ka: {
    headline: 'ექსკლუზიური წვდომა. 15-წამიანი გადახდა.',
    subtitle: 'პრემიუმ ესთეტიკური კლინიკები, ბუტიკ-სასტუმროები და შერჩეული კრეატორები — კუპონებისა და ფასდაკლებების გარეშე, მხოლოდ VIP პრივილეგიებით.',
    primary: 'პარტნიორობის მოთხოვნა',
    secondary: 'შესვლა',
    cards: [
      {
        title: 'ბიზნესებისთვის',
        text: '0 ₾ წინასწარი ბიუჯეტი. წინასწარ გადახდილი VIP ჯავშნები აპარატულ სერვისებსა და სასტუმროებზე, ავტომატური საბანკო გაყოფით.',
      },
      {
        title: 'კრეატორებისთვის',
        text: 'მხოლოდ გადამოწმებული პრემიუმ პარტნიორები. 15% მყისიერი ანაზღაურება ყოველი გადახდილი VIP Pass-იდან.',
      },
      {
        title: 'სტუმრებისთვის',
        text: 'დახურული პრივილეგიები, 60-დღიანი ღია თარიღი და 15-წამიანი Apple Pay / Google Pay გადახდა.',
      },
    ],
  },
  en: {
    headline: 'Exclusive Access. 15-Second Checkout.',
    subtitle: 'Curated aesthetic clinics, boutique hotels, and trusted creators — no coupons, no discounts, only private VIP perks.',
    primary: 'Request Access',
    secondary: 'Sign In',
    cards: [
      {
        title: 'For Venues',
        text: 'No upfront budget. Prepaid VIP reservations for apparatus treatments and hotels, settled with an automatic bank split.',
      },
      {
        title: 'For Creators',
        text: 'Verified premium partners only. 15% paid instantly on every completed VIP Pass.',
      },
      {
        title: 'For Guests',
        text: 'Private privileges, a 60-day open date, and 15-second Apple Pay / Google Pay checkout.',
      },
    ],
  },
}

const numerals = ['01', '02', '03']

export default function HomePage() {
  const [lang, setLang] = useState<'ka' | 'en'>('ka')
  const t = translations[lang]

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#090808] text-[#F2EFE9] selection:bg-[#C9B087]/30 selection:text-[#F2EFE9]">
      <nav className="fixed top-0 right-0 left-0 z-[100] flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#090808]/80 px-6 backdrop-blur-md md:px-10">
        <button
          type="button"
          aria-label="InfluX"
          className="cursor-pointer border-0 bg-transparent p-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <BrandMark size="sm" />
        </button>
        <button
          type="button"
          onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}
          className="rounded-lg border border-white/[0.08] px-3 py-1.5 font-sans text-[11px] tracking-[0.16em]"
          aria-label={lang === 'ka' ? 'English' : 'ქართული'}
        >
          <span className={lang === 'ka' ? 'text-[#F2EFE9]' : 'text-[#8C8580]'}>KA</span>
          <span className="mx-1.5 text-white/25">/</span>
          <span className={lang === 'en' ? 'text-[#F2EFE9]' : 'text-[#8C8580]'}>EN</span>
        </button>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[72vh] bg-[radial-gradient(ellipse_at_top,rgba(92,24,39,0.28),transparent_62%)]" />
        <div className="relative flex flex-col items-center">
          <BrandMark size="lg" />
          <span className="mt-8 h-px w-12 bg-[#C9B087]/50" />
          <p className="mt-5 font-sans text-[11px] tracking-[0.22em] text-[#C9B087]">
            EXCLUSIVE ACCESS · HIGH-TICKET SERVICES
          </p>
          <h1 className="font-editorial mt-5 max-w-3xl text-4xl font-normal leading-[1.15] text-[#F2EFE9] sm:text-5xl">
            {t.headline}
          </h1>
          <p className="mt-5 max-w-xl font-sans text-sm leading-relaxed text-[#8C8580] sm:text-base">
            {t.subtitle}
          </p>
          <div className="mt-10 flex w-full max-w-sm flex-col gap-3 lg:max-w-2xl lg:flex-row lg:justify-center">
            <a
              href="https://wa.me/995500050607"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-[#F2EFE9] px-6 py-4 text-center font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#090808] transition-colors hover:bg-[#E7DEC8]"
            >
              {t.primary}
            </a>
            <Link
              href="/signup"
              className="flex-1 rounded-lg border border-white/15 px-6 py-4 text-center font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#F2EFE9] transition-colors hover:bg-white/[0.04]"
            >
              {t.secondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl border-b border-white/[0.08] px-6 pb-8">
        {t.cards.map((card, index) => (
          <article key={card.title} className="border-t border-white/[0.08] py-9">
            <p className="font-editorial text-sm italic text-[#C9B087]">{numerals[index]}</p>
            <h2 className="font-editorial mt-3 text-2xl font-medium text-[#F2EFE9] sm:text-3xl">{card.title}</h2>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-[#8C8580]">{card.text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 sm:flex-row sm:gap-16">
        <a
          href="https://wa.me/995500050607"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center"
        >
          <span className="block font-sans text-[11px] tracking-[0.16em] text-[#8C8580]">WhatsApp</span>
          <span className="mt-1 block font-sans text-base text-[#F2EFE9]">500 05 06 07</span>
        </a>
        <a href="mailto:sandro@influxapp.io" className="text-center">
          <span className="block font-sans text-[11px] tracking-[0.16em] text-[#8C8580]">Email</span>
          <span className="mt-1 block font-sans text-base text-[#F2EFE9]">sandro@influxapp.io</span>
        </a>
      </section>

      <Footer />
    </main>
  )
}
