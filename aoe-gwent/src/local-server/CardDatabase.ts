import { Texture } from "pixi.js";

export enum CardType {
	MELEE = "melee",
	RANGED = "ranged",
	SIEGE = "siege",
	RANGED_MELEE = "ranged_melee",
	WEATHER = "weather",
	SPECIAL = "special",
}

export const enum CardEffect {
	FREEZE = "freeze",
	FOG = "fog",
	RAIN = "rain",
	CLEAR = "clear",
	BOOST = "boost",
}

export interface CardData {
	id: number;
	name: string;
	score: number;
	type: CardType;
	effect?: CardEffect;
	baseScore?: number;
}

/**
 * Local card database that stores card definitions.
 */
export class CardDatabase {
	public static generateRandomDeck(size: number): CardData[] {
		const deck = [];

		for (let i = 0; i < size; i++) {
			const randomCardData =
				this.cards[Math.floor(Math.random() * this.cards.length)];

			deck.push(randomCardData);
		}

		return deck;
	}

	public static getTexture(cardId: number): Texture {
		const card = CardDatabase.cards.find((card) => card.id === cardId);

		if (!card) {
			throw new Error(`Card with ID ${cardId} not found in database.`);
		}

		// Use card name to determine texture name.
		// Texture names must match card names.
		// Spaces are replaced with underscores and all letters are lowercase for texture naming convention.
		const textureName = card.name.toLowerCase().replace(/\s+/g, "_");

		return Texture.from(textureName);
	}

	private static readonly cards: CardData[] = [
		{
			id: 1,
			name: "Knight",
			score: 6,
			type: CardType.MELEE,
		},
		{
			id: 2,
			name: "Crossbowman",
			score: 3,
			type: CardType.RANGED,
		},
		{
			id: 3,
			name: "Mangonel",
			score: 8,
			type: CardType.SIEGE,
		},
		{
			id: 4,
			name: "Light Cavalry",
			score: 3,
			type: CardType.MELEE,
		},
		{
			id: 5,
			name: "Teutonic Knight",
			score: 10,
			type: CardType.MELEE,
		},
		{
			id: 6,
			name: "Archer",
			score: 2,
			type: CardType.RANGED,
		},
		{
			id: 7,
			name: "Militia",
			score: 1,
			type: CardType.MELEE,
		},
		{
			id: 8,
			name: "Pikeman",
			score: 3,
			type: CardType.MELEE,
		},
		{
			id: 9,
			name: "Berserker",
			score: 6,
			type: CardType.MELEE,
		},
		{
			id: 10,
			name: "Two Handed Swordsman",
			score: 5,
			type: CardType.MELEE,
		},
		{
			id: 11,
			name: "Karambit Warrior",
			score: 2,
			type: CardType.MELEE,
		},
		{
			id: 12,
			name: "Obuch",
			score: 7,
			type: CardType.MELEE,
		},
		{
			id: 13,
			name: "Konnik",
			score: 7,
			type: CardType.MELEE,
		},
		{
			id: 14,
			name: "Dismounted Konnik",
			score: 4,
			type: CardType.MELEE,
		},
		{
			id: 15,
			name: "Cavalry Archer",
			score: 6,
			type: CardType.RANGED,
		},
		{
			id: 16,
			name: "Skirmisher",
			score: 2,
			type: CardType.RANGED,
		},
		{
			id: 17,
			name: "Elite Skirmisher",
			score: 4,
			type: CardType.RANGED,
		},
		{
			id: 18,
			name: "Monaspa",
			score: 6,
			type: CardType.MELEE,
		},
		{
			id: 19,
			name: "Winged Hussar",
			score: 5,
			type: CardType.MELEE,
		},
		{
			id: 101,
			name: "Frost",
			score: 0,
			type: CardType.WEATHER,
			effect: CardEffect.FREEZE,
		},
		{
			id: 102,
			name: "Fog",
			score: 0,
			type: CardType.WEATHER,
			effect: CardEffect.FOG,
		},
		{
			id: 103,
			name: "Rain",
			score: 0,
			type: CardType.WEATHER,
			effect: CardEffect.RAIN,
		},
		{
			id: 104,
			name: "Clear",
			score: 0,
			type: CardType.WEATHER,
			effect: CardEffect.CLEAR,
		},
	] as const;
}
