import { PixiContainer, PixiGraphics, PixiText } from "../../plugins/engine";

export class Button extends PixiContainer {
	private _background: PixiGraphics;
	private _label: PixiText;
	private _onClick: () => void;

	constructor(
		text: string,
		onClick: () => void,
		width: number = 120,
		height: number = 40
	) {
		super();

		this._onClick = onClick;

		this._background = new PixiGraphics();
		this._background.rect(0, 0, width, height).fill(0x4a90e2);
		this._background.stroke({ width: 2, color: 0x357abd });
		this.addChild(this._background);

		this._label = new PixiText({
			text: text,
			style: {
				fontFamily: "Arial",
				fontSize: 16,
				fontWeight: "bold",
				fill: 0xffffff,
			},
		});

		this._label.x = (width - this._label.width) / 2;
		this._label.y = (height - this._label.height) / 2;
		this.addChild(this._label);

		this.interactive = true;
		this.cursor = "pointer";

		this.on("pointerdown", this.onPointerDown.bind(this));
		this.on("pointerup", this.onPointerUp.bind(this));
		this.on("pointerover", this.onPointerOver.bind(this));
		this.on("pointerout", this.onPointerOut.bind(this));
	}

	private onPointerDown(): void {
		this._background.tint = 0xcccccc;
	}

	private onPointerUp(): void {
		this._background.tint = 0xffffff;
		this._onClick();
	}

	private onPointerOver(): void {
		this._background.tint = 0xdddddd;
	}

	private onPointerOut(): void {
		this._background.tint = 0xffffff;
	}
}
