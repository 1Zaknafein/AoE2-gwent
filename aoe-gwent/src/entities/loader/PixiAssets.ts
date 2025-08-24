import { Assets } from 'pixi.js';

/** Callback function for loading progress (0-1)
 */
export type AssetsProgressCallback = (progress: number) => void;

/** Bundle configuration
 */
export interface LoaderBundle {
    name: string;
    assets: any;
}

/** Manifest configuration
 */
export interface LoaderManifest {
    bundles: LoaderBundle[];
}

/** Loader options
 */
export interface LoaderOptions { 
    manifest: LoaderManifest | undefined;
}

/** 
 * Assets loader using PIXI.js Assets
 */
export class PixiAssets {
    
    async init(options?: LoaderOptions): Promise<void> {
        if (!options?.manifest) {
            return;
        }

        // Convert our manifest format to PIXI.js format
        const pixiManifest = {
            bundles: options.manifest.bundles.map(bundle => ({
                name: bundle.name,
                assets: bundle.assets
            }))
        };

        await Assets.init({ manifest: pixiManifest });
    }

    async loadBundle(data: string | string[], onProgress: AssetsProgressCallback): Promise<any> {
        const bundles = Array.isArray(data) ? data : [data];
        
        return new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalBundles = bundles.length;
            
            const loadNextBundle = async () => {
                if (loadedCount >= totalBundles) {
                    resolve(true);
                    return;
                }
                
                const bundleName = bundles[loadedCount];
                try {
                    await Assets.loadBundle(bundleName);
                    loadedCount++;
                    onProgress(loadedCount / totalBundles);
                    loadNextBundle();
                } catch (error) {
                    reject(error);
                }
            };
            
            loadNextBundle();
        });
    }
}
