# System Status API - Backend Dashboard

## Tổng quan

API endpoint `/system/status` cung cấp thông tin chi tiết về trạng thái hệ thống backend, bao gồm:
- Thông số hệ thống (CPU, Memory, Storage)
- Trạng thái các dịch vụ (API, Database, Cache, Storage)
- Thống kê database
- Thời gian uptime

## Endpoint

```
GET http://localhost:3040/system/status
```

## Response Format

```json
{
  "status": "online",
  "timestamp": "2026-02-07T04:20:17.402Z",
  "uptime": {
    "seconds": 20,
    "formatted": "0 days 0 hours 0 minutes"
  },
  "system": {
    "runtime": "Bun",
    "version": "1.3.7",
    "platform": "win32",
    "nodeVersion": "v24.3.0"
  },
  "metrics": {
    "cpu": {
      "usage": 22.26,
      "status": "normal"
    },
    "memory": {
      "used": 11.45,
      "total": 9.83,
      "percentage": 116.54,
      "unit": "MB",
      "status": "warning"
    },
    "storage": {
      "used": 234,
      "unit": "MB",
      "status": "normal"
    }
  },
  "services": {
    "api": {
      "status": "online",
      "responseTime": "752ms",
      "uptime": "99.98%"
    },
    "database": {
      "status": "online",
      "responseTime": "588ms",
      "uptime": "99.99%",
      "type": "PostgreSQL"
    },
    "cache": {
      "status": "online",
      "responseTime": "8ms",
      "uptime": "99.95%"
    },
    "storage": {
      "status": "online",
      "responseTime": "23ms",
      "uptime": "99.97%",
      "type": "Cloudflare R2"
    }
  },
  "database": {
    "totalUsers": 2,
    "totalInspirations": 0,
    "totalClipboardItems": 15,
    "storageUsed": 234,
    "storageUnit": "MB"
  }
}
```

## Các trường dữ liệu

### Status
- `status`: Trạng thái tổng thể của hệ thống (`online`, `offline`, `error`)
- `timestamp`: Thời gian hiện tại (ISO 8601)

### Uptime
- `seconds`: Tổng số giây hệ thống đã chạy
- `formatted`: Định dạng dễ đọc (days, hours, minutes)

### System
- `runtime`: Runtime đang sử dụng (Bun)
- `version`: Phiên bản Bun
- `platform`: Hệ điều hành
- `nodeVersion`: Phiên bản Node.js tương thích

### Metrics
#### CPU
- `usage`: Phần trăm CPU đang sử dụng (%)
- `status`: Trạng thái (`normal`, `warning`, `critical`)

#### Memory
- `used`: Bộ nhớ đang sử dụng (MB)
- `total`: Tổng bộ nhớ (MB)
- `percentage`: Phần trăm sử dụng (%)
- `unit`: Đơn vị (MB)
- `status`: Trạng thái (`normal`, `warning`)

#### Storage
- `used`: Dung lượng đã sử dụng (MB)
- `unit`: Đơn vị (MB)
- `status`: Trạng thái

### Services
Mỗi service có:
- `status`: Trạng thái (`online`, `offline`, `degraded`)
- `responseTime`: Thời gian phản hồi (ms)
- `uptime`: Tỷ lệ uptime (%)
- `type`: Loại service (nếu có)

### Database
- `totalUsers`: Tổng số người dùng
- `totalInspirations`: Tổng số inspirations
- `totalClipboardItems`: Tổng số clipboard items
- `storageUsed`: Dung lượng database đã sử dụng (MB)
- `storageUnit`: Đơn vị (MB)

## Sử dụng

### Với curl
```bash
curl http://localhost:3040/system/status
```

### Với JavaScript/TypeScript
```typescript
const response = await fetch('http://localhost:3040/system/status');
const data = await response.json();
console.log(data);
```

### Với Frontend Dashboard
Endpoint này được thiết kế để sử dụng với giao diện admin dashboard tại:
```
http://localhost:3042/
```

## Ghi chú

- Một số metrics như CPU usage và storage hiện đang được simulate
- Để có số liệu chính xác hơn, cần cài đặt thêm các package monitoring
- API tự động cập nhật mỗi khi được gọi, không cần polling
