import { useState, useEffect, type FormEvent } from 'react';
import { Building2, Phone, Home, UserPlus, LogIn, Trash2 } from 'lucide-react';
import { api } from '../api';
import type { Homeowner } from '../types';

interface Props {
  onLogin: (homeowner: Homeowner) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
  const [mode, setMode] = useState<'select' | 'register'>('select');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', apartment: '', building: '', phone: '' });

  useEffect(() => {
    api.getHomeowners()
      .then(setHomeowners)
      .catch(() => setError('לא ניתן לטעון את רשימת הדיירים'))
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.apartment.trim()) {
      setError('שם ומספר דירה הם שדות חובה');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const homeowner = await api.saveHomeowner(form);
      onLogin(homeowner);
    } catch (err: any) {
      setError(err.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`למחוק את ${name}?`)) return;
    try {
      await api.deleteHomeowner(id);
      setHomeowners(prev => prev.filter(h => h.id !== id));
    } catch {
      setError('שגיאה במחיקה');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Home className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">דרישות דיירים</h1>
          <p className="text-gray-500 mt-2">פרויקט מגורים משותף – ניהול ורכש קבוצתי</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Mode tabs */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setMode('select')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                mode === 'select' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LogIn className="w-4 h-4" /> כניסה לדייר קיים
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                mode === 'register' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-4 h-4" /> רישום דייר חדש
            </button>
          </div>

          <div className="p-6">
            {/* SELECT existing homeowner */}
            {mode === 'select' && (
              <>
                {loading ? (
                  <div className="text-center py-8 text-gray-400">טוען דיירים...</div>
                ) : homeowners.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🏘️</div>
                    <p className="text-gray-500 mb-4">אין דיירים רשומים עדיין</p>
                    <button
                      onClick={() => setMode('register')}
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      היה/י ראשון/ה להירשם
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-3">בחר/י את הפרופיל שלך:</p>
                    {homeowners.map(h => (
                      <div
                        key={h.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer group transition-all"
                        onClick={() => onLogin(h)}
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                          {h.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900">{h.name}</div>
                          <div className="text-sm text-gray-500 flex gap-3 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Home className="w-3 h-3" /> דירה {h.apartment}
                            </span>
                            {h.building && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> בניין {h.building}
                              </span>
                            )}
                            {h.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {h.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(h.id, h.name); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="מחק"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* REGISTER new homeowner */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם מלא <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="ישראל ישראלי"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      מספר דירה / מגרש <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.apartment}
                      onChange={e => setForm(f => ({ ...f, apartment: e.target.value }))}
                      placeholder="4א"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">בניין</label>
                    <input
                      type="text"
                      value={form.building}
                      onChange={e => setForm(f => ({ ...f, building: e.target.value }))}
                      placeholder="A"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="050-000-0000"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  {saving ? 'שומר...' : 'הירשם/י ועבור/י לשאלון'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {homeowners.length} דיירים רשומים בפרויקט
        </p>
      </div>
    </div>
  );
}
