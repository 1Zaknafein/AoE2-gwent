import { PixiContainer } from "../../plugins/engine";
import { CardContainer } from "../../entities/card";
import { Text, TextStyle } from "pixi.js";

export class ScoreDisplay extends PixiContainer {
	// Cached text styles
	private _scoreTextStyle: TextStyle;

	// Text elements
	private _playerNameText: Text;
	private _enemyNameText: Text;
	private _playerMeleeScoreText: Text;
	private _playerRangedScoreText: Text;
	private _playerSiegeScoreText: Text;
	private _enemyMeleeScoreText: Text;
	private _enemyRangedScoreText: Text;
	private _enemySiegeScoreText: Text;

	constructor() {
		super();

		this._scoreTextStyle = new TextStyle({
			fontFamily: "Arial",
			fontSize: 34,
			fill: "#fccb81",
			stroke: { color: "#fccb81", width: 2 },
		});

		const playerNameTextStyle = new TextStyle({
			fontFamily: "Arial",
			fontSize: 32,
			fontWeight: "bold",
			fill: 0x4a90e2,
			stroke: { color: 0x000000, width: 2 },
		});

		const enemyNameTextStyle = new TextStyle({
			fontFamily: "Arial",
			fontSize: 32,
			fontWeight: "bold",
			fill: 0xe24a4a,
			stroke: { color: 0x000000, width: 2 },
		});

		this._playerNameText = new Text({
			text: "PLAYER",
			style: playerNameTextStyle,
			anchor: 0.5,
			x: 380,
			y: 1270,
		});
		this.addChild(this._playerNameText);

		this._enemyNameText = new Text({
			text: "ENEMY",
			style: enemyNameTextStyle,
			anchor: 0.5,
			x: 380,
			y: 100,
		});
		this.addChild(this._enemyNameText);

		const x = 700;

		// Player row scores
		this._playerMeleeScoreText = this.createScoreText(x, 660);
		this._playerRangedScoreText = this.createScoreText(x, 835);
		this._playerSiegeScoreText = this.createScoreText(x, 1015);

		// Enemy row scores
		this._enemyMeleeScoreText = this.createScoreText(x, 458);
		this._enemyRangedScoreText = this.createScoreText(x, 275);
		this._enemySiegeScoreText = this.createScoreText(x, 99);
	}

	private createScoreText(x: number, y: number): Text {
		const scoreText = new Text({ text: "0", style: this._scoreTextStyle });
		scoreText.anchor.set(0.5);
		scoreText.x = x;
		scoreText.y = y;
		this.addChild(scoreText);
		return scoreText;
	}

	/**
	 * Set up event listeners for automatic score updates when cards are added/removed.
	 */
	public setupScoreEventListeners(
		playerContainers: any,
		enemyContainers: any
	): void {
		// prettier-ignore
		const containerMappings = [
            { container: playerContainers.melee, scoreText: this._playerMeleeScoreText },
            { container: playerContainers.ranged, scoreText: this._playerRangedScoreText },
			{ container: playerContainers.siege, scoreText: this._playerSiegeScoreText },
			{ container: enemyContainers.melee, scoreText: this._enemyMeleeScoreText },
			{ container: enemyContainers.ranged, scoreText: this._enemyRangedScoreText },
			{ container: enemyContainers.siege, scoreText: this._enemySiegeScoreText },
		];

		containerMappings.forEach(({ container, scoreText }) => {
			const updateScore = () => this.updateRowScore(container, scoreText);
			container.on("cardAdded", updateScore);
			container.on("cardRemoved", updateScore);
		});
	}

	private updateRowScore(container: CardContainer, scoreText: Text): void {
		const cards = container.getAllCards();
		const totalScore = cards.reduce(
			(sum: number, card) => sum + card.cardData.score,
			0
		);

		scoreText.text = totalScore.toString();
	}

	/**
	 * Update player names if needed.
	 */
	public setPlayerNames(playerName: string, enemyName: string): void {
		this._playerNameText.text = playerName;
		this._enemyNameText.text = enemyName;
	}

	/**
	 * Manually update a specific row score (useful for effects that modify card strength).
	 */
	public updatePlayerMeleeScore(score: number): void {
		this._playerMeleeScoreText.text = score.toString();
	}

	public updatePlayerRangedScore(score: number): void {
		this._playerRangedScoreText.text = score.toString();
	}

	public updatePlayerSiegeScore(score: number): void {
		this._playerSiegeScoreText.text = score.toString();
	}

	public updateEnemyMeleeScore(score: number): void {
		this._enemyMeleeScoreText.text = score.toString();
	}

	public updateEnemyRangedScore(score: number): void {
		this._enemyRangedScoreText.text = score.toString();
	}

	public updateEnemySiegeScore(score: number): void {
		this._enemySiegeScoreText.text = score.toString();
	}
}
