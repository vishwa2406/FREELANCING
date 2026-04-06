import { useEffect, useState } from 'react'
import { financeAdminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Badge from '../../components/ui/Badge'

const initialForm = { title: '', content: '', tag: 'general', active: true }

export default function FinanceTipsAdminPage() {
  const { toast } = useToast()
  const [tips, setTips] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadTips = () => {
    financeAdminAPI.tips()
      .then(({ data }) => setTips(data.tips || []))
      .catch((err) => toast(err.response?.data?.message || 'Failed to load finance tips', 'error'))
  }

  useEffect(() => {
    loadTips()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await financeAdminAPI.updateTip(editingId, form)
        toast('Finance tip updated successfully', 'success')
      } else {
        await financeAdminAPI.addTip(form)
        toast('Finance tip added successfully', 'success')
      }
      resetForm()
      loadTips()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save finance tip', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tip) => {
    setEditingId(tip._id)
    setForm({
      title: tip.title || '',
      content: tip.content || '',
      tag: tip.tag || 'general',
      active: Boolean(tip.active)
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this finance tip?')) return
    try {
      await financeAdminAPI.deleteTip(id)
      toast('Finance tip deleted successfully', 'success')
      loadTips()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete finance tip', 'error')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <p className="text-sm text-brand-300 font-medium">Module B Admin</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Manage Finance Tips</h1>
        <p className="text-surface-400 mt-1">Separate finance admin can create, update and delete tips.</p>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">{editingId ? 'Edit Tip' : 'Add New Tip'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            <Input label="Tag" value={form.tag} onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))} />
            <Textarea label="Content" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={5} required />
            <label className="flex items-center gap-2 text-sm text-surface-300">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
              Active
            </label>
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>{editingId ? 'Update Tip' : 'Add Tip'}</Button>
              {editingId ? <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button> : null}
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">All Tips</h2>
          <div className="space-y-4">
            {tips.length > 0 ? (
              tips.map((tip) => (
                <div key={tip._id} className="p-4 rounded-xl bg-surface-900/70 border border-surface-800">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{tip.title}</p>
                      <p className="text-xs text-surface-400 mt-1">{tip.tag || 'general'}</p>
                    </div>
                    <Badge variant={tip.active ? 'success' : 'danger'}>{tip.active ? 'Active' : 'Hidden'}</Badge>
                  </div>
                  <p className="text-sm text-surface-300 leading-6">{tip.content}</p>
                  <div className="flex gap-3 mt-4">
                    <Button type="button" size="sm" variant="secondary" onClick={() => handleEdit(tip)}>Edit</Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => handleDelete(tip._id)}>Delete</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-500">No finance tips found.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
