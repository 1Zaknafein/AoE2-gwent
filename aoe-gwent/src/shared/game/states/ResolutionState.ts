import { State, StateName } from "./State";

/**
 * Game resolution state. Shows final scores, winner, and handles end-of-game logic.
 */
export class ResolutionState extends State {
	public async execute(): Promise<StateName> {
		await this.delay(0.5);

		await this.gameResolutionDisplay.show();
		await this.gameResolutionDisplay.continueButton.waitForClick();

		await this.delay(0.5);

		this.gameManager.endGame();

		await this.delay(1);

		return StateName.ROUND_START;
	}
}
