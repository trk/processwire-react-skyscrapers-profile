import * as React from "react";
import { Link } from "@inertiajs/react";
import {
	ExternalLink,
	MapPin,
	Maximize2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { AppLayout } from "@/components/skyscrapers/AppLayout";
import { ArchivalImage } from "@/components/skyscrapers/ArchivalImage";
import { ElevationScaleBar } from "@/components/skyscrapers/ElevationScaleBar";
import { SelectorInspector } from "@/components/skyscrapers/SelectorInspector";
import { SkyscraperMonographCell } from "@/components/skyscrapers/SkyscraperCatalogView";
import { SkyscraperMap } from "@/components/skyscrapers/SkyscraperMap";
import type { InertiaImage, SkyscraperPageData } from "@/types/inertia";
import type { SkyscraperListItem } from "@/types/skyscrapers";
import {
	extractAccentColor,
	extractSwatches,
	formatFeet,
	formatMeters,
} from "@/lib/utils";

interface SkyscraperShowProps {
	page: SkyscraperPageData;
	relatedSkyscrapers: SkyscraperListItem[];
	cityPeers: SkyscraperListItem[];
	pivots: {
		heightBracket: string | null;
		floorsBracket: string | null;
		decadeBracket: string | null;
	};
	selector: string;
	relatedSelector: string;
}

export default function SkyscraperShow({
	page,
	relatedSkyscrapers,
	cityPeers,
	pivots,
	selector,
	relatedSelector,
}: SkyscraperShowProps) {
	const [activeIndex, setActiveIndex] = React.useState(0);
	const [lightboxOpen, setLightboxOpen] = React.useState(false);

	React.useEffect(() => {
		setActiveIndex(0);
		setLightboxOpen(false);
	}, [page.id]);

	const images: InertiaImage[] = Array.isArray(page.images) ? page.images : [];
	const activeImage = images[activeIndex] ?? images[0] ?? null;
	const swatches = extractSwatches(activeImage);
	const accentColor = extractAccentColor(activeImage);

	const breadcrumbs = [
		{ label: "Cities", url: "/cities/" },
		...(page.city
			? [{ label: page.city.title, url: page.city.url }]
			: []),
		{ label: page.title },
	];

	const primaryAccentColor = extractAccentColor(images[0]);

	const mapPoints = React.useMemo(() => {
		if (
			page.map &&
			typeof page.map.lat === "number" &&
			typeof page.map.lng === "number"
		) {
			return [
				{
					id: page.id,
					title: page.title,
					subtitle: page.map.address || page.city?.title || "",
					url: page.url,
					lat: page.map.lat,
					lng: page.map.lng,
					color: primaryAccentColor,
				},
			];
		}
		return [];
	}, [page.id, page.title, page.url, page.map, page.city, primaryAccentColor]);

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
				<DialogContent className="max-w-4xl p-4 sm:p-6">
					<DialogTitle className="text-base font-semibold">
						{page.title} &mdash; Plate {activeIndex + 1} of {images.length}
					</DialogTitle>
					<DialogDescription className="font-mono text-xs">
						{activeImage?.description || activeImage?.name || "Archival photograph"}
					</DialogDescription>

					{activeImage && (
						<div className="relative mt-2 flex flex-col items-center">
							<div className="max-h-[72vh] w-full overflow-hidden border border-border bg-secondary">
								<ArchivalImage
									image={activeImage}
									alt={activeImage.description || page.title}
									variant="full"
									priority
									className="flex max-h-[70vh] w-full items-center justify-center"
									imgClassName="mx-auto max-h-[70vh] w-auto object-contain"
								/>
							</div>

							{images.length > 1 && (
								<div className="mt-4 flex items-center justify-between w-full">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											setActiveIndex(
												(prev) => (prev - 1 + images.length) % images.length
											)
										}
									>
										<ChevronLeft className="size-4" />
										Previous Plate
									</Button>
									<span className="font-mono text-xs tabular-nums text-muted-foreground">
										{activeIndex + 1} / {images.length}
									</span>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											setActiveIndex((prev) => (prev + 1) % images.length)
										}
									>
										Next Plate
										<ChevronRight className="size-4" />
									</Button>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			<article>
				<header className="border-b border-border pb-6">
					<div className="flex flex-wrap items-baseline justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
								{page.title}
							</h1>
							<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
								{page.city && (
									<Link
										href={page.city.url}
										className="inline-flex items-center gap-1 text-foreground hover:text-primary hover:underline"
									>
										<MapPin className="size-3.5 text-primary" />
										{page.city.title}
										{page.city.abbreviation ? `, ${page.city.abbreviation}` : ""}
									</Link>
								)}
								{page.map?.address && (
									<span>Address: {page.map.address}</span>
								)}
								<span>Record ID #{page.id}</span>
							</div>
						</div>

						{swatches.length > 0 && (
							<div className="flex items-center gap-2 border border-border bg-card px-3 py-1.5">
								<span className="font-mono text-[11px] text-muted-foreground">
									Plate Chromatic Profile:
								</span>
								<div className="flex items-center gap-1">
									{swatches.map((hex, i) => (
										<span
											key={`${hex}-${i}`}
											className="size-3.5 border border-border/80"
											style={{ backgroundColor: hex }}
											title={hex}
										/>
									))}
								</div>
							</div>
						)}
					</div>

					<SelectorInspector selector={selector} className="mt-5" />
				</header>

				<div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
					<div className="space-y-4 lg:col-span-5">
						<div className="border border-border bg-card p-3">
							<div className="relative aspect-[3/4] w-full overflow-hidden border border-border bg-secondary">
								<ArchivalImage
									image={activeImage}
									alt={page.title}
									variant="medium"
									priority
									showSwatches
									className="size-full"
								/>
								{activeImage && (
									<button
										type="button"
										onClick={() => setLightboxOpen(true)}
										className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-xs border border-border bg-background/90 px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
									>
										<Maximize2 className="size-3.5" />
										Inspect Plate
									</button>
								)}
							</div>

							{activeImage?.description && (
								<p className="mt-2.5 font-mono text-xs leading-relaxed text-muted-foreground">
									{activeImage.description}
								</p>
							)}

							{images.length > 1 && (
								<div className="mt-3 grid grid-cols-5 gap-2 border-t border-border pt-3">
									{images.map((img, idx) => (
										<button
											key={`${img.name}-${idx}`}
											type="button"
											onClick={() => setActiveIndex(idx)}
											className={`relative aspect-square overflow-hidden border transition-all cursor-pointer ${
												idx === activeIndex
													? "border-primary ring-2 ring-primary/40"
													: "border-border opacity-70 hover:opacity-100"
											}`}
										>
											<ArchivalImage
												image={img}
												alt={`${page.title} thumbnail ${idx + 1}`}
												variant="thumb"
												className="size-full"
											/>
										</button>
									))}
								</div>
							)}
						</div>

						{mapPoints.length > 0 && (
							<SkyscraperMap
								points={mapPoints}
								center={{
									lat: mapPoints[0].lat,
									lng: mapPoints[0].lng,
									zoom: 15,
								}}
								heightClassName="h-[260px]"
							/>
						)}
					</div>

					<div className="space-y-8 lg:col-span-7">
						<section className="border border-border bg-card/60 p-5">
							<div className="flex items-baseline justify-between border-b border-border pb-3">
								<h2 className="text-lg font-bold tracking-tight text-foreground">
									Structural Specifications
								</h2>
								<span className="font-mono text-xs text-muted-foreground">
									Click any metric to pivot filter
								</span>
							</div>

							<div className="mt-4">
								<ElevationScaleBar
									height={page.height}
									accentColor={accentColor}
									showMeters
								/>
							</div>

							<dl className="mt-5 divide-y divide-border border-t border-border font-mono text-sm">
								<div className="flex items-center justify-between py-3">
									<dt className="text-xs uppercase tracking-wider text-muted-foreground">
										Municipality
									</dt>
									<dd className="font-semibold text-foreground">
										{page.city ? (
											<Link
												href={page.city.url}
												className="text-primary hover:underline"
											>
												{page.city.title}
												{page.city.abbreviation
													? `, ${page.city.abbreviation}`
													: ""}
											</Link>
										) : (
											"—"
										)}
									</dd>
								</div>

								<div className="flex items-center justify-between py-3">
									<dt className="text-xs uppercase tracking-wider text-muted-foreground">
										Structural Height
									</dt>
									<dd className="tabular-nums font-semibold text-foreground">
										{page.height > 0 ? (
											pivots.heightBracket ? (
												<Link
													href={`/search/?height=${encodeURIComponent(pivots.heightBracket)}&sort=-height`}
													className="text-primary hover:underline"
												>
													{formatFeet(page.height)} ({formatMeters(page.height)})
												</Link>
											) : (
												`${formatFeet(page.height)} (${formatMeters(page.height)})`
											)
										) : (
											"Unrecorded"
										)}
									</dd>
								</div>

								<div className="flex items-center justify-between py-3">
									<dt className="text-xs uppercase tracking-wider text-muted-foreground">
										Floor Count
									</dt>
									<dd className="tabular-nums font-semibold text-foreground">
										{page.floors > 0 ? (
											pivots.floorsBracket ? (
												<Link
													href={`/search/?floors=${encodeURIComponent(pivots.floorsBracket)}&sort=-floors`}
													className="text-primary hover:underline"
												>
													{page.floors} stories
												</Link>
											) : (
												`${page.floors} stories`
											)
										) : (
											"Unrecorded"
										)}
									</dd>
								</div>

								<div className="flex items-center justify-between py-3">
									<dt className="text-xs uppercase tracking-wider text-muted-foreground">
										Year Opened
									</dt>
									<dd className="tabular-nums font-semibold text-foreground">
										{page.year > 0 ? (
											pivots.decadeBracket ? (
												<Link
													href={`/search/?year=${encodeURIComponent(pivots.decadeBracket)}&sort=year`}
													className="text-primary hover:underline"
												>
													{page.year}
												</Link>
											) : (
												page.year
											)
										) : (
											"Unrecorded"
										)}
									</dd>
								</div>

								<div className="flex items-start justify-between gap-4 py-3">
									<dt className="text-xs uppercase tracking-wider text-muted-foreground">
										Credited Architects
									</dt>
									<dd className="text-right">
										{Array.isArray(page.architects) &&
										page.architects.length > 0 ? (
											<ul className="space-y-1">
												{page.architects.map((arch) => (
													<li key={arch.id}>
														<Link
															href={arch.url}
															className="font-sans text-sm font-medium text-primary hover:underline"
														>
															{arch.title}
														</Link>
													</li>
												))}
											</ul>
										) : (
											<span className="text-muted-foreground">Unrecorded</span>
										)}
									</dd>
								</div>

								{(page.wikipediaUrl || page.freebase_guid) && (
									<div className="flex items-center justify-between py-3">
										<dt className="text-xs uppercase tracking-wider text-muted-foreground">
											External Citations
										</dt>
										<dd className="flex items-center gap-3 text-xs">
											{page.wikipediaUrl && (
												<a
													href={page.wikipediaUrl}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-1 text-primary hover:underline"
												>
													Wikipedia (#{page.wikipedia_id})
													<ExternalLink className="size-3" />
												</a>
											)}
											{page.freebase_guid && (
												<span className="text-muted-foreground">
													GUID: {page.freebase_guid}
												</span>
											)}
										</dd>
									</div>
								)}
							</dl>
						</section>

						<section>
							<h2 className="text-xl font-bold tracking-tight text-foreground">
								Historical &amp; Architectural Commentary
							</h2>
							{page.body ? (
								<div
									className="monograph-prose mt-3 text-base text-foreground [&_a]:text-primary [&_a]:underline"
									dangerouslySetInnerHTML={{ __html: page.body }}
								/>
							) : (
								<p className="mt-3 text-sm text-muted-foreground">
									No historical monograph text has been transcribed for this
									building yet.
								</p>
							)}
						</section>
					</div>
				</div>

				{relatedSkyscrapers.length > 0 && (
					<section className="mt-14 border-t border-border pt-10">
						<div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
							<h2 className="text-2xl font-bold tracking-tight text-foreground">
								Cross-Referenced Skyscrapers Mentioning {page.title}
							</h2>
						</div>
						<SelectorInspector
							selector={relatedSelector}
							total={relatedSkyscrapers.length}
							label="Related Selector"
							className="mb-4"
						/>
						<div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
							{relatedSkyscrapers.map((item) => (
								<SkyscraperMonographCell key={item.id} item={item} showCity />
							))}
						</div>
					</section>
				)}

				{cityPeers.length > 0 && page.city && (
					<section className="mt-14 border-t border-border pt-10">
						<div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
							<h2 className="text-2xl font-bold tracking-tight text-foreground">
								Other Notable Structures in {page.city.title}
							</h2>
							<Link
								href={page.city.url}
								className="font-mono text-xs font-medium text-primary hover:underline"
							>
								View All {page.city.title} Skyscrapers →
							</Link>
						</div>
						<div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
							{cityPeers.map((item) => (
								<SkyscraperMonographCell
									key={item.id}
									item={item}
									showCity={false}
								/>
							))}
						</div>
					</section>
				)}
			</article>
		</AppLayout>
	);
}
