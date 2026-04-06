import { useState, useEffect, useCallback, useRef } from 'react'

export function useApi(apiFn, deps = [], options = {}) {
  const { immediate = true, defaultData = null } = options
  const [data, setData]       = useState(defaultData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)
  const mounted = useRef(true)

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const execute = useCallback(async (...args) => {
    setLoading(true); setError(null)
    try {
      const res = await apiFn(...args)
      if (mounted.current) setData(res.data)
      return res.data
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong'
      if (mounted.current) setError(msg)
      throw err
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, deps) // eslint-disable-line

  useEffect(() => { if (immediate) execute() }, [execute]) // eslint-disable-line

  return { data, loading, error, execute, setData }
}