import { GameState, StateName } from "./GameState";
import { GameManager } from "../GameManager";
import { CardDealingManager } from "../../../ui/managers/CardDealingManager";

/**
 * RoundStartState - Prepares for a new round
 * - Clears passed player flags
 * - Determines who goes first
 * - Sets up round-specific state
 */
export class RoundStartState extends GameState {
  private cardDealingManager: CardDealingManager | null;

  constructor(gameManager: GameManager, cardDealingManager?: CardDealingManager) {
    super(gameManager);
    this.cardDealingManager = cardDealingManager || null;
  }

  public async execute(): Promise<StateName> {
    console.log(
      `[RoundStartState] Starting round ${this.gameManager.getCurrentRound()}...`
    );

    // Get game session
    const gameSession = this.gameManager.getGameSession();
    if (!gameSession) {
      throw new Error("Game session not initialized");
    }

    // Start the game if not already started (deals cards)
    const gameState = gameSession.getGameState();
    if (!gameState.gameStarted) {
      console.log("[RoundStartState] Starting game - dealing cards...");
      gameSession.startGame();

      // Deal cards to UI
      if (this.cardDealingManager) {
        const playerId = this.gameManager.getPlayerId();
        const gameData = gameSession.getGameDataForPlayer(playerId);
        
        if (gameData) {
          const opponentId = gameSession.getOpponentId(playerId);
          const opponentData = opponentId ? gameSession.getGameDataForPlayer(opponentId) : null;
          
          this.cardDealingManager.dealCards(
            gameData.playerHand,
            opponentData?.playerHand || []
          );
        }
      } else {
        console.warn("[RoundStartState] CardDealingManager not set - cards not dealt to UI");
      }
    }

    // TODO Implement round start logic
    // - Clear passed players
    // - Determine starting player
    // - Display round start message

    console.log(
      "[RoundStartState] Round started"
    );

    // Wait indefinitely for now.
    await new Promise(() => {});

    return StateName.PLAYER_ACTION;
  }
}
