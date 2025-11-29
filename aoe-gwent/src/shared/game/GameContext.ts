import { CardDealingManager } from "../../ui/managers/CardDealingManager";
import { MessageDisplay } from "../../ui/components/MessageDisplay";
import { GameManager } from "./GameManager";
import { PlayerDisplayManager } from "../../entities/player";

/**
 * GameContext - Container for all dependencies that states may need
 */
export interface GameContext {
  gameManager: GameManager;
  cardDealingManager: CardDealingManager;
  messageDisplay: MessageDisplay;
  playerDisplayManager: PlayerDisplayManager;
}
