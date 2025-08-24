import { CardContainer } from "./CardContainer";

export interface PlayerContainers {
	hand: CardContainer;
	infantry: CardContainer;
	ranged: CardContainer;
	siege: CardContainer;
	discard: CardContainer;
	deck: CardContainer;
}

export class CardContainerManager {
	public readonly player: PlayerContainers;
	public readonly enemy: PlayerContainers;
	public readonly weather: CardContainer;

	constructor() {
		// Initialize player containers
		this.player = {
			hand: new CardContainer(600),
			infantry: new CardContainer(500),
			ranged: new CardContainer(500),
			siege: new CardContainer(500),
			discard: new CardContainer(120),
			deck: new CardContainer(80),
		};

		// Initialize enemy containers
		this.enemy = {
			hand: new CardContainer(600),
			infantry: new CardContainer(500),
			ranged: new CardContainer(500),
			siege: new CardContainer(500),
			discard: new CardContainer(120),
			deck: new CardContainer(80),
		};

		// Initialize weather container
		this.weather = new CardContainer(100);
	}

	public getAllContainers(): CardContainer[] {
		return [
			this.player.hand,
			this.player.infantry,
			this.player.ranged,
			this.player.siege,
			this.player.discard,
			this.player.deck,
			this.enemy.hand,
			this.enemy.infantry,
			this.enemy.ranged,
			this.enemy.siege,
			this.enemy.discard,
			this.enemy.deck,
			this.weather,
		];
	}

	public getPlayerContainers(): CardContainer[] {
		return [
			this.player.hand,
			this.player.infantry,
			this.player.ranged,
			this.player.siege,
			this.player.discard,
			this.player.deck,
		];
	}

	public getEnemyContainers(): CardContainer[] {
		return [
			this.enemy.hand,
			this.enemy.infantry,
			this.enemy.ranged,
			this.enemy.siege,
			this.enemy.discard,
			this.enemy.deck,
		];
	}
}
