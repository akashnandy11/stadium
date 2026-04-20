import { useState, useEffect, useRef, useCallback } from 'react'

export function useAgentStream(jobId) {
  const [events, setEvents]       = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [report, setReport]       = useState(null)
  const [error, setError]         = useState(null)
  const esRef = useRef(null)

  const start = useCallback((id) => {
    if (esRef.current) esRef.current.close()
    setEvents([])
    setReport(null)
    setError(null)
    setIsStreaming(true)

    const BASE = import.meta.env.VITE_API_URL || ''
    const es = new EventSource(`${BASE}/api/stream/${id}`)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.event_type === 'heartbeat') return

        setEvents(prev => [...prev, { ...event, ts: Date.now() }])

        if (event.event_type === 'done') {
          setReport(event.metadata)
          setIsStreaming(false)
          es.close()
        }
        if (event.event_type === 'error') {
          setError(event.content)
          setIsStreaming(false)
          es.close()
        }
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      setError('Connection lost. The server may still be processing.')
      setIsStreaming(false)
      es.close()
    }
  }, [])

  useEffect(() => {
    if (jobId) start(jobId)
    return () => { if (esRef.current) esRef.current.close() }
  }, [jobId, start])

  const stop = useCallback(() => {
    if (esRef.current) esRef.current.close()
    setIsStreaming(false)
  }, [])

  return { events, isStreaming, report, error, stop }
}
