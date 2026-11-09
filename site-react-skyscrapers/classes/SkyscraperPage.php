<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Custom Page Class for the `skyscraper` template.
 *
 * @property string $title
 * @property float $height
 * @property int $floors
 * @property int $year
 * @property PageArray|ArchitectPage[] $architects
 * @property string $body
 * @property MapMarker|null $map
 * @property Pageimages $images
 * @property string $freebase_guid
 * @property int $wikipedia_id
 */
class SkyscraperPage extends DefaultPage
{
	public function browserTitle(): string
	{
		$cityTitle = (string) $this->parent?->title;

		return $cityTitle !== ''
			? "{$this->title}, {$cityTitle} Skyscraper — US Skyscrapers Atlas"
			: "{$this->title} — US Skyscrapers Atlas";
	}

	public function metaDescription(): string
	{
		$cityTitle = (string) $this->parent?->title;
		$height = (float) $this->get('height');
		$floors = (int) $this->get('floors');
		$year = (int) $this->get('year');

		return sprintf(
			'%s in %s — %s ft, %s floors, completed %s.',
			(string) $this->title,
			$cityTitle !== '' ? $cityTitle : 'United States',
			$height > 0 ? number_format($height) : 'N/A',
			$floors > 0 ? (string) $floors : 'N/A',
			$year > 0 ? (string) $year : 'N/A'
		);
	}

	/**
	 * Return the parent `CityPage` summary array, or `null` if unavailable.
	 *
	 * @return array{id: int, name: string, title: string, url: string, abbreviation: string}|null
	 */
	public function citySummary(): ?array
	{
		$parent = $this->parent;

		return $parent instanceof CityPage ? $parent->toSummary() : null;
	}

	/**
	 * Return a plain-text excerpt of the skyscraper's historical body copy.
	 */
	public function summary(int $maxLength = 240): string
	{
		return $this->summarizeText((string) $this->get('body'), $maxLength);
	}

	/**
	 * Return the external Wikipedia citation URL when `wikipedia_id` is present.
	 */
	public function wikipediaUrl(): ?string
	{
		$wikiId = (int) $this->get('wikipedia_id');

		return $wikiId > 0 ? "https://en.wikipedia.org/wiki/index.html?curid={$wikiId}" : null;
	}

	/**
	 * Format this Skyscraper page into a compact Monograph Card / Table Row payload.
	 *
	 * @return array<string, mixed>
	 */
	public function toListItem(): array
	{
		/** @var Pageimages|null $images */
		$images = $this->get('images');
		$firstImage = $images instanceof Pageimages && $images->count() > 0 ? $images->first() : null;
		$imageCount = $images instanceof Pageimages ? $images->count() : 0;

		$architectItems = [];
		$architects = $this->get('architects');
		if ($architects instanceof PageArray) {
			foreach ($architects as $architect) {
				$architectItems[] = [
					'id' => (int) $architect->id,
					'name' => (string) $architect->name,
					'title' => (string) $architect->title,
					'url' => (string) $architect->url,
				];
			}
		}

		$providers = $this->inertia()->providers();
		$mapField = $this->getField('map');
		$mapData = $mapField instanceof Field ? $providers->transformField($mapField, $this) : null;

		$height = (float) $this->get('height');
		$floors = (int) $this->get('floors');
		$year = (int) $this->get('year');

		return [
			'id' => (int) $this->id,
			'name' => (string) $this->name,
			'title' => (string) $this->title,
			'url' => (string) $this->url,
			'height' => $height > 0 ? round($height, 1) : null,
			'floors' => $floors > 0 ? $floors : null,
			'year' => $year > 0 ? $year : null,
			'summary' => $this->summary(220),
			'city' => $this->citySummary(),
			'architects' => $architectItems,
			'map' => $mapData,
			'primaryImage' => $firstImage instanceof Pageimage
				? $providers->provideImage($firstImage)
				: null,
			'imageCount' => $imageCount,
		];
	}

	public function relatedSelector(int $limit = 6): string
	{
		$escapedTitle = $this->wire()->sanitizer->selectorValue((string) $this->title);

		return "template=skyscraper, id!={$this->id}, limit={$limit}, body*={$escapedTitle}";
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	public function relatedSkyscrapers(int $limit = 6): array
	{
		$pages = $this->wire()->pages;
		$relatedPages = $pages->find($this->relatedSelector($limit));
		$items = [];

		foreach ($relatedPages as $rel) {
			if ($rel instanceof self) {
				$items[] = $rel->toListItem();
			}
		}

		return $items;
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	public function cityPeers(int $limit = 6): array
	{
		$parent = $this->parent;
		if (!$parent instanceof Page || $parent->id <= 0) {
			return [];
		}

		$peers = $this->wire()->pages->find(
			"template=skyscraper, parent={$parent->id}, id!={$this->id}, sort=-height, limit={$limit}"
		);

		$items = [];
		foreach ($peers as $peer) {
			if ($peer instanceof self) {
				$items[] = $peer->toListItem();
			}
		}

		return $items;
	}

	/**
	 * @return array{heightBracket: string|null, floorsBracket: string|null, decadeBracket: string|null}
	 */
	public function pivots(): array
	{
		return self::resolveSkyscraperBrackets(
			(float) $this->get('height'),
			(int) $this->get('floors'),
			(int) $this->get('year')
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public function inertiaWithData(): array
	{
		return [
			...parent::inertiaWithData(),
			'relatedSkyscrapers' => $this->relatedSkyscrapers(),
			'cityPeers' => $this->cityPeers(),
			'pivots' => $this->pivots(),
			'selector' => "template=skyscraper, id={$this->id}",
			'relatedSelector' => $this->relatedSelector(),
		];
	}
}
