import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays, Hotel as HotelIcon, LogOut, Mail, Phone, UserCircle, Settings,
  ChevronLeft, BadgeCheck, Pencil, Moon, Users, Wallet, Ticket, MapPin,
  Save, Receipt, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatJalali, toPersianNumber } from '../utils/date';
import { useDocumentTitle } from '../utils/useDocumentTitle';

type Tab = 'bookings' | 'account';
type BookingFilter = 'all' | 'confirmed' | 'pending' | 'cancelled';

const statusLabel: Record<string, string> = { confirmed: 'تأیید شده', pending: 'در انتظار', cancelled: 'لغو شده' };
const statusStyle: Record<string, React.CSSProperties> = {
  confirmed: { backgroundColor: '#d1fae5', color: '#065f46' },
  pending: { backgroundColor: '#fef3c7', color: '#92400e' },
  cancelled: { backgroundColor: '#fee2e2', color: '#991b1b' },
};

function nightsBetween(checkIn: string, checkOut: string) {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

export default function UserPanel() {
  const navigate = useNavigate();
  const { currentUser, logoutUser, bookings, hotels, updateProfile } = useApp();
  const { theme } = useTheme();
  useDocumentTitle('پنل کاربری');

  const [tab, setTab] = useState<Tab>('bookings');
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [editing, setEditing] = useState(false);

  // ── not logged in ──────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-5 pb-24 md:pb-0" style={{ backgroundColor: theme.colors.bodyBg }}>
        <div className="text-center rounded-3xl p-8 w-full max-w-sm shadow-soft" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
          <UserCircle className="w-20 h-20 mx-auto mb-4" style={{ color: theme.colors.primary, opacity: 0.4 }} />
          <h1 className="text-2xl font-black mb-2" style={{ color: theme.colors.textPrimary }}>وارد نشده‌اید</h1>
          <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>برای مشاهده پنل کاربری ابتدا وارد شوید.</p>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-black" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
            ورود / عضویت
          </Link>
        </div>
      </div>
    );
  }

  const myBookings = bookings.filter(
    (b) => b.guestEmail.toLowerCase() === currentUser.email.toLowerCase() || b.guestPhone === currentUser.phone
  );

  const totalNights = myBookings.reduce((s, b) => s + nightsBetween(b.checkIn, b.checkOut), 0);
  const totalSpent = myBookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0);
  const confirmedCount = myBookings.filter((b) => b.status === 'confirmed').length;

  const counts = {
    all: myBookings.length,
    confirmed: confirmedCount,
    pending: myBookings.filter((b) => b.status === 'pending').length,
    cancelled: myBookings.filter((b) => b.status === 'cancelled').length,
  };
  const visibleBookings = filter === 'all' ? myBookings : myBookings.filter((b) => b.status === filter);

  const hotelImage = (hotelId: number) => hotels.find((h) => h.id === hotelId)?.images?.[0];
  const hotelCity = (hotelId: number) => hotels.find((h) => h.id === hotelId)?.city;

  const isSyntheticEmail = currentUser.email.endsWith('@mehrsafar.local');

  const stats = [
    { icon: Ticket, label: 'رزروها', val: toPersianNumber(myBookings.length) },
    { icon: Moon, label: 'شب اقامت', val: toPersianNumber(totalNights) },
    { icon: BadgeCheck, label: 'تأیید شده', val: toPersianNumber(confirmedCount) },
    { icon: Wallet, label: 'مجموع خرید', val: `${totalSpent.toLocaleString('fa-IR')}` },
  ];

  const tabs: { key: Tab; label: string; icon: typeof Ticket }[] = [
    { key: 'bookings', label: 'رزروهای من', icon: Receipt },
    { key: 'account', label: 'اطلاعات حساب', icon: Settings },
  ];

  return (
    <div className="min-h-screen pb-28 md:pb-0" style={{ backgroundColor: theme.colors.bodyBg }}>

      {/* ── PROFILE HEADER ── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.colors.heroBgFrom}, ${theme.colors.heroBgTo})` }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full blur-3xl bg-white" />
          <div className="absolute bottom-0 right-10 w-32 h-32 rounded-full blur-2xl bg-white" />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 pt-10 pb-20 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-2xl font-black shadow-lg shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-black truncate">{currentUser.fullName}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="w-3 h-3" /> موبایل تأیید شده
                </span>
              </div>
              <div className="text-sm opacity-80 mt-0.5" dir="ltr">{currentUser.phone}</div>
              <div className="text-xs opacity-70 mt-0.5">عضو از {formatJalali(currentUser.createdAt)}</div>
            </div>
            <button
              onClick={() => { setTab('account'); setEditing(true); }}
              aria-label="ویرایش پروفایل"
              className="self-start shrink-0 inline-flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 transition-colors px-3 py-2 rounded-xl backdrop-blur-xl"
            >
              <Pencil className="w-3.5 h-3.5" /> ویرایش
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 -mt-12 space-y-4">

        {/* ── STATS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: theme.colors.primaryLight }}>
                <s.icon className="w-4 h-4" style={{ color: theme.colors.primary }} />
              </div>
              <div className="text-lg font-black leading-tight" style={{ color: theme.colors.textPrimary }}>{s.val}</div>
              <div className="text-[11px] font-semibold mt-0.5" style={{ color: theme.colors.textSecondary }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── TABS ── */}
        <div className="grid grid-cols-2 rounded-2xl p-1 shadow-sm" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="py-2.5 rounded-xl text-sm font-black transition-all inline-flex items-center justify-center gap-1.5"
                style={active
                  ? { background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, color: '#fff' }
                  : { color: theme.colors.textSecondary }}
              >
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'bookings' ? (
            <motion.div key="bookings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* filter chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {([
                  { key: 'all', label: 'همه' },
                  { key: 'confirmed', label: 'تأیید شده' },
                  { key: 'pending', label: 'در انتظار' },
                  { key: 'cancelled', label: 'لغو شده' },
                ] as { key: BookingFilter; label: string }[]).map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-full transition-all"
                      style={active
                        ? { backgroundColor: theme.colors.primary, color: '#fff' }
                        : { backgroundColor: theme.colors.cardBg, color: theme.colors.textSecondary, border: `1px solid ${theme.colors.cardBorder}` }}
                    >
                      {f.label} ({toPersianNumber(counts[f.key])})
                    </button>
                  );
                })}
              </div>

              {visibleBookings.length === 0 ? (
                <div className="text-center py-12 rounded-3xl shadow-sm" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
                  <HotelIcon className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: theme.colors.textPrimary }} />
                  <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                    {filter === 'all' ? 'هنوز رزروی ثبت نکرده‌اید.' : 'رزروی در این وضعیت یافت نشد.'}
                  </p>
                  <Link to="/" className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: theme.colors.primary }}>
                    <Sparkles className="w-4 h-4" /> مشاهده هتل‌ها
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleBookings.map((b) => {
                    const img = hotelImage(b.hotelId);
                    const city = hotelCity(b.hotelId);
                    const nights = nightsBetween(b.checkIn, b.checkOut);
                    return (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl overflow-hidden shadow-sm"
                        style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}
                      >
                        <div className="flex">
                          {img && (
                            <div className="w-24 sm:w-28 shrink-0 relative">
                              <img src={img} alt={b.hotelName} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                            </div>
                          )}
                          <div className="flex-1 p-4 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="min-w-0">
                                <div className="font-black text-sm truncate" style={{ color: theme.colors.textPrimary }}>{b.hotelName}</div>
                                <div className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: theme.colors.textSecondary }}>
                                  <span>{b.roomName}</span>
                                  {city && <span className="inline-flex items-center gap-0.5"><MapPin className="w-3 h-3" />{city}</span>}
                                </div>
                              </div>
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-full shrink-0" style={statusStyle[b.status]}>
                                {statusLabel[b.status]}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
                              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatJalali(b.checkIn)} → {formatJalali(b.checkOut)}</span>
                              <span className="flex items-center gap-1"><Moon className="w-3 h-3" />{toPersianNumber(nights)} شب</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{toPersianNumber(b.guests)} نفر</span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px dashed ${theme.colors.cardBorder}` }}>
                              <span className="font-black text-sm" style={{ color: theme.colors.primary }}>{b.totalPrice.toLocaleString('fa-IR')} تومان</span>
                              <div className="flex items-center gap-3">
                                <Link to="/track" className="text-xs font-bold inline-flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
                                  <Ticket className="w-3.5 h-3.5" /> پیگیری
                                </Link>
                                <Link to={`/hotel/${b.hotelId}`} className="text-xs font-bold inline-flex items-center gap-0.5" style={{ color: theme.colors.primary }}>
                                  هتل <ChevronLeft className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="account" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <AccountSection
                user={currentUser}
                isSyntheticEmail={isSyntheticEmail}
                editing={editing}
                setEditing={setEditing}
                updateProfile={updateProfile}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LOGOUT ── */}
        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onClick={() => { logoutUser(); navigate('/'); }}
          className="w-full py-4 rounded-3xl flex items-center justify-center gap-2 font-black text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          خروج از حساب کاربری
        </motion.button>

      </div>
    </div>
  );
}

/* ── Account info + inline editor ── */
function AccountSection({ user, isSyntheticEmail, editing, setEditing, updateProfile, theme }: {
  user: { fullName: string; email: string; phone: string };
  isSyntheticEmail: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  updateProfile: (d: { fullName: string; email: string; phone: string }) => { success: boolean; message: string };
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const [form, setForm] = useState({
    fullName: user.fullName,
    email: isSyntheticEmail ? '' : user.email,
    phone: user.phone,
  });
  const [alert, setAlert] = useState<{ ok: boolean; msg: string } | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const r = updateProfile(form);
    setAlert({ ok: r.success, msg: r.message });
    if (r.success) setEditing(false);
  };

  const rows = [
    { icon: UserCircle, label: 'نام و نام خانوادگی', value: user.fullName },
    { icon: Phone, label: 'شماره موبایل', value: user.phone, ltr: true },
    { icon: Mail, label: 'ایمیل', value: isSyntheticEmail ? '— ثبت نشده —' : user.email, ltr: !isSyntheticEmail, muted: isSyntheticEmail },
  ];

  return (
    <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-sm" style={{ color: theme.colors.textPrimary }}>اطلاعات حساب</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs font-bold inline-flex items-center gap-1" style={{ color: theme.colors.primary }}>
            <Pencil className="w-3.5 h-3.5" /> ویرایش
          </button>
        )}
      </div>

      {alert && (
        <div role="alert" className={`mb-4 p-3.5 rounded-2xl text-sm font-semibold ${alert.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {alert.ok ? '✓ ' : '✗ '}{alert.msg}
        </div>
      )}

      {!editing ? (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: theme.colors.primaryLight }}>
                <r.icon className="w-4 h-4" style={{ color: theme.colors.primary }} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px]" style={{ color: theme.colors.textSecondary }}>{r.label}</div>
                <div className="text-sm font-semibold truncate" dir={r.ltr ? 'ltr' : 'rtl'} style={{ color: r.muted ? theme.colors.textMuted : theme.colors.textPrimary, textAlign: 'right' }}>{r.value}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={save} className="space-y-3">
          <Field label="نام و نام خانوادگی" value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} theme={theme} />
          <Field label="شماره موبایل" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} theme={theme} dir="ltr" inputMode="tel" />
          <Field label="ایمیل (اختیاری)" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} theme={theme} dir="ltr" inputMode="email" placeholder="example@mail.com" />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 py-3.5 rounded-2xl text-white font-black inline-flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
              <Save className="w-4 h-4" /> ذخیره تغییرات
            </button>
            <button type="button" onClick={() => { setEditing(false); setForm({ fullName: user.fullName, email: isSyntheticEmail ? '' : user.email, phone: user.phone }); }} className="px-5 py-3.5 rounded-2xl font-bold" style={{ backgroundColor: theme.colors.bodyBg, color: theme.colors.textSecondary, border: `1px solid ${theme.colors.cardBorder}` }}>
              انصراف
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange, theme, dir = 'rtl', inputMode, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  theme: ReturnType<typeof useTheme>['theme'];
  dir?: 'rtl' | 'ltr'; inputMode?: 'text' | 'tel' | 'email'; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold mb-1.5" style={{ color: theme.colors.textSecondary }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        inputMode={inputMode}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 text-right"
        style={{ backgroundColor: theme.colors.bodyBg, border: `2px solid ${theme.colors.cardBorder}`, color: theme.colors.textPrimary }}
      />
    </div>
  );
}
