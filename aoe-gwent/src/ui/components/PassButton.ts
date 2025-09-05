import { Text } from "pixi.js";
import { PixiGraphics, PixiText } from "../../plugins/engine";
import { Button } from "./Button";

export class PassButton extends Button {
	private _background: PixiGraphics;
	private _label: PixiText;

	constructor(onClick: () => void) {
		const width = 120;
		const height = 50;
		super(onClick, width, height);

		this._background = new PixiGraphics();
		this._background.rect(0, 0, width, height).fill(0xfccb81);
		this._background.stroke({ width: 2, color: 0x000000 });
		this.addChild(this._background);

		this._label = new Text({
			text: "PASS",
			style: {
				fontFamily: "Arial",
				fontSize: 20,
				fontWeight: "bold",
				fill: 0x000000,
			},
		});

		this._label.x = (width - this._label.width) / 2;
		this._label.y = (height - this._label.height) / 2;
		this.addChild(this._label);

		// Override interaction handlers for visual feedback
		this.on("pointerdown", this.onPassPointerDown.bind(this));
		this.on("pointerup", this.onPassPointerUp.bind(this));
		this.on("pointerover", this.onPassPointerOver.bind(this));
		this.on("pointerout", this.onPassPointerOut.bind(this));
	}

	private onPassPointerDown(): void {
		this._background.tint = 0xcccccc;
		this.alpha = 1.0;
	}

	private onPassPointerUp(): void {
		this._background.tint = 0xffffff;
		this.alpha = 1.0;
	}

	private onPassPointerOver(): void {
		this._background.tint = 0xeeeeee;
	}

	private onPassPointerOut(): void {
		this._background.tint = 0xffffff;
	}
}
