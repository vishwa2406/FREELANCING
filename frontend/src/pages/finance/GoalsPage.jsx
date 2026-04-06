import { useEffect, useState } from 'react'
import { financeAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ProgressBar from '../../components/ui/ProgressBar'
import { money, shortDate } from '../../utils/finance'

const emptyForm = { title: '', targetAmount: '', savedAmount: '', targetDate: '' }

export default function GoalsPage() {
  const { toast } = useToast()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const loadData = async () => {
    try {
      const { data } = await financeAPI.goals()
      setItems(data.goals || [])
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load goals', 'error')
    }
  }

  useEffect(() => { loadData() }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await financeAPI.updateGoal(editingId, form)
        toast('Goal updated', 'success')
      } else {
        await financeAPI.addGoal(form)
        toast('Goal created', 'success')
      }
      setEditingId(null)
      setForm(emptyForm)
      loadData()
    } catch (err) {
      toast(err.response?.data?.message || 'Could not save goal', 'error')
    }
  }

  const editGoal = (goal) => {
    setEditingId(goal._id)
    setForm({ title: goal.title || '', targetAmount: goal.targetAmount || '', savedAmount: goal.savedAmount || '', targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : '' })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <p className="text-sm text-brand-300 font-medium">Module B</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Saving Goals</h1>
        <p className="text-surface-400 mt-1">Track your targets and update progress with CRUD actions.</p>
      </div>

      <Card>
        <form onSubmit={submit} className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
          <Input label="Goal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Target Amount" type="number" min="1" step="0.01" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
          <Input label="Saved Amount" type="number" min="0" step="0.01" value={form.savedAmount} onChange={(e) => setForm({ ...form, savedAmount: e.target.value })} required />
          <Input label="Target Date" type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} required />
          <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3">
            <Button type="submit">{editingId ? 'Update Goal' : 'Add Goal'}</Button>
            {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel Edit</Button>}
          </div>
        </form>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.length ? items.map((goal) => (
          <Card key={goal._id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{goal.title}</p>
                <p className="text-sm text-surface-400">Target date {shortDate(goal.targetDate)}</p>
              </div>
              <Button size="xs" variant="secondary" onClick={() => editGoal(goal)}>Edit</Button>
            </div>
            <div className="mt-4 space-y-2">
              <ProgressBar value={goal.progress} max={100} color={goal.status === 'completed' ? 'success' : 'brand'} showLabel />
              <p className="text-sm text-surface-300">Saved {money(goal.savedAmount)} of {money(goal.targetAmount)}</p>
              <p className={`text-xs ${goal.status === 'completed' ? 'text-success-400' : 'text-warning-400'}`}>{goal.status}</p>
            </div>
          </Card>
        )) : <Card><p className="text-surface-500">No goals created yet.</p></Card>}
      </div>
    </div>
  )
}
