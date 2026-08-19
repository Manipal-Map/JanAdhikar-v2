import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User } from 'lucide-react'

// ── Lightweight inline markdown renderer ─────────────────────────────────────
// Handles: **bold**, *italic*, `code`, line-breaks
function renderMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')
  return lines.map((line, li) => {
    // Split by markdown tokens: **bold**, *italic*, `code`
    const parts = []
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
    let lastIdx = 0
    let match
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        parts.push(line.slice(lastIdx, match.index))
      }
      if (match[2]) {
        // **bold**
        parts.push(<strong key={match.index} className="font-bold text-white">{match[2]}</strong>)
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={match.index} className="italic">{match[3]}</em>)
      } else if (match[4]) {
        // `code`
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 bg-navy-900/60 rounded text-xs font-mono text-blue-300">
            {match[4]}
          </code>
        )
      }
      lastIdx = match.index + match[0].length
    }
    if (lastIdx < line.length) parts.push(line.slice(lastIdx))
    return (
      <span key={li}>
        {parts}
        {li < lines.length - 1 && <br />}
      </span>
    )
  })
}

export default function ChatInterface({ messages = [], onSend, isLoading, placeholder }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 py-2 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-brand-blue/30 text-blue-400'
                    : 'bg-navy-600 text-slate-400'
                }`}
              >
                {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-blue/20 text-white rounded-tr-sm border border-brand-blue/25'
                    : 'bg-navy-700 text-slate-300 rounded-tl-sm border border-white/5'
                }`}
              >
                {msg.role === 'assistant'
                  ? renderMarkdown(msg.content)
                  : msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5"
          >
            <div className="w-7 h-7 rounded-full bg-navy-600 flex items-center justify-center">
              <Bot size={13} className="text-slate-400" />
            </div>
            <div className="px-4 py-3 bg-navy-700 rounded-2xl rounded-tl-sm border border-white/5">
              <div className="flex gap-1">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="pt-3 border-t border-white/5">
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder || 'Type your message…'}
            className="input-field resize-none text-sm flex-1 py-2.5"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-primary self-end px-4 py-2.5"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
