import { State, StateName } from "./State";
import { GameContext } from "../GameContext";
import {
	ActionType,
	GamePhase,
	PlayerAction,
} from "../../../local-server/GameTypes";
import { Player } from "../../../entities/player/Player";
import { GameManager } from "../GameManager";
import { Card, CardContainer } from "../../../entities/card";
import { GameBoardInteractionManager } from "../../../ui/scenes/GameBoardInteractionManager";
import { CardPreview } from "../../../entities/card/CardPreview";

/**
 * State where player can interact and take actions.
 */
export class PlayerActionState extends State {
	private _isFirstEntry = true;

	private readonly _player: Player;
	private readonly _gameManager: GameManager;
	private readonly _interactionManager: GameBoardInteractionManager;
	private readonly _cardPreview: CardPreview;

	constructor(context: GameContext) {
		super(context);

		this._player = context.player;
		this._gameManager = context.gameManager;
		this._interactionManager = context.interactionManager;

		this._cardPreview = context.gameScene.cardPreview;
	}

	public async execute(): Promise<StateName> {
		const passButton = this.playerDisplayManager.playerDisplay.passButton;

		if (!passButton) {
			throw new Error("Pass button not found on player display");
		}

		// Auto-pass if player has no cards
		if (this._player.hand.cardCount === 0) {
			await this._gameManager.handleAction({
				player: this._player,
				type: ActionType.PASS_TURN,
			});

			if (this._gameManager.gameData.phase === GamePhase.ROUND_END) {
				return StateName.ROUND_END;
			}

			return StateName.ENEMY_ACTION;
		}

		// Only show message on first entry or when returning from another state
		if (this._isFirstEntry) {
			await this.messageDisplay.showMessage("Your turn!");
			this._isFirstEntry = false;
		}

		this._player.hand.setCardsInteractive(true);
		passButton.setEnabled(true);

		const action = await this.waitForPlayerAction();

		this._player.hand.setCardsInteractive(false);
		passButton.setEnabled(false);

		await this._gameManager.handleAction(action);

		await this.delay(0.5);

		const gameData = this._gameManager.gameData;

		if (gameData.phase === GamePhase.ROUND_END) {
			this._isFirstEntry = true;

			return StateName.ROUND_END;
		}

		if (gameData.currentTurn === this._player.id) {
			return StateName.PLAYER_ACTION;
		} else {
			this._isFirstEntry = true;

			return StateName.ENEMY_ACTION;
		}
	}

	/**
	 * Wait for the player to either place a card or press the pass button
	 * Returns the action that occurred
	 */
	private async waitForPlayerAction(): Promise<PlayerAction> {
		return new Promise<PlayerAction>((resolve) => {
			const playerHand = this._player.hand;
			const passButton = this.playerDisplayManager.playerDisplay.passButton;

			if (!passButton) {
				throw new Error("Pass button not found on player display");
			}

			const onCardSelected = (card: Card) => {
				this._cardPreview.show(card.cardData);
			};

			const onCardDeselected = () => {
				this._cardPreview.hide();
			};

			const onCardPlaced = (card: Card, targetRowType: CardContainer) => {
				this._cardPreview.hide();

				cleanup();

				resolve({
					player: this._player,
					type: ActionType.PLACE_CARD,
					card: card,
					targetRow: targetRowType,
				});
			};

			const onPassClicked = () => {
				this._cardPreview.hide();

				cleanup();

				resolve({
					player: this._player,
					type: ActionType.PASS_TURN,
				});
			};

			const cleanup = () => {
				playerHand.off("playerCardPlacement", onCardPlaced);
				passButton.off("click", onPassClicked);
				this._interactionManager.off("cardSelected", onCardSelected);
				this._interactionManager.off("cardDeselected", onCardDeselected);
			};

			playerHand.once("playerCardPlacement", onCardPlaced);
			passButton.once("click", onPassClicked);

			this._interactionManager.on("cardSelected", onCardSelected);
			this._interactionManager.on("cardDeselected", onCardDeselected);
		});
	}
}
