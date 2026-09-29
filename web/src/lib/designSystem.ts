/**
 * FarmShield Design System Tokens & Utility Presets
 * Source of truth: The master FarmShield dashboard.
 */

export const farmShieldTheme = {
  colors: {
    primary: 'teal-700',
    primaryHover: 'teal-800',
    primaryLight: 'teal-50',
    primaryBorder: 'teal-200',
    primaryText: 'teal-900',
    pageBg: 'bg-slate-50/50',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200/80',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
    textSubtle: 'text-slate-400',
  },
  typography: {
    pageTitle: 'text-2xl sm:text-3xl font-black text-slate-900 tracking-tight',
    sectionTitle: 'text-lg sm:text-xl font-black text-slate-900 tracking-tight',
    cardTitle: 'text-base font-black text-slate-900',
    caption: 'text-xs text-slate-500 font-medium',
    badge: 'text-[11px] font-black uppercase tracking-wider',
  },
  cards: {
    default: 'bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs',
    compact: 'bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs',
    interactive: 'bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group',
  },
  buttons: {
    primary: 'px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98',
    secondary: 'px-4 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-teal-900 border border-teal-200 font-bold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-98',
    ghost: 'px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer',
    danger: 'px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98',
  },
  inputs: {
    text: 'w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition font-medium',
    select: 'w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition font-medium cursor-pointer',
  },
  tables: {
    wrapper: 'bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden',
    table: 'w-full text-left text-xs',
    header: 'bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]',
    row: 'border-b border-slate-100 hover:bg-slate-50/60 transition-colors text-slate-700 font-medium',
  },
  tabs: {
    container: 'flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto',
    activeTab: 'px-3.5 py-1.5 rounded-xl bg-teal-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap',
    inactiveTab: 'px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs transition-all cursor-pointer whitespace-nowrap',
  },
};
