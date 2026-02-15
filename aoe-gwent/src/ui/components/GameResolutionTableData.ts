import { Container, Text, TextStyle } from "pixi.js";

export class GameResolutionTableData extends Container {
	public readonly roundScoreRows: {
		roundLabel: Text;
		playerScore: Text;
		enemyScore: Text;
	}[] = [];

	constructor(rowSpacing: number, columnSpacing: number, textStyle: TextStyle) {
		super();

		for (let i = 0; i < 3; i++) {
			const roundLabel = new Text({
				text: `Round ${i + 1}`,
				style: textStyle,
				anchor: { x: 0, y: 0.5 },
			});

			const playerScore = new Text({
				text: "0",
				style: textStyle,
				anchor: 0.5,
			});

			const enemyScore = new Text({
				text: "0",
				style: textStyle,
				anchor: 0.5,
			});

			this.roundScoreRows.push({
				roundLabel,
				playerScore,
				enemyScore,
			});

			this.addChild(roundLabel, playerScore, enemyScore);
		}

		this.roundScoreRows.forEach((row, index) => {
			const rowY = index * rowSpacing;

			row.roundLabel.position.set(0, rowY);
			row.playerScore.position.set(columnSpacing, rowY);
			row.enemyScore.position.set(columnSpacing * 2, rowY);
		});
	}
}
