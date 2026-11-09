import * as React from "react";
import { router, usePage } from "@inertiajs/react";
import { Command as CommandPrimitive } from "cmdk";
import {
	Building2,
	Compass,
	MapPin,
	Search,
	SlidersHorizontal,
	ArrowRight,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import type { SkyscrapersSharedProps } from "@/types/skyscrapers";

interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
	const { atlas } = usePage<SkyscrapersSharedProps>().props;
	const [query, setQuery] = React.useState("");

	React.useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				onOpenChange(!open);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, onOpenChange]);

	const navigateTo = (url: string) => {
		onOpenChange(false);
		setQuery("");
		router.visit(url);
	};

	const handleKeywordSearch = () => {
		const trimmed = query.trim();
		onOpenChange(false);
		setQuery("");
		if (trimmed !== "") {
			router.get("/search/", { keywords: trimmed });
		} else {
			router.visit("/search/");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
				<DialogTitle className="sr-only">
					Search Skyscrapers, Cities &amp; Structural Presets
				</DialogTitle>
				<DialogDescription className="sr-only">
					Jump to any United States city, structural height preset, or run a ProcessWire keyword query.
				</DialogDescription>

				<CommandPrimitive className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
					<div className="flex items-center border-b border-border px-3.5">
						<Search className="mr-2.5 size-4 shrink-0 text-muted-foreground" />
						<CommandPrimitive.Input
							value={query}
							onValueChange={setQuery}
							placeholder="Search cities, structural presets, or press Enter for keyword search…"
							className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
						/>
					</div>

					<CommandPrimitive.List className="max-h-[380px] overflow-y-auto p-2">
						<CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
							<p>No direct city or preset match.</p>
							{query.trim() !== "" && (
								<button
									type="button"
									onClick={handleKeywordSearch}
									className="mt-2 inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-3 py-1.5 font-mono text-xs text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer"
								>
									Query skyscrapers matching &ldquo;{query.trim()}&rdquo;
									<ArrowRight className="size-3.5" />
								</button>
							)}
						</CommandPrimitive.Empty>

						{query.trim() !== "" && (
							<CommandPrimitive.Group
								heading="Full-Text Monograph Search"
								className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
							>
								<CommandPrimitive.Item
									value={`search-keyword-${query}`}
									onSelect={handleKeywordSearch}
									className="flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-sm aria-selected:bg-secondary"
								>
									<span className="flex items-center gap-2">
										<Search className="size-4 text-primary" />
										<span>
											Search monographs for{" "}
											<strong className="font-semibold">
												&ldquo;{query.trim()}&rdquo;
											</strong>
										</span>
									</span>
									<span className="font-mono text-[11px] text-muted-foreground">
										title|body%=
									</span>
								</CommandPrimitive.Item>
							</CommandPrimitive.Group>
						)}

						<CommandPrimitive.Group
							heading="Structural Selector Presets"
							className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
						>
							{atlas.quickPresets.map((preset) => (
								<CommandPrimitive.Item
									key={preset.url}
									value={`${preset.label} ${preset.code}`}
									onSelect={() => navigateTo(preset.url)}
									className="flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-sm aria-selected:bg-secondary"
								>
									<span className="flex items-center gap-2">
										<SlidersHorizontal className="size-3.5 text-primary" />
										<span>{preset.label}</span>
									</span>
									<code className="font-mono text-[11px] text-muted-foreground">
										{preset.code}
									</code>
								</CommandPrimitive.Item>
							))}
						</CommandPrimitive.Group>

						<CommandPrimitive.Group
							heading="Atlas Directories"
							className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
						>
							{atlas.navigation.map((nav) => (
								<CommandPrimitive.Item
									key={nav.url}
									value={`nav ${nav.label}`}
									onSelect={() => navigateTo(nav.url)}
									className="flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-sm aria-selected:bg-secondary"
								>
									<span className="flex items-center gap-2">
										<Compass className="size-3.5 text-muted-foreground" />
										<span>{nav.label}</span>
									</span>
									<span className="font-mono text-xs text-muted-foreground">
										{nav.url}
									</span>
								</CommandPrimitive.Item>
							))}
						</CommandPrimitive.Group>

						<CommandPrimitive.Group
							heading={`United States Cities (${atlas.cities.length})`}
							className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
						>
							{atlas.cities.map((city) => (
								<CommandPrimitive.Item
									key={city.id}
									value={`city ${city.title} ${city.abbreviation}`}
									onSelect={() => navigateTo(city.url)}
									className="flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-1.5 text-sm aria-selected:bg-secondary"
								>
									<span className="flex items-center gap-2">
										<MapPin className="size-3.5 text-muted-foreground" />
										<span>
											{city.title}
											{city.abbreviation ? `, ${city.abbreviation}` : ""}
										</span>
									</span>
									<span className="inline-flex items-center gap-1 font-mono text-xs tabular-nums text-muted-foreground">
										<Building2 className="size-3" />
										{city.skyscraperCount ?? 0}
									</span>
								</CommandPrimitive.Item>
							))}
						</CommandPrimitive.Group>
					</CommandPrimitive.List>

					<div className="flex items-center justify-between border-t border-border bg-card/70 px-3.5 py-2 font-mono text-[11px] text-muted-foreground">
						<span>↑↓ to navigate &middot; Enter to open</span>
						<span>ESC to close</span>
					</div>
				</CommandPrimitive>
			</DialogContent>
		</Dialog>
	);
}
