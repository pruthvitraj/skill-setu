function extract(text = '') {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = text.match(/(\+?\d[\d\s-]{8,}\d)/)?.[0] || '';
  const skillHints = [
    'python', 'java', 'sql', 'react', 'node', 'aws', 'docker', 'javascript', 'mongodb',
    'spark', 'pandas', 'html', 'css', 'git', 'linux', 'typescript', 'express',
  ];
  const lower = text.toLowerCase();
  const skills = skillHints.filter((s) => require('../../utils/text').hasTerm(lower, s));
  return {
    name: lines[0] || '',
    email,
    phone,
    education: lines.filter((l) => /b\.?tech|bachelor|master|university|college/i.test(l)).slice(0, 8),
    skills,
    experience: lines.filter((l) => /intern|engineer|developer|analyst/i.test(l)).slice(0, 8),
    projects: lines.filter((l) => /project/i.test(l)).slice(0, 8),
    certifications: lines.filter((l) => /certif|aws|coursera|nptel/i.test(l)).slice(0, 8),
    rawText: text.slice(0, 20000),
  };
}

async function parseBuffer(buffer, mimeType) {
  let text = '';
  if (mimeType === 'application/pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(new Uint8Array(buffer));
      text = data.text || '';
    } catch {
      throw new (require('../../utils/AppError').AppError)('Unable to read this PDF. Upload a readable text-based PDF.', 422, 'UNREADABLE_RESUME');
    }
  } else {
    throw new (require('../../utils/AppError').AppError)('Upload a PDF resume.', 422, 'UNSUPPORTED_RESUME');
  }
  if (!text.trim()) throw new (require('../../utils/AppError').AppError)('This PDF has no readable text.', 422, 'UNREADABLE_RESUME');
  return extract(text);
}

module.exports = { parseBuffer, extract };
