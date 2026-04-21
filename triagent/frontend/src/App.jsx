import { useState, useEffect, useRef } from 'react'
import { Github, Zap, Cpu, Crosshair, Shield, ExternalLink } from 'lucide-react'
import { useAgentStream } from './hooks/useAgentStream'
import { submitTicket, getJobs } from './api/client'
import Editor from '@monaco-editor/react'

/* ─── CONSTANTS ─── */
const LANGUAGES = ['Python', 'JavaScript', 'Java', 'Go']

const DEMO_TICKET = {
  title: 'Add user login endpoint',
  description: `Add a POST /login endpoint.
Accept username and password from the request body.
Look up user in database by username.
Verify the password against stored hash.
Return a JWT token on success, 401 on failure.
Store passwords securely using bcrypt.`,
  language: 'python',
}

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

/* ─── LOADING SCREEN ─── */
function LoadingScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="loading-screen" id="loading-screen">
      <div className="g-loader">
        <div className="g-loader-ring" />
        <div className="g-loader-ring" />
        <div className="g-loader-ring" />
        <div className="g-loader-ring" />
      </div>
      <div className="loader-title">TriAgent</div>
      <div className="loader-sub">The AI Code Review Squad</div>
      <div className="loader-progress"><div className="loader-progress-fill" /></div>
    </div>
  )
}

/* ─── AGENT ACTIVITY CARDS ─── */
function AgentActivity({ events }) {
  const lastByAgent = {}
  events.forEach(e => { lastByAgent[e.agent] = e })

  const agents = [
    { key: 'architect', icon: '🏗️', label: 'Architect', color: 'architect' },
    { key: 'adversary',  icon: '⚔️', label: 'Adversary',  color: 'adversary' },
    { key: 'sentinel',   icon: '🛡️', label: 'Sentinel',   color: 'sentinel'  },
  ]

  return (
    <div className="agent-activity">
      {agents.map(a => {
        const last = lastByAgent[a.key]
        const isActive = last && last.event_type === 'thinking'
        const isDone   = last && last.event_type === 'done'

        let statusText = 'Waiting...'
        if (isActive) statusText = 'Working...'
        else if (last?.event_type === 'output')           statusText = 'Code ready ✓'
        else if (last?.event_type === 'test_result')      statusText = last.metadata?.all_passed ? 'Tests passed ✓' : 'Tests failed'
        else if (last?.event_type === 'security_finding') statusText = 'Scan complete ✓'

        return (
          <div key={a.key} className={`agent-card ${isActive ? `active ${a.color}` : ''}`}>
            <div className="agent-icon">
              {isActive && <span className="pulse-ring active" style={{background: isActive ? (a.color==='architect'?'#00d2ff':a.color==='adversary'?'#ff6b35':'#00f5a0') : 'transparent'}} />}
              {a.icon}
            </div>
            <div className="agent-name" style={{color: a.color==='architect'?'#00d2ff':a.color==='adversary'?'#ff6b35':'#00f5a0'}}>
              {a.label}
            </div>
            <div className="agent-status">{statusText}</div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── ROUND TIMELINE ─── */
function RoundTimeline({ events, maxRounds }) {
  const rounds = new Set(events.filter(e=>e.round>0).map(e=>e.round))
  const currentRound = Math.max(...Array.from(rounds), 0)

  return (
    <div className="card-3d" style={{padding:'16px 20px', marginBottom:'20px'}}>
      <div style={{fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'var(--text-muted)', marginBottom:'14px'}}>
        Debate Rounds
      </div>
      <div style={{display:'flex', alignItems:'center'}}>
        {Array.from({length:maxRounds},(_, i)=>{
          const r = i+1
          const done = r < currentRound
          const active = r === currentRound && events.length > 0
          return (
            <div key={r} style={{display:'flex', alignItems:'center', flex:1}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
                <div className={`round-circle ${done?'done':active?'active':''}`}>
                  {done ? '✓' : r}
                </div>
                <span className="round-label">Round {r}</span>
              </div>
              {i<maxRounds-1 && <div className={`round-connector ${done?'done':''}`} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── LIVE STREAM TAB ─── */
function StreamTab({ events, isStreaming }) {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [events])

  const formatTs = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`
  }

  if (events.length === 0 && !isStreaming) {
    return (
      <div className="stream-terminal">
        <div className="terminal-bar">
          <div className="t-dot t-dot-r"/><div className="t-dot t-dot-y"/><div className="t-dot t-dot-g"/>
          <span className="terminal-title">triagent — debate loop</span>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <div className="empty-title">Agent stream will appear here</div>
          <div className="empty-sub">Submit a ticket to start the multi-agent debate</div>
        </div>
      </div>
    )
  }

  return (
    <div className="stream-terminal" style={{minHeight:'520px'}}>
      <div className="terminal-bar">
        <div className="t-dot t-dot-r"/><div className="t-dot t-dot-y"/><div className="t-dot t-dot-g"/>
        <span className="terminal-title">triagent — debate loop</span>
        <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.7rem', color:'var(--text-muted)'}}>
          {isStreaming && <><span className="live-dot"/>LIVE</>}
          <span>{events.length} events</span>
        </div>
      </div>
      <div className="terminal-body">
        {events.map((ev, i) => {
          const isCode = ev.event_type === 'output' && ev.content.length > 100
          const isTest = ev.event_type === 'test_result'
          const isSec  = ev.event_type === 'security_finding'
          return (
            <div key={i} className="stream-entry">
              <span className="stream-ts">[{formatTs(ev.ts)}]</span>
              <span className={`agent-tag tag-${ev.agent}`}>{ev.agent.slice(0,4).toUpperCase()}</span>
              <div className="stream-content">
                {isCode ? (
                  <><span style={{opacity:0.5}}>code output:</span><div className="stream-code">{ev.content.slice(0,800)}{ev.content.length>800?'\n...(see Code tab)':''}</div></>
                ) : isTest ? (
                  <span className={ev.metadata?.all_passed ? 'stream-test-pass' : 'stream-test-fail'}>
                    {ev.content}
                  </span>
                ) : isSec ? (
                  <span className="stream-finding">{ev.content}</span>
                ) : (
                  <span>{ev.content}</span>
                )}
              </div>
            </div>
          )
        })}
        {isStreaming && <div className="stream-entry"><span className="stream-ts">...</span><span className="agent-tag tag-orchestrator">ORCH</span><span className="stream-content" style={{color:'#4285F4'}}>Processing...</span></div>}
        <div ref={bottomRef}/>
      </div>
    </div>
  )
}

/* ─── CODE TAB ─── */
function CodeTab({ report, language }) {
  if (!report?.final_code) return (
    <div className="stream-terminal"><div className="empty-state"><div className="empty-icon">📄</div><div className="empty-title">Final code will appear here</div></div></div>
  )
  return (
    <div style={{borderRadius:'16px', overflow:'hidden', border:'1px solid var(--border)', height:'520px'}}>
      <Editor height="100%" defaultLanguage={language || 'python'} value={report.final_code} theme="vs-dark"
        options={{readOnly:true, minimap:{enabled:false}, fontSize:13, lineNumbers:'on', scrollBeyondLastLine:false, wordWrap:'on', padding:{top:16}, fontFamily:"'JetBrains Mono',monospace"}}/>
    </div>
  )
}

/* ─── TESTS TAB ─── */
function TestsTab({ events }) {
  const testEvents = events.filter(e => e.event_type === 'test_result')
  if (!testEvents.length) return (
    <div className="stream-terminal"><div className="empty-state"><div className="empty-icon">🧪</div><div className="empty-title">Test results will appear here</div></div></div>
  )
  return (
    <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
      {testEvents.map((ev, i) => {
        const { passed=0, failed=0, total=0, all_passed, details=[] } = ev.metadata || {}
        const pct = total > 0 ? Math.round((passed/total)*100) : 0
        return (
          <div key={i} className="card-3d" style={{padding:'20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
              <span style={{fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)'}}>ROUND {ev.round} RESULTS</span>
              <span style={{fontSize:'0.9rem', fontWeight:800, color: all_passed?'var(--emerald)':'var(--orange)'}}>{passed}/{total} passed</span>
            </div>
            <div style={{height:'8px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', overflow:'hidden', marginBottom:'12px'}}>
              <div style={{height:'100%', width:`${pct}%`, background: all_passed?'var(--emerald)':'var(--orange)', borderRadius:'4px', transition:'width 1s ease'}}/>
            </div>
            <p style={{fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:'12px'}}>{ev.content}</p>
            {details.map((d,j)=>(
              <div key={j} style={{display:'flex', alignItems:'center', gap:'8px', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:'0.75rem', fontFamily:'monospace'}}>
                <span style={{color: d.passed!==false?'var(--emerald)':'var(--orange)'}}>{d.passed!==false?'✓':'✗'}</span>
                <span style={{color:'var(--text-secondary)'}}>{d.name}</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ─── SECURITY TAB ─── */
function SecurityTab({ report }) {
  const [openIdx, setOpenIdx] = useState(null)

  if (!report) return (
    <div className="stream-terminal"><div className="empty-state"><div className="empty-icon">🛡️</div><div className="empty-title">Security analysis will appear here</div></div></div>
  )

  const findings = [...(report.security_findings||[])].sort((a,b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
  const score = report.confidence_score || 0
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (score/10) * circumference
  const scoreColor = score >= 8 ? '#00f5a0' : score >= 5 ? '#FBBC05' : '#EA4335'

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
      {/* Score + breakdown */}
      <div className="card-3d" style={{padding:'24px'}}>
        <div style={{display:'flex', gap:'24px', alignItems:'center', flexWrap:'wrap'}}>
          <div className="confidence-ring">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle className="confidence-ring-bg" cx="60" cy="60" r="52"/>
              <circle className="confidence-ring-fill" cx="60" cy="60" r="52"
                stroke={scoreColor} strokeDasharray={circumference} strokeDashoffset={offset}/>
            </svg>
            <div className="confidence-val">
              <span style={{fontSize:'1.8rem', fontWeight:800, color:scoreColor, fontFamily:"'Google Sans',sans-serif"}}>{score.toFixed(1)}</span>
              <span style={{fontSize:'0.65rem', color:'var(--text-muted)'}}>/ 10</span>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'var(--text-muted)', marginBottom:'12px'}}>Security Score</div>
            {SEVERITY_ORDER.map(s => {
              const count = findings.filter(f => f.severity === s).length
              return (
                <div key={s} style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px'}}>
                  <span className={`sev-badge badge-${s}`}>{s}</span>
                  <div style={{flex:1, height:'6px', background:'rgba(255,255,255,0.05)', borderRadius:'3px', overflow:'hidden'}}>
                    <div style={{height:'100%', width:findings.length?`${(count/findings.length)*100}%`:'0%',
                      background: s==='CRITICAL'?'#EA4335':s==='HIGH'?'#ff6b35':s==='MEDIUM'?'#FBBC05':s==='LOW'?'#4285F4':'#666',
                      borderRadius:'3px', transition:'width 1s ease'}}/>
                  </div>
                  <span style={{fontSize:'0.7rem', color:'var(--text-muted)', width:'16px', textAlign:'right'}}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Findings list */}
      <div>
        <div className="section-label">Findings ({findings.length})</div>
        {findings.length === 0
          ? <div className="card-3d" style={{padding:'24px', textAlign:'center', color:'var(--emerald)'}}>✅ No security issues detected</div>
          : findings.map((f,i) => (
            <div key={i} className={`finding-card sev-${f.severity}`} onClick={()=>setOpenIdx(openIdx===i?null:i)} style={{cursor:'pointer'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom: openIdx===i?'10px':'0'}}>
                <span className={`sev-badge badge-${f.severity}`}>{f.severity}</span>
                <span style={{flex:1, fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)'}}>{f.title}</span>
                <span style={{fontSize:'0.7rem', color:'var(--text-muted)', fontFamily:'monospace'}}>{f.owasp_id}</span>
                <span style={{fontSize:'0.78rem', fontWeight:700, color: f.score>=8?'#EA4335':f.score>=6?'#ff6b35':'#FBBC05'}}>{f.score}/10</span>
              </div>
              {openIdx === i && <p style={{fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.6}}>{f.description}</p>}
            </div>
          ))
        }
      </div>
    </div>
  )
}

/* ─── PR TAB ─── */
function PRTab({ report }) {
  if (!report) return (
    <div className="stream-terminal"><div className="empty-state"><div className="empty-icon">🔗</div><div className="empty-title">GitHub PR will appear here</div></div></div>
  )

  const { pr_url, job_id, rounds_taken, confidence_score, all_tests_passed, sentinel_issues } = report

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
      {/* Summary grid */}
      <div className="card-3d" style={{padding:'24px'}}>
        <div style={{fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'var(--text-muted)', marginBottom:'16px'}}>
          Analysis Complete
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px'}}>
          {[
            { label:'Confidence', val:`${confidence_score?.toFixed(1)}/10`, color: confidence_score>=8?'var(--emerald)':confidence_score>=5?'#FBBC05':'#EA4335' },
            { label:'Rounds',     val: rounds_taken,    color:'#4285F4' },
            { label:'Tests',      val: all_tests_passed?'✅ Pass':'❌ Fail', color: all_tests_passed?'var(--emerald)':'#EA4335' },
          ].map(s=>(
            <div key={s.label} style={{textAlign:'center', padding:'16px', borderRadius:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)'}}>
              <div style={{fontSize:'1.6rem', fontWeight:800, color:s.color, fontFamily:"'Google Sans',sans-serif"}}>{s.val}</div>
              <div style={{fontSize:'0.68rem', color:'var(--text-muted)', marginTop:'4px', textTransform:'uppercase', letterSpacing:'1px'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:'12px', padding:'10px 14px', borderRadius:'10px', background:sentinel_issues===0?'rgba(0,245,160,0.07)':'rgba(255,107,53,0.07)', border:`1px solid ${sentinel_issues===0?'rgba(0,245,160,0.2)':'rgba(255,107,53,0.2)'}`, fontSize:'0.8rem', color: sentinel_issues===0?'var(--emerald)':'var(--orange)'}}>
          {sentinel_issues===0 ? '🛡️ Zero security issues detected' : `⚠️ ${sentinel_issues} security issue${sentinel_issues>1?'s':''} found — review Security tab`}
        </div>
      </div>

      {/* PR Link */}
      {pr_url ? (
        <a href={pr_url} target="_blank" rel="noopener noreferrer" className="pr-card">
          <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
            <div style={{width:'44px', height:'44px', borderRadius:'12px', background:'rgba(66,133,244,0.12)', border:'1px solid rgba(66,133,244,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0}}>🔗</div>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.9rem', fontWeight:700, color:'var(--blue-1)', marginBottom:'2px'}}>View Pull Request on GitHub</div>
              <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>{pr_url}</div>
            </div>
            <ExternalLink style={{color:'var(--text-muted)', width:16, height:16}} />
          </div>
        </a>
      ) : (
        <div className="card-3d" style={{padding:'20px', textAlign:'center'}}>
          <p style={{fontSize:'0.82rem', color:'var(--text-muted)'}}>
            GitHub PR not created — add <code style={{color:'var(--cyan)', fontSize:'0.78rem'}}>GITHUB_TOKEN</code> to .env to enable
          </p>
        </div>
      )}

      {/* Files generated */}
      <div className="card-3d" style={{padding:'20px'}}>
        <div className="section-label">Generated Files</div>
        {[
          {icon:'📄', name:'implementation.py', desc:'Architect final production code'},
          {icon:'🧪', name:'tests/test_implementation.py', desc:'Adversary adversarial test suite'},
          {icon:'📋', name:'docs/security_report.md', desc:'Sentinel OWASP findings report'},
        ].map((f,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:'0.8rem'}}>
            <span style={{fontSize:'1.2rem'}}>{f.icon}</span>
            <div>
              <div style={{fontFamily:'monospace', color:'var(--text-primary)', fontSize:'0.75rem'}}>{f.name}</div>
              <div style={{color:'var(--text-muted)', fontSize:'0.7rem', marginTop:'1px'}}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   MAIN APP
═══════════════════════════════════ */
export default function App() {
  const [loaded,       setLoaded]       = useState(false)
  const [form,         setForm]         = useState(DEMO_TICKET)
  const [submitting,   setSubmitting]   = useState(false)
  const [submitError,  setSubmitError]  = useState('')
  const [activeJobId,  setActiveJobId]  = useState(null)
  const [activeTab,    setActiveTab]    = useState('stream')
  const [jobs,         setJobs]         = useState([])

  const { events, isStreaming, report, error } = useAgentStream(activeJobId)

  // Refresh jobs list
  useEffect(() => {
    getJobs().then(r => setJobs(r.data)).catch(()=>{})
    const iv = setInterval(() => getJobs().then(r=>setJobs(r.data)).catch(()=>{}), 10000)
    return () => clearInterval(iv)
  }, [])

  // Auto-switch to PR tab on done
  useEffect(() => {
    if (report && !isStreaming) setTimeout(() => setActiveTab('pr'), 1000)
  }, [report, isStreaming])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) { setSubmitError('Title and description are required.'); return }
    setSubmitError('')
    setSubmitting(true)
    try {
      const { data } = await submitTicket({ ...form, language: form.language.toLowerCase() })
      setActiveJobId(data.job_id)
      setActiveTab('stream')
      setTimeout(() => getJobs().then(r => setJobs(r.data)).catch(()=>{}), 800)
    } catch(err) {
      setSubmitError(err?.response?.data?.detail || 'Failed to submit. Is the backend running?')
    } finally { setSubmitting(false) }
  }

  const TABS = [
    {id:'stream',   label:'⚡ Live Stream'},
    {id:'code',     label:'📄 Code'},
    {id:'tests',    label:'🧪 Tests'},
    {id:'security', label:'🛡️ Security'},
    {id:'pr',       label:'🔗 PR'},
  ]

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}

      {/* Animated Background */}
      <div className="mesh-bg">
        <div className="grid-mesh" />
        <div className="orb orb-1"/>
        <div className="orb orb-2"/>
        <div className="orb orb-3"/>
        <div className="orb orb-4"/>
      </div>

      <div style={{position:'relative', zIndex:1, minHeight:'100vh', display:'flex', flexDirection:'column'}}>

        {/* ── NAVBAR ── */}
        <nav className="navbar">
          <div className="nav-logo">
            <div className="nav-logo-dots">
              <div className="dot-g dot-1"/><div className="dot-g dot-2"/>
              <div className="dot-g dot-3"/><div className="dot-g dot-4"/>
            </div>
            <span className="nav-title">Tri<span>Agent</span></span>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'8px', marginLeft:'8px'}}>
            <div className="agent-pill pill-architect"><Cpu size={10}/>Architect</div>
            <div className="agent-pill pill-adversary"><Crosshair size={10}/>Adversary</div>
            <div className="agent-pill pill-sentinel"><Shield size={10}/>Sentinel</div>
          </div>

          <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:'16px'}}>
            {isStreaming && (
              <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'0.75rem', fontWeight:700, color:'#4285F4'}}>
                <span className="live-dot"/>AGENTS RUNNING
              </div>
            )}
            <a href="https://github.com/akashnandy11/stadium" target="_blank" rel="noopener noreferrer"
              style={{display:'flex', alignItems:'center', gap:'6px', color:'var(--text-muted)', fontSize:'0.8rem', textDecoration:'none', transition:'color 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.color='var(--text-primary)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
              <Github size={16}/>GitHub
            </a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-eyebrow">
            <Zap size={11}/>Hackathon 2025 — Track 1: Agentic AI
          </div>
          <h1 className="hero-title">
            <span className="hero-gradient-text">Three AI Agents.</span><br/>
            One Perfect Pull Request.
          </h1>
          <p className="hero-subtitle">
            Architect writes code, Adversary breaks it, Sentinel secures it — in a self-correcting debate loop until your code is production-ready.
          </p>
          <div className="stats-row">
            {[
              {val:'40%', label:'Less Review Time'},
              {val:'3x', label:'Fewer Security Bugs'},
              {val:'$2M+', label:'Breach Prevention'},
              {val:'27M+', label:'GitHub Devs Addressable'},
            ].map(s=>(
              <div key={s.label} className="stat-item">
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="main-layout" style={{flex:1}}>

          {/* LEFT: Input Panel */}
          <div className="input-panel">
            <div className="card-3d input-panel-inner">
              <div className="section-label" style={{marginBottom:'20px'}}>🎫 Jira Ticket</div>

              {/* Title */}
              <div style={{marginBottom:'14px'}}>
                <label style={{display:'block', fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px'}}>Title</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}
                  placeholder="e.g. Add user login endpoint"
                  className="google-input"/>
              </div>

              {/* Description */}
              <div style={{marginBottom:'14px'}}>
                <label style={{display:'block', fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px'}}>Description</label>
                <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                  placeholder="Describe what needs to be implemented..." rows={7}
                  className="google-input"/>
              </div>

              {/* Language */}
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block', fontSize:'0.68rem', fontWeight:600, color:'var(--text-muted)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'1px'}}>Language</label>
                <div className="lang-grid">
                  {LANGUAGES.map(l=>(
                    <button key={l} onClick={()=>setForm(p=>({...p,language:l.toLowerCase()}))}
                      className={`lang-btn ${form.language===l.toLowerCase()?'active':''}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-divider"/>

              {/* Error */}
              {submitError && <p style={{fontSize:'0.75rem', color:'#EA4335', background:'rgba(234,67,53,0.08)', border:'1px solid rgba(234,67,53,0.2)', borderRadius:'8px', padding:'10px 12px', marginBottom:'12px'}}>{submitError}</p>}

              <button onClick={handleSubmit} disabled={submitting} className="btn-google">
                {submitting ? <>⏳ Submitting...</> : <><Zap size={16}/>Analyze with TriAgent</>}
              </button>

              <button onClick={()=>setForm(DEMO_TICKET)}
                style={{width:'100%', marginTop:'8px', padding:'10px', borderRadius:'10px', border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', fontSize:'0.78rem', cursor:'pointer', transition:'all 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.color='var(--text-primary)'}
                onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
                Load Demo Ticket ↗
              </button>

              {/* Job History */}
              {jobs.length > 0 && (
                <>
                  <div className="glass-divider" style={{marginTop:'20px'}}/>
                  <div className="section-label">Recent Jobs</div>
                  <div style={{display:'flex', flexDirection:'column', gap:'6px', maxHeight:'160px', overflowY:'auto'}}>
                    {jobs.map(j=>(
                      <div key={j.job_id} className="job-item" onClick={()=>{setActiveJobId(j.job_id);setActiveTab('stream')}}>
                        <span style={{fontSize:'0.75rem', color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{j.title||j.job_id.slice(0,12)}</span>
                        <span style={{fontSize:'0.65rem', marginLeft:'8px', flexShrink:0, fontWeight:700, color:j.status==='done'?'var(--emerald)':j.status==='running'?'#4285F4':j.status==='error'?'#EA4335':'var(--text-muted)'}}>{j.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Results Panel */}
          <div className="result-panel">
            {/* Agent Activity */}
            <AgentActivity events={events}/>

            {/* Round Timeline */}
            {(events.length > 0 || isStreaming) && <RoundTimeline events={events} maxRounds={3}/>}

            {/* Tabs */}
            <div className="tabs-bar">
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`tab-btn ${activeTab===t.id?'active':''}`}>
                  {t.label}
                  {t.id==='stream' && isStreaming && <span style={{marginLeft:'6px', display:'inline-block', width:'5px', height:'5px', borderRadius:'50%', background:'#4285F4', animation:'liveDot 1.4s ease-in-out infinite'}}/>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab==='stream'   && <StreamTab   events={events} isStreaming={isStreaming}/>}
            {activeTab==='code'     && <CodeTab     report={report} language={form.language}/>}
            {activeTab==='tests'    && <TestsTab    events={events}/>}
            {activeTab==='security' && <SecurityTab report={report}/>}
            {activeTab==='pr'       && <PRTab       report={report}/>}

            {error && <div style={{marginTop:'12px', padding:'10px 14px', borderRadius:'10px', background:'rgba(234,67,53,0.08)', border:'1px solid rgba(234,67,53,0.2)', fontSize:'0.78rem', color:'#ff6b6b'}}>⚠️ {error}</div>}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="app-footer">
          <div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>
            Built by <span style={{color:'#4285F4', fontWeight:600}}>Akash Nandy</span>, Garvit Sahni, Aaditya Asthana — AIML, DCE
          </div>
          <div style={{fontSize:'0.65rem', color:'rgba(136,153,187,0.3)', textTransform:'uppercase', letterSpacing:'1px'}}>
            Hackathon 2025 · Track 1: Agentic AI
          </div>
        </footer>
      </div>
    </>
  )
}
