import { Color, FillGradient, Graphics } from "pixi.js";

export function createRedButton(
	width = 120,
	height = 36,
	radius = 6
): Graphics {
	const g = new Graphics();

	const borderColor = "#6d0c0c";
	const topColor = "#e02a2aff";
	const midColor = "#8f0303ff";
	const bottomColor = "#8e0c0cff";
	const highlightColor = "#ffffff";
	const goldOuter = "#f2c14d";
	const goldInner = "#c9972c";

	const goldGradient = new FillGradient(0, 0, 0, height)
		.addColorStop(0, new Color(goldOuter))
		.addColorStop(1, new Color(goldInner));

	const redGradient = new FillGradient(0, 0, 0, height)
		.addColorStop(0, new Color(topColor))
		.addColorStop(0.5, new Color(midColor))
		.addColorStop(1, new Color(bottomColor));

	g.roundRect(-2, -2, width + 4, height + 4, radius).fill(goldGradient);
	g.roundRect(0, 0, width, height, radius).fill(borderColor);
	g.roundRect(1, 1, width - 2, height - 2, radius - 1).fill(redGradient);
	g.roundRect(2, 2, width - 4, height * 0.45, radius - 2);
	g.fill({ color: highlightColor, alpha: 0.1 });
	g.fill({ color: 0x000000, alpha: 0.15 });

	g.pivot.set(width / 2, height / 2);

	return g;
}
