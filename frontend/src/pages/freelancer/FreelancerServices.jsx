import { useState, useEffect } from 'react'
import { freelancerAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const emptyForm = { title: '', description: '', category: 'General', price: '', deliveryDays: '', skills: '' }

export default function FreelancerServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { toast: showToast } = useToast()

  const load = () => {
    setLoading(true)
    freelancerAPI.getMyServices()
      .then(({ data }) => setServices(data.services))
      .catch(() => showToast('Failed to load services', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = (svc) => {
    setForm({ title: svc.title, description: svc.description, category: svc.category, price: svc.price, deliveryDays: svc.deliveryDays, skills: svc.skills.join(', ') })
    setEditId(svc._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, price: Number(form.price), deliveryDays: Number(form.deliveryDays), skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }
      if (editId) await freelancerAPI.updateService(editId, data)
      else await freelancerAPI.createService(data)
      showToast(editId ? 'Service updated.' : 'Service created.', 'success')
      setShowForm(false)
      load()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error saving service', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    try {
      await freelancerAPI.deleteService(id)
      showToast('Service deleted.', 'success')
      load()
    } catch {
      showToast('Error deleting service', 'error')
    }
  }

  const togglePause = async (svc) => {
    try {
      await freelancerAPI.updateService(svc._id, { status: svc.status === 'active' ? 'paused' : 'active' })
      showToast(`Service ${svc.status === 'active' ? 'paused' : 'activated'}.`, 'success')
      load()
    } catch {
      showToast('Error updating service', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Offerings</h1>
          <p className="text-surface-400 text-sm mt-1">Manage the services you offer to clients.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Service
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">{editId ? 'Edit Service' : 'Add New Service'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                placeholder="Enter service title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              <textarea className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 resize-none"
                rows={3} placeholder="Describe your service" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              <select className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 cursor-pointer"
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                <option value="" disabled>Select Category</option>
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Marketing">Marketing</option>
                <option value="Writing">Writing</option>
                <option value="Others">Others</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="1" className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Enter price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                <input type="number" min="1" className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Delivery (days)" value={form.deliveryDays} onChange={e => setForm(f => ({ ...f, deliveryDays: e.target.value }))} required />
              </div>
              <input className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500"
                placeholder="Skills (comma separated)" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-surface-800 hover:bg-surface-700 text-white py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : services.length === 0 ? (
        <div className="bg-surface-900 border border-surface-700/30 rounded-2xl p-10 text-center">
          <p className="text-surface-500">No services yet. Add your first offering!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(svc => (
            <div key={svc._id} className={`bg-surface-900 border rounded-2xl p-5 flex flex-col gap-3 ${svc.status === 'paused' ? 'border-surface-700/30 opacity-70' : 'border-surface-700/50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${svc.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{svc.status}</span>
                  <h3 className="text-white font-semibold mt-2">{svc.title}</h3>
                  <p className="text-surface-500 text-xs">{svc.category}</p>
                </div>
                <p className="text-brand-400 font-bold text-lg">${svc.price}</p>
              </div>
              <p className="text-surface-400 text-sm line-clamp-2">{svc.description}</p>
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {svc.deliveryDays} day{svc.deliveryDays !== 1 ? 's' : ''} delivery
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => togglePause(svc)} className="flex-1 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs py-2 rounded-lg transition-colors">
                  {svc.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button onClick={() => openEdit(svc)} className="flex-1 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs py-2 rounded-lg transition-colors">Edit</button>
                <button onClick={() => handleDelete(svc._id)} className="flex-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs py-2 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
