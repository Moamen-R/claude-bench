import { describe, it, expect } from 'vitest';
import { ClaudeMdGenerator } from '../src/generators/claude-md-generator.js';

describe('ClaudeMdGenerator', () => {
  const generator = new ClaudeMdGenerator();

  it('generates tailored CLAUDE.md for single field', () => {
    const md = generator.generate(['fullstack']);
    expect(md).toContain('# CLAUDE.md');
    expect(md).toContain('Full Stack Web Developer');
    expect(md).toContain('Next.js');
    expect(md).toContain('shadcn/ui');
  });

  it('merges guidelines cleanly for multi-field selection', () => {
    const md = generator.generate(['fullstack', 'cybersecurity']);
    expect(md).toContain('Full Stack Web Developer');
    expect(md).toContain('Cyber Security');
    expect(md).toContain('OWASP');
    expect(md).toContain('Next.js');
  });

  it('covers all 11 fields with dedicated sections', () => {
    const allFields = [
      'fullstack',
      'cybersecurity',
      'video-editing',
      'researcher',
      'marketing',
      'mobile-dev',
      'desktop-dev',
      'ios-dev',
      'backend-dev',
      'frontend-dev',
      'software-eng',
    ] as const;

    const md = generator.generate([...allFields]);
    expect(md).toContain('Full Stack Web Developer');
    expect(md).toContain('Cyber Security');
    expect(md).toContain('Video Editing');
    expect(md).toContain('Researcher');
    expect(md).toContain('Marketing');
    expect(md).toContain('Mobile Developer');
    expect(md).toContain('Desktop Developer');
    expect(md).toContain('iOS Developer');
    expect(md).toContain('Backend Developer');
    expect(md).toContain('Front-End Developer');
    expect(md).toContain('Software Engineer');
  });
});
