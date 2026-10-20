# Submission Checklist

Status of each deliverable, and what **you** still need to do before Day 14.

| ☐ | Deliverable | Status |
|---|---|---|
| ✅ | Source code for both apps, `.env.example` files, no `vendor/`, `node_modules/` or real `.env` | Done. `backend/.env.example`, `frontend/.env.example`, `.gitignore` files included |
| ⚠️ | README with title, **your name**, theme, features, stack, setup steps, demo credentials | Written. **Replace `[Your Full Name]`**, add the video link, and fill the "Delivered vs. proposal" line |
| ✅ | ERD image in `/docs` | `docs/erd.png` (+ `erd.svg`) |
| ✅ | API documentation | `docs/BASTION.postman_collection.json` (32 requests) **and** endpoint table in README |
| ✅ | Screenshots in `/docs/screenshots` | 27 screenshots captured from the real stack (`php artisan serve` + `npm run dev`, MySQL/MariaDB, seeded data) |
| ⚠️ | Slides (PDF) in `/docs` | `docs/BASTION-slides.pdf`, 8 slides. **Replace `[Your Full Name]` and `[GitHub repo link]`** in `docs/slides/slides.html` and re-export (Chrome → Print → Save as PDF, margins None, background graphics on), or edit the PDF |
| ❌ | Demo video, 5–8 min, link in README | **You must record this**; plan in `docs/DEMO-SCRIPT.md` section B |
| ❌ | Commit history: ≥ 20 meaningful commits across the 2 weeks | **Only you can provide this.** Commit as you actually work; see the plan below. Do not backdate commits |

## Verified before delivery

Run on Linux with PHP 8.2+, MariaDB (MySQL-compatible) and Node, following the README steps:

- `php artisan migrate --seed` creates 6 users, 7 categories, 4 depots, 24 items, 28 requisitions (MySQL and SQLite)
- `php artisan test`: 10 tests passed
- `php artisan serve` (port 8000) + `npm run dev` (port 5173): 38 browser checks passed, no console errors
- Postman collection run with Newman: 32 requests, 42 assertions, 0 failed

I could not test on Windows/XAMPP. Run the README once on your machine before submitting. Typical checks:
PHP >= 8.2, `pdo_mysql` enabled, MySQL running, database `bastion` created, `DB_USERNAME`/`DB_PASSWORD` in `backend/.env`.

## Suggested commit plan (≥ 20 commits)

Make these as real commits while you review, run and adjust each piece (do one or two per working session).

1. `chore: initialise monorepo with backend/, frontend/, docs/ and .gitignore`
2. `feat(backend): add Laravel 12 skeleton with Sanctum dependency`
3. `feat(db): create users table with rank, unit and role`
4. `feat(db): add categories and depots tables`
5. `feat(db): add items table with foreign keys and stock fields`
6. `feat(db): add requisitions table and status workflow columns`
7. `feat(db): add models, relationships and factories`
8. `feat(db): add realistic seeders (users, depots, items, requisitions)`
9. `feat(auth): register, login, logout and current-user endpoints`
10. `feat(auth): add role middleware and CORS config`
11. `feat(api): items CRUD with Form Request validation and policy`
12. `feat(api): item search, filters, sorting and pagination`
13. `feat(api): requisitions CRUD with ownership rules`
14. `feat(api): requisition status workflow with stock deduction/restore`
15. `feat(api): dashboard summary and meta endpoints`
16. `feat(api): personnel roster endpoint (admin only)`
17. `test(api): feature tests for auth, roles, validation and workflow`
18. `feat(frontend): Vite React app, router, Axios client and auth context`
19. `feat(frontend): login and register pages with validation`
20. `feat(frontend): layout, sidebar, route guards and toasts`
21. `feat(frontend): dashboard with figures and charts`
22. `feat(frontend): equipment list with search, filters and pagination`
23. `feat(frontend): item form modal, detail page and delete confirmation`
24. `feat(frontend): requisitions page and approval workflow`
25. `feat(frontend): personnel roster and role-based menu`
26. `style: military theme, responsive layout and loaders`
27. `docs: ERD, Postman collection and API table`
28. `docs: screenshots, slides and demo script`
29. `docs: finalise README`

Final steps: push to GitHub (public or shared with the instructor), open the repo in a **fresh clone**, follow the README alone, and paste the repo link where required.
