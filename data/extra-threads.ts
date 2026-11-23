import type { SeedThread } from "./branch-threads"

const BRANCHES = ["AIML", "RAI", "CEA", "CSE", "CSIT", "CST", "CE", "IT", "CSD", "AIDS"] as const

type Template = {
  title: (branch: string, n: number) => string
  description: (branch: string, n: number) => string
  tags: (branch: string) => string[]
  answer: (branch: string) => string
  topicTags: string[]
}

const TEMPLATES: Template[] = [
  {
    topicTags: ["Lab", "Viva"],
    title: (b, n) => `How should I prepare for the ${b} unit ${((n % 5) + 1)} viva?`,
    description: (b, n) =>
      `<p>We have a ${b} viva next week covering module ${((n % 5) + 1)}. What should I revise first, and how deep do evaluators usually go?</p>`,
    tags: (b) => [b, "Viva", "Exam Prep"],
    answer: (b) =>
      `<p>Rebuild the core diagrams from memory, rehearse 3–4 “why this approach” answers, and keep a one-page cheat sheet of formulas/commands for ${b}. Practice explaining trade-offs out loud.</p>`,
  },
  {
    topicTags: ["Project"],
    title: (b, n) => `Suggested architecture for a ${b} mini-project (team of ${2 + (n % 3)})?`,
    description: (b, n) =>
      `<p>Our ${b} team needs a realistic architecture for a ${8 + (n % 6)}-week mini-project. What layers should we show in the report?</p>`,
    tags: (b) => [b, "Project", "Software Engineering"],
    answer: (b) =>
      `<p>Keep it simple: UI → API → data store, plus one diagram for deployment. Document assumptions and failure cases. For ${b}, highlight the domain-specific module clearly.</p>`,
  },
  {
    topicTags: ["Internship", "Career"],
    title: (b, n) => `What ${b} skills matter most for internships this year?`,
    description: (b) =>
      `<p>Recruiters keep asking for “practical ${b} proof.” Beyond CGPA, what portfolio pieces actually help?</p>`,
    tags: (b) => [b, "Career", "Internship"],
    answer: (b) =>
      `<p>Ship 1–2 public projects with README + demo, know fundamentals cold, and prepare 2 stories: a bug you fixed and a design trade-off. Tailor keywords to ${b} JD language.</p>`,
  },
  {
    topicTags: ["Debugging"],
    title: (b, n) => `Best debugging workflow for ${b} lab assignments?`,
    description: (b, n) =>
      `<p>My ${b} assignment fails intermittently (case ${n}). How do seniors isolate root cause without wasting the whole night?</p>`,
    tags: (b) => [b, "Debugging", "Lab"],
    answer: () =>
      `<p>Reproduce with a minimal input, bisect recent changes, log assumptions at boundaries, and write the failing case into a test before “fixing.” Time-box rabbit holes.</p>`,
  },
  {
    topicTags: ["Git"],
    title: (b, n) => `How do ${b} teams avoid merge conflicts before demo day?`,
    description: (b) =>
      `<p>Our ${b} repo keeps breaking the day before evaluation. What’s a campus-friendly Git discipline?</p>`,
    tags: (b) => [b, "Git", "Collaboration"],
    answer: () =>
      `<p>Short-lived feature branches, daily pull from main, review PRs before merge, and freeze main 24h before demos. Assign one integration owner.</p>`,
  },
  {
    topicTags: ["Documentation"],
    title: (b, n) => `What belongs in a ${b} project README vs report?`,
    description: (b) =>
      `<p>Faculty wants both a README and a PDF report for our ${b} submission. How do we avoid duplicating everything?</p>`,
    tags: (b) => [b, "Documentation", "Project"],
    answer: () =>
      `<p>README = setup, run, screenshots, links. Report = problem statement, design, results, reflections. Cross-link; don’t paste the same paragraphs twice.</p>`,
  },
  {
    topicTags: ["Performance"],
    title: (b, n) => `How do I talk about performance in a ${b} demo without overclaiming?`,
    description: (b, n) =>
      `<p>We improved something in our ${b} build (iteration ${n}) but only have laptop benchmarks. What’s honest to say?</p>`,
    tags: (b) => [b, "Performance", "Soft Skills"],
    answer: () =>
      `<p>State hardware, dataset size, and method. Prefer relative improvements (“~2× faster on this laptop”) over absolute marketing numbers. Mention limits.</p>`,
  },
  {
    topicTags: ["Testing"],
    title: (b, n) => `Minimum testing strategy for a ${b} assignment submission?`,
    description: (b) =>
      `<p>We don’t have time for full coverage. What’s the smallest useful test set for ${b} grading?</p>`,
    tags: (b) => [b, "Testing", "Lab"],
    answer: () =>
      `<p>Cover happy path, one edge case, and one failure mode. Add a short “how to run tests” section. Screenshots of green runs help in viva.</p>`,
  },
]

function picsum(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/960/540`
}

/** Extra generated campus threads so the feed feels full */
export function buildExtraThreads(): SeedThread[] {
  const out: SeedThread[] = []
  let i = 0
  for (const branch of BRANCHES) {
    for (let t = 0; t < TEMPLATES.length; t++) {
      const tmpl = TEMPLATES[t]
      const n = i + 1
      const withImage = n % 4 === 0
      const description = withImage
        ? `${tmpl.description(branch, n)}<figure class="question-figure"><img src="${picsum(`${branch}-${n}`)}" alt="Lab screenshot" loading="lazy" class="question-image" /></figure>`
        : tmpl.description(branch, n)

      out.push({
        branch,
        title: tmpl.title(branch, n),
        description,
        tags: [...new Set([...tmpl.tags(branch), ...tmpl.topicTags])],
        votes: 4 + ((i * 7) % 28),
        answers: [
          {
            accepted: true,
            content: tmpl.answer(branch),
          },
          ...(n % 3 === 0
            ? [
                {
                  content: `<p>Also ask your mentor for past year questions — patterns repeat more than people admit.</p>`,
                },
              ]
            : []),
        ],
      })
      i++
    }
  }

  // Shared campus life threads
  const campus: SeedThread[] = [
    {
      branch: "CSE",
      title: "Where do I find quiet spots on campus for pair programming?",
      description:
        "<p>Library fills up fast before midterms. Any underrated places with power sockets?</p>",
      tags: ["Campus", "Collaboration", "Career"],
      votes: 19,
      answers: [
        {
          accepted: true,
          content:
            "<p>Try the quieter floors of the central library early morning, and book project rooms when available. Bring a power strip.</p>",
        },
      ],
    },
    {
      branch: "IT",
      title: "How do I ask for a recommendation letter without awkwardness?",
      description:
        "<p>Need a letter for internship applications. What’s the polite timeline and what should I attach?</p>",
      tags: ["Career", "Soft Skills"],
      votes: 25,
      answers: [
        {
          accepted: true,
          content:
            "<p>Ask 2–3 weeks ahead, share resume + bullet points of your work with that faculty, and propose a soft deadline. Follow up once politely.</p>",
        },
      ],
    },
    {
      branch: "AIML",
      title: "Can someone review my model metrics slide for the AIML showcase?",
      description: `<p>I’m worried I’m overselling accuracy. Attached is a mock layout of the slide.</p><figure class="question-figure"><img src="${picsum("aiml-metrics")}" alt="Metrics slide mock" loading="lazy" class="question-image" /></figure>`,
      tags: ["AIML", "Soft Skills", "Machine Learning"],
      votes: 14,
      answers: [
        {
          accepted: true,
          content:
            "<p>Show dataset size, split method, and baseline comparison. Drop vanity metrics if they don’t match the task. One clean chart beats three busy ones.</p>",
        },
      ],
    },
    {
      branch: "RAI",
      title: "Line follower keeps losing the line on sharp turns — any wiring tips?",
      description: `<p>Here’s a photo of our sensor array mounting. Heights look uneven.</p><figure class="question-figure"><img src="${picsum("rai-line")}" alt="Robot sensor array" loading="lazy" class="question-image" /></figure>`,
      tags: ["RAI", "Robotics", "Hardware"],
      votes: 18,
      answers: [
        {
          accepted: true,
          content:
            "<p>Level the array, keep consistent ground clearance, and recalibrate thresholds after every mechanical change. Tune PID only after hardware is stable.</p>",
        },
      ],
    },
    {
      branch: "CEA",
      title: "How do we present IoT dashboards without looking like a marketing deck?",
      description: `<p>Screenshot of our current dashboard — too many colors?</p><figure class="question-figure"><img src="${picsum("cea-dash")}" alt="IoT dashboard" loading="lazy" class="question-image" /></figure>`,
      tags: ["CEA", "IoT", "Visualization"],
      votes: 11,
      answers: [
        {
          accepted: true,
          content:
            "<p>One primary KPI, muted palette, show units and last-updated time. Hide decorative charts that don’t support a decision.</p>",
        },
      ],
    },
  ]

  return [...out, ...campus]
}
