'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function UploadZone({
  label,
  sublabel,
  preview,
  onFile,
  accentColor,
}: {
  label: string
  sublabel: string
  preview: string | null
  onFile: (f: File) => void
  accentColor: 'cyan' | 'purple'
}) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accent = accentColor === 'cyan'
    ? { border: 'border-cyan-500/50', bg: 'bg-cyan-500/5', ring: 'ring-cyan-500/20', icon: 'text-cyan-400' }
    : { border: 'border-purple-500/50', bg: 'bg-purple-500/5', ring: 'ring-purple-500/20', icon: 'text-purple-400' }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) onFile(file)
  }, [onFile])

  return (
    <div
      className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer
        ${dragOver ? `${accent.border} ${accent.bg} ring-4 ${accent.ring}` : 'border-white/10 hover:border-white/20'}
        ${preview ? 'bg-black/30' : 'bg-white/[0.02]'}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />

      {preview ? (
        <div className="relative aspect-[16/10]">
          <img src={preview} alt={label} className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white/80 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">{label}</span>
            <span className="text-xs text-white/60 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">Click to replace</span>
          </div>
        </div>
      ) : (
        <div className="aspect-[16/10] flex flex-col items-center justify-center gap-3 p-6">
          <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${accent.icon} group-hover:scale-110 transition-transform`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/80">{label}</p>
            <p className="text-xs text-white/40 mt-1">{sublabel}</p>
          </div>
          <p className="text-[11px] text-white/30 mt-1">Drag & drop or click to browse</p>
        </div>
      )}
    </div>
  )
}

function SimilarityGauge({ value }: { value: number }) {
  const isGood = value >= 95
  const color = isGood ? 'text-emerald-400' : value >= 80 ? 'text-amber-400' : 'text-red-400'
  const bgColor = isGood ? 'bg-emerald-500' : value >= 80 ? 'bg-amber-500' : 'bg-red-500'
  const label = isGood ? 'Pixel Perfect' : value >= 80 ? 'Minor Differences' : 'Significant Changes'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 327} 327`}
            className={`${color} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{value}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${bgColor}`} />
        <span className="text-sm text-white/60">{label}</span>
      </div>
    </div>
  )
}

export default function ComparisonTool() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [previewA, setPreviewA] = useState<string | null>(null)
  const [previewB, setPreviewB] = useState<string | null>(null)
  const [result, setResult] = useState<{ similarity: number; diff_image_url: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileA = useCallback((file: File) => {
    setFileA(file)
    setPreviewA(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }, [])

  const handleFileB = useCallback((file: File) => {
    setFileB(file)
    setPreviewB(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }, [])

  const handleCompare = async () => {
    if (!fileA || !fileB) return
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('image_a', fileA)
    formData.append('image_b', fileB)

    try {
      const res = await fetch('http://localhost:8000/api/compare', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('Could not reach the comparison server. Make sure the backend is running on port 8000.')
    }
    setLoading(false)
  }

  const handleReset = () => {
    setFileA(null)
    setFileB(null)
    setPreviewA(null)
    setPreviewB(null)
    setResult(null)
    setError(null)
  }

  return (
    <div id="compare" className="w-full">
      <div className="glass rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.02] border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
              </svg>
              <span className="text-sm font-medium text-white/70">Visual Diff Engine</span>
            </div>
          </div>
          {(fileA || fileB) && (
            <button onClick={handleReset} className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-md hover:bg-white/5">
              Clear all
            </button>
          )}
        </div>

        <div className="p-6 md:p-8">
          {/* Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <UploadZone label="Baseline (A)" sublabel="Reference screenshot" preview={previewA} onFile={handleFileA} accentColor="cyan" />
            <UploadZone label="Current (B)" sublabel="Screenshot to compare" preview={previewB} onFile={handleFileB} accentColor="purple" />
          </div>

          {/* Compare Button */}
          <div className="flex flex-col items-center gap-3 mt-6">
            <motion.button
              onClick={handleCompare}
              disabled={!fileA || !fileB || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative px-10 py-3.5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl text-white font-semibold text-sm
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                         shadow-[0_0_30px_-8px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_-8px_rgba(6,182,212,0.6)]
                         transition-shadow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing pixels...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                  Run Comparison
                </span>
              )}
            </motion.button>
            {!fileA && !fileB && (
              <p className="text-xs text-white/30">Upload both images to begin</p>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mt-8 pt-8 border-t border-white/[0.06]"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Diff Image */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      <h4 className="text-sm font-semibold text-white/80">Difference Map</h4>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-black/40">
                      <img src={result.diff_image_url} alt="Visual diff" className="w-full h-auto object-contain" />
                    </div>
                    <p className="text-xs text-white/30 mt-2">
                      Red bounding boxes highlight detected visual regressions.
                    </p>
                  </div>

                  {/* Score Panel */}
                  <div className="lg:w-52 flex flex-col items-center justify-start gap-6 lg:pt-8">
                    <SimilarityGauge value={result.similarity} />
                    <button
                      onClick={handleReset}
                      className="w-full py-2.5 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/[0.08] transition-all"
                    >
                      New comparison
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
