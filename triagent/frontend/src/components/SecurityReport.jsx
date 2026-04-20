import { useState } from 'react'
import { ChevronDown, ChevronRight, Shield } from 'lucide-react'

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

function ScoreBadge({ score }) {
  const color = score >= 8 ? 'text-green' : score >= 5 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="text-center">
      <div className={`text-5xl font-bold font-mono ${color}`}>{score.toFixed(1)}</div>
      <div className="text-muted text-xs mt-1">/ 10 Confidence</div>
    </div>
  )
}

function FindingRow({ finding }) {
  const [open, setOpen] = useState(false)
  const sev = finding.severity

  return (
    <div className={`rounded-lg border mb-2 overflow-hidden severity-${sev}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:brightness-110 transition-all"
      >
        {open
          ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
          : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
        }
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border severity-${sev} flex-shrink-0`}>
          {sev}
        </span>
        <span className="text-sm font-medium flex-1 truncate">{finding.title}</span>
        <span className="text-xs font-mono opacity-70 flex-shrink-0">{finding.owasp_id}</span>
        <span className="text-xs font-mono font-bold flex-shrink-0">{finding.score}/10</span>
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-white/5">
          <p className="text-xs text-body/70 leading-relaxed mt-2">{finding.description}</p>
          {finding.line_number && (
            <p className="text-xs text-muted mt-1 font-mono">Line: {finding.line_number}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function SecurityReport({ report }) {
  if (!report) {
    return (
      <div className="flex items-center justify-center h-full text-center py-16">
        <div>
          <Shield className="w-12 h-12 text-muted/20 mx-auto mb-4" />
          <p className="text-muted text-sm">Security analysis will appear here</p>
        </div>
      </div>
    )
  }

  const findings = report.security_findings || []
  const sorted   = [...findings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  )

  const counts = SEVERITY_ORDER.reduce((acc, s) => {
    acc[s] = findings.filter(f => f.severity === s).length
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      {/* Score + Summary row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 flex items-center justify-center">
          <ScoreBadge score={report.confidence_score} />
        </div>
        <div className="card p-5">
          <p className="text-xs text-muted mb-3 uppercase tracking-wider">Severity Breakdown</p>
          {SEVERITY_ORDER.map(s => (
            <div key={s} className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded severity-${s}`}>{s}</span>
              <div className="flex-1 mx-3 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    s === 'CRITICAL' ? 'bg-red-500' :
                    s === 'HIGH'     ? 'bg-orange' :
                    s === 'MEDIUM'   ? 'bg-yellow-400' :
                    s === 'LOW'      ? 'bg-blue-400' : 'bg-gray-500'
                  }`}
                  style={{ width: findings.length ? `${(counts[s] / findings.length) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs font-mono text-muted w-4 text-right">{counts[s]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted">
        <span>Total issues: <strong className="text-body">{report.sentinel_issues}</strong></span>
        <span>Rounds: <strong className="text-body">{report.rounds_taken}</strong></span>
        <span>Tests: <strong className={report.all_tests_passed ? 'text-green' : 'text-red-400'}>
          {report.all_tests_passed ? 'Passed' : 'Failed'}
        </strong></span>
      </div>

      {/* Findings list */}
      <div>
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Findings</p>
        {sorted.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-green text-sm">✅ No security issues detected</p>
          </div>
        ) : (
          sorted.map((f, i) => <FindingRow key={i} finding={f} />)
        )}
      </div>
    </div>
  )
}
