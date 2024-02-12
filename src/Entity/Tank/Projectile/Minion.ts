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
import Drone from "./Drone";

import { Color, InputFlags, PhysicsFlags, StyleFlags, Tank } from "../../../Const/Enums";
import { BarrelDefinition, TankDefinition } from "../../../Const/TankDefinitions";
import { AIState, Inputs } from "../../AI";
import { BarrelBase } from "../TankBody";
import { CameraEntity } from "../../../Native/Camera";
import ObjectEntity from "../../Object";
import { Entity } from "../../../Native/Entity";

/**
 * Barrel definition for the factory minion's barrel.
 */
 const MinionBarrelDefinition: BarrelDefinition = {
    angle: 0,
    offset: 0,
    size: 95,
    width: 42,
    delay: 0,
    reload: 1,
    recoil: 1.35,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.4,
        damage: 0.4,
        speed: 0.8,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

/**
 * Barrel definition for the industry minion's barrel.
 */
const TwinMinionBarrelDefinition_1: BarrelDefinition = {
    angle: 0,
    offset: -26,
    size: 95,
    width: 42,
    delay: 0,
    reload: 1,
    recoil: 1,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.35,
        damage: 0.2,
        speed: 0.8,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

const TwinMinionBarrelDefinition_2: BarrelDefinition = {
    angle: 0,
    offset: 26,
    size: 95,
    width: 42,
    delay: 0.5,
    reload: 1,
    recoil: 1,
    isTrapezoid: false,
    trapezoidDirection: 0,
    addon: null,
    bullet: {
        type: "bullet",
        health: 0.35,
        damage: 0.2,
        speed: 0.8,
        scatterRate: 1,
        lifeLength: 1,
        sizeRatio: 1,
        absorbtionFactor: 1
    }
};

/* Barrel definition for the manufacturer minion's barrel.
*/
const DestroyerMinionBarrelDefinition: BarrelDefinition = {
   angle: 0,
   offset: 0,
   size: 95,
   width: 71.4,
   delay: 0,
   reload: 4,
   recoil: 7,
   isTrapezoid: false,
   trapezoidDirection: 0,
   addon: null,
   bullet: {
       type: "bullet",
       health: 1,
       damage: 2,
       speed: 0.5,
       scatterRate: 1,
       lifeLength: 1,
       sizeRatio: 1,
       absorbtionFactor: 0.1
   }
};
/**
 * The drone class represents the minion (projectile) entity in diep.
 */
export default class Minion extends Drone implements BarrelBase {
    /** Size of the focus the minions orbit. */
    public static FOCUS_RADIUS = 850 ** 2;

    /** The minion's barrel */
    private minionBarrel: Barrel;

    /** The camera entity (used as team) of the minion. */
    public cameraEntity: CameraEntity;
    /** The reload time of the minion's barrel. */
    public reloadTime = 1;
    /** The inputs for when to shoot or not. */
    public inputs = new Inputs();

    public constructor(barrel: Barrel, tank: BarrelBase, tankDefinition: TankDefinition | null, shootAngle: number) {
        super(barrel, tank, tankDefinition, shootAngle);

        const bulletDefinition = barrel.definition.bullet;

        this.inputs = this.ai.inputs;
        this.ai.viewRange = 900;
        this.usePosAngle = false;

        this.physicsData.values.sides = bulletDefinition.sides ?? 1;
        this.physicsData.values.size *= 1.2;
        
        if (this.physicsData.values.flags & PhysicsFlags.noOwnTeamCollision) this.physicsData.values.flags ^= PhysicsFlags.noOwnTeamCollision;
        if (this.physicsData.values.flags & PhysicsFlags.canEscapeArena) this.physicsData.values.flags ^= PhysicsFlags.canEscapeArena;

        this.physicsData.values.flags |= PhysicsFlags.onlySameOwnerCollision;

        this.cameraEntity = tank.cameraEntity;
        if (tankDefinition && tankDefinition.id === Tank.Industry) {
            this.minionBarrel = new Barrel(this, TwinMinionBarrelDefinition_1);
            this.minionBarrel = new Barrel(this, TwinMinionBarrelDefinition_2);
        } else if (tankDefinition && tankDefinition.id === Tank.Manufacturer) {
            const size = this.physicsData.values.size;
            const pronounce = new ObjectEntity(this.game);
            pronounce.setParent(this);
            pronounce.relationsData.values.owner = this;
            pronounce.relationsData.values.team = this.relationsData.values.team
            pronounce.styleData.values.flags |= StyleFlags.showsAboveParent
    
            pronounce.physicsData.values.size = size * 0.65;
    
            pronounce.styleData.values.color = this.styleData.values.color;
            pronounce.physicsData.values.sides = 6;
            const tickBase = pronounce.tick;
            pronounce.tick = (tick: number) => {
                const size = this.physicsData.values.size;
    
                pronounce.physicsData.size = size * 0.65;
                pronounce.styleData.opacity = this.styleData.opacity
                if(!Entity.exists(this)){
                    pronounce.delete()
                }
                tickBase.call(pronounce, tick);
            }
    
            this.ai.viewRange *= 1.5;
            this.minionBarrel = new Barrel(this, DestroyerMinionBarrelDefinition);
        } else {
            this.minionBarrel = new Barrel(this, MinionBarrelDefinition);
        }
        this.ai.movementSpeed = this.ai.aimSpeed = this.baseAccel;
    }

    public get sizeFactor() {
    if (this.tankDefinition && this.tankDefinition.id === Tank.Manufacturer) {
        return this.physicsData.values.size / (Math.SQRT2 * 25);
     }else{
        return this.physicsData.values.size / 50;

        }
    }

    /** This allows for factory to hook in before the entity moves. */
    protected tickMixin(tick: number) {
        this.reloadTime = this.tank.reloadTime;

        const usingAI = !this.canControlDrones || !this.tank.inputs.attemptingShot() && !this.tank.inputs.attemptingRepel();
        const inputs = !usingAI ? this.tank.inputs : this.ai.inputs;
        if (tick - this.spawnTick >= 5){
            if (usingAI && this.ai.state === AIState.idle) {
                this.movementAngle = this.positionData.values.angle;
            } else {
                this.inputs.flags |= InputFlags.leftclick;

                const dist = inputs.mouse.distanceToSQ(this.positionData.values);

                if (dist < Minion.FOCUS_RADIUS / 4) { // Half
                    this.movementAngle = this.positionData.values.angle + Math.PI;
                } else this.movementAngle = this.positionData.values.angle;
            }
        }
        super.tickMixin(tick);
    }
}
