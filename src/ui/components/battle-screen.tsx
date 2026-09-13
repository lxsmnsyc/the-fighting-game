import { For, type JSX } from 'solid-js';
import type Battle from '../../battle/core';
import type { Energy } from '../../battle/types';
import type { CardInstance } from '../../game/card';
import type Game from '../../game/game';
import { type Projectile, Side, createBattleView } from '../state';
import BattleBar from './battle-bar';
import CardRow from './card-row';
import CardView from './card-view';
import ProjectileLayer from './projectile-layer';

// An element that has since been removed, such as an energy icon whose
// energy ran out, is no anchor
function connected(element: HTMLElement | undefined): HTMLElement | undefined {
  return element?.isConnected === true ? element : undefined;
}

export default function BattleScreen(props: { game: Game; battle: Battle }): JSX.Element {
  const view = createBattleView(props.game, props.battle);
  const rows: Partial<Record<Side, HTMLElement>> = {};
  const healthBars: Partial<Record<Side, HTMLElement>> = {};
  const energyRows: Partial<Record<Side, HTMLElement>> = {};
  const energyIcons = new Map<string, HTMLElement>();
  const cards = new Map<CardInstance, HTMLElement>();

  const getEnergyKey = (side: Side, energy: Energy): string => `${side}:${energy}`;

  const getSource = (projectile: Projectile): HTMLElement | undefined =>
    projectile.kind === 'damage' ? rows[projectile.from] : connected(cards.get(projectile.card));

  const getTarget = (projectile: Projectile): HTMLElement | undefined => {
    if (projectile.kind === 'damage') {
      return healthBars[projectile.to];
    }
    return (
      connected(energyIcons.get(getEnergyKey(projectile.to, projectile.energy))) ??
      energyRows[projectile.to] ??
      healthBars[projectile.to]
    );
  };

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
            setElement={(element) => {
              cards.set(card, element);
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
          anchors={{
            setHealthBar: (side, element) => {
              healthBars[side] = element;
            },
            setEnergyRow: (side, element) => {
              energyRows[side] = element;
            },
            setEnergyIcon: (side, energy, element) => {
              energyIcons.set(getEnergyKey(side, energy), element);
            },
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
      <ProjectileLayer view={view} getSource={getSource} getTarget={getTarget} />
    </>
  );
}
