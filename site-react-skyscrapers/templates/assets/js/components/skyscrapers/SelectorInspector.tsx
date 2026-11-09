import * as React from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectorInspectorProps {
	selector: string;
	total?: number;
	label?: string;
	className?: string;
}

export function SelectorInspector({
	selector,
	total,
	label = "ProcessWire Selector",
	className,
}: SelectorInspectorProps) {
	const [copied, setCopied] = React.useState(false);
	const timerRef = React.useRef<number | null>(null);

	React.useEffect(() => {
		return () => {
			if (timerRef.current !== null) {
				window.clearTimeout(timerRef.current);
			}
		};
	}, []);

	const clauses = React.useMemo(
		() =>
			selector
				.split(",")
				.map((part) => part.trim())
				.filter(Boolean),
		[selector]
	);

	const markCopied = () => {
		setCopied(true);
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current);
		}
		timerRef.current = window.setTimeout(() => {
			setCopied(false);
			timerRef.current = null;
		}, 2000);
	};

	const fallbackCopyText = (text: string) => {
		if (typeof document === "undefined") {
			return;
		}
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.top = "-9999px";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		try {
			document.execCommand("copy");
		} finally {
			document.body.removeChild(textarea);
		}
	};

	const handleCopy = () => {
		if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
			navigator.clipboard.writeText(selector).then(
				() => markCopied(),
				() => {
					fallbackCopyText(selector);
					markCopied();
				}
			);
		} else {
			fallbackCopyText(selector);
			markCopied();
		}
	};

	return (
		<div
			className={cn(
				"flex min-w-0 flex-wrap items-center justify-between gap-3 border border-border bg-card/80 px-3.5 py-2 text-xs",
				className
			)}
		>
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				<span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
					<Terminal className="size-3.5 text-primary" />
					{label}:
				</span>
				<code className="flex min-w-0 flex-wrap items-center gap-1.5 font-mono text-xs text-foreground">
					<span className="text-muted-foreground">$pages-&gt;find(&quot;</span>
					{clauses.map((clause, idx) => (
						<React.Fragment key={`${clause}-${idx}`}>
							<span className="break-all rounded-xs bg-background px-1.5 py-0.5 text-foreground border border-border/80">
								{clause}
							</span>
							{idx < clauses.length - 1 && (
								<span className="text-muted-foreground">,</span>
							)}
						</React.Fragment>
					))}
					<span className="text-muted-foreground">&quot;)</span>
				</code>
			</div>

			<div className="flex items-center gap-3">
				{typeof total === "number" && (
					<span className="font-mono text-xs tabular-nums text-muted-foreground">
						<strong className="font-semibold text-foreground">
							{total.toLocaleString("en-US")}
						</strong>{" "}
						{total === 1 ? "match" : "matches"}
					</span>
				)}
				<button
					type="button"
					onClick={handleCopy}
					aria-live="polite"
					className={cn(
						"inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer",
						copied
							? "border-primary bg-primary text-primary-foreground font-semibold"
							: "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
					)}
					title="Copy ProcessWire selector string"
				>
					{copied ? (
						<>
							<Check className="size-3" />
							Copied!
						</>
					) : (
						<>
							<Copy className="size-3" />
							Copy
						</>
					)}
				</button>
			</div>
		</div>
	);
}
