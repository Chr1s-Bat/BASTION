# Thunder Client: BASTION sample endpoints

- `thunder-collection_BASTION.json`: the 11 sample endpoints of the capstone table
- `thunder-environment_BASTION.json`: `baseUrl` (http://127.0.0.1:8000/api), `token`, `itemId`

Import: Thunder Client → Collections → ⋯ → Import (collection), then Env → ⋯ → Import (environment) and click it to make it Active.
Start the API first: `cd backend` → `php artisan serve`.

Run top to bottom. Login saves `{{token}}`; Create saves `{{itemId}}`. Logout last.

| # | Request | Expect | Body (BASTION fields) |
|---|---|---|---|
| 1 | POST /api/register | 201 | name, email, password, password_confirmation, rank, unit |
| 2 | POST /api/login | 200 | email, password (admin@bastion.test / Password123!) |
| 3 | GET /api/user | 200 | none |
| 4 | GET /api/items?search=radio&category_id=1&page=1 | 200 | none |
| 5 | POST /api/items | 201 | name, serial_number, category_id, depot_id, quantity, reorder_level, status, description |
| 6 | GET /api/items/{id} | 200 | none |
| 7 | PUT /api/items/{id} | 200 | same fields as create (all required) |
| 8 | PATCH /api/items/{id}/status | 200 | status: operational, maintenance or decommissioned |
| 9 | GET /api/dashboard | 200 | none |
| 10 | DELETE /api/items/{id} | 204 | none (admin only) |
| 11 | POST /api/logout | 200 | none |

Register uses a fixed email: change it if you send it twice (422 means the email already exists).
All 11 requests were run against the BASTION API and returned the codes above.
For the full 32-request set (requisitions, 401/403/404/422 cases) import `../BASTION.postman_collection.json`.
