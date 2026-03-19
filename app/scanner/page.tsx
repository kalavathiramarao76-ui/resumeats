"use client";

import { useState } from "react";
import Link from "next/link";
import { scoreResume, emptyResume, type ResumeData, type ATSResult } from "@/lib/ats-scorer";

export default function ScannerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);

  const scan = () => {
    // Parse resume text into structured data (best-effort)
    const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);
    const data: ResumeData = emptyResume();

    // Try to extract info from raw text
    data.fullName = lines[0] || "";
    const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) data.email = emailMatch[0];
    const phoneMatch = resumeText.match(/[\+]?[\d\s\-().]{10,}/);
    if (phoneMatch) data.phone = phoneMatch[0].trim();
    const linkedinMatch = resumeText.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) data.linkedin = linkedinMatch[0];

    // Extract sections by common headers
    const text = resumeText.toLowerCase();
    const summaryMatch = resumeText.match(/(?:summary|objective|about|profile)[:\s]*\n([\s\S]*?)(?=\n(?:experience|education|skills|work)|\n\n)/i);
    if (summaryMatch) data.summary = summaryMatch[1].trim();

    // Count skills (words after "skills:" header)
    const skillsMatch = resumeText.match(/skills[:\s]*\n([\s\S]*?)(?=\n(?:experience|education|certif|project)|\n\n|$)/i);
    if (skillsMatch) {
      data.skills = skillsMatch[1].split(/[,•|·\n]/).map(s => s.trim()).filter(Boolean);
    }

    // Count experience entries
    const expMatches = resumeText.match(/(?:senior|junior|lead|staff|principal|manager|engineer|developer|analyst|designer|director|coordinator|specialist|consultant|architect|intern)/gi) || [];
    data.experience = expMatches.slice(0, 5).map(title => ({
      title, company: "", startDate: "", endDate: "", description: resumeText.slice(0, 200),
    }));
    if (data.experience.length === 0) {
      data.experience = [{ title: "", company: "", startDate: "", endDate: "", description: resumeText }];
    }

    // Check for education
    const eduMatch = resumeText.match(/(?:b\.s\.|b\.a\.|m\.s\.|m\.a\.|mba|ph\.d|bachelor|master|degree|university|college)/gi);
    if (eduMatch) {
      data.education = [{ degree: eduMatch[0], school: "", year: "", gpa: "" }];
    }

    const r = scoreResume(data, jobDesc || undefined);
    setResult(r);
  };

  const gradeColor = (g: string) => ({ A: "text-green-600", B: "text-blue-600", C: "text-yellow-600", D: "text-orange-600", F: "text-red-600" }[g] || "text-gray-600");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand-600">Resume<span className="text-gray-900">ATS</span></Link>
          <Link href="/builder" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
            Build Resume
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">ATS Resume Scanner</h1>
        <p className="text-gray-500 mb-8">Paste your resume text below to get an instant ATS compatibility score.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Your Resume Text</label>
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your entire resume text here...&#10;&#10;John Smith&#10;john@email.com | (555) 123-4567&#10;&#10;Summary&#10;Experienced software engineer with 5+ years...&#10;&#10;Experience&#10;Senior Software Engineer — Google&#10;Jan 2020 – Present&#10;• Led development of..."
                className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[300px]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Job Description (optional — for keyword matching)</label>
              <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the job description to check keyword match..."
                className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[120px]" />
            </div>
            <button onClick={scan} disabled={!resumeText.trim()}
              className="w-full py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
              Scan Resume
            </button>
          </div>

          <div>
            {!result ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                <div className="text-5xl mb-4">🔍</div>
                <p>Paste your resume and click &quot;Scan Resume&quot; to see your ATS score.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                  <div className={`text-6xl font-extrabold ${gradeColor(result.grade)}`}>{result.score}</div>
                  <div className="text-sm text-gray-400 mt-1">ATS Score</div>
                  <div className={`text-2xl font-bold mt-1 ${gradeColor(result.grade)}`}>Grade: {result.grade}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                    <div className={`h-2.5 rounded-full transition-all ${result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${result.score}%` }} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-semibold mb-3">Check Results</h3>
                  <div className="space-y-2">
                    {result.checks.map(c => (
                      <div key={c.name} className="flex items-center gap-2 text-sm">
                        <span className={c.passed ? "text-green-500" : "text-red-500"}>{c.passed ? "&#10003;" : "&#10007;"}</span>
                        <span className="flex-1">{c.name}</span>
                        <span className="text-gray-400 text-xs">{c.score}/{c.maxScore}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.suggestions.length > 0 && (
                  <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-5">
                    <h3 className="font-semibold mb-2">Fix These</h3>
                    <ul className="space-y-1.5">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-yellow-800 flex items-start gap-2">
                          <span className="text-yellow-500">&#9888;</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link href="/builder" className="block text-center py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition">
                  Build ATS-Optimized Resume →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
