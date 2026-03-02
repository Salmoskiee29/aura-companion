import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { OptionCategory, CharacterSelections } from './types';

interface Props {
  category: OptionCategory;
  selections: CharacterSelections;
  onChange: (key: keyof CharacterSelections, value: any) => void;
}

export default function OptionSection({ category, selections, onChange }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-base">{category.icon}</span>
          {category.label}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {category.options.map((field) => (
            <div key={field.key}>
              <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                {field.label}
              </label>

              {field.type === 'select' && field.choices && (
                <div className="flex flex-wrap gap-2">
                  {field.choices.map((c) => (
                    <button
                      key={c}
                      onClick={() => onChange(field.key, c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selections[field.key] === c
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {field.type === 'multi-select' && field.choices && (
                <div className="flex flex-wrap gap-2">
                  {field.choices.map((c) => {
                    const current = selections[field.key] as string[];
                    const isActive = current.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          if (c === 'None') {
                            onChange(field.key, ['None']);
                          } else {
                            const next = isActive
                              ? current.filter((v) => v !== c)
                              : [...current.filter((v) => v !== 'None'), c];
                            onChange(field.key, next.length ? next : ['None']);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}

              {field.type === 'color' && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={selections[field.key] as string}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-muted-foreground font-mono">
                    {selections[field.key] as string}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
