import { useState } from 'react'
import { submitTicket } from '../api/client'
import { Code2, Zap, ChevronDown } from 'lucide-react'

const LANGUAGES = ['python', 'javascript', 'java', 'go']

const DEMO = {
  title: 'Add user login endpoint',
  description: `Add a POST /login endpoint. 
Accept username and password from the request body.
Look up user in database by username.
Verify the password against stored hash.
Return a JWT token on success.
Store password securely.`,
  language: 'python',
}

export default function TicketInput({ onJobStart, jobs }) {
  const [form, setForm]       = useState(DEMO)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await submitTicket(form)
      onJobStart(data.job_id, form)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit ticket. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const loadDemo = () => setForm(DEMO)

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-body font-semibold text-sm uppercase tracking-widest">New Ticket</h2>
        <button onClick={loadDemo} className="text-xs text-cyan hover:text-cyan/80 transition-colors">
          Load Demo ↗
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {/* Title */}
        <div>
          <label className="block text-xs text-muted mb-1.5 font-medium">Ticket Title</label>
          <input
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Add user login endpoint"
            className="w-full bg-bg-elevated border border-border rounded-lg px-3.5 py-2.5
                       text-body text-sm placeholder:text-muted/50 outline-none
                       focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all"
          />
        </div>

        {/* Description */}
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1.5 font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={8}
            placeholder="Describe what needs to be implemented..."
            className="w-full bg-bg-elevated border border-border rounded-lg px-3.5 py-2.5
                       text-body text-sm placeholder:text-muted/50 outline-none resize-none
                       focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all font-mono"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs text-muted mb-1.5 font-medium">Language</label>
          <div className="relative">
            <select
              value={form.language}
              onChange={set('language')}
              className="w-full appearance-none bg-bg-elevated border border-border rounded-lg
                         px-3.5 py-2.5 text-body text-sm outline-none
                         focus:border-cyan/50 transition-all cursor-pointer"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? (
            <>
              <span className="loader-ring border-t-bg-dark" />
              Submitting...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Analyze with TriAgent
            </>
          )}
        </button>
      </form>

      {/* Job History */}
      {jobs.length > 0 && (
        <div>
          <p className="text-xs text-muted mb-2 uppercase tracking-widest font-medium">Recent Jobs</p>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
            {jobs.map(j => (
              <button
                key={j.job_id}
                onClick={() => onJobStart(j.job_id, null)}
                className="flex items-center justify-between text-left px-3 py-2 rounded-lg
                           bg-bg-elevated border border-border hover:border-cyan/30 transition-all group"
              >
                <span className="text-xs text-body truncate group-hover:text-cyan transition-colors">
                  {j.title || j.job_id.slice(0, 8)}
                </span>
                <span className={`text-xs ml-2 flex-shrink-0 ${
                  j.status === 'done'    ? 'text-green' :
                  j.status === 'running' ? 'text-cyan' :
                  j.status === 'error'   ? 'text-red-400' : 'text-muted'
                }`}>
                  {j.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
