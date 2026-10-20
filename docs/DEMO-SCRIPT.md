# BASTION — Demo Script

Use this for **(A)** the live client presentation (15–20 min, strictly timed, no Q&A) and **(B)** the 5–8 minute
backup demo video. Both apps must already be running before your time starts.

**Before you start (5 min):** `php artisan migrate:fresh --seed` for clean data · both servers running · browser at
`http://localhost:5173/login`, zoom 110% · two browser profiles or one normal + one private window (one per role) ·
notifications off · slides open (`docs/BASTION-slides.pdf`) · Postman collection imported.

---

## A. Live client presentation (total ≈ 18 min)

Speak to the client ("your supply office"), not to a classmate. Business casual. Slides are only the frame; the live system is the main content.

### 1. Opening — 2 min (slides 1–2)
> "Good morning. I'm [name], the developer you commissioned. You told me requests are tracked on paper and spreadsheets: stock counts drift, approvals get lost, and nobody can say who holds which equipment. I built BASTION so there is one live record of every item, a clear request-to-return trail, low-stock warnings, and the right people doing the right things."

### 2. Solution overview — 3 min (slides 3–4)
- Two roles: **Supply Officer** (registers equipment, files requests) and **Base Commander** (approves, issues, closes out, sees everyone).
- The requisition's life: pending → approved → issued → returned, or rejected. Issuing takes stock out; returning puts it back.
- Plain-language architecture: *screen* (React) → *rules desk* (Laravel API checks who you are) → *filing cabinet* (MySQL).
- ERD in one breath: five tables; an item belongs to one category and one depot; a requisition links an officer to an item.

### 3. Live walkthrough — 9 min (switch to the browser)
Scenario: **"An officer requests radios for a night convoy; the commander approves and issues them; the officer sees the update."**

| Min | Do this | Say / show (required feature) |
|---|---|---|
| 0:00 | Login page: click **Authenticate** empty | **Validation** messages appear. Then wrong password → server message. |
| 0:45 | Click **Officer** demo chip → Authenticate | Login, welcome toast. Officer **dashboard** (personal figures), no Personnel link in menu. |
| 1:30 | **Equipment Depot** | Cards, stock bars, low-stock markers. **Search** "radio"; **filter** by category/depot; **Low stock** toggle; switch to table view; go to page 2 (**pagination**, "Showing 10–18 of 24"). |
| 3:00 | **Register equipment**: submit empty, then use an existing serial number | Client-side validation, then **server 422 message under the field**. Fill correctly → save → toast → find it by search. |
| 4:15 | Open the item (eye icon) | Detail page: depot, creator, stock gauge. Edit it (owner can edit). Note: officer has **no delete** button. |
| 5:00 | **Requisitions → New requisition** (or "Request this item") | Choose radios, quantity 3, priority urgent, purpose "Night convoy communications check". Try empty first (validation). Submit → toast with reference number, status **pending**. |
| 6:15 | Sign out → log in as **Commander** | **Dashboard** now base-wide: 8 figures, two charts, recent requisitions. Menu shows **Personnel Roster**. |
| 7:00 | **Requisitions** → filter status *pending* | Find the officer's request → **Approve** (confirmation) → **Issue** (stock deducted). Show **Reject** with remarks on another one. |
| 8:00 | **Equipment Depot** | The radio stock dropped by 3; change an item's status to *maintenance* with the dropdown; delete a test item (confirmation, admin only). |
| 8:30 | **Personnel Roster** | Admin-only page: search a name. |
| 9:00 | Back as **Officer** (other window) | Requisition shows **approved/issued**. Visit `/personnel` → **Clearance denied** screen: *"blocked in the screen and in the API"*. |

### 4. Handover — 2–3 min (slide 6)
- Repo link; README steps: `composer install`, `php artisan migrate --seed`, `npm install`, `npm run dev`.
- Demo accounts (`admin@bastion.test`, `officer@bastion.test`, password `Password123!`).
- API documentation: show the Postman collection; run one request (e.g. **GET /items**) and one negative (**403 officer DELETE**).
- Security in plain words: sign-in tokens, hashed passwords, admin pages blocked on both the screen and the API, officers only touch their own records, validation on both sides.

### 5. Closing — 2 min (slides 7–8)
- Delivered vs. Day 2 proposal (say what matched and anything that changed).
- Known limitations: no email alerts, no exports, no photos, one stock count per item.
- Phase 2: email alerts, PDF/CSV reports, photo upload, stock transfers between depots, audit log.
- "Thank you. BASTION is ready for handover."

---

## B. Demo video (5–8 minutes) — recording plan

Record the screen with voice-over (OBS, Windows Game Bar `Win+G`, or Zoom "record to computer"). Upload as *Unlisted* on YouTube or Google Drive and paste the link in the README. Stay within **8:00**; every required feature must be visible.

| Time | Scene | Must be visible |
|---|---|---|
| 0:00–0:25 | Title + one-sentence problem | Project name, your name, client |
| 0:25–1:00 | Register a new user, then log out/in | Register validation, login, current user, logout |
| 1:00–1:45 | Officer dashboard | 3+ figures, charts |
| 1:45–3:00 | Items: search, filters, pagination, table/grid | Search + filter + pagination |
| 3:00–4:15 | Create item (validation errors, success), edit, view detail | CRUD + both validation types |
| 4:15–5:15 | File a requisition | Create, validation, toast |
| 5:15–6:45 | Commander: approve → issue → reject, stock change, delete with confirmation | Workflow, admin-only actions |
| 6:45–7:30 | Personnel Roster + officer blocked at `/personnel` | Role-based access |
| 7:30–8:00 | Postman: one request + one 403; show README/repo | API docs + handover |

---

## Presentation standards checklist
- [ ] 8 slides or fewer; slides support the demo
- [ ] Seed data looks real (it does: named officers, serial numbers like `COM-RT-2201`, realistic dates)
- [ ] Both apps running before the clock starts; practised twice with a timer
- [ ] No Q&A: end cleanly at 15–20 minutes
