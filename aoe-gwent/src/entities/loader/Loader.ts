import { PixiAssets, LoaderOptions } from "./PixiAssets";

/** Loading callback for progress updates (0-1)
 */
export type LoadingCallback = (progress: number) => void;

/** Loader entity, to load assets for gameplay
 */
export class Loader {
    private readonly _assets: PixiAssets;
    private _isLoaded: boolean;
    
    get isLoaded() {
        return this._isLoaded;
    }

    constructor(assets: PixiAssets) {
        this._assets = assets;
        this._isLoaded = false;
    }

    async download(data: LoaderOptions, onLoading: LoadingCallback): Promise<any> {
        if (this._isLoaded) {
            return;
        }
        if (!data.manifest) {
            return;
        }
        await this._assets.init(data);
        const ids = data.manifest.bundles.map(bundle => bundle.name);
        await this._assets.loadBundle(ids, onLoading);
        this._isLoaded = true;
    }
}
