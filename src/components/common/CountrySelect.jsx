import { useState, useRef } from 'react';

const COUNTRIES = [
  {code:'+93',flag:'🇦🇫',name:'Afghanistan'},{code:'+355',flag:'🇦🇱',name:'Albania'},{code:'+213',flag:'🇩🇿',name:'Algeria'},{code:'+54',flag:'🇦🇷',name:'Argentina'},{code:'+61',flag:'🇦🇺',name:'Australia'},{code:'+43',flag:'🇦🇹',name:'Austria'},{code:'+973',flag:'🇧🇭',name:'Bahrain'},{code:'+880',flag:'🇧🇩',name:'Bangladesh'},{code:'+375',flag:'🇧🇾',name:'Belarus'},{code:'+32',flag:'🇧🇪',name:'Belgium'},{code:'+55',flag:'🇧🇷',name:'Brazil'},{code:'+359',flag:'🇧🇬',name:'Bulgaria'},{code:'+1',flag:'🇨🇦',name:'Canada'},{code:'+56',flag:'🇨🇱',name:'Chile'},{code:'+86',flag:'🇨🇳',name:'China'},{code:'+57',flag:'🇨🇴',name:'Colombia'},{code:'+385',flag:'🇭🇷',name:'Croatia'},{code:'+420',flag:'🇨🇿',name:'Czechia'},{code:'+45',flag:'🇩🇰',name:'Denmark'},{code:'+20',flag:'🇪🇬',name:'Egypt'},{code:'+372',flag:'🇪🇪',name:'Estonia'},{code:'+358',flag:'🇫🇮',name:'Finland'},{code:'+33',flag:'🇫🇷',name:'France'},{code:'+49',flag:'🇩🇪',name:'Germany'},{code:'+30',flag:'🇬🇷',name:'Greece'},{code:'+36',flag:'🇭🇺',name:'Hungary'},{code:'+354',flag:'🇮🇸',name:'Iceland'},{code:'+91',flag:'🇮🇳',name:'India'},{code:'+62',flag:'🇮🇩',name:'Indonesia'},{code:'+98',flag:'🇮🇷',name:'Iran'},{code:'+964',flag:'🇮🇶',name:'Iraq'},{code:'+353',flag:'🇮🇪',name:'Ireland'},{code:'+972',flag:'🇮🇱',name:'Israel'},{code:'+39',flag:'🇮🇹',name:'Italy'},{code:'+81',flag:'🇯🇵',name:'Japan'},{code:'+962',flag:'🇯🇴',name:'Jordan'},{code:'+7',flag:'🇰🇿',name:'Kazakhstan'},{code:'+254',flag:'🇰🇪',name:'Kenya'},{code:'+965',flag:'🇰🇼',name:'Kuwait'},{code:'+371',flag:'🇱🇻',name:'Latvia'},{code:'+961',flag:'🇱🇧',name:'Lebanon'},{code:'+370',flag:'🇱🇹',name:'Lithuania'},{code:'+60',flag:'🇲🇾',name:'Malaysia'},{code:'+52',flag:'🇲🇽',name:'Mexico'},{code:'+212',flag:'🇲🇦',name:'Morocco'},{code:'+31',flag:'🇳🇱',name:'Netherlands'},{code:'+64',flag:'🇳🇿',name:'New Zealand'},{code:'+234',flag:'🇳🇬',name:'Nigeria'},{code:'+47',flag:'🇳🇴',name:'Norway'},{code:'+968',flag:'🇴🇲',name:'Oman'},{code:'+92',flag:'🇵🇰',name:'Pakistan'},{code:'+51',flag:'🇵🇪',name:'Peru'},{code:'+63',flag:'🇵🇭',name:'Philippines'},{code:'+48',flag:'🇵🇱',name:'Poland'},{code:'+351',flag:'🇵🇹',name:'Portugal'},{code:'+974',flag:'🇶🇦',name:'Qatar'},{code:'+40',flag:'🇷🇴',name:'Romania'},{code:'+7',flag:'🇷🇺',name:'Russia'},{code:'+966',flag:'🇸🇦',name:'Saudi Arabia'},{code:'+65',flag:'🇸🇬',name:'Singapore'},{code:'+421',flag:'🇸🇰',name:'Slovakia'},{code:'+27',flag:'🇿🇦',name:'South Africa'},{code:'+82',flag:'🇰🇷',name:'South Korea'},{code:'+34',flag:'🇪🇸',name:'Spain'},{code:'+94',flag:'🇱🇰',name:'Sri Lanka'},{code:'+46',flag:'🇸🇪',name:'Sweden'},{code:'+41',flag:'🇨🇭',name:'Switzerland'},{code:'+886',flag:'🇹🇼',name:'Taiwan'},{code:'+66',flag:'🇹🇭',name:'Thailand'},{code:'+216',flag:'🇹🇳',name:'Tunisia'},{code:'+90',flag:'🇹🇷',name:'Turkey'},{code:'+380',flag:'🇺🇦',name:'Ukraine'},{code:'+971',flag:'🇦🇪',name:'UAE'},{code:'+44',flag:'🇬🇧',name:'UK'},{code:'+1',flag:'🇺🇸',name:'US'},{code:'+58',flag:'🇻🇪',name:'Venezuela'},{code:'+84',flag:'🇻🇳',name:'Vietnam'},
];

export default function CountrySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [ddStyle, setDdStyle] = useState({});
  const btnRef = useRef(null);
  const selected = COUNTRIES.find(c=>c.code===value) || COUNTRIES[0];

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      if (spaceBelow < 320) {
        setDdStyle({ bottom: window.innerHeight - r.top + 4, left: r.left });
      } else {
        setDdStyle({ top: r.bottom + 4, left: r.left });
      }
    }
    setOpen(!open);
  };

  return (
    <div className="relative flex-shrink-0">
      <button ref={btnRef} type="button" onClick={handleOpen} className="flex items-center gap-1.5 py-3 pl-4 pr-2 text-sm text-[var(--text)] cursor-pointer whitespace-nowrap border-r border-[var(--border)]">
        <span>{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <svg className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${open?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={()=>setOpen(false)}/>
          <div className="fixed z-[9999] w-64 max-h-72 overflow-y-auto rounded-xl bg-[#181B24] border border-[#2a3040] shadow-2xl py-1" style={ddStyle}>
            {COUNTRIES.map(c=>(
              <button key={c.code} type="button" onClick={()=>{onChange(c.code);setOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.05] transition-colors ${c.code===value?'bg-white/[0.05] text-[#10b981] font-semibold':'text-[#cbd5e1]'}`}>
                <span className="text-base">{c.flag}</span>
                <span>{c.name}</span>
                <span className="ml-auto text-[#94a3b8] text-xs">{c.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
