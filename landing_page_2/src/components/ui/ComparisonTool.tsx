'use client'

import { useState } from 'react'

export default function ComparisonTool() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [previewA, setPreviewA] = useState<string | null>(null)
  const [previewB, setPreviewB] = useState<string | null>(null)
  const [result, setResult] = useState<{similarity: number, diff_image_url: string} | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File) => void, setPreview: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      setPreview(URL.createObjectURL(file))
      setResult(null) // reset result on new upload
    }
  }

  const handleCompare = async () => {
    if (!fileA || !fileB) return
    setLoading(true)
    const formData = new FormData()
    formData.append('image_a', fileA)
    formData.append('image_b', fileB)

    try {
      const res = await fetch('http://localhost:8000/api/compare', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error("Comparison failed", error)
      alert("Backend comparison failed. Make sure the FastAPI server is running on port 8000.")
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#0f0f1a]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl w-full">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>
        <h3 className="text-white font-medium text-sm">Visual QA Dashboard</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload A */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Baseline Screenshot (A)</label>
          <div className="relative h-48 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center overflow-hidden hover:border-blue-500/50 transition-colors bg-black/20">
            {previewA ? (
              <img src={previewA} alt="Preview A" className="object-contain w-full h-full" />
            ) : (
              <span className="text-gray-500 text-sm">Click to upload</span>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, setFileA, setPreviewA)} />
          </div>
        </div>

        {/* Upload B */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Current Screenshot (B)</label>
          <div className="relative h-48 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center overflow-hidden hover:border-purple-500/50 transition-colors bg-black/20">
            {previewB ? (
              <img src={previewB} alt="Preview B" className="object-contain w-full h-full" />
            ) : (
              <span className="text-gray-500 text-sm">Click to upload</span>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, setFileB, setPreviewB)} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button 
          onClick={handleCompare}
          disabled={!fileA || !fileB || loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-[0_0_20px_rgba(56,189,248,0.3)]"
        >
          {loading ? 'Analyzing Pixels...' : 'Compare Screenshots'}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Analysis Result</h4>
            <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${result.similarity > 95 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {result.similarity}% Match
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <img src={result.diff_image_url} alt="Diff result" className="w-full h-auto object-contain" />
          </div>
          <p className="text-sm text-gray-400 mt-3 text-center">
            Red boxes highlight detected visual differences between the two images.
          </p>
        </div>
      )}
    </div>
  )
}
