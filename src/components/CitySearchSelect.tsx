import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Search, X, Building2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BIG_CITIES, searchCities } from '../data/iranCities';

interface HotelLite {
  id?: number;
  name: string;
  city: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Called when a concrete suggestion is chosen (click / Enter on a suggestion). */
  onSelect: (value: string) => void;
  placeholder?: string;
  /** Full hotel list (incl. admin-added) so hotels are searchable from this box. */
  hotels?: HotelLite[];
}

type Suggestion = { key: string; kind: 'city' | 'hotel'; label: string; sub?: string };

/**
 * Searchable destination picker for the hotel search box.
 * - Clicking the field (while empty) shows the big cities as quick picks.
 * - Typing filters BOTH Iranian cities AND hotels (by name or city). Every hotel,
 *   including admin-added ones, is searchable because the list is passed in via props.
 * - Choosing a suggestion (city or hotel) fires onSelect with that text; the page
 *   uses the `search` filter which matches hotel name / city / address.
 *
 * The suggestion list is rendered through a portal to <body> with a high z-index so
 * it always floats above the page (the hero section is an isolated stacking context).
 */
export default function CitySearchSelect({ value, onChange, onSelect, placeholder, hotels = [] }: Props) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Build the suggestion list: typed → hotels + cities, empty → big cities.
  const typed = value.trim().length > 0;
  const q = value.trim().toLowerCase();

  const hotelSug: Suggestion[] = typed
    ? hotels
        .filter((h) => h.name.toLowerCase().includes(q) || (h.city || '').toLowerCase().includes(q))
        .slice(0, 24)
        .map((h, i) => ({ key: `h-${h.id ?? i}-${h.name}`, kind: 'hotel', label: h.name, sub: h.city }))
    : [];

  const citySug: Suggestion[] = (typed ? searchCities(value, 40) : BIG_CITIES).map((c) => ({
    key: `c-${c}`,
    kind: 'city',
    label: c,
  }));

  const results: Suggestion[] = typed ? [...hotelSug, ...citySug] : citySug;
  const firstCityIdx = hotelSug.length; // where the city group starts (when typed)

  // Position of the floating list (page coordinates).
  const [pos, setPos] = useState({ top: 0, left: 0, w: 320 });
  const updatePos = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + window.scrollY + 8, // 8px gap (was mt-2)
      left: r.left + window.scrollX,
      w: r.width,
    });
  };
  useLayoutEffect(() => { if (open) updatePos(); }, [open, value]);
  useEffect(() => {
    if (!open) return;
    const fn = () => updatePos();
    window.addEventListener('resize', fn);
    window.addEventListener('scroll', fn, true);
    return () => {
      window.removeEventListener('resize', fn);
      window.removeEventListener('scroll', fn, true);
    };
  }, [open]);

  // Close on outside click — account for the portal'd list living outside wrapRef.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => { setActive(0); }, [value, open]);

  const choose = (label: string) => {
    onChange(label);
    onSelect(label);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) choose(results[active].label);
      else if (value.trim()) { onSelect(value.trim()); setOpen(false); }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const GroupHeader = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div className="flex items-center gap-1.5 px-4 pt-2 pb-1 text-xs font-bold" style={{ color: theme.colors.textMuted }}>
      {icon}
      {label}
    </div>
  );

  const listbox = (
    <div
      ref={popupRef}
      id="city-listbox"
      role="listbox"
      className="bg-white rounded-2xl shadow-2xl border max-h-72 overflow-y-auto py-1.5"
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        width: pos.w,
        zIndex: 9999,
        borderColor: theme.colors.cardBorder,
        fontFamily: "'Vazirmatn', sans-serif",
      }}
      dir="rtl"
    >
      {!typed && (
        <GroupHeader icon={<Building2 className="w-3.5 h-3.5" />} label="شهرهای بزرگ" />
      )}

      {results.length === 0 && (
        <div className="px-4 py-6 text-center text-sm flex flex-col items-center gap-2" style={{ color: theme.colors.textMuted }}>
          <Search className="w-5 h-5" />
          موردی با این نام پیدا نشد
        </div>
      )}

      {results.map((item, i) => {
        const isActive = i === active;
        const isBig = item.kind === 'city' && !typed && BIG_CITIES.includes(item.label);
        return (
          <div key={item.key}>
            {typed && i === 0 && hotelSug.length > 0 && (
              <GroupHeader icon={<Building2 className="w-3.5 h-3.5" />} label="هتل‌ها و اقامتگاه‌ها" />
            )}
            {typed && i === firstCityIdx && citySug.length > 0 && (
              <GroupHeader icon={<MapPin className="w-3.5 h-3.5" />} label="شهرها" />
            )}
            <button
              type="button"
              role="option"
              aria-selected={isActive}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(item.label)}
              className="w-full text-right px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors"
              style={{
                backgroundColor: isActive ? theme.colors.primaryLight : 'transparent',
                color: isActive ? theme.colors.primary : theme.colors.textPrimary,
                fontWeight: isBig ? 700 : 500,
              }}
            >
              {item.kind === 'hotel'
                ? <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? theme.colors.primary : theme.colors.textMuted }} />
                : <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? theme.colors.primary : theme.colors.textMuted }} />}
              <span className="flex-1 truncate">{item.label}</span>
              {item.sub && (
                <span className="text-xs flex-shrink-0" style={{ color: theme.colors.textMuted }}>{item.sub}</span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={wrapRef} className="relative w-full">
      <label htmlFor="city-search" className="sr-only">{placeholder}</label>
      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10" style={{ color: theme.colors.textMuted }} aria-hidden="true" />
      <input
        id="city-search"
        name="city"
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="city-listbox"
        aria-autocomplete="list"
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full pr-12 pl-9 h-[60px] bg-white border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{ borderColor: theme.colors.cardBorder, color: theme.colors.textPrimary }}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); setOpen(true); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 z-10"
          aria-label="پاک کردن"
        >
          <X className="w-4 h-4" style={{ color: theme.colors.textMuted }} />
        </button>
      )}

      {open && typeof document !== 'undefined' && createPortal(listbox, document.body)}
    </div>
  );
}
