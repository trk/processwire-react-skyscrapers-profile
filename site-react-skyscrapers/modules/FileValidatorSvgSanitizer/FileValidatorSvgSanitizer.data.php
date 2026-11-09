<?php declare(strict_types=1);

namespace ProcessWire;

use enshrined\svgSanitize\data\AllowedAttributes;
use enshrined\svgSanitize\data\AllowedTags;
use enshrined\svgSanitize\data\AttributeInterface;
use enshrined\svgSanitize\data\TagInterface;

class FileValidatorSvgSanitizerData {

	/**
	 * @var array<int, string>
	 */
	protected static array $data = [];

	/**
	 * @param array<int, string>|string $data
	 */
	public static function add(array|string $data): void { 
		if (!is_array($data)) {
			$data = trim($data); 
			$data = str_replace(' ', "\n", $data); 
			$data = explode("\n", $data);
		}
		foreach ($data as $line) {
			$line = trim((string) $line); 
			if ($line !== '') {
				self::$data[] = $line;
			}
		}
	}

	/**
	 * @param array<int, string> $data
	 * @return array<int, string>
	 */
	public static function process(array $data): array {
		foreach (self::$data as $line) {
			if (str_starts_with($line, '-')) { // remove
				$key = array_search(trim($line, '- '), $data, true);
				if ($key !== false) {
					unset($data[$key]);
				}
			} else { // add
				$data[] = ltrim($line, '+ ');
			}
		}
		return $data;
	}
}

class FileValidatorSvgSanitizerAttributes extends FileValidatorSvgSanitizerData implements AttributeInterface {

	/**
	 * @return array<int, string>
	 */
	public static function getAttributes(): array {
		$data = AllowedAttributes::getAttributes();
		return self::process($data); 
	}
}

class FileValidatorSvgSanitizerTags extends FileValidatorSvgSanitizerData implements TagInterface {

	/**
	 * @return array<int, string>
	 */
	public static function getTags(): array {
		$data = AllowedTags::getTags();
		return self::process($data); 
	}
}


