import React from 'react';
import { useSeedTheme } from '../context/seedTheme';
import { computeFrontPlatformFee } from '../utils/seed';

const ColorSwatch: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col items-center text-xs font-medium">
        <div className="w-14 h-14 rounded-md border shadow-sm" style={{ background: value }} />
        <span className="mt-1 text-[10px] uppercase tracking-wide text-gray-600 dark:text-gray-400">{label}</span>
        <code className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-500">{value}</code>
    </div>
);

const AboutPage: React.FC = () => {
    const { seedInfo, feePercent, accent, accentHover, accentFg, accentSubtle, accentRing } = useSeedTheme();
    const exampleSubtotal = 999;
    const fee = computeFrontPlatformFee(exampleSubtotal);

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
            <header className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--seed-accent)] to-[var(--seed-accent-hover)]">
                    About This Assignment Build
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-prose">
                    This reselling marketplace frontend applies a dynamic visual theme derived from a unique assignment seed. The seed drives accent colors, pricing fee calculations, and product ID checksums as specified in the challenge.
                </p>
            </header>

            <section className="grid gap-6 md:grid-cols-2 items-start">
                <div className="p-5 rounded-xl border bg-white/70 dark:bg-slate-800/70 backdrop-blur shadow-sm space-y-3">
                    <h2 className="text-lg font-semibold">Seed Metadata</h2>
                    <dl className="text-sm space-y-1">
                        <div className="flex justify-between"><dt className="text-gray-500">Seed</dt><dd className="font-mono font-medium">{seedInfo?.seed}</dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500">Numeric Part</dt><dd className="font-mono">{seedInfo?.numberPart}</dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500">Platform Fee %</dt><dd className="font-mono">{feePercent}%</dd></div>
                        <div className="flex justify-between"><dt className="text-gray-500">Fee Example (subtotal {exampleSubtotal})</dt><dd className="font-mono">{fee}</dd></div>
                    </dl>
                </div>
                <div className="p-5 rounded-xl border bg-white/70 dark:bg-slate-800/70 backdrop-blur shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold">Accent Palette</h2>
                    <div className="flex flex-wrap gap-4">
                        <ColorSwatch label="Accent" value={accent} />
                        <ColorSwatch label="Hover" value={accentHover} />
                        <ColorSwatch label="FG" value={accentFg} />
                        <ColorSwatch label="Subtle" value={accentSubtle} />
                        <ColorSwatch label="Ring" value={accentRing} />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Implementation Notes</h2>
                <ul className="list-disc pl-6 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Theme colors injected as CSS variables: <code className="font-mono">--seed-accent</code>, <code className="font-mono">--seed-accent-hover</code>, etc.</li>
                    <li>Platform fee computed as <code className="font-mono">numberPart % 10</code>.</li>
                    <li>UI blocks with a fatal screen if the required seed is missing (assignment rule).</li>
                </ul>
            </section>

            <section className="space-y-6">
                <h2 className="text-lg font-semibold">Sample Usage</h2>
                <div className="flex flex-wrap gap-4">
                    <button className="px-5 py-2 rounded-md font-medium text-white shadow transition-colors" style={{ background: accent }}>Accent Button</button>
                    <button className="px-5 py-2 rounded-md font-medium border" style={{ background: accentSubtle, color: accent }}>Subtle Variant</button>
                    <div className="px-4 py-2 rounded-lg border" style={{ borderColor: accentRing }}>
                        <p className="text-sm" style={{ color: accent }}>Ring tinted container</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
