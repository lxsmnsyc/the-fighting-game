import { For, type JSX } from 'solid-js';
import type Battle from '../../battle/core';
import type { CardInstance } from '../../game/card';
import type Game from '../../game/game';
import { Side, createBattleView } from '../state';
import BattleBar from './battle-bar';
import CardRow from './card-row';
import CardView from './card-view';
import ProjectileLayer from './projectile-layer';

export default function BattleScreen(props: { game: Game; battle: Battle }): JSX.Element {
  const view = createBattleView(props.game, props.battle);
  const rows: Partial<Record<Side, HTMLElement>> = {};
  const healthBars: Partial<Record<Side, HTMLElement>> = {};

  const cardsOf = (side: Side): CardInstance[] =>
    view.units[side].flatMap((unit) => [...unit.cards.keys()]);

  const renderCards = (side: Side): JSX.Element => (
    <CardRow>
      <For each={cardsOf(side)}>
        {(card) => (
          <CardView
            card={card.source}
            instance={card}
            placement={side === Side.Player ? 'bottom' : 'top'}
            onTrigger={(play) => {
              view.onTrigger(card, play);
            }}
          />
        )}
      </For>
    </CardRow>
  );

  return (
    <>
      <section
        ref={(element) => {
          rows[Side.Enemy] = element;
        }}
        class="min-h-0"
      >
        {renderCards(Side.Enemy)}
      </section>
      <section class="border-y border-zinc-800 bg-zinc-900/60">
        <BattleBar
          battle={props.battle}
          view={view}
          setHealthBar={(side, element) => {
            healthBars[side] = element;
          }}
        />
      </section>
      <section
        ref={(element) => {
          rows[Side.Player] = element;
        }}
        class="min-h-0"
      >
        {renderCards(Side.Player)}
      </section>
      <ProjectileLayer
        view={view}
        getSource={(side) => rows[side]}
        getTarget={(side) => healthBars[side]}
      />
    </>
  );
}
