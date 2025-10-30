import { Text, TextStyle } from "pixi.js";
import { PixiContainer, PixiGraphics } from "../../plugins/engine";
import { Manager, SceneInterface } from "../../entities/manager";
import { PlayingRowContainer, HandContainer, CardContainer, CardContainerLayoutType } from "../../entities/card";
import { Card } from "../../entities/card/Card";
import { CardType } from "../../shared/types/CardTypes";
import { CardData } from "../../shared/types/CardData";
import { Deck } from "../../entities/deck";
import { gsap } from "gsap";

/**
 * Standalone test board scene for testing card interactions without server
 * Mimics Gwent-style board with 3 rows per player (Melee, Ranged, Siege)
 */
export class TestBoardScene extends PixiContainer implements SceneInterface {
	// Board containers (using specialized PlayingRowContainer)
	private _opponentMeleeRow!: PlayingRowContainer;
	private _opponentRangedRow!: PlayingRowContainer;
	private _opponentSiegeRow!: PlayingRowContainer;

	private playerMeleeRow!: PlayingRowContainer;
	private playerRangedRow!: PlayingRowContainer;
	private playerSiegeRow!: PlayingRowContainer;

	// Hand containers (using specialized HandContainer)
	private playerHand!: HandContainer;
	private opponentHand!: HandContainer;

	// Weather row (shared between players)
	private weatherRow!: CardContainer;

	// Discard piles
	private playerDiscard!: CardContainer;
	private opponentDiscard!: CardContainer;

	// Decks
	private playerDeck!: Deck;
	private opponentDeck!: Deck;

	// Main game board container (everything goes inside this)
	private gameBoard!: PixiContainer;
	private background!: PixiGraphics;

	// Layout constants (based on 16:9 aspect ratio, ~2400x1350 internal resolution)
	private readonly BOARD_WIDTH = 2400;
	private readonly BOARD_HEIGHT = 1350;
	private readonly ROW_HEIGHT = 130;
	private readonly HAND_HEIGHT = 180;
	private readonly LEFT_MARGIN = 450; // Space for player displays and weather
	private readonly RIGHT_MARGIN = 350; // Space for deck/discard
	
	// Selection state (click-to-select system like GameScene)
	private selectedCard: Card | null = null;
	private cardClickInProgress: boolean = false;

	constructor() {
		super();
		this.interactive = true;
		this.label = "test_board_scene";

		// Create game board container (like GameScene does)
		this.gameBoard = new PixiContainer();
		this.gameBoard.label = "game_board";
		this.addChild(this.gameBoard);

		this.createBackground();
		this.createBoard();
		this.createWeatherRow();
		this.createDiscardPiles();
		this.createDecks();
		this.createHands();
		this.createTestCards();
		this.createBackButton();

		// Global click handler for deselecting
		this.on('pointerup', () => this.handleGlobalClick());

		// Initial resize
		this.resizeAndCenter(Manager.width, Manager.height);

		console.log("🎮 Test Board Scene initialized");
	}

	private createBackground(): void {
		this.background = new PixiGraphics();
		
		// AOE2-themed background - will be resized to cover full screen in resize()
		// Make it very large initially to ensure coverage
		this.background.rect(0, 0, 10000, 10000);
		this.background.fill({ color: 0x1a1410 });
		
		this.gameBoard.addChild(this.background);
	}

	private createBoard(): void {
		const centerX = this.BOARD_WIDTH / 2;
		const playAreaWidth = this.BOARD_WIDTH - this.LEFT_MARGIN - this.RIGHT_MARGIN;
		
		// Fixed Y positions - better spacing to prevent overlap
		// Opponent rows (top - starting lower with proper spacing)
		this._opponentSiegeRow = new PlayingRowContainer({
			width: playAreaWidth,
			height: this.ROW_HEIGHT,
			labelText: "Opponent Siege",
			labelColor: 0xff6b6b,
			containerType: CardType.SIEGE,
		});
		this._opponentSiegeRow.position.set(centerX, 280);
		this.gameBoard.addChild(this._opponentSiegeRow);

		this._opponentRangedRow = new PlayingRowContainer({
			width: playAreaWidth,
			height: this.ROW_HEIGHT,
			labelText: "Opponent Ranged",
			labelColor: 0xff6b6b,
			containerType: CardType.RANGED,
		});
		this._opponentRangedRow.position.set(centerX, 420);
		this.gameBoard.addChild(this._opponentRangedRow);

		this._opponentMeleeRow = new PlayingRowContainer({
			width: playAreaWidth,
			height: this.ROW_HEIGHT,
			labelText: "Opponent Melee",
			labelColor: 0xff6b6b,
			containerType: CardType.MELEE,
		});
		this._opponentMeleeRow.position.set(centerX, 560);
		this.gameBoard.addChild(this._opponentMeleeRow);

		// Divider - positioned exactly between opponent melee and player melee
		const opponentMeleeY = 560;
		const playerMeleeY = 790;
		const dividerY = (opponentMeleeY + playerMeleeY) / 2; // 675
		this.createDividerWithFade(centerX, dividerY, playAreaWidth);

		// Player rows (bottom - starting right after divider with proper spacing)
		this.playerMeleeRow = new PlayingRowContainer({
			width: playAreaWidth,
			height: this.ROW_HEIGHT,
			labelText: "Your Melee",
			labelColor: 0x66cc66,
			containerType: CardType.MELEE,
		});
		this.playerMeleeRow.position.set(centerX, 790);
		this.gameBoard.addChild(this.playerMeleeRow);

		this.playerRangedRow = new PlayingRowContainer({
			width: playAreaWidth,
			height: this.ROW_HEIGHT,
			labelText: "Your Ranged",
			labelColor: 0x66cc66,
			containerType: CardType.RANGED,
		});
		this.playerRangedRow.position.set(centerX, 930);
		this.gameBoard.addChild(this.playerRangedRow);

		this.playerSiegeRow = new PlayingRowContainer({
			width: playAreaWidth,
			height: this.ROW_HEIGHT,
			labelText: "Your Siege",
			labelColor: 0x66cc66,
			containerType: CardType.SIEGE,
		});
		this.playerSiegeRow.position.set(centerX, 1070);
		this.gameBoard.addChild(this.playerSiegeRow);
		
		// Setup row click handlers
		this.setupRowInteractions();
	}

	private createDividerWithFade(centerX: number, y: number, width: number): void {
		const divider = new PixiGraphics();
		const fadeWidth = 150;
		const lineStart = centerX - width / 2;
		const lineEnd = centerX + width / 2;
		
		// Main solid line in the center
		divider.moveTo(lineStart + fadeWidth, y);
		divider.lineTo(lineEnd - fadeWidth, y);
		divider.stroke({ color: 0xffd700, width: 3, alpha: 1.0 });
		
		// Left fade - draw segments with increasing alpha
		for (let i = 0; i < fadeWidth; i += 5) {
			const alpha = i / fadeWidth;
			divider.moveTo(lineStart + i, y);
			divider.lineTo(lineStart + i + 5, y);
			divider.stroke({ color: 0xffd700, width: 3, alpha: alpha });
		}
		
		// Right fade - draw segments with decreasing alpha
		for (let i = 0; i < fadeWidth; i += 5) {
			const alpha = i / fadeWidth;
			divider.moveTo(lineEnd - i - 5, y);
			divider.lineTo(lineEnd - i, y);
			divider.stroke({ color: 0xffd700, width: 3, alpha: alpha });
		}
		
		this.gameBoard.addChild(divider);
	}

	private createHands(): void {
		const centerX = this.BOARD_WIDTH / 2;
		const handWidth = this.BOARD_WIDTH - this.LEFT_MARGIN - this.RIGHT_MARGIN;

		// Opponent hand (top)
		const opponentHandY = 110;
		this.opponentHand = new HandContainer({
			width: handWidth,
			height: this.HAND_HEIGHT,
			labelText: "Opponent Hand",
			labelColor: 0xd4af37,
			backgroundColor: 0x2a2013,
			borderColor: 0x8b6914,
			isInteractive: false,
		});
		this.opponentHand.position.set(centerX, opponentHandY);
		this.opponentHand.scale.set(1.0);
		this.gameBoard.addChild(this.opponentHand);

		// Player hand (bottom)
		const playerHandY = 1240;
		this.playerHand = new HandContainer({
			width: handWidth,
			height: this.HAND_HEIGHT,
			labelText: "Your Hand",
			labelColor: 0xd4af37,
			backgroundColor: 0x2a2013,
			borderColor: 0x8b6914,
			isInteractive: true,
		});
		this.playerHand.position.set(centerX, playerHandY);
		this.playerHand.scale.set(1.0);
		this.gameBoard.addChild(this.playerHand);
	}

	private createWeatherRow(): void {
		const weatherX = 150; 
		const weatherY = this.BOARD_HEIGHT / 2;
		const weatherWidth = 400; 
		const weatherHeight = this.ROW_HEIGHT; 

		this.weatherRow = new CardContainer(
			weatherWidth - 40, // Subtract padding for card area
			"weather",
			undefined,
			CardContainerLayoutType.STACK
		);
		
		// Create visual background for weather row
		const weatherBg = new PixiGraphics();
		const bgX = -weatherWidth / 2;
		const bgY = -weatherHeight / 2;
		
		weatherBg.rect(bgX, bgY, weatherWidth, weatherHeight);
		weatherBg.fill({ color: 0x2a2013, alpha: 0.3 });
		
		// Border
		weatherBg.stroke({ color: 0x8b6914, width: 3, alpha: 0.6 });
		weatherBg.rect(bgX + 3, bgY + 3, weatherWidth - 6, weatherHeight - 6);
		weatherBg.stroke({ color: 0xd4af37, width: 2, alpha: 0.4 });
		
		// Add label
		const labelStyle = new TextStyle({
			fontFamily: 'Cinzel, serif',
			fontSize: 12,
			fill: 0xd4af37,
			fontWeight: 'bold'
		});
		const label = new Text({ text: 'WEATHER', style: labelStyle });
		label.position.set(bgX + 10, 0);
		label.anchor.set(0, 0.5);
		label.alpha = 0.7;
		
		this.weatherRow.addChildAt(weatherBg, 0);
		this.weatherRow.addChild(label);
		
		this.weatherRow.position.set(weatherX, weatherY);
		this.weatherRow.scale.set(1.0); 
		this.weatherRow.setCardsInteractive(false);
		
		this.gameBoard.addChild(this.weatherRow);
	}

	private createDiscardPiles(): void {
		const discardWidth = 130; 
		const discardHeight = 175; 

		// Player discard (bottom right)
		this.playerDiscard = new CardContainer(
			discardWidth,
			"player_discard",
			undefined,
			CardContainerLayoutType.STACK
		);
		
		const playerDiscardBg = this.createDiscardBackground(discardWidth, discardHeight);
		this.playerDiscard.addChildAt(playerDiscardBg, 0);
		this.playerDiscard.position.set(2100, 1242);
		this.playerDiscard.setCardsInteractive(false);
		this.gameBoard.addChild(this.playerDiscard);

		// Opponent discard (top right)
		this.opponentDiscard = new CardContainer(
			discardWidth,
			"opponent_discard",
			undefined,
			CardContainerLayoutType.STACK
		);
		
		const opponentDiscardBg = this.createDiscardBackground(discardWidth, discardHeight);
		this.opponentDiscard.addChildAt(opponentDiscardBg, 0);
		this.opponentDiscard.position.set(2100, 108);
		this.opponentDiscard.setCardsInteractive(false);
		this.gameBoard.addChild(this.opponentDiscard);
	}

	private createDiscardBackground(width: number, height: number): PixiGraphics {
		const bg = new PixiGraphics();
		const bgX = -width / 2;
		const bgY = -height / 2;
		
		bg.rect(bgX, bgY, width, height);
		bg.fill({ color: 0x2a2013, alpha: 0.3 });
		
		// Border
		bg.stroke({ color: 0x8b6914, width: 3, alpha: 0.6 });
		bg.rect(bgX + 3, bgY + 3, width - 6, height - 6);
		bg.stroke({ color: 0xd4af37, width: 2, alpha: 0.4 });
		
		return bg;
	}

	private createDecks(): void {
		const boardWidth = this.BOARD_WIDTH;

		// Player deck (bottom right, near discard)
		this.playerDeck = new Deck();
		this.playerDeck.setPosition(boardWidth - 125, this.BOARD_HEIGHT - 105);
		this.playerDeck.scale.set(0.75);
		this.gameBoard.addChild(this.playerDeck);

		// Opponent deck (top right, near discard)
		this.opponentDeck = new Deck();
		this.opponentDeck.setPosition(boardWidth - 125, 115);
		this.opponentDeck.scale.set(0.75);
		this.gameBoard.addChild(this.opponentDeck);
	}

	private createTestCards(): void {
		// Test card data - matching AOE2 units
		// Valid IDs: 1=knight, 2=crossbowman, 3=mangonel, 4=light_cavalry, 5=teutonic_knight, 6=archer
		const testPlayerCards: CardData[] = [
			{ id: 1, name: "Knight", score: 8, type: CardType.MELEE },
			{ id: 2, name: "Crossbowman", score: 6, type: CardType.RANGED },
			{ id: 3, name: "Mangonel", score: 10, type: CardType.SIEGE },
			{ id: 1, name: "Knight", score: 6, type: CardType.MELEE },
			{ id: 6, name: "Archer", score: 4, type: CardType.RANGED },
		];

		// Add more knights (reusing ID 1 for knight texture)
		for (let i = 0; i < 12; i++) {
			testPlayerCards.push({
				id: 1, // Use knight texture
				name: `Knight`,
				score: Math.floor(Math.random() * 10) + 1,
				type: CardType.MELEE
			});
		}

		const testOpponentCards: CardData[] = [
			{ id: 1, name: "Knight", score: 7, type: CardType.MELEE },
			{ id: 6, name: "Archer", score: 6, type: CardType.RANGED },
		];

		// Add cards to player hand
		this.playerHand.addCardsBatch(testPlayerCards);
		
		// Set up click interactions for each card in player hand
		this.playerHand.getAllCards().forEach((card) => {
			this.setupCardInteractions(card);
		});

		// Add cards to opponent hand (non-interactive)
		this.opponentHand.addCardsBatch(testOpponentCards);
	}

	private setupCardInteractions(card: Card): void {
		card.on('pointerenter', () => this.onCardHover(card, true));
		card.on('pointerleave', () => this.onCardHover(card, false));
		card.on('pointerup', (event) => this.onCardClick(card, event));
	}

	private setupRowInteractions(): void {
		const playableRows = [
			this.playerMeleeRow,
			this.playerRangedRow,
			this.playerSiegeRow,
		];

		playableRows.forEach((row) => {
			row.setContainerInteractive(true);
			row.on('containerClick', () => {
				if (this.selectedCard) {
					this.placeSelectedCard(row);
				}
			});
		});
	}

	private onCardHover(card: Card, isHovering: boolean): void {
		// Only apply hover effects to cards in player hand
		if (card.parent !== this.playerHand) return;

		// Don't apply hover effects to selected cards
		if (this.selectedCard === card) return;

		const targetY = isHovering ? -12 : 0;
		const duration = 0.2;

		gsap.to(card, {
			y: targetY,
			duration,
			ease: "power2.out",
		});
	}

	private onCardClick(card: Card, event: any): void {
		event.stopPropagation(); // Prevent global click handler

		// Only allow selection of cards in player hand
		if (card.parent !== this.playerHand) {
			return;
		}

		this.cardClickInProgress = true;

		if (this.selectedCard === card) {
			this.deselectCard();
		} else {
			this.selectCard(card);
		}

		setTimeout(() => {
			this.cardClickInProgress = false;
		}, 150);
	}

	private selectCard(card: Card): void {
		if (this.selectedCard) {
			this.deselectCard();
		}

		this.selectedCard = card;

		// Lift card up
		gsap.to(card, {
			y: -30,
			duration: 0.1,
			ease: "power2.out",
		});

		// Highlight valid placement rows
		this.highlightValidRows(card.cardData.type);

		console.log(`✅ Selected: ${card.cardData.name}`);
	}

	private deselectCard(): void {
		if (!this.selectedCard) return;

		const card = this.selectedCard;

		// Return card to normal position
		gsap.to(card, {
			y: 0,
			duration: 0.3,
			ease: "power2.out",
		});

		// Clear all row highlights
		this.clearRowHighlights();

		this.selectedCard = null;
		console.log(`❌ Deselected card`);
	}

	private handleGlobalClick(): void {
		if (this.cardClickInProgress) {
			return;
		}

		// Deselect when clicking anywhere else
		setTimeout(() => {
			if (!this.cardClickInProgress) {
				this.deselectCard();
			}
		}, 50);
	}

	private async placeSelectedCard(targetRow: PlayingRowContainer): Promise<void> {
		if (!this.selectedCard) return;

		// Check if the target row can accept this card type
		if (!targetRow.canAcceptCard(this.selectedCard)) {
			console.log(`❌ ${this.selectedCard.cardData.name} cannot be placed in ${targetRow.label}`);
			return;
		}

		const cardIndex = this.playerHand.getAllCards().indexOf(this.selectedCard);
		if (cardIndex === -1) return;

		console.log(`✅ Placing ${this.selectedCard.cardData.name} in ${targetRow.label}`);

		// Clear row highlights
		this.clearRowHighlights();

		// Clear selection before transfer
		this.selectedCard = null;

		// Animate card from hand to row
		await this.playerHand.transferCardTo(cardIndex, targetRow);

		// Update score using PlayingRowContainer's method
		targetRow.updateScore();
	}

	private highlightValidRows(cardType: CardType): void {
		// Determine which row can accept this card type
		let validRow: PlayingRowContainer | null = null;

		switch (cardType) {
			case CardType.MELEE:
				validRow = this.playerMeleeRow;
				break;
			case CardType.RANGED:
				validRow = this.playerRangedRow;
				break;
			case CardType.SIEGE:
				validRow = this.playerSiegeRow;
				break;
		}

		if (!validRow) return;

		// Use PlayingRowContainer's built-in highlight method
		validRow.showHighlight();
	}

	private clearRowHighlights(): void {
		// Clear highlights from all player rows
		[this.playerMeleeRow, this.playerRangedRow, this.playerSiegeRow].forEach((row) => {
			row.hideHighlight();
		});
	}

	private createBackButton(): void {
		const buttonBg = new PixiGraphics();
		buttonBg.rect(0, 0, 200, 40);
		buttonBg.fill({ color: 0x8b4513, alpha: 0.8 });
		buttonBg.stroke({ color: 0xd4af37, width: 2 });
		
		const buttonStyle = new TextStyle({
			fontFamily: 'Cinzel, serif',
			fontSize: 20,
			fill: 0xf4e4c1,
			fontWeight: 'bold'
		});
		const buttonText = new Text({ text: '← Back to Lobby', style: buttonStyle });
		buttonText.anchor.set(0.5);
		buttonText.position.set(100, 20);

		const button = new PixiContainer();
		button.addChild(buttonBg, buttonText);
		button.position.set(20, 20);
		button.interactive = true;
		button.cursor = 'pointer';

		button.on('pointerover', () => {
			buttonBg.tint = 0xcccccc;
		});

		button.on('pointerout', () => {
			buttonBg.tint = 0xffffff;
		});

		button.on('pointerdown', () => {
			console.log("🏠 Returning to lobby");
			window.location.href = '/lobby.html';
		});

		this.addChild(button);
	}

	update(_framesPassed: number): void {
		// No continuous updates needed for now
	}

	resize(screenWidth: number, screenHeight: number): void {
		this.resizeAndCenter(screenWidth, screenHeight);
	}

	private resizeAndCenter(screenWidth: number, screenHeight: number): void {
		// Calculate scale to fit screen while maintaining aspect ratio
		const scaleX = screenWidth / this.BOARD_WIDTH;
		const scaleY = screenHeight / this.BOARD_HEIGHT;
		const scale = Math.min(scaleX, scaleY);

		// Calculate how much the game board will be offset when centered
		const offsetX = (screenWidth - this.BOARD_WIDTH * scale) / 2;
		const offsetY = (screenHeight - this.BOARD_HEIGHT * scale) / 2;

		// Resize and position background to cover entire screen
		// Account for the board offset by starting the background at negative coordinates
		this.background.clear();
		this.background.rect(
			-offsetX / scale,
			-offsetY / scale,
			screenWidth / scale,
			screenHeight / scale
		);
		this.background.fill({ color: 0x1a1410 });

		// Apply scale to game board
		this.gameBoard.scale.set(scale);

		// Center the game board
		this.gameBoard.x = offsetX;
		this.gameBoard.y = offsetY;

		console.log(`📐 Resized to ${screenWidth}x${screenHeight}, scale: ${scale.toFixed(2)}`);
	}
}
