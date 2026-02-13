import { Card } from "../entities/card";
import { Player } from "../entities/player/Player";

export interface BattlefieldContext {
	player: Player;
	enemy: Player;
}

/**
 * Effect that calculates this card's score based on battlefield conditions
 */
export type SelfEffectFunction = (
	card: Card,
	context: BattlefieldContext
) => number;

/**
 * Effect that modifies other cards (aura/passive effect)
 */
export type AuraEffectFunction = (context: BattlefieldContext) => void;

/**
 * Effect that triggers when card is played
 */
export type TriggerEffectFunction = (context: BattlefieldContext) => void;

/**
 * Self-targeting effects - cards that modify their own score
 */
export const SelfEffects = {
	/**
	 * Monaspa: Gets +1 score for each other Monaspa or Knight in same melee row
	 */
	monaspaBonus: (card: Card, context: BattlefieldContext): number => {
		const meleeCards = context.player.melee.cards;

		const bonusCards = meleeCards.filter(
			(c) =>
				card !== c &&
				(c.cardData.name === "Monaspa" || c.cardData.name === "Knight")
		);

		return card.cardData.score + bonusCards.length;
	},

	/**
	 * Winged Hussar: Gets +2 attack if there are any enemy siege units
	 */
	wingedHussarBonus: (card: Card, context: BattlefieldContext): number => {
		const enemySiegeCount = context.enemy.siege.cards.length;
		const score = card.cardData.score;

		return enemySiegeCount > 0 ? score + 2 : score;
	},

	/**
	 * Skirmisher: Gets +2 attack if there are any cards in enemy ranged row
	 */
	skirmisherBonus: (card: Card, context: BattlefieldContext): number => {
		const enemyRangedCount = context.enemy.ranged.cards.length;
		const score = card.cardData.score;
		return enemyRangedCount > 0 ? score + 2 : score;
	},

	/**
	 * Pikeman: Gets +2 attack if there are any cavalry units in enemy melee row
	 */
	pikemanBonus: (card: Card, context: BattlefieldContext): number => {
		const enemyMeleeCards = context.enemy.melee.cards;

		let bonusScore = 0;

		for (const enemyCard of enemyMeleeCards) {
			if (enemyCard.cardData.tags?.includes("cavalry")) {
				bonusScore = 2;
				break;
			}
		}

		const score = card.cardData.score + bonusScore;

		return score;
	},
};

/**
 * Aura effects - cards that affect other cards
 */
export const AuraEffects = {
	/**
	 * Obuch: Decreases strength of all enemy cards in melee row by 1
	 */
	obuchDebuff: (context: BattlefieldContext) => {
		context.enemy.melee.cards.forEach((card) => {
			const cardScore = card.cardData.score;

			// Cap score at 1.
			const newScore = Math.max(1, cardScore - 1);

			card.setScore(newScore);
		});
	},
};

/**
 * Trigger effects - one-time effects when card is played
 */
export const TriggerEffects = {
	/**
	 * Karambit Warrior: Summons all other Karambit Warriors from hand and deck
	 */
	karambitSummon: (context: BattlefieldContext): void => {
		const { hand, deck, melee, deckPosition } = context.player;

		// Add all Karambit Warriors found in hand
		hand.cards
			.filter((c) => c.cardData.name === "Karambit Warrior")
			.forEach((card) => {
				melee.transferCardTo(card, melee);
				("");
			});

		// Add all Karambit Warriors found in deck
		deck
			.filter((c) => c.name === "Karambit Warrior")
			.forEach((cardData) => {
				melee.addCardWithAnimation(cardData, deckPosition);
			});
	},
};
