import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI, financeAdminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'

/* ─── helpers ─────────────────────────────────────────────── */
const money = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0)

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const shortDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ─── sub-components ──────────────────────────────────────── */
function StatCard({ label, value, sub, color = 'brand', icon }) {
  const colors = {
    brand: 'from-brand-500/20 to-brand-600/5 border-brand-500/20 text-brand-400',
    success: 'from-success-500/20 to-success-600/5 border-success-500/20 text-success-400',
    danger: 'from-danger-500/20 to-danger-600/5 border-danger-500/20 text-danger-400',
    warning: 'from-warning-500/20 to-warning-600/5 border-warning-500/20 text-warning-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
  }
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-surface-500">{sub}</p>}
        </div>
        {icon && <span className="text-2xl opacity-70">{icon}</span>}
      </div>
    </div>
  )
}

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-white">{children}</h2>
      {action}
    </div>
  )
}

const TABS = ['Overview', 'Transactions', 'Tips Management']

/* ─── monthly trend chart ──────────────────────────────────── */
function TrendChart({ monthlyTrend }) {
  // Build month buckets for last 6 months
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_NAMES[d.getMonth()] }
  })

  const dataMap = {}
  ;(monthlyTrend || []).forEach((item) => {
    const key = `${item._id.year}-${item._id.month}-${item._id.type}`
    dataMap[key] = item.total
  })

  const incomes = months.map((m) => dataMap[`${m.year}-${m.month}-income`] || 0)
  const expenses = months.map((m) => dataMap[`${m.year}-${m.month}-expense`] || 0)
  const maxVal = Math.max(...incomes, ...expenses, 1)

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-36">
        {months.map((m, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 h-28">
              <div
                className="flex-1 bg-success-500/70 rounded-t-sm transition-all duration-700"
                style={{ height: `${(incomes[i] / maxVal) * 100}%`, minHeight: incomes[i] > 0 ? 4 : 0 }}
                title={`Income: ${money(incomes[i])}`}
              />
              <div
                className="flex-1 bg-danger-500/70 rounded-t-sm transition-all duration-700"
                style={{ height: `${(expenses[i] / maxVal) * 100}%`, minHeight: expenses[i] > 0 ? 4 : 0 }}
                title={`Expense: ${money(expenses[i])}`}
              />
            </div>
            <span className="text-[10px] text-surface-500">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <span className="flex items-center gap-1.5 text-xs text-surface-400">
          <span className="w-3 h-3 rounded-sm bg-success-500/70 inline-block" /> Income
        </span>
        <span className="flex items-center gap-1.5 text-xs text-surface-400">
          <span className="w-3 h-3 rounded-sm bg-danger-500/70 inline-block" /> Expense
        </span>
      </div>
    </div>
  )
}

/* ─── category chart ───────────────────────────────────────── */
function CategoryInsights({ data }) {
  const expenses = (data || []).filter((d) => d._id.type === 'expense').slice(0, 6)
  const maxVal = Math.max(...expenses.map((d) => d.total), 1)

  if (!expenses.length) return <p className="text-sm text-surface-500">No expense data available.</p>

  return (
    <div className="space-y-3">
      {expenses.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-surface-300 capitalize">{item._id.category || 'Uncategorized'}</span>
            <span className="text-surface-400">{money(item.total)}</span>
          </div>
          <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
              style={{ width: `${(item.total / maxVal) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── main component ─────────────────────────────────────────- */
export default function AdminFinance({ initialTab }) {
  const { toast } = useToast()
  const [tab, setTab] = useState(initialTab || 'Overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Transaction filters
  const [txType, setTxType] = useState('')
  const [txPage, setTxPage] = useState(1)
  const [txSearch, setTxSearch] = useState('')

  // Transaction form
  const [txFormVisible, setTxFormVisible] = useState(false)
  const [editingTxId, setEditingTxId] = useState(null)
  const initialTxForm = { user: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().slice(0, 10), notes: '', mode: 'Cash' }
  const [txForm, setTxForm] = useState(initialTxForm)
  const [txLoadingBtn, setTxLoadingBtn] = useState(false)
  const [allUsers, setAllUsers] = useState([])

  // Tips management
  const initialTipForm = { title: '', content: '', tag: 'general', active: true }
  const [tips, setTips] = useState([])
  const [tipForm, setTipForm] = useState(initialTipForm)
  const [editingTipId, setEditingTipId] = useState(null)
  const [tipLoading, setTipLoading] = useState(false)

  // ── load overview
  const loadOverview = useCallback(async (p = txPage, t = txType, s = txSearch) => {
    setLoading(true)
    try {
      const params = { page: p, type: t || undefined }
      if (s.trim()) params.search = s.trim()
      const { data: res } = await adminAPI.financeOverview(params)
      setData(res)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load finance overview', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadOverview(txPage, txType, txSearch) }, [txPage, txType, loadOverview])

  // ── load tips when tab switches
  const loadTips = useCallback(() => {
    financeAdminAPI.tips()
      .then(({ data: res }) => setTips(res.tips || []))
      .catch(() => { /* ignore */ })
  }, [])

  useEffect(() => {
    if (tab === 'Tips Management') loadTips()
  }, [tab, loadTips])

  // ── transaction filter change
  const applyFilter = (type) => { setTxType(type); setTxPage(1) }
  const handleSearch = () => { setTxPage(1); loadOverview(1, txType, txSearch) }

  // ── transaction form handlers
  const loadUsersForTx = async () => {
    if (allUsers.length > 0) return
    try {
      const { data: res } = await adminAPI.users({ limit: 1000 })
      setAllUsers(res.users || [])
    } catch (e) {
      console.error('Failed to load users for tx', e)
    }
  }

  const handleOpenTxForm = (tx = null) => {
    loadUsersForTx()
    if (tx) {
      setEditingTxId(tx._id)
      setTxForm({
        user: tx.user?._id || '',
        amount: tx.amount || '',
        type: tx.type || 'expense',
        category: tx.category || '',
        date: tx.date ? new Date(tx.date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
        notes: tx.notes || tx.note || '',
        mode: tx.mode || 'Cash'
      })
    } else {
      setEditingTxId(null)
      setTxForm(initialTxForm)
    }
    setTxFormVisible(!txFormVisible)
  }

  const handleTxSubmit = async (e) => {
    e.preventDefault()
    setTxLoadingBtn(true)
    try {
      if (editingTxId) {
        await adminAPI.updateTransaction(editingTxId, txForm)
        toast('Transaction updated!', 'success')
      } else {
        await adminAPI.addTransaction(txForm)
        toast('Transaction created!', 'success')
      }
      setTxFormVisible(false)
      loadOverview()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save transaction', 'error')
    } finally {
      setTxLoadingBtn(false)
    }
  }

  const handleDeleteTx = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await adminAPI.deleteTransaction(id)
      toast('Transaction deleted.', 'success')
      if (data?.transactions?.length === 1 && txPage > 1) {
        setTxPage(p => p - 1)
      } else {
        loadOverview()
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete transaction', 'error')
    }
  }

  // ── tip handlers
  const handleTipSubmit = async (e) => {
    e.preventDefault()
    setTipLoading(true)
    try {
      if (editingTipId) {
        await financeAdminAPI.updateTip(editingTipId, tipForm)
        toast('Finance tip updated!', 'success')
      } else {
        await financeAdminAPI.addTip(tipForm)
        toast('Finance tip added!', 'success')
      }
      setTipForm(initialTipForm)
      setEditingTipId(null)
      loadTips()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save tip', 'error')
    } finally {
      setTipLoading(false)
    }
  }

  const handleEditTip = (tip) => {
    setEditingTipId(tip._id)
    setTipForm({ title: tip.title || '', content: tip.content || '', tag: tip.tag || 'general', active: Boolean(tip.active) })
  }

  const handleDeleteTip = async (id) => {
    if (!window.confirm('Delete this finance tip?')) return
    try {
      await financeAdminAPI.deleteTip(id)
      toast('Tip deleted.', 'success')
      loadTips()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete tip', 'error')
    }
  }

  const summary = data?.summary || {}

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* ── header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-1">Admin Panel</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Finance Module</h1>
          <p className="text-surface-400 text-sm mt-1">Platform-wide financial intelligence &amp; management</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/finance-admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-surface-800 text-surface-200 hover:bg-surface-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Finance Admin
          </Link>
        </div>
      </div>

      {/* ── tabs */}
      <div className="flex gap-1 p-1 bg-surface-900 rounded-xl border border-surface-800 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t
                ? 'bg-brand-500/20 text-brand-300 shadow-inner'
                : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ═══════ OVERVIEW TAB ═══════ */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              {/* summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
                <StatCard label="Transactions" value={summary.totalTransactions || 0} color="brand" icon="💸" />
                <StatCard label="Budgets" value={summary.totalBudgets || 0} color="warning" icon="📊" />
                <StatCard label="Goals" value={summary.totalGoals || 0} color="purple" icon="🎯" />
                <StatCard label="Tips" value={summary.totalTips || 0} color="brand" icon="💡" />
                <StatCard
                  label="Total Income"
                  value={money(summary.totalIncome)}
                  color="success"
                  icon="📈"
                />
                <StatCard
                  label="Total Expense"
                  value={money(summary.totalExpense)}
                  color="danger"
                  icon="📉"
                />
                <StatCard
                  label="Net Balance"
                  value={money(summary.balance)}
                  color={summary.balance >= 0 ? 'success' : 'danger'}
                  icon="⚖️"
                />
              </div>

              <div className="grid xl:grid-cols-3 gap-6">
                {/* Monthly Trend */}
                <div className="xl:col-span-2 glass-dark rounded-2xl p-5 border border-surface-800">
                  <SectionTitle>6-Month Cash Flow Trend</SectionTitle>
                  <TrendChart monthlyTrend={data?.monthlyTrend} />
                </div>

                {/* Top Spenders */}
                <div className="glass-dark rounded-2xl p-5 border border-surface-800">
                  <SectionTitle>Top Spenders</SectionTitle>
                  <div className="space-y-3">
                    {(data?.topSpenders || []).length > 0 ? data.topSpenders.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/60">
                        <div className="w-7 h-7 rounded-lg bg-danger-500/20 text-danger-400 text-xs font-bold flex items-center justify-center shrink-0">
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{s.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-surface-500 truncate">{s.user?.email}</p>
                        </div>
                        <span className="text-sm font-semibold text-danger-400 shrink-0">{money(s.totalSpent)}</span>
                      </div>
                    )) : <p className="text-sm text-surface-500">No expense data yet.</p>}
                  </div>
                </div>
              </div>

              <div className="grid xl:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="glass-dark rounded-2xl p-5 border border-surface-800">
                  <SectionTitle>Top Expense Categories</SectionTitle>
                  <CategoryInsights data={data?.categoryBreakdown} />
                </div>

                {/* Recent Saving Goals */}
                <div className="glass-dark rounded-2xl p-5 border border-surface-800">
                  <SectionTitle
                    action={
                      <span className="text-xs text-surface-500">{summary.totalGoals || 0} total</span>
                    }
                  >
                    Recent Saving Goals
                  </SectionTitle>
                  <div className="space-y-3">
                    {(data?.recentGoals || []).length > 0 ? data.recentGoals.map((g) => {
                      const pct = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100))
                      return (
                        <div key={g._id} className="p-3 rounded-xl bg-surface-900/60 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-white truncate">{g.name}</p>
                            <span className="text-xs text-surface-400 shrink-0">{g.user?.name || 'User'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-brand-400 font-semibold shrink-0">{pct}%</span>
                          </div>
                          <div className="flex justify-between text-xs text-surface-500">
                            <span>{money(g.currentAmount)} saved</span>
                            <span>Goal: {money(g.targetAmount)}</span>
                          </div>
                        </div>
                      )
                    }) : <p className="text-sm text-surface-500">No saving goals yet.</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════ TRANSACTIONS TAB ═══════ */}
      {tab === 'Transactions' && (
        <div className="space-y-5">
          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-surface-400 font-medium">Filter:</span>
              {['', 'income', 'expense'].map((t) => (
                <button
                  key={t || 'all'}
                  onClick={() => applyFilter(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    txType === t
                      ? t === 'income' ? 'bg-success-500/20 border-success-500/30 text-success-300'
                        : t === 'expense' ? 'bg-danger-500/20 border-danger-500/30 text-danger-300'
                        : 'bg-brand-500/20 border-brand-500/30 text-brand-300'
                      : 'bg-surface-900 border-surface-800 text-surface-400 hover:text-white'
                  }`}
                >
                  {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}

              <div className="flex items-center ml-2 relative">
                <input
                  className="w-48 bg-surface-900 border border-surface-700/50 rounded-xl pl-3 pr-8 py-1.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="Search user..."
                  value={txSearch}
                  onChange={e => setTxSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="absolute right-2 top-1.5 text-surface-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <span className="text-sm text-surface-500 font-medium">
                {data?.txTotal || 0} total mapping records
              </span>
              <Button onClick={() => handleOpenTxForm(null)}>+ Add TX</Button>
            </div>
          </div>

          {/* Form */}
          {txFormVisible && (
            <div className="glass-dark rounded-2xl p-5 border border-surface-800 mb-5">
              <h2 className="text-lg font-semibold text-white mb-4">{editingTxId ? 'Edit Transaction' : 'Create Transaction'}</h2>
              <form onSubmit={handleTxSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-400 mb-1">User</label>
                  <select
                    value={txForm.user}
                    onChange={(e) => setTxForm(p => ({ ...p, user: e.target.value }))}
                    className="w-full bg-surface-900 border border-surface-700/50 rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-500 transition-colors"
                    required
                  >
                    <option value="">Select a user...</option>
                    {allUsers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
                <div>
                  <Input label="Category" required value={txForm.category} onChange={e => setTxForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Salary, Rent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-400 mb-1">Type</label>
                  <select
                    value={txForm.type}
                    onChange={(e) => setTxForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-surface-900 border border-surface-700/50 rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-500 transition-colors"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <Input label="Amount (INR)" type="number" step="0.01" required value={txForm.amount} onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <Input label="Date" type="date" required value={txForm.date} onChange={e => setTxForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <Input label="Mode" value={txForm.mode} onChange={e => setTxForm(p => ({ ...p, mode: e.target.value }))} placeholder="e.g. Cash, UPI, Bank Transfer" />
                </div>
                <div className="md:col-span-2">
                  <Input label="Notes" value={txForm.notes} onChange={e => setTxForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <Button type="button" variant="secondary" onClick={() => setTxFormVisible(false)}>Cancel</Button>
                  <Button type="submit" loading={txLoadingBtn}>{editingTxId ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="glass-dark rounded-2xl border border-surface-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-800">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Note</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800">
                    {(data?.transactions || []).length > 0 ? data.transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-surface-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-white">{tx.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-surface-500">{tx.user?.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-surface-300 capitalize">{tx.category || '—'}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>
                            {tx.type}
                          </Badge>
                        </td>
                        <td className={`px-5 py-3.5 text-right font-semibold ${tx.type === 'income' ? 'text-success-400' : 'text-danger-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{money(tx.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-surface-400 text-xs">{shortDate(tx.date)}</td>
                        <td className="px-5 py-3.5 text-surface-500 text-xs max-w-[160px] truncate">{tx.notes || tx.note || '—'}</td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <button onClick={() => handleOpenTxForm(tx)} className="text-brand-400 hover:text-brand-300 mx-2 text-xs font-medium">Edit</button>
                          <button onClick={() => handleDeleteTx(tx._id)} className="text-danger-400 hover:text-danger-300 mx-2 text-xs font-medium">Delete</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-surface-500">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(data?.txPages || 0) > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-surface-800">
                  <span className="text-xs text-surface-500">
                    Page {data?.txPage} of {data?.txPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={txPage <= 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-800 text-surface-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setTxPage((p) => Math.min(data?.txPages || 1, p + 1))}
                      disabled={txPage >= (data?.txPages || 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-800 text-surface-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════ TIPS MANAGEMENT TAB ═══════ */}
      {tab === 'Tips Management' && (
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* Add/Edit form */}
          <div className="glass-dark rounded-2xl p-5 border border-surface-800 h-fit">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingTipId ? '✏️ Edit Tip' : '➕ Add Finance Tip'}
            </h2>
            <form onSubmit={handleTipSubmit} className="space-y-4">
              <Input
                label="Title"
                value={tipForm.title}
                onChange={(e) => setTipForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
              <Input
                label="Tag"
                value={tipForm.tag}
                onChange={(e) => setTipForm((p) => ({ ...p, tag: e.target.value }))}
                placeholder="e.g. savings, investment, tax"
              />
              <Textarea
                label="Content"
                value={tipForm.content}
                onChange={(e) => setTipForm((p) => ({ ...p, content: e.target.value }))}
                rows={5}
                required
              />
              <label className="flex items-center gap-2.5 text-sm text-surface-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tipForm.active}
                  onChange={(e) => setTipForm((p) => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500 rounded"
                />
                Visible to users (Active)
              </label>
              <div className="flex gap-3">
                <Button type="submit" loading={tipLoading}>
                  {editingTipId ? 'Update Tip' : 'Add Tip'}
                </Button>
                {editingTipId && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => { setTipForm(initialTipForm); setEditingTipId(null) }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Tips list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">All Finance Tips</h2>
              <span className="text-sm text-surface-500">{tips.length} tips</span>
            </div>
            {tips.length > 0 ? tips.map((tip) => (
              <div key={tip._id} className="glass-dark rounded-2xl p-4 border border-surface-800 hover:border-surface-700 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-white">{tip.title}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md bg-surface-800 text-surface-400">
                      #{tip.tag || 'general'}
                    </span>
                  </div>
                  <Badge variant={tip.active ? 'success' : 'danger'}>
                    {tip.active ? 'Active' : 'Hidden'}
                  </Badge>
                </div>
                <p className="text-sm text-surface-300 leading-relaxed">{tip.content}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEditTip(tip)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTip(tip._id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )) : (
              <div className="glass-dark rounded-2xl p-10 border border-surface-800 text-center">
                <p className="text-surface-500">No finance tips yet. Add your first tip!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
