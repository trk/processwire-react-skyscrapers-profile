import * as React from "react";
import { Link, usePage } from "@inertiajs/react";
import { ArrowRight, Compass, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/skyscrapers/AppLayout";
import { ArchivalImage } from "@/components/skyscrapers/ArchivalImage";
import { ElevationScaleBar } from "@/components/skyscrapers/ElevationScaleBar";
import { FacetFilterConsole } from "@/components/skyscrapers/FacetFilterConsole";
import { SelectorInspector } from "@/components/skyscrapers/SelectorInspector";
import { SkyscraperMonographCell } from "@/components/skyscrapers/SkyscraperCatalogView";
import {
	SkyscraperMap,
	buildCityMapPoints,
} from "@/components/skyscrapers/SkyscraperMap";
import type { HomePageData } from "@/types/inertia";
import type {
	HeroPhoto,
	SkyscraperListItem,
	SkyscrapersSharedProps,
} from "@/types/skyscrapers";
import { extractSwatches, formatFeet } from "@/lib/utils";

interface HomeProps {
	page: HomePageData;
	heroPhoto: HeroPhoto | null;
	featuredSkyscrapers: SkyscraperListItem[];
	featuredSelector: string;
	benchmarkHeight: number;
}

export default function Home({
	page,
	heroPhoto,
	featuredSkyscrapers,
	featuredSelector,
	benchmarkHeight,
}: HomeProps) {
	const { atlas } = usePage<SkyscrapersSharedProps>().props;
	const heroSwatches = extractSwatches(heroPhoto);

	const topFeaturedByElevation = React.useMemo(
		() =>
			[...featuredSkyscrapers]
				.filter((item) => (item.height ?? 0) > 0)
				.sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
				.slice(0, 3),
		[featuredSkyscrapers]
	);

	const cityMapPoints = React.useMemo(
		() => buildCityMapPoints(atlas.cities),
		[atlas.cities]
	);

	const topCities = React.useMemo(
		() =>
			[...atlas.cities]
				.sort((a, b) => (b.skyscraperCount ?? 0) - (a.skyscraperCount ?? 0))
				.slice(0, 12),
		[atlas.cities]
	);

	return (
		<AppLayout>
			<section className="grid grid-cols-1 gap-8 border-b border-border pb-10 lg:grid-cols-12">
				<div className="flex min-w-0 flex-col justify-between lg:col-span-7">
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
							United States Skyscrapers Architectural Monograph
						</h1>
						<p className="mt-4 max-w-[66ch] text-base leading-relaxed text-muted-foreground">
							An indexed structural survey of{" "}
							<strong className="font-semibold text-foreground tabular-nums">
								{atlas.counts.skyscrapers.toLocaleString("en-US")}
							</strong>{" "}
							American high-rise towers across{" "}
							<strong className="font-semibold text-foreground tabular-nums">
								{atlas.counts.cities}
							</strong>{" "}
							cities and{" "}
							<strong className="font-semibold text-foreground tabular-nums">
								{atlas.counts.architects}
							</strong>{" "}
							architectural practices. Filter by elevation, story count,
							completion decade, or inspect live ProcessWire selectors.
						</p>
					</div>

					<div className="mt-6">
						<FacetFilterConsole compact />
					</div>

					<div className="mt-5 flex flex-wrap items-center gap-2">
						<span className="font-mono text-xs text-muted-foreground">
							Selector Presets:
						</span>
						{atlas.quickPresets.map((preset) => (
							<Link
								key={preset.url}
								href={preset.url}
								className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
							>
								<span>{preset.label}</span>
							</Link>
						))}
					</div>
				</div>

				<div className="flex min-w-0 flex-col justify-between border border-border bg-card p-3.5 lg:col-span-5">
					<div>
						<div className="relative aspect-[16/9] w-full overflow-hidden border border-border">
							<ArchivalImage
								image={heroPhoto}
								alt="Archival Skyscraper Plate"
								variant="medium"
								priority
								showSwatches
								className="size-full"
							/>
						</div>

						<div className="mt-3 flex flex-col gap-2">
							{heroPhoto?.captionHtml && (
								<div
									className="font-mono text-xs leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline"
									dangerouslySetInnerHTML={{ __html: heroPhoto.captionHtml }}
								/>
							)}

							<div className="flex items-center justify-between border-t border-border pt-2 font-mono text-[11px] text-muted-foreground">
								<span>
									Archival Plate &middot; {heroPhoto?.width ?? 0}&times;
									{heroPhoto?.height ?? 0}px{" "}
									{heroPhoto?.ext ? heroPhoto.ext.toUpperCase() : "PLATE"}
								</span>
								{heroSwatches.length > 0 && (
									<span className="inline-flex items-center gap-1">
										{heroSwatches.map((hex, i) => (
											<span
												key={`${hex}-${i}`}
												className="inline-block size-2.5 border border-border/60"
												style={{ backgroundColor: hex }}
												title={hex}
											/>
										))}
									</span>
								)}
							</div>
						</div>
					</div>

					{topFeaturedByElevation.length > 0 && (
						<div className="mt-4 border-t border-border pt-3">
							<div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
								<span>Elevation Datum ({formatFeet(benchmarkHeight)} max)</span>
								<span>Roof Height</span>
							</div>
							<div className="space-y-2.5">
								{topFeaturedByElevation.map((item) => (
									<Link
										key={item.id}
										href={item.url}
										className="block rounded-xs border border-border/80 bg-background px-2.5 py-2 transition-colors hover:border-primary"
									>
										<div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
											<span className="truncate font-semibold text-foreground">
												{item.title}
											</span>
											{item.city && (
												<span className="shrink-0 font-mono text-[11px] text-muted-foreground">
													{item.city.title}
												</span>
											)}
										</div>
										<ElevationScaleBar
											height={item.height}
											benchmark={benchmarkHeight || 1451}
										/>
									</Link>
								))}
							</div>
						</div>
					)}
				</div>
			</section>

			<section className="mt-12">
				<div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
					<h2 className="text-2xl font-bold tracking-tight text-foreground">
						Featured Structural Monographs
					</h2>
					<Button asChild variant="outline" size="sm">
						<Link href="/all/">
							Browse All {atlas.counts.skyscrapers.toLocaleString("en-US")} Towers
							<ArrowRight className="size-3.5" />
						</Link>
					</Button>
				</div>

				<SelectorInspector
					selector={featuredSelector}
					total={featuredSkyscrapers.length}
					className="mb-4"
				/>

				<div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
					{featuredSkyscrapers.map((item) => (
						<SkyscraperMonographCell key={item.id} item={item} showCity />
					))}
				</div>
			</section>

			<section className="mt-14 grid grid-cols-1 gap-8 border-t border-border pt-10 lg:grid-cols-12">
				<div className="lg:col-span-5">
					<div className="flex items-baseline justify-between gap-2">
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							Municipal Skylines
						</h2>
						<Link
							href="/cities/"
							className="font-mono text-xs font-medium text-primary hover:underline"
						>
							All {atlas.cities.length} Cities →
						</Link>
					</div>
					<p className="mt-2 text-sm text-muted-foreground">
						Leading metropolitan centers ranked by cataloged high-rise count.
					</p>

					<ul className="mt-4 divide-y divide-border border border-border bg-background">
						{topCities.map((city) => (
							<li key={city.id}>
								<Link
									href={city.url}
									className="flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors hover:bg-card"
								>
									<span className="flex items-center gap-2 font-medium text-foreground">
										<MapPin className="size-3.5 text-primary" />
										{city.title}
										{city.abbreviation && (
											<span className="font-mono text-xs text-muted-foreground">
												{city.abbreviation}
											</span>
										)}
									</span>
									<span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
										{city.skyscraperCount ?? 0} towers
									</span>
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div className="lg:col-span-7">
					<div className="mb-3 flex items-baseline justify-between gap-2">
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							National Geospatial Distribution
						</h2>
						<span className="font-mono text-xs text-muted-foreground">
							{cityMapPoints.length} geocoded municipalities
						</span>
					</div>
					<SkyscraperMap
						points={cityMapPoints}
						heightClassName="h-[440px]"
					/>
				</div>
			</section>

			{page.body && (
				<section className="mt-14 border-t border-border pt-10">
					<div className="flex items-baseline justify-between gap-4">
						<h2 className="text-xl font-bold tracking-tight text-foreground">
							About the ProcessWire Skyscrapers Dataset
						</h2>
						<Link
							href="/about/"
							className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
						>
							<Compass className="size-3.5" />
							Full Documentation
						</Link>
					</div>
					<div
						className="monograph-prose mt-4 text-sm text-muted-foreground [&_a]:text-primary [&_a]:underline"
						dangerouslySetInnerHTML={{ __html: page.body }}
					/>
				</section>
			)}
		</AppLayout>
	);
}
