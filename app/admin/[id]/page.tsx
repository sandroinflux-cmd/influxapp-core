import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NodeInspector(props: any) {
  const resolvedParams = await props.params;
  const targetId = resolvedParams?.id;

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // 🛡️ ავტორიზაცია
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'superadmin') redirect('/wallet')

  // 👤 იუზერის მონაცემები
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetId).single()
  if (!profile) redirect('/admin') 

  const isBrand = profile.role === 'brand'
  
  // 📊 ტრანზაქციები და პარტნიორობები
  const txColumn = isBrand ? 'brand_id' : 'influencer_id'
  const { data: transactions } = await supabase.from('transactions').select('*').eq(txColumn, profile.id).order('created_at', { ascending: false })
  
  const partnerColumn = isBrand ? 'brand_id' : 'influencer_id'
  const { data: partnerships } = await supabase.from('partnerships').select('*, deals(*)').eq(partnerColumn, profile.id)

  const approvedTx = transactions?.filter(tx => tx.status === 'approved') || []
  const userGeneratedRevenue = approvedTx.reduce((sum, tx) => sum + Number(tx.system_fee || 0), 0)

  // 🔍 Bio-ს (სოციალური ქსელების) უსაფრთხო წაკითხვა
  let socialLinks: any = {}
  let bioText = ''
  try {
    const parsed = JSON.parse(profile.bio || '{}')
    if (parsed.instagram !== undefined) socialLinks = parsed
    else bioText = profile.bio
  } catch (e) {
    bioText = profile.bio || 'No intel provided.'
  }

  // ==========================================
  // 🔴 SERVER ACTIONS (სუპერ-ძალები)
  // ==========================================
  async function updateStatus(formData: FormData) {
    'use server'
    const newStatus = formData.get('status') as string
    const uId = formData.get('userId') as string
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await supabaseAdmin.from('profiles').update({ account_status: newStatus }).eq('id', uId)
    revalidatePath(`/admin/${uId}`); revalidatePath(`/admin`) 
  }

  async function updateFinancials(formData: FormData) {
    'use server'
    const newIban = formData.get('iban') as string
    const dRate = formData.get('discount_rate') as string
    const cRate = formData.get('commission_rate') as string
    const uId = formData.get('userId') as string
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await supabaseAdmin.from('profiles').update({ iban: newIban, discount_rate: dRate, commission_rate: cRate }).eq('id', uId)
    revalidatePath(`/admin/${uId}`)
  }

  async function updateNotes(formData: FormData) {
    'use server'
    const notes = formData.get('admin_notes') as string
    const uId = formData.get('userId') as string
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await supabaseAdmin.from('profiles').update({ admin_notes: notes }).eq('id', uId)
    revalidatePath(`/admin/${uId}`)
  }

  // ==========================================
  // 🖥️ UI (ინტერფეისი)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#010201] text-white p-4 md:p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <Link href="/admin?tab=overview" className="inline-block text-[10px] text-gray-500 hover:text-white uppercase tracking-widest font-bold transition-colors">
          [ 🔙 Back to Directory ]
        </Link>

        {/* 🛸 1. პროფილის ჰედერი & KILL SWITCH */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 flex items-center gap-6 relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.01)]">
            {profile.account_status === 'suspended' && <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse" />}
            <div className="w-20 h-20 rounded-full bg-white/10 shrink-0 border-2 border-white/20 overflow-hidden flex items-center justify-center text-2xl">
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : (isBrand ? '🏢' : '👤')}
            </div>
            <div className="relative z-10 flex-1">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">{profile.full_name}</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold mt-1">Node ID: {profile.id.split('-')[0]}</p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  profile.account_status === 'approved' ? 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10' : 
                  profile.account_status === 'pending' ? 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10' : 
                  'text-red-500 border-red-500/50 bg-red-500/10'
                }`}>
                {profile.account_status}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <form action={updateStatus} className="w-full">
              <input type="hidden" name="userId" value={profile.id} />
              <input type="hidden" name="status" value="approved" />
              <button disabled={profile.account_status === 'approved'} className="w-full py-4 rounded-[20px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 uppercase tracking-widest font-black text-[10px] hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                ✓ Approve
              </button>
            </form>
            <form action={updateStatus} className="w-full">
              <input type="hidden" name="userId" value={profile.id} />
              <input type="hidden" name="status" value="suspended" />
              <button disabled={profile.account_status === 'suspended'} className="w-full py-4 rounded-[20px] bg-red-500/10 border border-red-500/30 text-red-500 uppercase tracking-widest font-black text-[10px] hover:bg-red-500 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                ☠️ Suspend
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* მარცხენა სვეტი: ფინანსები და შენიშვნები */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 🏦 2. ფინანსური პარამეტრების მართვა (RATES OVERRIDE) */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[30px] p-6 lg:p-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400 italic">Financial Controller</h2>
                <div className="text-right">
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest block">Generated for InfluX</span>
                  <span className="text-xl font-black text-white italic">{userGeneratedRevenue.toFixed(2)} GEL</span>
                </div>
              </div>
              
              <form action={updateFinancials} className="space-y-5">
                <input type="hidden" name="userId" value={profile.id} />
                
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 block">Bank IBAN (Split Target)</label>
                  <input type="text" name="iban" defaultValue={profile.iban || ''} placeholder="GE00BG00..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-emerald-500 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {isBrand ? (
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 block">Discount Rate (%)</label>
                      <input type="number" name="discount_rate" defaultValue={profile.discount_rate || ''} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-emerald-500 outline-none" />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 block">Commission Rate (%)</label>
                      <input type="number" name="commission_rate" defaultValue={profile.commission_rate || ''} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-emerald-500 outline-none" />
                    </div>
                  )}
                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5">
                      Save Rates & IBAN
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* 📝 3. პირადი შენიშვნები (INTERNAL NOTES) */}
            <div className="bg-yellow-500/[0.02] border border-yellow-500/20 rounded-[30px] p-6 lg:p-8">
               <h2 className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500 italic mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Internal Admin Notes
               </h2>
               <form action={updateNotes} className="space-y-3">
                 <input type="hidden" name="userId" value={profile.id} />
                 <textarea name="admin_notes" defaultValue={profile.admin_notes || ''} placeholder="Secure notes... Only visible to Superadmin." className="w-full bg-black/50 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none min-h-[100px] resize-none" />
                 <button type="submit" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-yellow-500/30">
                    Save Note
                 </button>
               </form>
            </div>

          </div>

          {/* მარჯვენა სვეტი: KYC & Partnerships */}
          <div className="space-y-6">
            
            {/* 📱 4. ვერიფიკაცია და საკონტაქტო (KYC) */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[30px] p-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Node Intel (KYC)</h2>
              {!isBrand && Object.keys(socialLinks).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(socialLinks).map(([platform, link]: any) => link && (
                    <div key={platform} className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-gray-400">{platform}</span>
                      <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" className="text-[10px] text-blue-400 hover:underline truncate max-w-[120px]">{link}</a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-400 italic">{bioText || 'No additional intel.'}</p>
                </div>
              )}
            </div>

            {/* 🔳 5. QR Code Panel (მხოლოდ ბრენდებისთვის) */}
            {isBrand && (
              <div className="bg-blue-500/[0.02] border border-blue-500/20 rounded-[30px] p-6 text-center">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Matrix Access Node</h2>
                 <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${profile.id}`} alt="QR" className="w-full h-full" />
                 </div>
                 <p className="text-[8px] text-gray-500 font-mono mt-3 break-all">ID: {profile.id}</p>
              </div>
            )}

            {/* 🤝 6. აქტიური პარტნიორობები */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[30px] p-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Active Links ({partnerships?.length || 0})</h2>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                {partnerships?.map((p: any) => (
                  <div key={p.id} className="bg-black/50 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                     <span className="text-[10px] font-bold truncate max-w-[120px]">{p.deals?.title || 'Unknown Deal'}</span>
                     <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">Linked</span>
                  </div>
                ))}
                {(!partnerships || partnerships.length === 0) && <p className="text-[10px] text-gray-600 italic">No partnerships yet.</p>}
              </div>
            </div>

          </div>
        </div>

        {/* 💳 7. პერსონალური აუდიტი (PERSONAL TRANSACTIONS) */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[30px] p-6 lg:p-8 overflow-hidden overflow-x-auto">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 italic mb-6">Recent Audits (Last 10)</h2>
          <table className="w-full text-left text-[11px] font-mono">
            <thead className="text-gray-500 uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="pb-3 font-normal">Date</th>
                <th className="pb-3 font-normal">Amount</th>
                <th className="pb-3 font-normal text-emerald-500">Sys Fee</th>
                <th className="pb-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions?.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 text-gray-400">{tx.created_at?.split('T')[0]}</td>
                  <td className="py-3 text-white">{Number(tx.final_amount).toFixed(2)} GEL</td>
                  <td className="py-3 text-emerald-400">+{Number(tx.system_fee).toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-[8px] uppercase tracking-widest font-bold ${
                      tx.status === 'approved' ? 'text-emerald-500 bg-emerald-500/10' :
                      tx.status === 'rejected' ? 'text-red-500 bg-red-500/10' : 'text-yellow-500 bg-yellow-500/10'
                    }`}>{tx.status}</span>
                  </td>
                </tr>
              ))}
              {(!transactions || transactions.length === 0) && (
                <tr><td colSpan={4} className="py-6 text-center text-gray-500 italic">No financial activity recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}