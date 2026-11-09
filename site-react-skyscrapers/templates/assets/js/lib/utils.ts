import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { InertiaImage } from "@/types/inertia";

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

export function formatFeet(feet: number | null | undefined): string {
	if (feet === null || feet === undefined || feet <= 0) {
		return "—";
	}
	return `${feet.toLocaleString("en-US", { maximumFractionDigits: 0 })} ft`;
}

export function formatMeters(feet: number | null | undefined): string {
	if (feet === null || feet === undefined || feet <= 0) {
		return "—";
	}
	const meters = Math.round(feet * 0.3048);
	return `${meters.toLocaleString("en-US")} m`;
}

export function extractSwatches(image: InertiaImage | null | undefined): string[] {
	if (!image) {
		return [];
	}
	const candidates = [
		image.dominantColor,
		image.colorTheme?.vibrant,
		image.colorTheme?.muted,
		image.colorTheme?.darkVibrant,
		image.colorTheme?.lightMuted,
		image.colorTheme?.darkMuted,
		...(Array.isArray(image.palette) ? image.palette : []),
	].filter((c): c is string => typeof c === "string" && c.startsWith("#"));

	return Array.from(new Set(candidates)).slice(0, 5);
}

export function extractAccentColor(
	image: InertiaImage | null | undefined,
	fallback?: string
): string | undefined {
	return image?.colorTheme?.vibrant || image?.dominantColor || fallback;
}
