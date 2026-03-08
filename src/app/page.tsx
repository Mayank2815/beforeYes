import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-brand-ink text-brand-paper flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-heading text-2xl text-brand-gold tracking-widest">BeforeYes</span>
        <a
          href="#how-it-works"
          className="font-body text-sm text-brand-muted hover:text-brand-paper transition-colors"
        >
          How it works
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-3xl mx-auto">
        <div className="inline-block border border-brand-gold/30 px-4 py-1.5 mb-10 font-mono text-xs text-brand-gold tracking-widest uppercase">
          Private · Session-Based · No Accounts
        </div>
        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-brand-paper mb-8">
          Know your
          <span className="text-brand-gold italic"> compatibility</span>
          <br />
          before you say yes.
        </h1>
        <p className="font-body text-lg text-brand-muted max-w-xl leading-relaxed mb-12">
          A thoughtful, private intelligence report for two partners — covering emotional alignment,
          financial compatibility, and life vision. No accounts required. Results disappear in 72 hours.
        </p>
        <Link
          href="/start"
          className="inline-block bg-brand-gold text-white font-body font-medium px-10 py-4 text-lg hover:bg-amber-700 transition-colors"
        >
          Begin Assessment →
        </Link>
        <p className="mt-4 font-body text-xs text-brand-muted/60">
          ₹499 to unlock the full report · Your partner completes a separate quiz
        </p>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-brand-paper text-brand-ink py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl text-center text-brand-ink mb-16">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'You complete your profile',
                desc: 'Share your personal background, financial profile, and answer 20 reflective questions. Takes about 10 minutes.',
              },
              {
                step: '02',
                title: 'Your partner takes the quiz',
                desc: 'Share a private link. Your partner answers 20 questions and provides their financial context independently.',
              },
              {
                step: '03',
                title: 'Unlock the full report',
                desc: 'Receive a detailed compatibility report with scores, risk indicators, and 15 discussion questions — for ₹499.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="font-mono text-4xl text-brand-gold/30 leading-none">{item.step}</span>
                <h3 className="font-heading text-lg text-brand-ink">{item.title}</h3>
                <p className="font-body text-sm text-brand-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-brand-cream py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-2xl text-brand-ink mb-4">Privacy by design</h2>
          <p className="font-body text-sm text-brand-muted leading-relaxed">
            No accounts. No persistent storage of personal data. Sessions expire after 72 hours and are deleted automatically.
            Your names are never sent to any AI system. Scoring is fully deterministic and runs on our servers.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-ink py-8 px-6 text-center">
        <p className="font-body text-xs text-brand-muted/50">
          © {new Date().getFullYear()} BeforeYes · Not a therapy service · For informational purposes only
        </p>
      </footer>
    </main>
  )
}
