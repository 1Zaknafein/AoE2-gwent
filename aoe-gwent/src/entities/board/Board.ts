import { Texture, TilingSprite } from "pixi.js";
import { PixiContainer } from "../../plugins/engine";

export class Board extends PixiContainer {
	private _tileSprite: TilingSprite;
	private _originalTileWidth: number;
	private _originalTileHeight: number;
	private _boardWidth: number;
	private _boardHeight: number;

	constructor(width: number = 800, height: number = 600) {
		super();

		this._boardWidth = width;
		this._boardHeight = height;

		// Get the texture for the board tile
		const tileTexture = Texture.from("board_tile");

		// Store original tile dimensions
		this._originalTileWidth = tileTexture.width;
		this._originalTileHeight = tileTexture.height;

		// Create a tiling sprite using the modern constructor
		this._tileSprite = new TilingSprite({
			texture: tileTexture,
			width: this._boardWidth,
			height: this._boardHeight,
		});

		this._tileSprite.label = "board_tiles";

		// Center the tiling sprite within the board
		this._tileSprite.anchor.set(0.5);

		this.addChild(this._tileSprite);
	}

	/**
	 * Resize the board and adjust tiling accordingly
	 */
	public resize(width: number, height: number): void {
		this._boardWidth = width;
		this._boardHeight = height;

		this._tileSprite.width = width;
		this._tileSprite.height = height;
	}

	/**
	 * Set the tile size for the tiling sprite
	 */
	public setTileSize(width: number, height: number): void {
		this._tileSprite.tileScale.set(
			width / this._originalTileWidth,
			height / this._originalTileHeight
		);
	}

	/**
	 * Get the current board dimensions
	 */
	public getBoardDimensions(): { width: number; height: number } {
		return {
			width: this._boardWidth,
			height: this._boardHeight,
		};
	}

	/**
	 * Set the board position
	 */
	public setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

	/**
	 * Position the board to cover a specific area (like card containers area)
	 */
	public setBounds(x: number, y: number, width: number, height: number): void {
		this.resize(width, height);
		this.setPosition(x, y);
	}

	/**
	 * Get the tiling sprite for direct manipulation if needed
	 */
	public get tilingSprite(): TilingSprite {
		return this._tileSprite;
	}
}
