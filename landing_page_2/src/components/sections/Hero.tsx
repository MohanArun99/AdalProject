'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ComparisonTool from '../ui/ComparisonTool'

export default function Hero() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const partnerLogos = [
    { name: 'Stripe', initial: 'S' },
    { name: 'Vercel', initial: 'V' },
    { name: 'OpenAI', initial: 'O' },
    { name: 'Anthropic', initial: 'A' },
    { name: 'Google', initial: 'G' },
    { name: 'Microsoft', initial: 'M' },
  ]

  const steps = [
    { number: '01', title: 'Sign up', description: 'Create your account' },
    { number: '02', title: 'Personalisation', description: 'Set up your preferences' },
    { number: '03', title: 'Strategy', description: 'Define your goals' },
    { number: '04', title: 'Analyze & Scale', description: 'Grow your business' },
  ]

  // Premium Framer Motion spring configuration
  const springConfig = { type: "spring", stiffness: 400, damping: 30 }

  // Comet positioning logic designed to avoid SSR hydration mismatches
  const comets = [
    { top: '-10%', left: '50%', delay: '0.2s', duration: '4s' },
    { top: '10%', left: '70%', delay: '1.5s', duration: '5s' },
    { top: '0%', left: '40%', delay: '0.8s', duration: '3.5s' },
    { top: '20%', left: '80%', delay: '2.1s', duration: '4.2s' },
    { top: '30%', left: '60%', delay: '1.2s', duration: '6s' },
    { top: '-5%', left: '90%', delay: '0.5s', duration: '3.8s' },
    { top: '15%', left: '30%', delay: '2.5s', duration: '4.5s' },
    { top: '25%', left: '85%', delay: '1.8s', duration: '5.2s' },
  ]

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]" />
        
        {/* Comets Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {comets.map((comet, idx) => (
            <div
              key={idx}
              className="absolute h-[2px] w-[2px] rounded-full bg-blue-400 shadow-[0_0_0_1px_#ffffff10] animate-meteor"
              style={{
                top: comet.top,
                left: comet.left,
                animationDelay: comet.delay,
                animationDuration: comet.duration,
              }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[60px] h-[1px] bg-gradient-to-l from-blue-400 to-transparent" />
            </div>
          ))}
        </div>
        
        {/* Spotlight effects */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[150px] -translate-x-1/2" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[120px] translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPScjZmZmJy8+CjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9J2JsYWNrJy8+Cjwvc3ZnPg==')]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" />
          <span className="text-xl font-bold text-white tracking-tight">Rescale</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Integration</a>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">AI Journal</a>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Log in</a>
          <button className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            Get Started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={springConfig}
            className="absolute top-20 left-4 right-4 z-40 lg:hidden rounded-2xl border border-white/10 bg-[#0f0f1a]/95 backdrop-blur-xl p-6 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              <a href="#" className="text-base text-gray-300 hover:text-white">Features</a>
              <a href="#" className="text-base text-gray-300 hover:text-white">Integration</a>
              <a href="#" className="text-base text-gray-300 hover:text-white">Pricing</a>
              <a href="#" className="text-base text-gray-300 hover:text-white">AI Journal</a>
              <hr className="border-white/5 my-2" />
              <a href="#" className="text-base text-gray-300 hover:text-white">Log in</a>
              <button className="w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Hero Content */}
      <div className="relative z-10 px-6 py-16 mx-auto max-w-7xl">
        {/* Social Proof */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="flex flex-col items-center justify-center gap-4 mb-10"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-sm text-gray-300">
              <span className="font-semibold text-white">99,000+</span> growing businesses
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-[-0.03em] max-w-5xl mx-auto">
            Amplify your{' '}
            <span className="text-gradient">growth</span>
            <br />
            with Smart AI insights
          </h1>
        </motion.div>

        {/* Subheading */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mx-auto mb-10 tracking-[-0.01em]"
        >
          Transform your business with powerful analytics supported by AI. 
          Get actionable insights that drive real growth.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <button className="relative px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:shadow-[0_0_40px_-10px_rgba(56,189,248,0.5)] transition-all duration-300 hover:scale-105 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            Start Free Trial
          </button>
          <button className="px-8 py-4 text-base font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-2 group bg-white/5 hover:bg-white/10 rounded-full border border-transparent hover:border-white/10">
            How it Works
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>

        {/* Dashboard Preview / Comparison Tool */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...springConfig, delay: 0.4 }}
          className="relative mb-16 z-20"
        >
          <ComparisonTool />
        </motion.div>

        {/* Process Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {steps.map((step, index) => (
            <div key={step.number} className="text-center group cursor-default">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2 transition-transform duration-300 group-hover:scale-110">{step.number}</div>
              <div className="text-white font-semibold mb-1 tracking-tight">{step.title}</div>
              <div className="text-gray-500 text-sm tracking-tight">{step.description}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Partner Logos Section */}
      <div className="relative z-10 px-6 py-10 border-t border-white/5 bg-gradient-to-b from-transparent to-[#050508]">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-medium text-gray-500 text-center uppercase tracking-widest mb-8">
            Growing Partnership Around The World
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {partnerLogos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                  <span className="text-sm font-bold">{logo.initial}</span>
                </div>
                <span className="text-sm font-medium tracking-tight">{logo.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
