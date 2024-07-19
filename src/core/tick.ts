// Based on https://stackoverflow.com/a/25627639

const FPS = 60;
export const FRAME_DURATION = 1000 / FPS;

export function createTick(callback: () => void): () => void {
  let raf: number;

  let last = Date.now();
  let lag = 0;

  function update() {
    raf = requestAnimationFrame(update);

    const current = Date.now();
    const elapsed = current - last;
    last = current;

    lag += elapsed;

    while (lag >= FRAME_DURATION) {
      callback();
      lag -= FRAME_DURATION;
    }
  }

  raf = requestAnimationFrame(update);

  return () => {
    cancelAnimationFrame(raf);
  };
}
