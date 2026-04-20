import { useState } from 'react'
import { ChevronDown, ChevronRight, FlaskConical } from 'lucide-react'

function TestRow({ test }) {
  const [open, setOpen] = useState(false)
  const passed = test.passed !== false

  return (
    <div className={`rounded-lg border mb-1.5 overflow-hidden
                    ${passed ? 'border-green/20 bg-green/5' : 'border-red-500/20 bg-red-500/5'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
      >
        <span className={`text-sm flex-shrink-0 ${passed ? 'text-green' : 'text-red-400'}`}>
          {passed ? '✓' : '✗'}
        </span>
        <span className="font-mono text-xs flex-1 truncate text-body/80">{test.name}</span>
        {!passed && test.error && (
          <span className="text-xs text-muted">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        )}
      </button>
      {open && test.error && (
        <div className="px-3 pb-2.5 border-t border-red-500/10">
          <pre className="text-xs font-mono text-red-400/80 mt-2 whitespace-pre-wrap">
            {test.error}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function TestResults({ events, report }) {
  // Extract test result events
  const testEvents = events.filter(e => e.event_type === 'test_result')

  if (testEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center py-16">
        <div>
          <FlaskConical className="w-12 h-12 text-muted/20 mx-auto mb-4" />
          <p className="text-muted text-sm">Test results will appear here</p>
        </div>
      </div>
    )
  }

  const lastEvent = testEvents[testEvents.length - 1]
  const meta = lastEvent.metadata || {}
  const { passed = 0, failed = 0, total = 0, all_passed, details = [] } = meta

  const pct = total > 0 ? Math.round((passed / total) * 100) : 0

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      {/* Summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-body font-semibold">Test Summary</h3>
          <span className={`text-sm font-bold ${all_passed ? 'text-green' : 'text-red-400'}`}>
            {passed}/{total} passed
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2.5 bg-bg-dark rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${all_passed ? 'bg-green' : 'bg-red-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted">{lastEvent.content}</p>
      </div>

      {/* Round-by-round */}
      {testEvents.length > 1 && (
        <div className="card p-4">
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Round Progress</p>
          <div className="flex gap-3">
            {testEvents.map((ev, i) => {
              const m = ev.metadata || {}
              const p = m.total > 0 ? Math.round((m.passed / m.total) * 100) : 0
              return (
                <div key={i} className="flex-1 text-center">
                  <div className="text-xs text-muted mb-1">R{ev.round}</div>
                  <div className={`text-sm font-bold ${m.all_passed ? 'text-green' : 'text-orange'}`}>
                    {p}%
                  </div>
                  <div className="text-xs text-muted">{m.passed}/{m.total}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Individual test list */}
      {details.length > 0 && (
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Test Cases</p>
          {details.map((t, i) => <TestRow key={i} test={t} />)}
        </div>
      )}
    </div>
  )
}
