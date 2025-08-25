import type { LoaderOptions } from "../../entities/loader";

export const options: LoaderOptions = {
	manifest: {
		bundles: [
			{
				name: "sprites",
				assets: {
					background: "./sprites/background.webp",
				},
			},
			{
				name: "card_assets",
				assets: {
					card_border: "./factions/card_border.png",
					card_back: "./factions/card_back.png",
					archer: "./factions/card_faces/archer.png",
					knight: "./factions/card_faces/knight.png",
					steppe_lancer: "./factions/card_faces/steppe_lancer.png",
				},
			},
		],
	},
};
