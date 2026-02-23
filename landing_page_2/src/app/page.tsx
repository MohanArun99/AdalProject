import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('@/components/sections/Hero'), { ssr: false })
const Features = dynamic(() => import('@/components/sections/Features'), { ssr: false })
const HowItWorks = dynamic(() => import('@/components/sections/HowItWorks'), { ssr: false })
const Footer = dynamic(() => import('@/components/sections/Footer'), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-0">
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  )
}
