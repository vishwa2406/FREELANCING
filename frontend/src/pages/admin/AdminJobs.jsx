import { useEffect, useState } from 'react'
import { jobAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const initialForm = {
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  salary: '',
  applyUrl: '',
  logo: '',
  deadline: '',
  skills: '',
  requirements: '',
  description: '',
  isActive: true
}

const typeOptions = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
]

export default function AdminJobs() {
  const { toast } = useToast()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initialForm)

  const loadJobs = async () => {
    setLoading(true)
    try {
      const { data } = await jobAPI.adminList({ search, limit: 100 })
      setJobs(data.jobs || [])
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load jobs', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  // 🔥 FIX: reload when searching
  useEffect(() => {
    const delay = setTimeout(() => {
      loadJobs()
    }, 400)
    return () => clearTimeout(delay)
  }, [search])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // 🔥 FIX: trim + safety payload
  const getPayload = () => ({
    title: form.title.trim(),
    company: form.company.trim(),
    location: form.location.trim(),
    type: form.type,
    salary: form.salary.trim(),
    applyUrl: form.applyUrl.trim(),
    logo: form.logo.trim(),
    deadline: form.deadline || undefined,
    skills: form.skills,
    requirements: form.requirements,
    description: form.description.trim(),
    isActive: form.isActive
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = getPayload()

      if (editingId) {
        await jobAPI.update(editingId, payload)
        toast('Job updated successfully', 'success')
      } else {
        await jobAPI.create(payload)
        toast('Job created successfully', 'success')
      }

      resetForm()
      loadJobs()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save job', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (job) => {
    setEditingId(job._id)
    setForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'full-time',
      salary: job.salary || '',
      applyUrl: job.applyUrl || '',
      logo: job.logo || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      skills: (job.skills || []).join(', '),
      requirements: (job.requirements || []).join('\n'),
      description: job.description || '',
      isActive: !!job.isActive
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this job permanently?')
    if (!ok) return

    try {
      await jobAPI.remove(id)
      toast('Job deleted successfully', 'success')
      if (editingId === id) resetForm()
      loadJobs()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete job', 'error')
    }
  }

  // 🔥 FIX: prevent backend overwrite issues
  const toggleStatus = async (job) => {
    try {
      await jobAPI.update(job._id, {
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: job.requirements || [],
        skills: job.skills || [],
        salary: job.salary,
        applyUrl: job.applyUrl,
        logo: job.logo,
        deadline: job.deadline,
        isActive: !job.isActive
      })

      toast(`Job ${job.isActive ? 'deactivated' : 'activated'} successfully`, 'success')
      loadJobs()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update job status', 'error')
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase()
    return (
      job.title?.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Jobs</h1>
        <p className="text-surface-400 text-sm mt-1">
          Add, edit, activate, deactivate and maintain the jobs board
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="glass-dark rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-white font-semibold">
            {editingId ? 'Edit Job' : 'Add New Job'}
          </h2>
          {editingId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Job Title" value={form.title} onChange={(e) => handleChange('title', e.target.value)} required />
          <Input label="Company" value={form.company} onChange={(e) => handleChange('company', e.target.value)} required />
          <Input label="Location" value={form.location} onChange={(e) => handleChange('location', e.target.value)} required />
          <Select label="Job Type" value={form.type} onChange={(e) => handleChange('type', e.target.value)} options={typeOptions} />
          <Input label="Salary" value={form.salary} onChange={(e) => handleChange('salary', e.target.value)} />
          <Input label="Apply URL" value={form.applyUrl} onChange={(e) => handleChange('applyUrl', e.target.value)} />
          <Input label="Logo URL" value={form.logo} onChange={(e) => handleChange('logo', e.target.value)} />
          <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => handleChange('deadline', e.target.value)} />
        </div>

        <Input
          label="Skills"
          value={form.skills}
          onChange={(e) => handleChange('skills', e.target.value)}
          placeholder="React, Node.js"
        />

        <Textarea
          label="Requirements"
          rows={5}
          value={form.requirements}
          onChange={(e) => handleChange('requirements', e.target.value)}
        />

        <Textarea
          label="Description"
          rows={6}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
        />

        <label className="flex items-center gap-2 text-sm text-surface-300">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
          />
          Active Job Listing
        </label>

        <Button type="submit" loading={saving}>
          {editingId ? 'Update Job' : 'Create Job'}
        </Button>
      </form>

      {/* JOB LIST */}
      <div className="glass-dark rounded-2xl p-5 space-y-4">
        <div className="flex justify-between">
          <h2 className="text-white font-semibold">All Job Listings</h2>
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : filteredJobs.map((job) => (
          <div key={job._id} className="p-4 border rounded-xl">
            <h3 className="text-white">{job.title}</h3>

            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => handleEdit(job)}>Edit</Button>
              <Button size="sm" onClick={() => toggleStatus(job)}>
                {job.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(job._id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}