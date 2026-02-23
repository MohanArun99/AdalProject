'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface HistoryItem {
  id: string
  similarity: number
  created_at: string
  url: string
}

function SimilarityBadge({ value }: { value: number }) {
  const color = value >= 95
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
    : value >= 80
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
      : 'bg-red-500/15 text-red-400 border-red-500/20'

  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
      {value}%
    </span>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="px-6 py-16 mx-auto max-w-7xl">
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      </section>
    )
  }

  if (items.length === 0) return null

  return (
    <section id="history" className="relative px-6 py-24 mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-center mb-12"
      >
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">History</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Recent comparisons
        </h2>
        <p className="text-white/40 max-w-lg mx-auto">
          Your latest visual diff results, stored in Supabase.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.05 }}
            className="group glass glass-hover rounded-xl overflow-hidden transition-all duration-300"
          >
            <div className="aspect-video bg-black/30 overflow-hidden">
              <img
                src={item.url}
                alt={`Diff ${item.id.slice(0, 8)}`}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SimilarityBadge value={item.similarity} />
                <span className="text-xs text-white/30">{timeAgo(item.created_at)}</span>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
