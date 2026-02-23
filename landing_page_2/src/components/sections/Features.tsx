'use client'

import { motion } from 'framer-motion'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
      </svg>
    ),
    title: 'Pixel-Level Precision',
    description: 'Every single pixel is compared across your baseline and current screenshots. No visual regression goes unnoticed.',
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'Difference Detection',
    description: 'Bounding boxes automatically highlight regions where visual changes were detected, making regressions easy to spot.',
    accent: 'from-purple-500 to-pink-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Similarity Scoring',
    description: 'Get a precise percentage match between images. Set thresholds for pass/fail in your CI pipeline.',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'DPI Normalization',
    description: 'Images are resized to a common resolution before comparison, so Retina vs. standard displays produce consistent results.',
    accent: 'from-amber-500 to-orange-500',
  },
]

export default function Features() {
  return (
    <section id="features" className="relative px-6 py-24 mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">Capabilities</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Everything you need for{' '}
          <span className="text-gradient">visual testing</span>
        </h2>
        <p className="text-white/40 max-w-lg mx-auto">
          A purpose-built engine that detects what the human eye might miss.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.08 }}
            className="group glass glass-hover rounded-2xl p-6 transition-all duration-300"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{f.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
