/**
 * Rotation keyframes of a damped spring, played linearly so the spring
 * shape comes from the samples.
 */
export default function createShakeKeyframes(
  amplitude = 10,
  frequency = 3,
  damping = 5,
  steps = 36,
): Keyframe[] {
  const keyframes: Keyframe[] = [];
  for (let step = 0; step <= steps; step++) {
    const time = step / steps;
    const angle = amplitude * Math.exp(-damping * time) * Math.sin(2 * Math.PI * frequency * time);
    keyframes.push({ transform: `rotate(${angle.toFixed(2)}deg)` });
  }
  return keyframes;
}
