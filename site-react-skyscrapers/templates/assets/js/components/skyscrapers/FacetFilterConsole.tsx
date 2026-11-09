import * as React from "react";
import { router, usePage } from "@inertiajs/react";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SearchFilters, SkyscrapersSharedProps } from "@/types/skyscrapers";
import { cn } from "@/lib/utils";

interface FacetFilterConsoleProps {
	initialFilters?: Partial<SearchFilters>;
	currentSort?: string;
	compact?: boolean;
	className?: string;
}

export function FacetFilterConsole({
	initialFilters,
	currentSort = "name",
	compact = false,
	className,
}: FacetFilterConsoleProps) {
	const { atlas } = usePage<SkyscrapersSharedProps>().props;
	const [keywords, setKeywords] = React.useState(initialFilters?.keywords ?? "");
	const [city, setCity] = React.useState(initialFilters?.city ?? "");
	const [height, setHeight] = React.useState(initialFilters?.height ?? "");
	const [floors, setFloors] = React.useState(initialFilters?.floors ?? "");
	const [year, setYear] = React.useState(initialFilters?.year ?? "");

	React.useEffect(() => {
		setKeywords(initialFilters?.keywords ?? "");
		setCity(initialFilters?.city ?? "");
		setHeight(initialFilters?.height ?? "");
		setFloors(initialFilters?.floors ?? "");
		setYear(initialFilters?.year ?? "");
	}, [
		initialFilters?.keywords,
		initialFilters?.city,
		initialFilters?.height,
		initialFilters?.floors,
		initialFilters?.year,
	]);

	const hasActiveFilters =
		keywords.trim() !== "" ||
		city !== "" ||
		height !== "" ||
		floors !== "" ||
		year !== "" ||
		Boolean(initialFilters?.architect);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const query: Record<string, string> = {};
		if (keywords.trim() !== "") {
			query.keywords = keywords.trim();
		}
		if (city !== "") {
			query.city = city;
		}
		if (initialFilters?.architect) {
			query.architect = initialFilters.architect;
		}
		if (height !== "") {
			query.height = height;
		}
		if (floors !== "") {
			query.floors = floors;
		}
		if (year !== "") {
			query.year = year;
		}
		if (currentSort) {
			query.sort = currentSort;
		}

		router.get("/search/", query);
	};

	const handleReset = () => {
		setKeywords("");
		setCity("");
		setHeight("");
		setFloors("");
		setYear("");
		router.get("/search/");
	};

	const selectClassName =
		"h-9 w-full min-w-0 rounded-sm border border-input bg-background px-2.5 text-sm text-foreground transition-colors focus:border-primary";

	return (
		<form
			onSubmit={handleSubmit}
			className={cn(
				"border border-border bg-card/70 p-4 sm:p-5",
				className
			)}
		>
			<div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
				<div className="flex items-center gap-2">
					<SlidersHorizontal className="size-4 text-primary" />
					<span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
						Structural Facet Query Console
					</span>
				</div>
				{hasActiveFilters && (
					<button
						type="button"
						onClick={handleReset}
						className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground cursor-pointer"
					>
						<RotateCcw className="size-3" />
						Reset facets
					</button>
				)}
			</div>

			<div
				className={cn(
					"grid gap-3",
					compact
						? "grid-cols-1 sm:grid-cols-2"
						: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6"
				)}
			>
				<div className={cn(compact ? "sm:col-span-2" : "lg:col-span-2")}>
					<label
						htmlFor="facet-keywords"
						className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
					>
						Keywords (Title / Monograph)
					</label>
					<div className="relative">
						<Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
						<Input
							id="facet-keywords"
							type="search"
							value={keywords}
							onChange={(e) => setKeywords(e.target.value)}
							placeholder="e.g. Willis, Chrysler, Art Deco, Skidmore…"
							className="pl-8"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="facet-city"
						className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
					>
						City ({atlas.cities.length})
					</label>
					<select
						id="facet-city"
						value={city}
						onChange={(e) => setCity(e.target.value)}
						className={selectClassName}
					>
						<option value="">All US Cities</option>
						{atlas.cities.map((c) => (
							<option key={c.id} value={c.name}>
								{c.title} ({c.skyscraperCount ?? 0})
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor="facet-height"
						className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
					>
						Elevation (ft)
					</label>
					<select
						id="facet-height"
						value={height}
						onChange={(e) => setHeight(e.target.value)}
						className={selectClassName}
					>
						<option value="">Any Height</option>
						{atlas.filterOptions.heights.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor="facet-floors"
						className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
					>
						Story Count
					</label>
					<select
						id="facet-floors"
						value={floors}
						onChange={(e) => setFloors(e.target.value)}
						className={selectClassName}
					>
						<option value="">Any Floor Count</option>
						{atlas.filterOptions.floors.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>

				<div>
					<label
						htmlFor="facet-year"
						className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
					>
						Completion Era
					</label>
					<div className="flex gap-2">
						<select
							id="facet-year"
							value={year}
							onChange={(e) => setYear(e.target.value)}
							className={selectClassName}
						>
							<option value="">Any Decade</option>
							{atlas.filterOptions.years.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
						<Button type="submit" className="shrink-0 px-4">
							Query
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}
