import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'

export default function AdminMentorRequests() {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminAPI.mentorRequests()
        setRequests(res.data.requests || [])
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin - Mentor Requests</h1>

      {requests.length === 0 && <p>No requests found</p>}

      {requests.map(r => (
        <div key={r._id} style={{ border: "1px solid gray", padding: "10px", margin: "10px 0" }}>
          <p><b>User:</b> {r.mentee?.name}</p>
          <p><b>Mentor:</b> {r.mentor?.name}</p>
          <p><b>Status:</b> {r.status}</p>
          <p><b>Message:</b> {r.message}</p>
        </div>
      ))}
    </div>
  )
}