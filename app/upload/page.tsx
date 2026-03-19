"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [step, setStep] = useState<"upload" | "jd" | "analyzing">("upload");
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [jdId, setJdId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setStatus("Reading file...");
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      setResumeText(await file.text());
      setStatus("");
    } else {
      // For PDF/DOCX, extract text client-side (basic approach)
      const text = await file.text().catch(() => "");
      if (text && text.length > 50) {
        setResumeText(text);
      } else {
        // Try reading as array buffer and extracting printable chars
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let extracted = "";
        for (let i = 0; i < bytes.length; i++) {
          if (bytes[i] >= 32 && bytes[i] < 127) extracted += String.fromCharCode(bytes[i]);
          else if (bytes[i] === 10 || bytes[i] === 13) extracted += "\n";
        }
        // Clean up
        extracted = extracted.replace(/\n{3,}/g, "\n\n").trim();
        if (extracted.length > 100) {
          setResumeText(extracted);
        } else {
          setStatus("Could not extract text. Please paste your resume text manually.");
          return;
        }
      }
      setStatus("");
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const parseResume = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setStatus("AI is parsing your resume...");
    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });
      const data = await res.json();
      if (data.ok) {
        setResumeId(data.resumeId);
        setStep("jd");
        setStatus("");
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const analyzeMatch = async () => {
    setLoading(true);
    setStep("analyzing");
    setStatus("Analyzing job description...");

    try {
      // Parse JD
      if (jdText.trim()) {
        const jdRes = await fetch("/api/jd/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: jdText }),
        });
        const jdData = await jdRes.json();
        if (jdData.ok) setJdId(jdData.jdId);
      }

      // Redirect to analysis page
      const query = new URLSearchParams({ id: String(resumeId) });
      if (jdId) query.set("jd", String(jdId));
      router.push(`/analysis?${query.toString()}`);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
      setStep("jd");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-brand-600">Resume<span className="text-gray-900">AI</span> Pro</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">&larr; Dashboard</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-8 mb-12">
          {["Upload Resume", "Add Job Description", "AI Analysis"].map((label, i) => {
            const stepIdx = step === "upload" ? 0 : step === "jd" ? 1 : 2;
            const active = i === stepIdx;
            const done = i < stepIdx;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${done ? "bg-green-500 text-white" : active ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-sm ${active ? "text-gray-900 font-medium" : "text-gray-400"}`}>{label}</span>
                {i < 2 && <div className="w-12 h-px bg-gray-200" />}
              </div>
            );
          })}
        </div>

        {step === "upload" && (
          <div>
            <h1 className="text-3xl font-bold text-center mb-2">Upload Your Resume</h1>
            <p className="text-gray-500 text-center mb-8">Drop a file or paste your resume text for AI analysis.</p>

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragOver ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              <div className="text-4xl mb-3">{dragOver ? "📥" : "📄"}</div>
              <div className="text-gray-700 font-medium">Drop your resume here or click to browse</div>
              <div className="text-sm text-gray-400 mt-1">PDF, DOCX, or TXT</div>
            </div>

            <div className="text-center text-sm text-gray-400 my-4">or paste your resume text</div>

            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here..."
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[200px]" />

            <button onClick={parseResume} disabled={!resumeText.trim() || loading}
              className="w-full mt-4 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition">
              {loading ? status : "Parse Resume with AI →"}
            </button>
          </div>
        )}

        {step === "jd" && (
          <div>
            <h1 className="text-3xl font-bold text-center mb-2">Add Job Description</h1>
            <p className="text-gray-500 text-center mb-8">Paste the job description for AI matching and tailored suggestions.</p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-green-600 text-lg">✓</span>
              <span className="text-sm text-green-700">Resume parsed successfully! ID: #{resumeId}</span>
            </div>

            <textarea value={jdText} onChange={e => setJdText(e.target.value)}
              placeholder="Paste the full job description here for AI-powered matching..."
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[250px]" />

            <div className="flex gap-3 mt-4">
              <button onClick={() => router.push(`/analysis?id=${resumeId}`)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">
                Skip — Analyze Without JD
              </button>
              <button onClick={analyzeMatch} disabled={!jdText.trim() || loading}
                className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition">
                {loading ? "Analyzing..." : "Match & Analyze →"}
              </button>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-3 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900">AI is analyzing your resume...</div>
            <div className="text-sm text-gray-400 mt-2">{status}</div>
          </div>
        )}
      </main>
    </div>
  );
}
