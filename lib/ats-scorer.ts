export type ATSResult = {
  score: number; // 0-100
  grade: string; // A, B, C, D, F
  checks: ATSCheck[];
  suggestions: string[];
};

export type ATSCheck = {
  name: string;
  passed: boolean;
  score: number; // 0-10
  maxScore: number;
  message: string;
  category: 'format' | 'content' | 'keywords' | 'structure';
};

export type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: { title: string; company: string; startDate: string; endDate: string; description: string }[];
  education: { degree: string; school: string; year: string; gpa: string }[];
  skills: string[];
  certifications: string[];
};

const REQUIRED_SECTIONS = ['summary', 'experience', 'education', 'skills'];
const POWER_VERBS = ['achieved','managed','developed','created','implemented','led','designed','improved','increased','reduced','launched','built','delivered','optimized','automated','streamlined','negotiated','coordinated','analyzed','resolved','established','generated','mentored','orchestrated','transformed','spearheaded'];

export function scoreResume(data: ResumeData, jobDescription?: string): ATSResult {
  const checks: ATSCheck[] = [];

  // 1. Contact info completeness (10 pts)
  let contactScore = 0;
  if (data.fullName.trim()) contactScore += 3;
  if (data.email.trim() && data.email.includes('@')) contactScore += 3;
  if (data.phone.trim()) contactScore += 2;
  if (data.linkedin.trim()) contactScore += 2;
  checks.push({
    name: 'Contact Information',
    passed: contactScore >= 8,
    score: contactScore,
    maxScore: 10,
    message: contactScore >= 8 ? 'Complete contact info' : 'Add missing contact details (name, email, phone, LinkedIn)',
    category: 'format',
  });

  // 2. Summary section (10 pts)
  const summaryWords = data.summary.trim().split(/\s+/).filter(Boolean).length;
  const summaryScore = !data.summary.trim() ? 0 : summaryWords < 20 ? 4 : summaryWords > 100 ? 6 : 10;
  checks.push({
    name: 'Professional Summary',
    passed: summaryScore >= 8,
    score: summaryScore,
    maxScore: 10,
    message: !data.summary.trim() ? 'Add a professional summary (2-4 sentences)' : summaryWords < 20 ? 'Summary is too short — aim for 30-60 words' : summaryWords > 100 ? 'Summary is too long — keep it under 80 words' : 'Good summary length',
    category: 'content',
  });

  // 3. Experience section (20 pts)
  let expScore = 0;
  if (data.experience.length === 0) {
    expScore = 0;
  } else {
    expScore += Math.min(data.experience.length * 3, 9); // up to 3 entries
    data.experience.forEach(exp => {
      if (exp.title.trim()) expScore += 1;
      if (exp.company.trim()) expScore += 1;
      if (exp.description.trim().length > 50) expScore += 1;
    });
    expScore = Math.min(expScore, 20);
  }
  checks.push({
    name: 'Work Experience',
    passed: expScore >= 14,
    score: expScore,
    maxScore: 20,
    message: data.experience.length === 0 ? 'Add your work experience' : expScore < 14 ? 'Add more detail to your experience entries — include descriptions with metrics' : 'Good experience section',
    category: 'content',
  });

  // 4. Education (10 pts)
  let eduScore = 0;
  if (data.education.length > 0) {
    eduScore += 5;
    data.education.forEach(edu => {
      if (edu.degree.trim()) eduScore += 2;
      if (edu.school.trim()) eduScore += 2;
    });
    eduScore = Math.min(eduScore, 10);
  }
  checks.push({
    name: 'Education',
    passed: eduScore >= 7,
    score: eduScore,
    maxScore: 10,
    message: data.education.length === 0 ? 'Add your education' : 'Education section present',
    category: 'structure',
  });

  // 5. Skills count (15 pts)
  const skillCount = data.skills.filter(s => s.trim()).length;
  const skillScore = Math.min(Math.round(skillCount * 2.5), 15);
  checks.push({
    name: 'Skills Listed',
    passed: skillScore >= 10,
    score: skillScore,
    maxScore: 15,
    message: skillCount === 0 ? 'Add relevant skills' : skillCount < 5 ? `Only ${skillCount} skills — aim for 6-10 relevant skills` : `${skillCount} skills listed — good coverage`,
    category: 'content',
  });

  // 6. Power/Action verbs (10 pts)
  const allText = [data.summary, ...data.experience.map(e => e.description)].join(' ').toLowerCase();
  const verbsUsed = POWER_VERBS.filter(v => allText.includes(v));
  const verbScore = Math.min(verbsUsed.length * 2, 10);
  checks.push({
    name: 'Action Verbs',
    passed: verbScore >= 6,
    score: verbScore,
    maxScore: 10,
    message: verbsUsed.length === 0 ? 'Use action verbs like "achieved", "managed", "developed", "implemented"' : `${verbsUsed.length} action verbs found: ${verbsUsed.slice(0,5).join(', ')}`,
    category: 'content',
  });

  // 7. Quantified achievements (10 pts)
  const numbers = allText.match(/\d+%|\$\d+|\d+\+?\s*(users|customers|clients|projects|people|team|revenue|sales|growth)/gi) || [];
  const quantScore = Math.min(numbers.length * 3, 10);
  checks.push({
    name: 'Quantified Achievements',
    passed: quantScore >= 6,
    score: quantScore,
    maxScore: 10,
    message: numbers.length === 0 ? 'Add numbers — "Increased revenue by 30%", "Managed team of 12"' : `${numbers.length} quantified achievements found`,
    category: 'content',
  });

  // 8. Keyword match (15 pts, only if job description provided)
  if (jobDescription?.trim()) {
    const jdWords = new Set(jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    const resumeWords = new Set(allText.match(/\b[a-z]{3,}\b/g) || []);
    const commonWords = new Set(['the','and','for','that','with','this','from','have','been','will','your','they','which','their','about','would','there','each','make','like','has']);
    const jdKeywords = Array.from(jdWords).filter(w => !commonWords.has(w));
    const matched = jdKeywords.filter(w => resumeWords.has(w));
    const matchRate = jdKeywords.length > 0 ? matched.length / jdKeywords.length : 0;
    const kwScore = Math.round(matchRate * 15);
    checks.push({
      name: 'Job Description Keywords',
      passed: kwScore >= 10,
      score: kwScore,
      maxScore: 15,
      message: `${matched.length}/${jdKeywords.length} keywords matched (${Math.round(matchRate * 100)}%)`,
      category: 'keywords',
    });
  }

  // Calculate total
  const totalMax = checks.reduce((s, c) => s + c.maxScore, 0);
  const totalScore = checks.reduce((s, c) => s + c.score, 0);
  const percentage = Math.round((totalScore / totalMax) * 100);

  const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F';

  // Suggestions
  const suggestions = checks.filter(c => !c.passed).map(c => c.message);
  if (verbsUsed.length < 3) suggestions.push('Start bullet points with strong action verbs');
  if (numbers.length < 2) suggestions.push('Add metrics and numbers to quantify your impact');
  if (data.certifications.length === 0) suggestions.push('Consider adding relevant certifications');

  return { score: percentage, grade, checks, suggestions };
}

export function emptyResume(): ResumeData {
  return {
    fullName: '', email: '', phone: '', location: '', linkedin: '', summary: '',
    experience: [{ title: '', company: '', startDate: '', endDate: '', description: '' }],
    education: [{ degree: '', school: '', year: '', gpa: '' }],
    skills: [''],
    certifications: [],
  };
}
