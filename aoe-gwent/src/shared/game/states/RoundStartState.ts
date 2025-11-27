import { GameState, StateName } from "./GameState";
import { GameManager } from "../GameManager";

/**
 * RoundStartState - Prepares for a new round
 * - Clears passed player flags
 * - Determines who goes first
 * - Displays round start message
 * - Does NOT generate new decks (that's done in GameStartState)
 *
 * Transitions to: PlayerActionState or EnemyActionState (based on who starts)
 */
export class RoundStartState extends GameState {
  constructor(gameManager: GameManager) {
    super(gameManager);
  }

  public async execute(): Promise<StateName> {
    console.log(
      `[RoundStartState] Starting round ${this.gameManager.getCurrentRound()}...`
    );

    const gameSession = this.gameManager.getGameSession();

    if (!gameSession) {
      throw new Error("Game session not initialized");
    }

    // TODO Implement round start logic
    // - Clear passed players
    // - Determine starting player for this round
    // - Display round start message/animation
    // - Apply any round-specific effects

    console.log(
      "[RoundStartState] Round prepared - waiting indefinitely (no turn logic yet)"
    );

    // Wait indefinitely for now - state machine will pause here until turn logic is implemented
    await new Promise(() => {});

    // This code will never be reached (until turn logic is implemented)
    // Will transition based on who starts the round
    return StateName.PLAYER_ACTION;
  }
}
