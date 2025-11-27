import { GameState, StateName } from "./GameState";
import { GameManager } from "../GameManager";

/**
 * RoundStartState - Prepares for a new round
 */
export class RoundStartState extends GameState {
  constructor(gameManager: GameManager) {
    super(gameManager);
  }

  public async execute(): Promise<StateName> {
    console.log(
      `[RoundStartState] Starting round ${this.gameManager.getCurrentRound()}`
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

    await new Promise(() => {});

    return StateName.PLAYER_ACTION;
  }
}
