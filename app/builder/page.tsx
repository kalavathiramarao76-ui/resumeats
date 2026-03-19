"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { scoreResume, emptyResume, type ResumeData, type ATSResult } from "@/lib/ats-scorer";

export default function BuilderPage() {
  const [data, setData] = useState<ResumeData>(emptyResume());
  const [result, setResult] = useState<ATSResult | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "score">("edit");
  const [saving, setSaving] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("resumeats-data");
    if (saved) setData(JSON.parse(saved));
    const savedJD = localStorage.getItem("resumeats-jd");
    if (savedJD) setJobDesc(savedJD);
  }, []);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("resumeats-data", JSON.stringify(data));
      localStorage.setItem("resumeats-jd", jobDesc);
      setSaving(true);
      setTimeout(() => setSaving(false), 1000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, jobDesc]);

  const runScore = useCallback(() => {
    const r = scoreResume(data, jobDesc || undefined);
    setResult(r);
    setActiveTab("score");
  }, [data, jobDesc]);

  const update = (field: string, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const updateExp = (i: number, field: string, value: string) => {
    const exp = [...data.experience];
    (exp[i] as any)[field] = value;
    update("experience", exp);
  };

  const updateEdu = (i: number, field: string, value: string) => {
    const edu = [...data.education];
    (edu[i] as any)[field] = value;
    update("education", edu);
  };

  const exportPDF = async () => {
    const el = resumeRef.current;
    if (!el) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`${data.fullName || "resume"}-resume.pdf`);
  };

  const gradeColor = (g: string) => ({ A: "text-green-600", B: "text-blue-600", C: "text-yellow-600", D: "text-orange-600", F: "text-red-600" }[g] || "text-gray-600");
  const scoreColor = (s: number) => s >= 80 ? "bg-green-500" : s >= 60 ? "bg-yellow-500" : s >= 40 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand-600">Resume<span className="text-gray-900">ATS</span></Link>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-gray-400">Saved</span>}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(["edit", "preview", "score"] as const).map(t => (
                <button key={t} onClick={() => t === "score" ? runScore() : setActiveTab(t)}
                  className={`px-3 py-1.5 text-sm rounded-md transition ${activeTab === t ? "bg-white shadow text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"}`}>
                  {t === "edit" ? "Edit" : t === "preview" ? "Preview" : "ATS Score"}
                </button>
              ))}
            </div>
            <button onClick={exportPDF} className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
              Export PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {activeTab === "edit" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div className="space-y-6">
              {/* Contact */}
              <Section title="Contact Information">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full Name" value={data.fullName} onChange={v => update("fullName", v)} placeholder="John Smith" span2 />
                  <Input label="Email" value={data.email} onChange={v => update("email", v)} placeholder="john@email.com" />
                  <Input label="Phone" value={data.phone} onChange={v => update("phone", v)} placeholder="+1 (555) 123-4567" />
                  <Input label="Location" value={data.location} onChange={v => update("location", v)} placeholder="New York, NY" />
                  <Input label="LinkedIn" value={data.linkedin} onChange={v => update("linkedin", v)} placeholder="linkedin.com/in/johnsmith" />
                </div>
              </Section>

              {/* Summary */}
              <Section title="Professional Summary">
                <textarea value={data.summary} onChange={e => update("summary", e.target.value)}
                  placeholder="Experienced software engineer with 5+ years building scalable web applications..."
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none" rows={4} />
              </Section>

              {/* Experience */}
              <Section title="Work Experience" onAdd={() => update("experience", [...data.experience, { title: "", company: "", startDate: "", endDate: "", description: "" }])}>
                {data.experience.map((exp, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-3 relative">
                    {data.experience.length > 1 && (
                      <button onClick={() => update("experience", data.experience.filter((_, j) => j !== i))}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm">&#10005;</button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Job Title" value={exp.title} onChange={v => updateExp(i, "title", v)} placeholder="Senior Software Engineer" />
                      <Input label="Company" value={exp.company} onChange={v => updateExp(i, "company", v)} placeholder="Google" />
                      <Input label="Start Date" value={exp.startDate} onChange={v => updateExp(i, "startDate", v)} placeholder="Jan 2020" />
                      <Input label="End Date" value={exp.endDate} onChange={v => updateExp(i, "endDate", v)} placeholder="Present" />
                    </div>
                    <textarea value={exp.description} onChange={e => updateExp(i, "description", e.target.value)}
                      placeholder="• Led development of microservices architecture serving 1M+ users&#10;• Improved API response time by 40% through caching optimization"
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none" rows={4} />
                  </div>
                ))}
              </Section>

              {/* Education */}
              <Section title="Education" onAdd={() => update("education", [...data.education, { degree: "", school: "", year: "", gpa: "" }])}>
                {data.education.map((edu, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg relative">
                    {data.education.length > 1 && (
                      <button onClick={() => update("education", data.education.filter((_, j) => j !== i))}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm">&#10005;</button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Degree" value={edu.degree} onChange={v => updateEdu(i, "degree", v)} placeholder="B.S. Computer Science" />
                      <Input label="School" value={edu.school} onChange={v => updateEdu(i, "school", v)} placeholder="MIT" />
                      <Input label="Year" value={edu.year} onChange={v => updateEdu(i, "year", v)} placeholder="2020" />
                      <Input label="GPA (optional)" value={edu.gpa} onChange={v => updateEdu(i, "gpa", v)} placeholder="3.8" />
                    </div>
                  </div>
                ))}
              </Section>

              {/* Skills */}
              <Section title="Skills" onAdd={() => update("skills", [...data.skills, ""])}>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 px-2">
                      <input value={skill} onChange={e => { const s = [...data.skills]; s[i] = e.target.value; update("skills", s); }}
                        placeholder="e.g. React" className="py-1.5 text-sm bg-transparent focus:outline-none w-24" />
                      <button onClick={() => update("skills", data.skills.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-red-500 text-xs">&#10005;</button>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Job Description (optional) */}
              <Section title="Job Description (for keyword matching)">
                <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here to check keyword match..."
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none" rows={4} />
              </Section>
            </div>

            {/* Live Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b text-xs text-gray-500 font-medium flex justify-between">
                    <span>Live Preview</span>
                    <button onClick={runScore} className="text-brand-600 hover:text-brand-700">Check ATS Score →</button>
                  </div>
                  <div className="p-8 max-h-[80vh] overflow-y-auto" ref={resumeRef}>
                    <ResumePreview data={data} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8" ref={resumeRef}>
              <ResumePreview data={data} />
            </div>
          </div>
        )}

        {activeTab === "score" && result && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Score header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
              <div className={`text-7xl font-extrabold ${gradeColor(result.grade)}`}>{result.score}</div>
              <div className="text-gray-400 text-sm mt-1">out of 100</div>
              <div className={`text-3xl font-bold mt-2 ${gradeColor(result.grade)}`}>Grade: {result.grade}</div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div className={`h-3 rounded-full transition-all duration-500 ${scoreColor(result.score)}`} style={{ width: `${result.score}%` }} />
              </div>
            </div>

            {/* Checks */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Detailed Analysis</h3>
              <div className="space-y-3">
                {result.checks.map(check => (
                  <div key={check.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className={`text-lg ${check.passed ? "text-green-500" : "text-red-500"}`}>{check.passed ? "&#10003;" : "&#10007;"}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{check.name}</span>
                        <span className="text-xs text-gray-400">{check.score}/{check.maxScore}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6">
                <h3 className="font-bold text-lg mb-3">Improvement Suggestions</h3>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-yellow-800 flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">&#9888;</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={() => setActiveTab("edit")} className="w-full py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition">
              Back to Editor — Fix Issues
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {onAdd && <button onClick={onAdd} className="text-xs text-brand-600 hover:text-brand-700 font-medium">+ Add</button>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, span2 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; span2?: boolean }) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none" />
    </div>
  );
}

function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div className="text-gray-900" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', lineHeight: 1.5 }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-3 mb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide">{data.fullName || "Your Name"}</h1>
        <div className="text-xs text-gray-600 mt-1 flex flex-wrap justify-center gap-x-3">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1">Professional Summary</h2>
          <p className="text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.some(e => e.title || e.company) && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1">Experience</h2>
          {data.experience.filter(e => e.title || e.company).map((exp, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{exp.title}{exp.company ? ` — ${exp.company}` : ""}</span>
                <span className="text-gray-500 text-[10px]">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</span>
              </div>
              {exp.description && <div className="text-gray-700 whitespace-pre-line mt-0.5">{exp.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.some(e => e.degree || e.school) && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1">Education</h2>
          {data.education.filter(e => e.degree || e.school).map((edu, i) => (
            <div key={i} className="flex justify-between mb-1">
              <span><span className="font-semibold">{edu.degree}</span>{edu.school ? ` — ${edu.school}` : ""}{edu.gpa ? ` (GPA: ${edu.gpa})` : ""}</span>
              <span className="text-gray-500 text-[10px]">{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.some(s => s.trim()) && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1">Skills</h2>
          <p className="text-gray-700">{data.skills.filter(s => s.trim()).join("  •  ")}</p>
        </div>
      )}
    </div>
  );
}
