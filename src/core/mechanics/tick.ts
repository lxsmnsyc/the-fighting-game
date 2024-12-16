import { type Game, RoundEventType } from '../game';
import { EventPriority } from '../priorities';

const FPS = 60;
const FPS_DURATION = 1000 / FPS;

export function setupTickMechanics(game: Game): void {
  game.on(RoundEventType.Start, EventPriority.Post, () => {
    let elapsed = Date.now();
    let raf = requestAnimationFrame(update);

    function update() {
      raf = requestAnimationFrame(update);
      const current = Date.now();
      let diff = current - elapsed;
      elapsed = current;

      while (diff >= FPS_DURATION && !game.closed) {
        game.tick(FPS_DURATION);
        diff -= FPS_DURATION;
      }

      if (diff > 0) {
        elapsed -= diff;
      }
    }

    game.on(RoundEventType.Close, EventPriority.Pre, () => {
      cancelAnimationFrame(raf);
    });
  });
}
