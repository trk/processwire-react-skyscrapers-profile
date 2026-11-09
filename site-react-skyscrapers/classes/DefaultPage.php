<?php

declare(strict_types=1);

namespace ProcessWire;

use Totoglu\Inertia\InteractWithInertia;

/**
 * Base Custom Page Class for all frontend templates in the US Skyscrapers Atlas.
 *
 * Encapsulates shared `InteractWithInertia` behavior:
 *  - `inertiaShared()`: Cross-page `atlas` (`OnceProp`) and request-scoped `adminContext`
 *  - `inertiaWithData()`: Default `page` and `browserTitle` props
 *  - `inertiaViewData()`: Root View (`_inertia.php`) `$locale` and `$head` metadata
 *  - Shared domain helpers for Skyscraper catalog querying, pagination, and text summarization
 *
 * @property string $title
 */
class DefaultPage extends Page
{
	use InteractWithInertia;

	/**
	 * Valid skyscraper sort keys and their human-readable labels.
	 *
	 * @var array<string, string>
	 */
	public const array VALID_SORTS = [
		'name' => 'Name (A–Z)',
		'-name' => 'Name (Z–A)',
		'-height' => 'Height (Tallest)',
		'height' => 'Height (Shortest)',
		'-floors' => 'Floors (Most)',
		'floors' => 'Floors (Fewest)',
		'-year' => 'Year (Newest)',
		'year' => 'Year (Oldest)',
		'parent.name' => 'City (A–Z)',
		'-parent.name' => 'City (Z–A)',
		'-images.count' => 'Archival Plates (Most)',
		'images.count' => 'Archival Plates (Fewest)',
	];

	/**
	 * Resolve the active language code for `<html lang="...">`.
	 */
	public function locale(): string
	{
		$wire = $this->wire();
		$languages = $wire->languages;
		$user = $wire->user;

		if ($languages instanceof Languages && $user instanceof User && $user->language instanceof Language) {
			$code = trim((string) $user->language->name);
			if ($code !== '' && $code !== 'default') {
				return $code;
			}
		}

		return 'en';
	}

	/**
	 * Return the document `<title>` for this page.
	 */
	public function browserTitle(): string
	{
		return (string) $this->title . ' — US Skyscrapers Atlas';
	}

	/**
	 * Return the meta description for this page.
	 */
	public function metaDescription(): string
	{
		$body = (string) $this->get('body');
		if ($body !== '') {
			$summary = $this->summarizeText($body, 160);
			if ($summary !== '') {
				return $summary;
			}
		}

		return 'Interactive architectural monograph and structural directory of United States skyscrapers indexed by municipality, elevation, and architectural practice.';
	}

	/**
	 * Shared Inertia props contributed by the base Page class across all frontend routes.
	 *
	 * @return array<string, mixed>
	 */
	public function inertiaShared(): array
	{
		return [
			'atlas' => $this->inertia()
				->once(fn(): array => $this->atlasDirectory())
				->as('skyscrapers_atlas_directory')
				->until(3600),
			'adminContext' => fn(): array => $this->adminContext(),
		];
	}

	/**
	 * Default component props contributed by this Page class before explicit `inertiaRender()` props.
	 *
	 * @return array<string, mixed>
	 */
	public function inertiaWithData(): array
	{
		return [
			'page' => $this,
			'browserTitle' => $this->browserTitle(),
		];
	}

	/**
	 * Server-only PHP variables (`$locale`, `$head`) passed to `site/templates/_inertia.php`.
	 *
	 * @param array<string, mixed> $pageObject
	 * @return array<string, mixed>
	 */
	public function inertiaViewData(array $pageObject = []): array
	{
		$sanitizer = $this->wire()->sanitizer;
		$props = isset($pageObject['props']) && is_array($pageObject['props'])
			? $pageObject['props']
			: [];

		$resolvedTitle = isset($props['browserTitle']) && is_string($props['browserTitle']) && $props['browserTitle'] !== ''
			? $props['browserTitle']
			: $this->browserTitle();

		$resolvedDesc = isset($props['metaDescription']) && is_string($props['metaDescription']) && $props['metaDescription'] !== ''
			? $props['metaDescription']
			: $this->metaDescription();

		$safeTitle = $sanitizer->entities($resolvedTitle);
		$safeDesc = $sanitizer->entities($resolvedDesc);
		$safeUrl = $sanitizer->entities((string) $this->httpUrl);

		return [
			'locale' => $this->locale(),
			'head' => [
				"<title>{$safeTitle}</title>",
				"<meta name=\"description\" content=\"{$safeDesc}\">",
				"<meta property=\"og:title\" content=\"{$safeTitle}\">",
				"<meta property=\"og:description\" content=\"{$safeDesc}\">",
				"<meta property=\"og:url\" content=\"{$safeUrl}\">",
				"<meta property=\"og:type\" content=\"website\">",
			],
		];
	}

	/**
	 * Build the shared Atlas directory payload cached via `OnceProp`.
	 *
	 * @return array<string, mixed>
	 */
	public function atlasDirectory(): array
	{
		return $this->wire()->cache->get('skyscrapers_atlas_directory_v1', 3600, function (): array {
			$pages = $this->wire()->pages;
			$providers = $this->inertia()->providers();
			$citiesParent = $pages->get('/cities/');
			$cities = [];

			if ($citiesParent->id > 0) {
				foreach ($citiesParent->children('sort=title') as $city) {
					if ($city instanceof Page) {
						$cities[] = $providers->providePage($city);
					}
				}
			}

			return [
				'title' => 'US Skyscrapers',
				'subtitle' => 'Architectural Monograph & Structural Index',
				'counts' => [
					'skyscrapers' => (int) $pages->count('template=skyscraper'),
					'cities' => count($cities),
					'architects' => (int) $pages->count('template=architect'),
				],
				'navigation' => [
					['label' => 'Index', 'url' => '/'],
					['label' => 'Cities', 'url' => '/cities/'],
					['label' => 'Architects', 'url' => '/architects/'],
					['label' => 'All Skyscrapers', 'url' => '/all/'],
					['label' => 'Search & Filter', 'url' => '/search/'],
					['label' => 'About', 'url' => '/about/'],
				],
				'quickPresets' => [
					[
						'label' => 'Tallest Tier (750–1,000 ft)',
						'url' => '/search/?height=750-1000&sort=-height',
						'code' => 'height>=750, height<=1000, sort=-height',
					],
					[
						'label' => 'Early Skyscrapers (Pre-1930)',
						'url' => '/search/?year=1800-1929&sort=year',
						'code' => 'year>=1800, year<=1929, sort=year',
					],
					[
						'label' => 'Supertall Icons (1,000+ ft)',
						'url' => '/search/?height=1000+&sort=-height',
						'code' => 'height>=1000, sort=-height',
					],
					[
						'label' => '80+ Story Towers',
						'url' => '/search/?floors=80+&sort=-floors',
						'code' => 'floors>=80, sort=-floors',
					],
				],
				'cities' => $cities,
				'filterOptions' => self::filterOptions(),
			];
		});
	}

	/**
	 * Build the request-scoped admin context for the current user and page.
	 *
	 * @return array{isLoggedIn: bool, canEdit: bool, editUrl: string|null, adminUrl: string}
	 */
	public function adminContext(): array
	{
		$wire = $this->wire();
		$user = $wire->user;
		$canEdit = $this->id > 0 && $this->editable();

		return [
			'isLoggedIn' => (bool) $user->isLoggedin(),
			'canEdit' => $canEdit,
			'editUrl' => $canEdit ? (string) $this->editUrl() : null,
			'adminUrl' => (string) $wire->config->urls->admin,
		];
	}

	/**
	 * Return structured facet filter options for height, floors, year decades, and sorting.
	 *
	 * @return array{
	 *     heights: list<array{value: string, label: string}>,
	 *     floors: list<array{value: string, label: string}>,
	 *     years: list<array{value: string, label: string}>,
	 *     sorts: list<array{value: string, label: string}>
	 * }
	 */
	public static function filterOptions(): array
	{
		$heights = [
			['value' => '0-250', 'label' => 'Under 250 ft'],
			['value' => '250-500', 'label' => '250 – 500 ft'],
			['value' => '500-750', 'label' => '500 – 750 ft'],
			['value' => '750-1000', 'label' => '750 – 1,000 ft'],
			['value' => '1000+', 'label' => '1,000+ ft (Supertall)'],
		];

		$floors = [
			['value' => '1-20', 'label' => '1 – 20 floors'],
			['value' => '20-40', 'label' => '20 – 40 floors'],
			['value' => '40-60', 'label' => '40 – 60 floors'],
			['value' => '60-80', 'label' => '60 – 80 floors'],
			['value' => '80+', 'label' => '80+ floors'],
		];

		$years = [
			['value' => '1800-1929', 'label' => 'Early Era (Pre-1930)'],
		];
		for ($decade = 1930; $decade <= 2020; $decade += 10) {
			$end = $decade + 9;
			$years[] = [
				'value' => "{$decade}-{$end}",
				'label' => "{$decade}s ({$decade}–{$end})",
			];
		}

		$sorts = [];
		foreach (self::VALID_SORTS as $value => $label) {
			$sorts[] = ['value' => $value, 'label' => $label];
		}

		return [
			'heights' => $heights,
			'floors' => $floors,
			'years' => $years,
			'sorts' => $sorts,
		];
	}

	/**
	 * Resolve and whitelist a valid skyscraper sort key from `$input->get('sort')` or fallback to `$defaultSort`.
	 */
	protected function resolveSort(string $defaultSort = 'name'): string
	{
		$wire = $this->wire();
		$input = $wire->input;
		$fallbackSort = isset(self::VALID_SORTS[$defaultSort]) ? $defaultSort : 'name';
		$sort = (string) $wire->sanitizer->name((string) $input->get('sort'));

		if ($sort === '' || !isset(self::VALID_SORTS[$sort])) {
			$sort = $fallbackSort;
		}

		if ($sort !== $fallbackSort) {
			$input->whitelist('sort', $sort);
		}

		return $sort;
	}

	/**
	 * Map a skyscraper's height, floor count, and completion year into canonical filter bracket keys.
	 *
	 * @return array{heightBracket: string|null, floorsBracket: string|null, decadeBracket: string|null}
	 */
	public static function resolveSkyscraperBrackets(float $height, int $floors, int $year): array
	{
		$heightBracket = null;
		if ($height > 0) {
			$heightBracket = match (true) {
				$height >= 1000 => '1000+',
				$height >= 750 => '750-1000',
				$height >= 500 => '500-750',
				$height >= 250 => '250-500',
				default => '0-250',
			};
		}

		$floorsBracket = null;
		if ($floors > 0) {
			$floorsBracket = match (true) {
				$floors >= 80 => '80+',
				$floors >= 60 => '60-80',
				$floors >= 40 => '40-60',
				$floors >= 20 => '20-40',
				default => '1-20',
			};
		}

		$decadeBracket = null;
		if ($year > 0) {
			if ($year < 1930) {
				$decadeBracket = '1800-1929';
			} else {
				$decadeStart = (int) floor($year / 10) * 10;
				$decadeEnd = $decadeStart + 9;
				$decadeBracket = "{$decadeStart}-{$decadeEnd}";
			}
		}

		return [
			'heightBracket' => $heightBracket,
			'floorsBracket' => $floorsBracket,
			'decadeBracket' => $decadeBracket,
		];
	}

	/**
	 * Find Skyscraper pages matching `$selector` with validated sort and pagination limit.
	 */
	protected function findSkyscrapers(string $selector, int $limit = 12, string $defaultSort = 'name'): PageArray
	{
		$pages = $this->wire()->pages;
		$sort = $this->resolveSort($defaultSort);

		$trimmed = trim($selector, ', ');
		$fullSelector = "template=skyscraper, limit={$limit}" . ($trimmed !== '' ? ", {$trimmed}" : '');

		if (!str_contains($fullSelector, '~=')) {
			$fullSelector .= ", sort={$sort}";
		}

		/** @var PageArray $skyscrapers */
		$skyscrapers = $pages->find($fullSelector);

		return $skyscrapers;
	}

	/**
	 * Build a structured pagination and selector payload for a paginated `PageArray` of `SkyscraperPage` items.
	 *
	 * @return array{
	 *     items: list<array<string, mixed>>,
	 *     pagination: array{
	 *         total: int,
	 *         count: int,
	 *         start: int,
	 *         limit: int,
	 *         currentPage: int,
	 *         totalPages: int,
	 *         label: string,
	 *         prevUrl: string|null,
	 *         nextUrl: string|null,
	 *         links: list<array{page: int|null, label: string, url: string|null, current: bool}>
	 *     },
	 *     sort: string,
	 *     selector: string
	 * }
	 */
	protected function buildSkyscraperListingPayload(PageArray $skyscrapers, string $defaultSort = 'name'): array
	{
		$wire = $this->wire();
		$input = $wire->input;
		$config = $wire->config;
		$sort = $this->resolveSort($defaultSort);

		$items = [];
		foreach ($skyscrapers as $skyscraper) {
			if ($skyscraper instanceof SkyscraperPage) {
				$items[] = $skyscraper->toListItem();
			}
		}

		$total = (int) $skyscrapers->getTotal();
		$rawLimit = (int) $skyscrapers->getLimit();
		$limit = $rawLimit > 0 ? $rawLimit : 12;
		$start = (int) $skyscrapers->getStart();
		$currentPageNum = max(1, (int) $input->pageNum);
		$totalPages = max(1, (int) ceil($total / $limit));

		$queryString = $input->whitelist->queryString();
		$querySuffix = $queryString !== '' ? '?' . $queryString : '';
		$rawUrl = (string) $this->url;
		$baseUrl = $rawUrl !== '' ? $rawUrl : '/';
		$rawPrefix = (string) $config->pageNumUrlPrefix;
		$prefix = $rawPrefix !== '' ? $rawPrefix : 'page';

		$makePageUrl = static function (int $pageNum) use ($baseUrl, $prefix, $querySuffix): string {
			$path = $pageNum > 1 ? $baseUrl . $prefix . $pageNum : $baseUrl;

			return $path . $querySuffix;
		};

		$links = [];
		if ($totalPages > 1) {
			$window = 2;
			$lastAdded = 0;

			for ($p = 1; $p <= $totalPages; $p++) {
				if ($p === 1 || $p === $totalPages || abs($p - $currentPageNum) <= $window) {
					if ($lastAdded > 0 && $p - $lastAdded > 1) {
						$links[] = [
							'page' => null,
							'label' => '…',
							'url' => null,
							'current' => false,
						];
					}
					$links[] = [
						'page' => $p,
						'label' => (string) $p,
						'url' => $makePageUrl($p),
						'current' => $p === $currentPageNum,
					];
					$lastAdded = $p;
				}
			}
		}

		$rawSelector = (string) $skyscrapers->getSelectors();

		return [
			'items' => $items,
			'pagination' => [
				'total' => $total,
				'count' => count($items),
				'start' => $total > 0 ? $start + 1 : 0,
				'limit' => $limit,
				'currentPage' => $currentPageNum,
				'totalPages' => $totalPages,
				'label' => $total > 0
					? (string) $skyscrapers->getPaginationString('Skyscrapers')
					: '0 Skyscrapers',
				'prevUrl' => $currentPageNum > 1 ? $makePageUrl($currentPageNum - 1) : null,
				'nextUrl' => $currentPageNum < $totalPages ? $makePageUrl($currentPageNum + 1) : null,
				'links' => $links,
			],
			'sort' => $sort,
			'selector' => $this->formatSelectorForInspector($rawSelector),
		];
	}

	/**
	 * Format a ProcessWire selector string for human-readable display in the Selector Inspector.
	 */
	public function formatSelectorForInspector(string $selector): string
	{
		if ($selector === '') {
			return 'template=skyscraper';
		}

		$pages = $this->wire()->pages;
		if (preg_match_all('/(architects|parent)=(\d+)/', $selector, $matches, PREG_SET_ORDER)) {
			foreach ($matches as $match) {
				$matchedPage = $pages->get((int) $match[2]);
				if ($matchedPage->id > 0 && $matchedPage->viewable()) {
					$selector = str_replace($match[0], "{$match[1]}={$matchedPage->path}", $selector);
				}
			}
		}

		return trim($selector);
	}

	/**
	 * Generate a plain-text summary from HTML copy, truncated to the last complete sentence or word.
	 */
	public function summarizeText(?string $text, int $maxLength = 300): string
	{
		if ($text === null || $text === '') {
			return '';
		}

		$summary = trim((string) preg_replace('/\s+/', ' ', strip_tags($text)));
		if (mb_strlen($summary) <= $maxLength) {
			return $summary;
		}

		$summary = mb_substr($summary, 0, $maxLength);
		$lastPos = 0;

		foreach (['. ', '! ', '? '] as $punct) {
			$pos = mb_strrpos($summary, $punct);
			if ($pos !== false && $pos > $lastPos) {
				$lastPos = $pos;
			}
		}

		if ($lastPos > 0) {
			return trim(mb_substr($summary, 0, $lastPos + 1));
		}

		$spacePos = mb_strrpos($summary, ' ');
		if ($spacePos !== false && $spacePos > 0) {
			return trim(mb_substr($summary, 0, $spacePos)) . '…';
		}

		return trim($summary) . '…';
	}
}
