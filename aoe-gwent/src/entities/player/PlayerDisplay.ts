import {
	Text,
	TextStyle,
	Sprite,
	Graphics,
	FillGradient,
	Color,
} from "pixi.js";
import { PixiContainer, PixiAssets } from "../../plugins/engine";
import { CardContainer } from "../card";
import { ANTIALIAS_FILTER } from "../../shared/constant/Constants";
import { PassButton } from "../../ui/components";
import { GameController } from "../../shared/game";

export class PlayerDisplay extends PixiContainer {
	public playerNameText!: Text;
	public totalScoreText!: Text;
	public handCountText!: Text;
	public healthIcon1!: Sprite;
	public healthIcon2!: Sprite;
	public scoreBackground!: Graphics;
	public passButton?: PassButton;

	private _isEnemy: boolean;
	private _currentHandCount = 0;
	private _currentTotalScore = 0;
	private _watchedContainers: CardContainer[] = [];
	private _gameController?: GameController;

	constructor(data: PlayerDisplayData) {
		super();

		this._isEnemy = data.isEnemy || false;
		this._gameController = data.gameController;

		this.position.set(data.position.x, data.position.y);

		this.createTextStyles();
		this.createScoreBackground();
		this.createTextElements(data.playerName);
		this.createHealthIcons();

		// Only create pass button for player
		if (!this._isEnemy && this._gameController) {
			this.createPassButton();
		}
	}

	public get handCount(): number {
		return this._currentHandCount;
	}

	public get totalScore(): number {
		return this._currentTotalScore;
	}

	public get isEnemy(): boolean {
		return this._isEnemy;
	}

	/**
	 * Helper method to position score background and text together
	 */
	public setScorePosition(x: number, y: number): void {
		this.scoreBackground.position.set(x, y);
		this.totalScoreText.position.set(x + 2, y); // Offset for shadow
	}

	/**
	 * Helper method to position health icons side by side
	 */
	public setHealthIconsPosition(
		x: number,
		y: number,
		spacing: number = 30
	): void {
		this.healthIcon1.position.set(x - spacing / 2, y);
		this.healthIcon2.position.set(x + spacing / 2, y);
	}

	/**
	 * Update the player's name display.
	 */
	public setPlayerName(name: string): void {
		this.playerNameText.text = name;
	}

	/**
	 * Update the hand count display.
	 */
	public setHandCount(count: number): void {
		this._currentHandCount = count;
		this.handCountText.text = count.toString();
	}

	/**
	 * Manually set the total score.
	 */
	public setTotalScore(score: number): void {
		this._currentTotalScore = score;
		this.totalScoreText.text = score.toString();
	}

	/**
	 * Position all display elements based on whether this is a player or enemy display.
	 * Uses different positioning logic for player vs enemy.
	 */
	public positionElements(): void {
		if (this._isEnemy) {
			this.positionEnemyElements();
		} else {
			this.positionPlayerElements();
		}
	}

	/**
	 * Position elements for the player display.
	 */
	private positionPlayerElements(): void {
		this.handCountText.position.set(200, 115);

		this.totalScoreText.position.set(422, 155);
		this.scoreBackground.position = this.totalScoreText.position;

		this.healthIcon1.position.set(160, 200);
		this.healthIcon2.position.set(205, 200);

		if (this.passButton) {
			this.passButton.position.set(260, 185);
		}
	}

	/**
	 * Position elements for the enemy display.
	 */
	private positionEnemyElements(): void {
		this.totalScoreText.position.set(422, 110);
		this.scoreBackground.position = this.totalScoreText.position;
		this.handCountText.position.set(200, 165);

		this.healthIcon1.position.set(160, 80);
		this.healthIcon2.position.set(205, 80);
	}

	/**
	 * Watch card containers to automatically update total score.
	 * @param containers Array of CardContainer instances to watch
	 */
	public watchContainers(containers: CardContainer[]): void {
		this.unwatchContainers();

		this._watchedContainers = containers;

		containers.forEach((container) => {
			const updateScore = () => this.updateTotalScore();
			container.on("cardAdded", updateScore);
			container.on("cardRemoved", updateScore);
		});

		this.updateTotalScore();
	}

	/**
	 * Remove listeners from watched containers.
	 */
	public unwatchContainers(): void {
		this._watchedContainers.forEach((container) => {
			container.off("cardAdded", this.updateTotalScore);
			container.off("cardRemoved", this.updateTotalScore);
		});
		this._watchedContainers = [];
	}

	/**
	 * Cleanup method to remove all event listeners.
	 */
	public destroy(): void {
		this.unwatchContainers();
		super.destroy();
	}

	// Private Methods
	private createTextStyles(): void {
		const nameStyle = new TextStyle({
			fontFamily: "Arial",
			fontSize: 28,
			fontWeight: "bold",
			fill: this._isEnemy ? 0xe24a4a : 0x4a90e2,
			stroke: { color: 0x000000, width: 2 },
		});

		const scoreStyle = new TextStyle({
			fontFamily: "Arial",
			fontSize: 60,
			fontWeight: "bold",
			fill: "#ffd500",
			stroke: { color: "#000000", width: 1 },
			dropShadow: {
				distance: 2,
				angle: 1.5,
				blur: 2,
				color: "#000000",
				alpha: 1,
			},
		});

		const handCountStyle = new TextStyle({
			fontFamily: "Arial",
			fontSize: 40,
			fontWeight: "bold",
			fill: "#fccb81",
			stroke: { color: "#000000", width: 1 },
		});

		this.playerNameText = new Text({
			text: "",
			style: nameStyle,
			anchor: 0.5,
		});

		this.totalScoreText = new Text({
			text: "0",
			style: scoreStyle,
			anchor: 0.5,
		});

		this.handCountText = new Text({
			text: "0",
			style: handCountStyle,
			anchor: 0.5,
		});
	}

	private createTextElements(playerName: string): void {
		this.playerNameText.text = playerName;

		this.addChild(this.playerNameText);
		this.addChild(this.totalScoreText);
		this.addChild(this.handCountText);
	}

	private createScoreBackground(): void {
		this.scoreBackground = new Graphics();

		const radius = 50;

		const gradient = new FillGradient(0, 0, 0, radius / 2)
			.addColorStop(0, new Color("#00b6b3"))
			.addColorStop(1, new Color("#0079c0"));

		this.scoreBackground.circle(0, 0, radius);
		this.scoreBackground.fill(gradient);

		this.scoreBackground.circle(0, 0, radius);
		this.scoreBackground.stroke({
			color: 0x000000,
			width: 2,
			alpha: 1,
		});

		this.scoreBackground.filters = [ANTIALIAS_FILTER];

		this.addChild(this.scoreBackground);
	}

	private createHealthIcons(): void {
		const healthTexture = PixiAssets.get("health_gold");

		this.healthIcon1 = new Sprite(healthTexture);
		this.healthIcon1.anchor.set(0.5);

		this.healthIcon2 = new Sprite(healthTexture);
		this.healthIcon2.anchor.set(0.5);

		this.addChild(this.healthIcon1);
		this.addChild(this.healthIcon2);
	}

	private createPassButton(): void {
		this.passButton = new PassButton(() => this.onPassButtonClick());
		this.addChild(this.passButton);
	}

	private async onPassButtonClick(): Promise<void> {
		if (this._gameController) {
			if (!this._gameController.canPlayerAct) {
				return;
			}
			await this._gameController.sendPassTurn();
		}
	}

	private updateTotalScore(): void {
		const totalScore = this._watchedContainers.reduce((sum, container) => {
			const cards = container.getAllCards();
			const containerScore = cards.reduce(
				(cardSum, card) => cardSum + card.cardData.score,
				0
			);
			return sum + containerScore;
		}, 0);

		this.setTotalScore(totalScore);
	}
}

export interface PlayerDisplayData {
	playerName: string;
	isEnemy?: boolean;
	position: { x: number; y: number };
	gameController?: GameController; // Optional - only needed for player (not enemy)
}
