import { ExternalLink, GitPullRequest } from 'lucide-react'

export default function PRLink({ report }) {
  if (!report) {
    return (
      <div className="flex items-center justify-center h-full text-center py-16">
        <div>
          <GitPullRequest className="w-12 h-12 text-muted/20 mx-auto mb-4" />
          <p className="text-muted text-sm">GitHub PR will appear here after analysis</p>
        </div>
      </div>
    )
  }

  const { pr_url, job_id, rounds_taken, confidence_score, all_tests_passed, sentinel_issues } = report

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      {/* Score card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-body font-bold text-lg mb-1">Analysis Complete</h3>
            <p className="text-muted text-sm font-mono">Job: {job_id?.slice(0, 12)}...</p>
          </div>
          <div className={`text-3xl font-bold font-mono
                          ${confidence_score >= 8 ? 'text-green' :
                            confidence_score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
            {confidence_score?.toFixed(1)}<span className="text-muted text-lg">/10</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-bg-dark/50 rounded-lg p-3 text-center border border-border">
            <div className="text-xl font-bold text-body">{rounds_taken}</div>
            <div className="text-xs text-muted mt-0.5">Rounds</div>
          </div>
          <div className={`rounded-lg p-3 text-center border
                          ${all_tests_passed
                              ? 'bg-green/10 border-green/20'
                              : 'bg-red-500/10 border-red-500/20'}`}>
            <div className={`text-xl font-bold ${all_tests_passed ? 'text-green' : 'text-red-400'}`}>
              {all_tests_passed ? '✅' : '❌'}
            </div>
            <div className="text-xs text-muted mt-0.5">Tests</div>
          </div>
          <div className={`rounded-lg p-3 text-center border
                          ${sentinel_issues === 0
                              ? 'bg-green/10 border-green/20'
                              : 'bg-orange/10 border-orange/20'}`}>
            <div className={`text-xl font-bold ${sentinel_issues === 0 ? 'text-green' : 'text-orange'}`}>
              {sentinel_issues}
            </div>
            <div className="text-xs text-muted mt-0.5">Security Issues</div>
          </div>
        </div>
      </div>

      {/* PR link */}
      {pr_url ? (
        <a
          href={pr_url}
          target="_blank"
          rel="noopener noreferrer"
          className="card p-5 flex items-center gap-4 border-cyan/20 hover:border-cyan/40
                     hover:bg-cyan/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0">
            <GitPullRequest className="w-5 h-5 text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body text-sm font-semibold group-hover:text-cyan transition-colors truncate">
              View Pull Request on GitHub
            </p>
            <p className="text-muted text-xs truncate mt-0.5">{pr_url}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted group-hover:text-cyan transition-colors flex-shrink-0" />
        </a>
      ) : (
        <div className="card p-5 border-dashed">
          <p className="text-muted text-sm text-center">
            GitHub PR not created — configure <code className="text-cyan text-xs">GITHUB_TOKEN</code> in .env to enable
          </p>
        </div>
      )}

      {/* What TriAgent generated */}
      <div className="card p-5">
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Generated Files</p>
        <div className="flex flex-col gap-2">
          {[
            { icon: '📄', name: 'implementation.py', desc: 'Architect final code' },
            { icon: '🧪', name: 'tests/test_implementation.py', desc: 'Adversary test suite' },
            { icon: '🛡️', name: 'docs/security_report.md', desc: 'Sentinel OWASP findings' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <span className="text-base">{f.icon}</span>
              <div>
                <p className="text-xs font-mono text-body">{f.name}</p>
                <p className="text-xs text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
