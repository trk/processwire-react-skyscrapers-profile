import * as React from "react";
import { cn, formatFeet, formatMeters } from "@/lib/utils";

interface ElevationScaleBarProps {
	height: number | null | undefined;
	benchmark?: number;
	accentColor?: string | null;
	showMeters?: boolean;
	className?: string;
}

export function ElevationScaleBar({
	height,
	benchmark = 1451,
	accentColor,
	showMeters = false,
	className,
}: ElevationScaleBarProps) {
	const numericHeight = typeof height === "number" && height > 0 ? height : 0;
	const ratio =
		numericHeight > 0
			? Math.min(100, Math.max(4, Math.round((numericHeight / benchmark) * 100)))
			: 0;

	return (
		<div className={cn("flex items-center gap-2.5", className)}>
			<div
				className="relative h-1.5 flex-1 overflow-hidden bg-secondary"
				title={
					numericHeight > 0
						? `${formatFeet(numericHeight)} (${ratio}% of ${formatFeet(benchmark)} benchmark)`
						: "Height unrecorded"
				}
			>
				{ratio > 0 && (
					<div
						className="h-full transition-all duration-300"
						style={{
							width: `${ratio}%`,
							backgroundColor: accentColor || "var(--primary)",
						}}
					/>
				)}
			</div>
			<span className="font-mono text-xs font-medium tabular-nums text-foreground">
				{formatFeet(height)}
				{showMeters && numericHeight > 0 && (
					<span className="ml-1 text-muted-foreground">
						({formatMeters(height)})
					</span>
				)}
			</span>
		</div>
	);
}
