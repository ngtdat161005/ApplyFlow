# ApplyFlow

ApplyFlow là ứng dụng web cá nhân để theo dõi quá trình ứng tuyển internship/job, recruitment events, reminders và các trường hợp cần chú ý.

Repo này dùng cấu trúc monorepo JavaScript với hai app tách riêng:

- `backend/` - Node.js + Express API, dùng MongoDB native driver.
- `frontend/` - React + Vite frontend app.
- `docs/` - tài liệu sản phẩm, kiến trúc và task plan.

## Trạng Thái Hiện Tại

Đã hoàn thành:

- Task 01 - Monorepo scaffold và base folder structure.
- Task 02 - Backend bootstrap: Express app, env loading, MongoDB connection bootstrap, health route, JSON 404 handling, global error middleware và server entrypoint.

Chưa triển khai:

- Auth endpoints: register, login, current user.
- JWT auth middleware behavior cho protected routes.
- Application/event/dashboard business routes.
- Business repositories/services/controllers.
- Frontend app shell, router và UI behavior.

## Backend Task 02

Backend hiện có foundation tối thiểu để các task sau phát triển tiếp:

- Centralized env config trong `backend/src/config/env.js`.
- Shared MongoDB lifecycle trong `backend/src/config/mongodb.js`.
- Express app assembly trong `backend/src/app.js`.
- Server startup flow trong `backend/src/server.js`.
- Health route `GET /health` trong `backend/src/routes/index.js`.
- JSON 404 handler và global error middleware trong `backend/src/middlewares/error.middleware.js`.
- Logger helper tối giản trong `backend/src/shared/logger.js`.

Server chỉ bắt đầu listen sau khi kết nối MongoDB thành công. Nếu MongoDB không kết nối được, startup sẽ fail rõ ràng.

## Environment

Copy `.env.example` thành `.env` ở root repo hoặc trong `backend/` khi chạy backend local.

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=applyflow
JWT_SECRET=replace-with-a-local-development-secret
VITE_API_BASE_URL=http://localhost:4000/api
```

## Chạy Backend

```bash
cd backend
npm install
npm run dev
```

Health check:

```bash
GET http://localhost:4000/health
```

Response mong đợi:

```json
{
  "success": true,
  "message": "ApplyFlow API is running",
  "environment": "development"
}
```

## Project Tree

Ghi chú: `node_modules/`, `.git/` và `.agents/` không được liệt kê chi tiết vì đây là thư mục generated/tooling, không phải source structure của dự án.

```text
ApplyFlow/
├─ .agents/
├─ .git/
├─ backend/
│  ├─ node_modules/
│  ├─ src/
│  │  ├─ app.js
│  │  ├─ server.js
│  │  ├─ config/
│  │  │  ├─ constants.js
│  │  │  ├─ env.js
│  │  │  └─ mongodb.js
│  │  ├─ db/
│  │  │  ├─ collections.js
│  │  │  └─ indexes.js
│  │  ├─ domain/
│  │  │  ├─ attention/
│  │  │  │  ├─ attention.rules.js
│  │  │  │  ├─ attention.service.js
│  │  │  │  ├─ attention.types.js
│  │  │  │  └─ attention.utils.js
│  │  │  ├─ shared/
│  │  │  │  └─ domain-errors.js
│  │  │  └─ timeline/
│  │  │     └─ timeline.utils.js
│  │  ├─ middlewares/
│  │  │  ├─ auth.middleware.js
│  │  │  ├─ error.middleware.js
│  │  │  └─ validate.middleware.js
│  │  ├─ modules/
│  │  │  ├─ application/
│  │  │  │  ├─ application.controller.js
│  │  │  │  ├─ application.mapper.js
│  │  │  │  ├─ application.repository.js
│  │  │  │  ├─ application.service.js
│  │  │  │  └─ application.validator.js
│  │  │  ├─ auth/
│  │  │  │  ├─ auth.controller.js
│  │  │  │  ├─ auth.mapper.js
│  │  │  │  ├─ auth.repository.js
│  │  │  │  ├─ auth.service.js
│  │  │  │  └─ auth.validator.js
│  │  │  ├─ dashboard/
│  │  │  │  ├─ dashboard.controller.js
│  │  │  │  ├─ dashboard.mapper.js
│  │  │  │  └─ dashboard.service.js
│  │  │  └─ event/
│  │  │     ├─ event.controller.js
│  │  │     ├─ event.mapper.js
│  │  │     ├─ event.repository.js
│  │  │     ├─ event.service.js
│  │  │     └─ event.validator.js
│  │  ├─ routes/
│  │  │  ├─ application.route.js
│  │  │  ├─ auth.route.js
│  │  │  ├─ dashboard.route.js
│  │  │  ├─ event.route.js
│  │  │  └─ index.js
│  │  ├─ shared/
│  │  │  ├─ api-response.js
│  │  │  └─ logger.js
│  │  └─ utils/
│  │     ├─ async-handler.js
│  │     ├─ date.utils.js
│  │     ├─ object-id.utils.js
│  │     └─ pagination.utils.js
│  ├─ package-lock.json
│  └─ package.json
├─ docs/
│  ├─ exports/
│  │  ├─ ApplyFlow Architecture.pdf
│  │  ├─ ApplyFlow Specification.pdf
│  │  └─ ApplyFlow Tasks.pdf
│  ├─ ApplyFlow Architecture.md
│  ├─ ApplyFlow Specification.md
│  └─ ApplyFlow Tasks.md
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  ├─ api/
│  │  │  ├─ application.api.js
│  │  │  ├─ auth.api.js
│  │  │  ├─ dashboard.api.js
│  │  │  ├─ event.api.js
│  │  │  └─ http-client.js
│  │  ├─ app/
│  │  │  ├─ providers.jsx
│  │  │  ├─ query-client.js
│  │  │  └─ router.jsx
│  │  ├─ components/
│  │  │  ├─ common/
│  │  │  │  └─ .gitkeep
│  │  │  ├─ feedback/
│  │  │  │  └─ .gitkeep
│  │  │  └─ layout/
│  │  │     └─ .gitkeep
│  │  ├─ constants/
│  │  │  └─ status.js
│  │  ├─ features/
│  │  │  ├─ applications/
│  │  │  │  ├─ application.utils.js
│  │  │  │  ├─ components/
│  │  │  │  │  ├─ ApplicationCard.jsx
│  │  │  │  │  ├─ ApplicationFilters.jsx
│  │  │  │  │  ├─ ApplicationForm.jsx
│  │  │  │  │  ├─ ApplicationList.jsx
│  │  │  │  │  └─ StatusBadge.jsx
│  │  │  │  └─ hooks/
│  │  │  │     └─ .gitkeep
│  │  │  ├─ auth/
│  │  │  │  ├─ auth.store.js
│  │  │  │  ├─ auth.utils.js
│  │  │  │  ├─ components/
│  │  │  │  │  └─ .gitkeep
│  │  │  │  └─ hooks/
│  │  │  │     └─ .gitkeep
│  │  │  ├─ dashboard/
│  │  │  │  ├─ components/
│  │  │  │  │  ├─ AttentionFlagsList.jsx
│  │  │  │  │  ├─ StatusSummaryCards.jsx
│  │  │  │  │  └─ UpcomingEventsList.jsx
│  │  │  │  └─ hooks/
│  │  │  │     └─ .gitkeep
│  │  │  └─ events/
│  │  │     ├─ event.utils.js
│  │  │     ├─ components/
│  │  │     │  ├─ EventForm.jsx
│  │  │     │  ├─ EventItem.jsx
│  │  │     │  └─ EventTimeline.jsx
│  │  │     └─ hooks/
│  │  │        └─ .gitkeep
│  │  ├─ hooks/
│  │  │  └─ useDocumentTitle.js
│  │  ├─ pages/
│  │  │  ├─ ApplicationDetailPage/
│  │  │  │  └─ ApplicationDetailPage.jsx
│  │  │  ├─ ApplicationsPage/
│  │  │  │  └─ ApplicationsPage.jsx
│  │  │  ├─ DashboardPage/
│  │  │  │  └─ DashboardPage.jsx
│  │  │  ├─ LoginPage/
│  │  │  │  └─ LoginPage.jsx
│  │  │  └─ RegisterPage/
│  │  │     └─ RegisterPage.jsx
│  │  └─ utils/
│  │     ├─ date.utils.js
│  │     └─ storage.utils.js
│  ├─ index.html
│  └─ package.json
├─ .env.example
├─ .gitignore
└─ README.md
```

## Tài Liệu Nguồn

- `docs/ApplyFlow Specification.md` - hành vi sản phẩm.
- `docs/ApplyFlow Architecture.md` - cấu trúc code và ranh giới kỹ thuật.
- `docs/ApplyFlow Tasks.md` - thứ tự task và scope từng bước.

## Ghi Chú Scope

Các file module như `auth`, `application`, `event`, `dashboard` hiện phần lớn vẫn là placeholder từ Task 01. Task 02 chỉ làm backend infrastructure/bootstrap, không triển khai business logic.
