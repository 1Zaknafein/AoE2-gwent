import { GameState, StateName } from "./GameState";
import { GameManager } from "../GameManager";
import { CardDealingManager } from "../../../ui/managers/CardDealingManager";

/**
 * GameStartState - Starts a new game
 */
export class GameStartState extends GameState {
  private cardDealingManager: CardDealingManager;

  constructor(
    gameManager: GameManager,
    cardDealingManager: CardDealingManager
  ) {
    super(gameManager);

    this.cardDealingManager = cardDealingManager;
  }

  public async execute(): Promise<StateName> {
    console.log("[GameStartState] Starting new game...");

    const gameSession = this.gameManager.getGameSession();

    if (!gameSession) {
      throw new Error("Game session not initialized");
    }

    gameSession.startGame();

    const playerId = this.gameManager.getPlayerId();
    const gameData = gameSession.getGameDataForPlayer(playerId);

    if (!gameData) {
      throw new Error("Game data for player not found");
    }

    const opponentId = gameSession.getOpponentId(playerId);
    const opponentData = opponentId
      ? gameSession.getGameDataForPlayer(opponentId)
      : null;

    this.cardDealingManager.dealCards(
      gameData.playerHand,
      opponentData?.playerHand || []
    );

    console.log(
      `[GameStartState] Dealt ${gameData.playerHand.length} cards to player, ${
        opponentData?.playerHand.length || 0
      } to opponent`
    );

    console.log("[GameStartState] Game started successfully");

    return StateName.ROUND_START;
  }
}
