import * as React from "react";
import { Link } from "@inertiajs/react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/skyscrapers/AppLayout";
import { FacetFilterConsole } from "@/components/skyscrapers/FacetFilterConsole";
import { SkyscraperCatalogView } from "@/components/skyscrapers/SkyscraperCatalogView";
import type { SearchPageData } from "@/types/inertia";
import type {
	SearchFilters,
	SkyscraperListingPayload,
} from "@/types/skyscrapers";

interface SearchIndexProps {
	page: SearchPageData;
	filters: SearchFilters;
	summary: Record<string, string>;
	listing: SkyscraperListingPayload;
}

export default function SearchIndex({
	page,
	filters,
	summary,
	listing,
}: SearchIndexProps) {
	const summaryEntries = Object.entries(summary || {}).filter(
		([, val]) => typeof val === "string" && val.trim() !== ""
	);

	return (
		<AppLayout
			breadcrumbs={[{ label: page.title }]}
		>
			<header className="border-b border-border pb-6">
				<div className="flex flex-wrap items-baseline justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
							{page.title}
						</h1>
						<p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">
							Formulate multi-criteria ProcessWire selectors combining
							municipality, elevation brackets, story counts, completion decades,
							and full-text monograph search.
						</p>
					</div>
				</div>

				<div className="mt-6">
					<FacetFilterConsole
						initialFilters={filters}
						currentSort={listing.sort}
					/>
				</div>

				{summaryEntries.length > 0 && (
					<div className="mt-4 flex flex-wrap items-center gap-2">
						<span className="font-mono text-xs text-muted-foreground">
							Active Constraints:
						</span>
						{summaryEntries.map(([key, label]) => (
							<Badge
								key={key}
								variant="secondary"
								className="font-mono text-xs"
							>
								<span className="mr-1 uppercase text-muted-foreground">
									{key}:
								</span>
								<span>{label}</span>
							</Badge>
						))}
						<Link
							href="/search/"
							className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
						>
							<X className="size-3" />
							Clear all
						</Link>
					</div>
				)}
			</header>

			<section className="mt-6">
				<SkyscraperCatalogView listing={listing} showCityColumn />
			</section>
		</AppLayout>
	);
}
