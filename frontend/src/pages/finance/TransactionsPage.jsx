import { useEffect, useMemo, useState } from 'react'
import { financeAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { money, shortDate } from '../../utils/finance'

const emptyForm = { date: '', type: 'expense', category: '', amount: '', mode: 'Cash', notes: '' }

export default function TransactionsPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState({ from: '', to: '', type: '', category: '' })
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadData = async (nextFilters = filters) => {
    try {
      const params = Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value))
      const { data } = await financeAPI.transactions(params)
      setTransactions(data.transactions || [])
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load transactions', 'error')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const totals = useMemo(() => ({
    income: transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
    expense: transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
  }), [transactions])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await financeAPI.updateTransaction(editingId, form)
        toast('Transaction updated', 'success')
      } else {
        await financeAPI.addTransaction(form)
        toast('Transaction added', 'success')
      }
      setForm(emptyForm)
      setEditingId(null)
      loadData()
    } catch (err) {
      toast(err.response?.data?.message || 'Could not save transaction', 'error')
    } finally {
      setSaving(false)
    }
  }

  const editRow = (tx) => {
    setEditingId(tx._id)
    setForm({
      date: tx.date ? new Date(tx.date).toISOString().slice(0, 10) : '',
      type: tx.type || 'expense',
      category: tx.category || '',
      amount: tx.amount || '',
      mode: tx.mode || 'Cash',
      notes: tx.notes || '',
    })
  }

  const removeRow = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await financeAPI.deleteTransaction(id)
      toast('Transaction deleted', 'success')
      loadData()
    } catch (err) {
      toast(err.response?.data?.message || 'Delete failed', 'error')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <p className="text-sm text-brand-300 font-medium">Module B</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Transactions</h1>
        <p className="text-surface-400 mt-1">Add, edit, delete and filter income or expense entries.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card><p className="text-xs text-surface-400 uppercase tracking-wider">Income</p><p className="text-2xl font-bold text-success-400 mt-2">{money(totals.income)}</p></Card>
        <Card><p className="text-xs text-surface-400 uppercase tracking-wider">Expense</p><p className="text-2xl font-bold text-danger-400 mt-2">{money(totals.expense)}</p></Card>
        <Card><p className="text-xs text-surface-400 uppercase tracking-wider">Balance</p><p className="text-2xl font-bold text-brand-400 mt-2">{money(totals.income - totals.expense)}</p></Card>
      </div>

      <Card>
        <form onSubmit={submit} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]} />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <Input label="Amount" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <Input label="Mode" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-3">
            <Button type="submit" loading={saving}>{editingId ? 'Update Transaction' : 'Add Transaction'}</Button>
            {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel Edit</Button>}
          </div>
        </form>
      </Card>

      <Card>
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
          <Input label="From" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <Input label="To" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          <Select label="Type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} options={[{ value: '', label: 'All types' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]} />
          <Input label="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={() => loadData()}>Apply</Button>
            <Button variant="secondary" onClick={() => { const reset = { from: '', to: '', type: '', category: '' }; setFilters(reset); loadData(reset) }}>Reset</Button>
          </div>
        </div>
      </Card>

      <Card padding="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-900/90 text-surface-300">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Mode</th>
                <th className="text-left px-4 py-3">Notes</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length ? transactions.map((tx) => (
                <tr key={tx._id} className="border-t border-surface-800 text-surface-200">
                  <td className="px-4 py-3">{shortDate(tx.date)}</td>
                  <td className="px-4 py-3"><span className={tx.type === 'income' ? 'text-success-400' : 'text-danger-400'}>{tx.type}</span></td>
                  <td className="px-4 py-3">{tx.category}</td>
                  <td className="px-4 py-3">{money(tx.amount)}</td>
                  <td className="px-4 py-3">{tx.mode || 'Cash'}</td>
                  <td className="px-4 py-3">{tx.notes || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="xs" variant="secondary" onClick={() => editRow(tx)}>Edit</Button>
                      <Button size="xs" variant="danger" onClick={() => removeRow(tx._id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td className="px-4 py-6 text-surface-500" colSpan="7">No transactions found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
