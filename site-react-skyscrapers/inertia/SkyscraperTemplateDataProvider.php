<?php

declare(strict_types=1);

namespace Totoglu\Inertia\Provider;

use ProcessWire\Page;
use ProcessWire\SkyscraperPage;
use ProcessWire\Template;

/**
 * Project Tier 3 TemplateDataProvider for `skyscraper` pages.
 */
final class SkyscraperTemplateDataProvider extends TemplateDataProvider
{
	/**
	 * @return list<string>
	 */
	public function templates(): array
	{
		return ['skyscraper'];
	}

	/**
	 * @return array<string, mixed>
	 */
	protected function extraData(Page $page): array
	{
		if (!$page instanceof SkyscraperPage) {
			return [
				'city' => null,
				'summary' => '',
				'wikipediaUrl' => null,
			];
		}

		return [
			'city' => $page->citySummary(),
			'summary' => $page->summary(260),
			'wikipediaUrl' => $page->wikipediaUrl(),
		];
	}

	/**
	 * @return array<string, string>
	 */
	public function extraTsTypes(Template $template): array
	{
		return [
			'city' => '{ id: number; name: string; title: string; url: string; abbreviation: string } | null',
			'summary' => 'string',
			'wikipediaUrl' => 'string | null',
		];
	}
}
