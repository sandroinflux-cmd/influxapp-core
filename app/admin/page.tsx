import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export const dynamic = 'force-dynamic' 

export default async function AdminDashboard(props: any) {
  // 🚀 1. პარამეტრების ამოღება
  const resolvedParams = await props.searchParams;
  const activeTab = resolvedParams?.tab || 'overview';
  const searchQuery = (resolvedParams?.q || '').trim(); // გავასუფთავეთ ზედმეტი სფეისებისგან
  const currentPage = Number(resolvedParams?.page) || 1;
  const limit = 50; // 🚀 გაიზარდა 50-მდე, როგორც ითხოვეთ!
  const offset = (currentPage - 1) * limit;

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // 🛡️ 2. ავტორიზაცია
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') redirect('/wallet')

  // 🚨 3. Pending ექაუნთები
  const { data: pendingUsers } = await supabase.from('profiles').select('*').eq('account_status', 'pending').neq('role', 'superadmin')

  // 📊 4. გლობალური სტატისტიკა
  const { data: allTx } = await supabase.from('transactions').select('system_fee, status')
  const { count: activePartnershipsCount } = await supabase.from('partnerships').select('*', { count: 'exact', head: true })
  
  const approvedTx = allTx?.filter(tx => tx.status === 'approved') || []
  const totalRevenue = approvedTx.reduce((sum, tx) => sum + Number(tx.system_fee || 0), 0)
  const totalTxCount = allTx?.length || 0

  // 🗂️ 5. ჭკვიანი პაგინაცია და სერჩი
  let tabData: any[] = [];
  let totalCount = 0;
  let txProfiles: any[] = [];

  if (activeTab === 'brands') {
    let query = supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'brand').neq('account_status', 'pending');
    if (searchQuery) query = query.ilike('full_name', `%${searchQuery}%`);
    const { data, count } = await query.range(offset, offset + limit - 1);
    tabData = data || [];
    totalCount = count || 0;
  } 
  else if (activeTab === 'influencers') {
    let query = supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'influencer').neq('account_status', 'pending');
    if (searchQuery) query = query.ilike('full_name', `%${searchQuery}%`);
    const { data, count } = await query.range(offset, offset + limit - 1);
    tabData = data || [];
    totalCount = count || 0;
  } 
  else if (activeTab === 'transactions') {
    let query = supabase.from('transactions').select('*', { count: 'exact' });

    // 🚀 ჭკვიანი ძებნა ტრანზაქციებისთვის
    if (searchQuery) {
      // ჯერ ვამოწმებთ, ხომ არ ჩაწერა იუზერის სახელი
      const { data: matchedProfiles } = await supabase.from('profiles').select('id').ilike('full_name', `%${searchQuery}%`);
      const matchedIds = matchedProfiles?.map(p => p.id) || [];

      if (matchedIds.length > 0) {
        // თუ სახელი იპოვა, მოძებნის ამ ადამიანის ტრანზაქციებს ან პირდაპირ სტატუსს
        query = query.or(`status.ilike.%${searchQuery}%,brand_id.in.(${matchedIds.join(',')}),influencer_id.in.(${matchedIds.join(',')})`);
      } else {
        // თუ სახელი არაა, ეძებს მხოლოდ სტატუსის მიხედვით (მაგ: 'approved')
        query = query.ilike('status', `%${searchQuery}%`);
      }
    }

    const { data, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    tabData = data || [];
    totalCount = count || 0;

    if (tabData.length > 0) {
      const profileIds = [...new Set(tabData.flatMap(tx => [tx.brand_id, tx.influencer_id]))];
      const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', profileIds);
      txProfiles = profs || [];
    }
  }

  const getProfileName = (id: string) => txProfiles.find(p => p.id === id)?.full_name || 'Unknown Node';
  const totalPages = Math.ceil(totalCount / limit);

  // 🖥️ 6. UI რენდერი
  return (
    <div className="min-h-screen bg-[#010201] text-white p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🛸 ჰედერი */}
        <header className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mt-4">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              InfluX <span className="text-white">Command Center</span>
            </h1>
            <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase mt-2 font-bold">
              Core Data Systems Active
            </p>
          </div>
        </header>

        {/* 🚨 Pending Approvals */}
        {pendingUsers && pendingUsers.length > 0 && (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-[30px] shadow-[0_0_30px_rgba(239,68,68,0.1)] mb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-400 italic mb-4 animate-pulse">
              🚨 Action Required: Pending Approvals ({pendingUsers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingUsers.map(u => (
                <Link href={`/admin/${u.id}`} key={u.id} className="flex items-center justify-between p-4 bg-black/60 border border-red-500/20 rounded-[20px] hover:bg-red-500/10 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{u.full_name}</h4>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{u.role}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-red-500 text-white px-3 py-1 rounded-full">Review</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 🗂️ ნავიგაციის ტაბები */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'transactions', label: '💳 Transactions' },
            { id: 'brands', label: '🏢 Brands' },
            { id: 'influencers', label: '👤 Influencers' },
          ].map(tab => (
            <Link 
              key={tab.id} 
              href={`/admin?tab=${tab.id}`}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* 🔍 საძიებო ველი (Overview-ს გარდა ყველგან ჩანს) */}
        {activeTab !== 'overview' && (
          <form method="GET" action="/admin" className="flex items-center gap-2 max-w-md w-full animate-in fade-in duration-500">
             <input type="hidden" name="tab" value={activeTab} />
             <input 
               type="text" 
               name="q" 
               defaultValue={searchQuery} 
               placeholder={`Search ${activeTab}...`} 
               className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-colors"
             />
             <button type="submit" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
               Scan
             </button>
             {searchQuery && (
               <Link href={`/admin?tab=${activeTab}`} className="text-gray-500 hover:text-white text-xs px-3">Clear</Link>
             )}
          </form>
        )}

        {/* ========================================= */}
        {/* 1. OVERVIEW TAB */}
        {/* ========================================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/30 p-8 rounded-[35px] relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]">
              <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">💰</div>
              <h3 className="text-[10px] text-emerald-500 uppercase tracking-widest mb-3 font-black">Total Platform Revenue</h3>
              <p className="text-5xl font-black italic tracking-tighter text-white">
                {totalRevenue.toFixed(2)} <span className="text-lg text-emerald-500 tracking-normal">GEL</span>
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[35px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">🤝</div>
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-3 font-bold">Active Partnerships</h3>
              <p className="text-5xl font-black italic tracking-tighter text-white">{activePartnershipsCount || 0}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[35px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">⚡</div>
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-3 font-bold">Processed Transactions</h3>
              <p className="text-5xl font-black italic tracking-tighter text-white">{totalTxCount}</p>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* 2. TRANSACTIONS TAB */}
        {/* ========================================= */}
        {activeTab === 'transactions' && (
          <div className="bg-white/[0.02] border border-white/5 rounded-[30px] overflow-hidden overflow-x-auto animate-in fade-in duration-500">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-white/[0.02] text-gray-500 uppercase tracking-widest">
                <tr>
                  <th className="p-5 font-normal">Date</th>
                  <th className="p-5 font-normal">Brand</th>
                  <th className="p-5 font-normal">Influencer</th>
                  <th className="p-5 font-normal">Total</th>
                  <th className="p-5 font-normal text-emerald-500">Sys Fee</th>
                  <th className="p-5 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tabData.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-gray-400">{tx.created_at?.split('T')[0]}</td>
                    <td className="p-5 text-white font-bold">{getProfileName(tx.brand_id)}</td>
                    <td className="p-5 text-gray-300">{getProfileName(tx.influencer_id)}</td>
                    <td className="p-5">{Number(tx.final_amount).toFixed(2)} GEL</td>
                    <td className="p-5 text-emerald-400 font-bold">+{Number(tx.system_fee).toFixed(2)} GEL</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                        tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        tx.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {tabData.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No matching records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================= */}
        {/* 3. BRANDS TAB */}
        {/* ========================================= */}
        {activeTab === 'brands' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
            {tabData.map(b => (
              <Link href={`/admin/${b.id}`} key={b.id} className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-[25px] hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                    {b.avatar_url ? <img src={b.avatar_url} className="w-full h-full object-cover" alt="logo" /> : <div className="w-full h-full flex items-center justify-center text-sm">🏢</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{b.full_name}</h4>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{b.account_status}</p>
                  </div>
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Registered IBAN</p>
                  <p className="text-xs font-mono text-gray-300 truncate">{b.iban || 'Not Provided'}</p>
                </div>
              </Link>
            ))}
            {tabData.length === 0 && <p className="text-gray-500 italic col-span-full">No brands found.</p>}
          </div>
        )}

        {/* ========================================= */}
        {/* 4. INFLUENCERS TAB */}
        {/* ========================================= */}
        {activeTab === 'influencers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
            {tabData.map(i => (
              <Link href={`/admin/${i.id}`} key={i.id} className="flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-[25px] hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                    {i.avatar_url ? <img src={i.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <div className="w-full h-full flex items-center justify-center text-sm">👤</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{i.full_name}</h4>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{i.account_status}</p>
                  </div>
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Registered IBAN</p>
                  <p className="text-xs font-mono text-gray-300 truncate">{i.iban || 'Not Provided'}</p>
                </div>
              </Link>
            ))}
            {tabData.length === 0 && <p className="text-gray-500 italic col-span-full">No influencers found.</p>}
          </div>
        )}

        {/* 📑 PAGINATION (გვერდების გადასართავი) */}
        {totalPages > 1 && activeTab !== 'overview' && (
          <div className="flex items-center justify-center gap-4 pt-8">
            <Link 
              href={`/admin?tab=${activeTab}&q=${searchQuery}&page=${Math.max(1, currentPage - 1)}`}
              className={`px-6 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest ${currentPage === 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-white/10'}`}
            >
              Previous
            </Link>
            <span className="text-[10px] text-gray-500 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <Link 
              href={`/admin?tab=${activeTab}&q=${searchQuery}&page=${Math.min(totalPages, currentPage + 1)}`}
              className={`px-6 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest ${currentPage === totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-white/10'}`}
            >
              Next
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}