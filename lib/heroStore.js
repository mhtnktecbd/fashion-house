"use client";

import { heroSlidesSeed, heroConfigSeed } from "@/data/heroSlides";

const SLIDES_KEY = "ab_hero_slides_v1";
const CONFIG_KEY = "ab_hero_config_v1";

export function getHeroSlides() {
    if (typeof window === "undefined") return heroSlidesSeed;

    const stored = localStorage.getItem(SLIDES_KEY);
    if (!stored) {
        localStorage.setItem(SLIDES_KEY, JSON.stringify(heroSlidesSeed));
        return heroSlidesSeed;
    }

    try {
        return JSON.parse(stored);
    } catch (e) {
        return heroSlidesSeed;
    }
}

export function saveHeroSlides(slides) {
    if (typeof window === "undefined") return;
    localStorage.setItem(SLIDES_KEY, JSON.stringify(slides));
}

export function getHeroConfig() {
    if (typeof window === "undefined") return heroConfigSeed;

    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(heroConfigSeed));
        return heroConfigSeed;
    }

    try {
        return JSON.parse(stored);
    } catch (e) {
        return heroConfigSeed;
    }
}

export function saveHeroConfig(config) {
    if (typeof window === "undefined") return;
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
