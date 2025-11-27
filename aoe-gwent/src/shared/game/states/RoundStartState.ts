import { GameState, StateName } from "./GameState";
import { GameContext } from "../GameContext";
import { MessageDisplay } from "../../../ui/components";

/**
 * RoundStartState - Prepares for a new round
 */
export class RoundStartState extends GameState {
  private _messageDisplay: MessageDisplay;

  constructor(context: GameContext) {
    super(context);

    this._messageDisplay = context.messageDisplay;
  }

  public async execute(): Promise<StateName> {
    console.log(
      `[RoundStartState] Starting round ${this.gameManager.getCurrentRound()}`
    );

    this._messageDisplay.showMessage(
      "Round " + this.gameManager.getCurrentRound() + " Start!"
    );

    // TODO Implement round start logic
    // - Clear passed players
    // - Determine starting player for this round
    // - Display round start message/animation
    // - Apply any round-specific effects

    await new Promise(() => {});

    return StateName.PLAYER_ACTION;
  }
}
