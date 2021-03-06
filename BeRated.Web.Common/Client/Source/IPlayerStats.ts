﻿/// <reference path="IPlayerWeaponStats.ts"/>
/// <reference path="IPlayerEncounterStats.ts"/>
/// <reference path="IPlayerPurchaseStats.ts"/>
/// <reference path="IKillDeathRatioHistory.ts"/>
/// <reference path="IPlayerGame.ts"/>

module BeRated {
	export interface IPlayerStats {
		id: number;
		name: string;
		weapons: Array<IPlayerWeaponStats>;
		encounters: Array<IPlayerEncounterStats>;
		purchases: Array<IPlayerPurchaseStats>;
		killDeathRatioHistory: Array<IKillDeathRatioHistory>;
		games: Array<IPlayerGame>;
	}
} 