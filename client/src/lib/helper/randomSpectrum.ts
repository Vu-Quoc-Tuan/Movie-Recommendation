/**
 * Generate a random spectrum object for movie vibes
 */
export default function generateRandomSpectrum(): {
  calm: number;
  warm: number;
  hopeful: number;
} {
  return {
    calm: Math.random() * 100,
    warm: Math.random() * 100,
    hopeful: Math.random() * 100,
  };
}

