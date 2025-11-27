import { GameState, StateName } from "./GameState";
import { GameContext } from "../GameContext";

/**
 * SetupState - Initializes the game session
 * - Creates game session and bot player
 * - Does NOT start the game or deal cards
 *
 * Transitions to: GameStartState
 */
export class SetupState extends GameState {
  constructor(context: GameContext) {
    super(context);
  }
  public async execute(): Promise<StateName> {
    this.gameManager.initializeGame("bot", "Bot Opponent");

    const gameSession = this.gameManager.getGameSession();

    if (!gameSession) {
      throw new Error("Failed to initialize game session");
    }

    console.log("[SetupState] Game session initialized");

    return StateName.GAME_START;
  }
}
