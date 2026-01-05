import { Container, Graphics, Sprite, Text } from "pixi.js";
import { Card, CardData, CardType } from "./Card";
import gsap from "gsap";

export class CardPreview extends Container {
	public card: Card;

	private readonly _cardTitle: Text;
	private readonly _cardDescription: Text;

	constructor() {
		super();

		const cardData = {
			id: 1,
			name: "Preview Card",
			score: 0,
			type: CardType.MELEE,
		};

		this.card = new Card(cardData);
		this.card.scale.set(2);

		const midPos = this.card.width / 2;

		const bg = new Graphics();
		bg.fillStyle = { color: "#ebd098ff", alpha: 1 };
		bg.rect(0, 0, this.card.width, 300);
		bg.fill();
		bg.y = this.card.height;
		bg.pivot.set(midPos, this.card.height / 2);

		this._cardTitle = new Text();
		this._cardTitle.text = cardData.name;
		this._cardTitle.style = {
			fontFamily: "Arial",
			fontSize: 30,
			fontWeight: "bold",
			fill: "#000000",
		};
		this._cardTitle.anchor.set(0.5);
		this._cardTitle.position.set(midPos, 40);

		this._cardDescription = new Text();
		this._cardDescription.text = "This is a preview of the card.";
		this._cardDescription.style = {
			fontFamily: "Arial",
			fontSize: 20,
			fill: "#000000",
			wordWrap: true,
			wordWrapWidth: this.card.width - 20,
		};
		this._cardDescription.anchor.set(0.5);
		this._cardDescription.position.set(midPos, 100);

		bg.addChild(this._cardDescription, this._cardTitle);

		this.addChild(bg, this.card);
	}

	public show(): GSAPAnimation {
		this.visible = true;
		return gsap.to(this, { alpha: 1, duration: 0.3 });
	}

	public hide(): GSAPAnimation {
		return gsap.to(this, {
			alpha: 0,
			duration: 0.3,
			onComplete: () => {
				this.visible = false;
			},
		});
	}

	public updateCard(cardData: CardData): void {
		this.card = new Card(cardData);
		this.card.scale.set(2);

		this.updateDescription();
	}

	public updateDescription(): void {
		const name = this.card.cardData.name;
		const effect = this.card.cardData.effect;

		//const cardDescription =

		// Get effect description based on effect type

		// Get card description (from name)
	}
}
