import { GameState, StateName } from "./GameState";
import { GameContext } from "../GameContext";

/**
 * PlayerActionState - Waits for and processes player actions
 */
export class PlayerActionState extends GameState {
	constructor(context: GameContext) {
		super(context);
	}

	public async execute(): Promise<StateName> {
		const playerHand = this.cardDealingManager.getPlayerHand();
		const passButton = this.playerDisplayManager.playerDisplay.passButton;

		await this.messageDisplay.showMessage("Your turn!");

		// Enable player input
		playerHand.setCardsInteractive(true);
		if (passButton) {
			passButton.setEnabled(true);
		}

		await this.waitForPlayerAction();

		// Disable player input
		playerHand.setCardsInteractive(false);
		if (passButton) {
			passButton.setEnabled(false);
		}

		console.log(this.gameManager.isBotTurn());

		await new Promise(() => {});

		if (this.gameManager.haveBothPlayersPassed()) {
			return StateName.ROUND_END;
		} else if (this.gameManager.isBotTurn()) {
			return StateName.ENEMY_ACTION;
		} else {
			return StateName.PLAYER_ACTION;
		}
	}

	/**
	 * Wait for the player to either place a card or press the pass button
	 */
	private async waitForPlayerAction(): Promise<void> {
		return new Promise<void>((resolve) => {
			const playerHand = this.cardDealingManager.getPlayerHand();
			const playerDisplay = this.playerDisplayManager.playerDisplay;
			const passButton = playerDisplay.passButton;

			if (!passButton) {
				throw new Error("Pass button not found on player display");
			}

			// Listen for card being removed from hand (placed on board)
			const onCardPlaced = () => {
				cleanup();
				resolve();
			};

			// Listen for pass button click
			const onPassClicked = () => {
				cleanup();
				resolve();
			};

			playerHand.once("cardRemoved", onCardPlaced);
			passButton.once("click", onPassClicked);

			const cleanup = () => {
				playerHand.off("cardRemoved", onCardPlaced);
				passButton.off("click", onPassClicked);
			};
		});
	}
}
