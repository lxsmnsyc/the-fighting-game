export default function lerp(x: number, y: number, time: number): number {
  return (1 - time) * x + time * y;
}
