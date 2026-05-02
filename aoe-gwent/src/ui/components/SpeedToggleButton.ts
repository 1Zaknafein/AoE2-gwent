import { Text, TextStyle } from "pixi.js";
import { FontStyles } from "../../shared/FontStyles";
import { SpeedConfig } from "../../shared/config/SpeedConfig";
import { BorderDialog } from "./BorderDialog";
import { Button } from "./Button";
import { setFitWidth } from "./CommonComponents";

export class SpeedToggleButton extends Button {
	private _background: BorderDialog;
	private _label: Text;

	private static readonly WIDTH = 250;
	private static readonly HEIGHT = 80;

	constructor() {
		super(() => {}, SpeedToggleButton.WIDTH, SpeedToggleButton.HEIGHT);

		this._background = new BorderDialog(
			SpeedToggleButton.WIDTH,
			SpeedToggleButton.HEIGHT,
			"wood"
		);
		this.addChild(this._background);

		this._label = new Text({
			text: this.getLabelText(),
			style: new TextStyle({
				...FontStyles.scoreTextStyle,
				fontSize: 22,
			}),
		});
		this._label.y = (SpeedToggleButton.HEIGHT - this._label.height) / 2;
		this._label.x = (SpeedToggleButton.WIDTH - this._label.width) / 2;
		this.addChild(this._label);

		this.on("pointerover", this.onHover.bind(this));
		this.on("pointerout", this.onOut.bind(this));
		this.on("pointerdown", this.onPress.bind(this));
		this.on("pointerup", this.onRelease.bind(this));

		this.applyActiveStyle();
	}

	private onHover(): void {
		this._background.tint = SpeedConfig.fastMode ? 0xaaff88 : 0xeeeeee;
	}

	private onOut(): void {
		this.applyActiveStyle();
	}

	private onPress(): void {
		this._background.tint = 0xaaaaaa;
	}

	private onRelease(): void {
		SpeedConfig.toggle();
		this._label.text = this.getLabelText();
		setFitWidth(this._label, SpeedToggleButton.WIDTH - 20);
		this.applyActiveStyle();
	}

	private applyActiveStyle(): void {
		if (SpeedConfig.fastMode) {
			this._background.tint = 0x88ff55;
			this._label.tint = 0xffffff;
		} else {
			this._background.tint = 0xffffff;
			this._label.tint = 0xcccccc;
		}
	}

	private getLabelText(): string {
		return SpeedConfig.fastMode ? "FAST MODE ON" : "FAST MODE OFF";
	}
}
