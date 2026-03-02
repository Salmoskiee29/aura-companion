interface Props {
  value: 'standard' | 'high' | 'ultra';
  onChange: (v: 'standard' | 'high' | 'ultra') => void;
}

const levels: { value: 'standard' | 'high' | 'ultra'; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
  { value: 'ultra', label: 'Ultra' },
];

export default function RealismSlider({ value, onChange }: Props) {
  const idx = levels.findIndex((l) => l.value === value);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <label className="text-xs font-medium text-muted-foreground mb-3 block uppercase tracking-wide">
        ⚙️ Realism Level
      </label>
      <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => onChange(l.value)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              value === l.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((idx + 1) / levels.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
