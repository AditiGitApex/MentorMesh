/** Branch-focused seed threads for MentorMesh */
export type SeedThread = {
  branch: string
  title: string
  description: string
  tags: string[]
  answers: { content: string; accepted?: boolean }[]
  votes?: number
}

export const BRANCH_THREADS: SeedThread[] = [
  // AIML
  {
    branch: "AIML",
    title: "How do I choose between Random Forest and XGBoost for a tabular project?",
    description:
      "<p>Our AIML mini-project uses a medium-sized tabular dataset with mixed categorical features. When should we prefer Random Forest vs XGBoost, and what metrics should we report in the viva?</p>",
    tags: ["AIML", "Machine Learning", "XGBoost"],
    votes: 24,
    answers: [
      {
        accepted: true,
        content:
          "<p>Start with Random Forest as a strong baseline (fewer hyperparameters, good with missing values). Move to XGBoost when you need higher accuracy and can afford tuning. Report Precision/Recall/F1 plus a confusion matrix, and mention cross-validation.</p>",
      },
      {
        content:
          "<p>Also track training time. For campus demos, RF is easier to explain; XGBoost looks stronger if you show feature importance plots.</p>",
      },
    ],
  },
  {
    branch: "AIML",
    title: "Best way to avoid data leakage in train/test splits?",
    description:
      "<p>I accidentally scaled the full dataset before splitting and my accuracy looked unrealistically high. What’s the correct pipeline order for preprocessing?</p>",
    tags: ["AIML", "Data Science", "MLOps"],
    votes: 31,
    answers: [
      {
        accepted: true,
        content:
          "<p>Split first, then fit scalers/encoders on the training set only and transform train/validation/test separately. Use <code>Pipeline</code> + <code>ColumnTransformer</code> so leakage is harder to introduce.</p>",
      },
    ],
  },
  {
    branch: "AIML",
    title: "CNN vs Vision Transformer for a small image dataset?",
    description:
      "<p>We have ~2k labeled images. Is fine-tuning a ViT overkill compared to ResNet18 transfer learning?</p>",
    tags: ["AIML", "Deep Learning", "Computer Vision"],
    votes: 18,
    answers: [
      {
        accepted: true,
        content:
          "<p>For small datasets, CNN transfer learning (ResNet/EfficientNet) is usually more stable. ViT needs more data or strong regularization. Prefer CNN unless you have a clear reason and compute budget.</p>",
      },
    ],
  },

  // RAI
  {
    branch: "RAI",
    title: "How do I implement PID control on a line-following robot?",
    description:
      "<p>Our RAI bot oscillates on curves. How should we tune Kp, Ki, Kd for an IR-array line follower?</p>",
    tags: ["RAI", "Control Systems", "Robotics"],
    votes: 22,
    answers: [
      {
        accepted: true,
        content:
          "<p>Start with Kp only until it follows roughly, add Kd to damp oscillation, then tiny Ki for steady-state error. Tune on a fixed track, log error over time, and avoid integral windup with clamping.</p>",
      },
    ],
  },
  {
    branch: "RAI",
    title: "ROS2 vs bare Arduino for a semester robotics project?",
    description:
      "<p>We need localization + obstacle avoidance. Is ROS2 worth the setup cost on campus timelines?</p>",
    tags: ["RAI", "ROS", "Embedded"],
    votes: 16,
    answers: [
      {
        accepted: true,
        content:
          "<p>If the project needs multi-node sensing/planning, ROS2 pays off. For a simple line follower/maze bot, Arduino/ESP32 is faster to ship. Hybrid is common: MCU for low-level control, Pi for vision.</p>",
      },
      {
        content:
          "<p>Document your architecture either way—viva panels care about trade-offs more than the framework brand.</p>",
      },
    ],
  },
  {
    branch: "RAI",
    title: "Sensor fusion: when to use Kalman filter for IMU + encoders?",
    description:
      "<p>Odometry drifts quickly. Is a simple complementary filter enough, or should we implement Kalman?</p>",
    tags: ["RAI", "Sensors", "Robotics"],
    votes: 14,
    answers: [
      {
        accepted: true,
        content:
          "<p>Complementary filter is enough for many campus demos. Use Kalman/EKF when noise models matter or you fuse GPS/vision. Start simple, measure drift, then escalate.</p>",
      },
    ],
  },

  // CEA
  {
    branch: "CEA",
    title: "How to design a 4-bit ALU for digital electronics lab?",
    description:
      "<p>We must implement ADD/SUB/AND/OR with status flags. Any clean modular approach in Verilog?</p>",
    tags: ["CEA", "Digital Design", "Verilog"],
    votes: 19,
    answers: [
      {
        accepted: true,
        content:
          "<p>Separate arithmetic and logic units, multiplex the result, and compute flags (Z, C, V) from the arithmetic path. Keep a testbench with directed + random vectors.</p>",
      },
    ],
  },
  {
    branch: "CEA",
    title: "FPGA vs microcontroller for a CEA mini-project?",
    description:
      "<p>Should we target a Basys board or stick to STM32 for a real-time control demo?</p>",
    tags: ["CEA", "FPGA", "Embedded"],
    votes: 12,
    answers: [
      {
        accepted: true,
        content:
          "<p>Choose FPGA if parallelism/custom peripherals are the learning goal. Choose MCU if the story is control loops, sensors, and firmware. Align with the rubric.</p>",
      },
    ],
  },

  // CSE
  {
    branch: "CSE",
    title: "How should we normalize a campus event management database?",
    description:
      "<p>Entities: users, events, registrations, payments. What’s a clean 3NF design and where do we denormalize for dashboards?</p>",
    tags: ["CSE", "DBMS", "SQL"],
    votes: 27,
    answers: [
      {
        accepted: true,
        content:
          "<p>Keep transactional tables normalized (users, events, registrations, payments). Use views/materialized summaries for dashboards. Enforce uniqueness on (user_id, event_id).</p>",
      },
    ],
  },
  {
    branch: "CSE",
    title: "OS: explaining paging vs segmentation in viva?",
    description:
      "<p>I mix up internal/external fragmentation answers. What’s a crisp comparison with one example?</p>",
    tags: ["CSE", "Operating Systems"],
    votes: 21,
    answers: [
      {
        accepted: true,
        content:
          "<p>Paging: fixed-size frames → internal fragmentation. Segmentation: variable logical units → external fragmentation. Use a diagram of address translation for either.</p>",
      },
    ],
  },
  {
    branch: "CSE",
    title: "Best practice for REST API versioning in a semester project?",
    description:
      "<p>We keep breaking mobile clients. Should we use /v1 in the path or headers?</p>",
    tags: ["CSE", "Backend", "API Design"],
    votes: 15,
    answers: [
      {
        accepted: true,
        content:
          "<p>Path versioning (<code>/api/v1</code>) is simplest for campus projects. Don’t break existing fields; add new ones. Document deprecations.</p>",
      },
    ],
  },

  // CSIT
  {
    branch: "CSIT",
    title: "Next.js App Router auth: cookies vs localStorage for JWT?",
    description:
      "<p>Building MentorMesh-style auth. Where should the token live, and how do we protect API routes?</p>",
    tags: ["CSIT", "Next.js", "Authentication"],
    votes: 33,
    answers: [
      {
        accepted: true,
        content:
          "<p>Prefer httpOnly secure cookies so JS can’t steal the token. Verify JWT in API route handlers / middleware. Never store access tokens in localStorage for production.</p>",
      },
    ],
  },
  {
    branch: "CSIT",
    title: "How to structure Prisma models for Q&A voting?",
    description:
      "<p>Should votes be a join table with unique (userId, questionId) or counters only?</p>",
    tags: ["CSIT", "Prisma", "PostgreSQL"],
    votes: 20,
    answers: [
      {
        accepted: true,
        content:
          "<p>Use a Vote table with a unique constraint plus a denormalized counter for fast reads. Update both in a transaction.</p>",
      },
    ],
  },

  // CST
  {
    branch: "CST",
    title: "Cybersecurity: how to demo OWASP Top 10 safely in lab?",
    description:
      "<p>We want to show XSS/SQLi on a vulnerable app. What’s an ethical lab setup?</p>",
    tags: ["CST", "Security", "OWASP"],
    votes: 17,
    answers: [
      {
        accepted: true,
        content:
          "<p>Only attack your own intentionally vulnerable VM (e.g. DVWA/Juice Shop) on an isolated network. Document scope, never scan college production systems.</p>",
      },
    ],
  },
  {
    branch: "CST",
    title: "TLS certificates for a local HTTPS Node server?",
    description:
      "<p>Browsers block our PWA tests on HTTP. What’s the easiest local cert workflow?</p>",
    tags: ["CST", "Networking", "Web Security"],
    votes: 11,
    answers: [
      {
        accepted: true,
        content:
          "<p>Use mkcert to create a locally trusted CA and certs. Point your Node/Nginx config at those files. Avoid disabling browser security.</p>",
      },
    ],
  },

  // CE
  {
    branch: "CE",
    title: "Computer Engineering: cache mapping techniques explained simply?",
    description:
      "<p>Direct-mapped vs set-associative — how do I remember conflict misses for exams?</p>",
    tags: ["CE", "Computer Architecture"],
    votes: 25,
    answers: [
      {
        accepted: true,
        content:
          "<p>Direct-mapped: one place per block → more conflict misses. Set-associative: few choices per set → fewer conflicts, more hardware. Fully associative: anywhere, costliest.</p>",
      },
    ],
  },
  {
    branch: "CE",
    title: "Verilog testbench checklist for CE projects?",
    description:
      "<p>Our waveforms look okay but viva asks about coverage. What should a solid testbench include?</p>",
    tags: ["CE", "Verilog", "Digital Design"],
    votes: 13,
    answers: [
      {
        accepted: true,
        content:
          "<p>Clock/reset blocks, directed corner cases, randomized stimuli, self-checking assertions, and a summary of covered opcodes/states.</p>",
      },
    ],
  },

  // IT
  {
    branch: "IT",
    title: "Cloud: when to use S3 + CloudFront for a static campus site?",
    description:
      "<p>Our IT project hosts event pages. Is Amplify overkill vs S3 website hosting?</p>",
    tags: ["IT", "Cloud", "AWS"],
    votes: 14,
    answers: [
      {
        accepted: true,
        content:
          "<p>S3 + CloudFront is enough for static sites. Use Amplify if you want CI/CD and auth hooks with less glue. Compare cost and ops in the report.</p>",
      },
    ],
  },
  {
    branch: "IT",
    title: "Agile vs Waterfall for a 3-month IT delivery?",
    description:
      "<p>Faculty wants a process diagram. What’s realistic for student teams?</p>",
    tags: ["IT", "Software Engineering", "Career"],
    votes: 10,
    answers: [
      {
        accepted: true,
        content:
          "<p>Use a lightweight Agile: 1–2 week sprints, backlog, demos. Keep a short SRS. Pure Waterfall only if requirements are frozen and grading expects it.</p>",
      },
    ],
  },

  // CSD
  {
    branch: "CSD",
    title: "How to design a state machine for a UI onboarding flow?",
    description:
      "<p>CSD project has multi-step forms with back/next and validation. Any clean pattern?</p>",
    tags: ["CSD", "UI/UX", "Frontend"],
    votes: 12,
    answers: [
      {
        accepted: true,
        content:
          "<p>Model steps as an explicit state machine (idle → editing → validating → success/error). Persist draft state and disable next until validators pass.</p>",
      },
    ],
  },
  {
    branch: "CSD",
    title: "Accessibility checklist for student web projects?",
    description:
      "<p>What are the minimum a11y wins that impress evaluators?</p>",
    tags: ["CSD", "Accessibility", "Frontend"],
    votes: 9,
    answers: [
      {
        accepted: true,
        content:
          "<p>Keyboard focus order, labels on inputs, contrast, alt text, and visible focus rings. Run Lighthouse accessibility and fix the top issues.</p>",
      },
    ],
  },

  // AIDS
  {
    branch: "AIDS",
    title: "Feature engineering tips for an AIDS analytics dashboard?",
    description:
      "<p>We have messy CSV exports. How do we build trustworthy KPIs without overfitting narratives?</p>",
    tags: ["AIDS", "Data Analytics", "Visualization"],
    votes: 16,
    answers: [
      {
        accepted: true,
        content:
          "<p>Define KPI formulas first, clean nulls consistently, and separate exploratory charts from decision KPIs. Always show filters and sample size.</p>",
      },
    ],
  },
  {
    branch: "AIDS",
    title: "SQL window functions for ranking mentor contributions?",
    description:
      "<p>Need top contributors per branch using a single query. RANK or DENSE_RANK?</p>",
    tags: ["AIDS", "SQL", "Data Science"],
    votes: 13,
    answers: [
      {
        accepted: true,
        content:
          "<p>Use <code>DENSE_RANK()</code> if you don’t want gaps after ties. Partition by branch and order by reputation/answers desc.</p>",
      },
    ],
  },

  // Extra CEA / CE / CST / IT depth
  {
    branch: "CEA",
    title: "When should CEA projects use MQTT vs HTTP for IoT telemetry?",
    description:
      "<p>We’re logging sensor data every few seconds. Faculty wants a clear protocol choice with battery and reliability trade-offs.</p>",
    tags: ["CEA", "IoT", "Networking"],
    votes: 15,
    answers: [
      {
        accepted: true,
        content:
          "<p>Prefer MQTT for frequent small payloads and intermittent links; use QoS carefully. HTTP/REST is fine for infrequent uploads or cloud APIs. Document reconnect and offline buffering either way.</p>",
      },
      {
        content:
          "<p>If you already have a REST backend, MQTT + a bridge to your API keeps the UI simple while devices stay lightweight.</p>",
      },
    ],
  },
  {
    branch: "CE",
    title: "How do I explain Big-O clearly in a CE viva for sorting labs?",
    description:
      "<p>I can code mergesort but freeze when asked why n log n beats bubble sort on large n.</p>",
    tags: ["CE", "Algorithms", "DSA"],
    votes: 14,
    answers: [
      {
        accepted: true,
        content:
          "<p>Say: comparisons/swaps grow with input size. Bubble is ~n²; merge divides and conquers so depth is log n and work per level is n → n log n. Show a tiny table of n=10 vs n=10k to make it concrete.</p>",
      },
    ],
  },
  {
    branch: "CST",
    title: "Threat modeling checklist for a campus web app demo?",
    description:
      "<p>CST security elective wants STRIDE-lite on our login + file upload feature.</p>",
    tags: ["CST", "Security", "Web"],
    votes: 17,
    answers: [
      {
        accepted: true,
        content:
          "<p>List assets (credentials, uploads), actors, and abuse cases. Cover spoofing (auth), tampering (uploads), info disclosure (IDs in URLs), DoS (size limits). Map each to a control you implemented.</p>",
      },
    ],
  },
  {
    branch: "RAI",
    title: "ROS2 vs plain Arduino for a semester robotics project?",
    description:
      "<p>Team is split: some want ROS2 on a Pi, others want a single Arduino sketch. How do we decide?</p>",
    tags: ["RAI", "ROS", "Robotics"],
    votes: 19,
    answers: [
      {
        accepted: true,
        content:
          "<p>Arduino-only if sensing + actuation stays simple and demos are time-boxed. Choose ROS2 when you need multiple nodes, simulation, or camera pipelines. Hybrid is fine: Arduino for motors, Pi/ROS2 for vision.</p>",
      },
    ],
  },
  {
    branch: "AIML",
    title: "How should we version datasets and experiments for the AIML lab report?",
    description:
      "<p>Everyone has different CSVs and notebook outputs. Mentors keep asking which run produced which F1 score.</p>",
    tags: ["AIML", "MLOps", "Data Science"],
    votes: 21,
    answers: [
      {
        accepted: true,
        content:
          "<p>Freeze a dataset version (hash or dated folder), log params + metrics in a simple table (or MLflow), and commit notebooks that only load that version. Screenshot the run table in the report.</p>",
      },
    ],
  },

  // Shared campus threads
  {
    branch: "CSE",
    title: "How do I write a strong project abstract for submission?",
    description:
      "<p>Word limit is 250. What structure works across branches?</p>",
    tags: ["Career", "Soft Skills"],
    votes: 28,
    answers: [
      {
        accepted: true,
        content:
          "<p>Problem → approach → tech stack → result/metrics → impact. Avoid buzzwords without evidence.</p>",
      },
    ],
  },
  {
    branch: "CSIT",
    title: "Git branching strategy for 4-person campus teams?",
    description:
      "<p>We keep breaking main. What’s a simple workflow?</p>",
    tags: ["Git", "Collaboration", "Career"],
    votes: 22,
    answers: [
      {
        accepted: true,
        content:
          "<p>main (protected) + feature branches + PR reviews. Tag releases before demos. Never force-push shared branches.</p>",
      },
    ],
  },
]
