const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function groqChat(messages: { role: string; content: string }[], temperature = 0.3): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature, max_tokens: 4096 }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractJSON(text: string): any {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  try { return JSON.parse(match[1].trim()); } catch { return null; }
}

export async function parseResume(text: string) {
  const raw = await groqChat([
    { role: 'system', content: 'Extract structured resume data. Return ONLY valid JSON with these fields: { name, email, phone, location, linkedin, summary, experience: [{ title, company, startDate, endDate, bullets: [] }], education: [{ degree, school, year, gpa }], skills: [], certifications: [], projects: [{ name, description }] }' },
    { role: 'user', content: `Parse this resume:\n\n${text.slice(0, 6000)}` },
  ]);
  return extractJSON(raw);
}

export async function analyzeJD(text: string) {
  const raw = await groqChat([
    { role: 'system', content: 'Analyze this job description. Return ONLY valid JSON: { title, company, requiredSkills: [], preferredSkills: [], hiddenKeywords: [], experienceLevel, educationReq, salaryRange, remotePolicy, tone }' },
    { role: 'user', content: `Analyze:\n\n${text.slice(0, 4000)}` },
  ]);
  return extractJSON(raw);
}

export async function matchResumeToJD(resumeData: any, jdData: any) {
  const raw = await groqChat([
    { role: 'system', content: `You are an expert ATS system. Compare a resume against a job description.
Return ONLY valid JSON:
{
  "matchPct": <0-100>,
  "matchedSkills": [],
  "missingSkills": [],
  "sectionScores": { "skills": <0-100>, "experience": <0-100>, "education": <0-100>, "keywords": <0-100> },
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "recruiterVerdict": "<would_interview|maybe|likely_reject>",
  "recruiterNotes": "<what a recruiter would think>"
}` },
    { role: 'user', content: `Resume:\n${JSON.stringify(resumeData)}\n\nJob Description:\n${JSON.stringify(jdData)}` },
  ]);
  return extractJSON(raw);
}

export async function rewriteBullets(bullets: string[], tone: 'startup' | 'faang' | 'enterprise' = 'faang') {
  const toneGuide = {
    startup: 'Scrappy, results-driven. Emphasize wearing multiple hats, speed, and direct business impact.',
    faang: 'Technical depth, scale (millions of users), measurable metrics, system design impact.',
    enterprise: 'Process improvement, cross-functional collaboration, stakeholder management, compliance.',
  }[tone];

  const raw = await groqChat([
    { role: 'system', content: `Rewrite resume bullet points to be ATS-optimized. Tone: ${toneGuide}
Rules: Start with strong action verbs. Add quantified metrics where possible. Be specific. Keep each bullet to 1-2 lines.
Return ONLY a JSON array of rewritten bullets.` },
    { role: 'user', content: JSON.stringify(bullets) },
  ]);
  return extractJSON(raw) || bullets;
}

export async function optimizeFullResume(resumeData: any, jdText?: string) {
  const raw = await groqChat([
    { role: 'system', content: `You are a world-class resume optimizer. Improve the entire resume for maximum ATS compatibility and human appeal.
${jdText ? 'Tailor it to the provided job description.' : ''}
Return ONLY valid JSON in the same structure as the input but with all fields improved:
- Sharper summary (2-3 sentences, keyword-rich)
- Stronger bullet points (action verb + metric + result)
- Skills reordered by relevance
- No fluff words
Keep the same JSON structure as input.` },
    { role: 'user', content: `Resume: ${JSON.stringify(resumeData)}${jdText ? `\n\nJob Description: ${jdText}` : ''}` },
  ]);
  return extractJSON(raw) || resumeData;
}

export async function generateSkillGap(resumeData: any, jdData: any) {
  const raw = await groqChat([
    { role: 'system', content: `Analyze skill gaps between a resume and job description. Return ONLY valid JSON:
{
  "gaps": [{ "skill": "", "importance": "critical|important|nice-to-have", "currentLevel": "none|basic|intermediate|advanced", "targetLevel": "intermediate|advanced|expert", "learningPath": "", "timeEstimate": "" }],
  "roadmap": { "week1": "", "week2": "", "month1": "", "month3": "" }
}` },
    { role: 'user', content: `Resume: ${JSON.stringify(resumeData)}\nJob: ${JSON.stringify(jdData)}` },
  ]);
  return extractJSON(raw);
}

export async function simulateRecruiter(resumeData: any, jdData?: any) {
  const raw = await groqChat([
    { role: 'system', content: `You are a senior tech recruiter at a top company. Review this resume as if you received it for a role.
Return ONLY valid JSON:
{
  "firstImpression": "",
  "timeSpent": "<e.g. 6 seconds>",
  "decision": "interview|maybe|pass",
  "reasoning": "",
  "whatCaughtEye": [],
  "concerns": [],
  "interviewQuestions": [],
  "advice": ""
}` },
    { role: 'user', content: `Resume: ${JSON.stringify(resumeData)}${jdData ? `\nJob: ${JSON.stringify(jdData)}` : ''}` },
  ]);
  return extractJSON(raw);
}
