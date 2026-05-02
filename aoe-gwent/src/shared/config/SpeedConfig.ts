import { gsap } from "gsap";

const fastTimescale = 3;

export const SpeedConfig = {
	fastMode: false,

	toggle() {
		this.fastMode = !this.fastMode;
		gsap.globalTimeline.timeScale(this.fastMode ? fastTimescale : 1);
	},

	get enemyThinkTime(): number {
		return this.fastMode ? 0.5 : 2;
	},

	get enemyPostActionDelay(): number {
		return this.fastMode ? 0.1 : 0.5;
	},
};
