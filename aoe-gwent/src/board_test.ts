import './style.css';
import '@pixi/gif';
import { App } from './app';
import { Manager } from './entities/manager';
import { IPixiApplicationOptions } from './plugins/engine';
import { Loader, PixiAssets } from './entities/loader';
import { options } from './shared/config/manifest';
import { LoaderScene } from './ui/scenes/LoaderScene';
import { TestBoardScene } from './ui/scenes/TestBoardScene';

const bootstrap = async () => {
    const canvas = document.getElementById("pixi-screen") as HTMLCanvasElement;
    const resizeTo = window;
    const resolution = window.devicePixelRatio || 1;
    const autoDensity = true;
    const backgroundColor = 0x000000;
    const appOptions: Partial<IPixiApplicationOptions> = {
        canvas,
        resizeTo,
        resolution,
        autoDensity,
        backgroundColor,
        antialias: true
    }

    const application = new App();
    await application.init(appOptions);

    Manager.init(application);
    const pixiAssets = new PixiAssets();
    const loader = new Loader(pixiAssets);
    const loaderScene = new LoaderScene();
    Manager.changeScene(loaderScene);
    
    // Load assets then switch to TestBoardScene instead of GameScene
    loader.download(options, loaderScene.progressCallback.bind(loaderScene)).then(() => {
        console.log('🎮 Launching Test Board Scene');
        Manager.changeScene(new TestBoardScene());
    });
}

bootstrap();
