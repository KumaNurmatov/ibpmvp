// TradeAI Design System — shared tokens + atoms
// Dark graphite + lime accent (#C8FF00) — NO blue/purple

const DS = {
  bg:      '#0d0e10',
  s1:      '#141618',  // card surface
  s2:      '#1c1f23',  // elevated / input
  s3:      '#242729',  // pill bg
  border:  'rgba(255,255,255,0.08)',
  border2: 'rgba(255,255,255,0.13)',
  lime:    '#C8FF00',
  limeDim: 'rgba(200,255,0,0.12)',
  limeDim2:'rgba(200,255,0,0.2)',
  text:    '#FFFFFF',
  sub:     'rgba(255,255,255,0.52)',
  muted:   'rgba(255,255,255,0.28)',
  green:   '#22c55e',
  red:     '#f87171',
  warn:    '#fbbf24',
};
window.DS = DS;

// ── Icon helpers (inline SVG) ──────────────────────────────
function Icon({d,w=20,h=20,stroke='currentColor',fill='none',strokeWidth=1.8,style={}}) {
  return (
    <svg width={w} height={h} viewBox={`0 0 24 24`} fill={fill} style={style}>
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
window.Icon = Icon;

// ── Atom: Tag ─────────────────────────────────────────────
function Tag({children, lime, green, red, muted, style={}}) {
  let bg = 'rgba(255,255,255,0.07)', color = DS.sub;
  if (lime)  { bg = DS.limeDim2;  color = DS.lime; }
  if (green) { bg = 'rgba(34,197,94,0.12)';  color = DS.green; }
  if (red)   { bg = 'rgba(248,113,113,0.12)'; color = DS.red; }
  if (muted) { bg = 'rgba(255,255,255,0.05)'; color = DS.muted; }
  return (
    <span style={{ fontSize:11, fontWeight:600, color, background:bg, borderRadius:6, padding:'2px 8px', whiteSpace:'nowrap', letterSpacing:.02, ...style }}>
      {children}
    </span>
  );
}
window.Tag = Tag;

// ── Atom: VerifiedBadge ────────────────────────────────────
function VBadge({small}) {
  return <Tag green style={{fontSize: small?9:11}}>✓ Верифицирован</Tag>;
}
window.VBadge = VBadge;

// ── Atom: Divider ─────────────────────────────────────────
function Divider({my=12}) {
  return <div style={{height:1, background:DS.border, margin:`${my}px 0`}}/>;
}
window.Divider = Divider;

// ── Atom: BackBtn ─────────────────────────────────────────
function BackBtn({onPress}) {
  return (
    <div onClick={onPress} style={{width:36,height:36,borderRadius:12,background:DS.s1,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
      <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
        <path d="M7.5 1.5L2 7.5l5.5 6" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
window.BackBtn = BackBtn;

// ── Atom: LimeBtn ─────────────────────────────────────────
function LimeBtn({children, onPress, small, outline, dark, icon, style={}}) {
  if (outline) return (
    <div onClick={onPress} style={{height: small?40:50, borderRadius:14, border:`1.5px solid ${DS.lime}`, display:'flex',alignItems:'center',justifyContent:'center',gap:8, cursor:'pointer', color:DS.lime, fontSize:small?13:15, fontWeight:700, padding:'0 20px', ...style}}>
      {icon&&<span>{icon}</span>}{children}
    </div>
  );
  if (dark) return (
    <div onClick={onPress} style={{height: small?40:50, borderRadius:14, background:DS.s2, border:`1px solid ${DS.border}`, display:'flex',alignItems:'center',justifyContent:'center',gap:8, cursor:'pointer', color:DS.text, fontSize:small?13:15, fontWeight:600, padding:'0 20px', ...style}}>
      {icon&&<span>{icon}</span>}{children}
    </div>
  );
  return (
    <div onClick={onPress} style={{height: small?40:50, borderRadius:14, background:DS.lime, display:'flex',alignItems:'center',justifyContent:'center',gap:8, cursor:'pointer', color:'#0d0e10', fontSize:small?13:15, fontWeight:800, padding:'0 20px', ...style}}>
      {icon&&<span>{icon}</span>}{children}
    </div>
  );
}
window.LimeBtn = LimeBtn;

// ── Atom: Input ───────────────────────────────────────────
function Input({placeholder, value, onChange, label, type='text', style={}}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6,...style}}>
      {label && <div style={{fontSize:12,color:DS.sub,fontWeight:500}}>{label}</div>}
      <div style={{height:50,borderRadius:14,background:DS.s2,border:`1px solid ${DS.border2}`,display:'flex',alignItems:'center',padding:'0 16px'}}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{flex:1,background:'none',border:'none',outline:'none',color:DS.text,fontSize:15,fontFamily:'inherit'}}/>
      </div>
    </div>
  );
}
window.Input = Input;

// ── Atom: SearchBar ───────────────────────────────────────
function SearchBar({placeholder='Поиск товаров, поставщиков и фабрик', value, onChange, onFilter}) {
  return (
    <div style={{height:48,borderRadius:16,background:DS.s2,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',gap:10,padding:'0 14px'}}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke={DS.muted} strokeWidth="1.8"/>
        <path d="M21 21l-4.35-4.35" stroke={DS.muted} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      <input value={value||''} onChange={onChange||undefined} placeholder={placeholder}
        style={{flex:1,background:'none',border:'none',outline:'none',color:DS.text,fontSize:14,fontFamily:'inherit'}}/>
      {onFilter && (
        <div onClick={onFilter} style={{width:32,height:32,borderRadius:10,background:DS.s3,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M1 1h14M3 6h10M6 11h4" stroke={DS.sub} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}
window.SearchBar = SearchBar;

// ── Atom: FilterChip ──────────────────────────────────────
function FilterChip({label, active, onPress}) {
  return (
    <div onClick={onPress} style={{height:32,borderRadius:100,padding:'0 14px',flexShrink:0,background:active?DS.lime:DS.s2,border:`1px solid ${active?'transparent':DS.border}`,color:active?'#0d0e10':DS.sub,fontSize:13,fontWeight:active?700:400,display:'flex',alignItems:'center',whiteSpace:'nowrap',cursor:'pointer',transition:'all .15s'}}>
      {label}
    </div>
  );
}
window.FilterChip = FilterChip;

// ── Atom: SectionHeader ───────────────────────────────────
function SectionHeader({title, action, onAction}) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <div style={{fontSize:15,fontWeight:700,color:DS.text,letterSpacing:-.3}}>{title}</div>
      {action && <div onClick={onAction} style={{fontSize:12,color:DS.lime,fontWeight:600,cursor:'pointer'}}>{action}</div>}
    </div>
  );
}
window.SectionHeader = SectionHeader;

// ── Atom: StatCard ────────────────────────────────────────
function StatCard({label, value, lime, change}) {
  return (
    <div style={{flex:1,background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:14,padding:'13px 14px'}}>
      <div style={{fontSize:11,color:DS.muted,marginBottom:6,fontWeight:500}}>{label}</div>
      <div style={{fontSize:20,fontWeight:800,color:lime?DS.lime:DS.text,letterSpacing:-.5}}>{value}</div>
      {change && <div style={{fontSize:11,color:DS.green,marginTop:4,fontWeight:600}}>{change}</div>}
    </div>
  );
}
window.StatCard = StatCard;

// ── Atom: SupplierCard (list row) ─────────────────────────
function SupplierCard({s, onPress, accent}) {
  const catIcon = {
    'Электроника':'⚡','Текстиль':'🧵','Металлы':'⚙️','Пластик':'🔩',
    'Химикаты':'🧪','Мебель':'🪑','Продукты':'🌾','Упаковка':'📦','Оборудование':'⚙️','Стройматериалы':'🧱'
  };
  return (
    <div onClick={onPress} style={{borderRadius:16,background:DS.s1,border:`1px solid ${DS.border}`,padding:'14px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
      <div style={{width:46,height:46,borderRadius:14,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
        {catIcon[s.cat]||'🏭'}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,color:DS.text,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.country} {s.name}</div>
        <div style={{fontSize:12,color:DS.sub,marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.cat} · {s.price}</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          <VBadge small/><Tag muted>{s.moq}</Tag>
        </div>
      </div>
      <div style={{fontSize:14,fontWeight:800,color:DS.lime,flexShrink:0,marginLeft:4}}>{s.score}%</div>
    </div>
  );
}
window.SupplierCard = SupplierCard;

// ── Atom: TypingDots ──────────────────────────────────────
function TypingDots() {
  return (
    <div style={{display:'flex',gap:4,alignItems:'center',padding:'2px 0'}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:6,height:6,borderRadius:'50%',background:DS.sub,
          animation:`tdot 1.2s ease-in-out infinite`,animationDelay:`${i*.2}s`}}/>
      ))}
    </div>
  );
}
window.TypingDots = TypingDots;

// ── Atom: LimeOrb (AI) ────────────────────────────────────
function LimeOrb({size=44}) {
  return (
    <div style={{width:size,height:size,borderRadius:'50%',flexShrink:0,
      background:`radial-gradient(circle at 35% 35%, #fff 0%, ${DS.lime} 45%, #3a6400 100%)`,
      boxShadow:`0 0 16px 5px rgba(200,255,0,0.3)`,
      animation:'orbPulse 3s ease-in-out infinite'}}>
    </div>
  );
}
window.LimeOrb = LimeOrb;

// ── Bottom Tab Bar ─────────────────────────────────────────
function TabBar({tabs, active, onTab}) {
  return (
    <div style={{flexShrink:0,background:DS.s1,borderTop:`1px solid ${DS.border}`,
      display:'flex',alignItems:'flex-end',paddingBottom:20,paddingTop:10}}>
      {tabs.map(t => {
        const isActive = active===t.id;
        return (
          <div key={t.id} onClick={()=>onTab(t.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',paddingTop:2,position:'relative'}}>
            <div style={{color:isActive?DS.lime:DS.muted,transition:'color .15s'}}>
              {t.icon(isActive)}
            </div>
            <div style={{fontSize:10,color:isActive?DS.lime:DS.muted,fontWeight:isActive?700:400,letterSpacing:.01}}>
              {t.label}
            </div>
            {isActive&&<div style={{position:'absolute',bottom:-10,width:22,height:3,borderRadius:2,background:DS.lime}}/>}
          </div>
        );
      })}
    </div>
  );
}
window.TabBar = TabBar;

// ── Shared data ───────────────────────────────────────────
window.SUPPLIERS = [
  {id:1,name:'Shenzhen TechParts',cat:'Электроника',moq:'МЗ 500 ед.',score:98,country:'🇨🇳',rating:4.9,orders:1240,lead:'15–20 дн.',price:'$4.20/ед.'},
  {id:2,name:'Jiangsu Textile',cat:'Текстиль',moq:'МЗ 200 ед.',score:96,country:'🇨🇳',rating:4.8,orders:890,lead:'20–30 дн.',price:'$1.80/м'},
  {id:3,name:'Vietnam Steel Co.',cat:'Металлы',moq:'МЗ 1 т',score:94,country:'🇻🇳',rating:4.7,orders:560,lead:'25–35 дн.',price:'$680/т'},
  {id:4,name:'Guangdong Plastics',cat:'Пластик',moq:'МЗ 300 кг',score:92,country:'🇨🇳',rating:4.6,orders:430,lead:'10–15 дн.',price:'$2.50/кг'},
  {id:5,name:'Mumbai Packaging',cat:'Упаковка',moq:'МЗ 1000 ед.',score:91,country:'🇮🇳',rating:4.5,orders:380,lead:'18–25 дн.',price:'$0.12/ед.'},
];
window.PRODUCTS = [
  {id:1,name:'Нержавеющая сталь 316L',cat:'Металлы',supplier:'Vietnam Steel Co.',country:'🇻🇳',moq:'1 т',price:'$680/т',img:'⚙️'},
  {id:2,name:'Хлопок 100%, 200г/м²',cat:'Текстиль',supplier:'Jiangsu Textile',country:'🇨🇳',moq:'200 м',price:'$1.80/м',img:'🧵'},
  {id:3,name:'PCB контроллер v3',cat:'Электроника',supplier:'Shenzhen TechParts',country:'🇨🇳',moq:'500 ед.',price:'$4.20/ед.',img:'⚡'},
  {id:4,name:'HDPE гранулят',cat:'Пластик',supplier:'Guangdong Plastics',country:'🇨🇳',moq:'300 кг',price:'$2.50/кг',img:'🔩'},
];
window.AI_SYSTEM = `Ты — ИИ-ассистент TradeAI, B2B маркетплейса для международных закупок. Помогаешь находить поставщиков, фабрики, рассчитывать стоимость (товар+доставка+таможня+НДС), организовывать логистику, переводить переписку. Отвечай кратко, по делу, на русском. Используй структуру с эмодзи. При поиске поставщика — предложи 2–3 варианта. При расчёте стоимости — покажи разбивку.`;
