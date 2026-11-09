import * as React from "react";
import { AppLayout } from "@/components/skyscrapers/AppLayout";
import { FacetFilterConsole } from "@/components/skyscrapers/FacetFilterConsole";
import { SkyscraperCatalogView } from "@/components/skyscrapers/SkyscraperCatalogView";
import type { ListAllPageData } from "@/types/inertia";
import type { SkyscraperListingPayload } from "@/types/skyscrapers";

interface SkyscrapersAllProps {
	page: ListAllPageData;
	listing: SkyscraperListingPayload;
}

export default function SkyscrapersAll({
	page,
	listing,
}: SkyscrapersAllProps) {
	return (
		<AppLayout
			breadcrumbs={[{ label: page.title }]}
		>
			<header className="border-b border-border pb-6">
				<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
					{page.title}
				</h1>
				<p className="mt-2 max-w-[66ch] text-sm text-muted-foreground">
					Complete master index of{" "}
					<strong className="font-semibold text-foreground tabular-nums">
						{listing.pagination.total.toLocaleString("en-US")}
					</strong>{" "}
					cataloged United States skyscrapers. Switch between Folio Grid,
					Spec Table, and Geospatial Map views or narrow the selector below.
				</p>

				<div className="mt-6">
					<FacetFilterConsole currentSort={listing.sort} />
				</div>
			</header>

			<section className="mt-6">
				<SkyscraperCatalogView listing={listing} showCityColumn />
			</section>
		</AppLayout>
	);
}
