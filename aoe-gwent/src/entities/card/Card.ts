import { PixiContainer, PixiSprite, PixiText } from "../../plugins/engine";

export enum Faction {
	BRITONS = "britons",
	FRANKS = "franks",
}

export interface CardData {
	name: string;
	faction: Faction;
	score: number;
	faceTexture: string;
}

export class Card extends PixiContainer {
	private _cardData: CardData;
	private _cardBack!: PixiSprite;
	private _cardFace!: PixiSprite;
	private _cardBorder!: PixiSprite;
	private _scoreText!: PixiText;
	private _showingBack: boolean = false;

	constructor(cardData: CardData) {
		super();
		this._cardData = cardData;

		this.scale.set(0.5);

		this.createCard();
		this.interactive = true;
		this.cursor = "pointer";
	}

	private createCard(): void {
		this._cardBack = PixiSprite.from("card_back");
		this._cardBack.anchor.set(0.5);
		this._cardBack.visible = false;
		this.addChild(this._cardBack);

		this._cardFace = PixiSprite.from(this._cardData.faceTexture);
		this._cardFace.anchor.set(0.5);
		this._cardFace.visible = true;
		this.addChild(this._cardFace);

		this._cardBorder = PixiSprite.from("card_border");
		this._cardBorder.anchor.set(0.5);
		this.addChild(this._cardBorder);

		this._scoreText = new PixiText({
			text: this._cardData.score.toString(),
			style: {
				fontFamily: "Arial",
				fontSize: 80,
				fontWeight: "bold",
				fill: 0xffffff,
				stroke: { color: 0x000000, width: 10 },
				padding: 2,
			},
		});

		this._scoreText.anchor.set(0, 0.5);
		this._scoreText.x = -this._cardBack.width / 2 + 30;
		this._scoreText.y = -this._cardBack.height / 2 + 70;
		this._scoreText.visible = true;
		this.addChild(this._scoreText);
	}

	public get cardData(): CardData {
		return this._cardData;
	}

	public get showingBack(): boolean {
		return this._showingBack;
	}

	public setScore(newScore: number): void {
		this._cardData.score = newScore;
		this._scoreText.text = newScore.toString();
	}

	/**
	 * Show the card back (hidden state) without animation.
	 * Useful for deck cards that should always be hidden.
	 */
	public showBack(): void {
		this._showingBack = true;
		this._cardBack.visible = true;
		this._cardFace.visible = false;
		this._scoreText.visible = false;
	}

	/**
	 * Show the card front (revealed state) without animation.
	 * This is the default state for all cards except those in decks.
	 */
	public showFront(): void {
		this._showingBack = false;
		this._cardBack.visible = false;
		this._cardFace.visible = true;
		this._scoreText.visible = true;
	}
}
