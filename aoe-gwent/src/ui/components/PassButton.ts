import { Text } from "pixi.js";
import { PixiGraphics, PixiText } from "../../plugins/engine";
import { Button } from "./Button";

export class PassButton extends Button {
	private _background: PixiGraphics;
	private _label: PixiText;
	private _enabled: boolean = false;

	constructor(onClick: () => void) {
		const width = 400;
		const height = 80;
		super(onClick, width, height);

		this._background = new PixiGraphics();
		this._background.rect(0, 0, width, height).fill(0xfccb81);
		this._background.stroke({ width: 2, color: 0x000000 });
		this.addChild(this._background);

		this._label = new Text({
			text: "PASS",
			style: {
				fontFamily: "Arial",
				fontSize: 40,
				fontWeight: "bold",
				fill: 0x000000,
			},
		});

		this._label.x = (width - this._label.width) / 2;
		this._label.y = (height - this._label.height) / 2;
		this.addChild(this._label);

		this.on("pointerdown", this.onPassPointerDown.bind(this));
		this.on("pointerup", this.onPassPointerUp.bind(this));
		this.on("pointerover", this.onPassPointerOver.bind(this));
		this.on("pointerout", this.onPassPointerOut.bind(this));

		this.setEnabled(false);
	}

	public setEnabled(enabled: boolean): void {
		this._enabled = enabled;
		this.interactive = enabled;
		this.cursor = enabled ? "pointer" : "default";

		if (enabled) {
			this._background.tint = 0xffffff;
			this._background.alpha = 1.0;
			this._label.alpha = 1.0;
		} else {
			this._background.tint = 0x888888;
			this._background.alpha = 0.5;
			this._label.alpha = 0.5;
		}
	}

	public get enabled(): boolean {
		return this._enabled;
	}

	private onPassPointerDown(): void {
		if (!this._enabled) return;
		this._background.tint = 0xcccccc;
		this.alpha = 1;
	}

	private onPassPointerUp(): void {
		if (!this._enabled) return;
		this._background.tint = 0xffffff;
		this.alpha = 1;
	}

	private onPassPointerOver(): void {
		if (!this._enabled) return;
		this._background.tint = 0xeeeeee;
	}

	private onPassPointerOut(): void {
		if (!this._enabled) return;
		this._background.tint = 0xffffff;
	}
}
