export function lerp(x: number, y: number, time: number) {
  return (1 - time) * x + time * y;
}
