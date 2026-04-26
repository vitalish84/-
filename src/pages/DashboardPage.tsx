import { useState, useEffect } from 'react';
import { Users, TrendingUp, Package, Phone, Building2, Home, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { CATEGORIES } from '../constants';
import type { CategoryData, DashboardEntry, Homeowner } from '../types';

interface Props {
  currentUser: Homeowner;
  onGoToQuestionnaire: () => void;
}

function percent(n: number, total: number) {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

export default function DashboardPage({ currentUser, onGoToQuestionnaire }: Props) {
  const [data, setData] = useState<DashboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedHomeowner, setExpandedHomeowner] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.getDashboard()
      .then(setData)
      .catch(() => setError('לא ניתן לטעון את הנתונים'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="text-gray-400 text-lg">טוען דשבורד...</div>
      </div>
    );
  }

  const filledCount = data.filter(e => e.requirements !== null).length;

  // Per-category stats
  const catStats = CATEGORIES.map(cat => {
    const yesEntries = data.filter(e => e.requirements?.categories[cat.id]?.needed === 'yes');
    const maybeEntries = data.filter(e => e.requirements?.categories[cat.id]?.needed === 'maybe');
    const groupEntries = data.filter(e =>
      e.requirements?.categories[cat.id]?.needed === 'yes' &&
      e.requirements?.categories[cat.id]?.joinGroup === true
    );
    const quotesCount = data.reduce((acc, e) => {
      return acc + (e.requirements?.categories[cat.id]?.quotes?.length ?? 0);
    }, 0);

    return {
      ...cat,
      yesCount: yesEntries.length,
      maybeCount: maybeEntries.length,
      groupCount: groupEntries.length,
      groupEntries,
      quotesCount,
    };
  });

  // Shared projects: categories with 2+ people wanting to join
  const sharedProjects = catStats
    .filter(c => c.groupCount >= 2)
    .sort((a, b) => b.groupCount - a.groupCount);

  // All with interest (yes or maybe), sorted by most interest
  const popularCategories = catStats
    .filter(c => c.yesCount + c.maybeCount > 0)
    .sort((a, b) => (b.yesCount + b.maybeCount) - (a.yesCount + a.maybeCount));

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12" dir="rtl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'דיירים רשומים', value: data.length, icon: <Users className="w-5 h-5" />, color: 'blue' },
          { label: 'מילאו שאלון', value: filledCount, icon: <Package className="w-5 h-5" />, color: 'green' },
          { label: 'פרויקטים משותפים', value: sharedProjects.length, icon: <TrendingUp className="w-5 h-5" />, color: 'orange' },
          { label: 'קטגוריות פעילות', value: popularCategories.length, icon: <Package className="w-5 h-5" />, color: 'purple' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2 ${
              s.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              s.color === 'green' ? 'bg-green-100 text-green-600' :
              s.color === 'orange' ? 'bg-orange-100 text-orange-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Shared Projects */}
      {sharedProjects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            פרויקטים משותפים פוטנציאליים
            <span className="text-sm bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {sharedProjects.length}
            </span>
          </h2>
          <div className="space-y-3">
            {sharedProjects.map(cat => (
              <div key={cat.id} className="bg-orange-50 rounded-2xl border border-orange-200 overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-right"
                  onClick={() => setExpandedGroup(expandedGroup === cat.id ? null : cat.id)}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{cat.label}</div>
                    <div className="text-xs text-orange-600">
                      {cat.groupCount} דיירים מעוניינים בפרויקט קבוצתי
                      {cat.yesCount > cat.groupCount && ` · ${cat.yesCount} בסך הכל צריכים`}
                      {cat.quotesCount > 0 && ` · ${cat.quotesCount} הצעות מחיר`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {cat.groupEntries.slice(0, 3).map(e => (
                        <div key={e.id} className="w-7 h-7 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                          {e.name.charAt(0)}
                        </div>
                      ))}
                      {cat.groupCount > 3 && (
                        <div className="w-7 h-7 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center text-orange-700 text-xs font-bold">
                          +{cat.groupCount - 3}
                        </div>
                      )}
                    </div>
                    {expandedGroup === cat.id ? <ChevronUp className="w-4 h-4 text-orange-500" /> : <ChevronDown className="w-4 h-4 text-orange-500" />}
                  </div>
                </button>

                {expandedGroup === cat.id && (
                  <div className="px-4 pb-4 border-t border-orange-200 pt-3">
                    <div className="space-y-2 mb-3">
                      {cat.groupEntries.map(e => {
                        const catData = e.requirements?.categories[cat.id];
                        return (
                          <div key={e.id} className="bg-white rounded-xl p-3 border border-orange-100">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-sm font-bold">
                                {e.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900">{e.name}</span>
                                <span className="text-gray-400 text-sm"> · דירה {e.apartment}{e.building ? ` בניין ${e.building}` : ''}</span>
                              </div>
                              {e.phone && (
                                <a href={`tel:${e.phone}`} className="mr-auto flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                                  <Phone className="w-3.5 h-3.5" /> {e.phone}
                                </a>
                              )}
                            </div>
                            {catData?.description && (
                              <p className="text-sm text-gray-600 mr-10">{catData.description}</p>
                            )}
                            {catData?.quotes && catData.quotes.length > 0 && (
                              <div className="mt-2 mr-10">
                                <div className="text-xs text-gray-500 font-medium mb-1">הצעות מחיר:</div>
                                {catData.quotes.map(q => (
                                  <div key={q.id} className="text-xs text-gray-700 bg-gray-50 rounded-lg px-2 py-1 mb-1">
                                    <span className="font-medium">{q.contractor}</span>
                                    {q.price && <span className="text-green-700 mr-2">{q.price}</span>}
                                    {q.notes && <span className="text-gray-500 mr-2">– {q.notes}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Overview */}
      {popularCategories.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            סקירת קטגוריות
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {popularCategories.map((cat, i) => (
              <div key={cat.id} className={`flex items-center gap-3 px-4 py-3 ${i < popularCategories.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-xl w-7 text-center">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{cat.label}</span>
                    <div className="flex gap-2 text-xs">
                      {cat.yesCount > 0 && <span className="text-green-600 font-medium">{cat.yesCount} כן</span>}
                      {cat.maybeCount > 0 && <span className="text-yellow-600 font-medium">{cat.maybeCount} אולי</span>}
                      {cat.groupCount >= 2 && <span className="text-orange-600 font-medium">🤝 {cat.groupCount} קבוצתי</span>}
                      {cat.quotesCount > 0 && <span className="text-indigo-600 font-medium">📋 {cat.quotesCount} הצעות</span>}
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${percent(cat.yesCount, data.length)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Homeowners */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            כל הדיירים ({data.length})
          </h2>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            <RefreshCw className="w-4 h-4" /> רענן
          </button>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3">🏘️</div>
            <p>אין דיירים רשומים עדיין</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map(entry => {
              const isMe = entry.id === currentUser.id;
              const reqs = entry.requirements;
              const cats = reqs ? (Object.values(reqs.categories) as CategoryData[]) : [];
              const filledCats = cats.filter(c => c.needed).length;
              const yesCats = cats.filter(c => c.needed === 'yes').length;
              const groupCats = cats.filter(c => c.needed === 'yes' && c.joinGroup).length;
              const isExpanded = expandedHomeowner === entry.id;

              return (
                <div key={entry.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${isMe ? 'border-blue-300 shadow-sm' : 'border-gray-200'}`}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-right"
                    onClick={() => setExpandedHomeowner(isExpanded ? null : entry.id)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {entry.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{entry.name}</span>
                        {isMe && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 rounded-full">אני</span>}
                      </div>
                      <div className="text-sm text-gray-500 flex gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Home className="w-3 h-3" /> דירה {entry.apartment}
                        </span>
                        {entry.building && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> בניין {entry.building}
                          </span>
                        )}
                        {entry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {entry.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {reqs ? (
                        <>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{yesCats} נדרשות</span>
                          {groupCats > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">🤝 {groupCats}</span>}
                        </>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">לא מולא</span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && reqs && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <div className="text-xs text-gray-500 mb-2">{filledCats} / {CATEGORIES.length} קטגוריות מולאו</div>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.filter(c => reqs.categories[c.id]?.needed === 'yes').map(c => (
                          <span key={c.id} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {c.icon} {c.label}
                            {reqs.categories[c.id]?.joinGroup && <span className="text-orange-500">🤝</span>}
                          </span>
                        ))}
                        {CATEGORIES.filter(c => reqs.categories[c.id]?.needed === 'maybe').map(c => (
                          <span key={c.id} className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {c.icon} {c.label}?
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && !reqs && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <p className="text-sm text-gray-400">דייר זה טרם מילא את השאלון</p>
                      {isMe && (
                        <button
                          onClick={onGoToQuestionnaire}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          מלא/י את השאלון שלי →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
