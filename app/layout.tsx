import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResumeATS — Free ATS Resume Builder & Scanner',
  description: 'Build ATS-friendly resumes that pass Applicant Tracking Systems. Free resume builder with instant ATS score, keyword optimization, and PDF export.',
  keywords: 'ats resume builder, ats resume checker, free resume builder, ats score checker, resume scanner, ats friendly resume',
  openGraph: {
    title: 'ResumeATS — Free ATS Resume Builder & Scanner',
    description: 'Build resumes that actually get past ATS filters. Free instant scoring.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
