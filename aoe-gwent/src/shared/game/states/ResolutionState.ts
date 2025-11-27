import { GameState, StateName } from "./GameState";
import { GameContext } from "../GameContext";

/**
 * ResolutionState - Game over state
 * - Displays final game results
 * - Shows overall winner
 * - Provides option to restart (new game)
 * - Clears game data when restarting
 *
 * Transitions to: GameStartState (restart game) or stays here (exit)
 */
export class ResolutionState extends GameState {
  constructor(context: GameContext) {
    super(context);
  }

  public async execute(): Promise<StateName> {
    console.log("[ResolutionState] Game over - displaying final results");

    // Get game session
    const gameSession = this.gameManager.getGameSession();
    if (!gameSession) {
      throw new Error("Game session not initialized");
    }

    // TODO: Implement game over logic
    // - Display final winner
    // - Show game statistics
    // - Provide "Play Again" button
    // - Clear round scores when restarting

    console.log("[ResolutionState] Waiting for player input (restart/exit)");

    // For now, just pause here
    // In the future, this would wait for player input to restart
    await new Promise(() => {}); // Never resolves until restart is implemented

    // When "Play Again" is clicked, return GameStartState
    // This starts a NEW GAME (new decks, new cards) without re-initializing the session
    return StateName.GAME_START;
  }
}
