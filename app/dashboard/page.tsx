"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = { id: number; email: string; fullName: string } | null;
type Resume = { id: number; title: string; ats_score: number; status: string; version: number; created_at: string; updated_at: string };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "me" }) })
      .then(r => r.json())
      .then(d => { if (!d.user) router.push("/login"); else { setUser(d.user); loadResumes(); } })
      .finally(() => setLoading(false));
  }, [router]);

  const loadResumes = () => {
    fetch("/api/resumes").then(r => r.json()).then(d => setResumes(d.resumes || []));
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-100 p-4 flex flex-col">
        <Link href="/" className="text-lg font-bold text-brand-600 mb-8">Resume<span className="text-gray-900">AI</span> <span className="text-xs text-gray-400 font-normal">Pro</span></Link>
        <nav className="space-y-1 flex-1">
          {[
            { href: "/dashboard", icon: "📊", label: "Dashboard", active: true },
            { href: "/upload", icon: "📄", label: "Upload Resume" },
            { href: "/builder", icon: "✏️", label: "Resume Builder" },
            { href: "/scanner", icon: "🔍", label: "ATS Scanner" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${item.active ? "bg-brand-50 text-brand-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 pt-4">
          <div className="text-sm font-medium text-gray-900 truncate">{user?.fullName || user?.email}</div>
          <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 mt-2">Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 p-8">
        <div className="max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your resumes and track your progress.</p>
            </div>
            <Link href="/upload" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition shadow-sm">
              + New Resume
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Resumes", value: resumes.length.toString(), icon: "📄", color: "bg-blue-50 text-blue-600" },
              { label: "Avg ATS Score", value: resumes.length ? Math.round(resumes.filter(r => r.ats_score).reduce((s, r) => s + (r.ats_score || 0), 0) / Math.max(resumes.filter(r => r.ats_score).length, 1)).toString() : "—", icon: "🎯", color: "bg-green-50 text-green-600" },
              { label: "Analyses Run", value: resumes.filter(r => r.status === "analyzed" || r.ats_score).length.toString(), icon: "🔍", color: "bg-purple-50 text-purple-600" },
              { label: "Plan", value: "Free", icon: "⭐", color: "bg-amber-50 text-amber-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { href: "/upload", icon: "🚀", title: "Upload & Analyze", desc: "Upload a resume and get instant AI analysis", color: "from-brand-500 to-purple-600" },
              { href: "/builder", icon: "✨", title: "AI Resume Builder", desc: "Build an ATS-optimized resume from scratch", color: "from-emerald-500 to-teal-600" },
              { href: "/scanner", icon: "🎯", title: "Quick ATS Scan", desc: "Paste text and check ATS score instantly", color: "from-amber-500 to-orange-600" },
            ].map(a => (
              <Link key={a.href} href={a.href} className={`bg-gradient-to-br ${a.color} rounded-xl p-5 text-white hover:opacity-90 transition group`}>
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-white/80 mt-1">{a.desc}</div>
              </Link>
            ))}
          </div>

          {/* Resumes */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Resumes</h2>
            {resumes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-3">📄</div>
                <div className="text-gray-500 mb-4">No resumes yet. Upload or build one to get started.</div>
                <Link href="/upload" className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">Upload Resume</Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-50 text-xs text-gray-400 uppercase">
                    <th className="text-left px-5 py-3 font-medium">Resume</th>
                    <th className="text-left px-5 py-3 font-medium">ATS Score</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium">Version</th>
                    <th className="text-left px-5 py-3 font-medium">Updated</th>
                    <th className="px-5 py-3" />
                  </tr></thead>
                  <tbody>
                    {resumes.map(r => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{r.title}</td>
                        <td className="px-5 py-3">
                          {r.ats_score ? (
                            <span className={`text-sm font-semibold ${r.ats_score >= 80 ? "text-green-600" : r.ats_score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                              {r.ats_score}%
                            </span>
                          ) : <span className="text-xs text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "optimized" ? "bg-green-50 text-green-600" : r.status === "parsed" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-500"}`}>{r.status}</span></td>
                        <td className="px-5 py-3 text-sm text-gray-400">v{r.version || 1}</td>
                        <td className="px-5 py-3 text-xs text-gray-400">{new Date(r.updated_at || r.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3"><Link href={`/analysis?id=${r.id}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Analyze →</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
