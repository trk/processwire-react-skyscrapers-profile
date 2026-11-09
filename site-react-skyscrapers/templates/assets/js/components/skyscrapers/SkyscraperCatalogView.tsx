import * as React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Grid2X2,
	ListFilter,
	Map as MapIcon,
	Table2,
	Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArchivalImage } from "./ArchivalImage";
import { ElevationScaleBar } from "./ElevationScaleBar";
import { SelectorInspector } from "./SelectorInspector";
import {
	SkyscraperMap,
	buildSkyscraperMapPoints,
} from "./SkyscraperMap";
import type {
	SkyscraperListItem,
	SkyscraperListingPayload,
	SkyscrapersSharedProps,
} from "@/types/skyscrapers";
import { cn, extractAccentColor, extractSwatches, formatFeet } from "@/lib/utils";

interface SkyscraperCatalogViewProps {
	listing: SkyscraperListingPayload;
	mapCenter?: { lat: number; lng: number; zoom?: number } | null;
	showCityColumn?: boolean;
	emptyMessage?: string;
}

export function SkyscraperCatalogView({
	listing,
	mapCenter,
	showCityColumn = true,
	emptyMessage = "No skyscrapers match the active selector criteria.",
}: SkyscraperCatalogViewProps) {
	const { atlas } = usePage<SkyscrapersSharedProps>().props;
	const { items, pagination, sort, selector } = listing;
	const mapPoints = React.useMemo(
		() => buildSkyscraperMapPoints(items),
		[items]
	);

	const handleSortChange = (nextSort: string) => {
		if (typeof window === "undefined") {
			return;
		}
		const url = new URL(window.location.href);
		const basePathname = url.pathname.replace(/\/page\d+\/?$/, "/");
		url.searchParams.set("sort", nextSort);
		router.get(basePathname + url.search, {}, { preserveScroll: true });
	};

	return (
		<div className="space-y-4">
			<SelectorInspector
				selector={selector}
				total={pagination.total}
			/>

			<Tabs defaultValue="grid" className="w-full">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
					<div className="flex items-center gap-3">
						<span className="font-mono text-xs font-medium tabular-nums text-foreground">
							{pagination.label}
						</span>
						{pagination.totalPages > 1 && (
							<span className="font-mono text-xs tabular-nums text-muted-foreground">
								(Page {pagination.currentPage} of {pagination.totalPages})
							</span>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-2">
							<ArrowUpDown className="size-3.5 text-muted-foreground" />
							<label
								htmlFor="catalog-sort-select"
								className="font-mono text-xs text-muted-foreground"
							>
								Order:
							</label>
							<select
								id="catalog-sort-select"
								value={sort}
								onChange={(e) => handleSortChange(e.target.value)}
								className="h-8 rounded-sm border border-input bg-background px-2.5 font-mono text-xs text-foreground"
							>
								{atlas.filterOptions.sorts.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						<TabsList>
							<TabsTrigger value="grid">
								<Grid2X2 className="size-3.5" />
								Folio Grid
							</TabsTrigger>
							<TabsTrigger value="table">
								<Table2 className="size-3.5" />
								Spec Table
							</TabsTrigger>
							<TabsTrigger value="map">
								<MapIcon className="size-3.5" />
								Map ({mapPoints.length})
							</TabsTrigger>
						</TabsList>
					</div>
				</div>

				{items.length === 0 ? (
					<div className="my-6 flex flex-col items-center justify-center border border-border bg-card/40 py-16 text-center">
						<ListFilter className="size-8 stroke-[1.25] text-muted-foreground" />
						<h3 className="mt-3 text-base font-semibold text-foreground">
							Empty Structural Set
						</h3>
						<p className="mt-1 max-w-md text-sm text-muted-foreground">
							{emptyMessage}
						</p>
						<Button asChild variant="outline" size="sm" className="mt-4">
							<Link href="/all/">
								Browse All {atlas.counts.skyscrapers.toLocaleString("en-US")} Skyscrapers
							</Link>
						</Button>
					</div>
				) : (
					<>
						<TabsContent value="grid">
							<div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
								{items.map((item) => (
									<SkyscraperMonographCell
										key={item.id}
										item={item}
										showCity={showCityColumn}
									/>
								))}
							</div>
						</TabsContent>

						<TabsContent value="table">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[56px]">Plate</TableHead>
										<TableHead>Structure</TableHead>
										{showCityColumn && <TableHead>City</TableHead>}
										<TableHead className="w-[220px]">Elevation Scale</TableHead>
										<TableHead className="text-right">Floors</TableHead>
										<TableHead className="text-right">Opened</TableHead>
										<TableHead>Architects</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{items.map((item) => {
										const swatches = extractSwatches(item.primaryImage);
										return (
											<TableRow key={item.id}>
												<TableCell className="py-2">
													<Link
														href={item.url}
														className="block size-11 overflow-hidden border border-border"
													>
														<ArchivalImage
															image={item.primaryImage}
															alt={item.title}
															variant="thumb"
															className="size-full"
														/>
													</Link>
												</TableCell>
												<TableCell>
													<div className="flex flex-col">
														<Link
															href={item.url}
															className="font-semibold text-foreground hover:text-primary"
														>
															{item.title}
														</Link>
														<div className="mt-1 flex items-center gap-2">
															{swatches.length > 0 && (
																<span className="inline-flex h-2 w-12 overflow-hidden rounded-xs border border-border/60">
																	{swatches.map((hex, idx) => (
																		<span
																			key={`${hex}-${idx}`}
																			className="h-full flex-1"
																			style={{ backgroundColor: hex }}
																		/>
																	))}
																</span>
															)}
															{item.imageCount > 0 && (
																<span className="inline-flex items-center gap-1 font-mono text-[11px] tabular-nums text-muted-foreground">
																	<Camera className="size-3" />
																	{item.imageCount}
																</span>
															)}
														</div>
													</div>
												</TableCell>
												{showCityColumn && (
													<TableCell>
														{item.city ? (
															<Link
																href={item.city.url}
																className="font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
															>
																{item.city.title}
															</Link>
														) : (
															<span className="font-mono text-xs text-muted-foreground">
																—
															</span>
														)}
													</TableCell>
												)}
												<TableCell>
													<ElevationScaleBar
														height={item.height}
														accentColor={extractAccentColor(item.primaryImage)}
													/>
												</TableCell>
												<TableCell className="text-right font-mono text-xs tabular-nums">
													{item.floors ?? "—"}
												</TableCell>
												<TableCell className="text-right font-mono text-xs tabular-nums">
													{item.year ?? "—"}
												</TableCell>
												<TableCell className="max-w-[220px]">
													{item.architects.length > 0 ? (
														<div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
															{item.architects.slice(0, 2).map((arch) => (
																<Link
																	key={arch.id}
																	href={arch.url}
																	className="text-muted-foreground hover:text-foreground hover:underline"
																>
																	{arch.title}
																</Link>
															))}
															{item.architects.length > 2 && (
																<span className="font-mono text-[11px] text-muted-foreground">
																	+{item.architects.length - 2}
																</span>
															)}
														</div>
													) : (
														<span className="font-mono text-xs text-muted-foreground">
															Unrecorded
														</span>
													)}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TabsContent>

						<TabsContent value="map">
							<SkyscraperMap
								points={mapPoints}
								center={mapCenter}
								heightClassName="h-[520px]"
							/>
						</TabsContent>
					</>
				)}
			</Tabs>

			{pagination.totalPages > 1 && (
				<nav
					aria-label="Pagination"
					className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
				>
					<span className="font-mono text-xs tabular-nums text-muted-foreground">
						Showing {pagination.start}–
						{Math.min(pagination.total, pagination.start + pagination.count - 1)}{" "}
						of {pagination.total.toLocaleString("en-US")} entries
					</span>

					<div className="flex flex-wrap items-center gap-1">
						{pagination.prevUrl ? (
							<Button asChild variant="outline" size="sm">
								<Link href={pagination.prevUrl} preserveScroll>
									<ChevronLeft className="size-3.5" />
									Prev
								</Link>
							</Button>
						) : (
							<Button variant="outline" size="sm" disabled>
								<ChevronLeft className="size-3.5" />
								Prev
							</Button>
						)}

						{pagination.links.map((link, index) =>
							link.url ? (
								<Button
									key={`${link.label}-${index}`}
									asChild
									variant={link.current ? "default" : "outline"}
									size="sm"
									className="min-w-8 px-2.5 font-mono text-xs tabular-nums"
								>
									<Link href={link.url} preserveScroll>
										{link.label}
									</Link>
								</Button>
							) : (
								<span
									key={`ellipsis-${index}`}
									className="px-2 font-mono text-xs text-muted-foreground"
								>
									{link.label}
								</span>
							)
						)}

						{pagination.nextUrl ? (
							<Button asChild variant="outline" size="sm">
								<Link href={pagination.nextUrl} preserveScroll>
									Next
									<ChevronRight className="size-3.5" />
								</Link>
							</Button>
						) : (
							<Button variant="outline" size="sm" disabled>
								Next
								<ChevronRight className="size-3.5" />
							</Button>
						)}
					</div>
				</nav>
			)}
		</div>
	);
}

export function SkyscraperMonographCell({
	item,
	showCity = true,
}: {
	item: SkyscraperListItem;
	showCity?: boolean;
}) {
	return (
		<article className="group flex flex-col justify-between bg-background p-5 transition-colors hover:bg-card/70">
			<div>
				<Link
					href={item.url}
					className="relative block aspect-[4/3] w-full overflow-hidden border border-border bg-secondary"
				>
					<ArchivalImage
						image={item.primaryImage}
						alt={item.title}
						variant="thumb"
						showSwatches
						className="size-full"
						imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
					/>
					{item.imageCount > 1 && (
						<span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-xs bg-background/90 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-foreground border border-border">
							<Camera className="size-3" />
							{item.imageCount}
						</span>
					)}
				</Link>

				<div className="mt-4 flex items-baseline justify-between gap-2">
					<h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
						<Link href={item.url}>{item.title}</Link>
					</h3>
					{showCity && item.city && (
						<Link
							href={item.city.url}
							className="shrink-0 font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
						>
							{item.city.title}
						</Link>
					)}
				</div>

				<div className="mt-3">
					<ElevationScaleBar
						height={item.height}
						accentColor={extractAccentColor(item.primaryImage)}
					/>
				</div>

				<dl className="mt-3 grid grid-cols-3 border-y border-border py-2 font-mono text-xs tabular-nums">
					<div>
						<dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
							Height
						</dt>
						<dd className="mt-0.5 font-semibold text-foreground">
							{formatFeet(item.height)}
						</dd>
					</div>
					<div className="border-x border-border px-2.5 text-right">
						<dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
							Floors
						</dt>
						<dd className="mt-0.5 font-semibold text-foreground">
							{item.floors ?? "—"}
						</dd>
					</div>
					<div className="pl-2.5 text-right">
						<dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
							Opened
						</dt>
						<dd className="mt-0.5 font-semibold text-foreground">
							{item.year ?? "—"}
						</dd>
					</div>
				</dl>

				{item.summary && (
					<p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
						{item.summary}
					</p>
				)}
			</div>

			<div className="mt-4 flex items-center justify-between gap-2 pt-2 text-xs">
				<div className="truncate text-muted-foreground">
					{item.architects.length > 0 ? (
						<Link
							href={item.architects[0].url}
							className="font-mono text-[11px] hover:text-foreground hover:underline"
						>
							{item.architects[0].title}
							{item.architects.length > 1
								? ` +${item.architects.length - 1}`
								: ""}
						</Link>
					) : (
						<span className="font-mono text-[11px] opacity-60">
							Architect unrecorded
						</span>
					)}
				</div>

				<Link
					href={item.url}
					className={cn(
						"shrink-0 font-mono text-[11px] font-medium text-primary hover:underline"
					)}
				>
					Monograph →
				</Link>
			</div>
		</article>
	);
}
