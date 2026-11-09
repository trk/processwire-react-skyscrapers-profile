import * as React from "react";
import { Link } from "@inertiajs/react";
import { Search, Compass } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/skyscrapers/AppLayout";
import { SelectorInspector } from "@/components/skyscrapers/SelectorInspector";
import type { ArchitectsPageData } from "@/types/inertia";
import type { ArchitectDirectoryItem } from "@/types/skyscrapers";
import { cn } from "@/lib/utils";

interface ArchitectsIndexProps {
	page: ArchitectsPageData;
	architects: ArchitectDirectoryItem[];
	selector: string;
}

export default function ArchitectsIndex({
	page,
	architects,
	selector,
}: ArchitectsIndexProps) {
	const [query, setQuery] = React.useState("");
	const [activeLetter, setActiveLetter] = React.useState<string>("ALL");

	const letters = React.useMemo(() => {
		const set = new Set<string>();
		for (const arch of architects) {
			if (arch.initial) {
				set.add(arch.initial);
			}
		}
		return ["ALL", ...Array.from(set).sort()];
	}, [architects]);

	const filtered = React.useMemo(() => {
		const q = query.trim().toLowerCase();
		return architects.filter((a) => {
			if (activeLetter !== "ALL" && a.initial !== activeLetter) {
				return false;
			}
			if (q !== "" && !a.title.toLowerCase().includes(q)) {
				return false;
			}
			return true;
		});
	}, [architects, query, activeLetter]);

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
						Alphabetical index of {architects.length} architectural firms and
						structural designers credited across the United States Skyscrapers
						monograph archive.
					</p>
				</div>

				<div className="relative w-full sm:w-72">
					<Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
					<Input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Filter firms or architects…"
						className="pl-8"
					/>
				</div>
			</div>

			<SelectorInspector
				selector={selector}
				total={filtered.length}
				className="mt-6"
			/>

			<div className="mt-5 flex flex-wrap gap-1 border border-border bg-card p-2">
				{letters.map((letter) => (
					<button
						key={letter}
						type="button"
						onClick={() => setActiveLetter(letter)}
						className={cn(
							"min-w-7 rounded-xs px-2 py-1 font-mono text-xs font-medium transition-colors cursor-pointer",
							activeLetter === letter
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:bg-secondary hover:text-foreground"
						)}
					>
						{letter}
					</button>
				))}
			</div>

			{filtered.length === 0 ? (
				<div className="mt-8 border border-border bg-card/40 py-14 text-center">
					<Compass className="mx-auto size-7 text-muted-foreground" />
					<p className="mt-2 font-mono text-xs text-muted-foreground">
						No architectural practices match &ldquo;{query}&rdquo;.
					</p>
				</div>
			) : (
				<div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((arch) => (
						<Link
							key={arch.id}
							href={arch.url}
							className="group flex items-center justify-between bg-background px-4 py-3.5 transition-colors hover:bg-card"
						>
							<span className="font-medium text-foreground group-hover:text-primary">
								{arch.title}
							</span>
							<span className="ml-3 shrink-0 rounded-xs border border-border bg-secondary/70 px-2 py-0.5 font-mono text-xs tabular-nums text-muted-foreground">
								{arch.skyscraperCount}{" "}
								{arch.skyscraperCount === 1 ? "tower" : "towers"}
							</span>
						</Link>
					))}
				</div>
			)}
		</AppLayout>
	);
}
