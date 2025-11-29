import { GameState, StateName } from "./GameState";
import { GameContext } from "../GameContext";
import { ActionType } from "../../../local-server/GameTypes";
import { HandContainer, PlayingRowContainer } from "../../../entities/card";
import { BotPlayer, CardDatabase } from "../../../local-server";

/**
 * EnemyActionState - Processes enemy (bot) actions
 */
export class EnemyActionState extends GameState {
	private readonly _opponentRows: {
		hand: HandContainer;
		melee: PlayingRowContainer;
		ranged: PlayingRowContainer;
		siege: PlayingRowContainer;
	};

	private _botPlayer: BotPlayer | null = null;

	constructor(context: GameContext) {
		super(context);

		this._opponentRows = context.opponentRows;
	}

	public async execute(): Promise<StateName> {
		this._botPlayer = this.gameManager.getBotPlayer();
		const gameSession = this.gameManager.getGameSession();
		const botPlayer = this.gameManager.getBotPlayer();

		if (!gameSession) {
			throw new Error("Game session not initialized");
		}

		if (!botPlayer) {
			throw new Error("Bot player not initialized");
		}

		await this.messageDisplay.showMessage("Opponent's turn");

		this.disablePlayerInput();

		const botId = gameSession
			.getPlayerIds()
			.find((id) => gameSession.isBot(id));

		if (!botId) {
			throw new Error("Bot player ID not found");
		}

		const botHand = gameSession.getPlayerHand(botId);

		const hasCards = botHand && botHand.length > 0;

		if (!hasCards) {
			const result = gameSession.processAction({
				type: ActionType.PASS_TURN,
				playerId: botId,
			});

			if (!result.success) {
				console.error("Bot auto-pass failed:", result.error);
			}

			if (this.gameManager.haveBothPlayersPassed()) {
				return StateName.ROUND_END;
			} else {
				return StateName.PLAYER_ACTION;
			}
		}

		await this.handleBotAction();

		if (this.gameManager.haveBothPlayersPassed()) {
			return StateName.ROUND_END;
		} else if (this.gameManager.isPlayerTurn()) {
			return StateName.PLAYER_ACTION;
		} else {
			return StateName.ENEMY_ACTION;
		}
	}

	/**
	 * Handle bot action with visual card movement
	 */
	private async handleBotAction(): Promise<void> {
		if (!this._botPlayer) {
			throw new Error("Bot player not initialized");
		}

		const botAction = await this._botPlayer.takeTurn();

		if (botAction.type === ActionType.PLACE_CARD) {
			if (botAction.cardId === undefined || botAction.targetRow === undefined) {
				throw new Error("Bot action missing cardId or targetRow");
			}

			await this.placeCardOnBoard(botAction.cardId, botAction.targetRow);

			return;
		}

		if (botAction.type === ActionType.PASS_TURN) {
			await this.messageDisplay.showMessage("Opponent passed");
		}
	}

	private async placeCardOnBoard(
		cardId: number,
		targetRowType: "melee" | "ranged" | "siege"
	): Promise<void> {
		const enemyHand = this._opponentRows.hand;
		const targetRow = this._opponentRows[targetRowType];

		const randomIndex = Math.floor(
			Math.random() * enemyHand.getAllCards().length
		);
		const card = enemyHand.getAllCards()[randomIndex];

		const newCardData = CardDatabase.getCardById(cardId);

		if (!newCardData) {
			throw new Error(`Card data for cardId ${cardId} not found`);
		}

		card.updateCardData(newCardData);
		card.showFront();

		await enemyHand.transferCardTo(randomIndex, targetRow);
	}

	/**
	 * Disable player input by making hand cards non-interactive
	 */
	private disablePlayerInput(): void {
		const playerHand = this.cardDealingManager.getPlayerHand();
		playerHand.setCardsInteractive(false);
	}
}
