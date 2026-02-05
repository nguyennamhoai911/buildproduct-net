# Hướng dẫn Deploy Backend (Bun + ElysiaJS)

Backend này được xây dựng trên **Bun** runtime và framework **ElysiaJS**. Dưới đây là các phương án deploy tốt nhất:

## 1. Render.com (Khuyên dùng)
Render hỗ trợ **Native Bun**, rất dễ cấu hình và có gói Free.

1. Đẩy code lên **GitHub**.
2. Truy cập [Render Dashboard](https://dashboard.render.com/).
3. Tạo **New Web Service**.
4. Kết nối với repo GitHub của bạn.
5. Cấu hình:
   - **Runtime**: Chọn `Bun`.
   - **Build Command**: `bun install`
   - **Start Command**: `bun run src/index.ts`
6. Vào mục **Environment**, thêm các biến môi trường từ file `.env` (DATABASE_URL, R2_..., JWT_SECRET, ...).

## 2. Railway.app
Railway rất mạnh mẽ và ổn định.

1. Truy cập [Railway](https://railway.app/).
2. Tạo **New Project** -> **Deploy from GitHub repo**.
3. Railway thường sẽ tự động phát hiện `Dockerfile` hoặc `package.json`.
   - Nếu dùng Docker (đã có file `Dockerfile` trong folder này): Railway sẽ tự build.
   - Nếu dùng Nixpacks: Cấu hình Start Command là `bun run src/index.ts`.
4. Thêm biến môi trường trong mục **Variables**.

## 3. Fly.io (Advanced)
Thích hợp nếu muốn server server ở gần người dùng (Edge).

1. Cài đặt `flyctl` CLI.
2. Chạy `fly launch` trong folder `backend`.
3. Nó sẽ sử dụng `Dockerfile` để build image.
4. Chọn region (ví dụ `sin` - Singapore cho gần VN).

## 4. VPS (Ubuntu/Debian) với Docker
Nếu bạn có VPS riêng (DigitalOcean, Hetzner...):

1. Cài Docker trên VPS.
2. Build image: `docker build -t buildproduct-backend .`
3. Chạy container:
   ```bash
   docker run -d \
     -p 3040:3040 \
     --env-file .env \
     --name backend \
     buildproduct-backend
   ```

---
## Lưu ý quan trọng
- **Database**: Backend đang kết nối tới **Neon (PostgreSQL)**. Đảm bảo server deploy có thể kết nối internet tới Neon.
- **Storage**: Backend kết nối tới **Cloudflare R2**.
- **Environment Variables**: Đừng quên copy toàn bộ nội dung file `.env` vào phần cài đặt môi trường (Environment Variables) của nơi deploy.
