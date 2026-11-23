/** Per-student seed prompts so every enrollment authors at least one thread */

export const BRANCH_PROMPTS: Record<string, string[]> = {
  AIML: [
    "choosing evaluation metrics for a classification mini-project",
    "avoiding data leakage in sklearn pipelines",
    "explaining CNN results in a viva without jargon",
    "tuning learning rate for a small dataset",
    "building a clean train/validation split for tabular data",
    "presenting feature importance honestly",
  ],
  RAI: [
    "tuning PID for a line-following robot",
    "reducing sensor noise on IR arrays",
    "ROS2 vs Arduino for a semester demo",
    "power budgeting for a mobile bot",
    "logging motor PWM safely during tests",
    "calibrating IMU drift before demos",
  ],
  CEA: [
    "MQTT QoS choices for campus IoT demos",
    "structuring an IoT dashboard for evaluators",
    "handling intermittent Wi-Fi on ESP boards",
    "picking sensors for a CEA lab prototype",
    "documenting wiring diagrams for submission",
    "comparing edge vs cloud processing trade-offs",
  ],
  CSE: [
    "organizing a DSA revision plan before midterms",
    "debugging segmentation faults faster",
    "writing clearer project abstracts",
    "Git branching for a 4-person team",
    "explaining time complexity in viva",
    "structuring REST APIs for a mini-project",
  ],
  CSIT: [
    "deploying a student web app without drama",
    "securing login forms for lab evaluation",
    "Next.js vs plain React for a CSIT project",
    "database schema design for team submissions",
    "CI basics before project demos",
    "API error handling that looks professional",
  ],
  CST: [
    "threat modeling a campus web app lightly",
    "password hashing choices for lab projects",
    "HTTPS and cookies for a demo environment",
    "input validation checklists before viva",
    "logging security events without overkill",
    "explaining OWASP Top 10 with campus examples",
  ],
  CE: [
    "revising OS scheduling for CE labs",
    "networking basics that keep showing up in viva",
    "C memory management common mistakes",
    "UML diagrams faculty actually want",
    "comparing sorting algorithms clearly",
    "writing lab journals that score better",
  ],
  IT: [
    "Agile rituals that fit a 3-month IT project",
    "requirement gathering templates for faculty",
    "choosing a stack for an IT delivery demo",
    "test cases that impress evaluators",
    "documenting APIs for the final report",
    "handling scope creep in student teams",
  ],
  CSD: [
    "designing onboarding flows with clear states",
    "accessibility checklist for student UIs",
    "component structure for a design-heavy project",
    "user research lite before building screens",
    "handing off Figma to frontend cleanly",
    "motion that helps UX without distraction",
  ],
  AIDS: [
    "feature engineering for messy CSV exports",
    "SQL window functions for ranking queries",
    "dashboard KPI definitions that stay honest",
    "cleaning nulls without inventing stories",
    "choosing charts for AIDS analytics demos",
    "explaining bias in a campus dataset",
  ],
}

const FALLBACK_PROMPTS = [
  "getting started with campus project documentation",
  "finding mentors for assignment doubts",
  "balancing lab work and midterm prep",
  "asking better questions on MentorMesh",
  "preparing a short project demo script",
  "collaborating without merge conflicts",
]

export function promptsForBranch(branch: string | null | undefined) {
  const key = (branch || "").toUpperCase()
  return BRANCH_PROMPTS[key] || FALLBACK_PROMPTS
}

export function personalThread(input: {
  name: string
  enrollmentNo: string | null
  branch: string | null
  index: number
}) {
  const first = input.name.trim().split(/\s+/)[0] || "there"
  const branch = (input.branch || "CSE").toUpperCase()
  const prompts = promptsForBranch(branch)
  const topic = prompts[input.index % prompts.length]
  const enrollment = input.enrollmentNo || "campus"

  return {
    title: `${branch}: tips on ${topic}?`,
    description: `<p>Hi, I'm <strong>${escapeHtml(first)}</strong> (${escapeHtml(enrollment)}). Looking for practical guidance on <em>${escapeHtml(topic)}</em> for our ${escapeHtml(branch)} coursework / mini-project. What would seniors recommend first?</p>`,
    tags: [branch, "Help", "Campus"],
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
