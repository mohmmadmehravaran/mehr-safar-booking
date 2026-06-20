import { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Hotel, CalendarDays, MessageSquare, LogIn, Plus, Edit2, Trash2, Check, X, Eye, Star,
  DollarSign, AlertCircle, Paintbrush, Users, Phone, Mail, Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Hotel as HotelType, AccommodationType, ReviewLevel, SiteUser } from '../types';
import { formatJalali } from '../utils/date';
import { PROVINCE_NAMES, getCitiesForProvince, findProvinceOfCity } from '../data/iranCities';
import { motion, AnimatePresence } from 'framer-motion';
import AppearancePanel from '../components/admin/AppearancePanel';
import { useDocumentTitle } from '../utils/useDocumentTitle';

type Tab = 'dashboard' | 'hotels' | 'bookings' | 'users' | 'reviews' | 'appearance';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAdmin, loginAdmin, logoutAdmin, hotels, bookings, reviews, users, adminUpdateUser, adminDeleteUser, addHotel, updateHotel, deleteHotel, updateBookingStatus } = useApp();
  const { setIsVisualEditing } = useTheme();
  useDocumentTitle('پنل مدیریت');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<SiteUser | null>(null);
  const [userForm, setUserForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [userAlert, setUserAlert] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Hotel form
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelType | null>(null);
  const [hotelForm, setHotelForm] = useState<Partial<HotelType>>({
    name: '', province: '', city: '', address: '', stars: 3, type: 'هتل', review: 'خوب', reviewScore: 7,
    pricePerNight: 0, description: '', phone: '', email: '', amenities: [], images: [''],
    rooms: [], latitude: 0, longitude: 0, isFeatured: false,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(loginForm.username, loginForm.password)) {
      setLoginError('');
    } else {
      setLoginError('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  const handleSaveHotel = () => {
    if (!hotelForm.name || !hotelForm.province || !hotelForm.city) {
      alert('لطفاً نام هتل، استان و شهر را وارد کنید.');
      return;
    }
    const hotelData = {
      ...hotelForm,
      id: editingHotel ? editingHotel.id : Date.now(),
      rooms: hotelForm.rooms || [],
      amenities: hotelForm.amenities || [],
      images: hotelForm.images?.filter(Boolean) || [''],
    } as HotelType;

    if (editingHotel) {
      updateHotel(hotelData);
    } else {
      addHotel(hotelData);
    }
    setShowHotelForm(false);
    setEditingHotel(null);
    setHotelForm({
      name: '', province: '', city: '', address: '', stars: 3, type: 'هتل', review: 'خوب', reviewScore: 7,
      pricePerNight: 0, description: '', phone: '', email: '', amenities: [], images: [''],
      rooms: [], latitude: 0, longitude: 0, isFeatured: false,
    });
  };

  const openEditHotel = (hotel: HotelType) => {
    setEditingHotel(hotel);
    setHotelForm({ ...hotel, province: hotel.province || findProvinceOfCity(hotel.city) });
    setShowHotelForm(true);
  };

  const openNewHotel = () => {
    setEditingHotel(null);
    setHotelForm({
      name: '', province: '', city: '', address: '', stars: 3, type: 'هتل', review: 'خوب', reviewScore: 7,
      pricePerNight: 0, description: '', phone: '', email: '', amenities: [], images: [''],
      rooms: [], latitude: 0, longitude: 0, isFeatured: false,
    });
    setShowHotelForm(true);
  };

  // Group hotels by province (and sort by city within each) for the management list
  const hotelsByProvince: [string, HotelType[]][] = (() => {
    const map: Record<string, HotelType[]> = {};
    for (const h of hotels) {
      const prov = h.province || findProvinceOfCity(h.city) || 'سایر';
      (map[prov] = map[prov] || []).push(h);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => (a.city || '').localeCompare(b.city || '', 'fa'));
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], 'fa'));
  })();

  // Stats
  const totalRevenue = bookings.filter((b) => b.status === 'confirmed').reduce((sum, b) => sum + b.totalPrice, 0);
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">ورود به پنل مدیریت</h2>
            <p className="text-sm text-gray-500 mt-1">لطفاً اطلاعات کاربری خود را وارد کنید</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">نام کاربری</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">رمز عبور</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••"
              />
            </div>
            {loginError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {loginError}
              </div>
            )}
            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
              ورود
            </button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            بازگشت به سایت
          </button>
        </motion.div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'hotels', label: 'مدیریت هتل‌ها', icon: <Hotel className="w-5 h-5" /> },
    { id: 'bookings', label: 'رزروها', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'users', label: 'کاربران', icon: <Users className="w-5 h-5" /> },
    { id: 'reviews', label: 'نظرات', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'appearance', label: 'ظاهر سایت', icon: <Paintbrush className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">پنل مدیریت</h2>
                <p className="text-xs text-gray-500 mt-1">مهر سفر</p>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={() => { logoutAdmin(); navigate('/'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  خروج
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">داشبورد</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">کل هتل‌ها</span>
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Hotel className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{hotels.length}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">کل رزروها</span>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <CalendarDays className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">درآمد کل</span>
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('fa-IR')}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">نظرات</span>
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">کاربران</span>
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-teal-600" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4">رزروهای اخیر</h3>
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map((b) => (
                          <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <div className="font-medium text-sm text-gray-900">{b.guestName}</div>
                              <div className="text-xs text-gray-500">{b.hotelName} - {b.roomName}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{formatJalali(b.checkIn)} تا {formatJalali(b.checkOut)}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {b.status === 'confirmed' ? 'تأیید شده' : b.status === 'pending' ? 'در انتظار' : 'لغو شده'}
                            </span>
                          </div>
                        ))}
                        {bookings.length === 0 && <p className="text-sm text-gray-500 text-center py-4">رزروی ثبت نشده</p>}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4">وضعیت رزروها</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">تأیید شده</span>
                            <span className="font-medium">{confirmedBookings}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${bookings.length ? (confirmedBookings / bookings.length) * 100 : 0}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">در انتظار</span>
                            <span className="font-medium">{pendingBookings}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${bookings.length ? (pendingBookings / bookings.length) * 100 : 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'hotels' && (
                <motion.div key="hotels" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">مدیریت هتل‌ها</h2>
                    <button onClick={openNewHotel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      افزودن هتل
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">نام</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">شهر</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">ستاره</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">نوع</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">قیمت</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">عملیات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {hotels.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">هنوز هتلی اضافه نشده است.</td></tr>
                          )}
                          {hotelsByProvince.map(([province, list]) => (
                            <Fragment key={province}>
                              <tr className="bg-emerald-50/70">
                                <td colSpan={6} className="px-4 py-2.5 text-sm font-bold text-emerald-800">
                                  استان {province}
                                  <span className="mr-2 text-xs font-medium text-emerald-600">({list.length.toLocaleString('fa-IR')} هتل)</span>
                                </td>
                              </tr>
                              {list.map((hotel) => (
                            <tr key={hotel.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{hotel.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{hotel.city}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{hotel.stars}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{hotel.type}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{hotel.pricePerNight.toLocaleString('fa-IR')}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => navigate(`/hotel/${hotel.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => openEditHotel(hotel)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => { if (confirm('آیا از حذف این هتل اطمینان دارید؟')) deleteHotel(hotel.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                              ))}
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">مدیریت رزروها</h2>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">مهمان</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">هتل</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">اتاق</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">تاریخ</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">مبلغ</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">وضعیت</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">عملیات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {bookings.map((b) => (
                            <tr key={b.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">{b.guestName}</div>
                                <div className="text-xs text-gray-500">{b.guestPhone}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{b.hotelName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{b.roomName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatJalali(b.checkIn)} تا {formatJalali(b.checkOut)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{b.totalPrice.toLocaleString('fa-IR')}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                  b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {b.status === 'confirmed' ? 'تأیید شده' : b.status === 'pending' ? 'در انتظار' : 'لغو شده'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  {b.status === 'pending' && (
                                    <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="تأیید">
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  {b.status !== 'cancelled' && (
                                    <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="لغو">
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (() => {
                const q = userSearch.trim().toLowerCase();
                const filteredUsers = users.filter((u) =>
                  !q || u.fullName.toLowerCase().includes(q) || u.phone.includes(q) || u.email.toLowerCase().includes(q)
                );
                const bookingsOf = (u: typeof users[number]) =>
                  bookings.filter((b) => b.guestEmail.toLowerCase() === u.email.toLowerCase() || b.guestPhone === u.phone).length;
                const realEmail = (e: string) => (e.endsWith('@mehrsafar.local') ? '' : e);
                const exportCsv = () => {
                  const header = ['شناسه', 'نام و نام خانوادگی', 'موبایل', 'ایمیل', 'تاریخ عضویت', 'تعداد رزرو'];
                  const rows = users.map((u) => [u.id, u.fullName, u.phone, realEmail(u.email), formatJalali(u.createdAt), bookingsOf(u)]);
                  const csv = '\ufeff' + [header, ...rows]
                    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
                    .join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = 'mehrsafar-users.csv';
                  a.click();
                  URL.revokeObjectURL(a.href);
                };
                const openEditUser = (u: SiteUser) => {
                  setUserForm({ fullName: u.fullName, phone: u.phone, email: realEmail(u.email), password: '' });
                  setUserAlert(null);
                  setEditingUser(u);
                };
                const saveUser = (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!editingUser) return;
                  const r = adminUpdateUser(editingUser.id, userForm);
                  setUserAlert({ ok: r.success, msg: r.message });
                  if (r.success) setEditingUser(null);
                };
                const removeUser = (u: SiteUser) => {
                  if (window.confirm(`آیا از حذف «${u.fullName}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`)) {
                    adminDeleteUser(u.id);
                  }
                };
                return (
                  <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">کاربران ثبت‌نام‌شده</h2>
                        <p className="text-sm text-gray-500 mt-1">{users.length} کاربر در سامانه ثبت‌نام کرده‌اند</p>
                      </div>
                      <button
                        onClick={exportCsv}
                        disabled={users.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        خروجی Excel/CSV
                      </button>
                    </div>

                    {/* search */}
                    <div className="relative mb-5 max-w-sm">
                      <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="جستجو بر اساس نام، موبایل یا ایمیل..."
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900"
                      />
                    </div>

                    {users.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-500">هنوز هیچ کاربری ثبت‌نام نکرده است.</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs">
                                <th className="text-right font-medium px-4 py-3">#</th>
                                <th className="text-right font-medium px-4 py-3">کاربر</th>
                                <th className="text-right font-medium px-4 py-3">موبایل</th>
                                <th className="text-right font-medium px-4 py-3">ایمیل</th>
                                <th className="text-right font-medium px-4 py-3">تاریخ عضویت</th>
                                <th className="text-center font-medium px-4 py-3">رزروها</th>
                                <th className="text-right font-medium px-4 py-3">شناسه</th>
                                <th className="text-center font-medium px-4 py-3">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredUsers.map((u, i) => {
                                const email = realEmail(u.email);
                                return (
                                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                                          {u.fullName.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-900">{u.fullName}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700" dir="ltr" style={{ textAlign: 'right' }}>
                                      <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" />{u.phone}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700" dir="ltr" style={{ textAlign: 'right' }}>
                                      {email
                                        ? <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{email}</span>
                                        : <span className="text-gray-400">— ثبت نشده —</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatJalali(u.createdAt)}</td>
                                    <td className="px-4 py-3 text-center">
                                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                        {bookingsOf(u)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{u.id}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button onClick={() => openEditUser(u)} title="ویرایش" className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => removeUser(u)} title="حذف" className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              {filteredUsers.length === 0 && (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">کاربری با این مشخصات یافت نشد.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Edit user modal */}
                    <AnimatePresence>
                      {editingUser && (
                        <motion.div
                          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => setEditingUser(null)}
                        >
                          <motion.div
                            className="bg-white rounded-2xl w-full max-w-md shadow-xl"
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                              <h3 className="font-bold text-gray-900">ویرایش کاربر</h3>
                              <button onClick={() => setEditingUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            <form onSubmit={saveUser} className="p-5 space-y-4">
                              {userAlert && !userAlert.ok && (
                                <div className="p-3 rounded-xl text-sm font-medium bg-red-50 text-red-600">✗ {userAlert.msg}</div>
                              )}
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">نام و نام خانوادگی</label>
                                <input value={userForm.fullName} onChange={(e) => setUserForm((p) => ({ ...p, fullName: e.target.value }))}
                                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">شماره موبایل</label>
                                <input value={userForm.phone} onChange={(e) => setUserForm((p) => ({ ...p, phone: e.target.value }))} dir="ltr" inputMode="tel"
                                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-right" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">ایمیل (اختیاری)</label>
                                <input value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} dir="ltr" inputMode="email" placeholder="example@mail.com"
                                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-right" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">رمز عبور جدید (خالی = بدون تغییر)</label>
                                <input value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} type="text" dir="ltr" placeholder="••••••"
                                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-right" />
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors">
                                  ذخیره تغییرات
                                </button>
                                <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                                  انصراف
                                </button>
                              </div>
                            </form>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}

              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">نظرات کاربران</h2>
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const hotel = hotels.find((h) => h.id === review.hotelId);
                      return (
                        <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-medium text-gray-900">{review.userName}</div>
                              <div className="text-xs text-gray-500">{hotel?.name || 'هتل نامشخص'}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{review.comment}</p>
                          <span className="text-xs text-gray-400 mt-2 block">{formatJalali(review.date, { weekday: true })}</span>
                        </div>
                      );
                    })}
                    {reviews.length === 0 && <p className="text-sm text-gray-500 text-center py-8">نظری ثبت نشده</p>}
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {/* Visual Editor Launch */}
                  <div className="mb-6 p-4 bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-600" />
                        ویرایش بصری (مانند فیگما)
                      </h3>
                      <p className="text-xs text-gray-500">مستقیماً روی سایت متن‌ها را تغییر دهید، رنگ‌ها و اندازه‌ها را با کشیدن تنظیم کنید</p>
                    </div>
                    <button
                      onClick={() => setIsVisualEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      ورود به حالت ویرایش بصری
                    </button>
                  </div>
                  <AppearancePanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Hotel Form Modal */}
      {showHotelForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingHotel ? 'ویرایش هتل' : 'افزودن هتل جدید'}</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">نام هتل *</label>
                <input type="text" value={hotelForm.name || ''} onChange={(e) => setHotelForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">استان *</label>
                  <select
                    value={hotelForm.province || ''}
                    onChange={(e) => setHotelForm((prev) => ({ ...prev, province: e.target.value, city: '' }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">انتخاب استان…</option>
                    {PROVINCE_NAMES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">شهر *</label>
                  <select
                    value={hotelForm.city || ''}
                    disabled={!hotelForm.province}
                    onChange={(e) => setHotelForm((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">{hotelForm.province ? 'انتخاب شهر…' : 'ابتدا استان را انتخاب کنید'}</option>
                    {getCitiesForProvince(hotelForm.province || '').map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">آدرس</label>
                <input type="text" value={hotelForm.address || ''} onChange={(e) => setHotelForm((prev) => ({ ...prev, address: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ستاره</label>
                  <select value={hotelForm.stars} onChange={(e) => setHotelForm((prev) => ({ ...prev, stars: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} ستاره</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">نوع اقامتگاه</label>
                  <select value={hotelForm.type} onChange={(e) => setHotelForm((prev) => ({ ...prev, type: e.target.value as AccommodationType }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {(['هتل', 'هتل آپارتمان', 'مهمان‌پذیر', 'اقامتگاه بوم‌گردی', 'اقامتگاه سنتی'] as AccommodationType[]).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">امتیاز نظر</label>
                  <select value={hotelForm.review} onChange={(e) => setHotelForm((prev) => ({ ...prev, review: e.target.value as ReviewLevel }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {(['ضعیف', 'متوسط', 'خوب', 'بسیار خوب', 'عالی'] as ReviewLevel[]).map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">امتیاز عددی (۰ تا ۱۰)</label>
                  <input type="number" min={0} max={10} step={0.1} value={hotelForm.reviewScore || 0} onChange={(e) => setHotelForm((prev) => ({ ...prev, reviewScore: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">قیمت هر شب (تومان)</label>
                <input type="number" value={hotelForm.pricePerNight || 0} onChange={(e) => setHotelForm((prev) => ({ ...prev, pricePerNight: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">توضیحات</label>
                <textarea value={hotelForm.description || ''} onChange={(e) => setHotelForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">تلفن</label>
                  <input type="text" value={hotelForm.phone || ''} onChange={(e) => setHotelForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ایمیل</label>
                  <input type="email" value={hotelForm.email || ''} onChange={(e) => setHotelForm((prev) => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">تصویر (URL)</label>
                <input type="text" value={hotelForm.images?.[0] || ''} onChange={(e) => setHotelForm((prev) => ({ ...prev, images: [e.target.value] }))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={hotelForm.isFeatured || false} onChange={(e) => setHotelForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor="featured" className="text-sm text-gray-600">نمایش در بخش ویژه</label>
              </div>
            </div>
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
              <button onClick={() => setShowHotelForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                انصراف
              </button>
              <button onClick={handleSaveHotel} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                ذخیره
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
