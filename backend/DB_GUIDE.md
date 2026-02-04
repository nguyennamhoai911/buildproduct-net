# Hướng dẫn lấy Database PostgreSQL miễn phí & tốt nhất (Khuyên dùng Neon.tech)

Dự án này sử dụng **PostgreSQL** để đạt hiệu năng cao nhất.

### Cách 1: Sử dụng Cloud (Khuyên dùng - Nhanh & Ổn định)
1. Truy cập [Neon.tech](https://neon.tech) (Serverless Postgres ngon nhất hiện nay).
2. Đăng ký/Đăng nhập bằng tài khoản Github hoặc Google.
3. Tạo mới một Project (đặt tên ví dụ `buildproduct`).
4. Ngay tại Dashboard, bạn sẽ thấy mục **Connection String**.
5. Copy chuỗi đó (có dạng `postgres://...`).
6. Dán vào file `backend/.env` mục `DATABASE_URL`.

### Cách 2: Cài đặt Local (Chạy trên máy tính của bạn)
1. Tải và cài đặt [PostgreSQL](https://www.postgresql.org/download/windows/) cho Windows.
2. Mở **pgAdmin** (đi kèm khi cài đặt) hoặc dùng CMD.
3. Tạo database mới tên là `buildproduct`.
4. Chuỗi kết nối sẽ là: `postgresql://postgres:MAT_KHAU_CUA_BAN@localhost:5432/buildproduct`
