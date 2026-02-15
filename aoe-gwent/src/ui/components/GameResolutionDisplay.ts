import { gsap } from "gsap";
import {
	Container,
	NineSliceSprite,
	Rectangle,
	Sprite,
	Text,
	TextStyle,
	Texture,
} from "pixi.js";
import { GameManager } from "../../shared/game/GameManager";
import { PlayerID } from "../../shared/types";
import { FontStyles } from "../../shared/FontStyles";
import { GameResolutionTableData } from "./GameResolutionTableData";
import { BorderDialog } from "./BorderDialog";
import { Button } from "./Button";

export class GameResolutionDisplay extends Container {
	public readonly continueButton: Button;

	private readonly _victoryText: Text;
	private readonly _gameManager: GameManager;

	private _tableData!: GameResolutionTableData;
	private _continueText!: Text;

	private _labelStyle = new TextStyle({
		fontFamily: "Arial",
		fontSize: 28,
		fill: "#291205",
		fontWeight: "bold",
	});

	constructor(gameManager: GameManager, playerName: string, enemyName: string) {
		super();

		this._gameManager = gameManager;

		const background = Sprite.from("resolution_dialog_fill");
		background.tint = "#dbdbdb";
		background.anchor.set(0.5);
		background.width = 600;
		background.height = 300;
		background.y = 70;
		this.addChild(background);

		const border = new NineSliceSprite({
			texture: Texture.from("golden_border"),
			leftWidth: 15,
			topHeight: 15,
			rightWidth: 15,
			bottomHeight: 15,
			width: background.width + 10,
			height: background.height + 10,
		});

		border.y = background.y;
		border.pivot.set(border.width / 2, border.height / 2);
		this.addChild(border);

		const header = Sprite.from("resolution_dialog_header");
		header.anchor.set(0.5);
		header.scale.set(1.2);
		header.y = -150;
		this.addChild(header);

		this._victoryText = new Text({
			text: "VICTORY!",
			style: new TextStyle({
				...FontStyles.scoreTextStyle,
				fontSize: 70,
			}),
			anchor: 0.5,
			y: -130,
		});

		const tableContainer = this.createTableContainer(playerName, enemyName);

		this.continueButton = this.createContinueButton();
		this.continueButton.x = -this.continueButton.width / 2;
		this.continueButton.y = 184;

		this.addChild(this._victoryText, this.continueButton, tableContainer);

		this.interactive = false;
		this.eventMode = "auto";

		this.alpha = 0;
		this.visible = false;
	}

	/**
	 * Show the display
	 */
	public show(): GSAPTimeline {
		this.updateTableContent();

		const timeline = gsap.timeline();

		timeline
			.add(() => {
				this.alpha = 0;
				this.visible = true;
			})
			.to(this, {
				alpha: 1,
				duration: 0.4,
				ease: "power2.out",
			});
		return timeline;
	}

	public hide(): GSAPTimeline {
		const timeline = gsap.timeline();

		timeline.to(this, {
			alpha: 0,
			duration: 0.4,
			ease: "power2.in",
			onComplete: () => {
				this.visible = false;
			},
		});

		return timeline;
	}

	private createTableContainer(
		playerName: string,
		enemyName: string
	): Container {
		const headerStyle = new TextStyle({
			fontFamily: "Arial",
			fontSize: 30,
			fill: "#291205",
			fontWeight: "bold",
		});

		const playerHeader = new Text({
			text: playerName,
			style: headerStyle,
			anchor: 0.5,
		});

		const opponentHeader = new Text({
			text: enemyName,
			style: headerStyle,
			anchor: 0.5,
		});

		this._tableData = new GameResolutionTableData(60, 200, this._labelStyle);

		playerHeader.position.set(-50, -20);
		opponentHeader.position.set(151, -20);

		this._tableData.x = -250;
		this._tableData.y = 30;

		const tableContainer = new Container();
		tableContainer.addChild(playerHeader, opponentHeader, this._tableData);

		return tableContainer;
	}

	private createContinueButton(): Button {
		this._continueText = new Text({
			text: "Continue",
			style: new TextStyle({
				...FontStyles.scoreTextStyle,
				fontSize: 36,
			}),
		});

		const buttonBackground = new BorderDialog(250, 70, "dirt");

		this._continueText.x =
			(buttonBackground.width - this._continueText.width) / 2;
		this._continueText.y =
			(buttonBackground.height - this._continueText.height) / 2;

		const button = new Button(() => {});

		button.hitArea = new Rectangle(
			0,
			0,
			buttonBackground.width,
			buttonBackground.height
		);

		// Prevent defaults
		button.off("pointerdown");
		button.off("pointerup");

		button.on("pointerdown", () => (button.tint = 0xaaaaaa));
		button.on("pointerleave", () => (button.tint = 0xffffff));
		button.on("pointerup", () =>
			this.hide().then(() => (button.tint = 0xffffff))
		);

		button.addChild(buttonBackground, this._continueText);

		return button;
	}

	private updateTableContent(): void {
		const roundScores = this._gameManager.roundScores;

		const winner = this._gameManager.gameData.gameWinner;

		let tint = "#ffffff";
		let text = "VICTORY!";

		if (winner === PlayerID.OPPONENT) {
			tint = "#ff4444";
			text = "DEFEAT!";
		} else if (winner === null) {
			text = "DRAW!";
		}

		this._victoryText.tint = tint;
		this._victoryText.text = text;

		roundScores.forEach((score, index) => {
			const row = this._tableData.roundScoreRows[index];
			if (!row) return;

			row.playerScore.text = score.playerScore.toString();
			row.enemyScore.text = score.enemyScore.toString();
		});
	}
}
