import { useEffect, useState } from 'react'
import { mentorAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Textarea from '../../components/ui/Textarea'
import Spinner from '../../components/ui/Spinner'

export default function MentorRequests() {
  const { toast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState({})

  const loadRequests = async () => {
    setLoading(true)
    try {
      const { data } = await mentorAPI.incoming()
      setRequests(data.requests || [])
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load requests', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await mentorAPI.updateRequest(id, { status })
      toast(`Request ${status}`, 'success')
      loadRequests()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update request', 'error')
    }
  }

  const addNote = async id => {
    const note = notes[id]?.trim()
    if (!note) {
      toast('Please write a note first', 'error')
      return
    }

    try {
      await mentorAPI.addNote(id, { note })
      toast('Session note added', 'success')
      setNotes(prev => ({ ...prev, [id]: '' }))
      loadRequests()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add note', 'error')
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Mentorship Requests</h1>
        <p className="text-surface-400 text-sm mt-1">Accept, reject and add session notes</p>
      </div>

      <div className="space-y-5">
        {requests.map(item => (
          <div key={item._id} className="glass-dark rounded-2xl p-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold">{item.mentee?.name}</h3>
                <p className="text-surface-400 text-sm">{item.mentee?.email}</p>
                <p className="text-surface-500 text-sm mt-3">{item.message || 'No message provided'}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {(item.mentee?.skills || []).map(skill => (
                    <span key={skill} className="px-2 py-1 rounded-lg bg-surface-800 text-surface-300 text-xs">
                      {skill}
                    </span>
                  ))}
                </div>

                <span className="inline-block mt-4 px-2 py-1 rounded-lg bg-surface-800 text-surface-300 text-xs capitalize">
                  {item.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => updateStatus(item._id, 'accepted')}>Accept</Button>
                <Button variant="danger" onClick={() => updateStatus(item._id, 'rejected')}>Reject</Button>
                <Button variant="secondary" onClick={() => updateStatus(item._id, 'completed')}>Mark Completed</Button>
              </div>
            </div>

            <div className="mt-5">
              <Textarea
                label="Add Session Note"
                rows={3}
                value={notes[item._id] || ''}
                onChange={e => setNotes(prev => ({ ...prev, [item._id]: e.target.value }))}
                placeholder="Write mentorship session note..."
              />
              <div className="mt-3">
                <Button onClick={() => addNote(item._id)}>Add Note</Button>
              </div>
            </div>

            {item.sessionNotes?.length > 0 && (
              <div className="mt-5">
                <p className="text-surface-400 text-sm mb-2">Previous Notes</p>
                <div className="space-y-2">
                  {item.sessionNotes.map((note, index) => (
                    <div key={index} className="bg-surface-900 rounded-xl p-3">
                      <p className="text-surface-300 text-sm">{note.note}</p>
                      <p className="text-surface-500 text-xs mt-1">By {note.addedBy?.name || 'Unknown'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {requests.length === 0 && (
          <div className="glass-dark rounded-2xl p-5">
            <p className="text-surface-400 text-sm">No mentorship requests assigned to you.</p>
          </div>
        )}
      </div>
    </div>
  )
}