<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Custom Page Class for the `search` template.
 *
 * @property string $title
 */
class SearchPage extends DefaultPage
{
	/** @var array<string, mixed>|null */
	private ?array $resolvedSearchState = null;

	/**
	 * Resolve facet query parameters, active filters, human-readable summary, and paginated listing.
	 *
	 * @return array{
	 *     filters: array<string, string>,
	 *     summary: array<string, string>,
	 *     listing: array<string, mixed>,
	 *     browserTitle: string
	 * }
	 */
	public function resolveSearchState(): array
	{
		if ($this->resolvedSearchState !== null) {
			return $this->resolvedSearchState;
		}

		$wire = $this->wire();
		$pages = $wire->pages;
		$input = $wire->input;
		$sanitizer = $wire->sanitizer;
		$selector = '';

		$filters = [
			'city' => '',
			'architect' => '',
			'height' => '',
			'floors' => '',
			'year' => '',
			'keywords' => '',
		];

		$summary = [];

		$rawCity = trim((string) $input->get('city'));
		if ($rawCity !== '') {
			$cityName = $sanitizer->pageName($rawCity);
			$city = $pages->get("/cities/{$cityName}/");
			if ($city instanceof CityPage && $city->id > 0 && $city->viewable()) {
				$selector .= "parent={$city->id}, ";
				$filters['city'] = (string) $city->name;
				$summary['city'] = (string) $city->title;
				$input->whitelist('city', $city->name);
			}
		}

		$rawArchitect = trim((string) $input->get('architect'));
		if ($rawArchitect !== '') {
			$archName = $sanitizer->pageName($rawArchitect);
			$architect = $pages->get("/architects/{$archName}/");
			if ($architect instanceof ArchitectPage && $architect->id > 0 && $architect->viewable()) {
				$selector .= "architects={$architect->id}, ";
				$filters['architect'] = (string) $architect->name;
				$summary['architect'] = (string) $architect->title;
				$input->whitelist('architect', $architect->name);
			}
		}

		foreach (['height', 'floors', 'year'] as $key) {
			$rawValue = trim((string) $input->get($key));
			if ($rawValue === '') {
				continue;
			}

			$unit = $key === 'height' ? ' ft' : ($key === 'floors' ? ' floors' : '');

			if (str_contains($rawValue, '-')) {
				[$minStr, $maxStr] = explode('-', $rawValue, 2);
				$min = (int) $minStr;
				$max = (int) $maxStr;
				$selector .= "{$key}>={$min}, {$key}<={$max}, ";
				$filters[$key] = "{$min}-{$max}";
				$summary[$key] = "{$min}–{$max}{$unit}";
				$input->whitelist($key, "{$min}-{$max}");
			} elseif (str_ends_with($rawValue, '+')) {
				$value = (int) $rawValue;
				$selector .= "{$key}>={$value}, ";
				$filters[$key] = "{$value}+";
				$summary[$key] = "{$value}{$unit} and above";
				$input->whitelist($key, "{$value}+");
			} else {
				$value = (int) $rawValue;
				$selector .= "{$key}={$value}, ";
				$filters[$key] = (string) $value;
				$summary[$key] = "{$value}{$unit}";
				$input->whitelist($key, $value);
			}
		}

		$rawKeywords = trim((string) $input->get('keywords'));
		if ($rawKeywords !== '') {
			$value = $sanitizer->selectorValue($rawKeywords);
			$selector .= "title|body%={$value}, ";
			$filters['keywords'] = $rawKeywords;
			$summary['keywords'] = $rawKeywords;
			$input->whitelist('keywords', $rawKeywords);
		}

		$defaultSort = $filters['height'] !== '' ? '-height' : 'name';
		$skyscrapers = $this->findSkyscrapers($selector, 12, $defaultSort);
		$listing = $this->buildSkyscraperListingPayload($skyscrapers, $defaultSort);

		$browserTitleParts = [];
		foreach ($summary as $key => $val) {
			if ($val !== '') {
				$browserTitleParts[] = ucfirst($key) . ': ' . $val;
			}
		}
		$browserTitle = $browserTitleParts !== []
			? 'Search (' . implode(', ', $browserTitleParts) . ') — US Skyscrapers Atlas'
			: 'Search & Filter Skyscrapers — US Skyscrapers Atlas';

		$this->resolvedSearchState = [
			'filters' => $filters,
			'summary' => $summary,
			'listing' => $listing,
			'browserTitle' => $browserTitle,
		];

		return $this->resolvedSearchState;
	}

	public function browserTitle(): string
	{
		return $this->resolveSearchState()['browserTitle'];
	}

	/**
	 * @return array<string, mixed>
	 */
	public function inertiaWithData(): array
	{
		$state = $this->resolveSearchState();

		return [
			...parent::inertiaWithData(),
			'filters' => $state['filters'],
			'summary' => $state['summary'],
			'listing' => $state['listing'],
		];
	}
}
