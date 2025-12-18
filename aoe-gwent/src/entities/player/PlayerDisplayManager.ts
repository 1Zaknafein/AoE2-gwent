import { PixiContainer } from "../../plugins/engine";
import { PlayerDisplay, PlayerDisplayData } from "./PlayerDisplay";
import { Player } from "./Player";

export interface PlayerDisplayManagerConfig {
	playerName: string;
	enemyName: string;
	playerPosition: { x: number; y: number };
	enemyPosition: { x: number; y: number };
}

export class PlayerDisplayManager extends PixiContainer {
	private readonly _playerDisplay: PlayerDisplay;
	private readonly _enemyDisplay: PlayerDisplay;

	constructor(
		config: PlayerDisplayManagerConfig,
		player: Player,
		enemy: Player
	) {
		super();

		const playerData: PlayerDisplayData = {
			playerName: config.playerName,
			isEnemy: false,
			position: config.playerPosition,
		};
		this._playerDisplay = new PlayerDisplay(playerData);
		this.addChild(this._playerDisplay);

		const enemyData: PlayerDisplayData = {
			playerName: config.enemyName,
			isEnemy: true,
			position: config.enemyPosition,
		};
		this._enemyDisplay = new PlayerDisplay(enemyData);
		this.addChild(this._enemyDisplay);

		const updateHandCounts = () =>
			this.updateHandCounts(player.hand.cardCount, enemy.hand.cardCount);

		player.hand.on("cardAdded", updateHandCounts);
		player.hand.on("cardRemoved", updateHandCounts);

		enemy.hand.on("cardAdded", updateHandCounts);
		enemy.hand.on("cardRemoved", updateHandCounts);

		this._playerDisplay.watchContainers([
			player.melee,
			player.ranged,
			player.siege,
		]);

		this._enemyDisplay.watchContainers([
			enemy.melee,
			enemy.ranged,
			enemy.siege,
		]);
	}

	/**
	 * Get the player display instance.
	 */
	public get playerDisplay(): PlayerDisplay {
		return this._playerDisplay;
	}

	/**
	 * Get the enemy display instance.
	 */
	public get enemyDisplay(): PlayerDisplay {
		return this._enemyDisplay;
	}

	/**
	 * Update player hand counts.
	 */
	public updateHandCounts(
		playerHandCount: number,
		enemyHandCount: number
	): void {
		this._playerDisplay.setHandCount(playerHandCount);
		this._enemyDisplay.setHandCount(enemyHandCount);
	}

	/**
	 * Update player names.
	 */
	public updatePlayerNames(playerName: string, enemyName: string): void {
		this._playerDisplay.setPlayerName(playerName);
		this._enemyDisplay.setPlayerName(enemyName);
	}

	/**
	 * Position all display elements for both player and enemy displays.
	 */
	public positionDisplayElements(): void {
		this._playerDisplay.positionElements();
		this._enemyDisplay.positionElements();
	}
}
