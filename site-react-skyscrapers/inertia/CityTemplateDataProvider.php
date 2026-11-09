<?php

declare(strict_types=1);

namespace Totoglu\Inertia\Provider;

use ProcessWire\CityPage;
use ProcessWire\Page;
use ProcessWire\Template;

/**
 * Project Tier 3 TemplateDataProvider for `city` pages.
 */
final class CityTemplateDataProvider extends TemplateDataProvider
{
	/**
	 * @return list<string>
	 */
	public function templates(): array
	{
		return ['city'];
	}

	/**
	 * @return array<string, mixed>
	 */
	protected function extraData(Page $page): array
	{
		return [
			'abbreviation' => $page instanceof CityPage
				? $page->cleanAbbreviation()
				: trim(strip_tags((string) $page->getUnformatted('abbreviation'))),
			'skyscraperCount' => (int) $page->numChildren,
		];
	}

	/**
	 * @return array<string, string>
	 */
	public function extraTsTypes(Template $template): array
	{
		return [
			'skyscraperCount' => 'number',
		];
	}
}
