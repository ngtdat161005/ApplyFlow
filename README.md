# ApplyFlow

ApplyFlow la ung dung web ca nhan dung de theo doi qua trinh ung tuyen internship/job. V1 tap trung vao bon luong chinh: xac thuc nguoi dung, quan ly application, timeline event va dashboard voi cac muc can chu y.

## 1. Muc Tieu

- Luu thong tin cong ty, vi tri, trang thai ung tuyen va ghi chu.
- Theo doi cac su kien theo tung application: applied, HR call, OA, interview, follow-up, offer, rejected va note.
- Hien thi dashboard tong quan: tong so application, thong ke theo trang thai, su kien sap toi va attention flags.
- Tach ro backend API va frontend SPA de de phat trien, kiem thu va review.

## 2. Cong Nghe

| Thanh phan | Cong nghe |
|---|---|
| Backend | Node.js, Express, MongoDB native driver |
| Frontend | React, Vite |
| Auth | JWT, bcrypt |
| Database | MongoDB |

## 3. Cau Truc Thu Muc

```text
ApplyFlow/
├─ backend/
│  ├─ scripts/      # Lightweight check scripts
│  └─ src/          # Express app, routes, modules, domain logic
├─ frontend/
│  ├─ docs/         # Manual frontend testcases
│  └─ src/          # React app, pages, features, API clients
├─ docs/            # Specification, architecture, task plan
├─ .env.example
└─ README.md
```

Tai lieu chi tiet:

- `docs/ApplyFlow Specification.md`: hanh vi san pham.
- `docs/ApplyFlow Architecture.md`: ranh gioi ky thuat va cach to chuc code.
- `docs/ApplyFlow Tasks.md`: pham vi va thu tu task.
- `frontend/docs/manual-frontend-testcases.md`: testcase thu cong cho frontend V1.

## 4. Yeu Cau He Thong

- Node.js 18+.
- npm.
- MongoDB dang chay local hoac remote.
- Git.

## 5. Cai Dat Moi Truong

Clone du an va cai dependencies rieng cho tung app:

```bash
git clone <repo-url>
cd ApplyFlow
cd backend
npm install
cd ../frontend
npm install
```

Tao file `.env` o root hoac trong `backend/` dua tren `.env.example`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=ApplyFlow
JWT_SECRET=replace-with-a-local-development-secret
VITE_API_BASE_URL=http://localhost:4000
```

Ghi chu:

- Backend se doc bien moi truong tu root `.env` hoac `backend/.env`.
- Neu chay frontend bang Vite dev server va khong set `VITE_API_BASE_URL`, Vite proxy se chuyen mot so request ve `http://127.0.0.1:4000`.
- Nen dung database rieng cho moi truong dev/test de tranh lam hong du lieu that.

## 6. Chay Du An

Chay backend:

```bash
cd backend
npm run dev
```

Backend chi listen sau khi ket noi MongoDB thanh cong. Kiem tra API:

```bash
curl http://localhost:4000/health
```

Ket qua hop le:

```json
{
  "success": true,
  "message": "ApplyFlow API is running",
  "environment": "development"
}
```

Chay frontend trong terminal khac:

```bash
cd frontend
npm run dev
```

Mo URL Vite in ra trong terminal, thuong la `http://localhost:5173`.

## 7. Kiem Thu Va Kiem Tra

Backend:

```bash
cd backend
npm run check:attention
npm run check:backend-hardening
node --check scripts/check-backend-e2e.js
```

Kiem tra E2E backend qua HTTP:

```bash
cd backend
npm run check:e2e
```

Dieu kien: backend phai dang chay va ket noi MongoDB thanh cong. Mac dinh script goi `http://127.0.0.1:4000`; co the doi bang:

```bash
APPLYFLOW_BACKEND_ORIGIN=http://localhost:4000 npm run check:e2e
```

Frontend:

```bash
cd frontend
npm run build
```

Test thu cong frontend theo:

```text
frontend/docs/manual-frontend-testcases.md
```

## 8. API Chinh

| Nhom | Endpoint |
|---|---|
| Health | `GET /health` |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Applications | `GET /applications`, `POST /applications`, `GET/PATCH/DELETE /applications/:applicationId` |
| Events | `GET/POST /applications/:applicationId/events`, `PATCH/DELETE /applications/:applicationId/events/:eventId` |
| Dashboard | `GET /dashboard/summary` |

Tat ca endpoint application, event va dashboard yeu cau JWT bearer token.

## 9. Gioi Han V1

- Chua co user-delete endpoint; tai khoan test co the con lai trong database.
- Frontend V1 duoc kiem thu bang manual testcase va build check, chua co framework E2E nhu Playwright/Cypress.
- Backend E2E script tao user/application/event that tren database dang cau hinh, nen chi nen chay voi database dev/test.

## 10. Troubleshooting

- Neu backend khong start, kiem tra `MONGODB_URI`, `MONGODB_DB_NAME` va MongoDB server.
- Neu frontend bao khong goi duoc API, kiem tra backend co dang chay o port 4000 khong va gia tri `VITE_API_BASE_URL`.
- Neu remote MongoDB host khong resolve duoc, sua DNS/network tren may chay app; khong hard-code DNS trong source code.
