import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, import.meta.dirname, "");
	const appUrl =
		env.APP_URL && /^https?:\/\//i.test(env.APP_URL) && URL.canParse(env.APP_URL)
			? new URL(env.APP_URL)
			: null;
	const host = appUrl && appUrl.hostname !== "domain.ltd" ? appUrl.hostname : null;
	const isHttps = appUrl?.protocol === "https:";

	return {
		root: import.meta.dirname,
		base: command === "build" ? "/site/templates/build/" : "/",
		...(host && !isHttps
			? {
					server: {
						host,
						hmr: { host },
					},
				}
			: {}),
		plugins: [
			react(),
			tailwindcss(),
			laravel({
				input: ["assets/css/app.css", "assets/js/inertia.tsx"],
				refresh: ["./**/*.php", "../classes/**/*.php", "../inertia/**/*.php"],
				publicDirectory: "./",
				detectTls: isHttps && host ? host : false,
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(import.meta.dirname, "./assets/js"),
			},
		},
		build: {
			rolldownOptions: {
				output: {
					codeSplitting: {
						groups: [
							{
								name: "vendor-react",
								test: /node_modules[\\/](react|react-dom|scheduler|@inertiajs|es-toolkit|laravel-precognition|axios)/,
								priority: 30,
							},
							{
								name: "vendor-map",
								test: /node_modules[\\/]leaflet/,
								priority: 25,
							},
							{
								name: "vendor-ui",
								test: /node_modules[\\/](radix-ui|@radix-ui|cmdk|lucide-react|class-variance-authority|clsx|tailwind-merge)/,
								priority: 20,
							},
						],
					},
				},
			},
		},
	};
});
