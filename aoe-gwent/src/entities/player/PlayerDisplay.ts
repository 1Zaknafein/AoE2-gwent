import {
	Text,
	TextStyle,
	Sprite,
	Graphics,
	FillGradient,
	Color,
	AlphaFilter,
} from "pixi.js";
import { PixiContainer, PixiAssets } from "../../plugins/engine";
import { CardContainer } from "../card";

export class PlayerDisplay extends PixiContainer {
	public playerNameText!: Text;
	public totalScoreText!: Text;
	public handCountText!: Text;
	public healthIcon1!: Sprite;
	public healthIcon2!: Sprite;
	public scoreBackground!: Graphics;

	private _isEnemy: boolean;
	private _currentHandCount = 0;
	private _currentTotalScore = 0;
	private _watchedContainers: CardContainer[] = [];

	private _aaFilter: AlphaFilter;

	constructor(data: PlayerDisplayData) {
		super();

		this._aaFilter = new AlphaFilter({
			antialias: true,
			alpha: 1,
		});

		this._isEnemy = data.isEnemy || false;

		this.position.set(data.position.x, data.position.y);

		this.createTextStyles();
		this.createScoreBackground();
		this.createTextElements(data.playerName);
		this.createHealthIcons();
		this.initializeElementPositions();
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
			fontSize: 24,
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

		this.scoreBackground.filters = [this._aaFilter];

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

	// TODO Update positions to be set externally
	private initializeElementPositions(): void {
		this.playerNameText.position.set(0, 0);
		this.scoreBackground.position.set(0, 0);
		this.totalScoreText.position.set(0, 0);
		this.handCountText.position.set(0, 0);
		this.healthIcon1.position.set(0, 0);
		this.healthIcon2.position.set(0, 0);
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
}
