const colorPalette = [
  "bg-blue-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-500",
];

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);


export function EmotionSpectrum({ spectrum, mini = false }) {
  const spectrumEntries = Object.entries(spectrum);

  if (mini) {
    return (
      <div className="space-y-1">
        {spectrumEntries.map(([emotion, value], index) => {
          const color = colorPalette[index % colorPalette.length];

          return (
            <div key={emotion} className="flex items-center space-x-2">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} transition-all`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {spectrumEntries.map(([emotion, value], index) => {
        const color = colorPalette[index % colorPalette.length];

        return (
          <div key={emotion}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">{capitalize(emotion)}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{value}%</span>
            </div>

            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${color} transition-all rounded-full`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
