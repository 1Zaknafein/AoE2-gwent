import type { LoaderOptions } from "../../entities/loader";

export const options: LoaderOptions = {
    manifest: {
        bundles: [
            {
                name: "sprites",
                assets: {
                    "background": "./sprites/background.webp"
                }
            },
            {
                name: "card_assets",
                assets: {
                    "card_border": "./factions/card_border.png",
                    "britons_card_back": "./factions/card_backs/britons_card_back.png",
                    "franks_card_back": "./factions/card_backs/franks_card_back.png",
                    "knight": "./factions/card_faces/knight.png"
                }
            }
        ]
    }
}