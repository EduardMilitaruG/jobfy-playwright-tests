// Mirrors JobFy-v2/packages/backend/prisma/seed.ts. Tests reference jobs by
// these values instead of hard-coding them in every spec, so a seed change
// is a one-file update here.
export const SEEDED_JOBS = {
  react: {
    jobTitle: 'Senior React Developer',
    company: 'TechCorp',
    location: 'Remote',
    source: 'RemoteOK',
    applyLink: 'https://example.com/job/1',
  },
  python: {
    jobTitle: 'Backend Engineer (Python)',
    company: 'DataFlow',
    location: 'Madrid',
    source: 'InfoJobs',
    applyLink: 'https://example.com/job/2',
  },
  fullStack: {
    jobTitle: 'Full Stack Developer',
    company: 'StartupX',
    location: 'Barcelona',
    source: 'Tecnoempleo',
    applyLink: 'https://example.com/job/3',
  },
  devops: {
    jobTitle: 'DevOps Engineer',
    company: 'CloudBase',
    location: 'Remote',
    source: 'LinkedIn',
    applyLink: 'https://example.com/job/4',
  },
  dataScientist: {
    jobTitle: 'Data Scientist',
    company: 'AnalyticsPro',
    location: 'Valencia',
    source: 'Indeed',
    applyLink: 'https://example.com/job/5',
  },
} as const;

export const SEEDED_JOB_COUNT = Object.keys(SEEDED_JOBS).length;

// An id far above anything the seed or a test run will create.
export const MISSING_JOB_ID = 999_999;
