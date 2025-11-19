
# 🎬 Emotional Movie Recommendation App

#### Ứng dụng gợi ý phim theo cảm xúc.  

## 🚀 Cách chạy dự án

### 1. Cài đặt thư viện
```bash
npm i
````

### 2. Lấy dữ liệu phim từ database

```bash
cd D:\Coding\github\Movie-Recommendation\supabase 
#or cd supabase
npx tsx seed/movies.ts
```

### 3. Chạy server Deno (làm trung gian kết nối Supabase)

```bash
cd D:\Coding\github\Movie-Recommendation
#or cd ../
deno run -A server/functions/make-server/index.tsx
```

### 4. Chạy frontend

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

---

✨ **Nhóm phát triển:** Movie Recommendation Team

🛠️ **Công nghệ:** React, Supabase, Deno


