interface EmotionSpectrumProps {
  spectrum: {
    calm: number;
    warm: number;
    hopeful: number;
    nostalgic: number;
    bittersweet: number;
    intense: number;
  };
  mini?: boolean;
}

const emotionColors = {
  calm: { bg: 'bg-blue-500', text: 'Calm' },
  warm: { bg: 'bg-orange-500', text: 'Warm' },
  hopeful: { bg: 'bg-green-500', text: 'Hopeful' },
  nostalgic: { bg: 'bg-purple-500', text: 'Nostalgic' },
  bittersweet: { bg: 'bg-pink-500', text: 'Bittersweet' },
  intense: { bg: 'bg-red-500', text: 'Intense' },
};

export function EmotionSpectrum({ spectrum, mini = false }: EmotionSpectrumProps) {
  const emotions = Object.entries(spectrum) as [keyof typeof spectrum, number][];

  if (mini) {
    return (
      <div className="space-y-1">
        {emotions.map(([emotion, value]) => (
          <div key={emotion} className="flex items-center space-x-2">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${emotionColors[emotion].bg} transition-all`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {emotions.map(([emotion, value]) => (
        <div key={emotion}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">{emotionColors[emotion].text}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{value}%</span>
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${emotionColors[emotion].bg} transition-all rounded-full`}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
