"use client";

import { homeTilesSeeds, homeTilesConfigSeed } from "@/data/homeTiles";

const STORAGE_KEY = "ab_home_tiles_v1";
const CONFIG_KEY = "ab_home_tiles_config_v1";

export function getHomeTiles() {
    if (typeof window === "undefined") return homeTilesSeeds;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(homeTilesSeeds));
        return homeTilesSeeds;
    }

    return JSON.parse(stored);
}

export function saveHomeTiles(tiles) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
}

export function getHomeTilesConfig() {
    if (typeof window === "undefined") return homeTilesConfigSeed;

    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(homeTilesConfigSeed));
        return homeTilesConfigSeed;
    }

    return JSON.parse(stored);
}

export function saveHomeTilesConfig(config) {
    if (typeof window === "undefined") return;
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
