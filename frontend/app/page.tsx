import PhotoTool from '@/components/PhotoTool'

const COUNTRIES = [
  { name: 'United States', flag: '🇺🇸', size: '2×2 inches (51×51 mm)' },
  { name: 'European Union', flag: '🇪🇺', size: '35×45 mm' },
  { name: 'United Kingdom', flag: '🇬🇧', size: '35×45 mm' },
  { name: 'Canada', flag: '🇨🇦', size: '50×70 mm' },
  { name: 'Australia', flag: '🇦🇺', size: '35×45 mm' },
  { name: 'India', flag: '🇮🇳', size: '35×45 mm' },
  { name: 'China', flag: '🇨🇳', size: '33×48 mm' },
  { name: 'Japan', flag: '🇯🇵', size: '35×45 mm' },
  { name: 'Germany', flag: '🇩🇪', size: '35×45 mm' },
]

const STEPS = [
  { title: 'Upload Your Photo', desc: 'Take a photo with your phone or webcam against any background. Supports JPG, PNG, and HEIC.' },
  { title: 'Select Document Type', desc: 'Choose your country and document type. We auto-apply the correct size, background color, and face positioning requirements.' },
  { title: 'AI Processing', desc: 'Our AI removes the background, detects your face, and auto-crops to official specifications — in under a minute.' },
  { title: 'Download for Free', desc: 'Download your compliant passport photo instantly. No watermark, no signup, no data stored.' },
]

const FAQS = [
  { q: 'Is PhotoGen really free?', a: 'Yes — 100% free with no watermarks, no signup, and unlimited usage. PhotoGen is open-source software.' },
  { q: 'Is my photo stored on your servers?', a: 'No. Your photo is processed and returned immediately. We do not store any images or personal data.' },
  { q: 'What size is a US passport photo?', a: 'A US passport photo must be 2×2 inches (51×51 mm). PhotoGen automatically crops to this exact specification.' },
  { q: 'Can I use this for visa applications?', a: 'Yes. PhotoGen supports passport and visa photo requirements for the US, UK, EU, Canada, Australia, India, China, Japan, and Germany.' },
  { q: 'What if the automatic crop is wrong?', a: 'You can use the manual crop tool to adjust the framing yourself after AI processing.' },
  { q: 'Do I need to remove the background myself?', a: 'No. PhotoGen uses AI to automatically remove the background and replace it with the correct color for your document type.' },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg overflow-hidden">
              <img src="/logo.jpg" alt="PhotoGen" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-none">PhotoGen</h1>
              <p className="text-[11px] text-gray-400">Free Passport Photo Maker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] font-medium text-green-700">Free & Unlimited</span>
            </div>
            <a href="https://github.com/deidaraiorek/photogen" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2.5 py-0.5 transition-colors">
              <svg className="h-3.5 w-3.5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <span className="text-[11px] font-medium text-gray-700">Open Source</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-6xl w-full px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create Your Passport Photo Online for Free</h2>
          <p className="mt-1.5 text-gray-400 text-xs sm:text-sm">AI-powered background removal, face detection, and auto-cropping — no signup required</p>
        </div>

        <PhotoTool />

        <section className="mt-16 space-y-16">
          <div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-8">How to Make a Passport Photo at Home</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-700 text-xs font-bold">{i + 1}</span>
                    <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-2">Supported Countries & Document Types</h2>
            <p className="text-center text-sm text-gray-400 mb-6">Official passport and visa photo specifications for 9+ countries</p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {COUNTRIES.map((c) => (
                <div key={c.name} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <span className="text-xl">{c.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-6">Frequently Asked Questions</h2>
            <div className="mx-auto max-w-3xl space-y-4">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group rounded-lg border border-gray-200 bg-white">
                  <summary className="cursor-pointer px-5 py-3.5 text-sm font-medium text-gray-900 flex items-center justify-between">
                    {faq.q}
                    <svg className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>PhotoGen — Free passport photo maker powered by open-source AI</p>
          <p>No data stored · No account required · 100% free</p>
        </div>
      </footer>
    </div>
  )
}
