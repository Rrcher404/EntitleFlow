# Product Brief: TestProof

> *Working name — "TestProof" conveys verified quality. Alternatives: QAForge, ProofStack, TestGuild, CertQA.*

---

## 1. Executive Summary

TestProof is a **tiered QA marketplace** where startups post testing tasks and certified testers — ranked by skill level, experience, and platform certification scores — pick them up and get paid per task, per bug, or per session depending on the work. The certification system is the moat: startups trust the results because testers are credentialed through TestProof's own training and exam pipeline, and testers build portable reputations that translate into higher pay rates.

---

## 2. Problem Statement

**Who has this problem?** Early-stage startups (seed to Series A) and solo founders building software products. They need QA but can't afford a full-time QA engineer ($75K-$110K/year) and don't have the volume to justify an enterprise crowdtesting contract ($50K+/year with Testlio or Applause).

**How widespread?** There are roughly 70,000+ active startups in the US alone at any time. Assumption: at least 30% ship code weekly without structured QA beyond "I clicked around and it seemed fine." That's 20,000+ potential customers.

**Current workaround:**
- Founders test their own code (slow, biased, misses edge cases)
- Ask friends/family to "try it out" (unstructured, no bug reports)
- Post on Upwork/Fiverr (inconsistent quality, no testing methodology, no certification)
- Hire a part-time contractor (expensive for the hours needed, hard to find reliable testers)

**Cost of the problem:**
- Bugs in production → lost users, bad reviews, churn
- Founder time spent testing → 5-15 hours/week that should go to building or selling
- No structured QA → regulatory risk for fintech, healthtech, edtech startups
- Average cost of a production bug found by users vs. caught in QA: 5-10x more expensive to fix

**Why now:**
- AI tools (Cursor, Claude Code, Copilot) are accelerating code production, but QA hasn't kept pace — more code ships faster with less testing
- The crowdsourced testing market hit $3.6B in 2026 but is dominated by enterprise players; the SMB/startup tier is underserved
- Remote work has created a global pool of people who want flexible, skill-based gig work
- Bootcamp graduates (500K+ annually in the US) need real-world experience but struggle to land first roles

---

## 3. Target Users

### Supply Side: Testers

**Persona: "The Credential Builder"**
- Demographics: 22-35 years old, bootcamp graduate or career switcher, based anywhere (remote-first), earning $0-$45K currently
- Behaviors: Active on LinkedIn, uses Udemy/Coursera, familiar with dev tools but not employed full-time in tech. May have ISTQB Foundation or no formal QA cert.
- Pain points: Can't get QA job without experience, can't get experience without a job. Freelance platforms (Upwork, Fiverr) are a race to the bottom on price.
- Goals: Build a verifiable portfolio of real testing work, earn income on their own schedule, level up skills
- Motivations: Earning potential tied directly to skill improvement; visible certification tier that employers recognize

**Persona: "The Experienced Moonlighter"**
- Demographics: 28-45, employed as QA engineer or SDET, earning $70K-$120K, wants side income
- Behaviors: Has ISTQB Advanced or tool-specific certs, comfortable with API testing, automation frameworks
- Pain points: Side gig options are either too informal (Fiverr) or too enterprise (Testlio). Wants structured, well-scoped tasks.
- Goals: Earn $500-$2,000/month on the side, stay sharp across different tech stacks
- Motivations: Higher-tier certification = premium task access and pay rates

### Demand Side: Startups

**Persona: "The Shipping Founder"**
- Demographics: 25-45, technical or semi-technical founder, seed to Series A, team of 1-10, US-based
- Behaviors: Uses modern dev tools (Vercel, Supabase, Stripe), ships weekly, relies on CI/CD but has minimal or no QA process
- Pain points: Bugs reach production, no time to write test plans, doesn't know what to test beyond happy paths, can't justify a full-time QA hire
- Goals: Ship with confidence, reduce production bugs by 50%+, spend <$500/month on QA
- Motivations: Fast turnaround (results same day), predictable pricing, testers who understand startup context

---

## 4. Proposed Solution

### Core Concept

TestProof is a two-sided marketplace where startups post testing tasks (manual QA, API testing, or automated test writing) and certified testers claim and complete them. Testers are organized into tiers based on certification exam scores, completed tasks, and client ratings. Startups choose which tier of tester they need based on task complexity. Payment is flexible: per-task, per-bug-found (bounty), or per-session (hourly) — set by the startup with platform-recommended rates.

### Key Features (MVP)

**1. Certification & Tiering System**
- What: Multi-level certification exam (Bronze → Silver → Gold → Platinum) covering manual QA fundamentals, API testing, and automation. Exams are practical — testers must find bugs in a sandboxed app, not just answer multiple choice.
- Why it matters: This is the trust layer. Startups know a Gold tester has passed a rigorous practical exam. Testers know their tier directly affects their earning potential.
- Success indicator: >80% of startups report higher confidence in test results from certified testers vs. uncertified freelancers

**2. Task Board & Matching**
- What: Startups post testing tasks with scope, platform, required tier, payment model, and deadline. Testers see tasks filtered to their tier and skills. Smart matching recommends testers based on past performance in similar tech stacks.
- Why it matters: Reduces time-to-match from days (Upwork) to minutes. Ensures skill/task fit.
- Success indicator: Average time from task posted to tester claimed < 2 hours

**3. Structured Test Execution & Evidence**
- What: Testers execute tasks within the platform using a structured bug report template (steps to reproduce, expected vs. actual, severity, screenshots/video). Platform provides screen recording and annotation tools.
- Why it matters: Standardized reports mean startups get actionable bug reports, not vague "it doesn't work" messages
- Success indicator: >90% of bug reports are actionable (startup can reproduce from the report alone)

**4. Tiered Payment Engine**
- What: Three payment models available per task:
  - **Per-task**: Fixed price for completing a test plan (e.g., "Test the checkout flow end-to-end: $25")
  - **Per-bug bounty**: Pay per verified bug found (e.g., $5/minor, $15/major, $50/critical)
  - **Per-session**: Hourly rate for exploratory testing (e.g., 2 hours at $30/hr)
  - Pay rates are tier-adjusted: Bronze testers earn base rate, Silver 1.3x, Gold 1.6x, Platinum 2x
- Why it matters: Flexibility lets startups optimize for budget vs. thoroughness. Tier multipliers incentivize testers to level up.
- Success indicator: Testers at Silver+ earn >$25/hr effective rate; startups spend <$500/month for meaningful coverage

**5. Tester Dashboard & Reputation**
- What: Public tester profile showing tier, completed tasks, accuracy rate, specializations, and client ratings. Portable — testers can share their TestProof profile on LinkedIn or job applications.
- Why it matters: Creates a flywheel — better testers attract more tasks, more completed tasks build stronger profiles, stronger profiles attract better-paying tasks
- Success indicator: >50% of testers include TestProof profile on LinkedIn within 6 months

### Differentiation

| Feature | Upwork/Fiverr | Testlio/Applause | TestProof |
|---------|---------------|-------------------|-----------|
| Pricing | Race to bottom | Enterprise custom ($50K+/yr) | Transparent, tiered ($5-$100/task) |
| Tester quality | Unknown, self-reported | Vetted, managed | Certified with practical exams |
| Task structure | Freeform | Managed by vendor PM | Structured templates, self-serve |
| Target customer | Anyone | Enterprise | Startups & SMBs |
| Tester incentive | Compete on price | Hourly (no upside) | Tier-based earnings + bounty upside |
| Minimum commitment | None | Annual contract | None — pay per task |

### Non-Goals (V1)

- We are NOT building test automation infrastructure (no Selenium grid, no CI/CD integration)
- We are NOT a full-service managed QA agency (no dedicated QA manager per account)
- We are NOT targeting enterprise customers (no SOC 2 compliance, no SLAs initially)
- We are NOT replacing a startup's internal QA process — we supplement it

---

## 5. User Stories

### Startup Side

```
US-1: As a startup founder, I want to post a testing task with a description, platform, and budget,
so that qualified testers can find and claim it quickly.

Acceptance Criteria:
- Given I'm logged in, when I click "Post Task," I see a form with: title, description, platform (web/iOS/Android),
  testing type (manual/API/automation), required tester tier (any/Silver+/Gold+), payment model, budget, deadline
- Task appears on the public board within 30 seconds of posting
- I receive a notification when a tester claims my task
Priority: Must-Have
```

```
US-2: As a startup founder, I want to review structured bug reports with screenshots and reproduction steps,
so that my engineering team can fix issues without back-and-forth.

Acceptance Criteria:
- Each bug report contains: title, severity (critical/major/minor/cosmetic), steps to reproduce,
  expected result, actual result, environment info, and at least one screenshot or video
- I can approve, reject, or request clarification on each report
- Approved bugs can be exported as GitHub/Linear/Jira issues (future: direct integration)
Priority: Must-Have
```

```
US-3: As a startup founder, I want to choose the tester tier for my task,
so that I can match complexity to expertise and control costs.

Acceptance Criteria:
- Task form shows tier options with descriptions and typical rate ranges
- When I select Gold+, only Gold and Platinum testers see the task
- Rate recommendations update based on selected tier
Priority: Must-Have
```

### Tester Side

```
US-4: As a tester, I want to take a practical certification exam,
so that I can earn a tier ranking and access higher-paying tasks.

Acceptance Criteria:
- Exam presents a sandboxed web app with planted bugs (5 easy, 3 medium, 2 hard)
- I have 60 minutes to find and document as many bugs as possible
- Score determines tier: 0-4 = Bronze, 5-6 = Silver, 7-8 = Gold, 9-10 = Platinum
- I can retake the exam after a 7-day cooldown
- My tier badge appears on my profile immediately after scoring
Priority: Must-Have
```

```
US-5: As a tester, I want to browse and claim testing tasks matched to my tier and skills,
so that I can earn money on my schedule.

Acceptance Criteria:
- Task board filters by: my tier eligibility, testing type, platform, payment model, deadline
- Claiming a task locks it for me (with a time limit to start)
- If I don't start within 2 hours, the task returns to the board
Priority: Must-Have
```

```
US-6: As a tester, I want my earnings, completed tasks, and accuracy rate displayed on a public profile,
so that I can build a portable reputation.

Acceptance Criteria:
- Profile shows: tier badge, total tasks completed, average rating (1-5 stars), accuracy rate
  (% of submitted bugs approved), specializations, and a shareable public URL
- I can toggle individual stats between public and private
Priority: Should-Have
```

### Platform Side

```
US-7: As the platform, I want to verify bug reports before releasing payment,
so that testers are incentivized for quality over quantity.

Acceptance Criteria:
- In bounty mode, startup must approve/reject each bug within 48 hours (auto-approve if no action)
- Disputed bugs go to a platform reviewer for final decision
- Payment releases only for approved bugs
Priority: Must-Have
```

```
US-8: As the platform, I want to track tester performance metrics over time,
so that I can promote/demote tiers and maintain quality standards.

Acceptance Criteria:
- System tracks: bugs approved rate, client ratings, task completion rate, response time
- If a tester's rolling 30-day approval rate drops below 60%, flag for tier review
- Automatic tier promotion if metrics exceed next tier's thresholds for 90 consecutive days
Priority: Should-Have
```

---

## 6. User Flows

### Primary Flow: Startup Posts a Task

1. Startup signs up (email/Google SSO) → onboarding asks: what are you building? what platform? how often do you ship?
2. Startup clicks "Post Task" → fills in task details (title, description, test environment URL/credentials, platform, testing type, required tier, payment model, budget, deadline)
3. Task goes live on the board → matched testers get notified
4. Tester claims the task → startup gets notification with tester profile link
5. Tester executes testing → submits structured bug reports and/or test completion evidence
6. Startup reviews results → approves bugs, rates tester (1-5 stars)
7. Payment processes → tester earns (minus platform fee), startup gets invoice

### Primary Flow: Tester Takes Certification

1. Tester signs up → selects "Become a Tester" path
2. Views certification overview (what's tested, how scoring works, what each tier unlocks)
3. Starts exam → sandboxed app loads with a 60-minute timer
4. Finds bugs, documents them using the standard report template within the exam interface
5. Submits → platform auto-scores based on: bugs found (quantity), report quality (completeness), severity accuracy
6. Receives tier assignment → badge appears on profile
7. Can now browse and claim tasks at their tier level

### Edge Cases

- **Tester claims task but doesn't complete it**: Task auto-returns to board after deadline + 4-hour grace period. Tester gets a "dropped task" mark (3 strikes = temporary suspension)
- **Startup disputes a bug report**: Goes to platform review queue. A Gold+ tester or platform admin reviews the evidence and makes a binding decision within 24 hours.
- **Tester wants to level up**: Can retake certification exam every 7 days. Can also earn "auto-promotion" by maintaining top metrics for 90 days.
- **Startup needs testing NOW (urgent)**: "Rush" flag on task with 1.5x pay multiplier. Notifies all eligible testers with push notification.

### Error States

- If the test environment URL is down, tester reports it → task is paused, deadline extends automatically
- If payment fails (startup card declines), task is hidden from board until payment method is updated
- If a tester's account is flagged for quality issues, their active tasks are reassigned

---

## 7. Success Metrics

| Metric | Target | Baseline | Timeframe | Why It Matters |
|--------|--------|----------|-----------|----------------|
| Tester signups | 500 | 0 | First 3 months | Proves supply-side interest in the certification model |
| Certified testers (passed exam) | 200 | 0 | First 3 months | Conversion from signup to certified = product-market signal |
| Startup accounts | 50 | 0 | First 3 months | Demand-side traction |
| Tasks posted | 200 | 0 | First 3 months | Activity level — are startups actually using it? |
| Task claim rate | >80% | 0% | Ongoing | Tasks claimed within 4 hours of posting |
| Bug report approval rate | >75% | N/A | Ongoing | Quality signal — are testers producing useful work? |
| Tester NPS | >40 | N/A | Month 3 | Do testers find this worthwhile vs. Upwork/Fiverr? |
| Startup repeat rate | >50% | 0% | Month 3+ | Retention — do startups come back after first task? |

---

## 8. MVP Scope

### Must-Have (Ship-blocking)

- Startup & tester signup/auth (email + Google SSO)
- Tester certification exam (one level of exam with 4-tier scoring)
- Task posting form (title, description, type, tier, payment model, budget, deadline)
- Task board with tier-based filtering
- Task claim + assignment flow
- Structured bug report submission (template with screenshot upload)
- Bug review/approval by startup
- Payment processing (Stripe Connect — platform takes %, tester gets paid)
- Tester profile with tier badge, stats, and public URL
- Basic notification system (email)

### Should-Have (Valuable, shippable without)

- Smart matching (recommend testers based on tech stack history)
- Screen recording tool built into the testing flow
- GitHub/Linear issue export for approved bugs
- Tester leaderboard (top testers by tier, accuracy, volume)
- Rush task mode with pay multiplier
- Startup dashboard with QA metrics (bugs found per release, resolution time)
- API testing task type (Postman collection upload)
- In-app messaging between startup and tester

### Won't-Have (V1 — revisit later)

- Automated test script marketplace (testers sell Playwright/Cypress scripts)
- CI/CD integration (trigger TestProof tasks on deploy)
- White-label QA reports for startup's investors/clients
- Enterprise features (SSO, SLAs, dedicated account manager)
- Mobile app for testers
- AI-powered bug deduplication
- Multi-language support (English only for V1)
- SOC 2 / compliance certifications

---

## 9. Technical Constraints

- **Platform**: Web-first (responsive for mobile browsing, but primary experience is desktop)
- **Payment**: Stripe Connect required for marketplace payouts (KYC, 1099 compliance for US testers)
- **Exam sandbox**: Need a deployable, intentionally buggy web app that resets per exam session — consider Docker containers or Vercel preview deployments per tester
- **File storage**: Screenshot and video upload (estimate 50MB average per task) — cloud storage required
- **Performance**: Bug report submission must complete in <3 seconds; task board must load in <1 second
- **Compliance**: Must handle tester PII securely (GDPR if accepting international testers); 1099 reporting for US-based testers earning >$600/year
- **Scalability**: Design for 10K testers, 1K startups, 5K tasks/month in year 1

---

## 10. Timeline Estimate

**Phase 1: Design & Validation (3 weeks)**
- Finalize UX flows for both sides of the marketplace
- Build the certification exam sandbox app (intentionally buggy test app)
- Validate concept with 10 startup founders and 10 potential testers (interviews)
- Design the tier system and payment model specifics

**Phase 2: Core Build (8-10 weeks)**
- Auth, profiles, onboarding for both user types
- Certification exam engine + scoring algorithm
- Task CRUD + board with filtering
- Bug report template + screenshot upload
- Stripe Connect integration for payouts
- Notification system (email)
- Tester public profile pages

**Phase 3: Test & Polish (2-3 weeks)**
- Internal dogfooding (use TestProof to test TestProof — very meta)
- Bug fixes, performance tuning
- Tester onboarding flow optimization
- Payment flow end-to-end testing

**Phase 4: Soft Launch (2 weeks)**
- Invite 50 testers to take certification
- Invite 10 startups to post tasks (start with your network — offer free credits)
- Monitor metrics, iterate on exam difficulty and task templates
- Collect testimonials

**Total: ~15-18 weeks to soft launch.** Add 20% buffer = ~4.5 months.

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Cold start problem** — no testers when startups post, no tasks when testers join | High | Critical | Seed supply first: recruit 100 testers via bootcamp partnerships before opening demand side. Offer free credits to first 20 startups. |
| **Certification exam is too easy/hard** — wrong testers at wrong tiers | Medium | High | Beta test exam with 30 testers of known skill levels. Calibrate scoring to match expected distribution (40% Bronze, 30% Silver, 20% Gold, 10% Platinum). |
| **Stripe Connect compliance** — 1099 reporting, KYC friction | Medium | Medium | Use Stripe's built-in 1099 automation (Stripe Tax). Accept the KYC friction for testers — it's one-time and builds trust. |
| **Low bug report quality** — testers game the bounty model with junk reports | Medium | High | Require structured template. Track approval rate per tester. Auto-demote testers below 60% approval rate. Allow startups to flag low-quality reports. |
| **Enterprise competitors enter SMB market** — Testlio or Applause launch a startup tier | Low | High | Move fast, build community moat. Certification portability (testers own their reputation) creates switching costs. Focus on self-serve UX that enterprise vendors can't match. |
| **Tester churn** — testers take exam but don't complete tasks | High | Medium | Gamification: streak bonuses, tier progression rewards, "first task" bonus. Weekly email digest of new tasks matched to their skills. |

---

## 12. Open Questions

1. **Exam sandbox**: Build a custom buggy app or use a configurable framework? A custom app is more realistic but harder to maintain. A framework (e.g., intentional bug injection into a template app) scales better for future exam versions.

2. **International testers**: Do we accept testers outside the US from day one? Pros: larger supply pool. Cons: payment complexity (international Stripe payouts, tax treaties), timezone coordination.

3. **Exam proctoring**: Do we need any anti-cheating measures? Testers could share exam answers. Mitigation: randomize bug placement per exam session, or use a pool of 5+ sandbox app variants.

4. **Platform take rate**: What percentage does TestProof keep? Industry standard for marketplaces is 15-25%. Assumption: 20% platform fee (startup pays $100, tester receives $80). Need to validate this doesn't make tester earnings uncompetitive.

5. **Naming**: "TestProof" is a working name. Need to check domain availability and trademark. Alternatives worth considering: QAForge, ProofStack, CertQA, TestGuild, BugBounty.io (if available).

6. **Bootstrapped or funded?** This is a marketplace = capital intensive to solve cold start. Could bootstrap by starting as a certification-only platform (testers pay $29-$49 for certification, no marketplace yet) and add the marketplace once you have a tester base.

7. **API testing scope**: For V1, is API testing just "here's a Postman collection, run it and report failures" or do we need testers to write API tests from scratch? The former is much simpler to ship.

8. **Relationship to EntitleFlow**: Should the first "startup customer" be EntitleFlow itself? Dogfooding the marketplace with your own product creates a powerful case study and surfaces UX issues fast.

---

## Revenue Model

### Primary Revenue: Platform Fee (20%)

Startup pays the posted task budget. TestProof takes 20%, tester receives 80%.

Example:
- Startup posts a task at $50 → tester earns $40, TestProof earns $10
- Startup posts a bounty at $15/bug → tester earns $12/bug, TestProof earns $3/bug

### Secondary Revenue: Certification Fees

- Bronze exam: Free (removes barrier to entry)
- Silver retake: $19 (first attempt included with signup)
- Gold exam: $39 (unlocks premium tasks)
- Platinum exam: $79 (unlocks highest-paying tasks)
- Annual recertification: $29/tier

### Future Revenue (Post-MVP)

- **Startup subscriptions**: $99-$499/month for volume task posting, priority matching, analytics dashboard
- **Enterprise tier**: Custom pricing for companies needing 10+ testers/month
- **Tester premium**: $9.99/month for early access to tasks, profile boost, priority support
- **Automated test marketplace**: Testers sell reusable test scripts; TestProof takes 30% commission

### Unit Economics (Assumption)

- Average task value: $40
- Platform take: $8/task
- Average tasks/startup/month: 4
- Revenue per startup: $32/month
- Target: 500 active startups = $16K/month MRR
- Target: 2,000 active startups = $64K/month MRR (~$768K ARR)

---

**Next Steps**: Run `/stack-selector` to choose the optimal tech stack for this brief, or `/concept-forge` to further refine any section.

---

*Brief generated: March 23, 2026*
*Author: Jene (via TestProof concept development)*
