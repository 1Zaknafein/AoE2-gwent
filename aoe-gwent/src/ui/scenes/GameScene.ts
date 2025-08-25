import { PixiContainer, PixiSprite } from "../../plugins/engine";
import { Manager, SceneInterface } from "../../entities/manager";
import { Faction, CardData, CardContainerManager } from "../../entities/card";
import { Button } from "../components";
import { CardInteractionManager } from "../managers";
import { Sprite } from "pixi.js";

export class GameScene extends PixiContainer implements SceneInterface {
	private _gameBoard: Sprite;
	private _originalBoardWidth: number;
	private _originalBoardHeight: number;

	private _cardContainers: CardContainerManager;
	private _cardInteractionManager: CardInteractionManager;

	private _addButton!: Button;
	private _removeButton!: Button;
	private _transferButton!: Button;
	private _multiTransferButton!: Button;

	constructor() {
		super();
		this.interactive = true;

		this._gameBoard = PixiSprite.from("background");

		this._gameBoard.label = "game_board";

		this._originalBoardWidth = this._gameBoard.width;
		this._originalBoardHeight = this._gameBoard.height;

		this.addChild(this._gameBoard);

		this._cardContainers = new CardContainerManager();
		this._cardInteractionManager = new CardInteractionManager(
			this._cardContainers
		);

		this.createCardContainers();
		this.createTestUI();

		this.resizeAndCenter(Manager.width, Manager.height);
	}

	private createCardContainers(): void {
		const boardWidth = this._gameBoard.width;
		const boardHeight = this._gameBoard.height;
		const gameAreaCenterX = boardWidth / 2 + 110;

		const { player, enemy, weather } = this._cardContainers;

		[
			player.infantry,
			player.ranged,
			player.siege,
			enemy.infantry,
			enemy.ranged,
			enemy.siege,
		].forEach((row) => row.scale.set(0.67));

		[player.deck, enemy.deck].forEach((deck) => deck.scale.set(0.95));

		[weather, player.hand, enemy.hand, player.discard, enemy.discard].forEach(
			(hand) => hand.scale.set(0.8)
		);

		player.hand.setPosition(gameAreaCenterX, boardHeight - 235);
		player.infantry.setPosition(gameAreaCenterX, 658);
		player.ranged.setPosition(gameAreaCenterX, 835);
		player.siege.setPosition(gameAreaCenterX, 1015);
		player.deck.setPosition(boardWidth - 105, boardHeight - 265);

		player.discard.setPosition(2132, 1200);

		enemy.hand.setPosition(gameAreaCenterX, -110);
		enemy.infantry.setPosition(gameAreaCenterX, 458);
		enemy.ranged.setPosition(gameAreaCenterX, 275);
		enemy.siege.setPosition(gameAreaCenterX, 99);
		enemy.discard.setPosition(2129, 196);
		enemy.deck.setPosition(boardWidth - 105, 155);

		weather.setPosition(315, boardHeight / 2 - 5);

		this._gameBoard.addChild(
			player.infantry,
			player.ranged,
			player.siege,
			player.hand,
			player.discard,
			player.deck,
			enemy.infantry,
			enemy.ranged,
			enemy.siege,
			enemy.hand,
			enemy.discard,
			enemy.deck,
			weather
		);

		this._cardInteractionManager.setupContainerInteractivity();
		this.addSampleCards();
		this._cardInteractionManager.setupPlayerHandInteractions();

		this.on("pointerup", () =>
			this._cardInteractionManager.handleGlobalClick()
		);
	}

	private addSampleCards(): void {
		// Create card arrays for batch addition

		// Player hand cards
		const playerHandCards: CardData[] = [];
		for (let i = 0; i < 7; i++) {
			const cardTypes = ["archer", "knight", "steppe_lancer"];
			const cardType = cardTypes[i % cardTypes.length];
			const cardName =
				cardType.charAt(0).toUpperCase() + cardType.slice(1).replace("_", " ");
			playerHandCards.push({
				name: `Britons ${cardName} ${6 + i}`,
				faction: Faction.BRITONS,
				score: 6 + i,
				faceTexture: cardType,
			});
		}
		this._cardContainers.player.hand.addCardsBatch(playerHandCards);

		// Enemy hand cards
		const enemyHandCards: CardData[] = [];
		for (let i = 0; i < 6; i++) {
			const cardTypes = ["archer", "knight", "steppe_lancer"];
			const cardType = cardTypes[i % cardTypes.length];
			const cardName =
				cardType.charAt(0).toUpperCase() + cardType.slice(1).replace("_", " ");
			enemyHandCards.push({
				name: `Franks ${cardName} ${5 + i}`,
				faction: Faction.FRANKS,
				score: 5 + i,
				faceTexture: cardType,
			});
		}
		this._cardContainers.enemy.hand.addCardsBatch(enemyHandCards);

		// Player infantry row cards
		const playerInfantryCards: CardData[] = [];
		for (let i = 0; i < 2; i++) {
			playerInfantryCards.push({
				name: `Britons Infantry ${8 + i}`,
				faction: Faction.BRITONS,
				score: 8 + i,
				faceTexture: "knight",
			});
		}
		this._cardContainers.player.infantry.addCardsBatch(playerInfantryCards);

		// Enemy infantry row cards
		const enemyInfantryCards: CardData[] = [];
		for (let i = 0; i < 2; i++) {
			enemyInfantryCards.push({
				name: `Franks Infantry ${7 + i}`,
				faction: Faction.FRANKS,
				score: 7 + i,
				faceTexture: "knight",
			});
		}
		this._cardContainers.enemy.infantry.addCardsBatch(enemyInfantryCards);

		// Player ranged row cards
		const playerRangedCards: CardData[] = [];
		for (let i = 0; i < 3; i++) {
			playerRangedCards.push({
				name: `Britons Archer ${5 + i}`,
				faction: Faction.BRITONS,
				score: 5 + i,
				faceTexture: "archer",
			});
		}
		this._cardContainers.player.ranged.addCardsBatch(playerRangedCards);

		// Enemy ranged row cards
		const enemyRangedCards: CardData[] = [];
		for (let i = 0; i < 3; i++) {
			enemyRangedCards.push({
				name: `Franks Archer ${4 + i}`,
				faction: Faction.FRANKS,
				score: 4 + i,
				faceTexture: "archer",
			});
		}
		this._cardContainers.enemy.ranged.addCardsBatch(enemyRangedCards);

		// Add single cards to siege rows
		const playerSiegeCard: CardData = {
			name: "Britons Siege Engine",
			faction: Faction.BRITONS,
			score: 9,
			faceTexture: "steppe_lancer",
		};
		this._cardContainers.player.siege.addCard(playerSiegeCard);

		const enemySiegeCard: CardData = {
			name: "Franks Siege Engine",
			faction: Faction.FRANKS,
			score: 8,
			faceTexture: "steppe_lancer",
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

		// Create weather cards for batch addition
		const weatherCards: CardData[] = [];
		for (let i = 0; i < 2; i++) {
			weatherCards.push({
				name: `Weather Card ${i + 1}`,
				faction: Faction.BRITONS,
				score: 0,
				faceTexture: "archer",
			});
		}
		this._cardContainers.weather.addCardsBatch(weatherCards);
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
		const cardTypes = ["archer", "knight", "steppe_lancer"];
		const randomFaction = factions[Math.floor(Math.random() * factions.length)];
		const randomCardType =
			cardTypes[Math.floor(Math.random() * cardTypes.length)];
		const randomScore = Math.floor(Math.random() * 10) + 1;
		const cardName =
			randomCardType.charAt(0).toUpperCase() +
			randomCardType.slice(1).replace("_", " ");

		const cardData: CardData = {
			name: `${randomFaction} ${cardName}`,
			faction: randomFaction,
			score: randomScore,
			faceTexture: randomCardType,
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
