import { Container, NineSliceSprite, Texture, TilingSprite } from "pixi.js";

export type DialogFillStyle = "leather" | "old_paper" | "wood" | "dirt";

export class BorderDialog extends Container {
	constructor(
		width: number,
		height: number,
		fillStyle: DialogFillStyle = "leather"
	) {
		super();

		const border = new NineSliceSprite({
			texture: Texture.from("golden_border"),
			leftWidth: 15,
			topHeight: 15,
			rightWidth: 15,
			bottomHeight: 15,
			width,
			height,
		});

		const inner = new TilingSprite({
			texture: Texture.from(fillStyle),
			width: border.width - 20,
			height: border.height - 20,
		});
		inner.x = 10;
		inner.y = 10;

		this.addChild(inner, border);
	}
}
