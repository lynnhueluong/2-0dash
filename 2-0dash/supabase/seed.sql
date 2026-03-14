-- ============================================================
-- 2.0 Collective – Seed Data
-- Resource catalogue: 10 curated entries
-- ============================================================
-- Run after migrations. Safe to re-run (uses ON CONFLICT DO NOTHING).
-- ============================================================

insert into public.resources (
  id,
  name,
  description,
  url,
  type,
  categories,
  career_stages,
  identity_tags,
  skill_areas,
  problem_tags,
  pricing,
  usage_count,
  relevance_score
)
values

-- 1. LinkedIn
(
  gen_random_uuid(),
  'LinkedIn',
  'The world''s largest professional network. Use it to build your personal brand, research companies and decision-makers, find job postings, and stay visible to recruiters.',
  'https://www.linkedin.com',
  'tool',
  array['networking', 'job-search', 'personal-brand'],
  array['exploring', 'transitioning', 'advancing', 'executive'],
  array[],
  array['networking', 'personal-branding', 'job-search'],
  array['visibility', 'networking', 'career-pivot'],
  'freemium',
  0,
  0.95
),

-- 2. Notion
(
  gen_random_uuid(),
  'Notion',
  'An all-in-one workspace for notes, wikis, databases, and project management. Ideal for building a second brain, tracking job applications, or organizing a career strategy.',
  'https://www.notion.so',
  'tool',
  array['productivity', 'organization', 'knowledge-management'],
  array['exploring', 'transitioning', 'advancing'],
  array[],
  array['organization', 'project-management', 'systems-thinking'],
  array['overwhelm', 'goal-setting', 'time-management'],
  'freemium',
  0,
  0.88
),

-- 3. Loom
(
  gen_random_uuid(),
  'Loom',
  'Async video messaging tool that lets you record your screen and camera. Powerful for showcasing work samples, pitching yourself to employers, or building a visible portfolio.',
  'https://www.loom.com',
  'tool',
  array['communication', 'personal-brand', 'portfolio'],
  array['transitioning', 'advancing'],
  array[],
  array['communication', 'storytelling', 'personal-branding'],
  array['visibility', 'showing-work', 'remote-work'],
  'freemium',
  0,
  0.82
),

-- 4. Designing Your Life (book)
(
  gen_random_uuid(),
  'Designing Your Life',
  'A book by Stanford professors Bill Burnett and Dave Evans that applies design-thinking principles to building a fulfilling career and life. Includes practical exercises like the Odyssey Plan.',
  'https://designingyour.life/the-book',
  'book',
  array['career-design', 'self-discovery', 'goal-setting'],
  array['exploring', 'transitioning'],
  array[],
  array['self-awareness', 'decision-making', 'creative-thinking'],
  array['career-clarity', 'feeling-stuck', 'life-direction'],
  'paid',
  0,
  0.93
),

-- 5. What Color Is Your Parachute? (book)
(
  gen_random_uuid(),
  'What Color Is Your Parachute?',
  'The perennial career-change bible by Richard N. Bolles, updated annually. Covers self-inventory exercises, job-hunting strategies, and salary negotiation—especially useful for career changers.',
  'https://www.parachutebook.com',
  'book',
  array['career-design', 'job-search', 'self-discovery'],
  array['exploring', 'transitioning'],
  array[],
  array['self-awareness', 'job-search', 'negotiation'],
  array['career-pivot', 'job-search-strategy', 'feeling-stuck'],
  'paid',
  0,
  0.90
),

-- 6. Coursera
(
  gen_random_uuid(),
  'Coursera',
  'Online learning platform offering courses, Specializations, and degrees from top universities and companies. Strong catalog for data, tech, business, and leadership skills.',
  'https://www.coursera.org',
  'course',
  array['learning', 'upskilling', 'credentials'],
  array['exploring', 'transitioning', 'advancing'],
  array[],
  array['technical-skills', 'leadership', 'data-literacy', 'business-acumen'],
  array['skill-gaps', 'career-pivot', 'credential-building'],
  'freemium',
  0,
  0.87
),

-- 7. Elpha
(
  gen_random_uuid(),
  'Elpha',
  'A private professional community for women in tech. Members share salary data, ask for advice, post jobs, and support each other through career challenges in a candid, moderated environment.',
  'https://elpha.com',
  'community',
  array['networking', 'community', 'job-search'],
  array['exploring', 'transitioning', 'advancing', 'executive'],
  array['women'],
  array['networking', 'negotiation', 'leadership'],
  array['impostor-syndrome', 'salary-negotiation', 'belonging', 'gender-bias'],
  'free',
  0,
  0.91
),

-- 8. Salary Transparent Street (YouTube / Instagram)
(
  gen_random_uuid(),
  'Salary Transparent Street',
  'A social-media series where real professionals share their salaries and job details on camera. An invaluable, crowd-sourced benchmark for understanding pay across industries and roles.',
  'https://www.youtube.com/@SalaryTransparentStreet',
  'tool',
  array['salary', 'job-search', 'negotiation'],
  array['exploring', 'transitioning', 'advancing'],
  array[],
  array['negotiation', 'financial-literacy', 'market-research'],
  array['salary-negotiation', 'pay-equity', 'underearning'],
  'free',
  0,
  0.85
),

-- 9. The Muse
(
  gen_random_uuid(),
  'The Muse',
  'A career-development platform with job listings, company culture profiles, and a deep library of advice articles on resumes, interviews, workplace challenges, and career pivots.',
  'https://www.themuse.com',
  'tool',
  array['job-search', 'career-advice', 'company-research'],
  array['exploring', 'transitioning', 'advancing'],
  array[],
  array['job-search', 'interviewing', 'resume-writing'],
  array['career-pivot', 'job-search-strategy', 'company-culture-fit'],
  'free',
  0,
  0.84
),

-- 10. Atomic Habits (book)
(
  gen_random_uuid(),
  'Atomic Habits',
  'James Clear''s bestselling guide to building good habits and breaking bad ones using a proven four-step framework. Essential for anyone trying to sustain the behavioral change required for a career transition.',
  'https://jamesclear.com/atomic-habits',
  'book',
  array['productivity', 'behavior-change', 'goal-setting'],
  array['exploring', 'transitioning', 'advancing', 'executive'],
  array[],
  array['habit-formation', 'self-discipline', 'goal-setting', 'resilience'],
  array['consistency', 'motivation', 'procrastination', 'follow-through'],
  'paid',
  0,
  0.89
)

on conflict (id) do nothing;
