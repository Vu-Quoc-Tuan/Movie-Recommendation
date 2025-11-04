export interface Movie {
  id: number;
  title: string;
  year: number;
  poster: string;
  rating: number;
  vibes: string[];
  spectrum: {
    calm: number;
    warm: number;
    hopeful: number;
    nostalgic: number;
    bittersweet: number;
    intense: number;
  };
  overview: string;
  whyFitsVibe: string;
  whyMatchesMood: string;
  vignette: string;
  quote: string;
  runtime: number;
  weatherMatch: number;
  comfortBadge?: string;
  ostLink: string;
  trailerYoutubeId: string;
  whereToWatch: { [key: string]: string };
  genres: string[];
  region: string;
}

const sampleMovies: Movie[] = [
  {
    id: 1,
    title: 'Your Name',
    year: 2016,
    poster: 'https://images.unsplash.com/photo-1655367574486-f63675dd69eb?w=400',
    rating: 8.4,
    vibes: ['Nostalgic', 'Romantic', 'Dreamy'],
    spectrum: { calm: 40, warm: 85, hopeful: 90, nostalgic: 95, bittersweet: 60, intense: 30 },
    overview: 'Hai thiếu niên kết nối qua giấc mơ, hoán đổi thân xác và dần khám phá một mối liên kết sâu sắc vượt qua thời gian và không gian.',
    whyFitsVibe: 'Kết hợp hoàn hảo giữa lãng mạn và hoài niệm với hình ảnh đẹp lung linh',
    whyMatchesMood: 'Phim phù hợp khi bạn muốn tìm cảm giác ấm áp, lãng mạn và đầy hy vọng.',
    vignette: 'Hoàng hôn ở Tokyo, ánh sáng vàng chiếu qua cửa sổ. Taki nhìn vào gương, nhưng khuôn mặt phản chiếu lại không phải của mình.',
    quote: 'Dù ở đâu, tôi sẽ tìm thấy em.',
    runtime: 106,
    weatherMatch: 75,
    comfortBadge: 'Positive ending, No heavy trauma',
    ostLink: 'https://spotify.com',
    trailerYoutubeId: 'xU47nhruN-Q',
    whereToWatch: { Netflix: '#', Viki: '#', YouTube: '#' },
    genres: ['Romance', 'Animation', 'Fantasy'],
    region: 'JP',
  },
  {
    id: 2,
    title: 'Midnight in Paris',
    year: 2011,
    poster: 'https://images.unsplash.com/photo-1588852112013-6b63362bc583?w=400',
    rating: 7.7,
    vibes: ['Cozy', 'Nostalgic', 'Wholesome'],
    spectrum: { calm: 70, warm: 80, hopeful: 70, nostalgic: 95, bittersweet: 50, intense: 15 },
    overview: 'Một nhà văn du lịch đến Paris và phát hiện ra anh có thể du hành về quá khứ vào nửa đêm, gặp gỡ những nghệ sĩ nổi tiếng.',
    whyFitsVibe: 'Cảm giác ấm áp, hoài niệm về thời hoàng kim nghệ thuật',
    whyMatchesMood: 'Lý tưởng cho những ai yêu nghệ thuật, lịch sử và muốn trốn vào một thế giới đẹp hơn.',
    vignette: 'Chiếc xe cổ xuất hiện trong đêm mưa Paris. Gil bước lên và nhận ra mình đã quay về những năm 1920.',
    quote: 'Quá khứ luôn đẹp hơn hiện tại.',
    runtime: 94,
    weatherMatch: 88,
    ostLink: 'https://spotify.com',
    trailerYoutubeId: 'BYwxUhPjdYY',
    whereToWatch: { 'Amazon Prime': '#', 'Apple TV': '#' },
    genres: ['Romance', 'Comedy', 'Fantasy'],
    region: 'US',
  },
  {
    id: 3,
    title: 'A Werewolf Boy',
    year: 2012,
    poster: 'https://images.unsplash.com/photo-1677741446873-bd348677e530?w=400',
    rating: 7.3,
    vibes: ['Heartwarming', 'Bittersweet', 'Quiet Romance'],
    spectrum: { calm: 50, warm: 90, hopeful: 60, nostalgic: 80, bittersweet: 85, intense: 25 },
    overview: 'Một cô gái gặp một cậu bé sói hoang dã và dần dạy cậu sống như con người. Câu chuyện tình yêu thuần khiết và đầy xúc động.',
    whyFitsVibe: 'Tình cảm chân thành, êm dịu nhưng đầy cảm xúc',
    whyMatchesMood: 'Phù hợp khi bạn muốn một câu chuyện tình đơn giản nhưng sâu sắc.',
    vignette: 'Chul-soo học cách nói "Soon-yi" lần đầu tiên. Ánh mắt cậu trong sáng như một đứa trẻ mới sinh.',
    quote: 'Tôi sẽ đợi em, dù phải đợi bao lâu.',
    runtime: 122,
    weatherMatch: 82,
    comfortBadge: 'No violence',
    ostLink: 'https://spotify.com',
    trailerYoutubeId: '6X2bFvG8ATs',
    whereToWatch: { Netflix: '#', Viki: '#' },
    genres: ['Romance', 'Drama', 'Fantasy'],
    region: 'KR',
  },
  {
    id: 4,
    title: 'Little Forest',
    year: 2018,
    poster: 'https://images.unsplash.com/photo-1588852112013-6b63362bc583?w=400',
    rating: 7.2,
    vibes: ['Slow-life', 'Cozy', 'Wholesome'],
    spectrum: { calm: 95, warm: 75, hopeful: 60, nostalgic: 70, bittersweet: 40, intense: 5 },
    overview: 'Hye-won trở về làng quê, tự tay nấu những món ăn theo mùa và từ từ tìm lại bình yên trong tâm hồn.',
    whyFitsVibe: 'Nhịp sống chậm, gần gũi với thiên nhiên và ẩm thực',
    whyMatchesMood: 'Hoàn hảo khi bạn cần nghỉ ngơi, thư giãn và tìm lại sự cân bằng.',
    vignette: 'Hye-won thu hoạch cà chua trong vườn. Ánh nắng ban mai chiếu rọi, mọi thứ yên bình đến lạ kỳ.',
    quote: 'Cuộc sống chậm lại, và tôi học cách thở.',
    runtime: 103,
    weatherMatch: 90,
    comfortBadge: 'Positive vibes only',
    ostLink: 'https://spotify.com',
    trailerYoutubeId: 'BeQdCvL_W8w',
    whereToWatch: { Netflix: '#', Viki: '#' },
    genres: ['Drama', 'Slice of Life'],
    region: 'KR',
  },
  {
    id: 5,
    title: 'Amelie',
    year: 2001,
    poster: 'https://images.unsplash.com/photo-1655367574486-f63675dd69eb?w=400',
    rating: 8.3,
    vibes: ['Quirky', 'Heartwarming', 'Uplifting'],
    spectrum: { calm: 60, warm: 95, hopeful: 90, nostalgic: 65, bittersweet: 30, intense: 20 },
    overview: 'Amélie, một cô gái có trí tưởng tượng phong phú, quyết định thay đổi cuộc sống của những người xung quanh mình theo cách tốt đẹp nhất.',
    whyFitsVibe: 'Độc đáo, ấm áp và đầy màu sắc',
    whyMatchesMood: 'Lý tưởng khi bạn muốn cảm thấy nhẹ nhõm và lạc quan hơn.',
    vignette: 'Amélie nhìn vào tấm ảnh cũ, quyết định tìm chủ nhân để trả lại kỷ niệm tuổi thơ.',
    quote: 'Hạnh phúc nhỏ nhoi cũng là hạnh phúc.',
    runtime: 122,
    weatherMatch: 70,
    comfortBadge: 'Feel-good movie',
    ostLink: 'https://spotify.com',
    trailerYoutubeId: 'HUECWi5pX7o',
    whereToWatch: { Netflix: '#', 'Amazon Prime': '#' },
    genres: ['Romance', 'Comedy'],
    region: 'EU',
  },
  {
    id: 6,
    title: 'Eternal Sunshine',
    year: 2004,
    poster: 'https://images.unsplash.com/photo-1677741446873-bd348677e530?w=400',
    rating: 8.3,
    vibes: ['Bittersweet', 'Introspective', 'Melancholic'],
    spectrum: { calm: 40, warm: 50, hopeful: 55, nostalgic: 90, bittersweet: 95, intense: 60 },
    overview: 'Sau khi chia tay, Joel phát hiện Clementine đã xóa ký ức về anh. Anh cũng quyết định làm điều tương tự.',
    whyFitsVibe: 'Sâu sắc, đầy cảm xúc về tình yêu và ký ức',
    whyMatchesMood: 'Cho những ai muốn khám phá cảm xúc phức tạp về tình yêu.',
    vignette: 'Trong tâm trí Joel, những ký ức về Clementine từ từ biến mất. Anh chạy thật nhanh để giữ lại.',
    quote: 'Gặp anh lần nữa, tôi vẫn yêu anh.',
    runtime: 108,
    weatherMatch: 65,
    ostLink: 'https://spotify.com',
    trailerYoutubeId: 'rblfKREj50o',
    whereToWatch: { Netflix: '#', 'Amazon Prime': '#' },
    genres: ['Romance', 'Drama', 'Sci-Fi'],
    region: 'US',
  },
];

// Generate more movies by duplicating and modifying
function generateMoreMovies(): Movie[] {
  const allMovies: Movie[] = [...sampleMovies];
  const titles = [
    'Moonlight', 'Call Me By Your Name', 'Her', 'Lost in Translation',
    'About Time', 'The Secret Life of Walter Mitty', 'Paterson',
    'Frances Ha', 'Whisper of the Heart', 'Only Yesterday',
    'Grave of the Fireflies', 'When Marnie Was There', 'The Wind Rises',
    'Kiki\'s Delivery Service', 'My Neighbor Totoro', 'Porco Rosso',
    '500 Days of Summer', 'Crazy Rich Asians', 'To All The Boys',
    'The Half of It', 'Portrait of a Lady on Fire', 'Blue is the Warmest Color',
  ];

  // Use a stable random seed based on the index for consistent ordering
  titles.forEach((title, idx) => {
    const base = sampleMovies[idx % sampleMovies.length];
    const seed = idx * 12345; // Stable seed for consistent random values
    allMovies.push({
      ...base,
      id: 100 + idx, // Unique ID starting from 100
      title,
      year: 2010 + (seed % 15),
      rating: 6.5 + ((seed % 200) / 100),
      weatherMatch: 60 + (seed % 40),
    });
  });

  return allMovies;
}

const allMoviesData = generateMoreMovies();

export async function getMovies(
  filters: any,
  searchQuery: string,
  page: number
): Promise<Movie[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...allMoviesData];

  // Search
  if (searchQuery) {
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Vibes
  if (filters.vibes.length > 0) {
    filtered = filtered.filter(m =>
      filters.vibes.some((v: string) => m.vibes.includes(v))
    );
  }

  // Genres
  if (filters.genres.length > 0) {
    filtered = filtered.filter(m =>
      filters.genres.some((g: string) => m.genres.includes(g))
    );
  }

  // Year
  filtered = filtered.filter(m =>
    m.year >= filters.yearMin && m.year <= filters.yearMax
  );

  // Rating
  filtered = filtered.filter(m => m.rating >= filters.ratingMin);

  // Region
  if (filters.regions.length > 0) {
    filtered = filtered.filter(m => filters.regions.includes(m.region));
  }

  // Comfort Guardian
  if (filters.comfortFlags.length > 0) {
    filtered = filtered.filter(m => m.comfortBadge);
  }

  // Sort
  switch (filters.sort) {
    case 'newest':
      filtered.sort((a, b) => b.year - a.year);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'alpha':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      // emotion_fit - stable sort based on weatherMatch and ID for consistency
      filtered.sort((a, b) => {
        const diff = b.weatherMatch - a.weatherMatch;
        return diff !== 0 ? diff : a.id - b.id;
      });
  }

  // Pagination
  const start = (page - 1) * 24;
  const end = start + 24;
  return filtered.slice(start, end);
}

export function getMoodPicks(): Movie[] {
  const weatherMood = new Date().getHours() > 18 || new Date().getHours() < 6;
  
  let picks = allMoviesData
    .filter(m => weatherMood ? m.vibes.includes('Cozy') : true)
    .slice(0, 10);
  
  return picks;
}
