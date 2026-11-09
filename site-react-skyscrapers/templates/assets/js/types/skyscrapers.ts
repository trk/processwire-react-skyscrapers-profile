import type {
	CityPageData,
	InertiaImage,
	InertiaMapMarker,
	InertiaPageBase,
	InertiaSharedProps,
} from "./inertia";

export type CitySummary = Pick<
	CityPageData,
	"id" | "name" | "title" | "url" | "abbreviation"
>;

export type ArchitectRef = Pick<
	InertiaPageBase,
	"id" | "name" | "title" | "url"
>;

export interface ArchitectDirectoryItem extends ArchitectRef {
	initial: string;
	skyscraperCount: number;
}

export interface SkyscraperListItem {
	id: number;
	name: string;
	title: string;
	url: string;
	height: number | null;
	floors: number | null;
	year: number | null;
	summary: string;
	city: CitySummary | null;
	architects: ArchitectRef[];
	map: InertiaMapMarker | null;
	primaryImage: InertiaImage | null;
	imageCount: number;
}

export interface PaginationLink {
	page: number | null;
	label: string;
	url: string | null;
	current: boolean;
}

export interface SkyscraperPagination {
	total: number;
	count: number;
	start: number;
	limit: number;
	currentPage: number;
	totalPages: number;
	label: string;
	prevUrl: string | null;
	nextUrl: string | null;
	links: PaginationLink[];
}

export interface SkyscraperListingPayload {
	items: SkyscraperListItem[];
	pagination: SkyscraperPagination;
	sort: string;
	selector: string;
}

export interface FilterOption {
	value: string;
	label: string;
}

export interface SearchFilterOptions {
	heights: FilterOption[];
	floors: FilterOption[];
	years: FilterOption[];
	sorts: FilterOption[];
}

export interface QuickPreset {
	label: string;
	url: string;
	code: string;
}

export interface AtlasNavigationItem {
	label: string;
	url: string;
}

export interface AtlasDirectory {
	title: string;
	subtitle: string;
	counts: {
		skyscrapers: number;
		cities: number;
		architects: number;
	};
	navigation: AtlasNavigationItem[];
	quickPresets: QuickPreset[];
	cities: CityPageData[];
	filterOptions: SearchFilterOptions;
}

export interface AdminContext {
	isLoggedIn: boolean;
	canEdit: boolean;
	editUrl: string | null;
	adminUrl: string;
}

export interface SkyscrapersSharedProps extends InertiaSharedProps {
	atlas: AtlasDirectory;
	adminContext: AdminContext;
	browserTitle?: string;
}

export interface HeroPhoto extends InertiaImage {
	captionHtml: string;
}

export interface SearchFilters {
	city: string;
	architect: string;
	height: string;
	floors: string;
	year: string;
	keywords: string;
}
