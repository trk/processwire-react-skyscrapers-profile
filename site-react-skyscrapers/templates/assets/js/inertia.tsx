import * as React from "react";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

const pages = import.meta.glob<{ default: React.ComponentType }>(
	"./Pages/**/*.tsx"
);

createInertiaApp({
	resolve: async (name: string) => {
		const loader = pages[`./Pages/${name}.tsx`];
		if (!loader) {
			throw new Error(`Inertia page component not found: ./Pages/${name}.tsx`);
		}
		const mod = await loader();
		return mod.default;
	},
	setup({ el, App, props }) {
		if (!el) {
			return;
		}
		createRoot(el).render(<App {...props} />);
	},
});
