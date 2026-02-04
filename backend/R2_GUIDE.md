# 🔐 Hướng dẫn lấy Cloudflare R2 Credentials

## Bước 1: Đăng nhập Cloudflare
1. Truy cập: **https://dash.cloudflare.com/**
2. Đăng nhập bằng tài khoản của bạn (hoặc đăng ký miễn phí nếu chưa có)

## Bước 2: Truy cập R2
1. Sau khi đăng nhập, tìm **"R2"** ở thanh menu bên trái
2. Click vào **R2**

## Bước 3: Lấy Account ID
- Ngay trên trang R2, bạn sẽ thấy **Account ID** hiển thị ở góc phải hoặc trong URL
- Ví dụ URL: `dash.cloudflare.com/YOUR_ACCOUNT_ID/r2`
- Copy **Account ID** này

## Bước 4: Tạo API Token
1. Trên trang R2, tìm và click nút **"Manage R2 API Tokens"** (thường ở bên phải)
2. Click **"Create API token"**
3. Điền thông tin:
   - **Token name**: `buildproduct-media-token` (hoặc tên bạn muốn)
   - **Permissions**: Chọn **"Admin Read & Write"** hoặc **"Object Read & Write"**
   - **TTL**: Chọn **"Forever"** (không hết hạn)
4. Click **"Create API Token"**

## Bước 5: Copy Credentials (QUAN TRỌNG!)
Sau khi tạo token, bạn sẽ thấy 2 giá trị:
- **Access Key ID**: Một chuỗi ký tự dài
- **Secret Access Key**: Một chuỗi ký tự dài khác

⚠️ **LƯU Ý**: Secret Access Key chỉ hiển thị 1 lần duy nhất! Copy ngay cả 2 giá trị này.

## Bước 6: Tạo Bucket
1. Quay lại trang R2 chính
2. Click **"Create bucket"**
3. Đặt tên: `buildproduct-media`
4. Chọn location: **Asia Pacific (APAC)** (gần Việt Nam nhất)
5. Click **"Create bucket"**

## Bước 7: Lấy Public URL
1. Vào bucket `buildproduct-media` vừa tạo
2. Vào tab **"Settings"**
3. Tìm mục **"Public Access"** hoặc **"R2.dev subdomain"**
4. Click **"Allow Access"** hoặc **"Enable R2.dev subdomain"**
5. Copy URL hiển thị (dạng: `https://pub-xxxxx.r2.dev`)

## Bước 8: Cập nhật file .env
Mở file `backend/.env` và điền các giá trị vừa lấy:

```env
R2_ACCOUNT_ID=your_account_id_from_step_3
R2_ACCESS_KEY_ID=your_access_key_from_step_5
R2_SECRET_ACCESS_KEY=your_secret_key_from_step_5
R2_BUCKET_NAME=buildproduct-media
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## ✅ Hoàn tất!
Sau khi điền xong, backend sẽ có thể upload ảnh/file lên Cloudflare R2.

---

## 💰 Chi phí (Gói Free)
- **10 GB storage**: Miễn phí
- **1 triệu Class A operations/tháng**: Miễn phí
- **10 triệu Class B operations/tháng**: Miễn phí
- **Bandwidth (Egress)**: **MIỄN PHÍ HOÀN TOÀN** ⚡️

Đây là lý do R2 tốt hơn AWS S3 cho dự án startup!
