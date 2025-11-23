type MoodSpectrum = Record<string, { value: number; icon: string }>;

const moodsList = [
  { key: "happy", icon: "😊" },
  { key: "funny", icon: "😂" },
  { key: "sad", icon: "😢" },
  { key: "dark", icon: "🌑" },
  { key: "lonely", icon: "🥀" },
  { key: "warm", icon: "🌞" },
  { key: "healing", icon: "🌿" },
  { key: "romantic", icon: "💘" },
  { key: "excited", icon: "🤩" },
  { key: "tense", icon: "😬" },
  { key: "thrilling", icon: "⚡" },
  { key: "scary", icon: "👻" },
  { key: "mysterious", icon: "🕵️‍♂️" },
  { key: "nostalgic", icon: "📼" },
  { key: "cozy", icon: "🧸" },
  { key: "chaotic", icon: "🔥" },
];

export default function generateRandomSpectrum(num = 3): MoodSpectrum {
  const shuffled = [...moodsList].sort(() => Math.random() - 0.5); // shuffle
  const selected = shuffled.slice(0, num); // lấy num mood đầu tiên

  const spectrum: MoodSpectrum = {};

  selected.forEach(mood => {
    spectrum[mood.key] = {
      value: Math.floor(Math.random() * 51) + 50, // 50–100
      icon: mood.icon,
    };
  });

  return spectrum;
}
