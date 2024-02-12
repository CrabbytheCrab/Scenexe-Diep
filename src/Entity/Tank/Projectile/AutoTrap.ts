/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>
*/

import Barrel from "../Barrel";
import Bullet from "./Bullet";

import { InputFlags, Tank } from "../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { Inputs } from "../../AI";
import { BarrelBase } from "../TankBody";
import { CameraEntity } from "../../../Native/Camera";
import Trap from "./Trap";
import AutoTurret from "../AutoTurret";


/**
 * Barrel definition for the engineer trap auto cannon's barrel.
 */
const AutoBarrelDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 65,
    width: 42 * 0.7 * 1.25,
    delay: 0.01,
    reload: 2,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.5,
        damage: 0.3,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

/**
 * Barrel definition for the raider trap's auto cannon barrel.
 */
const AutoMegaBarrelDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 75,
    width: 42 * 0.8 * 1.25,
    delay: 0.01,
    reload: 6.5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.7,
        damage: 1,
        speed: 1.4,
        scatterRate: 0.3,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 0.5
    }
};

/**
 * Barrel definition for the arsenal trap auto cannon's barrel.
 */
const AutoTwinBarrelDefinition_1: BarrelDefinition = {
    angle: 0,
    offset: -19.5,
    size: 71.25,
    width: 31.5,
    delay: 0.01,
    reload: 2,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.5,
        damage: 0.3,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
const AutoTwinBarrelDefinition_2: BarrelDefinition = {
    angle: 0,
    offset: 19.5,
    size: 71.25,
    width: 31.5,
    delay: 0.51,
    reload: 2,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.5,
        damage: 0.3,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

/**
 * Barrel definition for the mechanic trap auto cannon's barrel.
 */
const AutoMiniBarrelDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 65,
    width: 42 * 0.7 * 1.25,
    delay: 0.01,
    reload: 3.5,
    recoil: 0,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.5,
        damage: 0.3,
        speed: 1.2,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};
/**
 * Represents all auto traps in game.
 */
export default class AutoTrap extends Trap implements BarrelBase {
    /** The traps's auto cannon */
    private autoTurret: AutoTurret;

    /** The camera entity (used as team) of the rocket. */
    public cameraEntity: CameraEntity;
    /** The reload time of the rocket's barrel. */
    public reloadTime = 1;
    /** The inputs for when to shoot or not. (Rocket) */
    public inputs = new Inputs();


    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);
        
        this.cameraEntity = tank.cameraEntity;
        if (tankDefinition && tankDefinition.id === Tank.Raider) {
        this.autoTurret = new AutoTurret(this,AutoMegaBarrelDefinition, 25 * 1.25);
        this.autoTurret.ai.viewRange = 1400;
        }else if (tankDefinition && tankDefinition.id === Tank.Arsenal){
            this.autoTurret =  new AutoTurret(this,[AutoTwinBarrelDefinition_1,AutoTwinBarrelDefinition_2],37.5);
            this.autoTurret.ai.viewRange = 850;
        }else if (tankDefinition && tankDefinition.id === Tank.Mechanic){
            this.autoTurret = new AutoTurret(this,AutoMiniBarrelDefinition), 25 * 1.25;
            this.autoTurret.ai.viewRange = 850;
        } else {
            this.autoTurret = new AutoTurret(this,AutoBarrelDefinition), 25 * 1.25;
            this.autoTurret.ai.viewRange = 850;
        }
    }

    public get sizeFactor() {
        return this.physicsData.values.size / 50;
    }

    public tick(tick: number) {
        this.reloadTime = this.tank.reloadTime;

        super.tick(tick);

        if (this.deletionAnimation) return;
        // not fully accurate
        if (tick - this.spawnTick >= this.tank.reloadTime) this.inputs.flags |= InputFlags.leftclick;
        // Only accurate on current version, but we dont want that
        // if (!Entity.exists(this.barrelEntity.rootParent) && (this.inputs.flags & InputFlags.leftclick)) this.inputs.flags ^= InputFlags.leftclick; 
    }
}
