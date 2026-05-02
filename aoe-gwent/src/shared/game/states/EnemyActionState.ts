import { CardPreview } from "../../../entities/card/CardPreview";
import { ActionType, BotPlayer, GamePhase } from "../../../local-server";
import { SpeedConfig } from "../../config/SpeedConfig";
import { GameContext } from "../GameContext";
import { GameManager } from "../GameManager";
import { State, StateName } from "./State";

/**
 * Processes enemy actions during enemy state.
 */
export class EnemyActionState extends State {
	private readonly _enemyPlayer: BotPlayer;
	private readonly _gameManager: GameManager;
	private readonly _cardPreview: CardPreview;

	private _isFirstEntry = true;

	constructor(context: GameContext) {
		super(context);

		this._enemyPlayer = context.enemy;
		this._gameManager = context.gameManager;
		this._cardPreview = context.gameScene.cardPreview;
	}

	public async execute(): Promise<StateName> {
		// Show message only on first entry
		if (this._isFirstEntry) {
			await this.messageDisplay.showMessage("Opponent's turn!");
			this._isFirstEntry = false;
		}

		const action = await this._enemyPlayer.decideAction();

		if (action.card) {
			this._cardPreview.show(action.card.cardData);

			await this.delay(SpeedConfig.enemyThinkTime);

			this._cardPreview.hide();
		}

		await this._gameManager.handleAction(action);

		await this.delay(SpeedConfig.enemyPostActionDelay);

		if (action.type === ActionType.PASS_TURN) {
			await this.messageDisplay.showMessage("Opponent has passed");
		}

		const gameData = this._gameManager.gameData;

		if (gameData.phase === GamePhase.ROUND_END) {
			this._isFirstEntry = true;

			return StateName.ROUND_END;
		}

		if (gameData.currentTurn === this._enemyPlayer.id) {
			return StateName.ENEMY_ACTION;
		} else {
			this._isFirstEntry = true;

			return StateName.PLAYER_ACTION;
		}
	}
}
