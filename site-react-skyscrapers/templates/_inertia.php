<?php

declare(strict_types=1);

namespace ProcessWire;

if (!defined('PROCESSWIRE')) {
	die();
}

/**
 * Inertia.js v3 Root View Template (`_inertia.php`)
 *
 * @var Inertia $inertia
 * @var Sanitizer $sanitizer
 * @var array<string, mixed> $pageObject
 * @var string $locale
 * @var string $head
 */
?>
<!DOCTYPE html>
<html lang="<?= $sanitizer->entities((string) ($locale ?? 'en')) ?>" class="h-full">

<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<script>
		(function() {
			try {
				var saved = localStorage.getItem('skyscrapers-theme');
				if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
			} catch (e) {}
		})();
	</script>
	<?= $head ?? '' ?>
	<?php
	if (function_exists(__NAMESPACE__ . '\vite')) {
		echo vite()->withReactRefresh()->withEntries([
			'@assets/css/app.css',
			'@assets/js/inertia.tsx',
		]);
	}
	?>
</head>

<body class="min-h-full bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
	<?= $inertia->app($pageObject) ?>
</body>

</html>
