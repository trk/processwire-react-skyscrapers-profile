import * as React from "react";
import L from "leaflet";
import { router } from "@inertiajs/react";
import { Layers, MapPin } from "lucide-react";
import { cn, extractAccentColor, formatFeet } from "@/lib/utils";
import type { InertiaImage } from "@/types/inertia";

export interface MapMarkerPoint {
	id: number;
	title: string;
	subtitle?: string;
	url: string;
	lat: number;
	lng: number;
	color?: string;
	weight?: number;
}

type TileLayerMode = "street" | "satellite";

const TILE_SOURCES: Record<
	TileLayerMode,
	{ url: string; attribution: string; maxZoom: number }
> = {
	street: {
		url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: 19,
	},
	satellite: {
		url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
		attribution:
			"Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
		maxZoom: 19,
	},
};

interface SkyscraperMapProps {
	points: MapMarkerPoint[];
	center?: { lat: number; lng: number; zoom?: number } | null;
	heightClassName?: string;
	className?: string;
}

export function SkyscraperMap({
	points,
	center,
	heightClassName = "h-[420px]",
	className,
}: SkyscraperMapProps) {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const mapRef = React.useRef<L.Map | null>(null);
	const tileLayerRef = React.useRef<L.TileLayer | null>(null);
	const markerLayerRef = React.useRef<L.LayerGroup | null>(null);
	const [layerMode, setLayerMode] = React.useState<TileLayerMode>("street");

	const validPoints = React.useMemo(
		() =>
			points.filter(
				(p) =>
					typeof p.lat === "number" &&
					typeof p.lng === "number" &&
					Math.abs(p.lat) > 0.01 &&
					Math.abs(p.lng) > 0.01
			),
		[points]
	);

	const pointsSignature = React.useMemo(
		() =>
			validPoints
				.map((p) => `${p.id}:${p.lat.toFixed(5)}:${p.lng.toFixed(5)}`)
				.join("|"),
		[validPoints]
	);

	React.useEffect(() => {
		const el = containerRef.current;
		if (!el || validPoints.length === 0) {
			return;
		}

		el.setAttribute("data-layer", layerMode);

		const initialLat = center?.lat ?? (validPoints[0]?.lat ?? 39.8283);
		const initialLng = center?.lng ?? (validPoints[0]?.lng ?? -98.5795);
		const initialZoom = center?.zoom ?? (validPoints.length === 1 ? 15 : 4);

		const map = L.map(el, {
			center: [initialLat, initialLng],
			zoom: initialZoom,
			scrollWheelZoom: false,
		});
		mapRef.current = map;

		const source = TILE_SOURCES[layerMode];
		const tileLayer = L.tileLayer(source.url, {
			attribution: source.attribution,
			maxZoom: source.maxZoom,
		}).addTo(map);
		tileLayerRef.current = tileLayer;

		const markerLayer = L.layerGroup().addTo(map);
		markerLayerRef.current = markerLayer;

		const timer = window.setTimeout(() => {
			map.invalidateSize();
		}, 120);

		return () => {
			window.clearTimeout(timer);
			map.remove();
			mapRef.current = null;
			tileLayerRef.current = null;
			markerLayerRef.current = null;
		};
	}, [validPoints.length > 0]);

	React.useEffect(() => {
		const map = mapRef.current;
		const markerLayer = markerLayerRef.current;
		if (!map || !markerLayer) {
			return;
		}

		markerLayer.clearLayers();
		const isDark = document.documentElement.classList.contains("dark");
		const bounds = L.latLngBounds([]);

		validPoints.forEach((pt) => {
			const markerRadius = pt.weight
				? Math.min(14, Math.max(6, Math.round(Math.sqrt(pt.weight) * 1.4 + 4)))
				: 7;

			const marker = L.circleMarker([pt.lat, pt.lng], {
				radius: markerRadius,
				fillColor: pt.color || "#3b82f6",
				color: isDark ? "#0f1115" : "#f6f4ef",
				weight: 2,
				opacity: 1,
				fillOpacity: 0.92,
			}).addTo(markerLayer);

			const popupRoot = document.createElement("div");
			popupRoot.className = "min-w-[180px] p-1";

			const titleEl = document.createElement("div");
			titleEl.className = "font-sans text-sm font-semibold";
			titleEl.textContent = pt.title;
			popupRoot.appendChild(titleEl);

			if (pt.subtitle) {
				const subEl = document.createElement("div");
				subEl.className = "mt-0.5 font-mono text-xs opacity-75";
				subEl.textContent = pt.subtitle;
				popupRoot.appendChild(subEl);
			}

			if (pt.url) {
				const linkEl = document.createElement("a");
				linkEl.href = pt.url;
				linkEl.className =
					"mt-2 inline-block font-mono text-xs font-medium text-primary underline";
				linkEl.textContent = "Open Monograph →";
				linkEl.addEventListener("click", (ev) => {
					ev.preventDefault();
					router.visit(pt.url);
				});
				popupRoot.appendChild(linkEl);
			}

			marker.bindPopup(popupRoot);
			bounds.extend([pt.lat, pt.lng]);
		});

		if (center) {
			map.setView([center.lat, center.lng], center.zoom ?? 15, {
				animate: false,
			});
		} else if (validPoints.length > 1 && bounds.isValid()) {
			map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
		}
	}, [pointsSignature, center?.lat, center?.lng, center?.zoom]);

	React.useEffect(() => {
		const el = containerRef.current;
		if (el) {
			el.setAttribute("data-layer", layerMode);
		}
		if (tileLayerRef.current) {
			const source = TILE_SOURCES[layerMode];
			tileLayerRef.current.setUrl(source.url);
		}
	}, [layerMode]);

	if (validPoints.length === 0) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center border border-border bg-card/50 p-8 text-center text-muted-foreground",
					heightClassName,
					className
				)}
			>
				<MapPin className="size-6 stroke-[1.5] opacity-50" />
				<p className="mt-2 font-mono text-xs">
					No geocoded coordinates recorded for the current selection.
				</p>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"relative overflow-hidden border border-border bg-card",
				className
			)}
		>
			<div ref={containerRef} className={cn("w-full z-10", heightClassName)} />
			<div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background/95 px-3.5 py-2 font-mono text-[11px] text-muted-foreground">
				<span>
					Geospatial Index &middot;{" "}
					<strong className="font-semibold text-foreground tabular-nums">
						{validPoints.length}
					</strong>{" "}
					{validPoints.length === 1 ? "plotted coordinate" : "plotted coordinates"}
				</span>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() =>
							setLayerMode((prev) =>
								prev === "street" ? "satellite" : "street"
							)
						}
						className="inline-flex items-center gap-1 rounded-xs border border-border bg-card px-2 py-0.5 text-[11px] text-foreground transition-colors hover:border-primary cursor-pointer"
					>
						<Layers className="size-3 text-primary" />
						{layerMode === "street" ? "Satellite View" : "Street Atlas"}
					</button>
				</div>
			</div>
		</div>
	);
}

export function buildSkyscraperMapPoints(
	items: Array<{
		id: number;
		title: string;
		url: string;
		height: number | null;
		floors: number | null;
		year: number | null;
		city?: { title: string } | null;
		map: { lat: number | null; lng: number | null } | null;
		primaryImage?: InertiaImage | null;
	}>
): MapMarkerPoint[] {
	const points: MapMarkerPoint[] = [];

	for (const item of items) {
		if (
			item.map &&
			typeof item.map.lat === "number" &&
			typeof item.map.lng === "number"
		) {
			const metaParts = [
				item.city?.title,
				item.height ? formatFeet(item.height) : null,
				item.floors ? `${item.floors} fl` : null,
				item.year ? `${item.year}` : null,
			].filter(Boolean);

			points.push({
				id: item.id,
				title: item.title,
				subtitle: metaParts.join(" · "),
				url: item.url,
				lat: item.map.lat,
				lng: item.map.lng,
				color: extractAccentColor(item.primaryImage, "#3b82f6"),
			});
		}
	}

	return points;
}

export function buildCityMapPoints(
	cities: Array<{
		id: number;
		title: string;
		url: string;
		abbreviation?: string;
		skyscraperCount?: number;
		map?: { lat: number | null; lng: number | null } | null;
	}>
): MapMarkerPoint[] {
	const points: MapMarkerPoint[] = [];

	for (const city of cities) {
		if (
			city.map &&
			typeof city.map.lat === "number" &&
			typeof city.map.lng === "number"
		) {
			const count = city.skyscraperCount ?? 0;
			points.push({
				id: city.id,
				title: `${city.title}${city.abbreviation ? `, ${city.abbreviation}` : ""}`,
				subtitle: `${count} cataloged ${count === 1 ? "skyscraper" : "skyscrapers"}`,
				url: city.url,
				lat: city.map.lat,
				lng: city.map.lng,
				weight: Math.max(1, count),
			});
		}
	}

	return points;
}
