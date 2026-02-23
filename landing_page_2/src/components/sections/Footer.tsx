'use client'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="px-6 py-12 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/80">PixelDiff</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#compare" className="text-xs text-white/40 hover:text-white/70 transition-colors">Compare</a>
            <a href="#features" className="text-xs text-white/40 hover:text-white/70 transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs text-white/40 hover:text-white/70 transition-colors">How It Works</a>
            <a href="https://github.com/MohanArun99/AdalProject" target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              GitHub
            </a>
          </div>

          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} PixelDiff. Built with Next.js & FastAPI.
          </p>
        </div>
      </div>
    </footer>
  )
}
