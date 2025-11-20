import "jsr:@std/dotenv/load";

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as bcrypt from 'npm:bcryptjs';
import * as jose from 'npm:jose';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));
app.use('*', logger(console.log));

// Handle OPTIONS explicitly
app.options('*', (c) => {
  return c.text('', 204);
});

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// JWT Secret
const JWT_SECRET = new TextEncoder().encode(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'secret');

// Helper: Generate JWT
async function generateToken(userId: string): Promise<string> {
  const token = await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  return token;
}

// Helper: Verify JWT
async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch {
    return null;
  }
}

// Helper: Ensure user exists in public.users table (to satisfy foreign keys)
async function ensureUserInPublicTable(userId: string) {
  try {
    // 1. Check if user exists in public.users
    const { data } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
    if (data) return;

    // 2. If not, fetch from KV
    const email = await kv.get(`user:id:${userId}`);
    if (!email) return;

    const user = await kv.get(`user:${email}`);
    if (!user) return;

    // 3. Insert into public.users
    // We use upsert to be safe against race conditions
    const { error } = await supabase.from('users').upsert({
      id: userId,
      email: user.email,
      name: user.name,
      created_at: user.createdAt || new Date().toISOString()
    });

    if (error) {
      console.warn('Warning: Could not sync user to public.users table:', error.message);
    } else {
      console.log('Synced user to public.users:', userId);
    }
  } catch (err) {
    console.error('Error in ensureUserInPublicTable:', err);
  }
}

// ===== AUTH ROUTES =====

// Register
app.post('/make-server/auth/register', async (c) => {
  try {
    console.log('Register request received');
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.text('Email and password required', 400);
    }

    // Check if user exists
    console.log('Checking if user exists:', email);
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.text('User already exists', 400);
    }

    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      email,
      name: name || '',
      passwordHash,
      createdAt: new Date().toISOString(),
      locale: 'vi',
      region: 'VN',
      comfortOnDefault: true,
      vibesPref: [],
    };

    console.log('Saving user to KV:', userId);
    await kv.set(`user:${email}`, user);
    await kv.set(`user:id:${userId}`, email);

    // Sync to public.users table
    console.log('Syncing to public.users...');
    await ensureUserInPublicTable(userId);

    // Generate token
    console.log('Generating token...');
    const token = await generateToken(userId);

    console.log('Registration successful:', userId);
    return c.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error: any) {
    console.error('Registration error details:', error);
    console.error('Stack trace:', error.stack);
    return c.text(error.message || 'Registration failed', 500);
  }
});

// Login
app.post('/make-server/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.text('Email and password required', 400);
    }

    // Get user
    const user = await kv.get(`user:${email}`);
    if (!user) {
      return c.text('Invalid credentials', 401);
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return c.text('Invalid credentials', 401);
    }

    // Sync to public.users table (in case it was missed or deleted)
    await ensureUserInPublicTable(user.id);

    // Generate token
    const token = await generateToken(user.id);

    return c.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.text(error.message || 'Login failed', 500);
  }
});

// ===== USER ROUTES =====

// Get user profile
app.get('/make-server/user/profile', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.text('Unauthorized', 401);
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return c.text('Unauthorized', 401);
    }

    const email = await kv.get(`user:id:${userId}`);
    const user = await kv.get(`user:${email}`);

    if (!user) {
      return c.text('User not found', 404);
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      locale: user.locale,
      region: user.region,
      comfortOnDefault: user.comfortOnDefault,
      vibesPref: user.vibesPref,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return c.text(error.message || 'Failed to get profile', 500);
  }
});

// Save movie
app.post('/make-server/user/save', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.text('Unauthorized', 401);
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return c.text('Unauthorized', 401);
    }

    const { movie_id } = await c.req.json();

    const saveId = crypto.randomUUID();
    const saved = {
      id: saveId,
      userId,
      movieId: movie_id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`saved:${userId}:${movie_id}`, saved);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Save movie error:', error);
    return c.text(error.message || 'Failed to save movie', 500);
  }
});

// Get saved movies
app.get('/make-server/user/saved', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.text('Unauthorized', 401);
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return c.text('Unauthorized', 401);
    }

    const savedMovies = await kv.getByPrefix(`saved:${userId}:`);

    return c.json(savedMovies || []);
  } catch (error: any) {
    console.error('Get saved movies error:', error);
    return c.text(error.message || 'Failed to get saved movies', 500);
  }
});

// Get history
app.get('/make-server/user/history', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.text('Unauthorized', 401);
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return c.text('Unauthorized', 401);
    }

    // Query user_history
    const { data: historyData, error: historyError } = await supabase
      .from('user_history')
      .select('id, movie_id, watched_at')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(50);

    if (historyError) {
      console.error('Supabase history error:', historyError);
      throw historyError;
    }

    if (!historyData || historyData.length === 0) {
      return c.json([]);
    }

    // Extract movie IDs
    const movieIds = historyData.map((item: any) => item.movie_id);

    // Query movies by IDs
    const { data: moviesData, error: moviesError } = await supabase
      .from('movies')
      .select('id, title, year, genre, poster_url, movie_overview')
      .in('id', movieIds);

    if (moviesError) {
      console.error('Supabase movies error:', moviesError);
      throw moviesError;
    }

    // Merge data
    const result = historyData.map((historyItem: any) => {
      const movie = moviesData?.find((m: any) => m.id === historyItem.movie_id);
      return {
        ...historyItem,
        movies: movie || null,
      };
    });

    return c.json(result);
  } catch (error: any) {
    console.error('Get history error:', error);
    return c.text(error.message || 'Failed to get history', 500);
  }
});

// Add history
app.post('/make-server/user/history', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.text('Unauthorized', 401);
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return c.text('Unauthorized', 401);
    }

    const { movie_id } = await c.req.json();

    // Ensure user exists in public.users before inserting history
    await ensureUserInPublicTable(userId);

    // Insert into Supabase
    const { error } = await supabase
      .from('user_history')
      .insert({
        user_id: userId,
        movie_id: movie_id,
        watched_at: new Date().toISOString()
      });

    if (error) {
      console.error('Supabase insert history error:', error);
      throw error;
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Add history error:', error);
    return c.text(error.message || 'Failed to add history', 500);
  }
});

// Delete history for a specific movie
app.delete('/make-server/user/history/:movie_id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.text('Unauthorized', 401);
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return c.text('Unauthorized', 401);
    }

    const movieId = c.req.param('movie_id');
    if (!movieId) {
      return c.text('Movie ID is required', 400);
    }

    // Delete all history records for this user and movie
    const { error } = await supabase
      .from('user_history')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    console.log('History deleted:', { userId, movieId });
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete history error:', error);
    return c.text(error.message || 'Failed to delete history', 500);
  }
});

// ===== LOGGING ROUTES =====

// Log decide (movie watch decision)
app.post('/make-server/log/decide', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const userId = token ? await verifyToken(token) : 'anonymous';

    const { movie_id, platform } = await c.req.json();

    const logId = crypto.randomUUID();
    const log = {
      id: logId,
      userId: userId || 'anonymous',
      movieId: movie_id,
      platform,
      type: 'decide',
      createdAt: new Date().toISOString(),
    };

    if (userId && userId !== 'anonymous') {
      await kv.set(`history:${userId}:${logId}`, log);
    }
    await kv.set(`log:decide:${logId}`, log);

    console.log('Decide log recorded:', { userId, movie_id, platform });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Decide log error:', error);
    return c.text(error.message || 'Failed to log decide', 500);
  }
});

// Log detail open
app.post('/make-server/log/detail', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const userId = token ? await verifyToken(token) : 'anonymous';

    const { movie_id } = await c.req.json();

    const logId = crypto.randomUUID();
    const log = {
      id: logId,
      userId: userId || 'anonymous',
      movieId: movie_id,
      type: 'detail',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`log:detail:${logId}`, log);

    console.log('Detail log recorded:', { userId, movie_id });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Detail log error:', error);
    return c.text(error.message || 'Failed to log detail', 500);
  }
});

// ===== EMOTIONAL JOURNEY =====

app.post('/make-server/emotional-journey', async (c) => {
  try {
    const { mood_now, mood_target } = await c.req.json();

    // This would normally call an LLM for personalized recommendations
    // For now, return mock data
    const journey = {
      release: {
        title: 'Everything Everywhere All at Once',
        reason: 'Giải phóng cảm xúc qua hành động và màu sắc',
      },
      reflect: {
        title: 'The Farewell',
        reason: 'Suy ngẫm về gia đình và tình cảm',
      },
      rebuild: {
        title: 'Little Miss Sunshine',
        reason: 'Xây dựng lại niềm tin và hy vọng',
      },
    };

    console.log('Emotional journey generated:', { mood_now, mood_target });

    return c.json(journey);
  } catch (error: any) {
    console.error('Emotional journey error:', error);
    return c.text(error.message || 'Failed to generate journey', 500);
  }
});

// ===== PARTY MODE =====

app.post('/make-server/party-suggest', async (c) => {
  try {
    const { members } = await c.req.json();

    // This would normally analyze moods and call an LLM
    // For now, return mock data
    const suggestions = [
      { title: 'The Grand Budapest Hotel', match: 92 },
      { title: 'Parasite', match: 88 },
    ];

    console.log('Party suggestions generated:', { memberCount: members.length });

    return c.json(suggestions);
  } catch (error: any) {
    console.error('Party suggest error:', error);
    return c.text(error.message || 'Failed to generate suggestions', 500);
  }
});

// ===== AI ANALYSIS ROUTES =====

// Helper: Mock AI analysis (replace with actual HyperCLOVA X or LLM API)
async function analyzeMoodText(text: string): Promise<any> {
  // This is a mock implementation. Replace with actual AI API call.
  // For production, integrate with HyperCLOVA X or OpenAI API

  // Simple keyword-based analysis for demo
  const lowerText = text.toLowerCase();

  let detectedMood = {
    primary: 'neutral',
    emotions: [] as string[],
    intensity: 0.5,
  };

  if (lowerText.includes('vui') || lowerText.includes('hạnh phúc') || lowerText.includes('tự hào')) {
    detectedMood.primary = 'happy';
    detectedMood.emotions = ['joy', 'pride', 'contentment'];
    detectedMood.intensity = 0.8;
  } else if (lowerText.includes('buồn') || lowerText.includes('cô đơn') || lowerText.includes('chán')) {
    detectedMood.primary = 'sad';
    detectedMood.emotions = ['melancholy', 'loneliness', 'emptiness'];
    detectedMood.intensity = 0.7;
  } else if (lowerText.includes('căng thẳng') || lowerText.includes('lo lắng') || lowerText.includes('stress')) {
    detectedMood.primary = 'anxious';
    detectedMood.emotions = ['anxiety', 'stress', 'tension'];
    detectedMood.intensity = 0.75;
  } else if (lowerText.includes('bối rối') || lowerText.includes('không biết')) {
    detectedMood.primary = 'confused';
    detectedMood.emotions = ['confusion', 'uncertainty', 'indecision'];
    detectedMood.intensity = 0.6;
  } else if (lowerText.includes('nhàm chán') || lowerText.includes('thoát')) {
    detectedMood.primary = 'bored';
    detectedMood.emotions = ['boredom', 'restlessness', 'desire'];
    detectedMood.intensity = 0.65;
  }

  return detectedMood;
}

// Emotional Journey - AI text analysis
app.post('/make-server/analyze-emotional-journey', async (c) => {
  try {
    const { moodText } = await c.req.json();

    if (!moodText || !moodText.trim()) {
      return c.text('Mood text is required', 400);
    }

    console.log('Analyzing emotional journey from text:', moodText.substring(0, 100));

    // Analyze mood (replace with actual AI)
    const analysis = await analyzeMoodText(moodText);

    // Generate journey based on analysis
    const journey = {
      release: {
        title: 'Everything Everywhere All at Once',
        year: '2022',
        poster: 'https://images.unsplash.com/photo-1655367574486-f63675dd69eb?w=400',
        vignette: 'Một người phụ nữ bình thường khám phá vô số vũ trụ song song, mang theo cảm xúc hỗn loạn nhưng đầy màu sắc. Hành trình giải phóng cảm xúc qua những tình huống phi thường.',
        quote: 'Trong vô vàn vũ trụ, tôi chọn yêu bạn.',
        spectrum: { calm: 20, warm: 60, hopeful: 70, nostalgic: 30, bittersweet: 40, intense: 90 },
      },
      reflect: {
        title: 'The Farewell',
        year: '2019',
        poster: 'https://images.unsplash.com/photo-1677741446873-bd348677e530?w=400',
        vignette: 'Một gia đình Trung Quốc tổ chức đám cưới giả để tạm biệt bà nội đang mắc bệnh. Khoảnh khắc suy ngẫm về gia đình, sự dối trá tử tế, và tình yêu thương.',
        quote: 'Đôi khi, tình yêu là giữ bí mật.',
        spectrum: { calm: 40, warm: 80, hopeful: 50, nostalgic: 85, bittersweet: 90, intense: 30 },
      },
      rebuild: {
        title: 'Little Miss Sunshine',
        year: '2006',
        poster: 'https://images.unsplash.com/photo-1588852112013-6b63362bc583?w=400',
        vignette: 'Một gia đình rối loạn cùng nhau lên đường đưa cô con gái nhỏ đến cuộc thi sắc đẹp. Hài hước, ấm áp, và đầy hy vọng về sức mạnh của sự đoàn kết.',
        quote: 'Chúng ta không thất bại, chỉ là chưa thắng.',
        spectrum: { calm: 60, warm: 90, hopeful: 95, nostalgic: 50, bittersweet: 30, intense: 20 },
      },
    };

    // Customize based on detected mood
    if (analysis.primary === 'happy') {
      journey.rebuild.title = 'Amélie';
      journey.rebuild.year = '2001';
    }

    console.log('Emotional journey generated based on mood:', analysis.primary);

    return c.json(journey);
  } catch (error: any) {
    console.error('Analyze emotional journey error:', error);
    return c.text(error.message || 'Failed to analyze emotional journey', 500);
  }
});

// Party Mode - AI text analysis
app.post('/make-server/analyze-party-mood', async (c) => {
  try {
    const { members } = await c.req.json();

    if (!members || !Array.isArray(members) || members.length < 2) {
      return c.text('At least 2 members required', 400);
    }

    console.log('Analyzing party mood for', members.length, 'members');

    // Analyze each member's mood
    const analyses = await Promise.all(
      members.map(async (member: any) => ({
        name: member.name,
        analysis: await analyzeMoodText(member.moodText || ''),
      }))
    );

    // Find common ground (simplified logic)
    const primaryMoods = analyses.map(a => a.analysis.primary);
    const avgIntensity = analyses.reduce((sum, a) => sum + a.analysis.intensity, 0) / analyses.length;

    console.log('Party mood analysis:', { primaryMoods, avgIntensity });

    // Generate recommendations based on common ground
    const recommendations = [
      {
        id: 1,
        title: 'The Grand Budapest Hotel',
        year: '2014',
        poster: 'https://images.unsplash.com/photo-1628336707631-68131ca720c3?w=400',
        vibes: ['Quirky', 'Colorful', 'Nostalgic'],
        rating: 8.1,
        matchScore: 92,
        reason: `Phù hợp với mood của ${members.map((m: any) => m.name).join(', ')}. Câu chuyện độc đáo với phong cách hình ảnh đẹp mắt, cân bằng giữa hài hước và cảm xúc.`,
      },
      {
        id: 2,
        title: 'Parasite',
        year: '2019',
        poster: 'https://images.unsplash.com/photo-1655367574486-f63675dd69eb?w=400',
        vibes: ['Thrilling', 'Dark Comedy', 'Social'],
        rating: 8.5,
        matchScore: 88,
        reason: 'Kết hợp hài hước đen và kịch tính, phù hợp cho những ai muốn trải nghiệm cảm xúc phong phú và sâu sắc.',
      },
    ];

    // Customize based on group mood
    if (primaryMoods.includes('happy') && avgIntensity > 0.7) {
      recommendations[0].matchScore = 95;
      recommendations[0].reason = `Nhóm của bạn đang trong trạng thái tích cực! ${recommendations[0].reason}`;
    }

    return c.json({ recommendations });
  } catch (error: any) {
    console.error('Analyze party mood error:', error);
    return c.text(error.message || 'Failed to analyze party mood', 500);
  }
});

// Character Match - AI analysis
app.post('/make-server/analyze-character-match', async (c) => {
  try {
    const { moodText } = await c.req.json();

    if (!moodText || !moodText.trim()) {
      return c.text('Mood text is required', 400);
    }

    console.log('Analyzing character match from text:', moodText.substring(0, 100));

    // Analyze mood
    const analysis = await analyzeMoodText(moodText);

    // Generate character match (this would ideally use a more sophisticated AI)
    let match = {
      movie: {
        title: 'Amélie',
        year: '2001',
        poster: 'https://images.unsplash.com/photo-1655367574486-f63675dd69eb?w=400',
        rating: 8.3,
        character: 'Amélie Poulain',
        characterDescription: 'Một cô gái trẻ với trí tưởng tượng phong phú, luôn tìm cách làm cho cuộc sống của người khác tốt đẹp hơn. Cô sống trong thế giới riêng nhưng đầy tử tế và nhiệt tình.',
        similarity: 87,
        whyMatch: 'Giống bạn, Amélie có trái tim nhân hậu và luôn muốn mang lại điều tốt đẹp cho người khác. Cô cảm thấy hạnh phúc khi giúp đỡ người khác, giống như cách bạn cảm thấy khi trả lại tiền cho người đánh mất.',
        vignette: 'Amélie tìm thấy hộp kỷ vật cũ và quyết tâm trả lại cho chủ nhân. Khi nhìn thấy niềm vui của người đàn ông già, cô nhận ra sứ mệnh của mình.',
        quote: 'Hạnh phúc nhỏ nhoi cũng là hạnh phúc.',
        spectrum: { calm: 60, warm: 95, hopeful: 90, nostalgic: 65, bittersweet: 30, intense: 20 },
      },
    };

    // Customize based on detected mood
    if (analysis.primary === 'confused') {
      match.movie.title = 'Lost in Translation';
      match.movie.character = 'Charlotte';
      match.movie.characterDescription = 'Một phụ nữ trẻ đang tìm kiếm ý nghĩa cuộc sống, cảm thấy lạc lõng trong một thành phố xa lạ và trong chính cuộc đời mình.';
      match.movie.whyMatch = 'Giống bạn, Charlotte đang đối mặt với những quyết định khó khăn và cảm giác bối rối về hướng đi của cuộc đời. Cô dần tìm thấy sự kết nối và ý nghĩa qua những mối quan hệ bất ngờ.';
      match.movie.similarity = 89;
    } else if (analysis.primary === 'bored') {
      match.movie.title = 'The Secret Life of Walter Mitty';
      match.movie.character = 'Walter Mitty';
      match.movie.characterDescription = 'Một nhân viên văn phòng sống cuộc sống nhàm chán, luôn mơ về những cuộc phiêu lưu. Một ngày, anh quyết định bước ra khỏi vùng an toàn.';
      match.movie.whyMatch = 'Như bạn, Walter cảm thấy cuộc sống đang lặp đi lặp lại và khao khát điều gì đó mới mẻ. Hành trình của anh là nguồn cảm hứng để bạn dám thay đổi.';
      match.movie.similarity = 91;
    } else if (analysis.primary === 'sad') {
      match.movie.title = 'A Werewolf Boy';
      match.movie.character = 'Soon-yi';
      match.movie.characterDescription = 'Một cô gái tìm thấy tình bạn và tình yêu thuần khiết trong hoàn cảnh cô đơn. Cô học cách yêu thương và được yêu thương bất chấp mọi khó khăn.';
      match.movie.whyMatch = 'Giống bạn, Soon-yi trải qua những cảm xúc sâu sắc về sự mất mát và cô đơn, nhưng cũng tìm thấy hy vọng và ấm áp trong tình yêu thương.';
      match.movie.similarity = 85;
    }

    console.log('Character match generated:', match.movie.character);

    return c.json(match);
  } catch (error: any) {
    console.error('Analyze character match error:', error);
    return c.text(error.message || 'Failed to analyze character match', 500);
  }
});

// ===== RECOMMENDATION ROUTES =====

// Personal Recommendation Endpoint
app.post('/make-server/recommend/personal', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.text('Unauthorized', 401);
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return c.text('Unauthorized', 401);
    }

    // 1. Get User History (Last 5 movies) with their moods
    const { data: history, error: historyError } = await supabase
      .from('user_history')
      .select(`
        movie_id,
        movies (
          id,
          mood
        )
      `)
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(5);

    if (historyError) {
      console.error('History fetch error:', historyError);
      throw historyError;
    }

    // 1b. Get ALL watched movie IDs to exclude them
    const { data: allWatched, error: watchedError } = await supabase
      .from('user_history')
      .select('movie_id')
      .eq('user_id', userId);

    const allWatchedIds = allWatched ? allWatched.map((h: any) => h.movie_id) : [];
    console.log(`User ${userId} has watched ${allWatchedIds.length} movies.`);
    console.log('Watched IDs to exclude:', allWatchedIds);

    // Helper to get random movies excluding watched
    const getRandomMovies = async (limit: number, excludeIds: string[]) => {
      console.log(`Getting random movies, excluding ${excludeIds.length} watched IDs`);
      let q = supabase.from('movies').select('*');
      if (excludeIds.length > 0) {
        // Format for PostgREST: ("id1","id2","id3")
        const formattedIds = `(${excludeIds.map(id => `"${id}"`).join(',')})`;
        q = q.not('id', 'in', formattedIds);
      }
      const { data, error } = await q.limit(limit);
      if (error) {
        console.error('Random movies query error:', error);
      }
      console.log(`Random movies returned: ${data?.length || 0} movies`);
      return data || [];
    };

    if (!history || history.length === 0) {
      // Fallback for new users
      return c.json(await getRandomMovies(10, allWatchedIds));
    }

    // 2. Extract Moods
    // Log each movie's mood for debugging
    console.log('Recent 5 movies with their moods:');
    history.forEach((h: any, index: number) => {
      console.log(`  ${index + 1}. Movie ID: ${h.movie_id}, Mood: ${JSON.stringify(h.movies?.mood || null)}`);
    });

    // Flatten all moods from the history and remove duplicates
    const allMoods = history
      .flatMap((h: any) => h.movies?.mood || [])
      .filter((m: string) => m); // Filter out null/undefined/empty

    const uniqueMoods = [...new Set(allMoods)];

    console.log('User recent moods (unique):', uniqueMoods);

    if (uniqueMoods.length === 0) {
      // If no moods found in history, fallback to random (excluding watched)
      console.log('No moods found, returning random movies');
      return c.json(await getRandomMovies(10, allWatchedIds));
    }

    // 3. Find similar movies based on Mood Tags
    // We look for movies that have at least one of the mood tags
    // And exclude movies the user has already watched
    console.log('Searching for movies with moods:', uniqueMoods);
    let query = supabase
      .from('movies')
      .select('*')
      .overlaps('mood', uniqueMoods); // Requires 'mood' column to be TEXT[]

    // Exclude watched movies if any
    if (allWatchedIds.length > 0) {
      // Format for PostgREST: ("id1","id2","id3")
      const formattedIds = `(${allWatchedIds.map(id => `"${id}"`).join(',')})`;
      query = query.not('id', 'in', formattedIds);
    }

    const { data: recommendations, error: recError } = await query.limit(10);

    if (recError) {
      console.error('Recommendation search error:', recError);
      // Fallback to random only on error
      return c.json(await getRandomMovies(10, allWatchedIds));
    }

    console.log(`Found ${recommendations?.length || 0} movies matching mood tags`);

    // If recommendations are empty (e.g. watched all matching mood movies), fallback to random
    if (!recommendations || recommendations.length === 0) {
      console.log('No mood-matched movies found, returning random movies');
      return c.json(await getRandomMovies(10, allWatchedIds));
    }

    return c.json(recommendations);
  } catch (error: any) {
    console.error('Recommendation error:', error);
    return c.text(error.message || 'Failed to generate recommendations', 500);
  }
});

// Health check
app.get('/make-server/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
