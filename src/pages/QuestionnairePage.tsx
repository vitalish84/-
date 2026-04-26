import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Save, CheckCircle2, XCircle, HelpCircle, Circle } from 'lucide-react';
import { api } from '../api';
import { CATEGORIES, BUDGET_OPTIONS } from '../constants';
import type { CategoryData, Homeowner, Quote, Requirements } from '../types';

interface Props {
  homeowner: Homeowner;
  onGoToDashboard: () => void;
}

const EMPTY_CATEGORY: CategoryData = {
  needed: '',
  description: '',
  budget: '',
  quotes: [],
  joinGroup: false,
};

function statusIcon(needed: CategoryData['needed']) {
  if (needed === 'yes')   return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  if (needed === 'no')    return <XCircle className="w-5 h-5 text-red-400" />;
  if (needed === 'maybe') return <HelpCircle className="w-5 h-5 text-yellow-500" />;
  return <Circle className="w-5 h-5 text-gray-300" />;
}

function statusBadge(needed: CategoryData['needed']) {
  if (needed === 'yes')   return 'bg-green-100 text-green-700 border-green-200';
  if (needed === 'no')    return 'bg-red-50 text-red-500 border-red-100';
  if (needed === 'maybe') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-gray-50 text-gray-400 border-gray-200';
}

function statusLabel(needed: CategoryData['needed']) {
  if (needed === 'yes')   return 'כן, אצטרך';
  if (needed === 'no')    return 'לא אצטרך';
  if (needed === 'maybe') return 'עדיין לא בטוח';
  return 'לא מולא';
}

export default function QuestionnairePage({ homeowner, onGoToDashboard }: Props) {
  const [categories, setCategories] = useState<Record<string, CategoryData>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getRequirements(homeowner.id)
      .then((req: Requirements | null) => {
        if (req?.categories) setCategories(req.categories);
      })
      .catch(() => setError('לא ניתן לטעון את הנתונים'))
      .finally(() => setLoading(false));
  }, [homeowner.id]);

  const update = useCallback((catId: string, patch: Partial<CategoryData>) => {
    setCategories(prev => ({
      ...prev,
      [catId]: { ...(prev[catId] ?? EMPTY_CATEGORY), ...patch },
    }));
    setSaved(false);
  }, []);

  const addQuote = (catId: string) => {
    const cat = categories[catId] ?? EMPTY_CATEGORY;
    const newQuote: Quote = { id: `q_${Date.now()}`, contractor: '', price: '', notes: '' };
    update(catId, { quotes: [...cat.quotes, newQuote] });
  };

  const updateQuote = (catId: string, quoteId: string, patch: Partial<Quote>) => {
    const cat = categories[catId] ?? EMPTY_CATEGORY;
    update(catId, {
      quotes: cat.quotes.map(q => q.id === quoteId ? { ...q, ...patch } : q),
    });
  };

  const removeQuote = (catId: string, quoteId: string) => {
    const cat = categories[catId] ?? EMPTY_CATEGORY;
    update(catId, { quotes: cat.quotes.filter(q => q.id !== quoteId) });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.saveRequirements(homeowner.id, categories);
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const filled = CATEGORIES.filter(c => categories[c.id]?.needed).length;
  const yesCount = CATEGORIES.filter(c => categories[c.id]?.needed === 'yes').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="text-gray-400 text-lg">טוען שאלון...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12" dir="rtl">
      {/* Progress bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm pt-4 pb-3 z-10 border-b border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-500">
            {filled} / {CATEGORIES.length} קטגוריות מולאו
            {yesCount > 0 && <span className="text-green-600 font-medium"> · {yesCount} נדרשות</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onGoToDashboard}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              לדשבורד →
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'שומר...' : saved ? 'נשמר!' : 'שמור'}
            </button>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(filled / CATEGORIES.length) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {CATEGORIES.map(cat => {
          const data = categories[cat.id] ?? EMPTY_CATEGORY;
          const isOpen = openId === cat.id;

          return (
            <div key={cat.id} className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
              {/* Category header */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-right"
                onClick={() => setOpenId(isOpen ? null : cat.id)}
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{cat.label}</div>
                  <div className="text-xs text-gray-400 truncate">{cat.desc}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge(data.needed)}`}>
                    {statusLabel(data.needed)}
                  </span>
                  {statusIcon(data.needed)}
                  {data.quotes.length > 0 && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                      {data.quotes.length} הצעות
                    </span>
                  )}
                  {data.joinGroup && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                      קבוצתי
                    </span>
                  )}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-5 border-t border-gray-100 pt-4 space-y-5">
                  {/* Needed radio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      האם תזדקק/י לכך?
                    </label>
                    <div className="flex gap-2">
                      {([
                        { value: 'yes',   label: 'כן, אצטרך',      cls: 'border-green-300 bg-green-50 text-green-700' },
                        { value: 'maybe', label: 'עדיין לא בטוח',   cls: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
                        { value: 'no',    label: 'לא אצטרך',        cls: 'border-red-200 bg-red-50 text-red-500' },
                      ] as const).map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => update(cat.id, { needed: opt.value })}
                          className={`flex-1 py-2 text-sm font-semibold rounded-xl border-2 transition-all ${
                            data.needed === opt.value ? opt.cls : 'border-gray-200 text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {data.needed !== 'no' && data.needed !== '' && (
                    <>
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          פרט את הדרישות שלך
                        </label>
                        <textarea
                          value={data.description}
                          onChange={e => update(cat.id, { description: e.target.value })}
                          placeholder={`לדוגמה: ${cat.desc}`}
                          rows={3}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      {/* Budget */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          תקציב משוער
                        </label>
                        <select
                          value={data.budget}
                          onChange={e => update(cat.id, { budget: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {BUDGET_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quotes */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">הצעות מחיר שקיבלת</label>
                          <button
                            onClick={() => addQuote(cat.id)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Plus className="w-3.5 h-3.5" /> הוסף הצעה
                          </button>
                        </div>

                        {data.quotes.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-xl">
                            אין הצעות מחיר עדיין
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {data.quotes.map(q => (
                              <div key={q.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                <div className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={q.contractor}
                                    onChange={e => updateQuote(cat.id, q.id, { contractor: e.target.value })}
                                    placeholder="שם קבלן / חברה"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <input
                                    type="text"
                                    value={q.price}
                                    onChange={e => updateQuote(cat.id, q.id, { price: e.target.value })}
                                    placeholder="מחיר (₪)"
                                    className="w-32 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <button
                                    onClick={() => removeQuote(cat.id, q.id)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={q.notes}
                                  onChange={e => updateQuote(cat.id, q.id, { notes: e.target.value })}
                                  placeholder="הערות (אופציונלי)"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Join group */}
                      <label className="flex items-center gap-3 cursor-pointer bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                        <input
                          type="checkbox"
                          checked={data.joinGroup}
                          onChange={e => update(cat.id, { joinGroup: e.target.checked })}
                          className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                        />
                        <div>
                          <div className="text-sm font-semibold text-orange-800">
                            מעוניין/ת בפרויקט קבוצתי
                          </div>
                          <div className="text-xs text-orange-600">
                            אצטרף לרכישה/עבודה משותפת עם דיירים אחרים להוזלת מחיר
                          </div>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom save button */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saving ? 'שומר...' : saved ? 'הכל נשמר!' : 'שמור שאלון'}
        </button>
        <button
          onClick={onGoToDashboard}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 py-3.5 rounded-2xl font-semibold hover:bg-indigo-200 transition-colors"
        >
          ראה דשבורד קהילתי →
        </button>
      </div>
    </div>
  );
}
