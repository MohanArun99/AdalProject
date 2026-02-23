import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('@/components/sections/Hero'), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <Hero />
    </main>
  )
}
