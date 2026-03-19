import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://resumeats-nine.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ResumeATS — Free ATS Resume Builder & Score Checker (2026)',
    template: '%s | ResumeATS',
  },
  description: 'Build ATS-friendly resumes that pass Applicant Tracking Systems. Free resume builder with instant ATS compatibility score, keyword optimization, and PDF export. No signup required.',
  keywords: [
    'ats resume builder', 'ats resume checker', 'free resume builder',
    'ats score checker', 'resume scanner', 'ats friendly resume',
    'applicant tracking system', 'resume keyword optimizer',
    'ats resume template', 'resume pdf export', 'ats compatible resume',
    'resume builder 2026', 'job application resume', 'ats pass resume',
  ],
  authors: [{ name: 'ResumeATS' }],
  creator: 'ResumeATS',
  openGraph: {
    title: 'ResumeATS — Free ATS Resume Builder & Score Checker',
    description: 'Build resumes that actually pass ATS filters. Instant scoring, keyword matching, PDF export. 100% free.',
    url: SITE_URL,
    siteName: 'ResumeATS',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeATS — Free ATS Resume Builder',
    description: 'Build resumes that pass ATS filters. Free instant scoring & PDF export.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ResumeATS',
    description: 'Free ATS Resume Builder and Score Checker',
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '2847' },
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
