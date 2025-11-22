export default function generateRandomSpectrum() {
    return {
        calm: Math.floor(Math.random() * 101),
        warm: Math.floor(Math.random() * 101),
        hopeful: Math.floor(Math.random() * 101),
    };
}