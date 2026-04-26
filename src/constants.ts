export interface Category {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

export const CATEGORIES: Category[] = [
  { id: 'drywall',   label: 'גבס',              icon: '🏗️', desc: 'קירות גבס, תקרות, מחיצות פנימיות' },
  { id: 'ac',        label: 'מיזוג אוויר',       icon: '❄️', desc: 'מיזוג ספליט, מרכזי, תעלות' },
  { id: 'outdoor',   label: 'פיתוח חוץ וגינה',   icon: '🌿', desc: 'ריצוף חוץ, גינה, דשא, מערכת השקיה' },
  { id: 'kitchen',   label: 'מטבח',              icon: '🍳', desc: 'ארונות מטבח, משטח עבודה, ריצוף' },
  { id: 'flooring',  label: 'ריצוף וחיפוי',       icon: '⬜', desc: 'אריחים, פרקט, שיש, חיפויי קירות' },
  { id: 'closets',   label: 'ארונות',             icon: '🗄️', desc: 'ארונות הלבשה, ספריות, אחסון' },
  { id: 'paint',     label: 'צבע וטייח',          icon: '🎨', desc: 'צביעת קירות ותקרות, טיח דקורטיבי' },
  { id: 'electric',  label: 'חשמל ותאורה',        icon: '💡', desc: 'נקודות תאורה, שקעים, לוח חשמל' },
  { id: 'plumbing',  label: 'אינסטלציה',          icon: '🚿', desc: 'אמבטיה, מקלחון, כיורים, ברזים' },
  { id: 'security',  label: 'אבטחה ומצלמות',      icon: '🔒', desc: 'מצלמות אבטחה, אזעקה, דלת כניסה' },
  { id: 'smarthome', label: 'בית חכם',            icon: '🏡', desc: 'תאורה חכמה, נעילה, אוטומציה' },
  { id: 'shutters',  label: 'תריסים וסוכך',        icon: '🪟', desc: 'תריסים חשמליים, סוכך, וילונות' },
  { id: 'pergola',   label: 'פרגולה ומרפסת',      icon: '🌅', desc: 'פרגולה, דק, גגון, הצללה' },
  { id: 'parking',   label: 'חניה ושערים',         icon: '🚗', desc: 'שער חניה חשמלי, ריצוף חניה' },
  { id: 'storage',   label: 'מחסן',               icon: '📦', desc: 'מדפים, דלת, ארגון מחסן' },
  { id: 'doors',     label: 'דלתות פנים',          icon: '🚪', desc: 'דלתות חדרים, ידיות, מסגרות' },
];

export const BUDGET_OPTIONS = [
  { value: '',          label: 'לא ידוע' },
  { value: 'under5k',   label: 'עד 5,000 ₪' },
  { value: '5k-15k',    label: '5,000 – 15,000 ₪' },
  { value: '15k-30k',   label: '15,000 – 30,000 ₪' },
  { value: '30k-60k',   label: '30,000 – 60,000 ₪' },
  { value: '60k-100k',  label: '60,000 – 100,000 ₪' },
  { value: 'over100k',  label: 'מעל 100,000 ₪' },
];
