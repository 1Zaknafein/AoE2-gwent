import { Card, PlayingRowContainer } from "../../entities/card";
import { Player } from "../../entities/player/Player";
import { BattlefieldContext } from "../../local-server/CardEffects";

export class ScoreCalculator {
	private readonly _player: Player;
	private readonly _enemy: Player;

	private readonly _rowBuffMap: Map<PlayingRowContainer, number>;
	private readonly _cardScoreMap: Map<Card, number> = new Map();

	constructor(player: Player, enemy: Player) {
		this._player = player;
		this._enemy = enemy;
		this._rowBuffMap = new Map();
	}

	public calculateScore(
		playerRows: PlayingRowContainer[],
		enemyRows: PlayingRowContainer[]
	): Map<Card, number> {
		const allRows = [...playerRows, ...enemyRows];

		this._cardScoreMap.clear();

		// Reset scores to base values before applying any effects.
		for (const row of allRows) {
			for (const card of row.cards) {
				if (card.cardData.baseScore === undefined) {
					throw new Error(`Card ${card.cardData.name} is missing baseScore!`);
				}

				this._cardScoreMap.set(
					card,
					row.weatherEffectApplied ? 1 : card.cardData.baseScore
				);
			}
		}

		// Calculate aura effects.
		const effects = this.calculateAuraEffects(playerRows, enemyRows);

		this._rowBuffMap.clear();

		// Sum up buffs/debuffs from all aura effects for each row.
		effects.forEach((effect) => {
			const currentValue = this._rowBuffMap.get(effect.affectedRow) ?? 0;

			this._rowBuffMap.set(
				effect.affectedRow,
				currentValue + effect.effectValue
			);
		});

		// Apply row buffs/debuffs from aura effects to the cards.
		this._rowBuffMap.forEach((buffAmount, row) => {
			for (const card of row.cards) {
				const oldScore = this._cardScoreMap.get(card)!;
				const newScore = oldScore + buffAmount;

				this._cardScoreMap.set(card, Math.max(newScore, 1));
			}
		});

		// Apply card score for player rows.
		for (const row of playerRows) {
			for (const card of row.cards) {
				this._cardScoreMap.set(card, this.calculateCardScore(card, true));
			}
		}

		// Apply card score for enemy rows.
		for (const row of enemyRows) {
			for (const card of row.cards) {
				this._cardScoreMap.set(card, this.calculateCardScore(card, false));
			}
		}

		return new Map(this._cardScoreMap);
	}

	private calculateCardScore(card: Card, isPlayer: boolean): number {
		const data = card.cardData;

		const context: BattlefieldContext = {
			player: isPlayer ? this._player : this._enemy,
			enemy: isPlayer ? this._enemy : this._player,
		};

		let newScore = this._cardScoreMap.get(card)!;

		if (data.selfEffect) {
			newScore += data.selfEffect.fn(card, context);
		}

		return newScore;
	}

	private calculateAuraEffects(
		playerRows: PlayingRowContainer[],
		enemyRows: PlayingRowContainer[]
	): {
		affectedRow: PlayingRowContainer;
		effectValue: number;
	}[] {
		const contextPlayer: BattlefieldContext = {
			player: this._player,
			enemy: this._enemy,
		};

		const contextEnemy: BattlefieldContext = {
			player: this._enemy,
			enemy: this._player,
		};

		let effects: {
			affectedRow: PlayingRowContainer;
			effectValue: number;
		}[] = [];

		for (const row of playerRows) {
			if (row.strengthBoost) {
				effects.push({
					affectedRow: row,
					effectValue: row.strengthBoost,
				});
			}

			for (const card of row.cards) {
				const effect = card.cardData.auraEffect?.fn(contextPlayer);

				if (effect) {
					effects.push({
						affectedRow: effect.affectedRow,
						effectValue: effect.effectValue,
					});
				}
			}
		}

		for (const row of enemyRows) {
			if (row.strengthBoost) {
				effects.push({
					affectedRow: row,
					effectValue: row.strengthBoost,
				});
			}

			for (const card of row.cards) {
				const effect = card.cardData.auraEffect?.fn(contextEnemy);

				if (effect) {
					effects.push({
						affectedRow: effect.affectedRow,
						effectValue: effect.effectValue,
					});
				}
			}
		}

		return effects;
	}
}
