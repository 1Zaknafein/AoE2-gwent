import { GameState, StateName } from "./GameState";
import { GameManager } from "../GameManager";

/**
 * RoundEndState - Handles end of round
 */
export class RoundEndState extends GameState {
  constructor(gameManager: GameManager) {
    super(gameManager);
  }

  public async execute(): Promise<StateName> {
    console.log(
      `[RoundEndState] Round ${this.gameManager.getCurrentRound()} ended`
    );

    const gameSession = this.gameManager.getGameSession();

    if (!gameSession) {
      throw new Error("Game session not initialized");
    }

    // TODO: Implement round end logic
    // - Display round results/scores
    // - Show round winner
    // - Animate cards moving to discard
    // - Check round wins (best of 3)

    // TODO: Check if any player has won 2 rounds (best of 3)
    // const gameState = gameSession.getGameState();
    // For now, assume game continues
    const gameOver = false;

    if (gameOver) {
      console.log("[RoundEndState] Game over - transitioning to resolution");
      return StateName.RESOLUTION;
    }

    console.log("[RoundEndState] Preparing for next round");

    // TODO: Display between-round UI
    // - Show current round wins
    // - "Next Round" button or auto-continue after delay

    return StateName.ROUND_START;
  }
}
