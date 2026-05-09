// TradeAI v2 — shared design system (dark, accent-tweakable)

const DS = {
  bg:      '#0B0C0E',
  bg2:     '#0E1013',
  s0:      '#101114',
  s1:      '#141618',
  s2:      '#1A1D20',
  s3:      '#23272B',
  border:  'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.10)',
  border3: 'rgba(255,255,255,0.14)',
  text:    '#FFFFFF',
  sub:     'rgba(255,255,255,0.60)',
  muted:   'rgba(255,255,255,0.36)',
  faint:   'rgba(255,255,255,0.18)',
  green:   '#22C55E',
  red:     '#F87171',
  warn:    '#FBBF24',
};
window.DS = DS;

// Accent palette
const ACCENTS = {
  lime:    { hex:'#C8FF00', dim:'rgba(200,255,0,0.12)', dim2:'rgba(200,255,0,0.22)', deep:'#3A6400', on:'#0B0C0E', label:'Лайм' },
  mint:    { hex:'#63F0B8', dim:'rgba(99,240,184,0.12)', dim2:'rgba(99,240,184,0.22)', deep:'#1F5D42', on:'#0B0C0E', label:'Мята' },
  amber:   { hex:'#FFB547', dim:'rgba(255,181,71,0.12)', dim2:'rgba(255,181,71,0.22)', deep:'#6B4820', on:'#0B0C0E', label:'Амбер' },
  coral:   { hex:'#FF7A66', dim:'rgba(255,122,102,0.12)', dim2:'rgba(255,122,102,0.22)', deep:'#6B2E24', on:'#FFFFFF', label:'Коралл' },
};
window.ACCENTS = ACCENTS;

// ── Utility: Tag ──────────────────────────────────────────
function Tag({children, tone='neutral', style={}}) {
  const tones = {
    neutral: { bg:'rgba(255,255,255,0.05)', color:DS.sub, bd:'rgba(255,255,255,0.08)' },
    muted:   { bg:'rgba(255,255,255,0.03)', color:DS.muted, bd:'rgba(255,255,255,0.06)' },
    green:   { bg:'rgba(34,197,94,0.10)', color:DS.green, bd:'rgba(34,197,94,0.22)' },
    red:     { bg:'rgba(248,113,113,0.10)', color:DS.red, bd:'rgba(248,113,113,0.22)' },
    warn:    { bg:'rgba(251,191,36,0.10)', color:DS.warn, bd:'rgba(251,191,36,0.22)' },
    accent:  { bg:'var(--accentDim)', color:'var(--accent)', bd:'var(--accentDim2)' },
  };
  const t = tones[tone] || tones.neutral;
  return <span style={{
    fontSize:10.5, fontWeight:700, color:t.color, background:t.bg,
    border:`1px solid ${t.bd}`, borderRadius:5, padding:'2.5px 7px',
    letterSpacing:'0.04em', textTransform:'uppercase', whiteSpace:'nowrap', ...style,
  }}>{children}</span>;
}
window.Tag = Tag;

// Verified badge
function VBadge() {
  return <Tag tone="green">✓ Верифицирован</Tag>;
}
window.VBadge = VBadge;

// ── BackBtn ────────────────────────────────────────────────
function BackBtn({ onPress }) {
  return (
    <div onClick={onPress} style={{
      width:38, height:38, borderRadius:12,
      background:DS.s1, border:`1px solid ${DS.border}`,
      display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0,
    }}>
      <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
        <path d="M7.5 1.5L2 7.5l5.5 6" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
window.BackBtn = BackBtn;

// ── Buttons ────────────────────────────────────────────────
function PrimaryBtn({ children, onPress, icon, style={}, small }) {
  return (
    <div onClick={onPress} style={{
      height: small?42:52, borderRadius:14,
      background:'var(--accent)', color:'var(--accentOn)',
      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      fontSize: small?13:14.5, fontWeight:700, letterSpacing:-0.1,
      padding:'0 20px', cursor:'pointer',
      boxShadow:'0 2px 14px var(--accentDim2)',
      ...style,
    }}>
      {icon && <span style={{display:'flex'}}>{icon}</span>}
      {children}
    </div>
  );
}
window.PrimaryBtn = PrimaryBtn;

function SecondaryBtn({ children, onPress, icon, style={}, small }) {
  return (
    <div onClick={onPress} style={{
      height: small?42:52, borderRadius:14,
      background:DS.s1, border:`1px solid ${DS.border2}`, color:DS.text,
      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      fontSize: small?13:14.5, fontWeight:600, letterSpacing:-0.1,
      padding:'0 20px', cursor:'pointer',
      ...style,
    }}>
      {icon && <span style={{display:'flex'}}>{icon}</span>}
      {children}
    </div>
  );
}
window.SecondaryBtn = SecondaryBtn;

// ── SearchBar ──────────────────────────────────────────────
function SearchBar({ placeholder='Поиск товаров, поставщиков и фабрик', value, onChange, onFilter, showFilter=true, autoFocus }) {
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
      <input value={value||''} onChange={onChange||(()=>{})} readOnly={!onChange} autoFocus={autoFocus} placeholder={placeholder}
        style={{flex:1, background:'none', border:'none', outline:'none',
          color:DS.text, fontSize:14, fontFamily:'inherit',
          caretColor:'var(--accent)'}}/>
      {showFilter && (
        <div onClick={onFilter} style={{
          width:34, height:34, borderRadius:10, background:DS.s3,
          display:'flex', alignItems:'center', justifyContent:'center',
          border:`1px solid ${DS.border}`, cursor:'pointer',
        }}>
          <svg width="15" height="11" viewBox="0 0 16 12" fill="none">
            <path d="M1 1h14M3 6h10M6 11h4" stroke={DS.sub} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}
window.SearchBar = SearchBar;

// ── FilterChip ─────────────────────────────────────────────
function FilterChip({ label, active, onPress }) {
  return (
    <div onClick={onPress} style={{
      height:30, borderRadius:100, padding:'0 13px', flexShrink:0,
      background: active ? 'var(--accent)' : DS.s1,
      border: active ? `1px solid transparent` : `1px solid ${DS.border}`,
      color: active ? 'var(--accentOn)' : DS.sub,
      fontSize:12.5, fontWeight: active ? 700 : 500,
      display:'flex', alignItems:'center', whiteSpace:'nowrap', cursor:'pointer',
      boxShadow: active ? `0 0 0 3px var(--accentDim)` : 'none',
    }}>{label}</div>
  );
}
window.FilterChip = FilterChip;

// ── Segmented control ─────────────────────────────────────
function Segmented({ items, active, onChange }) {
  return (
    <div style={{display:'flex', background:DS.s1, borderRadius:12, padding:4, border:`1px solid ${DS.border}`}}>
      {items.map(it => {
        const on = active === it.id;
        return (
          <div key={it.id} onClick={()=>onChange(it.id)} style={{
            flex:1, height:36, borderRadius:9,
            background: on ? DS.s3 : 'transparent',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', fontSize:13.5,
            fontWeight: on ? 700 : 500,
            color: on ? DS.text : DS.sub,
            transition:'background .15s',
            letterSpacing:-0.1,
          }}>{it.label}</div>
        );
      })}
    </div>
  );
}
window.Segmented = Segmented;

// ── Section header ─────────────────────────────────────────
function SectionHeader({ title, action, onAction, style={} }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, ...style}}>
      <div style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.2, textTransform:'uppercase', letterSpacing:'0.05em'}}>{title}</div>
      {action && <div onClick={onAction} style={{fontSize:12, color:'var(--accent)', fontWeight:600, cursor:'pointer'}}>{action}</div>}
    </div>
  );
}
window.SectionHeader = SectionHeader;

// ── AI orb ─────────────────────────────────────────────────
function AIOrb({ size=44 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0, position:'relative',
      background:`radial-gradient(circle at 35% 30%, #fff 0%, var(--accent) 42%, var(--accentDeep) 100%)`,
      boxShadow:`0 0 ${size/2}px ${size/8}px var(--accentDim2), inset 0 0 ${size/3}px rgba(255,255,255,0.25)`,
      animation:'orbPulse 3.5s ease-in-out infinite',
    }}>
      <div style={{
        position:'absolute', top:size*0.1, left:size*0.2,
        width:size*0.3, height:size*0.2, borderRadius:'50%',
        background:'rgba(255,255,255,0.55)', filter:'blur(3px)',
      }}/>
    </div>
  );
}
window.AIOrb = AIOrb;

// ── Category placeholder tile ──────────────────────────────
function CatImg({ tone='steel', sub }) {
  const tones = {
    steel:   { a:'#2A2C30', b:'#17191C' },
    textile: { a:'#2B2420', b:'#17141A' },
    chip:    { a:'#1D2326', b:'#14171B' },
    pack:    { a:'#2A2218', b:'#19150F' },
    tools:   { a:'#24272B', b:'#15171A' },
    brick:   { a:'#2A1F19', b:'#18120E' },
    hw:      { a:'#222528', b:'#13161A' },
    plastic: { a:'#1B2228', b:'#131820' },
  };
  const t = tones[tone] || tones.steel;
  return (
    <div style={{position:'absolute', inset:0, background:`linear-gradient(140deg, ${t.a} 0%, ${t.b} 100%)`, overflow:'hidden'}}>
      <div style={{position:'absolute', inset:0, opacity:0.35,
        backgroundImage:`repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 9px)`}}/>
      <div style={{position:'absolute', inset:0,
        background:'radial-gradient(120% 80% at 100% 100%, rgba(0,0,0,0.5) 0%, transparent 60%)'}}/>
      {sub && <div style={{
        position:'absolute', right:10, bottom:10,
        fontFamily:'"SF Mono", ui-monospace, monospace',
        fontSize:9, letterSpacing:'0.08em', color:'rgba(255,255,255,0.28)',
        textTransform:'uppercase',
      }}>{sub}</div>}
    </div>
  );
}
window.CatImg = CatImg;

// ── TabBar ─────────────────────────────────────────────────
function TabBar({ role='buyer', active='home', onTab }) {
  const icons = {
    home:    (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    catalog: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke={c} strokeWidth="1.8"/><rect x="13" y="3" width="8" height="8" rx="2" stroke={c} strokeWidth="1.8"/><rect x="3" y="13" width="8" height="8" rx="2" stroke={c} strokeWidth="1.8"/><rect x="13" y="13" width="8" height="8" rx="2" stroke={c} strokeWidth="1.8"/></svg>,
    msgs:    (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 1121 11.5z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    deals:   (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={c} strokeWidth="1.8"/><rect x="9" y="3" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.8"/><path d="M9 12l2 2 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    profile: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8"/><path d="M20 21a8 8 0 00-16 0" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    req:     (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><path d="M14 3v6h6M8 13h8M8 17h5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  };
  const buyer = [
    {id:'home',label:'Главная'}, {id:'catalog',label:'Каталог'},
    {id:'msgs',label:'Сообщения'}, {id:'deals',label:'Сделки'},
    {id:'profile',label:'Профиль'},
  ];
  const seller = [
    {id:'home',label:'Главная'}, {id:'catalog',label:'Каталог'},
    {id:'req',label:'Запросы'}, {id:'deals',label:'Сделки'},
    {id:'profile',label:'Профиль'},
  ];
  const tabs = role === 'seller' ? seller : buyer;
  return (
    <div style={{
      flexShrink:0, paddingTop:8, paddingBottom:24,
      background:'rgba(11,12,14,0.85)',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      borderTop:`1px solid ${DS.border}`,
      display:'flex', position:'relative', zIndex:5,
    }}>
      {tabs.map(t => {
        const on = active === t.id;
        const c = on ? 'var(--accent)' : DS.muted;
        return (
          <div key={t.id} onClick={()=>onTab && onTab(t.id)} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', position:'relative'}}>
            <div style={{color:c, display:'flex'}}>{icons[t.id](c)}</div>
            <div style={{fontSize:10, color:c, fontWeight: on?700:500, letterSpacing:0.02}}>{t.label}</div>
            {on && <div style={{position:'absolute', top:-8, width:22, height:3, borderRadius:2, background:'var(--accent)'}}/>}
          </div>
        );
      })}
    </div>
  );
}
window.TabBar = TabBar;

// ── Data ───────────────────────────────────────────────────
const SUPPLIERS = [
  { id:1, name:'Shenzhen TechParts', cat:'Электроника', moq:'МЗ 500 ед.', score:98, country:'CN', rating:4.9, orders:1240, lead:'15–20 дн.', price:'$4.20/ед.', tone:'chip' },
  { id:2, name:'Jiangsu Textile',    cat:'Текстиль',    moq:'МЗ 200 ед.', score:96, country:'CN', rating:4.8, orders:890,  lead:'20–30 дн.', price:'$1.80/м',  tone:'textile' },
  { id:3, name:'Vietnam Steel Co.',  cat:'Металлы',     moq:'МЗ 1 т',     score:94, country:'VN', rating:4.7, orders:560,  lead:'25–35 дн.', price:'$680/т',   tone:'steel' },
  { id:4, name:'Guangdong Plastics', cat:'Пластик',     moq:'МЗ 300 кг',  score:92, country:'CN', rating:4.6, orders:430,  lead:'10–15 дн.', price:'$2.50/кг', tone:'plastic' },
  { id:5, name:'Mumbai Packaging',   cat:'Упаковка',    moq:'МЗ 1000 ед.',score:91, country:'IN', rating:4.5, orders:380,  lead:'18–25 дн.', price:'$0.12/ед.',tone:'pack' },
];
const PRODUCTS = [
  { id:1, name:'Нержавеющая сталь 316L',  cat:'Металлы',     supplier:'Vietnam Steel Co.',  country:'VN', moq:'1 т',    price:'$680/т',   tone:'steel',   sub:'astm-a240' },
  { id:2, name:'Хлопок 100%, 200 г/м²',   cat:'Текстиль',    supplier:'Jiangsu Textile',    country:'CN', moq:'200 м',  price:'$1.80/м',  tone:'textile', sub:'oeko-tex' },
  { id:3, name:'PCB контроллер v3',       cat:'Электроника', supplier:'Shenzhen TechParts', country:'CN', moq:'500 ед.',price:'$4.20/ед.',tone:'chip',    sub:'ce iso' },
  { id:4, name:'HDPE гранулят',           cat:'Пластик',     supplier:'Guangdong Plastics', country:'CN', moq:'300 кг', price:'$2.50/кг', tone:'plastic', sub:'food-grade' },
];
window.SUPPLIERS = SUPPLIERS;
window.PRODUCTS = PRODUCTS;
