<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Custom Page Class for the `cities` template.
 *
 * @property string $title
 */
class CitiesPage extends DefaultPage
{
	public function browserTitle(): string
	{
		return 'Skyscrapers by City — US Skyscrapers Atlas';
	}

	/**
	 * @return array<string, mixed>
	 */
	public function inertiaWithData(): array
	{
		return [
			...parent::inertiaWithData(),
			'selector' => 'template=city, parent=/cities/, sort=title',
		];
	}
}
