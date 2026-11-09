import * as React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
	Building2,
	ChevronRight,
	ExternalLink,
	Moon,
	Search,
	Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "./CommandPalette";
import type { SkyscrapersSharedProps } from "@/types/skyscrapers";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
	label: string;
	url?: string;
}

interface AppLayoutProps {
	title?: string;
	breadcrumbs?: BreadcrumbItem[];
	children: React.ReactNode;
}

export function AppLayout({
	title,
	breadcrumbs,
	children,
}: AppLayoutProps) {
	const page = usePage<SkyscrapersSharedProps>();
	const { atlas, adminContext, browserTitle } = page.props;
	const currentUrl = page.url;

	const [commandOpen, setCommandOpen] = React.useState(false);
	const [isDark, setIsDark] = React.useState(false);

	React.useEffect(() => {
		setIsDark(document.documentElement.classList.contains("dark"));
	}, []);

	const toggleTheme = () => {
		const root = document.documentElement;
		const nextDark = !root.classList.contains("dark");
		root.classList.toggle("dark", nextDark);
		setIsDark(nextDark);
		try {
			localStorage.setItem("skyscrapers-theme", nextDark ? "dark" : "light");
		} catch {
			// Ignore storage errors
		}
	};

	const resolvedTitle =
		title || browserTitle || "US Skyscrapers — Architectural Monograph & Index";

	const isActiveRoute = (navUrl: string) => {
		if (navUrl === "/") {
			return currentUrl === "/";
		}
		return currentUrl.startsWith(navUrl);
	};

	return (
		<>
			<Head title={resolvedTitle} />
			<CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

			<div className="flex min-h-screen w-full overflow-x-hidden flex-col bg-background text-foreground">
				<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xs">
					<div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
						<div className="flex min-w-0 items-center gap-6">
							<Link
								href="/"
								className="group flex min-w-0 items-center gap-2.5 text-foreground"
							>
								<span className="flex size-8 shrink-0 items-center justify-center border border-border bg-card text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
									<Building2 className="size-4" />
								</span>
								<span className="flex min-w-0 flex-col">
									<span className="truncate text-sm font-bold tracking-tight uppercase">
										{atlas.title}
									</span>
									<span className="truncate font-mono text-[10px] tracking-wider text-muted-foreground">
										{atlas.counts.skyscrapers.toLocaleString("en-US")} Towers &middot;{" "}
										{atlas.counts.cities} Cities &middot;{" "}
										{atlas.counts.architects} Architects
									</span>
								</span>
							</Link>

							<nav
								aria-label="Primary Navigation"
								className="hidden items-center gap-1 md:flex"
							>
								{atlas.navigation.map((item) => {
									const active = isActiveRoute(item.url);
									return (
										<Link
											key={item.url}
											href={item.url}
											className={cn(
												"rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
												active
													? "bg-secondary text-foreground font-semibold"
													: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
											)}
										>
											{item.label}
										</Link>
									);
								})}
							</nav>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setCommandOpen(true)}
								className="inline-flex h-8 items-center gap-2.5 rounded-sm border border-border bg-card px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground cursor-pointer"
							>
								<Search className="size-3.5" />
								<span className="hidden sm:inline">Quick Index…</span>
								<kbd className="rounded-xs border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
									⌘K
								</kbd>
							</button>

							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={toggleTheme}
								className="size-8"
								title={isDark ? "Switch to daylight folio" : "Switch to nocturnal basalt"}
								aria-label="Toggle color theme"
							>
								{isDark ? (
									<Sun className="size-3.5" />
								) : (
									<Moon className="size-3.5" />
								)}
							</Button>

							{adminContext?.canEdit && adminContext.editUrl && (
								<Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
									<a href={adminContext.editUrl}>
										Edit Page
										<ExternalLink className="size-3" />
									</a>
								</Button>
							)}
						</div>
					</div>

					<div className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-1.5 md:hidden">
						{atlas.navigation.map((item) => {
							const active = isActiveRoute(item.url);
							return (
								<Link
									key={item.url}
									href={item.url}
									className={cn(
										"shrink-0 rounded-sm px-2.5 py-1 text-xs font-medium",
										active
											? "bg-secondary text-foreground font-semibold"
											: "text-muted-foreground"
									)}
								>
									{item.label}
								</Link>
							);
						})}
					</div>

					{breadcrumbs && breadcrumbs.length > 0 && (
						<div className="border-t border-border bg-card/50">
							<div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-4 py-2 font-mono text-xs text-muted-foreground sm:px-6 lg:px-8">
								<Link href="/" className="hover:text-foreground hover:underline">
									Atlas Index
								</Link>
								{breadcrumbs.map((crumb, idx) => (
									<React.Fragment key={`${crumb.label}-${idx}`}>
										<ChevronRight className="size-3 shrink-0 opacity-60" />
										{crumb.url ? (
											<Link
												href={crumb.url}
												className="hover:text-foreground hover:underline"
											>
												{crumb.label}
											</Link>
										) : (
											<span className="font-medium text-foreground">
												{crumb.label}
											</span>
										)}
									</React.Fragment>
								))}
							</div>
						</div>
					)}
				</header>

				<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
					{children}
				</main>

				<footer className="mt-16 border-t border-border bg-card/60">
					<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
							<div>
								<h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
									{atlas.title} &mdash; Structural Monograph
								</h2>
								<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
									A comprehensive architectural directory of{" "}
									{atlas.counts.skyscrapers.toLocaleString("en-US")} high-rise
									structures across {atlas.counts.cities} United States
									municipalities and {atlas.counts.architects} architectural
									practices.
								</p>
							</div>

							<div>
								<h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
									Selector Presets
								</h2>
								<ul className="mt-2 space-y-1.5 font-mono text-xs">
									{atlas.quickPresets.map((preset) => (
										<li key={preset.url}>
											<Link
												href={preset.url}
												className="text-muted-foreground hover:text-primary hover:underline"
											>
												{preset.label}
											</Link>
										</li>
									))}
								</ul>
							</div>

							<div>
								<h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
									Runtime Architecture
								</h2>
								<dl className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
									<div className="flex justify-between">
										<dt>CMS Engine:</dt>
										<dd className="text-foreground">ProcessWire 3.0.275</dd>
									</div>
									<div className="flex justify-between">
										<dt>Protocol &amp; Bundler:</dt>
										<dd className="text-foreground">Inertia.js v3 + Vite 8</dd>
									</div>
									<div className="flex justify-between">
										<dt>Imaging Pipeline:</dt>
										<dd className="text-foreground">
											InterventionImage v4.4 (WebP / LQIP / Palette)
										</dd>
									</div>
									<div className="flex justify-between">
										<dt>Admin Backend:</dt>
										<dd>
											<a
												href={adminContext?.adminUrl || "/processwire/"}
												className="text-primary hover:underline"
											>
												ProcessWire Admin →
											</a>
										</dd>
									</div>
								</dl>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</>
	);
}
