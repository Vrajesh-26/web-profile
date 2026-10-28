# we-profile: Build Plan

Owner: Vrajesh Darji. Placeholder copy lives in `data/seed.ts`; real content is edited later in the dashboard. Read only the section a prompt names.

## 0. How to use this file
- `AGENTS.md` stays in the project root (always loaded). Keep this file next to it.
- One phase per Cursor chat. First message: "Phase N from PLAN.md section 13. Read only that section and the sections it names."
- Use Plan Mode (Shift+Tab) only for Phases 3 and 4. The UI phases are already planned here.
- If limits run out mid-phase: have the agent update `PROGRESS.md`, then continue in another tool that reads `AGENTS.md` (section 15).

## 1. Brief
- Subject: a personal profile site for a full-stack developer who is also building security skills.
- Audiences: (1) recruiters and hiring managers who scan for 30 seconds, (2) AI hiring agents and crawlers, (3) the owner, who edits content without touching code.
- Primary job: in 30 seconds show who he is, his best work, and how to reach him.
- Not developer-themed: no terminal or code motifs. It should read like a well-made personal brand site.
- Out of scope for v1: blog, comments, i18n, theme toggle, image uploads, analytics.

Reference site (udaaannitsolutions.com) is used for pattern vocabulary only:

| Reference pattern | Our version |
|---|---|
| White full-screen overlay menu, big type | Deep Moss overlay; hovered link changes weight/width (variable font); shows that room's color |
| Blue stacked sticky cards with 3D clip-art | Stacked deck on Moss; each card has its own non-blue color; project video loop or screenshot instead of clip-art |
| Static scrolling ticker | Ticker whose speed and direction follow scroll velocity; items come from the Skills table |
| Pill tags | Tags are real skills; clicking one filters the project deck with a layout animation |

## 2. Design system

### 2.1 Concept: color-blocked rooms
The page scrolls through full-bleed "rooms", each with its own color. Room changes are driven by scroll. Rooms: Hero (Moss), About + Now (Oat), Skills (Marigold), Projects (Moss), Journey + Documents (Oat), Contact (Deep Moss).

### 2.2 Palette (tokens in `app/globals.css`)

| Name | Hex | Role |
|---|---|---|
| Moss | `#1B2A22` | Hero, Projects room, base dark |
| Deep Moss | `#121B16` | Overlay menu, Contact room, text on light rooms |
| Oat | `#EFE9D8` | Light rooms, text on dark rooms |
| Marigold | `#F4B223` | Skills room, primary accent, CTA |
| Orchid | `#B58AE6` | Secondary accent, one project card color, used sparingly |
| Sage | `#8FA394` | Muted text on dark, borders, one project card color |
| Journey Education | `#1F5A3E` / `#DDE8D9` | Education foreground / tint |
| Journey Experience | `#6B3FA0` / `#E3D9F0` | Experience foreground / tint |
| Journey Achievement | `#A4481C` / `#F3DCCB` | Achievement foreground / tint |
| Journey Certification | `#7A5A00` / `#F0E3B8` | Certification foreground / tint |

- Approximate contrast on Moss (verify with a checker): Marigold about 8:1, Oat about 12:1, Sage about 5.6:1, Orchid about 5.5:1.
- Text on Marigold, Orchid, Sage and Oat cards: Deep Moss.
- Project `accent` enum: `marigold | orchid | oat | sage`. Cards sit on the Moss room.
- Focus ring token switches per room: Marigold on dark rooms, Deep Moss on light rooms.
- Do not use blue-family hues or gradient washes. No theme toggle in v1.
- The palette is a deliberate design choice, not live-verified against trend sources. If you change it, change only the tokens.

### 2.3 Typography
- Display: Anybody (variable `wdth` 50-150, `wght` 100-900). Used for hero name, section titles, menu links. Verify the axes in `next/font`; if unavailable, fall back to Bricolage Grotesque.
- Body: Hanken Grotesk 400/500/700.
- Scale: hero `clamp(3.5rem, 13vw, 11rem)`, h2 `clamp(2.5rem, 6vw, 5rem)`, body 1.0625rem/1.6, measure at most 65ch.
- Sentence case everywhere. Buttons say what happens: "View projects", "Open resume", "Send message".

### 2.4 Layout sketches

Hero (Moss):
```
wordmark                                   [ Menu ]
 Vrajesh                       .----------------.
 Darji                         |   portrait     |  (morphing clip-path mask,
 Full-stack developer          |   in mask      |   light grain overlay)
 [ Open to roles ]             '----------------'
 [ View projects ] [ Open resume ]
```
Overlay menu (Deep Moss, full screen):
```
 Home                         (hover: this link widens and gets bolder,
 About                         siblings narrow; right side shows room color
 Skills                        swatch + one-line description)
 Projects
 Journey
 Contact                                         [ Close ]
```
Project deck (Moss): sticky stacked cards. The next card slides over the previous one, which scales to 0.95 and dims. Each card shows title, role, skill tags, 2-line summary, cover media, and a "Read case study" button.

### 2.5 Signature moment (the one bold thing)
The hero name is set in variable type. On load it plays one "inflate" (`wdth` 50 to settled, per-letter stagger). Afterwards, letters near the pointer widen and gain weight. On touch devices the effect follows scroll progress instead. With reduced motion it is static.

### 2.6 Interaction inventory (keep to these)

| Effect | Trigger | Method | Reduced-motion fallback |
|---|---|---|---|
| Overlay menu | Click, Esc closes | clip-path reveal + link stagger, focus trap | Instant open/close |
| Hero name | Pointer or scroll (touch) | motion values driving `font-variation-settings` | Static |
| Room color change | Scroll | `useScroll` or IntersectionObserver swaps room tokens | Hard cut |
| Skills ticker | Scroll velocity | `useVelocity` + `useSpring` to speed/direction | Paused |
| Skill filter | Click a tag | `layout` animation on skill grid and project deck | Instant |
| Project deck | Scroll | sticky stacking + `useScroll` per card | Normal list |
| Magnetic CTA | Pointer | transform, only the 2 hero CTAs | None |
| Resume modal | Click | Drive preview iframe, focus trap | Same |
| Contact success | Submit | form morphs to confirmation | Same |

Optional only after launch: custom cursor, cross-page view transitions.

### 2.7 Do not
- No fade-slide-up entrance on every section; no hover transition on every card.
- No ALL-CAPS eyebrow labels, no 01/02/03 markers outside the Journey timeline, no accenting one word in a headline, no arrows on every link, no identical rounded-card grids.
- No 3D clip-art or stock illustrations; use the portrait and real project media.

## 3. Components

Public:

| Component | Data | Notes |
|---|---|---|
| `SiteHeader`, `MenuButton` | none | wordmark + menu button, sticky |
| `OverlayMenu` | room list | focus trap, `aria-expanded`, Esc |
| `RoomShell` | room token | sets background and focus-ring tokens |
| `Hero`, `PointerType`, `PortraitMask`, `AvailabilityPill` | profile | availability from DB |
| `About`, `NowStrip` | profile (`bio_md`, `now_md`) | short bio + what I'm doing now |
| `SkillsTicker`, `SkillFilterGrid` | skills | filter state shared with deck via URL param |
| `ProjectDeck`, `ProjectCard` | projects + skills | sticky stack, accent color |
| `CaseStudy` (`/projects/[slug]`) | project | markdown body, media, live/repo links |
| `Journey` | journey | real sequence, so numbering/timeline is allowed |
| `DocumentsList`, `DriveModal` | documents | Drive preview + download link |
| `ContactForm` | none | zod validation, Turnstile token |
| `AgentNote` | none | one plain sentence linking to `/agents` |
| `SiteFooter` | social_links | no email or phone |

Dashboard: `DashShell`, `DataTable`, `EntityForm` (react-hook-form + zod), `ReorderButtons` (up/down, no drag-drop in v1), `KeyManager`, `InboxList`, `ExportButton`.

## 4. Architecture
```
Browser -> Vercel (Next.js App Router) -> Neon Postgres
Public pages: server-rendered, cached
Dashboard save -> server action (requireOwner) -> DB -> revalidate
Documents: Google Drive links only (no file storage in v1)
Forms: Cloudflare Turnstile
```
Folders:
```
app/(public)/page.tsx, projects/[slug]/page.tsx, agents/page.tsx
app/(admin)/login/page.tsx, dashboard/...
app/api/profile.json/route.ts, app/api/agent/contact/route.ts, app/llms.txt/route.ts
app/sitemap.ts, robots.ts, opengraph-image.tsx
components/{site,motion,dash,ui}
lib/{db,auth,security,seo}, lib/data/{index,public,admin}.ts
db/schema.ts, db/seed.ts, data/seed.ts, tests/
```
Public pages are cached, so a sleeping free database does not affect visitors. Dashboard saves revalidate the affected paths.

## 5. Data model (Postgres + Drizzle)
```
profile            (1 row) id, full_name, tagline, role_line, bio_md, avatar_url, resume_drive_url,
                   availability('open'|'busy'|'closed'), now_md, updated_at
profile_private    (1 row) id, email, phone            -- never selected by public queries
skills             id, name, category('web'|'backend'|'security'|'data'|'tools'|'other'), icon_key, sort_order, visible
projects           id, slug(unique), title, summary, body_md, role, status('live'|'building'|'archived'),
                   live_url, repo_url, cover_url, video_url, accent, featured, sort_order, visible, published_at
project_skills     project_id, skill_id                -- composite PK
journey            id, kind('education'|'experience'|'certificate'|'award'), org, title, start_date, end_date, body, sort_order, visible
documents          id, title, kind('resume'|'certificate'|'other'), drive_url, sort_order, visible
social_links       id, label, url, sort_order, visible
contact_requests   id, name, email, message, source('human'|'agent'), status('new'|'read'|'replied'), created_at, ip_hash
api_keys           id, label, key_hash, scopes text[], rate_limit_per_hour, last_used_at, revoked_at, created_at
access_log         id, ts, key_id null, path, status, ua, ip_hash   -- agent endpoints only; prune after 90 days
rate_limits        key, window_start, count                          -- login, forms, keyed API
+ auth library tables (user, session, account)
```
- Only publicly shareable files go in `documents`. Never put ID cards or marksheets with personal numbers on public Drive links. A Drive "anyone with the link" URL is not secret.
- New skill (for example "Cybersecurity") is just a row in `skills`; ticker, filter and project tags update after revalidation.

## 6. Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | public | all rooms |
| `/projects/[slug]` | public | case study |
| `/agents` | public | short doc for agent developers: endpoints, fields, how to request a key |
| `/api/profile.json` | public | public fields only |
| `/llms.txt` | public | plain Markdown summary + links (optional; crawler support is uncertain) |
| `/sitemap.xml`, `/robots.txt` | public | SEO |
| `/api/agent/contact` | Bearer key | contact card for approved agents |
| `/login` | public, noindex | owner login |
| `/dashboard/*` | owner, noindex | all editing |

## 7. Dashboard modules
Profile (text, avatar URL, resume URL, availability, now) | Skills | Projects (with skill tags, accent, visible, featured) | Journey | Documents | Links | Inbox (contact requests) | Agent access (create/revoke keys, view access log) | Settings (change password, sessions, export JSON). Each list supports create, edit, hide/show, reorder, delete, and each save revalidates the public pages.

## 8. Security and auth
- Single owner. No sign-up route. Seed the owner with a script that reads env vars.
- Use one maintained auth library (for example Better Auth or Auth.js; pick the one whose current docs you can verify). Never hand-roll hashing or sessions.
- Cookies: httpOnly, secure, sameSite=lax.
- Login rate limit: 5 attempts per 15 minutes per IP+email, using the `rate_limits` table. Generic error message.
- `requireOwner()` runs inside every server action and route handler for the dashboard.
- Security headers in `next.config`: CSP (start in report-only), `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. Allow `frame-src https://drive.google.com` and `https://challenges.cloudflare.com`.
- `noindex` via header and meta on `/login` and `/dashboard`; omit them from the sitemap.
- For route handlers that use cookies, check the `Origin` header.
- Secrets only in Vercel env vars. `.env*` in `.gitignore`.
- Add a monthly JSON export (Settings) as a simple backup.
- Later option: TOTP two-factor for the owner account.

## 9. AI hiring agents: access model

| Tier | Who | Gets | How |
|---|---|---|---|
| Public | anyone, any crawler | name, headline, bio, skills, projects, journey, public docs, social links. No email or phone. | HTML, JSON-LD, `/api/profile.json`, `/llms.txt` |
| Keyed | agents or recruiters the owner approves | contact card (email, phone) and resume link | `Authorization: Bearer <key>`; keys created in Dashboard, shown once, stored hashed, scoped, 20 requests/hour, revocable, logged |
| Owner | me | everything | dashboard |

- `robots.txt` is advisory and User-Agent strings can be spoofed. Do not authorize anything by User-Agent. The only safe private data is data that is not published.
- Allow major search and AI crawlers in `robots.txt` (for example Googlebot, Bingbot, OAI-SearchBot, ClaudeBot, PerplexityBot; confirm current names in each vendor's docs). The goal is to be found.
- Human contact: form with Turnstile. A request with `source=agent` can ask for a key; the owner approves manually.
- Public content is plain, truthful text. No hidden text or instructions aimed at AI screeners.
- JSON-LD: `Person`, `WebSite`, `ProfilePage`, with `sameAs` set to public social links only.

## 10. SEO
- Next metadata API on every route: title template, description at most 155 characters, canonical URL, Open Graph and Twitter cards.
- Dynamic OG images (`opengraph-image.tsx`) for home and each project.
- `sitemap.ts` lists `/`, `/projects/*`, `/agents`.
- One `h1` (name + role), landmarks, descriptive link text, alt text on all images.
- Text-rich case-study pages: they give search engines and agents more to read than cards alone.
- Targets: LCP at most 2.5 s, CLS under 0.1, INP under 200 ms.
- After deploy: add a custom domain, submit the sitemap in Google Search Console and Bing Webmaster Tools, check JSON-LD with a rich results test.

## 11. Performance and accessibility budgets
- Use `LazyMotion` with `domAnimation` and `m.*` components to keep Motion small. Soft budget: home route first-load JS about 170 kB gzipped.
- Hero video at most 4 MB (WebM or MP4), muted, loop, `playsInline`, with poster. Do not autoplay under reduced-motion or data-saver. Longer demos: embed YouTube.
- Fonts via `next/font`; images via `next/image` with `sizes`; below-the-fold media lazy.
- WCAG AA contrast, skip link, visible focus, keyboard-operable menu, touch targets at least 44 px, reduced-motion respected everywhere.

## 12. Tests (four, to keep it cheap)
1. Vitest: `getPublicProfile()` output has no `email` or `phone` keys, and its JSON matches no email or phone pattern.
2. Playwright: the HTML of `/` contains none of the private seed values; `/dashboard` redirects to `/login` when logged out.
3. Playwright: wrong password fails; correct login works; adding a skill in the dashboard makes it appear on `/`.
4. Playwright: `/api/agent/contact` returns 401 without a key, 200 with a valid key, and 401 after the key is revoked.
Manual: Lighthouse mobile (aim for 90+ performance, 95+ SEO/accessibility), keyboard-only pass, reduced-motion pass.

## 13. Phases (new chat per phase)

Phase 0: Scaffold
- Prompt: "Phase 0. Read PLAN.md sections 2.2, 2.3, 4 only. Set up folders, install all deps in one command, next/font, tokens in globals.css, RoomShell, seed types, PROGRESS.md."
- Done when: `npm run build` passes and empty rooms render with the tokens.

Phase 1: Shell, menu, hero
- Prompt: "Phase 1. Read sections 2.4 to 2.6 and the Hero/Menu rows of section 3. Build SiteHeader, OverlayMenu, Hero (PointerType, PortraitMask, AvailabilityPill) from data/seed.ts."
- Done when: menu opens/closes with keyboard, hero name reacts to pointer, reduced motion is static, mobile works.

Phase 2: Remaining rooms (UI only, seed data)
- Prompt: "Phase 2. Read sections 2.5, 2.6 and section 3. Build About+Now, SkillsTicker + SkillFilterGrid, ProjectDeck + CaseStudy page, Journey + Documents (DriveModal), ContactForm UI without a backend."
- Done when: filter animates the deck, ticker follows scroll velocity, deck stacks, all rooms responsive.

Phase 3: Database (use Plan Mode)
- Prompt: "Phase 3. Read sections 4, 5, 8 (rate limits). Add Drizzle schema, Neon connection, seed script; switch lib/data/index.ts from seed to DB with cached reads; wire ContactForm backend with Turnstile and rate limit."
- Done when: the site renders the same from the DB; contact requests are stored.

Phase 4: Auth and dashboard (use Plan Mode)
- Prompt: "Phase 4. Read sections 7 and 8. Add auth (single owner, no sign-up), requireOwner(), login page, dashboard CRUD for all modules, revalidation on save, inbox, JSON export."
- Done when: logged-out access to any dashboard action is rejected; new skill/project shows on `/` after save.

Phase 5: Agent access and SEO
- Prompt: "Phase 5. Read sections 9 and 10 and the security headers in section 8. Build /api/profile.json, /llms.txt, /agents, API keys (hashed, scoped, rate-limited, logged), /api/agent/contact, JSON-LD, sitemap, robots, OG images, headers."
- Done when: keyless contact request returns 401, no private data appears in public output.

Phase 6: Tests, audit, deploy
- Prompt: "Phase 6. Read sections 11, 12, 14. Write the four tests, run one web-design-guidelines audit, fix only the top issues, then give me the deploy checklist."
- Done when: tests pass, Lighthouse targets met, site live.

Skills: `frontend-design` in Phases 1-2 (skip its brainstorming pass); `next-best-practices` in Phases 3-5; `web-design-guidelines` once in Phase 6.

## 14. Deploy checklist
- Push to GitHub, import in Vercel. Vercel Hobby is for personal, non-commercial use, which fits a personal portfolio.
- Env vars: `DATABASE_URL`, `AUTH_SECRET`, `OWNER_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`.
- Run `db:push` and the owner seed against the production database once.
- Verify: `/dashboard` redirects when logged out; security headers present; JSON-LD valid; OG preview looks right; no email/phone in page source.
- Check Neon's current free-tier limits on its pricing page before launch.

## 15. PROGRESS.md template and handoff
```
# Progress
Phase: <n> <name>   Status: done | in progress
Done: <1-3 lines>
Next: <1-2 lines>
Blockers: <none or 1 line>
Decisions: <only choices that affect later phases>
```
If Cursor limits run out: open the folder in Gemini CLI (it reads `AGENTS.md`) and say "Read PROGRESS.md and continue with the next phase."
