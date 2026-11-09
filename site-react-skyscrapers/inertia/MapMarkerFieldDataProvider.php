<?php

declare(strict_types=1);

namespace Totoglu\Inertia\Provider;

use ProcessWire\Field;
use ProcessWire\MapMarker;
use ProcessWire\Page;

/**
 * Project Tier 3 FieldDataProvider for `FieldtypeMapMarker` (`ProcessWire\MapMarker`).
 *
 * Serializes geographic coordinates into a structured `InertiaMapMarker` payload
 * rather than falling back to string casting.
 */
final class MapMarkerFieldDataProvider extends FieldDataProvider
{
	/**
	 * @return list<string>
	 */
	public function supports(): array
	{
		return [
			'FieldtypeMapMarker',
			MapMarker::class,
		];
	}

	/**
	 * @return array{address: string, lat: float|null, lng: float|null, zoom: int, status: int}|null
	 */
	public function transform(mixed $value, ?Field $field = null, ?Page $page = null): ?array
	{
		if (!is_object($value)) {
			return null;
		}

		$address = isset($value->address) ? trim((string) $value->address) : '';
		$rawLat = isset($value->lat) ? (float) $value->lat : 0.0;
		$rawLng = isset($value->lng) ? (float) $value->lng : 0.0;
		$zoom = isset($value->zoom) ? (int) $value->zoom : 0;
		$status = isset($value->status) ? (int) $value->status : 0;

		$hasCoordinates = abs($rawLat) > 0.0001 || abs($rawLng) > 0.0001;

		if (!$hasCoordinates && $address === '') {
			return null;
		}

		return [
			'address' => $address,
			'lat' => $hasCoordinates ? round($rawLat, 6) : null,
			'lng' => $hasCoordinates ? round($rawLng, 6) : null,
			'zoom' => $zoom > 0 ? $zoom : 13,
			'status' => $status,
		];
	}

	public function phpType(Field $field): string
	{
		return 'MapMarker|null';
	}

	public function tsType(Field $field): string
	{
		return 'InertiaMapMarker | null';
	}

	/**
	 * @return array<string, string>
	 */
	public function tsDefinitions(?Field $field = null): array
	{
		return [
			'InertiaMapMarker' => <<<'TS'
export interface InertiaMapMarker {
	address: string;
	lat: number | null;
	lng: number | null;
	zoom: number;
	status: number;
}
TS,
		];
	}
}
