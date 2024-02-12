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

import DevTankDefinitions, { DevTank } from "./DevTankDefinitions";
import { Body, Color } from "./Enums";
import _BodyDefinitions from "./BodyDefinitions.json";

/** The types of post addons that exist in the game, by their id. */
export type postAddonId = "quadruplet"|"dompronounced" | "auto5" | "auto3" | "autosmasher" | "spike" | "pronounced" | "smasher" | "landmine" | "autoturret" | "weirdspike" | "auto2" | "auto7" | "autorocket" | "spiesk"
/** The types of post addons that exist in the game, by their id. */
export type preAddonId = "dombase" | "launcher"
/** A joint list of all post addon ids and pre addon ids. */
export type addonId = preAddonId | postAddonId;

/** Increase in opacity when taking damage. */
export const visibilityRateDamage = 0.2;

/**
 * Format that the game stores tank definitions in its memory.
 */
export interface BodyDefinition {
    /** The id of the tank. */
    id: Body;
    /** The name of the tank. */
    name: string;
    /** If not empty, the client is sent a notification with this message when it upgrades to this tank. */
    upgradeMessage: string;
    /** The levels required to upgrade to this tank. */
    levelRequirement: number;
    /** The tanks this tank can upgrade to. */
    upgrades: (Body)[];
    /** Boolean flags about the tank. */
    flags: {
        /** If the tank can go invisible. */
        invisibility: boolean;
        /** If the tank has a Predator-like zoom ability. */
        zoomAbility: boolean;
        /** If the tank can claim squares by killing them (necro). */
        canClaimSquares?: boolean;
        /** If the tank requires devmode to access (unused). */
        devOnly: boolean;
        /** If the tank should be rendered as a star (eg. traps are stars with 3 sides). */
        displayAsStar?: boolean;
        /** If the tank should be rendered as a trapezoid (eg. drone barrels are trapezoids), sides needs to be set to 2 for this to take effect. */
        displayAsTrapezoid?: boolean;
    },
    /** How much the opacity increases per tick while shooting. */
    visibilityRateShooting: number;
    /** How much the opacity increases per tick while moving. */
    visibilityRateMoving: number;
    /** How much does the opacity decrease per tick. */
    invisibilityRate: number;
    /** Used to determine the FOV of a tank. */
    fieldFactor: number;
    /** The speed of the tank. */
    speed: number;
    /** The absorbtionFactor (field) of the tank. */
    absorbtionFactor: number;
    /** The base max health of the tank. */
    maxHealth: number;
    /** The addon, if not empty, which is built before the barrels. */
    preAddon: addonId | null;
    /** The addon, if not empty, which is built after the barrels. */
    postAddon: addonId | null;
    /** The sides of the tank's body. */
    sides: number;
    /** The ratio used for size to width calculation, only takes effect when sides is 2 (rectangle). */
    widthRatio?: number;
    /** The border width of the tank's body. */
    borderWidth: number;
    /** Can be used to override the tank body's base size. */
    baseSizeOverride?: number;
}

/**
 * List of all tank definitions.
 */
const BodyDefinitions = _BodyDefinitions as (BodyDefinition | null)[] & Record<Body, BodyDefinition>;
export default BodyDefinitions;

/**
 * The count of all existing tanks (some in tank definitions are null).
 * Used for tank xor generation.
 */
export const BodyCount = BodyDefinitions.reduce((a, b) => b ? a + 1 : a, 0);

/**
 * A function used to retrieve both tank and dev tank definitions from their id.
 * Negative IDs are used to index dev tanks, whereas positive are used to index normal tanks. 
 */
export const getBodyById = function (id: number): BodyDefinitions | null {
    return (BodyDefinitions[id]) || null;
}

export const getBodyByName = function (bodyName: string): BodyDefinitions | null {
    return BodyDefinitions.find(body => body && body.name === bodyName)|| null;
}
