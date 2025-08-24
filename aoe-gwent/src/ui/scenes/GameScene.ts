import { PixiContainer, PixiSprite, PixiGraphics } from "../../plugins/engine";
import { Manager, SceneInterface } from "../../entities/manager";
import { Faction, CardData, CardContainerManager } from "../../entities/card";
import { Button } from "../components";
import { Sprite } from "pixi.js";

export class GameScene extends PixiContainer implements SceneInterface {
	private _blackBackground: PixiGraphics;
	private _gameBoard: Sprite;
	private _originalBoardWidth: number;
	private _originalBoardHeight: number;

	private _cardContainers: CardContainerManager;

	private _addButton!: Button;
	private _removeButton!: Button;
	private _transferButton!: Button;
	private _multiTransferButton!: Button;

	constructor() {
		super();
		this.interactive = true;

		this._blackBackground = new PixiGraphics();
		this._blackBackground.rect(0, 0, 1, 1).fill(0x000000);
		this.addChild(this._blackBackground);

		this._gameBoard = PixiSprite.from("background");

		this._originalBoardWidth = this._gameBoard.width;
		this._originalBoardHeight = this._gameBoard.height;

		this.addChild(this._gameBoard);

		this._cardContainers = new CardContainerManager();

		this.createCardContainers();
		this.createTestUI();

		this.resizeAndCenter(Manager.width, Manager.height);
	}

	private createCardContainers(): void {
		const boardWidth = this._gameBoard.width;
		const boardHeight = this._gameBoard.height;

		// Position player hand container (bottom)
		this._cardContainers.player.hand.x = boardWidth / 2 - 300;
		this._cardContainers.player.hand.y = boardHeight - 80;
		this._gameBoard.addChild(this._cardContainers.player.hand);

		// Position enemy hand container (top)
		this._cardContainers.enemy.hand.x = boardWidth / 2 - 300;
		this._cardContainers.enemy.hand.y = 20;
		this._gameBoard.addChild(this._cardContainers.enemy.hand);

		// Position player playable rows (bottom half)
		this._cardContainers.player.infantry.x = boardWidth / 2 - 250;
		this._cardContainers.player.infantry.y = boardHeight * 0.7;
		this._gameBoard.addChild(this._cardContainers.player.infantry);

		this._cardContainers.player.ranged.x = boardWidth / 2 - 250;
		this._cardContainers.player.ranged.y = boardHeight * 0.6;
		this._gameBoard.addChild(this._cardContainers.player.ranged);

		this._cardContainers.player.siege.x = boardWidth / 2 - 250;
		this._cardContainers.player.siege.y = boardHeight * 0.5;
		this._gameBoard.addChild(this._cardContainers.player.siege);

		// Position enemy playable rows (top half)
		this._cardContainers.enemy.infantry.x = boardWidth / 2 - 250;
		this._cardContainers.enemy.infantry.y = boardHeight * 0.15;
		this._gameBoard.addChild(this._cardContainers.enemy.infantry);

		this._cardContainers.enemy.ranged.x = boardWidth / 2 - 250;
		this._cardContainers.enemy.ranged.y = boardHeight * 0.25;
		this._gameBoard.addChild(this._cardContainers.enemy.ranged);

		this._cardContainers.enemy.siege.x = boardWidth / 2 - 250;
		this._cardContainers.enemy.siege.y = boardHeight * 0.35;
		this._gameBoard.addChild(this._cardContainers.enemy.siege);

		// Position discard containers
		this._cardContainers.player.discard.x = boardWidth - 150;
		this._cardContainers.player.discard.y = boardHeight - 120;
		this._gameBoard.addChild(this._cardContainers.player.discard);

		this._cardContainers.enemy.discard.x = boardWidth - 150;
		this._cardContainers.enemy.discard.y = 40;
		this._gameBoard.addChild(this._cardContainers.enemy.discard);

		// Position deck containers
		this._cardContainers.player.deck.x = 30;
		this._cardContainers.player.deck.y = boardHeight - 120;
		this._gameBoard.addChild(this._cardContainers.player.deck);

		this._cardContainers.enemy.deck.x = 30;
		this._cardContainers.enemy.deck.y = 40;
		this._gameBoard.addChild(this._cardContainers.enemy.deck);

		// Position weather container
		this._cardContainers.weather.x = 50;
		this._cardContainers.weather.y = boardHeight / 2 - 50;
		this._gameBoard.addChild(this._cardContainers.weather);

		this.addSampleCards();
	}

	private addSampleCards(): void {
		// Add cards to player hand
		for (let i = 0; i < 7; i++) {
			const cardData: CardData = {
				name: `Britons Knight ${6 + i}`,
				faction: Faction.BRITONS,
				score: 6 + i,
				faceTexture: "knight",
			};
			this._cardContainers.player.hand.addCard(cardData);
		}

		// Add cards to enemy hand
		for (let i = 0; i < 6; i++) {
			const cardData: CardData = {
				name: `Franks Knight ${5 + i}`,
				faction: Faction.FRANKS,
				score: 5 + i,
				faceTexture: "knight",
			};
			this._cardContainers.enemy.hand.addCard(cardData);
		}

		// Add cards to player infantry row
		for (let i = 0; i < 2; i++) {
			const cardData: CardData = {
				name: `Britons Infantry ${8 + i}`,
				faction: Faction.BRITONS,
				score: 8 + i,
				faceTexture: "knight",
			};
			this._cardContainers.player.infantry.addCard(cardData);
		}

		// Add cards to enemy infantry row
		for (let i = 0; i < 2; i++) {
			const cardData: CardData = {
				name: `Franks Infantry ${7 + i}`,
				faction: Faction.FRANKS,
				score: 7 + i,
				faceTexture: "knight",
			};
			this._cardContainers.enemy.infantry.addCard(cardData);
		}

		// Add cards to player ranged row
		for (let i = 0; i < 3; i++) {
			const cardData: CardData = {
				name: `Britons Ranged ${5 + i}`,
				faction: Faction.BRITONS,
				score: 5 + i,
				faceTexture: "knight",
			};
			this._cardContainers.player.ranged.addCard(cardData);
		}

		// Add cards to enemy ranged row
		for (let i = 0; i < 3; i++) {
			const cardData: CardData = {
				name: `Franks Ranged ${4 + i}`,
				faction: Faction.FRANKS,
				score: 4 + i,
				faceTexture: "knight",
			};
			this._cardContainers.enemy.ranged.addCard(cardData);
		}

		// Add single cards to siege rows
		const playerSiegeCard: CardData = {
			name: "Britons Siege Engine",
			faction: Faction.BRITONS,
			score: 9,
			faceTexture: "knight",
		};
		this._cardContainers.player.siege.addCard(playerSiegeCard);

		const enemySiegeCard: CardData = {
			name: "Franks Siege Engine",
			faction: Faction.FRANKS,
			score: 8,
			faceTexture: "knight",
		};
		this._cardContainers.enemy.siege.addCard(enemySiegeCard);

		// Add cards to discard piles
		const playerDiscardCard: CardData = {
			name: "Discarded Britons Knight",
			faction: Faction.BRITONS,
			score: 3,
			faceTexture: "knight",
		};
		this._cardContainers.player.discard.addCard(playerDiscardCard);

		const enemyDiscardCard: CardData = {
			name: "Discarded Franks Knight",
			faction: Faction.FRANKS,
			score: 2,
			faceTexture: "knight",
		};
		this._cardContainers.enemy.discard.addCard(enemyDiscardCard);

		// Add cards to deck piles (stacked)
		for (let i = 0; i < 15; i++) {
			const playerDeckCard: CardData = {
				name: "Deck Card",
				faction: Faction.BRITONS,
				score: 1,
				faceTexture: "knight",
			};
			this._cardContainers.player.deck.addCard(playerDeckCard);

			const enemyDeckCard: CardData = {
				name: "Deck Card",
				faction: Faction.FRANKS,
				score: 1,
				faceTexture: "knight",
			};
			this._cardContainers.enemy.deck.addCard(enemyDeckCard);
		}

		for (let i = 0; i < 2; i++) {
			const weatherCard: CardData = {
				name: `Weather Card ${i + 1}`,
				faction: Faction.BRITONS,
				score: 0,
				faceTexture: "knight",
			};
			this._cardContainers.weather.addCard(weatherCard);
		}
	}

	private createTestUI(): void {
		this._addButton = new Button(
			"Add Card",
			() => {
				this.addRandomCardToPlayer();
			},
			100,
			35
		);
		this._addButton.x = 50;
		this._addButton.y = 50;
		this.addChild(this._addButton);

		this._removeButton = new Button(
			"Remove Card",
			() => {
				this._cardContainers.player.hand.removeCard();
			},
			100,
			35
		);
		this._removeButton.x = 160;
		this._removeButton.y = 50;
		this.addChild(this._removeButton);

		this._transferButton = new Button(
			"Transfer Card",
			() => {
				this.transferCard();
			},
			120,
			35
		);
		this._transferButton.x = 270;
		this._transferButton.y = 50;
		this.addChild(this._transferButton);

		this._multiTransferButton = new Button(
			"Transfer 3",
			() => {
				this.transferMultipleCards();
			},
			100,
			35
		);
		this._multiTransferButton.x = 400;
		this._multiTransferButton.y = 50;
		this.addChild(this._multiTransferButton);
	}

	private addRandomCardToPlayer(): void {
		const factions = [Faction.BRITONS, Faction.FRANKS];
		const randomFaction = factions[Math.floor(Math.random() * factions.length)];
		const randomScore = Math.floor(Math.random() * 10) + 1;

		const cardData: CardData = {
			name: `${randomFaction} Knight`,
			faction: randomFaction,
			score: randomScore,
			faceTexture: "knight",
		};

		this._cardContainers.player.hand.addCard(cardData);
	}

	private async transferCard(): Promise<void> {
		if (this._cardContainers.player.hand.cardCount > 0) {
			// Transfer the first card from player hand to player infantry row
			await this._cardContainers.player.hand.transferCardTo(
				0,
				this._cardContainers.player.infantry
			);
		}
	}

	private async transferMultipleCards(): Promise<void> {
		const cardsToTransfer = Math.min(
			3,
			this._cardContainers.player.hand.cardCount
		);

		for (let i = 0; i < cardsToTransfer; i++) {
			// Add slight delay between each transfer (50ms)
			if (i > 0) {
				await new Promise((resolve) => setTimeout(resolve, 50));
			}

			if (this._cardContainers.player.hand.cardCount > 0) {
				// Always transfer index 0 since cards shift when removed
				this._cardContainers.player.hand.transferCardTo(
					0,
					this._cardContainers.player.ranged
				);
			}
		}
	}

	private resizeAndCenter(screenWidth: number, screenHeight: number): void {
		this._blackBackground.width = screenWidth;
		this._blackBackground.height = screenHeight;

		const scaleX = screenWidth / this._originalBoardWidth;
		const scaleY = screenHeight / this._originalBoardHeight;
		const scale = Math.min(scaleX, scaleY);

		this._gameBoard.width = this._originalBoardWidth * scale;
		this._gameBoard.height = this._originalBoardHeight * scale;

		this._gameBoard.x = (screenWidth - this._gameBoard.width) / 2;
		this._gameBoard.y = (screenHeight - this._gameBoard.height) / 2;
	}

	update(_framesPassed: number): void {}

	resize(width: number, height: number): void {
		this.resizeAndCenter(width, height);
	}
}
