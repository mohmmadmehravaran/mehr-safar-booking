import { Plus, Trash2, ArrowUp, ArrowDown, LayoutGrid, Rows3, Columns3, Hotel, MapPin, Image as ImageIcon, ExternalLink, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useCards } from '../../context/CardsContext';
import { useApp } from '../../context/AppContext';
import { BIG_CITIES } from '../../data/iranCities';
import { SiteCard, SiteCardType } from '../../types';
import { fileToCompressedDataURL } from '../../utils/image';
import { useAllPages } from './PickerModals';

const TYPE_OPTIONS: { value: SiteCardType; label: string; icon: React.ReactNode }[] = [
  { value: 'hotel', label: 'هتل', icon: <Hotel className="w-4 h-4" /> },
  { value: 'city', label: 'شهر', icon: <MapPin className="w-4 h-4" /> },
  { value: 'banner', label: 'بنر', icon: <ImageIcon className="w-4 h-4" /> },
];

const LINK_SUGGESTIONS = ['/', '/support', '/track', '/account']; // پیش‌فرض‌های قدیمی (دیگر مستقیم استفاده نمی‌شوند)
void LINK_SUGGESTIONS;

export default function CardsManager({ page }: { page?: string } = {}) {
  const { groups, addGroup, updateGroup, removeGroup, moveGroup, addCard, updateCard, removeCard, moveCard } = useCards();
  const { hotels } = useApp();

  // When a page is provided the builder is scoped to that page (used inside the
  // visual page editor). Without a page it manages the home "/" sections (admin panel).
  const scope = page ?? '/';
  const visibleGroups = groups.filter((g) => (g.page ?? '/') === scope);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Intro */}
      <div className="p-4 bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-emerald-600" />
            ساخت و مدیریت کارت‌ها
          </h3>
          <p className="text-xs text-gray-500">
            بخش‌های کارتی بسازید، چیدمان (زیر هم / رو به روی هم) را انتخاب کنید، نوع هر کارت را تعیین و آن را به هر بخش سایت لینک کنید.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addGroup(scope)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> بخش جدید
        </button>
      </div>

      {visibleGroups.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
          هنوز بخشی نساخته‌اید. روی «بخش جدید» بزنید تا شروع کنید.
        </div>
      )}

      {visibleGroups.map((group, gi) => (
        <div key={group.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
          {/* Group header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <input
              value={group.title}
              onChange={(e) => updateGroup(group.id, { title: e.target.value })}
              placeholder="عنوان بخش (اختیاری)"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-300 outline-none"
            />
            {/* Layout toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => updateGroup(group.id, { layout: 'horizontal' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  group.layout === 'horizontal' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'
                }`}
              >
                <Columns3 className="w-4 h-4" /> رو به روی هم
              </button>
              <button
                type="button"
                onClick={() => updateGroup(group.id, { layout: 'vertical' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  group.layout === 'vertical' ? 'bg-white shadow text-emerald-700' : 'text-gray-500'
                }`}
              >
                <Rows3 className="w-4 h-4" /> زیر هم
              </button>
            </div>
            {/* Group actions */}
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => moveGroup(group.id, -1)} disabled={gi === 0}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => moveGroup(group.id, 1)} disabled={gi === visibleGroups.length - 1}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30">
                <ArrowDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => removeGroup(group.id)}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Size controls — تنظیم اندازه کارت‌ها (ریسپانسیو محفوظ می‌ماند) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            {/* ارتفاع کارت */}
            <label className="flex-1 flex items-center gap-3 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Rows3 className="w-4 h-4 text-emerald-600" /> ارتفاع کارت
              </span>
              <input
                type="range"
                min={120}
                max={420}
                step={4}
                value={group.cardHeight ?? 208}
                onChange={(e) => updateGroup(group.id, { cardHeight: Number(e.target.value) })}
                className="flex-1 accent-emerald-600"
              />
              <span className="w-12 text-center font-mono text-gray-500">{group.cardHeight ?? 208}px</span>
            </label>

            {/* حداقل عرض کارت — فقط در چیدمان رو به روی هم */}
            {group.layout === 'horizontal' && (
              <label className="flex-1 flex items-center gap-3 text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Columns3 className="w-4 h-4 text-emerald-600" /> عرض کارت
                </span>
                <input
                  type="range"
                  min={160}
                  max={520}
                  step={10}
                  value={group.minCardWidth ?? 280}
                  onChange={(e) => updateGroup(group.id, { minCardWidth: Number(e.target.value) })}
                  className="flex-1 accent-emerald-600"
                />
                <span className="w-12 text-center font-mono text-gray-500">{group.minCardWidth ?? 280}px</span>
              </label>
            )}
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {group.cards.map((card, ci) => (
              <CardEditor
                key={card.id}
                card={card}
                index={ci}
                total={group.cards.length}
                hotels={hotels}
                layout={group.layout}
                onChange={(partial) => updateCard(group.id, card.id, partial)}
                onRemove={() => removeCard(group.id, card.id)}
                onMove={(dir) => moveCard(group.id, card.id, dir)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => addCard(group.id)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl text-sm font-semibold text-gray-500 hover:text-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> افزودن کارت
          </button>
        </div>
      ))}
    </div>
  );
}

function CardEditor({
  card,
  index,
  total,
  hotels,
  layout,
  onChange,
  onRemove,
  onMove,
}: {
  card: SiteCard;
  index: number;
  total: number;
  hotels: { id: number; name: string; city: string; images: string[] }[];
  layout: 'vertical' | 'horizontal';
  onChange: (partial: Partial<SiteCard>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // همه‌ی صفحات قابل لینک: صفحات داخلی + صفحات سفارشی ساخته‌شده در ویرایش بصری
  const allPages = useAllPages();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        const dataUrl = await fileToCompressedDataURL(file, 1200, 0.8);
        onChange({ image: dataUrl });
      } catch {
        /* noop */
      } finally {
        setUploading(false);
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/60">
      <div className="flex items-center justify-between mb-3">
        {/* Type selector */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ type: t.value })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                card.type === t.value ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
            className="w-7 h-7 rounded-md bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-30">
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
            className="w-7 h-7 rounded-md bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-30">
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onRemove}
            className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* طول کارت — تعداد ستون‌هایی که کارت در شبکه اشغال می‌کند (فقط چیدمان رو به روی هم) */}
      {layout === 'horizontal' && (
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-600">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Columns3 className="w-4 h-4 text-emerald-600" /> طول کارت
          </span>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ colSpan: n })}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  (card.colSpan ?? 1) === n ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {n === 1 ? 'عادی' : n === 2 ? '۲ برابر' : '۳ برابر'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick fill helpers */}
      {card.type === 'hotel' && (
        <select
          value=""
          onChange={(e) => {
            const h = hotels.find((x) => String(x.id) === e.target.value);
            if (h) onChange({ title: h.name, subtitle: h.city, image: h.images[0] || '', link: `/hotel/${h.id}` });
          }}
          className="w-full mb-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <option value="">— انتخاب هتل برای پر کردن خودکار —</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
          ))}
        </select>
      )}
      {card.type === 'city' && (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) onChange({ title: e.target.value, subtitle: 'مشاهده اقامتگاه‌ها', link: '/' });
          }}
          className="w-full mb-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <option value="">— انتخاب شهر برای پر کردن خودکار —</option>
          {BIG_CITIES.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={card.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="عنوان کارت"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <input
          value={card.subtitle || ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="زیرعنوان (اختیاری)"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <div className="flex gap-2 sm:col-span-1">
          <input
            value={card.image.startsWith('data:') ? '' : card.image}
            onChange={(e) => onChange({ image: e.target.value })}
            placeholder={card.image.startsWith('data:') ? 'عکس آپلود شد ✓' : 'آدرس عکس (URL)'}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            title="آپلود عکس از دستگاه"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
          >
            <Upload className="w-4 h-4" /> {uploading ? '...' : 'آپلود'}
          </button>
        </div>
        <div className="relative sm:col-span-2 space-y-2">
          {/* انتخاب سریع صفحه مقصد — شامل صفحاتی که در ویرایش بصری ساخته‌ای */}
          <select
            value={allPages.some((p) => p.path === card.link) ? card.link : ''}
            onChange={(e) => { if (e.target.value) onChange({ link: e.target.value }); }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="">— انتخاب صفحه مقصد —</option>
            {allPages.map((p) => (
              <option key={p.path} value={p.path}>{p.label}</option>
            ))}
          </select>
          <div className="relative">
            <input
              value={card.link}
              onChange={(e) => onChange({ link: e.target.value })}
              placeholder="لینک (مثلاً /hotel/3 یا https://...)"
              list={`links-${card.id}`}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <ExternalLink className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <datalist id={`links-${card.id}`}>
              {allPages.map((p) => (
                <option key={p.path} value={p.path}>{p.label}</option>
              ))}
              {hotels.map((h) => (
                <option key={h.id} value={`/hotel/${h.id}`}>{h.name}</option>
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Mini preview */}
      <div className="mt-3 flex items-center gap-3">
        <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
          {card.image ? (
            <img src={card.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-1 right-1 text-[10px] text-white font-bold drop-shadow">{card.title}</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          نوع: <span className="font-semibold text-gray-600">{TYPE_OPTIONS.find((t) => t.value === card.type)?.label}</span>
          {' · '}لینک: <span className="font-mono text-gray-600">{card.link || '—'}</span>
        </p>
      </div>
    </div>
  );
}
