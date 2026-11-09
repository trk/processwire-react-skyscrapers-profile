<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Custom Page Class for the `home` template.
 *
 * @property string $title
 * @property string $body
 * @property Pageimages $images
 * @property PageArray|SkyscraperPage[] $skyscrapers
 */
class HomePage extends DefaultPage
{
	public function browserTitle(): string
	{
		return 'United States Skyscrapers — Architectural Monograph & Structural Index';
	}

	/**
	 * @return array<string, mixed>|null
	 */
	public function heroPhoto(): ?array
	{
		$sanitizer = $this->wire()->sanitizer;
		/** @var Pageimages|null $images */
		$images = $this->get('images');
		$photo = $images instanceof Pageimages && $images->count() > 0 ? $images->first() : null;

		if (!$photo instanceof Pageimage) {
			return null;
		}

		$imageData = $this->inertia()->providers()->provideImage($photo);
		if (!is_array($imageData)) {
			return null;
		}

		return [
			...$imageData,
			'captionHtml' => (string) $sanitizer->entitiesMarkdown((string) $photo->description),
		];
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	public function featuredSkyscrapers(int $limit = 6): array
	{
		$pages = $this->wire()->pages;
		/** @var PageArray|null $featuredPool */
		$featuredPool = $this->get('skyscrapers');
		$items = [];

		if ($featuredPool instanceof PageArray && $featuredPool->count() > 0) {
			foreach ($featuredPool->find("limit={$limit}, sort=-height") as $item) {
				if ($item instanceof SkyscraperPage) {
					$items[] = $item->toListItem();
				}
			}
		}

		if ($items === []) {
			foreach ($pages->find("template=skyscraper, images.count>0, height<2000, sort=-height, limit={$limit}") as $item) {
				if ($item instanceof SkyscraperPage) {
					$items[] = $item->toListItem();
				}
			}
		}

		return $items;
	}

	public function benchmarkHeight(): float
	{
		$tallest = $this->wire()->pages->findOne('template=skyscraper, height<2000, sort=-height');

		return $tallest->id > 0 ? (float) $tallest->get('height') : 1451.0;
	}

	/**
	 * @return array<string, mixed>
	 */
	public function inertiaWithData(): array
	{
		return [
			...parent::inertiaWithData(),
			'heroPhoto' => $this->heroPhoto(),
			'featuredSkyscrapers' => $this->featuredSkyscrapers(),
			'featuredSelector' => 'page.skyscrapers, limit=6, sort=-height',
			'benchmarkHeight' => $this->benchmarkHeight(),
		];
	}
}
