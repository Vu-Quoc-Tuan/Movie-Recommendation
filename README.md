
  # Emotional Movie Recommendation App

  This is a code bundle for Emotional Movie Recommendation App. The original project is available at https://www.figma.com/design/DlKmUhNCyRxZS7rEFEIlWI/Emotional-Movie-Recommendation-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

## lấy phim
  cd D:\Coding\github\Movie-Recommendation\supabase
  npx tsx seed/movies.ts
## chạy denoi server -> để lm trung gian connect với supabase ( nếu đjc thì chuyển về nodejs )
  cd D:\Coding\github\Movie-Recommendation
  deno run -A src/supabase/functions/server/index.tsx

## chạy FE
  npm run dev



khi build
sửa
  # 1. Deploy Deno functions lên Supabase
supabase functions deploy make-server-0c50a72d

# 2. Build frontend (tự động dùng .env.production)
npm run build

# 3. Deploy frontend lên Vercel/Netlify/...