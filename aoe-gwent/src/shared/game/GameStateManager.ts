import { EventEmitter } from "pixi.js";

export enum GamePhase {
	WAITING_FOR_GAME_START = "waiting_for_game_start",
	PLAYER_TURN = "player_turn",
	ENEMY_TURN = "enemy_turn",
	ROUND_END = "round_end",
	GAME_END = "game_end",
}

export enum ActionType {
	PLACE_CARD = "place_card",
	PASS_TURN = "pass_turn",
	DRAW_CARD = "draw_card",
}

export interface GameState {
	phase: GamePhase;
	currentTurn: "player" | "enemy";
	roundNumber: number;
	playerScore: number;
	enemyScore: number;
	playerPassed: boolean;
	enemyPassed: boolean;
	startingPlayer: "player" | "enemy"; // Who started this round/game
	playerHandSize: number; // Number of cards in player hand
	enemyHandSize: number; // Number of cards in enemy hand
}

export interface ServerResponse {
	type: "game_state_update" | "enemy_action" | "deck_data";
	gameState?: GameState;
	action?: {
		type: ActionType;
		cardId?: number;
		targetRow?: "melee" | "ranged" | "siege";
		playerId: "player" | "enemy";
	};
	// playerDeck removed - server keeps deck cards hidden from client
	playerHand?: number[]; // Array of card IDs for player's initial hand only
}

export interface PlayerAction {
	type: ActionType;
	cardId?: number;
	targetRow?: "melee" | "ranged" | "siege";
	playerId: "player";
}

/**
 * Manages the game state and handles server responses
 */
export class GameStateManager extends EventEmitter {
	private _gameState: GameState;
	private _isConnected: boolean = false;

	constructor() {
		super();

		this._gameState = {
			phase: GamePhase.WAITING_FOR_GAME_START,
			currentTurn: "player",
			roundNumber: 1,
			playerScore: 0,
			enemyScore: 0,
			playerPassed: false,
			enemyPassed: false,
			startingPlayer: "player", // Default, will be overridden by server
			playerHandSize: 0,
			enemyHandSize: 0,
		};
	}

	/**
	 * Handle incoming server response
	 */
	public handleServerResponse(response: ServerResponse): void {
		console.log("\nReceived server response: ", response.type);

		console.table(response.gameState);

		switch (response.type) {
			case "game_state_update":
				this.handleGameStateUpdate(response);
				break;
			case "enemy_action":
				this.handleEnemyAction(response);
				break;
			case "deck_data":
				this.handleDeckData(response);
				break;
		}
	}

	private handleGameStateUpdate(response: ServerResponse): void {
		if (response.gameState) {
			const previousPhase = this._gameState.phase;
			this._gameState = response.gameState;

			this.emit("gameStateChanged", this._gameState);

			// Emit specific events for phase changes
			if (previousPhase !== this._gameState.phase) {
				this.emit("phaseChanged", this._gameState.phase);
			}
		}
	}

	private handleEnemyAction(response: ServerResponse): void {
		if (response.action && response.action.playerId === "enemy") {
			console.log("Enemy performed action:", response.action);
			this.emit("enemyAction", response.action);

			// Update game state if provided
			if (response.gameState) {
				this._gameState = response.gameState;
				this.emit("gameStateChanged", this._gameState);
			}
		}
	}

	private handleDeckData(response: ServerResponse): void {
		// Calculate enemy hand size based on player hand size (they should be equal initially)
		const enemyHandSize = response.playerHand ? response.playerHand.length : 5;

		this.emit("deckDataReceived", {
			// playerDeck removed - server keeps deck cards hidden from client
			playerHand: response.playerHand,
			enemyHandSize: enemyHandSize, // Add enemy hand size for dummy cards
		});

		// Update game state if provided - this is when the actual game begins
		if (response.gameState) {
			this._gameState = response.gameState;
			this._isConnected = true;
			this.emit("gameStateChanged", this._gameState);
			this.emit(
				"gameStarted",
				"Game started - both players have received their cards"
			);
			console.log(
				"Game started - deck data received and game state initialized"
			);
		}
	}

	/**
	 * Get current game state
	 */
	public get gameState(): GameState {
		return { ...this._gameState };
	}

	/**
	 * Check if it's currently the player's turn
	 */
	public get isPlayerTurn(): boolean {
		return (
			this._gameState.currentTurn === "player" &&
			this._gameState.phase === GamePhase.PLAYER_TURN
		);
	}

	/**
	 * Check if it's currently the enemy's turn
	 */
	public get isEnemyTurn(): boolean {
		return (
			this._gameState.currentTurn === "enemy" &&
			this._gameState.phase === GamePhase.ENEMY_TURN
		);
	}

	/**
	 * Check if the game is waiting to start
	 */
	public get isWaitingForGameStart(): boolean {
		return this._gameState.phase === GamePhase.WAITING_FOR_GAME_START;
	}

	/**
	 * Check if connected to server
	 */
	public get isConnected(): boolean {
		return this._isConnected;
	}

	/**
	 * Set connection status
	 */
	public setConnected(connected: boolean): void {
		this._isConnected = connected;
		this.emit("connectionChanged", connected);
	}

	/**
	 * Manually update game state (for testing purposes)
	 */
	public updateGameState(newState: Partial<GameState>): void {
		this._gameState = { ...this._gameState, ...newState };
		this.emit("gameStateChanged", this._gameState);
	}
}
