import Editor from '@monaco-editor/react'

const LANG_MAP = { python: 'python', javascript: 'javascript', java: 'java', go: 'go' }

export default function CodeDiffViewer({ report, language = 'python' }) {
  if (!report?.final_code) {
    return (
      <div className="flex items-center justify-center h-full text-center py-16">
        <div>
          <div className="text-5xl opacity-20 mb-4">📄</div>
          <p className="text-muted text-sm">Final implementation will appear here</p>
        </div>
      </div>
    )
  }

  const lang = LANG_MAP[language] || 'python'

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between px-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan inline-block" />
          <span className="text-xs text-muted font-mono">implementation.{language === 'python' ? 'py' : language}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Rounds: {report.rounds_taken}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                           ${report.all_tests_passed ? 'bg-green/20 text-green' : 'bg-red-500/20 text-red-400'}`}>
            {report.all_tests_passed ? '✅ Tests Passed' : '❌ Tests Failed'}
          </span>
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-border">
        <Editor
          height="100%"
          defaultLanguage={lang}
          value={report.final_code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        />
      </div>
    </div>
  )
}
