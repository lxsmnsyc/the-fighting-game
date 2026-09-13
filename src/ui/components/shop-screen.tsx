import { type Accessor, Index, type JSX, Show } from 'solid-js';
import type { Card } from '../../game/card';
import type Game from '../../game/game';
import { BattleResult, PlayerStat } from '../../game/types';
import CardRow from './card-row';
import CardView from './card-view';
import DeckRow from './deck-row';
import RunStatus, { OwnedAbilities } from './run-status';

const RESULT_LABELS: Record<BattleResult, string> = {
  [BattleResult.Won]: 'Victory',
  [BattleResult.Draw]: 'Draw',
  [BattleResult.Lost]: 'Defeat',
};

const RESULT_CLASSES: Record<BattleResult, string> = {
  [BattleResult.Won]: 'text-emerald-400',
  [BattleResult.Draw]: 'text-zinc-300',
  [BattleResult.Lost]: 'text-rose-400',
};

interface ShopScreenProps {
  game: Game;
  version: Accessor<number>;
  lastResult: Accessor<BattleResult | undefined>;
}

function ShopBar(props: ShopScreenProps): JSX.Element {
  const read =
    <T,>(getter: () => T): (() => T) =>
    (): T => {
      props.version();
      return getter();
    };
  const gold = read(() => props.game.player.stats[PlayerStat.Gold]);
  const rerollCost = read(() => props.game.checkRerollCost());

  return (
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 py-4">
      <RunStatus game={props.game} version={props.version} />

      <div class="flex items-center gap-4">
        <button
          type="button"
          class="rounded-lg bg-zinc-800 px-4 py-2 font-semibold ring-1 ring-zinc-600 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={gold() < rerollCost()}
          onClick={() => {
            props.game.rerollShop();
          }}
        >
          Reroll <span class="text-amber-300">{rerollCost()}g</span>
        </button>
        <div class="min-w-24 text-center">
          <div class="text-3xl font-black tabular-nums text-amber-300">{gold()}g</div>
          <div class="text-[10px] uppercase tracking-wide text-zinc-400">Gold</div>
        </div>
        <button
          type="button"
          class="rounded-lg bg-emerald-600 px-4 py-2 font-semibold transition hover:bg-emerald-500"
          onClick={() => {
            props.game.startBattle();
          }}
        >
          Start battle
        </button>
      </div>

      <div class="flex items-center justify-end gap-4">
        <Show when={props.lastResult()}>
          {(result) => (
            <span class={`text-lg font-bold ${RESULT_CLASSES[result()]}`}>
              {RESULT_LABELS[result()]}
            </span>
          )}
        </Show>
        <OwnedAbilities game={props.game} version={props.version} />
      </div>
    </div>
  );
}

export default function ShopScreen(props: ShopScreenProps): JSX.Element {
  const offers = (): (Card | undefined)[] => {
    props.version();
    return [...props.game.shop.offers];
  };
  const gold = (): number => {
    props.version();
    return props.game.player.stats[PlayerStat.Gold];
  };

  return (
    <>
      <section class="min-h-0">
        <CardRow>
          <Index each={offers()}>
            {(offer, slot) => (
              <Show
                when={offer()}
                fallback={
                  // Wrapped, so the slot can shrink in the row while the box keeps its size
                  <div>
                    <div class="grid h-44 w-32 place-items-center rounded-xl border-2 border-dashed border-zinc-800 text-xs uppercase text-zinc-600">
                      Sold
                    </div>
                  </div>
                }
              >
                {(card) => (
                  <CardView
                    card={card()}
                    placement="top"
                    price={props.game.checkCardPrice(card())}
                    disabled={gold() < props.game.checkCardPrice(card())}
                    onClick={() => {
                      props.game.buyCard(slot);
                    }}
                  />
                )}
              </Show>
            )}
          </Index>
        </CardRow>
      </section>
      <section class="border-y border-zinc-800 bg-zinc-900/60">
        <ShopBar game={props.game} version={props.version} lastResult={props.lastResult} />
      </section>
      <section class="min-h-0">
        <DeckRow game={props.game} version={props.version} />
      </section>
    </>
  );
}
