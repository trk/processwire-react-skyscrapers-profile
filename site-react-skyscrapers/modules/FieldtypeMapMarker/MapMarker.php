<?php

declare(strict_types=1);

namespace ProcessWire;

/**
 * Class to hold an address and geocode it to latitude/longitude
 * 
 * @property string $lat
 * @property string $lng
 * @property string $address
 * @property int $status
 * @property int $zoom
 * @property bool $skipGeocode
 * @property string $statusString
 *
 */
class MapMarker extends WireData
{
	public const int statusNoGeocode = -100;

	/**
	 * @var array<int, string>
	 */
	protected array $geocodeStatuses = [
		0 => 'N/A',
		1 => 'OK',
		2 => 'OK_ROOFTOP',
		3 => 'OK_RANGE_INTERPOLATED',
		4 => 'OK_GEOMETRIC_CENTER',
		5 => 'OK_APPROXIMATE',

		-1 => 'UNKNOWN',
		-2 => 'ZERO_RESULTS',
		-3 => 'OVER_QUERY_LIMIT',
		-4 => 'REQUEST_DENIED',
		-5 => 'INVALID_REQUEST',

		-100 => 'Geocode OFF', // RCD
	];

	protected string $geocodedAddress = '';

	public function __construct()
	{
		parent::__construct();
		$this->set('lat', '');
		$this->set('lng', '');
		$this->set('address', '');
		$this->set('status', 0);
		$this->set('zoom', 0);
		// temporary runtime property to indicate the geocode should be skipped
		$this->set('skipGeocode', false);
		$this->set('statusString', '');
	}

	public function set($key, $value): self
	{
		if ($key === 'lat' || $key === 'lng') {
			$strVal = (string) $value;
			// if value isn't numeric, then it's not valid: make it blank
			if (str_contains($strVal, ',')) {
				$strVal = str_replace(',', '.', $strVal); // convert 123,456 to 123.456
			}
			$value = is_numeric($strVal) ? $strVal : '';
		} elseif ($key === 'address') {
			$value = $this->wire()->sanitizer->text((string) $value);
		} elseif ($key === 'status') {
			$value = (int) $value;
			if (!isset($this->geocodeStatuses[$value])) {
				$value = -1; // -1 = unknown
			}
		} elseif ($key === 'zoom') {
			$value = (int) $value;
		}

		return parent::set($key, $value);
	}

	public function get($key): mixed
	{
		if ($key === 'statusString') {
			$status = (int) parent::get('status');
			return str_replace('_', ' ', $this->geocodeStatuses[$status] ?? 'UNKNOWN');
		}

		return parent::get($key);
	}

	public function geocode(): int
	{
		if ($this->skipGeocode) {
			return self::statusNoGeocode;
		}

		// check if address was already geocoded
		if ($this->geocodedAddress === $this->address) {
			return (int) $this->status;
		}
		$this->geocodedAddress = (string) $this->address;

		$url = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($this->geocodedAddress);

		/** @var FieldtypeMapMarker|null $fieldtype */
		$fieldtype = $this->wire()->modules->get('FieldtypeMapMarker');
		$apiKey = $fieldtype ? (string) $fieldtype->get('googleApiKey') : '';
		if ($apiKey !== '') {
			$url .= "&key=$apiKey";
		}

		/** @var WireHttp $http */
		$http = $this->wire(new WireHttp());
		$json = $http->getJSON($url, true);
		if (!is_array($json)) {
			$json = [];
		}
		if (empty($json['status']) || !is_string($json['status'])) {
			$json['status'] = 'No response';
		}

		if ($json['status'] !== 'OK') {
			$this->error("Error geocoding address: {$json['status']} ($url)");
			$foundStatus = array_search($json['status'], $this->geocodeStatuses, true);
			$this->status = $foundStatus !== false ? (int) $foundStatus : -1;
			$this->lat = '';
			$this->lng = '';
			return (int) $this->status;
		}

		$geometry = $json['results'][0]['geometry'] ?? [];
		$location = $geometry['location'] ?? [];
		$locationType = (string) ($geometry['location_type'] ?? '');

		$this->lat = (string) ($location['lat'] ?? '');
		$this->lng = (string) ($location['lng'] ?? '');

		$statusString = $json['status'] . '_' . $locationType;
		$status = array_search($statusString, $this->geocodeStatuses, true);
		if ($status === false) {
			$status = 1; // OK
		}

		$this->status = (int) $status;
		$this->message("Geocode {$this->statusString}: '{$this->address}'");

		return (int) $this->status;
	}

	/**
	 * If accessed as a string, then just output the lat, lng coordinates
	 *
	 */
	public function __toString(): string
	{
		return "{$this->address} ({$this->lat}, {$this->lng}, {$this->zoom}) [{$this->statusString}]";
	}
}