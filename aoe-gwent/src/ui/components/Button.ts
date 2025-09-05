import { PixiContainer } from "../../plugins/engine";
import { Rectangle } from "pixi.js";

export class Button extends PixiContainer {
	private _onClick: () => void;

	constructor(onClick: () => void, width: number = 120, height: number = 40) {
		super();

		this._onClick = onClick;

		// Set hitArea for interaction
		this.hitArea = new Rectangle(0, 0, width, height);
		this.interactive = true;
		this.cursor = "pointer";

		this.on("pointerdown", this.onPointerDown.bind(this));
		this.on("pointerup", this.onPointerUp.bind(this));
	}

	private onPointerDown(): void {
		// Visual feedback can be handled by child components
		this.alpha = 0.8;
	}

	private onPointerUp(): void {
		this.alpha = 1.0;
		this._onClick();
	}
}
