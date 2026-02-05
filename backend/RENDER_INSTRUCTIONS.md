# Hướng dẫn chi tiết Deploy lên Render.com

Dưới đây là các bước cụ thể để deploy backend (Bun) của bạn lên Render.

## Bước 1: Chuẩn bị Code
1. Đảm bảo bạn đã commit và push tất cả code mới nhất lên **GitHub**.
   > Bạn cần push cả file `Dockerfile` và `bun.lock` (nếu có) lên.

## Bước 2: Tạo Web Service trên Render
1. Truy cập [Render Dashboard](https://dashboard.render.com/) và đăng nhập.
2. Nhấn nút **New +** và chọn **Web Service**.
3. Chọn tùy chọn **Build and deploy from a Git repository**.
4. Kết nối tài khoản GitHub (nếu chưa) và chọn repository `buildproduct-net` (hoặc tên repo của bạn).

## Bước 3: Cấu hình Service (Quan trọng)
Điền các thông tin như sau:

| Mục | Giá trị | Giải thích |
|---|---|---|
| **Name** | `buildproduct-backend` | Tên service của bạn |
| **Region** | `Singapore (Southeast Asia)` | Chọn Singapore cho gần VN nhất |
| **Branch** | `main` (hoặc `master`) | Nhánh code bạn muốn deploy |
| **Root Directory** | `backend` | **QUAN TRỌNG**: Vì code backend nằm trong thư mục con |
| **Runtime** | `Bun` | Render hỗ trợ Bun native |
| **Build Command** | `bun install` | Lệnh cài đặt thư viện |
| **Start Command** | `bun run src/index.ts` | Lệnh chạy server |
| **Instance Type** | `Free` | Chọn gói miễn phí để bắt đầu |

## Bước 4: Cài đặt Biến môi trường (Environment Variables)
Backend của bạn cần kết nối Database và R2, nên bắt buộc phải có biến môi trường.

1. Kéo xuống mục **Environment Variables**.
2. Nhấn **Add Environment Variable** cho từng dòng trong file `backend/.env`.
3. Hoặc nhanh hơn: Nhấn nút **Add from .env** và copy toàn bộ nội dung file `backend/.env` dán vào.

**Danh sách các biến cần thiết:**
- `DATABASE_URL` (Lấy từ Neon Check)
- `JWT_SECRET`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

## Bước 5: Deploy
1. Sau khi điền xong, nhấn nút **Create Web Service**.
2. Chờ Render build và chạy. Bạn có thể xem tab **Logs** để thấy quá trình.
3. Khi thấy dòng `🦊 Elysia is running at ...` nghĩa là thành công!

## Bước 6: Lấy URL Backend
- Sau khi deploy xong, Render sẽ cấp cho bạn một URL có dạng `https://buildproduct-backend.onrender.com`.
- Hãy quay lại frontend (file `.env.local` hoặc source code) và cập nhật đường dẫn API để trỏ về URL mới này.
