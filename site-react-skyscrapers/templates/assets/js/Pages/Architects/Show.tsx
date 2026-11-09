import * as React from "react";
import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/skyscrapers/AppLayout";
import { SkyscraperCatalogView } from "@/components/skyscrapers/SkyscraperCatalogView";
import type { ArchitectPageData } from "@/types/inertia";
import type { SkyscraperListingPayload } from "@/types/skyscrapers";

interface ArchitectShowProps {
	page: ArchitectPageData;
	listing: SkyscraperListingPayload;
}

export default function ArchitectShow({
	page,
	listing,
}: ArchitectShowProps) {
	return (
		<AppLayout
			breadcrumbs={[
				{ label: "Architects", url: "/architects/" },
				{ label: page.title },
			]}
		>
			<header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						{page.title}
					</h1>
					<p className="mt-2 font-mono text-xs text-muted-foreground">
						Architectural Practice Monograph &middot;{" "}
						<strong className="font-semibold text-foreground tabular-nums">
							{listing.pagination.total}
						</strong>{" "}
						attributed skyscraper{" "}
						{listing.pagination.total === 1 ? "project" : "projects"}
					</p>
				</div>

				<Button asChild variant="outline" size="sm">
					<Link href="/architects/">
						<ArrowLeft className="size-3.5" />
						All Architects
					</Link>
				</Button>
			</header>

			<section className="mt-6">
				<SkyscraperCatalogView listing={listing} showCityColumn />
			</section>
		</AppLayout>
	);
}
