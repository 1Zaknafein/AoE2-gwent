import { AlphaFilter } from "pixi.js";

export const FILL_COLOR = 0xffffff;

/**
 * Shared AlphaFilter instance for antialiasing.
 * Reused across components to avoid creating multiple identical filters.
 */
export const ANTIALIAS_FILTER = new AlphaFilter({
	antialias: true,
	alpha: 1,
});
