// home.jsx — Buyer Home, premium polish pass
// Integrated bottom-sheet AI panel (~38% of screen), glass effect, tweakable accent.

// ── Design tokens ─────────────────────────────────────────
const DS = {
  bg:        '#0B0C0E',
  bg2:       '#0E1013',
  s1:        '#141618',
  s2:        '#1A1D20',
  s3:        '#23272B',
  border:    'rgba(255,255,255,0.06)',
  border2:   'rgba(255,255,255,0.10)',
  border3:   'rgba(255,255,255,0.14)',
  text:      '#FFFFFF',
  sub:       'rgba(255,255,255,0.58)',
  muted:     'rgba(255,255,255,0.34)',
  faint:     'rgba(255,255,255,0.18)',
  green:     '#22C55E',
};
window.DS = DS;

// Accent palette options (for tweaks)
const ACCENTS = {
  lime:    { hex:'#C8FF00', dim:'rgba(200,255,0,0.12)', dim2:'rgba(200,255,0,0.22)', deep:'#3A6400', on:'#0B0C0E', label:'Лайм' },
  mint:    { hex:'#63F0B8', dim:'rgba(99,240,184,0.12)', dim2:'rgba(99,240,184,0.22)', deep:'#1F5D42', on:'#0B0C0E', label:'Мята' },
  amber:   { hex:'#FFB547', dim:'rgba(255,181,71,0.12)', dim2:'rgba(255,181,71,0.22)', deep:'#6B4820', on:'#0B0C0E', label:'Амбер' },
  coral:   { hex:'#FF7A66', dim:'rgba(255,122,102,0.12)', dim2:'rgba(255,122,102,0.22)', deep:'#6B2E24', on:'#FFFFFF', label:'Коралл' },
};

// ── Texture placeholder (striped) ─────────────────────────
function CatPlaceholder({ tone='neutral', label, sub }) {
  // subtle warm/cool gradient bases per category, all desaturated
  const tones = {
    steel:   { a:'#2A2C30', b:'#17191C' },   // cool gray
    textile: { a:'#2B2420', b:'#17141A' },   // warm taupe
    chip:    { a:'#1D2326', b:'#14171B' },   // cool teal-gray
    pack:    { a:'#2A2218', b:'#19150F' },   // warm kraft
    tools:   { a:'#24272B', b:'#15171A' },
    brick:   { a:'#2A1F19', b:'#18120E' },
    hw:      { a:'#222528', b:'#13161A' },
  };
  const t = tones[tone] || tones.steel;
  return (
    <div style={{
      position:'absolute', inset:0,
      background:`linear-gradient(140deg, ${t.a} 0%, ${t.b} 100%)`,
      overflow:'hidden',
    }}>
      {/* diagonal stripes */}
      <div style={{
        position:'absolute', inset:0, opacity:0.35,
        backgroundImage:`repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 9px)`,
      }}/>
      {/* vignette */}
      <div style={{
        position:'absolute', inset:0,
        background:'radial-gradient(120% 80% at 100% 100%, rgba(0,0,0,0.5) 0%, transparent 60%)',
      }}/>
      {/* placeholder glyph bottom-right */}
      <div style={{
        position:'absolute', right:10, bottom:10,
        fontFamily:'"SF Mono", ui-monospace, monospace',
        fontSize:9, letterSpacing:'0.08em', color:'rgba(255,255,255,0.28)',
        textTransform:'uppercase',
      }}>{sub || 'img'}</div>
    </div>
  );
}

// ── Search Bar ────────────────────────────────────────────
function SearchBar({ accent }) {
  return (
    <div style={{
      height:50, borderRadius:14,
      background:DS.s1, border:`1px solid ${DS.border}`,
      display:'flex', alignItems:'center', gap:10, padding:'0 12px 0 16px',
      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.03)',
    }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={DS.sub} strokeWidth="1.8"/>
        <path d="M20 20l-4-4" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      <input readOnly placeholder="Поиск товаров, поставщиков и фабрик"
        style={{flex:1, background:'none', border:'none', outline:'none',
          color:DS.text, fontSize:14, fontFamily:'inherit',
          caretColor:accent.hex}}/>
      <div style={{
        width:34, height:34, borderRadius:10, background:DS.s3,
        display:'flex', alignItems:'center', justifyContent:'center',
        border:`1px solid ${DS.border}`,
      }}>
        <svg width="15" height="11" viewBox="0 0 16 12" fill="none">
          <path d="M1 1h14M3 6h10M6 11h4" stroke={DS.sub} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

// ── Filter chip row ───────────────────────────────────────
function FilterChips({ accent }) {
  const chips = [
    { label:'Все',                active:true  },
    { label:'Проверенные'                     },
    { label:'Готово к отправке'               },
    { label:'MOQ < 50'                         },
    { label:'Металл'                           },
    { label:'Текстиль'                         },
  ];
  return (
    <div style={{display:'flex', gap:7, overflowX:'auto', padding:'0 20px', WebkitMaskImage:'linear-gradient(to right, #000 85%, transparent 100%)'}}>
      {chips.map(c => (
        <div key={c.label} style={{
          height:30, borderRadius:100, padding:'0 13px', flexShrink:0,
          background: c.active ? accent.hex : DS.s1,
          border: c.active ? `1px solid transparent` : `1px solid ${DS.border}`,
          color: c.active ? accent.on : DS.sub,
          fontSize:12.5, fontWeight: c.active ? 700 : 500,
          display:'flex', alignItems:'center', whiteSpace:'nowrap',
          letterSpacing: c.active ? 0 : 0.02,
          boxShadow: c.active ? `0 0 0 3px ${accent.dim}` : 'none',
        }}>{c.label}</div>
      ))}
    </div>
  );
}

// ── Category cards ────────────────────────────────────────
const CATS = [
  { id:'metal',  label:'Металл',         sub:'384 поставщика',  tone:'steel',   size:'lg' },
  { id:'text',   label:'Текстиль',       sub:'212 поставщиков', tone:'textile', size:'lg' },
  { id:'elec',   label:'Электроника',    sub:'506 поставщиков', tone:'chip',    size:'lg' },
  { id:'pack',   label:'Упаковка',       sub:'148 поставщиков', tone:'pack',    size:'lg' },
  { id:'equip',  label:'Оборудование',   sub:'92',              tone:'tools',   size:'sm' },
  { id:'build',  label:'Стройматериалы', sub:'167',             tone:'brick',   size:'sm' },
  { id:'hw',     label:'Фурнитура',      sub:'74',              tone:'hw',      size:'sm' },
];

function CatCard({ cat, size }) {
  const h = size === 'lg' ? 118 : 96;
  return (
    <div style={{
      position:'relative', height:h, borderRadius:16, overflow:'hidden',
      border:`1px solid ${DS.border}`, cursor:'pointer',
    }}>
      <CatPlaceholder tone={cat.tone} label={cat.label} sub={cat.id}/>
      <div style={{position:'absolute', inset:0, padding:'12px 13px', display:'flex', flexDirection:'column', justifyContent:'flex-end', zIndex:2}}>
        <div style={{fontSize: size==='lg'?15:13, fontWeight:700, color:'#fff', letterSpacing:-0.2, lineHeight:1.15}}>{cat.label}</div>
        <div style={{fontSize:10.5, color:'rgba(255,255,255,0.55)', marginTop:3, fontFamily:'"SF Mono", ui-monospace, monospace', letterSpacing:0.02}}>{cat.sub}</div>
      </div>
    </div>
  );
}

// ── AI Panel (persistent bottom sheet, ~38%) ──────────────
const AI_CHIPS = [
  'Найти поставщиков металла в Китае',
  'Рассчитать доставку и налоги',
  'Сравнить предложения фабрик',
  'Найти проверенных производителей',
  'Перевести переписку',
  'Рассчитать итоговую стоимость',
];

function AIOrb({ accent }) {
  return (
    <div style={{
      width:44, height:44, borderRadius:'50%', flexShrink:0, position:'relative',
      background:`radial-gradient(circle at 35% 30%, #fff 0%, ${accent.hex} 42%, ${accent.deep} 100%)`,
      boxShadow:`0 0 22px 4px ${accent.dim2}, inset 0 0 12px rgba(255,255,255,0.25)`,
      animation:'orbPulse 3.5s ease-in-out infinite',
    }}>
      <div style={{
        position:'absolute', top:4, left:8, width:12, height:8, borderRadius:'50%',
        background:'rgba(255,255,255,0.55)', filter:'blur(3px)',
      }}/>
    </div>
  );
}

function AIPanel({ accent }) {
  return (
    <div style={{
      position:'relative', flexShrink:0,
      borderRadius:'26px 26px 0 0', overflow:'hidden',
      background:'rgba(20,22,24,0.82)',
      backdropFilter:'blur(28px) saturate(170%)',
      WebkitBackdropFilter:'blur(28px) saturate(170%)',
      borderTop:`1px solid ${DS.border3}`,
      boxShadow:`0 -12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`,
    }}>
      {/* accent glow line */}
      <div style={{
        position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
        width:'60%', height:1,
        background:`linear-gradient(90deg, transparent, ${accent.hex}, transparent)`,
        opacity:0.5,
      }}/>
      {/* drag indicator */}
      <div style={{display:'flex', justifyContent:'center', paddingTop:10, paddingBottom:8}}>
        <div style={{width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)'}}/>
      </div>

      {/* Header */}
      <div style={{padding:'2px 18px 12px', display:'flex', alignItems:'center', gap:12}}>
        <AIOrb accent={accent}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:15, fontWeight:700, color:DS.text, letterSpacing:-0.2, display:'flex', alignItems:'center', gap:7}}>
            AI-ассистент
            <span style={{
              fontSize:9, fontWeight:700, letterSpacing:'0.08em',
              color:accent.hex, background:accent.dim, border:`1px solid ${accent.dim2}`,
              borderRadius:4, padding:'2px 5px', textTransform:'uppercase',
            }}>онлайн</span>
          </div>
          <div style={{fontSize:12, color:DS.sub, marginTop:2, letterSpacing:0.01}}>
            Найдёт поставщиков, рассчитает стоимость
          </div>
        </div>
        <div style={{
          width:34, height:34, borderRadius:10,
          background:'rgba(255,255,255,0.05)', border:`1px solid ${DS.border2}`,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h10" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Prompt chips — 2 rows wrapping */}
      <div style={{padding:'0 18px 12px', display:'flex', gap:7, flexWrap:'wrap'}}>
        {AI_CHIPS.slice(0,4).map(t => (
          <div key={t} style={{
            fontSize:12, color:'rgba(255,255,255,0.78)',
            background:'rgba(255,255,255,0.04)',
            border:`1px solid ${DS.border2}`,
            borderRadius:12, padding:'7px 11px',
            letterSpacing:0.01, cursor:'pointer',
          }}>{t}</div>
        ))}
      </div>

      {/* Composer */}
      <div style={{padding:'0 18px 22px'}}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'rgba(255,255,255,0.04)',
          border:`1px solid ${DS.border3}`,
          borderRadius:15, padding:'9px 9px 9px 16px',
          boxShadow:`inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 3px ${accent.dim}`,
        }}>
          <input readOnly placeholder="Опишите товар или задачу"
            style={{flex:1, background:'none', border:'none', outline:'none',
              color:DS.text, fontSize:13.5, fontFamily:'inherit'}}/>
          {/* mic */}
          <div style={{
            width:32, height:32, borderRadius:10,
            background:'rgba(255,255,255,0.04)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg width="13" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="12" rx="3" stroke={DS.sub} strokeWidth="1.8"/>
              <path d="M5 11a7 7 0 0014 0M12 18v3" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          {/* send */}
          <div style={{
            width:38, height:38, borderRadius:12, background:accent.hex,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            boxShadow:`0 2px 12px ${accent.dim2}`,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={accent.on} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab Bar ───────────────────────────────────────────────
function TabBar({ accent, role }) {
  const buyerTabs = [
    { id:'home',    label:'Главная',   active:true,
      icon:(c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg> },
    { id:'catalog', label:'Каталог',
      icon:(c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke={c} strokeWidth="1.8"/><rect x="13" y="3" width="8" height="8" rx="2" stroke={c} strokeWidth="1.8"/><rect x="3" y="13" width="8" height="8" rx="2" stroke={c} strokeWidth="1.8"/><rect x="13" y="13" width="8" height="8" rx="2" stroke={c} strokeWidth="1.8"/></svg> },
    { id:'msgs',    label:'Сообщения',
      icon:(c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 1121 11.5z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg> },
    { id:'deals',   label:'Сделки',
      icon:(c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={c} strokeWidth="1.8"/><rect x="9" y="3" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.8"/><path d="M9 12l2 2 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id:'profile', label:'Профиль',
      icon:(c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8"/><path d="M20 21a8 8 0 00-16 0" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg> },
  ];
  const sellerTabs = [
    { id:'home',    label:'Главная',   active:true, icon:buyerTabs[0].icon },
    { id:'catalog', label:'Каталог',   icon:buyerTabs[1].icon },
    { id:'req',     label:'Запросы',
      icon:(c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><path d="M14 3v6h6M8 13h8M8 17h5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg> },
    { id:'deals',   label:'Сделки',   icon:buyerTabs[3].icon },
    { id:'profile', label:'Профиль',  icon:buyerTabs[4].icon },
  ];
  const tabs = role === 'seller' ? sellerTabs : buyerTabs;
  return (
    <div style={{
      flexShrink:0, paddingTop:8, paddingBottom:24,
      background:'rgba(11,12,14,0.85)',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      borderTop:`1px solid ${DS.border}`,
      display:'flex',
    }}>
      {tabs.map(t => {
        const c = t.active ? accent.hex : DS.muted;
        return (
          <div key={t.id} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', position:'relative'}}>
            <div style={{color:c, display:'flex'}}>{t.icon(c)}</div>
            <div style={{fontSize:10, color:c, fontWeight: t.active?700:500, letterSpacing:0.02}}>{t.label}</div>
            {t.active && <div style={{position:'absolute', top:-8, width:22, height:3, borderRadius:2, background:accent.hex}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ── Header (greeting + actions) ───────────────────────────
function Header({ accent, role }) {
  return (
    <div style={{padding:'8px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{
          width:38, height:38, borderRadius:12,
          background:`linear-gradient(135deg, ${accent.hex} 0%, ${accent.deep} 100%)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, fontWeight:800, color:accent.on, letterSpacing:-0.3,
          boxShadow:`0 4px 14px ${accent.dim2}`,
        }}>ИВ</div>
        <div>
          <div style={{fontSize:10, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:600}}>
            {role === 'seller' ? 'Продавец' : 'Покупатель'} · RU
          </div>
          <div style={{fontSize:15, fontWeight:700, color:DS.text, letterSpacing:-0.2, marginTop:1}}>Иван Волков</div>
        </div>
      </div>
      <div style={{display:'flex', gap:8}}>
        <div style={{
          height:38, borderRadius:12, padding:'0 12px',
          background:DS.s1, border:`1px solid ${DS.border}`,
          display:'flex', alignItems:'center', gap:6,
        }}>
          <div style={{width:7, height:7, borderRadius:'50%', background:accent.hex, boxShadow:`0 0 8px ${accent.hex}`}}/>
          <span style={{fontSize:11, color:DS.sub, fontFamily:'"SF Mono", ui-monospace, monospace'}}>₽ 92.4</span>
        </div>
        <div style={{
          width:38, height:38, borderRadius:12,
          background:DS.s1, border:`1px solid ${DS.border}`,
          display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <div style={{position:'absolute', top:9, right:9, width:7, height:7, borderRadius:'50%', background:accent.hex, border:`1.5px solid ${DS.bg}`}}/>
        </div>
      </div>
    </div>
  );
}

// ── Main: Buyer Home Screen ───────────────────────────────
function BuyerHome({ accent, role }) {
  return (
    <div style={{
      height:'100%', width:'100%',
      display:'flex', flexDirection:'column',
      background:`radial-gradient(120% 70% at 50% 0%, ${DS.bg2} 0%, ${DS.bg} 60%)`,
      paddingTop:58, overflow:'hidden',
    }}>
      <Header accent={accent} role={role}/>

      {/* greeting line */}
      <div style={{padding:'14px 20px 12px', flexShrink:0}}>
        <div style={{fontSize:22, fontWeight:800, color:DS.text, letterSpacing:-0.6, lineHeight:1.15}}>
          Добрый день, Иван
        </div>
        <div style={{fontSize:13, color:DS.sub, marginTop:3, letterSpacing:0.01}}>
          Что закупаем сегодня? <span style={{color:accent.hex, fontWeight:600}}>Китай → Россия</span>
        </div>
      </div>

      <div style={{padding:'0 20px', flexShrink:0}}>
        <SearchBar accent={accent}/>
      </div>

      <div style={{padding:'12px 0 0', flexShrink:0}}>
        <FilterChips accent={accent}/>
      </div>

      {/* categories */}
      <div style={{padding:'14px 20px 0', flexShrink:0, flex:1, overflowY:'auto', overflowX:'hidden', minHeight:0, WebkitMaskImage:'linear-gradient(to bottom, #000 90%, transparent 100%)'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:9}}>
          {CATS.filter(c => c.size==='lg').map(c => <CatCard key={c.id} cat={c} size="lg"/>)}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:9}}>
          {CATS.filter(c => c.size==='sm').map(c => <CatCard key={c.id} cat={c} size="sm"/>)}
        </div>
        <div style={{height:12}}/>
      </div>

      <AIPanel accent={accent}/>
      <TabBar accent={accent} role={role}/>
    </div>
  );
}

window.BuyerHome = BuyerHome;
window.ACCENTS = ACCENTS;
