import { Card, PlayingRowContainer } from "../../entities/card";
import { BattlefieldContext } from "../../local-server/CardEffects";

export class ScoreCalculator {
	private readonly _rowBuffMap: Map<PlayingRowContainer, number> = new Map();
	private readonly _cardScoreMap: Map<Card, number> = new Map();

	public calculateScore(context: BattlefieldContext): Map<Card, number> {
		const playerRows = [
			context.player.melee,
			context.player.ranged,
			context.player.siege,
		];
		const enemyRows = [
			context.enemy.melee,
			context.enemy.ranged,
			context.enemy.siege,
		];

		this._rowBuffMap.clear();
		this._cardScoreMap.clear();

		// Reset scores to base values before applying any effects.
		for (const row of [...playerRows, ...enemyRows]) {
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
		const effects = this.calculateAuraEffects(context);

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
				this._cardScoreMap.set(card, this.calculateCardScore(card, context));
			}
		}

		// Swap context player/enemy to calculate score for enemy cards with correct context.
		const swappedContext: BattlefieldContext = {
			player: context.enemy,
			enemy: context.player,
		};

		// Apply card score for enemy rows.
		for (const row of enemyRows) {
			for (const card of row.cards) {
				this._cardScoreMap.set(
					card,
					this.calculateCardScore(card, swappedContext)
				);
			}
		}

		return new Map(this._cardScoreMap);
	}

	private calculateCardScore(card: Card, context: BattlefieldContext): number {
		const data = card.cardData;

		let newScore = this._cardScoreMap.get(card)!;

		if (data.selfEffect) {
			newScore += data.selfEffect.fn(card, context);
		}

		return newScore;
	}

	private calculateAuraEffects(context: BattlefieldContext): {
		affectedRow: PlayingRowContainer;
		effectValue: number;
	}[] {
		let effects: {
			affectedRow: PlayingRowContainer;
			effectValue: number;
		}[] = [];

		const playerRows = [
			context.player.melee,
			context.player.ranged,
			context.player.siege,
		];
		const enemyRows = [
			context.enemy.melee,
			context.enemy.ranged,
			context.enemy.siege,
		];

		for (const row of playerRows) {
			if (row.strengthBoost) {
				effects.push({
					affectedRow: row,
					effectValue: row.strengthBoost,
				});
			}

			for (const card of row.cards) {
				const effect = card.cardData.auraEffect?.fn(context);

				if (effect) {
					effects.push({
						affectedRow: effect.affectedRow,
						effectValue: effect.effectValue,
					});
				}
			}
		}

		const swappedContext: BattlefieldContext = {
			player: context.enemy,
			enemy: context.player,
		};

		for (const row of enemyRows) {
			if (row.strengthBoost) {
				effects.push({
					affectedRow: row,
					effectValue: row.strengthBoost,
				});
			}

			for (const card of row.cards) {
				const effect = card.cardData.auraEffect?.fn(swappedContext);

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
