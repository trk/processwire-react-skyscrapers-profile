<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Custom Page Class for the `architects` template.
 *
 * @property string $title
 */
class ArchitectsPage extends DefaultPage
{
	public function browserTitle(): string
	{
		return 'Skyscraper Architects — US Skyscrapers Atlas';
	}

	/**
	 * @return list<array{
	 *     id: int,
	 *     name: string,
	 *     title: string,
	 *     url: string,
	 *     initial: string,
	 *     skyscraperCount: int
	 * }>
	 */
	public function architectDirectory(): array
	{
		return $this->wire()->cache->get('skyscrapers_architect_directory_v1', 3600, function (): array {
			$items = [];

			foreach ($this->children('sort=title') as $architect) {
				if (!$architect instanceof ArchitectPage) {
					continue;
				}
				$title = (string) $architect->title;
				$firstChar = strtoupper(mb_substr(trim($title), 0, 1));
				if (!ctype_alpha($firstChar)) {
					$firstChar = '#';
				}

				$items[] = [
					'id' => (int) $architect->id,
					'name' => (string) $architect->name,
					'title' => $title,
					'url' => (string) $architect->url,
					'initial' => $firstChar,
					'skyscraperCount' => $architect->skyscraperCount(),
				];
			}

			return $items;
		});
	}

	/**
	 * @return array<string, mixed>
	 */
	public function inertiaWithData(): array
	{
		return [
			...parent::inertiaWithData(),
			'architects' => $this->inertia()
				->once(fn(): array => $this->architectDirectory())
				->as('architects_directory')
				->until(3600),
			'selector' => 'template=architect, parent=/architects/, sort=title',
		];
	}
}
