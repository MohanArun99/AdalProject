'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ComparisonTool from '../ui/ComparisonTool'

export default function Hero() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const spring = { type: 'spring', stiffness: 400, damping: 30 }

  const comets = [
    { top: '-8%', left: '45%', delay: '0s', duration: '4s' },
    { top: '5%', left: '70%', delay: '1.2s', duration: '5s' },
    { top: '-3%', left: '25%', delay: '0.6s', duration: '3.8s' },
    { top: '15%', left: '80%', delay: '2s', duration: '4.5s' },
    { top: '10%', left: '55%', delay: '1.5s', duration: '6s' },
  ]

  return (
    <>
      {/* ─── Background ─── */}
      <div className="fixed inset-0 -z-10 bg-surface-0">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-0 via-surface-1 to-surface-0" />
        <div className="absolute top-0 left-1/3 w-[900px] h-[900px] bg-cyan-500/[0.07] rounded-full blur-[180px]" />
        <div className="absolute top-20 right-1/4 w-[700px] h-[700px] bg-purple-500/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-[120px] -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {comets.map((c, i) => (
            <div
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-cyan-400 animate-meteor"
              style={{ top: c.top, left: c.left, animationDelay: c.delay, animationDuration: c.duration }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[50px] h-[1px] bg-gradient-to-l from-cyan-400 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-0/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">PixelDiff</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#compare" className="text-sm text-white/50 hover:text-white transition-colors">Compare</a>
            <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How It Works</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#compare" className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg hover:shadow-[0_0_20px_-4px_rgba(6,182,212,0.5)] transition-all">
              Try It Now
            </a>
          </div>

          <button className="md:hidden p-2 text-white/50 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
            >
              <div className="flex flex-col gap-1 p-4">
                <a href="#compare" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">Compare</a>
                <a href="#features" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">Features</a>
                <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">How It Works</a>
                <a href="#compare" onClick={() => setMobileOpen(false)} className="mt-2 px-3 py-2.5 text-sm font-medium text-white text-center bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg">Try It Now</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative px-6 pt-20 pb-8 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-white/60">Pixel-level accuracy</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60">Instant results</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-[-0.03em] max-w-4xl mx-auto mb-6"
        >
          Catch visual bugs{' '}
          <span className="text-gradient">before</span>
          <br />
          your users do
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          className="text-center text-base sm:text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Upload two screenshots and get an instant, pixel-accurate difference map
          with similarity scoring. Built for QA teams, designers, and developers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <a
            href="#compare"
            className="px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl
                       hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02] border border-white/10"
          >
            Start Comparing
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl
                       border border-white/[0.08] hover:border-white/15 transition-all flex items-center gap-2"
          >
            How it works
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </a>
        </motion.div>

        {/* Comparison Tool */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.4 }}
        >
          <ComparisonTool />
        </motion.div>
      </section>
    </>
  )
}
