import { ApplicationInterface, StageInterface } from "./ApplicationInterface";
import { SceneInterface } from "./SceneInterface";

export interface ManagerInterface {
    init(app: ApplicationInterface, stage: StageInterface): void;
    changeScene(newScene: SceneInterface): void;
}