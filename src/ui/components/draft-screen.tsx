import { type Accessor, For, type JSX } from 'solid-js';
import type { Ability } from '../../game/ability';
import type Game from '../../game/game';
import { AbilityOffer } from './ability-view';
import CardRow from './card-row';
import DeckRow from './deck-row';
import RunStatus, { OwnedAbilities } from './run-status';

interface DraftScreenProps {
  game: Game;
  version: Accessor<number>;
}

/**
 * The ability draft: the offers on top, and the player's cards below.
 */
export default function DraftScreen(props: DraftScreenProps): JSX.Element {
  const offers = (): Ability[] => {
    props.version();
    return [...props.game.draft.offers];
  };

  return (
    <>
      <section class="min-h-0">
        <CardRow>
          <For each={offers()}>
            {(ability, slot) => (
              <AbilityOffer
                ability={ability}
                onClick={() => {
                  props.game.pickAbility(slot());
                }}
              />
            )}
          </For>
        </CardRow>
      </section>
      <section class="border-y border-zinc-800 bg-zinc-900/60">
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 py-4">
          <RunStatus game={props.game} version={props.version} />
          <div class="text-center">
            <div class="text-2xl font-black">Choose an ability</div>
            <div class="text-xs text-zinc-400">
              It lasts for the rest of the run, and the shop favors its aspects.
            </div>
          </div>
          <OwnedAbilities game={props.game} version={props.version} />
        </div>
      </section>
      <section class="min-h-0">
        <DeckRow game={props.game} version={props.version} />
      </section>
    </>
  );
}
