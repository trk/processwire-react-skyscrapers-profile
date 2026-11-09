<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Custom Page Class for the `basic-page` template.
 *
 * @property string $title
 * @property string $body
 * @property Pageimages $images
 */
class BasicPagePage extends DefaultPage
{
	/**
	 * @return array<string, mixed>
	 */
	public function inertiaWithData(): array
	{
		return [
			...parent::inertiaWithData(),
			'selector' => "template=basic-page, id={$this->id}",
		];
	}
}
