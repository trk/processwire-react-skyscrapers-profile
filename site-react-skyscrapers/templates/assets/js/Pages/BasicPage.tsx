import * as React from "react";
import { Link } from "@inertiajs/react";
import { AppLayout } from "@/components/skyscrapers/AppLayout";
import { ArchivalImage } from "@/components/skyscrapers/ArchivalImage";
import { SelectorInspector } from "@/components/skyscrapers/SelectorInspector";
import type { BasicPagePageData } from "@/types/inertia";

interface BasicPageProps {
	page: BasicPagePageData;
	selector: string;
}

export default function BasicPage({
	page,
	selector,
}: BasicPageProps) {
	const images = Array.isArray(page.images) ? page.images : [];

	return (
		<AppLayout
			breadcrumbs={[{ label: page.title }]}
		>
			<article className="mx-auto max-w-4xl">
				<header className="border-b border-border pb-6">
					<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
						{page.title}
					</h1>
					<SelectorInspector selector={selector} className="mt-4" />
				</header>

				<div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
					<div className="lg:col-span-8">
						{page.body ? (
							<div
								className="monograph-prose text-base text-foreground [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5"
								dangerouslySetInnerHTML={{ __html: page.body }}
							/>
						) : (
							<p className="text-sm text-muted-foreground">
								The requested page could not be found or has no content.{" "}
								<Link href="/" className="text-primary underline">
									Return to the Skyscrapers Index
								</Link>
								.
							</p>
						)}
					</div>

					<aside className="space-y-4 lg:col-span-4">
						<div className="border border-border bg-card p-4">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
								Technical Colophon
							</h2>
							<dl className="mt-3 space-y-2 font-mono text-xs text-muted-foreground">
								<div className="flex justify-between border-b border-border pb-1.5">
									<dt>Backend CMF</dt>
									<dd className="text-foreground">ProcessWire 3.0.275</dd>
								</div>
								<div className="flex justify-between border-b border-border pb-1.5">
									<dt>SPA Protocol</dt>
									<dd className="text-foreground">ProcessWire\Inertia v3</dd>
								</div>
								<div className="flex justify-between border-b border-border pb-1.5">
									<dt>Asset Pipeline</dt>
									<dd className="text-foreground">ProcessWire\Vite</dd>
								</div>
								<div className="flex justify-between border-b border-border pb-1.5">
									<dt>Image Engine</dt>
									<dd className="text-foreground">InterventionImage v4.4</dd>
								</div>
								<div className="flex justify-between">
									<dt>UI Primitives</dt>
									<dd className="text-foreground">React 19 + shadcn/ui</dd>
								</div>
							</dl>
						</div>

						{images.map((img, i) => (
							<div key={`${img.name}-${i}`} className="border border-border bg-card p-2">
								<ArchivalImage
									image={img}
									alt={img.description || page.title}
									variant="medium"
									showSwatches
									className="aspect-[4/3] w-full"
								/>
							</div>
						))}
					</aside>
				</div>
			</article>
		</AppLayout>
	);
}
