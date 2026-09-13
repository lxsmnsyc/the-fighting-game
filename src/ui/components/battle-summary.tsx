import { For, type JSX } from 'solid-js';
import type Game from '../../game/game';
import type { BattleStats, BattleSummary } from '../../game/summary';
import { BattleResult, PlayerStat } from '../../game/types';
import Button from './button';

const RESULT_TITLES: Record<BattleResult, string> = {
  [BattleResult.Won]: 'Victory',
  [BattleResult.Draw]: 'Draw',
  [BattleResult.Lost]: 'Defeat',
};

const RESULT_CLASSES: Record<BattleResult, string> = {
  [BattleResult.Won]: 'text-emerald-400',
  [BattleResult.Draw]: 'text-zinc-300',
  [BattleResult.Lost]: 'text-rose-400',
};

interface StatRow {
  label: string;
  read: (stats: BattleStats) => number;
}

const STAT_ROWS: StatRow[] = [
  { label: 'Damage dealt', read: (stats) => stats.damageDealt },
  { label: 'Damage taken', read: (stats) => stats.damageTaken },
  { label: 'Healing', read: (stats) => stats.healing },
  { label: 'Attacks', read: (stats) => stats.attacks },
  { label: 'Critical hits', read: (stats) => stats.criticalHits },
  { label: 'Dodges', read: (stats) => stats.dodges },
  { label: 'Card triggers', read: (stats) => stats.cardTriggers },
  { label: 'Ability triggers', read: (stats) => stats.abilityTriggers },
];

function formatDuration(milliseconds: number): string {
  const seconds = Math.round(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

interface BattleSummaryPanelProps {
  game: Game;
  summary: BattleSummary;
}

/**
 * The result of the battle that just ended, the gold it earned and what
 * each side did. Continue moves the run on.
 */
export default function BattleSummaryPanel(props: BattleSummaryPanelProps): JSX.Element {
  // The run does not change while the summary is open
  const { game, summary } = props;
  const lives = game.player.stats[PlayerStat.Life];
  const place = game.isBossRound()
    ? `Phase ${game.getPhase()}, boss round`
    : `Phase ${game.getPhase()}, round ${game.getPhaseRound()}`;

  return (
    <div
      data-testid="battle-summary"
      role="dialog"
      aria-label="Battle summary"
      class="absolute inset-0 z-40 grid place-items-center overflow-y-auto bg-zinc-950/70 px-4 py-6 backdrop-blur-sm"
    >
      <div class="flex w-full max-w-md flex-col gap-5 rounded-2xl bg-zinc-900 p-6 ring-1 ring-zinc-700">
        <div class="flex flex-col items-center gap-1 text-center">
          <span class="text-xs uppercase tracking-wide text-zinc-400">{place}</span>
          <h1 class={`text-4xl font-black ${RESULT_CLASSES[summary.result]}`}>
            {RESULT_TITLES[summary.result]}
          </h1>
          <span class="text-sm text-zinc-400">Lasted {formatDuration(summary.duration)}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-center">
          <div class="rounded-xl bg-zinc-800/60 p-3">
            <div data-testid="summary-gold" class="text-2xl font-black text-amber-300">
              +{summary.gold}g
            </div>
            <div class="text-[10px] uppercase tracking-wide text-zinc-400">Gold earned</div>
          </div>
          <div class="rounded-xl bg-zinc-800/60 p-3">
            <div class={`text-2xl font-black ${summary.livesLost > 0 ? 'text-rose-400' : ''}`}>
              {lives}
              {summary.livesLost > 0 ? ` (−${summary.livesLost})` : ''}
            </div>
            <div class="text-[10px] uppercase tracking-wide text-zinc-400">Lives left</div>
          </div>
        </div>

        <table class="w-full text-sm tabular-nums">
          <thead>
            <tr class="text-xs uppercase tracking-wide text-zinc-400">
              <th class="pb-1 text-left font-normal">Stat</th>
              <th class="pb-1 text-right font-normal">You</th>
              <th class="pb-1 text-right font-normal">Enemy</th>
            </tr>
          </thead>
          <tbody>
            <For each={STAT_ROWS}>
              {(row) => (
                <tr class="border-t border-zinc-800">
                  <td class="py-1.5 text-zinc-300">{row.label}</td>
                  <td class="py-1.5 text-right font-semibold">
                    {Math.round(row.read(summary.player))}
                  </td>
                  <td class="py-1.5 text-right text-zinc-400">
                    {Math.round(row.read(summary.enemy))}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>

        <Button
          variant="primary"
          class="w-full py-3 text-lg"
          onClick={() => {
            game.continueRun();
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
