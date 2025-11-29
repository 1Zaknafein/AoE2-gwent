import { CardDealingManager } from "../../ui/managers/CardDealingManager";
import { MessageDisplay } from "../../ui/components/MessageDisplay";
import { GameManager } from "./GameManager";
import { PlayerDisplayManager } from "../../entities/player";
import { GameBoardInteractionManager } from "../../ui/scenes/GameBoardInteractionManager";
import { HandContainer, PlayingRowContainer } from "../../entities/card";

/**
 * GameContext - Container for all dependencies that states may need
 */
export interface GameContext {
	gameManager: GameManager;
	cardDealingManager: CardDealingManager;
	messageDisplay: MessageDisplay;
	playerDisplayManager: PlayerDisplayManager;
	interactionManager: GameBoardInteractionManager;
	opponentRows: {
		hand: HandContainer;
		melee: PlayingRowContainer;
		ranged: PlayingRowContainer;
		siege: PlayingRowContainer;
	};
}
