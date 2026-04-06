import { useEffect, useState } from 'react'
import { financeAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ProgressBar from '../../components/ui/ProgressBar'
import { money, monthNow } from '../../utils/finance'

const emptyForm = (month) => ({ month, category: '', limitAmount: '', alertAtPercent: 80 })

export default function BudgetsPage() {
  const { toast } = useToast()
  const [month, setMonth] = useState(monthNow())
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm(monthNow()))
  const [editingId, setEditingId] = useState(null)

  const loadData = async (selectedMonth = month) => {
    try {
      const { data } = await financeAPI.budgets(selectedMonth)
      setItems(data.budgets || [])
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load budgets', 'error')
    }
  }

  useEffect(() => {
    setForm((prev) => ({ ...prev, month }))
    loadData(month)
  }, [month])

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await financeAPI.updateBudget(editingId, form)
        toast('Budget updated', 'success')
      } else {
        await financeAPI.addBudget(form)
        toast('Budget created', 'success')
      }
      setEditingId(null)
      setForm(emptyForm(month))
      loadData()
    } catch (err) {
      toast(err.response?.data?.message || 'Could not save budget', 'error')
    }
  }

  const editBudget = (budget) => {
    setEditingId(budget._id)
    setForm({ month: budget.month, category: budget.category, limitAmount: budget.limitAmount, alertAtPercent: budget.alertAtPercent || 80 })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-brand-300 font-medium">Module B</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Budgets</h1>
          <p className="text-surface-400 mt-1">Create monthly category budgets and monitor spending alerts.</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="bg-surface-900 border border-surface-700 rounded-xl px-3.5 py-2.5 text-surface-100" />
      </div>

      <Card>
        <form onSubmit={submit} className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
          <Input label="Month" type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <Input label="Limit Amount" type="number" min="0" step="0.01" value={form.limitAmount} onChange={(e) => setForm({ ...form, limitAmount: e.target.value })} required />
          <Input label="Alert %" type="number" min="1" max="100" value={form.alertAtPercent} onChange={(e) => setForm({ ...form, alertAtPercent: e.target.value })} required />
          <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3">
            <Button type="submit">{editingId ? 'Update Budget' : 'Add Budget'}</Button>
            {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm(month)) }}>Cancel Edit</Button>}
          </div>
        </form>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.length ? items.map((budget) => (
          <Card key={budget._id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{budget.category}</p>
                <p className="text-sm text-surface-400">Limit {money(budget.limitAmount)}</p>
              </div>
              <Button size="xs" variant="secondary" onClick={() => editBudget(budget)}>Edit</Button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-surface-300">
              <p>Spent: {money(budget.spent)}</p>
              <p>Remaining: {money(budget.remaining)}</p>
              <ProgressBar value={budget.percent} max={100} color={budget.percent >= 100 ? 'danger' : budget.percent >= budget.alertAtPercent ? 'warning' : 'success'} showLabel />
            </div>
          </Card>
        )) : <Card><p className="text-surface-500">No budgets created for this month.</p></Card>}
      </div>
    </div>
  )
}
