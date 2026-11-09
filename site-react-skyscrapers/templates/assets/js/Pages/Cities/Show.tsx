import * as React from "react";
import { Link } from "@inertiajs/react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/skyscrapers/AppLayout";
import { SkyscraperCatalogView } from "@/components/skyscrapers/SkyscraperCatalogView";
import type { CityPageData } from "@/types/inertia";
import type { SkyscraperListingPayload } from "@/types/skyscrapers";
import { formatFeet } from "@/lib/utils";

interface CityShowProps {
	page: CityPageData;
	listing: SkyscraperListingPayload;
	cityStats: {
		totalSkyscrapers: number;
		maxHeight: number | null;
		tallestTitle: string | null;
		tallestUrl: string | null;
		earliestYear: number | null;
	};
}

export default function CityShow({
	page,
	listing,
	cityStats,
}: CityShowProps) {
	const mapCenter =
		page.map && typeof page.map.lat === "number" && typeof page.map.lng === "number"
			? {
					lat: page.map.lat,
					lng: page.map.lng,
					zoom: page.map.zoom > 0 ? page.map.zoom : 13,
				}
			: null;

	return (
		<AppLayout
			breadcrumbs={[
				{ label: "Cities", url: "/cities/" },
				{ label: page.title },
			]}
		>
			<header className="border-b border-border pb-6">
				<div className="flex flex-wrap items-baseline justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
							{page.title}
							{page.abbreviation ? `, ${page.abbreviation}` : ""} Skyscrapers
						</h1>
						<p className="mt-2 font-mono text-xs text-muted-foreground">
							Municipal Archive &middot;{" "}
							<strong className="font-semibold text-foreground tabular-nums">
								{cityStats.totalSkyscrapers}
							</strong>{" "}
							cataloged high-rise structures
							{page.map?.lat && page.map?.lng
								? ` · ${page.map.lat.toFixed(4)}° N, ${Math.abs(page.map.lng).toFixed(4)}° W`
								: ""}
						</p>
					</div>

					<Button asChild variant="outline" size="sm">
						<Link href={`/search/?city=${encodeURIComponent(page.name)}`}>
							<SlidersHorizontal className="size-3.5" />
							Filter {page.title} by Height &amp; Era
						</Link>
					</Button>
				</div>

				<dl className="mt-6 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
					<div className="bg-card px-4 py-3">
						<dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
							Cataloged Structures
						</dt>
						<dd className="mt-1 font-mono text-xl font-bold tabular-nums text-foreground">
							{cityStats.totalSkyscrapers}
						</dd>
					</div>

					<div className="bg-card px-4 py-3">
						<dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
							Peak Elevation
						</dt>
						<dd className="mt-1 font-mono text-xl font-bold tabular-nums text-foreground">
							{formatFeet(cityStats.maxHeight)}
						</dd>
					</div>

					<div className="bg-card px-4 py-3">
						<dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
							Tallest Landmark
						</dt>
						<dd className="mt-1 truncate text-sm font-semibold text-foreground">
							{cityStats.tallestTitle && cityStats.tallestUrl ? (
								<Link
									href={cityStats.tallestUrl}
									className="text-primary hover:underline"
								>
									{cityStats.tallestTitle}
								</Link>
							) : (
								"—"
							)}
						</dd>
					</div>

					<div className="bg-card px-4 py-3">
						<dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
							Earliest Recorded Tower
						</dt>
						<dd className="mt-1 font-mono text-xl font-bold tabular-nums text-foreground">
							{cityStats.earliestYear ?? "—"}
						</dd>
					</div>
				</dl>
			</header>

			<section className="mt-6">
				<SkyscraperCatalogView
					listing={listing}
					mapCenter={mapCenter}
					showCityColumn={false}
				/>
			</section>
		</AppLayout>
	);
}
