<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Custom Page Class for the `list-all` template.
 *
 * @property string $title
 */
class ListAllPage extends DefaultPage
{
	public function browserTitle(): string
	{
		return 'All United States Skyscrapers — US Skyscrapers Atlas';
	}

	/**
	 * @return array<string, mixed>
	 */
	public function skyscraperListing(int $limit = 12, string $defaultSort = 'name'): array
	{
		$skyscrapers = $this->findSkyscrapers('', $limit, $defaultSort);

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
