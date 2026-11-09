import * as React from "react";
import { Building2 } from "lucide-react";
import type { InertiaImage } from "@/types/inertia";
import { cn, extractSwatches } from "@/lib/utils";

interface ArchivalImageProps {
	image: InertiaImage | null | undefined;
	alt: string;
	variant?: "thumb" | "medium" | "full";
	className?: string;
	imgClassName?: string;
	showSwatches?: boolean;
	priority?: boolean;
}

export function ArchivalImage({
	image,
	alt,
	variant = "thumb",
	className,
	imgClassName,
	showSwatches = false,
	priority = false,
}: ArchivalImageProps) {
	const [loaded, setLoaded] = React.useState(false);

	if (!image) {
		return (
			<div
				className={cn(
					"relative flex flex-col items-center justify-center overflow-hidden bg-secondary/70 text-muted-foreground",
					className
				)}
			>
				<Building2 className="size-8 stroke-[1.25] opacity-45" />
				<span className="mt-2 font-mono text-[11px] uppercase tracking-wider opacity-65">
					No Archival Plate
				</span>
			</div>
		);
	}

	const resolvedSizes =
		variant === "thumb"
			? "(max-width: 640px) 50vw, 320px"
			: variant === "medium"
				? "(max-width: 1024px) 100vw, 720px"
				: image.sizes || "100vw";

	const objectPosition = image.focus
		? `${image.focus.left}% ${image.focus.top}%`
		: "50% 50%";

	const swatches = showSwatches ? extractSwatches(image) : [];

	const imgElement = (
		<img
			src={image.url}
			srcSet={image.srcset || undefined}
			sizes={image.srcset ? resolvedSizes : undefined}
			alt={alt || image.description || image.name}
			width={image.width || undefined}
			height={image.height || undefined}
			loading={priority ? "eager" : "lazy"}
			decoding={priority ? "sync" : "async"}
			fetchPriority={priority ? "high" : undefined}
			onLoad={() => setLoaded(true)}
			style={{ objectPosition }}
			className={cn(
				"h-full w-full object-cover transition-opacity duration-300",
				loaded ? "opacity-100" : "opacity-95",
				imgClassName
			)}
		/>
	);

	return (
		<div
			className={cn("relative overflow-hidden bg-secondary", className)}
			style={{
				backgroundColor: image.dominantColor || undefined,
				backgroundImage: image.lqip ? `url("${image.lqip}")` : undefined,
				backgroundSize: "cover",
				backgroundPosition: objectPosition,
			}}
		>
			{Array.isArray(image.sources) && image.sources.length > 0 ? (
				<picture className="block h-full w-full">
					{image.sources.map((source) => (
						<source
							key={source.type}
							type={source.type}
							srcSet={source.srcset}
							sizes={resolvedSizes}
						/>
					))}
					{imgElement}
				</picture>
			) : (
				imgElement
			)}
			{showSwatches && swatches.length > 0 && (
				<div
					className="absolute inset-x-0 bottom-0 flex h-1.5 w-full"
					title={`Extracted palette: ${swatches.join(", ")}`}
				>
					{swatches.map((hex, index) => (
						<span
							key={`${hex}-${index}`}
							className="h-full flex-1"
							style={{ backgroundColor: hex }}
						/>
					))}
				</div>
			)}
		</div>
	);
}
