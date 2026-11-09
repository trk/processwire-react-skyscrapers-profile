import * as React from "react";
import { Link, usePage } from "@inertiajs/react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/skyscrapers/AppLayout";
import { SelectorInspector } from "@/components/skyscrapers/SelectorInspector";
import {
	SkyscraperMap,
	buildCityMapPoints,
} from "@/components/skyscrapers/SkyscraperMap";
import type { CitiesPageData } from "@/types/inertia";
import type { SkyscrapersSharedProps } from "@/types/skyscrapers";

interface CitiesIndexProps {
	page: CitiesPageData;
	selector: string;
}

export default function CitiesIndex({
	page,
	selector,
}: CitiesIndexProps) {
	const { atlas } = usePage<SkyscrapersSharedProps>().props;
	const cities = atlas.cities;
	const [filter, setFilter] = React.useState("");

	const filteredCities = React.useMemo(() => {
		const q = filter.trim().toLowerCase();
		if (q === "") {
			return cities;
		}
		return cities.filter(
			(c) =>
				c.title.toLowerCase().includes(q) ||
				(c.abbreviation && c.abbreviation.toLowerCase().includes(q))
		);
	}, [cities, filter]);

	const maxCount = React.useMemo(
		() => Math.max(1, ...cities.map((c) => c.skyscraperCount || 0)),
		[cities]
	);

	const mapPoints = React.useMemo(
		() => buildCityMapPoints(filteredCities),
		[filteredCities]
	);

	return (
		<AppLayout
			breadcrumbs={[{ label: page.title }]}
		>
			<div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						{page.title}
					</h1>
					<p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">
						Explore high-rise monographs organized across {cities.length} United
						States municipalities, complete with geospatial coordinates and
						structural density bars.
					</p>
				</div>

				<div className="relative w-full sm:w-72">
					<Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
					<Input
						type="search"
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						placeholder="Filter cities by name or state…"
						className="pl-8"
					/>
				</div>
			</div>

			<SelectorInspector
				selector={selector}
				total={filteredCities.length}
				className="mt-6"
			/>

			<div className="mt-6">
				<SkyscraperMap points={mapPoints} heightClassName="h-[360px]" />
			</div>

			<div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{filteredCities.map((city) => {
					const ratio = Math.max(
						4,
						Math.round(((city.skyscraperCount || 0) / maxCount) * 100)
					);
					return (
						<Link
							key={city.id}
							href={city.url}
							className="group flex flex-col justify-between bg-background p-4 transition-colors hover:bg-card"
						>
							<div className="flex items-baseline justify-between gap-2">
								<h2 className="text-base font-semibold text-foreground group-hover:text-primary">
									{city.title}
									{city.abbreviation && (
										<span className="ml-1.5 font-mono text-xs font-normal text-muted-foreground">
											{city.abbreviation}
										</span>
									)}
								</h2>
								<span className="font-mono text-sm font-semibold tabular-nums text-foreground">
									{city.skyscraperCount}
								</span>
							</div>

							<div className="mt-3">
								<div className="h-1 w-full bg-secondary">
									<div
										className="h-full bg-primary transition-all duration-300"
										style={{ width: `${ratio}%` }}
									/>
								</div>
								<div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
									<span className="inline-flex items-center gap-1">
										<MapPin className="size-3" />
										{city.map?.lat && city.map?.lng
											? `${city.map.lat.toFixed(2)}°, ${city.map.lng.toFixed(2)}°`
											: "Unmapped"}
									</span>
									<span>
										{city.skyscraperCount === 1 ? "1 tower" : `${city.skyscraperCount} towers`}
									</span>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</AppLayout>
	);
}
