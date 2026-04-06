import { useState } from 'react'
import { motion } from 'framer-motion'
import { mentorAPI } from '../services/api'
import { useApi } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Textarea from '../components/ui/Textarea'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

export default function Mentors() {
  const { toast } = useToast()

  const { data, loading } = useApi(mentorAPI.list, [], {
    defaultData: { mentors: [] }
  })

  const {
    data: myReqs,
    execute: reloadMyRequests
  } = useApi(mentorAPI.mine, [], {
    defaultData: { requests: [] }
  })

  const mentors = data?.mentors || []
  const requests = myReqs?.requests || []

  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [msgError, setMsgError] = useState('')

  const pendingIds = new Set(
    requests
      .filter(r => r.status === 'pending')
      .map(r => r.mentor?._id)
      .filter(Boolean)
  )

  const handleRequest = async () => {
    if (!message.trim()) {
      setMsgError('Please add a message')
      return
    }

    setSending(true)

    try {
      await mentorAPI.request({
        mentorId: selected._id,
        message
      })

      await reloadMyRequests()

      toast('Mentorship request sent!', 'success')
      setSelected(null)
      setMessage('')
      setMsgError('')
    } catch (err) {
      toast(err.response?.data?.message || 'Request failed', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Mentors</h1>
        <p className="text-surface-400 text-sm mt-0.5">
          Connect with experienced professionals
        </p>
      </div>

      {/* My requests */}
      {requests.length > 0 && (
        <div className="glass-dark rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4 text-sm">My Requests</h2>

          <div className="space-y-4">
            {requests.map(req => (
              <div
                key={req._id}
                className="rounded-2xl border border-surface-800 bg-surface-900/60 p-4"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center text-sm font-semibold text-white">
                      {req.mentor?.name?.[0] || '?'}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-surface-100">
                        {req.mentor?.name || 'Mentor'}
                      </p>
                      <p className="text-xs text-surface-400">
                        {req.mentor?.email || ''}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      req.status === 'pending'
                        ? 'warning'
                        : req.status === 'accepted' || req.status === 'completed'
                          ? 'success'
                          : 'danger'
                    }
                  >
                    {req.status}
                  </Badge>
                </div>

                {req.message && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-surface-500 mb-1">
                      Your Request
                    </p>
                    <p className="text-sm text-surface-300">
                      {req.message}
                    </p>
                  </div>
                )}

                {req.scheduledAt && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-surface-500 mb-1">
                      Scheduled At
                    </p>
                    <p className="text-sm text-surface-300">
                      {new Date(req.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {req.sessionNotes?.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-surface-500 mb-2">
                      Session Notes
                    </p>

                    <div className="space-y-3">
                      {req.sessionNotes.map((note, index) => (
                        <div
                          key={note._id || index}
                          className="rounded-xl bg-surface-950 border border-surface-800 p-3"
                        >
                          <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">
                            {note.note}
                          </p>

                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <p className="text-xs text-surface-500">
                              Added by {note.addedBy?.name || 'Mentor'}
                              {note.addedBy?.role ? ` (${note.addedBy.role})` : ''}
                            </p>
                            <p className="text-xs text-surface-500">
                              {note.addedAt
                                ? new Date(note.addedAt).toLocaleString()
                                : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-surface-500">
                      No session notes added yet.
                    </p>
                  </div>
                )}

                {(req.rating || req.review) && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-surface-500 mb-1">
                      Your Feedback
                    </p>
                    <div className="rounded-xl bg-surface-950 border border-surface-800 p-3">
                      {req.rating ? (
                        <p className="text-sm text-surface-200">
                          Rating: {req.rating}/5
                        </p>
                      ) : null}
                      {req.review ? (
                        <p className="text-sm text-surface-300 mt-1 whitespace-pre-wrap">
                          {req.review}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentor grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : mentors.length === 0 ? (
        <EmptyState
          title="No mentors available"
          description="Check back soon for available mentors."
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map((mentor, i) => (
            <motion.div
              key={mentor._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              className="glass-dark rounded-2xl p-5 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                {mentor.avatar ? (
                  <img
                    src={mentor.avatar}
                    className="w-12 h-12 rounded-full object-cover"
                    alt={mentor.name}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xl font-bold text-white">
                    {mentor.name?.[0] || 'M'}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-white">{mentor.name}</h3>
                  <p className="text-xs text-surface-400">{mentor.email}</p>
                </div>
              </div>

              {mentor.bio && (
                <p className="text-xs text-surface-400 leading-relaxed mb-4 line-clamp-3">
                  {mentor.bio}
                </p>
              )}

              {mentor.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                  {mentor.skills.slice(0, 4).map(skill => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                full
                variant={pendingIds.has(mentor._id) ? 'secondary' : 'primary'}
                disabled={pendingIds.has(mentor._id)}
                onClick={() => {
                  setSelected(mentor)
                  setMessage('')
                  setMsgError('')
                }}
              >
                {pendingIds.has(mentor._id) ? '⏳ Requested' : 'Request Mentorship'}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Request Mentorship from ${selected?.name}`}
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-surface-400">
              Send a message explaining what you'd like to learn from{' '}
              <span className="text-white font-medium">{selected.name}</span>.
            </p>

            <Textarea
              label="Your message"
              placeholder="Hi! I'd love to learn about..."
              rows={5}
              value={message}
              onChange={e => {
                setMessage(e.target.value)
                setMsgError('')
              }}
              error={msgError}
              hint="Be specific about your goals and what you're hoping to achieve."
            />

            <div className="flex gap-3">
              <Button full loading={sending} onClick={handleRequest}>
                Send Request
              </Button>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}