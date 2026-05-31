/**
 * Seed script for PlaceMIT — MIT Manipal placement community platform.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed
 *
 * Idempotent: truncates all tables and reseeds from scratch.
 * Safe to run repeatedly in development.
 */

import { db, pool } from "@workspace/db";
import {
  companiesTable,
  studentsTable,
  jobsTable,
  postsTable,
  experiencesTable,
  documentsTable,
  applicationsTable,
  commentsTable,
} from "@workspace/db";

// ── 1. Companies ─────────────────────────────────────────────────────────────

const companies = [
  { name: "Google", sector: "Technology", placementsCount: 0, avgPackage: "45 LPA", website: "https://careers.google.com", description: "Search, Cloud, Android, YouTube — one of the most sought-after employers for MIT Manipal students." },
  { name: "Microsoft", sector: "Technology", placementsCount: 0, avgPackage: "42 LPA", website: "https://careers.microsoft.com", description: "Azure, Office, Xbox, and GitHub. Strong internship-to-full-time pipeline." },
  { name: "Goldman Sachs", sector: "Finance", placementsCount: 0, avgPackage: "30 LPA", website: "https://goldmansachs.com/careers", description: "Engineering-heavy finance firm known for its Bengaluru tech hub." },
  { name: "Amazon", sector: "E-Commerce / Cloud", placementsCount: 0, avgPackage: "38 LPA", website: "https://amazon.jobs", description: "AWS, Alexa, Retail Tech — aggressive campus hiring across SDE and PM roles." },
  { name: "McKinsey & Company", sector: "Consulting", placementsCount: 0, avgPackage: "25 LPA", website: "https://mckinsey.com/careers", description: "Top management consulting firm; typically hires from 4th year and MBA." },
  { name: "Texas Instruments", sector: "Semiconductors", placementsCount: 0, avgPackage: "20 LPA", website: "https://ti.com/careers", description: "Analog & embedded systems leader. Core recruiter for ECE / EEE branches." },
  { name: "DE Shaw", sector: "Finance / Tech", placementsCount: 0, avgPackage: "40 LPA", website: "https://deshaw.com/careers", description: "Highly selective quant / systems engineering roles. One of the highest packages on campus." },
  { name: "Flipkart", sector: "E-Commerce", placementsCount: 0, avgPackage: "28 LPA", website: "https://flipkartcareers.com", description: "India's leading e-commerce company with a strong Bengaluru engineering hub." },
  { name: "Qualcomm", sector: "Semiconductors", placementsCount: 0, avgPackage: "22 LPA", website: "https://qualcomm.com/careers", description: "5G, Snapdragon, IoT. Strong recruiter for VLSI / ECE profiles." },
  { name: "Adobe", sector: "Technology", placementsCount: 0, avgPackage: "35 LPA", website: "https://adobe.com/careers", description: "Creative Cloud and Document Cloud. Known for good work-life balance and competitive packages." },
];

// ── 2. Students ───────────────────────────────────────────────────────────────

const students = [
  { name: "Arjun Sharma", rollNo: "220905001", branch: "CSE", year: 4, cgpa: 9.2, placedAt: "Google", packageOffered: "45 LPA", bio: "Full-stack and distributed systems enthusiast. Placed at Google L4.", skills: "Go, TypeScript, Kubernetes, GCP", linkedinUrl: "https://linkedin.com/in/arjunsharma", githubUrl: "https://github.com/arjunsharma" },
  { name: "Priya Patel", rollNo: "220905002", branch: "CSE", year: 4, cgpa: 9.5, placedAt: "Microsoft", packageOffered: "42 LPA", bio: "AI/ML researcher, published at NeurIPS workshop. Placed at Microsoft Hyderabad.", skills: "Python, PyTorch, Azure, C++", linkedinUrl: "https://linkedin.com/in/priyapatel", githubUrl: "https://github.com/priyapatel" },
  { name: "Rohit Verma", rollNo: "220904003", branch: "ECE", year: 4, cgpa: 8.8, placedAt: "Texas Instruments", packageOffered: "20 LPA", bio: "VLSI design and embedded systems. Core ECE profile at TI Bangalore.", skills: "VLSI, Verilog, SystemVerilog, C", linkedinUrl: "https://linkedin.com/in/rohitverma" },
  { name: "Sneha Kumar", rollNo: "220905004", branch: "CSE", year: 3, cgpa: 9.1, bio: "Competitive programmer — Codeforces Expert. Interning at Goldman Sachs.", skills: "C++, Algorithms, Python, SQL", linkedinUrl: "https://linkedin.com/in/snehakumar", githubUrl: "https://github.com/snehakumar" },
  { name: "Aditya Singh", rollNo: "220906005", branch: "MECH", year: 4, cgpa: 8.5, placedAt: "McKinsey & Company", packageOffered: "25 LPA", bio: "Mechanical turned consultant. Won MIT Manipal case competition 2024.", skills: "Data Analysis, Excel, PowerPoint, Python" },
  { name: "Kavya Reddy", rollNo: "220905006", branch: "CSE", year: 4, cgpa: 9.7, placedAt: "Google", packageOffered: "45 LPA", bio: "Highest CGPA in batch. ML + distributed systems. Google offer via intern conversion.", skills: "Python, TensorFlow, Java, Spanner", linkedinUrl: "https://linkedin.com/in/kavyareddy", githubUrl: "https://github.com/kavyareddy" },
  { name: "Vikram Nair", rollNo: "220905007", branch: "CSE", year: 3, cgpa: 8.9, bio: "Open-source contributor. Interning at DE Shaw. Into quant and systems programming.", skills: "Rust, C++, Linux, Algorithms", linkedinUrl: "https://linkedin.com/in/vikramnair", githubUrl: "https://github.com/vikramnair" },
  { name: "Divya Menon", rollNo: "220905008", branch: "CSE", year: 4, cgpa: 9.3, placedAt: "Flipkart", packageOffered: "28 LPA", bio: "Product-minded engineer. SDE at Flipkart Bangalore. Former Google Summer of Code.", skills: "Java, Spring Boot, Kafka, React", linkedinUrl: "https://linkedin.com/in/divyamenon" },
  { name: "Karan Joshi", rollNo: "220903009", branch: "EEE", year: 4, cgpa: 8.6, placedAt: "Qualcomm", packageOffered: "22 LPA", bio: "Signal processing and embedded firmware. Placed at Qualcomm Hyderabad.", skills: "C, MATLAB, ARM Cortex, RF Design" },
  { name: "Ananya Bose", rollNo: "220905010", branch: "CSE", year: 3, cgpa: 9.0, bio: "Frontend + design systems. Building open-source component library. Summer intern at Adobe.", skills: "TypeScript, React, Figma, CSS", linkedinUrl: "https://linkedin.com/in/ananyabose", githubUrl: "https://github.com/ananyabose" },
];

// ── 3. Jobs ───────────────────────────────────────────────────────────────────
// companyId references will be resolved after inserting companies

const jobTemplates = [
  { companyName: "Google", title: "Software Engineer — L4", type: "full-time" as const, location: "Bangalore / Hyderabad", stipend: "40–50 LPA", description: "Work on Search, Cloud, or Android infra at scale. Requires strong DSA and systems design.", requirements: "B.Tech/M.Tech CS or related. Strong CS fundamentals.", deadline: "2025-08-31" },
  { companyName: "Microsoft", title: "SDE Intern — Summer 2025", type: "internship" as const, location: "Hyderabad", stipend: "₹1.5 LPA/month", description: "12-week internship across Azure, Office, or Xbox. Full-time offer on good performance.", requirements: "Pre-final year. C#, Java, or Python. OOP and data structures.", deadline: "2025-03-15" },
  { companyName: "Goldman Sachs", title: "Analyst — Technology Division", type: "full-time" as const, location: "Bangalore", stipend: "28–32 LPA", description: "Join the engineering team powering global trading infrastructure.", requirements: "Strong problem solving. Java or Python preferred.", deadline: "2025-07-31" },
  { companyName: "Amazon", title: "SDE-I — Amazon India", type: "full-time" as const, location: "Bangalore / Chennai", stipend: "35–40 LPA", description: "Build AWS or consumer services used by millions. Bar-raiser process.", requirements: "B.Tech CS/IT/ECE. Leetcode-style DSA. OOP.", deadline: "2025-09-15" },
  { companyName: "McKinsey & Company", title: "Business Analyst Intern", type: "internship" as const, location: "Mumbai / Delhi", stipend: "₹80k/month", description: "10-week consulting internship. Case-based selection. Conversion to full-time BA role.", requirements: "Any branch. Case interview prep essential.", deadline: "2025-02-28" },
  { companyName: "Texas Instruments", title: "Design Engineer — VLSI", type: "full-time" as const, location: "Bangalore", stipend: "18–22 LPA", description: "Analog IC and mixed-signal design. Core ECE role with relocation support.", requirements: "ECE / EEE branch. Verilog, CMOS, analog fundamentals.", deadline: "2025-10-01" },
  { companyName: "DE Shaw", title: "Quantitative Developer", type: "full-time" as const, location: "Hyderabad", stipend: "38–45 LPA", description: "Build low-latency trading systems and quant research tools. Highly competitive selection.", requirements: "Exceptional algorithmic problem solving. C++ or Java. Math-heavy.", deadline: "2025-08-15" },
  { companyName: "Flipkart", title: "Product Intern — Growth", type: "internship" as const, location: "Bangalore", stipend: "₹70k/month", description: "Own a feature end-to-end. Work alongside senior PMs on live experiments.", requirements: "Any branch. Strong product sense. Prior coding or analytics background.", deadline: "2025-04-30" },
  { companyName: "Qualcomm", title: "Firmware Engineer — 5G Modem", type: "full-time" as const, location: "Hyderabad", stipend: "20–24 LPA", description: "Develop and validate firmware for Snapdragon 5G modems.", requirements: "ECE / EEE. C, RTOS, ARM. Embedded protocols.", deadline: "2025-09-30" },
  { companyName: "Adobe", title: "Computer Science Intern", type: "internship" as const, location: "Bangalore / Noida", stipend: "₹1.2 LPA/month", description: "Work on Creative Cloud or Document Cloud backend. Potential PPO.", requirements: "Pre-final year CS/IT. Strong DSA and OOP. REST APIs.", deadline: "2025-03-31" },
];

// ── 4. Posts ──────────────────────────────────────────────────────────────────

const posts = [
  { authorName: "Arjun Sharma", title: "How I cracked Google SWE L4 in my first attempt", content: "After 6 months of prep, I got my Google L4 offer. Here is the exact plan I followed:\n\n1. **Neetcode 150** — solved every problem at least twice. Focus on patterns, not memorization.\n2. **System Design** — Grokking the System Design Interview + YouTube videos by Gaurav Sen.\n3. **Behavioral round** — prepared STAR stories for every leadership principle.\n\nThe most important thing: mock interviews with peers. I did 30+ mocks in the final month. Happy to answer questions!", category: "interview-prep" as const, upvotes: 142, commentsCount: 18 },
  { authorName: "Rohit Verma", title: "Goldman Sachs rejected me 3 times. Here's what changed on attempt 4.", content: "Three rejections from GS in three years. Finally cracked it this year.\n\nWhat was different:\n- I stopped treating coding rounds as just 'pass the filter'. GS tests your thought process heavily.\n- For the SDE interview, they asked me about trade-offs in distributed systems — something I only learned by reading engineering blogs.\n- The HR round matters more than you think. Show genuine curiosity about their business.\n\nDon't give up. Three rejections taught me more than any tutorial.", category: "interview-prep" as const, upvotes: 89, commentsCount: 11 },
  { authorName: "Priya Patel", title: "Resume tips that got me 8 shortlists from 10 applications", content: "My resume went from 2 shortlists to 8 after a single rewrite. Here's what I changed:\n\n**Before:** Generic project descriptions. 'Built a web app using React and Node.js.'\n**After:** Impact-first. 'Reduced page load time by 40% by migrating to SSR, resulting in 15% higher user retention.'\n\nKey rules:\n1. Every bullet must have a metric or outcome.\n2. Tailor skills section to the JD — don't just list every language you touched in college.\n3. Keep it one page. One. Page.\n4. PDF format, standard fonts — no columns, no fancy templates that break ATS.", category: "resume-help" as const, upvotes: 201, commentsCount: 24 },
  { authorName: "Aditya Singh", title: "McKinsey vs Goldman vs Google — my honest comparison after interviewing at all three", content: "I got offers from all three (ultimately took McKinsey). Here's the reality from the inside:\n\n**Google:** Most rigorous technical bar. 5-round process. Takes ~6 weeks. Incredible scope but can feel like a small cog in a big machine.\n\n**Goldman Sachs:** Surprisingly technical for a finance firm. Great if you want to be at the intersection of finance and engineering. Fast feedback.\n\n**McKinsey:** Non-technical but mentally exhausting. Case prep takes 3 months of dedicated practice. The learning in year 1 is unmatched.\n\nChoose based on what you want to learn, not the brand name.", category: "advice" as const, upvotes: 315, commentsCount: 37 },
  { authorName: "Kavya Reddy", title: "Amazon OA tips — things nobody tells you", content: "Just got back from my Amazon intern → full-time conversion. Here's what the OA guide doesn't tell you:\n\n1. The OA has a 'work simulation' section that most people ignore while prepping. It matters.\n2. Don't brute-force. Amazon's OA auto-scores time complexity — O(n²) solutions often score 0 even if output is correct.\n3. Read the debugging section carefully — it's where most people lose marks.\n4. The behavioral survey is analyzed. Consistent answers matter — don't contradict yourself.\n\nHappy to mock OAs with anyone!", category: "interview-prep" as const, upvotes: 178, commentsCount: 22 },
  { authorName: "Vikram Nair", title: "DE Shaw hiring process decoded — from OT to final offer", content: "DE Shaw has one of the most unique hiring processes on campus. Here's the full breakdown:\n\n**Round 1 — Online Test (OT):** 3 sections — coding (hard DSA, 2 hours), maths (combinatorics, probability), and general aptitude. Cut-off is brutal — ~top 10% proceed.\n\n**Round 2 — Technical Interview 1:** Deep dive into your best project. They will read your code if you share it.\n\n**Round 3 — Technical Interview 2:** Systems + algorithms. Expect tricky optimization problems.\n\n**Round 4 — HR:** Culture fit. Very conversational. They want people who are intellectually curious.\n\nTime from OT to offer: ~2 weeks.", category: "interview-prep" as const, upvotes: 95, commentsCount: 9 },
  { authorName: "Divya Menon", title: "GSoC guide for MIT Manipal students — timeline and proposal tips", content: "Three of my batchmates got Google Summer of Code this year (including me). Here's how:\n\n**Start in October** — pick 2–3 orgs you genuinely want to contribute to.\n**November–January** — make meaningful contributions. Fix real bugs, not typos.\n**February** — start drafting your proposal. Get it reviewed by the org mentors.\n**March** — final proposal submission.\n\nKey insight: org mentors pre-select students they've seen contribute. Cold proposals rarely work. Community involvement is everything.", category: "general" as const, upvotes: 134, commentsCount: 16 },
  { authorName: "Sneha Kumar", title: "How to go from CGPA 7.5 to competitive coding in one year", content: "I had a 7.5 CGPA in 2nd year and zero competitive programming experience. In one year I reached Codeforces Expert (1600+) and got shortlisted by Goldman Sachs.\n\nMy plan:\n- Month 1–2: Codeforces Div. 3 and 4. Learn STL deeply.\n- Month 3–4: Div. 2 A/B/C. Study number theory, binary search, two pointers.\n- Month 5–8: Div. 2 C/D. Graphs (BFS/DFS/Dijkstra), DP patterns.\n- Month 9–12: Virtual contests only. No upsolving during contest. Treat it like a real exam.\n\nConsistency beats intensity. 2 hours every day > 10 hours on weekends.", category: "advice" as const, upvotes: 167, commentsCount: 20 },
];

// ── 5. Experiences ────────────────────────────────────────────────────────────
// companyId will be resolved after inserting companies

const experienceTemplates = [
  { studentName: "Arjun Sharma", companyName: "Google", role: "Software Engineer L4", outcome: "selected" as const, rounds: 5, packageOffered: "45 LPA", description: "5 rounds: 2 coding (LeetCode hard), 1 system design (design YouTube), 1 Googleyness, 1 hiring committee review.\n\nCoding: Both rounds had 2 problems each. One was a sliding window variant, the other was graph BFS. Be ready to optimize from O(n²) to O(n log n) on the spot.\n\nSystem design: Interviewer pushed back on every decision. Justify your trade-offs clearly.", tips: "Start system design from requirements, not from the solution. Practice with a real interviewer who will push back." },
  { studentName: "Priya Patel", companyName: "Microsoft", role: "SDE-II", outcome: "selected" as const, rounds: 4, packageOffered: "42 LPA", description: "4 rounds all on Teams. Round 1: OA (2 coding problems, medium difficulty). Rounds 2–3: Technical (DSA + OOP design). Round 4: Hiring Manager round with system design.\n\nMS focuses heavily on OOP and clean code. They will ask you to refactor your solution during the interview.", tips: "Microsoft cares about readable, maintainable code. Don't just solve the problem — think about how you'd test and extend it." },
  { studentName: "Rohit Verma", companyName: "Goldman Sachs", role: "Technology Analyst", outcome: "selected" as const, rounds: 3, packageOffered: "30 LPA", description: "Round 1: HackerRank OA — 2 coding + 1 debugging section. Round 2: Technical interview — DSA (graphs, DP) + CS concepts (OS, networking). Round 3: Superday — 2 technical + 1 HR back-to-back.\n\nGS asks why you want to work at a bank specifically. Have a genuine answer.", tips: "Know your resume cold. GS interviewers will go deep into any project you mention." },
  { studentName: "Sneha Kumar", companyName: "DE Shaw", role: "Quantitative Developer", outcome: "rejected" as const, rounds: 2, description: "Cleared OT (coding + maths). Technical Interview 1 went well — they liked my competitive programming background. Rejected in Technical Interview 2 which was pure systems — I had never written multi-threaded code.\n\nLearning: If you're targeting DE Shaw, study concurrency and lock-free data structures.", tips: "OT is the real filter. Spend 80% of prep time on the OT. If you clear it, the interviews are very conversation-based." },
  { studentName: "Kavya Reddy", companyName: "Amazon", role: "SDE-I", outcome: "selected" as const, rounds: 4, packageOffered: "38 LPA", description: "Amazon process: OA → Phone screen → Virtual Onsite (3 rounds)\n\nEach round has a behavioral component using Leadership Principles. You must have a STAR story ready for every LP — especially Customer Obsession, Ownership, and Dive Deep.\n\nCoding: Mostly medium LeetCode. The bar raiser round was the hardest — graph + DP combo.", tips: "Prepare LP stories before you prep algorithms. You will be rejected for weak behavioral answers even if you ace the coding." },
  { studentName: "Aditya Singh", companyName: "McKinsey & Company", role: "Business Analyst", outcome: "selected" as const, rounds: 3, packageOffered: "25 LPA", description: "Round 1: Screening case (30 min). Round 2: Full case + fit (60 min). Round 3: Final partner-level case.\n\nMcK cases test structured problem solving, not domain knowledge. Framework is: issue tree → hypothesis → data interpretation → recommendation.\n\nFit questions are scored separately. Your stories must demonstrate leadership, impact, and self-awareness.", tips: "Case partner practice > solo case prep. Do 50+ cases with real partners. Record yourself and review." },
  { studentName: "Divya Menon", companyName: "Flipkart", role: "SDE Intern (PPO)", outcome: "selected" as const, rounds: 3, packageOffered: "28 LPA", description: "Flipkart internship process: Machine coding round (3 hours, build a real feature) → Technical interview → Manager chat.\n\nMachine coding is the main filter. They gave me 3 hours to build a simplified order management system with extensibility requirements. Clean, tested code wins over feature-completeness.", tips: "Practice machine coding with real projects, not just LeetCode. Flipkart values design and extensibility heavily." },
  { studentName: "Vikram Nair", companyName: "DE Shaw", role: "Quantitative Developer Intern", outcome: "selected" as const, rounds: 4, packageOffered: "40 LPA", description: "The DE Shaw OT is a true filter: top 10% only. After that, 4 interview rounds over 2 days.\n\nRound 1: Resume deep-dive and project discussion (1.5 hours). They read my competitive programming solutions.\nRound 2: Algorithms and probability (harder than OT).\nRound 3: Systems + concurrency.\nRound 4: Culture and research interests.", tips: "They hire people who are genuinely curious about markets and computer science. Read about market microstructure before the interview." },
];

// ── 6. Documents ──────────────────────────────────────────────────────────────
// studentId resolved after inserting students

const documentTemplates = [
  { studentName: "Arjun Sharma", name: "Arjun_Sharma_Resume_2025.pdf", type: "resume", url: "https://drive.google.com/file/arjun-resume-2025", sizeKb: 245 },
  { studentName: "Arjun Sharma", name: "Google_Offer_Letter_Arjun.pdf", type: "offer-letter", url: "https://drive.google.com/file/google-offer-arjun", sizeKb: 189 },
  { studentName: "Priya Patel", name: "Priya_Patel_Resume_v3.pdf", type: "resume", url: "https://drive.google.com/file/priya-resume-v3", sizeKb: 312 },
  { studentName: "Priya Patel", name: "Microsoft_Offer_Letter_Priya.pdf", type: "offer-letter", url: "https://drive.google.com/file/microsoft-offer-priya", sizeKb: 201 },
  { studentName: "Rohit Verma", name: "Rohit_Verma_Resume.pdf", type: "resume", url: "https://drive.google.com/file/rohit-resume", sizeKb: 198 },
  { studentName: "Sneha Kumar", name: "Sneha_Kumar_Resume_2025.pdf", type: "resume", url: "https://drive.google.com/file/sneha-resume-2025", sizeKb: 267 },
  { studentName: "Kavya Reddy", name: "Kavya_Reddy_Resume_ML.pdf", type: "resume", url: "https://drive.google.com/file/kavya-resume-ml", sizeKb: 289 },
  { studentName: "Kavya Reddy", name: "Amazon_Offer_Kavya.pdf", type: "offer-letter", url: "https://drive.google.com/file/amazon-offer-kavya", sizeKb: 175 },
  { studentName: "Divya Menon", name: "Divya_Menon_Resume_SDE.pdf", type: "resume", url: "https://drive.google.com/file/divya-resume-sde", sizeKb: 230 },
  { studentName: "Vikram Nair", name: "Vikram_Nair_Resume_CP.pdf", type: "resume", url: "https://drive.google.com/file/vikram-resume-cp", sizeKb: 210 },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding PlaceMIT database…\n");

  // Truncate all tables in dependency order (most dependent first)
  console.log("Truncating tables…");
  await pool.query("TRUNCATE TABLE applications, documents, experiences, comments, posts, jobs, students, companies RESTART IDENTITY CASCADE");
  console.log("✓ Tables cleared\n");

  // 1. Companies
  console.log("Inserting companies…");
  const insertedCompanies = await db.insert(companiesTable).values(companies).returning();
  console.log(`✓ ${insertedCompanies.length} companies\n`);

  const companyMap = new Map(insertedCompanies.map(c => [c.name, c.id]));

  // 2. Students
  console.log("Inserting students…");
  const insertedStudents = await db.insert(studentsTable).values(students).returning();
  console.log(`✓ ${insertedStudents.length} students\n`);

  const studentMap = new Map(insertedStudents.map(s => [s.name, s.id]));

  // 3. Jobs
  console.log("Inserting jobs…");
  const jobs = jobTemplates.map(({ companyName, ...rest }) => ({
    ...rest,
    companyId: companyMap.get(companyName)!,
    companyName,
  }));
  const insertedJobs = await db.insert(jobsTable).values(jobs).returning();
  console.log(`✓ ${insertedJobs.length} jobs\n`);

  const jobMap = new Map(insertedJobs.map(j => [j.title, j.id]));

  // 4. Posts
  console.log("Inserting posts…");
  const insertedPosts = await db.insert(postsTable).values(posts).returning();
  console.log(`✓ ${insertedPosts.length} posts\n`);

  // 5. Experiences
  console.log("Inserting experiences…");
  const experiences = experienceTemplates.map(({ companyName, ...rest }) => ({
    ...rest,
    companyId: companyMap.get(companyName) ?? null,
    companyName,
  }));
  const insertedExperiences = await db.insert(experiencesTable).values(experiences).returning();
  console.log(`✓ ${insertedExperiences.length} experiences\n`);

  // 6. Documents
  console.log("Inserting documents…");
  const documents = documentTemplates.map(({ studentName, ...rest }) => ({
    ...rest,
    studentId: studentMap.get(studentName)!,
    studentName,
  }));
  const insertedDocuments = await db.insert(documentsTable).values(documents).returning();
  console.log(`✓ ${insertedDocuments.length} documents\n`);

  // 7. Applications
  console.log("Inserting applications…");
  const snehaId = studentMap.get("Sneha Kumar")!;
  const vikramId = studentMap.get("Vikram Nair")!;
  const ananyaId = studentMap.get("Ananya Bose")!;
  const karanId = studentMap.get("Karan Joshi")!;

  const googleJobId = jobMap.get("Software Engineer — L4")!;
  const deShawJobId = jobMap.get("Quantitative Developer")!;
  const msInternId = jobMap.get("SDE Intern — Summer 2025")!;
  const adobeInternId = jobMap.get("Computer Science Intern")!;
  const qualmJobId = jobMap.get("Firmware Engineer — 5G Modem")!;

  const applications = [
    { studentId: snehaId, studentName: "Sneha Kumar", jobId: googleJobId, jobTitle: "Software Engineer — L4", companyName: "Google", status: "shortlisted" },
    { studentId: snehaId, studentName: "Sneha Kumar", jobId: deShawJobId, jobTitle: "Quantitative Developer", companyName: "DE Shaw", status: "applied" },
    { studentId: vikramId, studentName: "Vikram Nair", jobId: deShawJobId, jobTitle: "Quantitative Developer", companyName: "DE Shaw", status: "selected" },
    { studentId: vikramId, studentName: "Vikram Nair", jobId: googleJobId, jobTitle: "Software Engineer — L4", companyName: "Google", status: "applied" },
    { studentId: ananyaId, studentName: "Ananya Bose", jobId: adobeInternId, jobTitle: "Computer Science Intern", companyName: "Adobe", status: "shortlisted" },
    { studentId: ananyaId, studentName: "Ananya Bose", jobId: msInternId, jobTitle: "SDE Intern — Summer 2025", companyName: "Microsoft", status: "rejected" },
    { studentId: karanId, studentName: "Karan Joshi", jobId: qualmJobId, jobTitle: "Firmware Engineer — 5G Modem", companyName: "Qualcomm", status: "selected" },
    { studentId: karanId, studentName: "Karan Joshi", jobId: googleJobId, jobTitle: "Software Engineer — L4", companyName: "Google", status: "applied" },
  ];

  const insertedApplications = await db.insert(applicationsTable).values(applications).returning();
  console.log(`✓ ${insertedApplications.length} applications\n`);

  console.log("✅ Seed complete!\n");
  console.log(`Summary:`);
  console.log(`  Companies:    ${insertedCompanies.length}`);
  console.log(`  Students:     ${insertedStudents.length}`);
  console.log(`  Jobs:         ${insertedJobs.length}`);
  console.log(`  Posts:        ${insertedPosts.length}`);
  console.log(`  Experiences:  ${insertedExperiences.length}`);
  console.log(`  Documents:    ${insertedDocuments.length}`);
  console.log(`  Applications: ${insertedApplications.length}`);

  await pool.end();
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
