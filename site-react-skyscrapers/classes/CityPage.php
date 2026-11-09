<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Custom Page Class for the `city` template.
 *
 * @property string $title
 * @property string $abbreviation
 * @property MapMarker|null $map
 */
class CityPage extends DefaultPage
{
	public function browserTitle(): string
	{
		return "Skyscrapers in {$this->title} — US Skyscrapers Atlas";
	}

	public function metaDescription(): string
	{
		return sprintf(
			'Architectural monograph and structural directory of %d cataloged skyscrapers in %s.',
			(int) $this->numChildren,
			(string) $this->title
		);
	}

	public function cleanAbbreviation(): string
	{
		return trim(strip_tags((string) $this->getUnformatted('abbreviation')));
	}

	/**
	 * Compact summary reference for embedding inside Skyscraper payloads.
	 *
	 * @return array{id: int, name: string, title: string, url: string, abbreviation: string}
	 */
	public function toSummary(): array
	{
		return [
			'id' => (int) $this->id,
			'name' => (string) $this->name,
			'title' => (string) $this->title,
			'url' => (string) $this->url,
			'abbreviation' => $this->cleanAbbreviation(),
		];
	}

	/**
	 * @return array<string, mixed>
	 */
	public function skyscraperListing(int $limit = 12, string $defaultSort = '-height'): array
	{
		$skyscrapers = $this->findSkyscrapers("parent={$this->id}", $limit, $defaultSort);

		return $this->buildSkyscraperListingPayload($skyscrapers, $defaultSort);
	}

	/**
	 * @return array{
	 *     totalSkyscrapers: int,
	 *     maxHeight: float|null,
	 *     tallestTitle: string|null,
	 *     tallestUrl: string|null,
	 *     earliestYear: int|null
	 * }
	 */
	public function cityStats(): array
	{
		$pages = $this->wire()->pages;
		$tallestPage = $pages->findOne("template=skyscraper, parent={$this->id}, height>0, sort=-height");
		$oldestPage = $pages->findOne("template=skyscraper, parent={$this->id}, year>0, sort=year");

		return [
			'totalSkyscrapers' => (int) $this->numChildren,
			'maxHeight' => $tallestPage->id > 0 ? (float) $tallestPage->get('height') : null,
			'tallestTitle' => $tallestPage->id > 0 ? (string) $tallestPage->title : null,
			'tallestUrl' => $tallestPage->id > 0 ? (string) $tallestPage->url : null,
			'earliestYear' => $oldestPage->id > 0 ? (int) $oldestPage->get('year') : null,
		];
	}

	/**
	 * @return array<string, mixed>
	 */
	public function inertiaWithData(): array
	{
		return [
			...parent::inertiaWithData(),
			'listing' => $this->skyscraperListing(),
			'cityStats' => $this->cityStats(),
		];
	}
}
