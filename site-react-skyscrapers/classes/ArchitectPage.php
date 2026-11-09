<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Custom Page Class for the `architect` template.
 *
 * @property string $title
 */
class ArchitectPage extends DefaultPage
{
	public function browserTitle(): string
	{
		return "{$this->title} Skyscrapers — US Skyscrapers Atlas";
	}

	public function skyscraperCount(): int
	{
		return (int) $this->wire()->pages->count("template=skyscraper, architects={$this->id}");
	}

	public function metaDescription(): string
	{
		return sprintf(
			'Portfolio of %d high-rise skyscrapers credited to %s in the United States Skyscrapers Atlas.',
			$this->skyscraperCount(),
			(string) $this->title
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	public function skyscraperListing(int $limit = 12, string $defaultSort = '-height'): array
	{
		$skyscrapers = $this->findSkyscrapers("architects={$this->id}", $limit, $defaultSort);

		return $this->buildSkyscraperListingPayload($skyscrapers, $defaultSort);
	}

	/**
	 * @return array<string, mixed>
	 */
	public function inertiaWithData(): array
	{
		return [
			...parent::inertiaWithData(),
			'listing' => $this->skyscraperListing(),
		];
	}
}
