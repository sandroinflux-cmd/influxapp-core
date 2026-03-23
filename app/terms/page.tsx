'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const termsData = [
  {
    id: '01',
    title: 'ტერმინთა განმარტება',
    content: (
      <ul className="list-disc pl-5 space-y-2 text-gray-400">
        <li><strong className="text-white">INFLUX (კომპანია):</strong> პლატფორმა, რომელიც უზრუნველყოფს ინფლუენსერ მარკეტინგის, ტრანზაქციების და საკომისიოების მართვის ავტომატიზაციას.</li>
        <li><strong className="text-white">ინფლუენსერი (კრეატორი):</strong> პირი, რომელიც რეგისტრირდება პლატფორმაზე გავლენის მონეტიზაციის მიზნით.</li>
        <li><strong className="text-white">ბრენდი (მოვაჭრე):</strong> იურიდიული ან ფიზიკური პირი, რომელიც იყენებს პლატფორმას პროდუქტის/სერვისის რეალიზაციისთვის ინფლუენსერების მეშვეობით.</li>
        <li><strong className="text-white">მომხმარებელი (გამომწერი):</strong> პირი, რომელიც ახორციელებს ტრანზაქციას ინფლუენსერის უნიკალური ბმულით/კოდით და იღებს ბენეფიტს.</li>
        <li><strong className="text-white">საკომისიო:</strong> ბრენდის მიერ ინფლუენსერისთვის გადახდილი თანხა გენერირებული გაყიდვებიდან.</li>
      </ul>
    )
  },
  {
    id: '02',
    title: 'ჩვენ შესახებ',
    content: <p>INFLUX არის მაღალტექნოლოგიური ეკოსისტემა, რომელიც აკავშირებს ბრენდებს, კრეატორებსა და მათ აუდიტორიას. ჩვენი მიზანია ინფლუენსერ მარკეტინგის ტრანსპარანტულ, გაზომვად და შედეგზე ორიენტირებულ პროცესად გარდაქმნა.</p>
  },
  {
    id: '03',
    title: 'საკონტაქტო ინფორმაცია',
    content: <p>ნებისმიერი იურიდიული, ტექნიკური თუ ფინანსური საკითხის დასაზუსტებლად დაგვიკავშირდით ელ. ფოსტაზე: <strong className="text-emerald-500">sandro@influxapp.io</strong> ან ტელეფონის ნომერზე <strong className="text-emerald-500">500 05 06 08</strong>.</p>
  },
  {
    id: '04',
    title: 'მომხმარებლის, კომპანიისა და მოვაჭრის ურთიერთობა',
    content: <p>INFLUX წარმოადგენს შუამავალ ტექნოლოგიურ რგოლს. პლატფორმა არ არის პროდუქტის მფლობელი. ბრენდი პასუხისმგებელია პროდუქტის ხარისხზე, ხოლო ინფლუენსერი — კონტენტის სიზუსტეზე. INFLUX პასუხისმგებელია ტრანზაქციის უსაფრთხოებასა და საკომისიოს სამართლიან განაწილებაზე.</p>
  },
  {
    id: '05',
    title: 'პლატფორმაზე რეგისტრაცია, მართვა და დახურვა',
    content: <p>რეგისტრაცია შესაძლებელია სამი როლით. სავალდებულოა ზუსტი იდენტიფიკაცია. მომხმარებელი ვალდებულია დაიცვას ავტორიზაციის მონაცემების კონფიდენციალურობა. ანგარიშის გაუქმება შესაძლებელია ნებისმიერ დროს, თუმცა მიმდინარე ტრანზაქციების დაფარვის ვალდებულება რჩება ძალაში.</p>
  },
  {
    id: '06',
    title: 'შეკვეთა და მისი გაუქმება',
    content: <p>ბრენდი ვალდებულია INFLUX-ის სისტემაში ატვირთული ფასები იყოს სინქრონიზებული რეალობასთან. მომხმარებლის მიერ შეკვეთის გაუქმება ექვემდებარება ბრენდის შიდა პოლიტიკას, რაც პირდაპირ აისახება ინფლუენსერის საკომისიოს გაუქმებაზეც (Anti-fraud მექანიზმი).</p>
  },
  {
    id: '07',
    title: 'ტრანსპორტირება',
    content: <p>პროდუქტის მიწოდებას უზრუნველყოფს თავად ბრენდი ან მესამე მხარე. INFLUX არ იღებს პასუხისმგებლობას ტრანსპორტირების დაგვიანებაზე ან ნივთის დაზიანებაზე.</p>
  },
  {
    id: '08',
    title: 'კომპანიის პასუხისმგებლობის ფარგლები',
    content: <p>ჩვენი პირდაპირი პასუხისმგებლობაა პლატფორმის უწყვეტი მუშაობა, ტრეკინგის სიზუსტე და ფინანსური სინქრონიზაცია საგადამხდელო ქსელებთან. INFLUX იხსნის პასუხისმგებლობას ფიზიკურ დავებზე (მაგ: პროდუქტის წუნი).</p>
  },
  {
    id: '09',
    title: 'ინფლუენსერის მოდულის წესები',
    content: <p>ინფლუენსერს ეკრძალება ყალბი ტრაფიკის (ბოტების) გამოყენება გაყიდვების გენერირებისთვის. წესის დარღვევა იწვევს დაგროვილი ტოკენების/თანხის გაყინვას.</p>
  },
  {
    id: '10',
    title: 'ბრენდის მოდულის წესები',
    content: <p>ბრენდი ვალდებულია გადაიხადოს შეთანხმებული საკომისიო INFLUX-ის სისტემაში დაფიქსირებულ ყველა ვალიდურ გაყიდვაზე. ბრენდს ეკრძალება ინფლუენსერთან პლატფორმის გვერდის ავლით ფარული გარიგების დადება.</p>
  },
  {
    id: '11',
    title: 'ანაზღაურება და ბალანსის მართვა',
    content: <p>საკომისიოს დარიცხვა ხდება ავტომატურად. ინფლუენსერს შეუძლია თანხის გატანა ვერიფიცირებულ საბანკო ანგარიშზე, მინიმალური ზღვრის მიღწევის შემდეგ. გადარიცხვები დაცულია საბანკო სტანდარტების შიფრაციით.</p>
  },
  {
    id: '12',
    title: 'პროდუქტის დაბრუნების პოლიტიკა',
    content: <p>თუ მომხმარებელი აბრუნებს პროდუქტს კანონმდებლობით დადგენილ 14 დღიან ვადაში, აღნიშნული ტრანზაქცია უქმდება. ბრენდს უბრუნდება გადახდილი საკომისიო, ხოლო ინფლუენსერის ბალანსიდან ხდება თანხის დექვითვა.</p>
  },
  {
    id: '13',
    title: 'აკრძალული ქმედებები და ინტელექტუალური საკუთრება',
    content: <p>აკრძალულია სისტემის გატეხვის მცდელობა. პლატფორმაზე არსებული დიზაინი, კოდი და ლოგო წარმოადგენს INFLUX-ის ექსკლუზიურ ინტელექტუალურ საკუთრებას.</p>
  },
  {
    id: '14',
    title: 'თაღლითობის დაფიქსირების წესი',
    content: <p>სისტემა აღჭურვილია AI მონიტორინგით. საეჭვო აქტივობის დაფიქსირებისას, ექაუნთი იყინება და ინფორმაცია გადაეცემა შესაბამის უწყებებს.</p>
  },
  {
    id: '15',
    title: 'მარეგულირებელი კანონმდებლობა',
    content: <p>წესები რეგულირდება საქართველოს კანონმდებლობით. დავა გადაწყდება თბილისის საქალაქო სასამართლოში.</p>
  }
]

export default function TermsPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#000000] text-gray-300 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 🛰️ Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-10 h-20 flex items-center justify-between">
        <h1 className="text-xl font-black italic tracking-tighter text-white">INFLUX</h1>
        <button 
          onClick={() => router.push('/')}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors"
        >
          [ Return Back ]
        </button>
      </nav>

      {/* 📜 Document Header */}
      <header className="pt-40 pb-20 px-6 max-w-4xl mx-auto border-b border-white/10">
        <span className="text-emerald-500 font-mono text-xs tracking-[0.5em] mb-6 block uppercase"></span>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-tight">
          მოხმარების წესები <br/> და პირობები
        </h1>
        <p className="mt-6 text-gray-500 uppercase tracking-widest text-[10px] font-bold">ბოლო განახლება: 2026 წლის 23 მარტი</p>
      </header>

      {/* 🧩 Protocol Sections */}
      <section className="py-20 px-6 max-w-4xl mx-auto space-y-16">
        {termsData.map((section, index) => (
          <motion.div 
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="relative pl-6 md:pl-10 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors duration-500 group"
          >
            <div className="absolute left-[-1.5px] top-0 h-4 w-[2px] bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-xl md:text-2xl font-black italic uppercase text-white mb-4 tracking-tight flex items-center gap-4">
              <span className="text-emerald-500/50 font-mono text-sm">{section.id}.</span>
              {section.title}
            </h2>
            <div className="text-sm md:text-base leading-relaxed text-gray-400 font-medium">
              {section.content}
            </div>
          </motion.div>
        ))}
      </section>

      {/* 🛡️ Footer Area */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-[10px] uppercase tracking-[0.5em] font-black">
        END OF PROTOCOL // INFLUX 2026
      </footer>

    </main>
  )
}