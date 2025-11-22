
# 🎬 Emotional Movie Recommendation App

#### Ứng dụng gợi ý phim theo cảm xúc.  

## 🚀 Cách chạy dự án

### Phương pháp 1: Sử dụng Docker Compose (Khuyến nghị)

#### 1. Chuẩn bị file môi trường

Tạo file `.env` trong thư mục gốc với các biến sau:

```bash
SUPABASE_URL=https://wuvynyiopwzwtesbiojf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
CLOVA_API_KEY=your_clova_api_key_here
TMDB_API_KEY=your_TMDB_API_KEY_here
```


#### 2. Chạy ứng dụng với Docker Compose

```bash
docker-compose up -d
```

Sau khi chạy thành công:
- **Backend Server**: http://localhost:8000
- **Frontend**: http://localhost:8080

#### 3. Các lệnh Docker Compose hữu ích

```bash
# Xem logs
docker-compose logs -f

# Dừng các container
docker-compose down

# Rebuild và chạy lại
docker-compose up -d --build

# Xem trạng thái các container
docker-compose ps
```

---

### Phương pháp 2: Chạy thủ công (Development)

#### 1. Cài đặt thư viện
```bash
npm i
```

#### 2. Lấy dữ liệu phim từ database

```bash
cd supabase
npx tsx seed/movies.ts
```

#### 3. Chạy server Deno (làm trung gian kết nối Supabase)

```bash
deno run -A src/supabase/functions/server/index.tsx
```

#### 4. Chạy frontend

```bash
npm run dev
```

---

## 🏗️ Build và deploy

### 1. Deploy Deno functions lên Supabase

```bash
supabase functions deploy make-server-0c50a72d
```

### 2. Build frontend (sử dụng biến môi trường trong `.env.production`)

```bash
npm run build
```

### 3. Deploy frontend lên Vercel hoặc Netlify

```bash
...
```

---

## 💡 Ghi chú

* Mỗi khi thay đổi dữ liệu phim trong database, có thể chạy lại:

  ```bash
  npx tsx seed/movies.ts
  ```
* Nếu gặp lỗi kết nối, kiểm tra lại URL và Anon Key trong file `.env`
* Khi sử dụng Docker Compose, đảm bảo Docker và Docker Compose đã được cài đặt
* Các container sẽ tự động restart nếu bị crash (restart: unless-stopped)

---

✨ **Nhóm phát triển:** Movie Recommendation Team

🛠️ **Công nghệ:** React, Supabase, Deno, Docker


