import { useState, useEffect } from 'react'
import { Github, Cpu, Zap, Shield, Crosshair } from 'lucide-react'
import TicketInput    from './components/TicketInput'
import AgentStream    from './components/AgentStream'
import CodeDiffViewer from './components/CodeDiffViewer'
import SecurityReport from './components/SecurityReport'
import TestResults    from './components/TestResults'
import PRLink         from './components/PRLink'
import { useAgentStream } from './hooks/useAgentStream'
import { getJobs } from './api/client'

const TABS = [
  { id: 'stream',   label: '⚡ Live Stream' },
  { id: 'code',     label: '📄 Code Diff'   },
  { id: 'tests',    label: '🧪 Tests'        },
  { id: 'security', label: '🛡️ Security'     },
  { id: 'pr',       label: '🔗 PR'           },
]

const AGENTS = [
  { name: 'Architect', color: 'cyan',   icon: Cpu,       desc: 'Writes production code' },
  { name: 'Adversary', color: 'orange', icon: Crosshair, desc: 'Breaks it with tests'   },
  { name: 'Sentinel',  color: 'green',  icon: Shield,    desc: 'OWASP security scan'    },
]

export default function App() {
  const [activeJobId,  setActiveJobId]  = useState(null)
  const [activeTicket, setActiveTicket] = useState(null)
  const [activeTab,    setActiveTab]    = useState('stream')
  const [jobs,         setJobs]         = useState([])

  const { events, isStreaming, report, error } = useAgentStream(activeJobId)

  // Load recent jobs
  useEffect(() => {
    getJobs().then(r => setJobs(r.data)).catch(() => {})
    const interval = setInterval(() => {
      getJobs().then(r => setJobs(r.data)).catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleJobStart = (jobId, ticket) => {
    setActiveJobId(jobId)
    if (ticket) setActiveTicket(ticket)
    setActiveTab('stream')
    // Refresh jobs list
    setTimeout(() => getJobs().then(r => setJobs(r.data)).catch(() => {}), 500)
  }

  // Auto-switch to PR tab on done
  useEffect(() => {
    if (report && !isStreaming) {
      setTimeout(() => setActiveTab('pr'), 800)
    }
  }, [report, isStreaming])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Navbar ── */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-border
                         bg-bg-card flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-blue-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-bg-dark" />
          </div>
          <div>
            <span className="font-bold text-body text-base tracking-tight">TriAgent</span>
            <span className="text-muted text-xs ml-2 hidden sm:inline">The AI Code Review Squad</span>
          </div>
          {/* Agent badges */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            {AGENTS.map(a => (
              <div key={a.name}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                            ${a.color === 'cyan'   ? 'text-cyan  border-cyan/20  bg-cyan/5'  :
                              a.color === 'orange' ? 'text-orange border-orange/20 bg-orange/5' :
                                                     'text-green border-green/20 bg-green/5'}`}>
                <a.icon className="w-3 h-3" />
                {a.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isStreaming && (
            <div className="flex items-center gap-1.5 text-cyan text-xs font-semibold">
              <span className="pulse-dot bg-cyan" />
              RUNNING
            </div>
          )}
          <a
            href="https://github.com/akashnandy11/stadium"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted hover:text-body text-xs transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL: Ticket Input (40%) ── */}
        <aside className="w-[400px] min-w-[320px] flex-shrink-0 border-r border-border
                          bg-bg-card flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5">
            <TicketInput onJobStart={handleJobStart} jobs={jobs} />
          </div>
        </aside>

        {/* ── RIGHT PANEL: Results (60%) ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-border flex-shrink-0 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap pb-2.5
                            ${activeTab === tab.id
                                ? 'text-cyan border-b-2 border-cyan bg-cyan/5'
                                : 'text-muted hover:text-body'}`}
              >
                {tab.label}
                {tab.id === 'stream' && isStreaming && (
                  <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden p-4">
            {activeTab === 'stream' && (
              <div className="h-full card overflow-hidden flex flex-col">
                <AgentStream events={events} isStreaming={isStreaming} />
              </div>
            )}
            {activeTab === 'code' && (
              <div className="h-full">
                <CodeDiffViewer report={report} language={activeTicket?.language || 'python'} />
              </div>
            )}
            {activeTab === 'tests' && (
              <div className="h-full overflow-y-auto">
                <TestResults events={events} report={report} />
              </div>
            )}
            {activeTab === 'security' && (
              <div className="h-full overflow-y-auto">
                <SecurityReport report={report} />
              </div>
            )}
            {activeTab === 'pr' && (
              <div className="h-full overflow-y-auto">
                <PRLink report={report} />
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                <p className="text-red-400 text-xs">⚠️ {error}</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="flex items-center justify-between px-6 py-2 border-t border-border text-muted text-xs flex-shrink-0">
        <span>
          Built by <span className="text-cyan">Akash Nandy</span>, Garvit Sahni, Aaditya Asthana · AIML, DCE · Hackathon 2025
        </span>
        <span className="text-muted/40">Track 1: Agentic AI</span>
      </footer>
    </div>
  )
}
