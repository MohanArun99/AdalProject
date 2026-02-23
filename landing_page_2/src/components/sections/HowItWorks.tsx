'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Upload Screenshots',
    description: 'Drag and drop your baseline screenshot and the current version you want to compare. Supports PNG, JPG, and WebP.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Run Comparison',
    description: 'Our engine normalizes both images to the same resolution, then performs a per-pixel difference analysis to detect changes.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Review Results',
    description: 'Get a difference map with bounding boxes around changed regions, plus a similarity score to measure the extent of visual drift.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24 mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Workflow</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Three steps to{' '}
          <span className="text-gradient">visual confidence</span>
        </h2>
        <p className="text-white/40 max-w-lg mx-auto">
          No setup, no config files. Upload, compare, and ship with confidence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Connector line (desktop only) */}
        <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.12 }}
            className="relative flex flex-col items-center text-center group"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-white/60 group-hover:text-cyan-400 transition-colors group-hover:border-cyan-500/30">
                {step.icon}
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white shadow-lg">
                {step.number}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{step.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
        className="flex justify-center mt-14"
      >
        <a
          href="#compare"
          className="px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl
                     hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02] border border-white/10"
        >
          Try it now — it&apos;s free
        </a>
      </motion.div>
    </section>
  )
}
