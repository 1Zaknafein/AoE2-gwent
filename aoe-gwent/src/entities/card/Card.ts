import { PixiContainer, PixiSprite, PixiText } from "../../plugins/engine";
import { gsap } from "gsap";

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
	private _isFlipped: boolean = false;
	private _isAnimating: boolean = false;

	constructor(cardData: CardData) {
		super();
		this._cardData = cardData;

		this.scale.set(0.5);

		this.createCard();
		this.interactive = true;
		this.cursor = "pointer";
	}

	private createCard(): void {
		const backTexture = `${this._cardData.faction}_card_back`;
		this._cardBack = PixiSprite.from(backTexture);
		this._cardBack.anchor.set(0.5);
		this.addChild(this._cardBack);

		this._cardFace = PixiSprite.from(this._cardData.faceTexture);
		this._cardFace.anchor.set(0.5);
		this._cardFace.visible = false;
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
				stroke: { color: 0x000000, width: 4 },
				padding: 2,
			},
		});

		this._scoreText.anchor.set(0.5);
		this._scoreText.x = -this._cardBack.width / 2 + 40;
		this._scoreText.y = -this._cardBack.height / 2 + 40;
		this._scoreText.visible = false;
		this.addChild(this._scoreText);
	}

	public flipCard(): void {
		if (this._isAnimating) return;

		this._isAnimating = true;
		const duration = 0.3;

		gsap.to(this.scale, {
			x: 0,
			duration: duration / 2,
			ease: "power2.in",
			onComplete: () => {
				this._isFlipped = !this._isFlipped;

				if (this._isFlipped) {
					this._cardBack.visible = false;
					this._cardFace.visible = true;
				} else {
					this._cardBack.visible = true;
					this._cardFace.visible = false;
				}

				this.updateScoreVisibility();

				gsap.to(this.scale, {
					x: this.scale.y,
					duration: duration / 2,
					ease: "power2.out",
					onComplete: () => {
						this._isAnimating = false;
					},
				});
			},
		});
	}

	private onHover(): void {
		if (this._isAnimating) return;

		gsap.to(this, {
			y: this.y - 10,
			duration: 0.2,
			ease: "power2.out",
		});

		gsap.to(this.scale, {
			x: this.scale.x * 1.05,
			y: this.scale.y * 1.05,
			duration: 0.2,
			ease: "power2.out",
		});
	}

	private onHoverOut(): void {
		if (this._isAnimating) return;

		gsap.to(this, {
			y: this.y + 10,
			duration: 0.2,
			ease: "power2.out",
		});

		gsap.to(this.scale, {
			x: this.scale.x / 1.05,
			y: this.scale.y / 1.05,
			duration: 0.2,
			ease: "power2.out",
		});
	}

	public get cardData(): CardData {
		return this._cardData;
	}

	public get isFlipped(): boolean {
		return this._isFlipped;
	}

	public get isAnimating(): boolean {
		return this._isAnimating;
	}

	public setScore(newScore: number): void {
		this._cardData.score = newScore;
		this._scoreText.text = newScore.toString();
	}

	private updateScoreVisibility(): void {
		// Score is only visible when card face is visible
		this._scoreText.visible = this._cardFace.visible;
	}
}
