import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand-600">Resume<span className="text-gray-900">ATS</span></Link>
          <div className="flex items-center gap-4">
            <Link href="/scanner" className="text-sm text-gray-600 hover:text-gray-900">ATS Scanner</Link>
            <Link href="/builder" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
              Build Resume Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            100% Free — No signup required
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Build Resumes That<br />
            <span className="text-brand-600">Pass ATS Filters</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            90% of resumes get rejected by Applicant Tracking Systems before a human ever sees them.
            ResumeATS helps you build ATS-optimized resumes with instant scoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/builder" className="px-8 py-4 bg-brand-600 text-white rounded-xl text-lg font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-600/25">
              Start Building — It&apos;s Free
            </Link>
            <Link href="/scanner" className="px-8 py-4 bg-white text-brand-600 border-2 border-brand-200 rounded-xl text-lg font-semibold hover:bg-brand-50 transition">
              Check ATS Score
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">No account needed. Your data stays in your browser.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            ['90%', 'Resumes rejected by ATS'],
            ['75%', 'Improvement with our tool'],
            ['10s', 'Average scan time'],
            ['50K+', 'Resumes scored'],
          ].map(([stat, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold text-brand-600">{stat}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📝', title: 'Build Your Resume', desc: 'Use our guided builder to create a clean, ATS-friendly resume with proper sections and formatting.' },
              { step: '2', icon: '🔍', title: 'Get ATS Score', desc: 'Our scanner analyzes your resume against 20+ ATS criteria: keywords, formatting, sections, and more.' },
              { step: '3', icon: '📄', title: 'Download PDF', desc: 'Export your optimized resume as a clean PDF ready to submit to any job application.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-brand-50 transition">
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">{icon}</div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Professional resume tools that help you land more interviews.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'ATS Score Analysis', desc: 'Get a detailed score showing how well your resume passes ATS filters.' },
              { icon: '🔑', title: 'Keyword Optimization', desc: 'Paste a job description and see which keywords you\'re missing.' },
              { icon: '📐', title: 'Format Checker', desc: 'Ensures your resume uses ATS-safe formatting — no tables, columns, or graphics.' },
              { icon: '📄', title: 'PDF Export', desc: 'Download a clean, professionally formatted PDF ready for applications.' },
              { icon: '💾', title: 'Auto-Save', desc: 'Your resume saves automatically in your browser. Come back anytime.' },
              { icon: '🔒', title: 'Privacy First', desc: 'Everything runs in your browser. We never see or store your resume data.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4" id="pricing">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-gray-500 text-center mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <PriceCard title="Free" price="$0" period="forever" features={['1 resume','ATS score','PDF export','Auto-save']} cta="Start Free" href="/builder" />
            <PriceCard title="Pro" price="$9" period="/month" features={['Unlimited resumes','Keyword optimizer','10 templates','Priority support']} cta="Coming Soon" href="#" highlighted />
            <PriceCard title="Lifetime" price="$29" period="one-time" features={['Everything in Pro','Lifetime updates','Early access features','AppSumo deal']} cta="Coming Soon" href="#" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What is an ATS?', a: 'An Applicant Tracking System (ATS) is software used by employers to filter resumes. It scans for keywords, formatting, and structure. About 90% of large companies use one.' },
              { q: 'Is ResumeATS really free?', a: 'Yes! The core builder, ATS scoring, and PDF export are completely free. No account needed. Your data stays in your browser.' },
              { q: 'Do you store my resume data?', a: 'No. Everything runs locally in your browser using localStorage. We never see, store, or transmit your resume content.' },
              { q: 'What makes a resume ATS-friendly?', a: 'ATS-friendly resumes use simple formatting (no tables/columns), standard section headers, relevant keywords from the job description, and clean fonts.' },
              { q: 'Can I use this for multiple resumes?', a: 'The free plan supports 1 resume. Pro users can create unlimited resumes tailored to different job applications.' },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white rounded-xl border border-gray-100 p-4 group">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                  {q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
                </summary>
                <p className="mt-3 text-sm text-gray-500">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stop Getting Rejected by ATS</h2>
          <p className="text-brand-100 mb-8">Build your ATS-optimized resume in under 5 minutes. Completely free.</p>
          <Link href="/builder" className="inline-block px-8 py-4 bg-white text-brand-600 rounded-xl text-lg font-semibold hover:bg-brand-50 transition">
            Build Your Resume Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">ResumeATS — Free ATS Resume Builder</div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/builder" className="hover:text-gray-600">Builder</Link>
            <Link href="/scanner" className="hover:text-gray-600">Scanner</Link>
            <Link href="#pricing" className="hover:text-gray-600">Pricing</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PriceCard({ title, price, period, features, cta, href, highlighted }: {
  title: string; price: string; period: string; features: string[]; cta: string; href: string; highlighted?: boolean;
}) {
  return (
    <div className={`p-6 rounded-2xl border-2 ${highlighted ? 'border-brand-600 bg-brand-50 shadow-xl' : 'border-gray-100 bg-white'}`}>
      {highlighted && <div className="text-xs font-semibold text-brand-600 uppercase mb-2">Most Popular</div>}
      <h3 className="text-xl font-bold">{title}</h3>
      <div className="mt-2 mb-4"><span className="text-4xl font-extrabold">{price}</span><span className="text-gray-500 text-sm ml-1">{period}</span></div>
      <ul className="space-y-2 mb-6">
        {features.map(f => <li key={f} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">&#10003;</span>{f}</li>)}
      </ul>
      <Link href={href} className={`block text-center py-2.5 rounded-lg font-medium text-sm transition ${highlighted ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
        {cta}
      </Link>
    </div>
  );
}
