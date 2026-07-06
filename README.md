# ApplyFlow

ApplyFlow là ứng dụng web cá nhân để theo dõi quá trình ứng tuyển internship/job — applications, timeline events, và các trường hợp cần chú ý (attention flags).

> **Status:** Đang trong giai đoạn phát triển V1 theo `docs/ApplyFlow Tasks.md`. Backend infrastructure (Task 02) đã sẵn sàng; các module business (auth, application, event, dashboard) hiện là placeholder.

## Cấu trúc Monorepo

| Thư mục | Nội dung |
|---|---|
| `backend/` | Node.js + Express API, MongoDB native driver |
| `frontend/` | React + Vite SPA |
| `docs/` | Spec, architecture, task plan — nguồn sự thật cho hành vi & cấu trúc |

Chi tiết hành vi sản phẩm, ranh giới kỹ thuật và thứ tự triển khai nằm ở:

- [`docs/ApplyFlow Specification.md`](docs/ApplyFlow%20Specification.md) — sản phẩm làm gì
- [`docs/ApplyFlow Architecture.md`](docs/ApplyFlow%20Architecture.md) — code tổ chức ra sao
- [`docs/ApplyFlow Tasks.md`](docs/ApplyFlow%20Tasks.md) — thứ tự & scope từng task

README này **không lặp lại** nội dung ở trên — chỉ đóng vai trò index và hướng dẫn chạy dự án.

## Yêu cầu hệ thống

- Node.js 18+ (ESM, `node:fs` APIs)
- MongoDB instance đang chạy (local hoặc remote), truy cập được qua connection string
- npm

## Setup

1. Copy `.env.example` thành `.env` ở root (hoặc trong `backend/`, `env.js` sẽ tự tìm cả hai vị trí):

   ```bash
   cp .env.example .env
   ```

2. Điền các biến bắt buộc:

   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=ApplyFlow
   JWT_SECRET=replace-with-a-local-development-secret
   VITE_API_BASE_URL=http://localhost:4000/api
   ```

## Chạy Backend

```bash
cd backend
npm install
npm run dev
```

Server chỉ bắt đầu listen sau khi kết nối MongoDB thành công — nếu MongoDB không kết nối được, startup sẽ fail rõ ràng thay vì chạy ngầm ở trạng thái lỗi.

Kiểm tra:

```bash
curl http://localhost:4000/health
```

```json
{
  "success": true,
  "message": "ApplyFlow API is running",
  "environment": "development"
}
```

## Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

### Troubleshooting

- If a remote MongoDB host does not resolve locally, fix the machine or network DNS configuration outside the app runtime. Do not hard-code public DNS servers in `backend/src/server.js`.

## Project Tree

```text
ApplyFlow/
├─ backend/
│  └─ src/
│     ├─ app.js
│     ├─ server.js
│     ├─ config/        # env.js, mongodb.js, constants.js
│     ├─ db/             # collections.js, indexes.js
│     ├─ domain/         # attention/, timeline/, shared/
│     ├─ middlewares/    # auth, error, validate
│     ├─ modules/        # application/, auth/, dashboard/, event/
│     ├─ routes/
│     ├─ shared/         # api-response.js, logger.js
│     └─ utils/
├─ docs/
│  ├─ exports/           # bản PDF của spec/architecture/tasks
│  ├─ ApplyFlow Architecture.md
│  ├─ ApplyFlow Specification.md
│  └─ ApplyFlow Tasks.md
├─ frontend/
│  └─ src/
│     ├─ api/
│     ├─ app/            # router.jsx, providers.jsx, query-client.js
│     ├─ components/
│     ├─ constants/
│     ├─ features/       # applications/, auth/, dashboard/, events/
│     ├─ hooks/
│     ├─ pages/
│     └─ utils/
├─ .env.example
└─ .gitignore
```

> Cây thư mục trên là bản rút gọn để định hướng nhanh. Cấu trúc đầy đủ, chi tiết từng module và lý do tổ chức như vậy nằm trong `docs/ApplyFlow Architecture.md`.
