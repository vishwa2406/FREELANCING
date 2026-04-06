import { useEffect, useState, useCallback } from 'react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Spinner from '../../components/ui/Spinner'

const PAGE_SIZE = 10

/* ── Role badge ─────────────────────────────────────────────────── */
function RoleBadge({ role }) {
  const map = {
    mentor:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    freelancer:   'bg-green-500/15  text-green-400  border-green-500/20',
    admin:        'bg-red-500/15    text-red-400    border-red-500/20',
    finance_admin:'bg-blue-500/15   text-blue-400   border-blue-500/20',
  }
  if (!map[role]) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ml-2 ${map[role]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${role === 'mentor' ? 'bg-yellow-400' : role === 'freelancer' ? 'bg-green-400' : role === 'admin' ? 'bg-red-400' : 'bg-blue-400'}`} />
      {role.replace('_', ' ')}
    </span>
  )
}

/* ── Assignable roles (NO admin to prevent accidental privilege escalation) */
const ASSIGNABLE_ROLES = ['user', 'mentor', 'finance_admin', 'freelancer']

function RoleButton({ currentRole, targetRole, onClick }) {
  const active = currentRole === targetRole
  return (
    <button
      onClick={!active ? onClick : undefined}
      disabled={active}
      title={`Set role to ${targetRole}`}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border
        ${active
          ? 'bg-brand-500/20 text-brand-400 border-brand-500/30 cursor-default'
          : 'bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white border-surface-700/50'
        }`}
    >
      {targetRole.replace('_', ' ')}
    </button>
  )
}

/* ── Mentor dropdown — only for role=user ───────────────────────── */
function MentorSelect({ userId, currentMentorId, mentors, onAssign }) {
  const [value, setValue]   = useState(currentMentorId || '')
  const [saving, setSaving] = useState(false)

  const handleChange = async (e) => {
    const v = e.target.value
    setValue(v)
    setSaving(true)
    await onAssign(userId, v || null)
    setSaving(false)
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        disabled={saving}
        className="appearance-none w-full bg-surface-800 border border-surface-600 text-surface-300 text-xs rounded-lg px-3 py-1.5 pr-7
                   focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-60 cursor-pointer"
      >
        <option value="">Assign mentor…</option>
        {mentors.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-surface-500">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  )
}

/* ── Pagination bar ─────────────────────────────────────────────── */
function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  const nums = Array.from({ length: pages }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-xs bg-surface-800 text-surface-400 hover:text-white disabled:opacity-40
                   border border-surface-700/50 transition-colors"
      >
        ← Prev
      </button>

      {nums.map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-lg text-xs font-medium border transition-colors
            ${n === page
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-surface-800 text-surface-400 hover:text-white border-surface-700/50'
            }`}
        >
          {n}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-1.5 rounded-lg text-xs bg-surface-800 text-surface-400 hover:text-white disabled:opacity-40
                   border border-surface-700/50 transition-colors"
      >
        Next →
      </button>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────────── */
export default function AdminUsers() {
  const { toast } = useToast()
  const [users,    setUsers]    = useState([])
  const [mentors,  setMentors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [total,    setTotal]    = useState(0)

  /** Server-side paginated load */
  const loadUsers = useCallback(async (p = page, s = search, r = roleFilter) => {
    setLoading(true)
    try {
      const params = { page: p, limit: PAGE_SIZE }
      if (s.trim()) params.search = s.trim()
      if (r)        params.role   = r
      const { data } = await adminAPI.users(params)
      setUsers(data.users  || [])
      setTotal(data.total  || 0)
      setPages(data.pages  || 1)
      setPage(p)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMentors = async () => {
    try {
      const { data } = await adminAPI.getMentors()
      setMentors(data.mentors || [])
    } catch { /* silent */ }
  }

  useEffect(() => { loadUsers(1); loadMentors() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /** Role / status update */
  const updateUser = async (id, payload, msg = 'User updated') => {
    try {
      await adminAPI.updateUser(id, payload)
      toast(msg, 'success')
      loadUsers(page)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update', 'error')
    }
  }

  const handleAssignMentor = (userId, mentorId) =>
    updateUser(userId, { assignedMentor: mentorId || null }, 'Mentor assigned')

  const handleSearch = () => { setPage(1); loadUsers(1, search, roleFilter) }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Users</h1>
        <p className="text-surface-400 text-sm mt-1">
          {total} user{total !== 1 ? 's' : ''} total — showing page {page}/{pages}
        </p>
      </div>

      {/* ── Search / filter bar ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full bg-surface-900 border border-surface-700/50 rounded-xl pl-9 pr-4 py-2.5
                       text-white text-sm placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <select
          className="bg-surface-900 border border-surface-700/50 rounded-xl px-3 py-2.5 text-surface-300 text-sm
                     focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); loadUsers(1, search, e.target.value) }}
        >
          <option value="">All roles</option>
          {['user', 'mentor', 'freelancer', 'finance_admin', 'admin'].map(r => (
            <option key={r} value={r}>{r.replace('_', ' ')}</option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          Search
        </button>
      </div>

      {/* ── User list ── */}
      <div className="glass-dark rounded-2xl p-5 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : users.length === 0 ? (
          <p className="text-surface-400 text-sm text-center py-8">No users found.</p>
        ) : (
          users.map(user => (
            <div key={user._id}
                 className="border border-surface-800 hover:border-surface-700/60 rounded-2xl p-4 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                {/* Left — user info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap">
                    <h3 className="text-white font-semibold truncate">{user.name}</h3>
                    <RoleBadge role={user.role} />
                  </div>
                  <p className="text-surface-400 text-sm mt-0.5">{user.email}</p>
                  <p className="text-surface-500 text-xs mt-1">
                    Joined {new Date(user.createdAt).toLocaleDateString()} •{' '}
                    <span className={user.isActive ? 'text-green-400' : 'text-red-400'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>

                  {/* ── Mentor dropdown: ONLY for role = user (not mentor / freelancer / admin) ── */}
                  {user.role === 'user' && mentors.length > 0 && (
                    <div className="mt-2 max-w-xs">
                      <MentorSelect
                        userId={user._id}
                        currentMentorId={user.assignedMentor}
                        mentors={mentors}
                        onAssign={handleAssignMentor}
                      />
                    </div>
                  )}
                </div>

                {/* Right — actions */}
                <div className="flex flex-wrap gap-2 items-start shrink-0">
                  {/* Role buttons — no "admin" button to prevent unintended elevation */}
                  {ASSIGNABLE_ROLES.map(role => (
                    <RoleButton
                      key={role}
                      currentRole={user.role}
                      targetRole={role}
                      onClick={() => updateUser(user._id, { role }, `Role → ${role}`)}
                    />
                  ))}

                  {/* Active toggle */}
                  <button
                    onClick={() => updateUser(
                      user._id,
                      { isActive: !user.isActive },
                      user.isActive ? 'User deactivated' : 'User activated'
                    )}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                      ${user.isActive
                        ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/20'
                        : 'bg-green-500/15 hover:bg-green-500/25 text-green-400 border-green-500/20'
                      }`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      <Pagination page={page} pages={pages} onChange={p => loadUsers(p)} />
    </div>
  )
}