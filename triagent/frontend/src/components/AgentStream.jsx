import { useEffect, useRef } from 'react'

const AGENT_COLORS = {
  architect:    { label: 'ARCHITECT',    cls: 'text-cyan',     bg: 'bg-cyan/10 border-cyan/20' },
  adversary:    { label: 'ADVERSARY',    cls: 'text-orange',   bg: 'bg-orange/10 border-orange/20' },
  sentinel:     { label: 'SENTINEL',     cls: 'text-green',    bg: 'bg-green/10 border-green/20' },
  orchestrator: { label: 'ORCHESTRATOR', cls: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
}

const EVENT_ICONS = {
  thinking:         '💭',
  output:           '📝',
  test_result:      '🧪',
  security_finding: '🛡️',
  done:             '🎉',
  error:            '❌',
}

function AgentTag({ agent, round }) {
  const { label, cls } = AGENT_COLORS[agent] || { label: agent.toUpperCase(), cls: 'text-muted' }
  return (
    <span className="flex items-center gap-1.5 flex-shrink-0">
      <span className={`font-mono text-xs font-bold ${cls}`}>{label}</span>
      <span className="text-muted text-xs">R{round}</span>
    </span>
  )
}

function StreamLine({ event }) {
  const { agent, round, event_type, content } = event
  const icon = EVENT_ICONS[event_type] || '➤'
  const isCode = event_type === 'output' && content.length > 120
  const isThinking = event_type === 'thinking'
  const isFinding = event_type === 'security_finding'
  const isTestResult = event_type === 'test_result'

  return (
    <div className={`flex gap-2.5 px-3 py-2 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors
                    ${event_type === 'done' ? 'bg-green/5' : ''}
                    ${event_type === 'error' ? 'bg-red-500/5' : ''}`}>
      <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <AgentTag agent={agent} round={round} />
          <span className="text-muted text-xs capitalize">{event_type.replace('_', ' ')}</span>
          {isThinking && <span className="loader-ring" />}
        </div>
        {isCode ? (
          <pre className="font-mono text-xs text-body/80 bg-bg-dark/60 rounded-lg p-3 overflow-x-auto
                          border border-white/[0.05] max-h-64 overflow-y-auto whitespace-pre-wrap break-all">
            {content.slice(0, 1500)}{content.length > 1500 ? '\n... (truncated, see Code Diff tab)' : ''}
          </pre>
        ) : isFinding ? (
          <div className="text-xs font-mono text-orange bg-orange/5 border border-orange/20 rounded px-2 py-1">
            {content}
          </div>
        ) : isTestResult ? (
          <div className={`text-xs font-mono px-2 py-1 rounded border
                          ${content.includes('✅') ? 'text-green bg-green/5 border-green/20'
                                                    : 'text-red-400 bg-red-500/5 border-red-500/20'}`}>
            {content}
          </div>
        ) : (
          <p className="text-xs text-body/70 leading-relaxed">{content}</p>
        )}
      </div>
    </div>
  )
}

export default function AgentStream({ events, isStreaming }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  if (events.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
        <div className="text-5xl opacity-20">🤖</div>
        <div>
          <p className="text-muted text-sm">Submit a ticket to start the agent debate loop</p>
          <p className="text-muted/50 text-xs mt-1">Live output will stream here in real-time</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border
                      bg-bg-elevated/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-cyan text-xs font-semibold">
              <span className="pulse-dot bg-cyan" />
              AGENTS ACTIVE
            </span>
          )}
          {!isStreaming && events.length > 0 && (
            <span className="text-green text-xs font-semibold">✅ COMPLETE</span>
          )}
        </div>
        <span className="text-muted text-xs">{events.length} events</span>
      </div>

      {/* Stream */}
      <div className="flex-1 overflow-y-auto">
        {events.map((ev, i) => (
          <StreamLine key={i} event={ev} />
        ))}
        {isStreaming && (
          <div className="px-4 py-3 flex items-center gap-2 text-muted text-xs">
            <span className="loader-ring" />
            Waiting for next agent...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
