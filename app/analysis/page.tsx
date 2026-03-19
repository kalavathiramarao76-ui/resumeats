"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function AnalysisContent() {
  const params = useSearchParams();
  const resumeId = params.get("id");
  const jdId = params.get("jd");

  const [resumeData, setResumeData] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [recruiterSim, setRecruiterSim] = useState<any>(null);
  const [skillGap, setSkillGap] = useState<any>(null);
  const [rewriting, setRewriting] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "match" | "recruiter" | "skills" | "rewrite">("overview");
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!resumeId) return;
    fetch("/api/resumes").then(r => r.json()).then(d => {
      const resume = d.resumes?.find((r: any) => r.id === parseInt(resumeId));
      if (resume) setResumeData(typeof resume.data === "string" ? JSON.parse(resume.data) : resume.data);
    });
  }, [resumeId]);

  const runMatch = async () => {
    if (!resumeId || !jdId) return;
    setLoading(p => ({ ...p, match: true }));
    const res = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId: parseInt(resumeId), jdId: parseInt(jdId) }) });
    const data = await res.json();
    if (data.ok) setMatchResult(data.result);
    setLoading(p => ({ ...p, match: false }));
  };

  const runRecruiter = async () => {
    setLoading(p => ({ ...p, recruiter: true }));
    const res = await fetch("/api/recruiter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId: parseInt(resumeId!), jdId: jdId ? parseInt(jdId) : undefined }) });
    const data = await res.json();
    if (data.ok) setRecruiterSim(data.result);
    setLoading(p => ({ ...p, recruiter: false }));
  };

  const runSkillGap = async () => {
    if (!jdId) return;
    setLoading(p => ({ ...p, skills: true }));
    const res = await fetch("/api/skill-gap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId: parseInt(resumeId!), jdId: parseInt(jdId) }) });
    const data = await res.json();
    if (data.ok) setSkillGap(data.result);
    setLoading(p => ({ ...p, skills: false }));
  };

  const runOptimize = async () => {
    setOptimizing(true);
    const res = await fetch("/api/optimize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId: parseInt(resumeId!) }) });
    const data = await res.json();
    if (data.ok) {
      setResumeData(data.data);
      alert(`Resume optimized! New version v${data.version} saved.`);
    }
    setOptimizing(false);
  };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: "📊", disabled: false },
    { key: "match" as const, label: "JD Match", icon: "🎯", disabled: !jdId },
    { key: "recruiter" as const, label: "Recruiter Sim", icon: "👤", disabled: false },
    { key: "skills" as const, label: "Skill Gap", icon: "📈", disabled: !jdId },
    { key: "rewrite" as const, label: "AI Rewrite", icon: "✨", disabled: false },
  ];

  if (!resumeId) return <div className="p-12 text-center text-gray-400">No resume ID specified.</div>;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-brand-600">Resume<span className="text-gray-900">AI</span> Pro</Link>
          <div className="flex items-center gap-3">
            <button onClick={runOptimize} disabled={optimizing}
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
              {optimizing ? "Optimizing..." : "✨ One-Click Optimize"}
            </button>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">&larr; Dashboard</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === "match" && !matchResult) runMatch();
              if (tab.key === "recruiter" && !recruiterSim) runRecruiter();
              if (tab.key === "skills" && !skillGap) runSkillGap();
            }} disabled={tab.disabled}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === tab.key ? "bg-brand-600 text-white shadow-sm" : tab.disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && resumeData && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card title="Profile">
                <div className="text-xl font-bold text-gray-900">{resumeData.name || "—"}</div>
                <div className="text-sm text-gray-500 mt-1">{[resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(" • ")}</div>
                {resumeData.summary && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{resumeData.summary}</p>}
              </Card>
              <Card title="Experience">
                {(resumeData.experience || []).map((exp: any, i: number) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex justify-between"><span className="font-medium text-sm">{exp.title}</span><span className="text-xs text-gray-400">{exp.startDate} – {exp.endDate}</span></div>
                    <div className="text-xs text-gray-500 mb-1">{exp.company}</div>
                    {(exp.bullets || [exp.description]).filter(Boolean).map((b: string, j: number) => (
                      <div key={j} className="text-xs text-gray-600 pl-3 border-l-2 border-gray-100 mb-1">{b}</div>
                    ))}
                  </div>
                ))}
              </Card>
              <Card title="Skills">
                <div className="flex flex-wrap gap-2">
                  {(resumeData.skills || []).map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">{s}</span>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-4">
              <Card title="Quick Actions">
                <div className="space-y-2">
                  <ActionBtn label="Run Recruiter Simulation" icon="👤" onClick={() => { setActiveTab("recruiter"); runRecruiter(); }} />
                  {jdId && <ActionBtn label="Match Against JD" icon="🎯" onClick={() => { setActiveTab("match"); runMatch(); }} />}
                  <ActionBtn label="Optimize with AI" icon="✨" onClick={runOptimize} loading={optimizing} />
                </div>
              </Card>
              <Card title="Education">
                {(resumeData.education || []).map((e: any, i: number) => (
                  <div key={i} className="text-sm mb-2"><div className="font-medium">{e.degree}</div><div className="text-xs text-gray-500">{e.school} {e.year && `(${e.year})`}</div></div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* Match Tab */}
        {activeTab === "match" && (
          <div>{loading.match ? <Loader text="Running AI match analysis..." /> : matchResult ? (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <div className={`text-7xl font-extrabold ${matchResult.matchPct >= 80 ? "text-green-600" : matchResult.matchPct >= 60 ? "text-yellow-600" : "text-red-600"}`}>{matchResult.matchPct}%</div>
                  <div className="text-sm text-gray-400 mt-1">Match Score</div>
                  <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${matchResult.recruiterVerdict === "would_interview" ? "bg-green-50 text-green-600" : matchResult.recruiterVerdict === "maybe" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"}`}>
                    {matchResult.recruiterVerdict === "would_interview" ? "Likely Interview" : matchResult.recruiterVerdict === "maybe" ? "Maybe" : "Likely Reject"}
                  </div>
                </div>
                <Card title="Section Scores">
                  {Object.entries(matchResult.sectionScores || {}).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-gray-500 w-20 capitalize">{k}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full ${(v as number) >= 80 ? "bg-green-500" : (v as number) >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${v}%` }} /></div>
                      <span className="text-xs font-medium w-8 text-right">{v as number}%</span>
                    </div>
                  ))}
                </Card>
                <Card title="Suggestions">{(matchResult.suggestions || []).map((s: string, i: number) => (<div key={i} className="text-sm text-gray-600 mb-2 flex gap-2"><span className="text-yellow-500">💡</span>{s}</div>))}</Card>
              </div>
              <div className="space-y-4">
                <Card title="Matched Skills"><div className="flex flex-wrap gap-1.5">{(matchResult.matchedSkills || []).map((s: string) => (<span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{s}</span>))}</div></Card>
                <Card title="Missing Skills"><div className="flex flex-wrap gap-1.5">{(matchResult.missingSkills || []).map((s: string) => (<span key={s} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">{s}</span>))}</div></Card>
                <Card title="Strengths">{(matchResult.strengths || []).map((s: string, i: number) => (<div key={i} className="text-xs text-gray-600 mb-1">✅ {s}</div>))}</Card>
                <Card title="Weaknesses">{(matchResult.weaknesses || []).map((s: string, i: number) => (<div key={i} className="text-xs text-gray-600 mb-1">⚠️ {s}</div>))}</Card>
              </div>
            </div>
          ) : <div className="text-center py-12 text-gray-400">Click &quot;JD Match&quot; tab to run analysis</div>}</div>
        )}

        {/* Recruiter Sim Tab */}
        {activeTab === "recruiter" && (
          <div>{loading.recruiter ? <Loader text="Simulating recruiter review..." /> : recruiterSim ? (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="text-4xl mb-3">{recruiterSim.decision === "interview" ? "🎉" : recruiterSim.decision === "maybe" ? "🤔" : "😬"}</div>
                <div className={`text-2xl font-bold ${recruiterSim.decision === "interview" ? "text-green-600" : recruiterSim.decision === "maybe" ? "text-yellow-600" : "text-red-600"}`}>
                  {recruiterSim.decision === "interview" ? "Would Interview!" : recruiterSim.decision === "maybe" ? "Maybe" : "Would Pass"}
                </div>
                <div className="text-sm text-gray-500 mt-2">Time spent reviewing: {recruiterSim.timeSpent}</div>
              </div>
              <Card title="First Impression"><p className="text-sm text-gray-600">{recruiterSim.firstImpression}</p></Card>
              <Card title="What Caught Their Eye">{(recruiterSim.whatCaughtEye || []).map((s: string, i: number) => (<div key={i} className="text-sm text-gray-600 mb-1">👀 {s}</div>))}</Card>
              <Card title="Concerns">{(recruiterSim.concerns || []).map((s: string, i: number) => (<div key={i} className="text-sm text-gray-600 mb-1">⚠️ {s}</div>))}</Card>
              <Card title="Interview Questions They'd Ask">{(recruiterSim.interviewQuestions || []).map((q: string, i: number) => (<div key={i} className="text-sm text-gray-600 mb-2">Q{i + 1}: {q}</div>))}</Card>
              <Card title="Advice"><p className="text-sm text-gray-600">{recruiterSim.advice}</p></Card>
            </div>
          ) : <div className="text-center py-12 text-gray-400">Loading...</div>}</div>
        )}

        {/* Skill Gap Tab */}
        {activeTab === "skills" && (
          <div>{loading.skills ? <Loader text="Analyzing skill gaps..." /> : skillGap ? (
            <div className="max-w-3xl mx-auto space-y-4">
              <Card title="Skill Gap Analysis">
                {(skillGap.gaps || []).map((g: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{g.skill}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${g.importance === "critical" ? "bg-red-50 text-red-600" : g.importance === "important" ? "bg-yellow-50 text-yellow-600" : "bg-gray-100 text-gray-500"}`}>{g.importance}</span>
                    </div>
                    <div className="text-xs text-gray-500">Current: {g.currentLevel} → Target: {g.targetLevel}</div>
                    <div className="text-xs text-gray-600 mt-1">{g.learningPath}</div>
                    <div className="text-xs text-brand-600 mt-0.5">⏱ {g.timeEstimate}</div>
                  </div>
                ))}
              </Card>
              {skillGap.roadmap && (
                <Card title="Learning Roadmap">
                  {Object.entries(skillGap.roadmap).map(([period, task]) => (
                    <div key={period} className="flex gap-3 mb-3"><span className="text-xs font-medium text-brand-600 w-16">{period}</span><span className="text-sm text-gray-600">{task as string}</span></div>
                  ))}
                </Card>
              )}
            </div>
          ) : <div className="text-center py-12 text-gray-400">Add a job description to see skill gaps</div>}</div>
        )}

        {/* Rewrite Tab */}
        {activeTab === "rewrite" && resumeData && (
          <RewriteTab resumeData={resumeData} />
        )}
      </div>
    </div>
  );
}

function RewriteTab({ resumeData }: { resumeData: any }) {
  const [tone, setTone] = useState<"startup" | "faang" | "enterprise">("faang");
  const [results, setResults] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const bullets = (resumeData.experience || []).flatMap((e: any) => e.bullets || [e.description]).filter(Boolean);

  const run = async () => {
    setLoading(true);
    const res = await fetch("/api/rewrite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bullets: bullets.slice(0, 10), tone }) });
    const data = await res.json();
    if (data.ok) setResults(data.rewritten);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card title="AI Bullet Point Rewriter">
        <div className="flex gap-2 mb-4">
          {(["startup", "faang", "enterprise"] as const).map(t => (
            <button key={t} onClick={() => setTone(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${tone === t ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t}</button>
          ))}
        </div>
        <button onClick={run} disabled={loading || !bullets.length} className="w-full py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition">
          {loading ? "AI is rewriting..." : `Rewrite ${bullets.length} Bullet Points`}
        </button>
      </Card>

      {results && (
        <Card title="Rewritten Bullets">
          {results.map((b, i) => (
            <div key={i} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Original:</div>
              <div className="text-sm text-gray-500 line-through mb-2">{bullets[i]}</div>
              <div className="text-xs text-green-600 mb-1">Rewritten ({tone}):</div>
              <div className="text-sm text-gray-900 font-medium">{b}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="bg-white rounded-xl border border-gray-100 p-5"><h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>{children}</div>);
}
function ActionBtn({ label, icon, onClick, loading }: { label: string; icon: string; onClick: () => void; loading?: boolean }) {
  return (<button onClick={onClick} disabled={loading} className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left"><span>{icon}</span><span className="text-sm font-medium text-gray-700">{loading ? "Loading..." : label}</span></button>);
}
function Loader({ text }: { text: string }) {
  return (<div className="text-center py-16"><div className="animate-spin w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" /><div className="text-gray-500">{text}</div></div>);
}

export default function AnalysisPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" /></div>}><AnalysisContent /></Suspense>;
}
