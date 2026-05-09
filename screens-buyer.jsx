// screens-buyer.jsx — Buyer journey (Home, Catalog, Search, Product, Supplier)

// ── Product row ─────────────────────────────────────────────
function ProductRow({ p, onPress }) {
  return (
    <div onClick={onPress} style={{
      borderRadius:16, background:DS.s1, border:`1px solid ${DS.border}`,
      padding:10, cursor:'pointer', display:'flex', gap:12, alignItems:'center',
    }}>
      <div style={{width:62, height:62, borderRadius:12, position:'relative', overflow:'hidden', flexShrink:0}}>
        <CatImg tone={p.tone} sub={p.sub}/>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13.5, fontWeight:700, color:DS.text, letterSpacing:-0.2, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.name}</div>
        <div style={{fontSize:11.5, color:DS.sub, marginBottom:7, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          {p.supplier} · <span style={{fontFamily:'"SF Mono",ui-monospace,monospace'}}>{p.country}</span>
        </div>
        <div style={{display:'flex', gap:6}}>
          <VBadge/>
          <Tag tone="muted">МЗ {p.moq}</Tag>
        </div>
      </div>
      <div style={{fontSize:13, fontWeight:800, color:'var(--accent)', flexShrink:0, marginLeft:4, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.3}}>{p.price}</div>
    </div>
  );
}
window.ProductRow = ProductRow;

// ── Supplier row ────────────────────────────────────────────
function SupplierRow({ s, onPress }) {
  return (
    <div onClick={onPress} style={{
      borderRadius:16, background:DS.s1, border:`1px solid ${DS.border}`,
      padding:10, cursor:'pointer', display:'flex', gap:12, alignItems:'center',
    }}>
      <div style={{width:56, height:56, borderRadius:12, position:'relative', overflow:'hidden', flexShrink:0}}>
        <CatImg tone={s.tone} sub={s.country.toLowerCase()}/>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13.5, fontWeight:700, color:DS.text, letterSpacing:-0.2, marginBottom:3, display:'flex', alignItems:'center', gap:6}}>
          <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</span>
          <span style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', flexShrink:0}}>· {s.country}</span>
        </div>
        <div style={{fontSize:11.5, color:DS.sub, marginBottom:7}}>{s.cat} · {s.price}</div>
        <div style={{display:'flex', gap:6}}>
          <VBadge/>
          <Tag tone="muted">{s.moq}</Tag>
        </div>
      </div>
      <div style={{flexShrink:0, textAlign:'right', marginLeft:4}}>
        <div style={{fontSize:16, fontWeight:800, color:'var(--accent)', letterSpacing:-0.3, lineHeight:1}}>{s.score}<span style={{fontSize:10, color:DS.muted, fontWeight:500}}>/100</span></div>
        <div style={{fontSize:9, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:'0.06em', textTransform:'uppercase', marginTop:4}}>trust</div>
      </div>
    </div>
  );
}
window.SupplierRow = SupplierRow;

// ── AI inline strip (reusable) ─────────────────────────────
function AIStrip({ text, onPress }) {
  return (
    <div onClick={onPress} style={{
      background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
      borderRadius:14, padding:'11px 14px',
      display:'flex', alignItems:'center', gap:11, cursor:'pointer',
      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <AIOrb size={26}/>
      <div style={{flex:1, fontSize:12.5, color:'var(--accent)', fontWeight:600, letterSpacing:-0.1}}>{text}</div>
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
        <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{color:'var(--accent)'}}/>
      </svg>
    </div>
  );
}
window.AIStrip = AIStrip;

// ── 05 BUYER HOME ──────────────────────────────────────────
const CATS = [
  { id:'metal',  label:'Металл',         sub:'384 поставщика',  tone:'steel',   size:'lg' },
  { id:'text',   label:'Текстиль',       sub:'212 поставщиков', tone:'textile', size:'lg' },
  { id:'elec',   label:'Электроника',    sub:'506 поставщиков', tone:'chip',    size:'lg' },
  { id:'pack',   label:'Упаковка',       sub:'148 поставщиков', tone:'pack',    size:'lg' },
  { id:'equip',  label:'Оборудование',   sub:'92',              tone:'tools',   size:'sm' },
  { id:'build',  label:'Стройматериалы', sub:'167',             tone:'brick',   size:'sm' },
  { id:'hw',     label:'Фурнитура',      sub:'74',              tone:'hw',      size:'sm' },
];

function HomeHeader({ role, onProfile }) {
  return (
    <div style={{padding:'8px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div onClick={onProfile} style={{
          width:38, height:38, borderRadius:12, cursor:'pointer',
          background:`linear-gradient(135deg, var(--accent) 0%, var(--accentDeep) 100%)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.3,
          boxShadow:'0 4px 14px var(--accentDim2)',
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
          <div style={{width:7, height:7, borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 8px var(--accent)'}}/>
          <span style={{fontSize:11, color:DS.sub, fontFamily:'"SF Mono",ui-monospace,monospace'}}>₽ 92.4</span>
        </div>
        <div style={{
          width:38, height:38, borderRadius:12,
          background:DS.s1, border:`1px solid ${DS.border}`,
          display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <div style={{position:'absolute', top:9, right:9, width:7, height:7, borderRadius:'50%', background:'var(--accent)', border:`1.5px solid ${DS.bg}`}}/>
        </div>
      </div>
    </div>
  );
}

function AIPanel({ onAI, onAIMsg }) {
  const chips = [
    'Найти поставщиков металла в Китае',
    'Рассчитать доставку и налоги',
    'Сравнить предложения фабрик',
    'Найти проверенных производителей',
  ];
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
      <div style={{
        position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
        width:'60%', height:1,
        background:`linear-gradient(90deg, transparent, var(--accent), transparent)`,
        opacity:0.5,
      }}/>
      <div style={{display:'flex', justifyContent:'center', paddingTop:10, paddingBottom:8}}>
        <div style={{width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)'}}/>
      </div>
      <div style={{padding:'2px 18px 12px', display:'flex', alignItems:'center', gap:12}}>
        <AIOrb size={44}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:15, fontWeight:700, color:DS.text, letterSpacing:-0.2, display:'flex', alignItems:'center', gap:7}}>
            AI-ассистент
            <span style={{
              fontSize:9, fontWeight:700, letterSpacing:'0.08em',
              color:'var(--accent)', background:'var(--accentDim)', border:'1px solid var(--accentDim2)',
              borderRadius:4, padding:'2px 5px', textTransform:'uppercase',
            }}>онлайн</span>
          </div>
          <div style={{fontSize:12, color:DS.sub, marginTop:2}}>Найдёт поставщиков, рассчитает стоимость</div>
        </div>
        <div onClick={onAI} style={{
          width:34, height:34, borderRadius:10,
          background:'rgba(255,255,255,0.05)', border:`1px solid ${DS.border2}`,
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div style={{padding:'0 18px 12px', display:'flex', gap:7, flexWrap:'wrap'}}>
        {chips.map(t => (
          <div key={t} onClick={()=>onAIMsg(t)} style={{
            fontSize:12, color:'rgba(255,255,255,0.78)',
            background:'rgba(255,255,255,0.04)',
            border:`1px solid ${DS.border2}`,
            borderRadius:12, padding:'7px 11px',
            cursor:'pointer',
          }}>{t}</div>
        ))}
      </div>
      <div style={{padding:'0 18px 22px'}}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'rgba(255,255,255,0.04)',
          border:`1px solid ${DS.border3}`,
          borderRadius:15, padding:'9px 9px 9px 16px',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 3px var(--accentDim)',
        }}>
          <input readOnly onFocus={onAI} placeholder="Опишите товар или задачу"
            style={{flex:1, background:'none', border:'none', outline:'none',
              color:DS.text, fontSize:13.5, fontFamily:'inherit', cursor:'pointer'}}/>
          <div style={{width:32, height:32, borderRadius:10, background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <svg width="13" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="12" rx="3" stroke={DS.sub} strokeWidth="1.8"/>
              <path d="M5 11a7 7 0 0014 0M12 18v3" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div onClick={onAI} style={{
            width:38, height:38, borderRadius:12, background:'var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer',
            boxShadow:'0 2px 12px var(--accentDim2)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--accentOn)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuyerHome({ nav, role }) {
  return (
    <div style={{
      height:'100%', width:'100%',
      display:'flex', flexDirection:'column',
      background:`radial-gradient(120% 70% at 50% 0%, ${DS.bg2} 0%, ${DS.bg} 60%)`,
      paddingTop:58, overflow:'hidden',
    }}>
      <HomeHeader role={role} onProfile={()=>nav('profile')}/>

      <div style={{padding:'14px 20px 12px', flexShrink:0}}>
        <div style={{fontSize:22, fontWeight:800, color:DS.text, letterSpacing:-0.6, lineHeight:1.15}}>Добрый день, Иван</div>
        <div style={{fontSize:13, color:DS.sub, marginTop:3}}>
          Что закупаем сегодня? <span style={{color:'var(--accent)', fontWeight:600}}>Китай → Россия</span>
        </div>
      </div>

      <div style={{padding:'0 20px', flexShrink:0}}>
        <div onClick={()=>nav('search')}><SearchBar/></div>
      </div>

      <div style={{padding:'12px 0 0', flexShrink:0, display:'flex', gap:7, overflowX:'auto', paddingLeft:20, paddingRight:20, WebkitMaskImage:'linear-gradient(to right, #000 85%, transparent 100%)'}}>
        {['Все','Проверенные','Готово к отправке','MOQ < 50','Металл','Текстиль'].map((l,i)=>(
          <FilterChip key={l} label={l} active={i===0}/>
        ))}
      </div>

      <div style={{padding:'14px 20px 0', flex:1, overflowY:'auto', overflowX:'hidden', minHeight:0, WebkitMaskImage:'linear-gradient(to bottom, #000 90%, transparent 100%)'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:9}}>
          {CATS.filter(c=>c.size==='lg').map(c=>(
            <div key={c.id} onClick={()=>nav('catalog',{cat:c.label})} style={{position:'relative', height:118, borderRadius:16, overflow:'hidden', border:`1px solid ${DS.border}`, cursor:'pointer'}}>
              <CatImg tone={c.tone} sub={c.id}/>
              <div style={{position:'absolute', inset:0, padding:'12px 13px', display:'flex', flexDirection:'column', justifyContent:'flex-end', zIndex:2}}>
                <div style={{fontSize:15, fontWeight:700, color:'#fff', letterSpacing:-0.2, lineHeight:1.15}}>{c.label}</div>
                <div style={{fontSize:10.5, color:'rgba(255,255,255,0.55)', marginTop:3, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:0.02}}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:9}}>
          {CATS.filter(c=>c.size==='sm').map(c=>(
            <div key={c.id} onClick={()=>nav('catalog',{cat:c.label})} style={{position:'relative', height:96, borderRadius:16, overflow:'hidden', border:`1px solid ${DS.border}`, cursor:'pointer'}}>
              <CatImg tone={c.tone} sub={c.id}/>
              <div style={{position:'absolute', inset:0, padding:'10px 12px', display:'flex', flexDirection:'column', justifyContent:'flex-end', zIndex:2}}>
                <div style={{fontSize:13, fontWeight:700, color:'#fff', lineHeight:1.15}}>{c.label}</div>
                <div style={{fontSize:10, color:'rgba(255,255,255,0.55)', marginTop:2, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{height:12}}/>
      </div>

      <AIPanel onAI={()=>nav('ai')} onAIMsg={(t)=>nav('ai',{msg:t})}/>
      <TabBar role={role} active="home" onTab={(t)=>nav(t==='home'?'home':t==='catalog'?'catalog':t==='msgs'?'chat':t==='deals'?'tracking':'profile')}/>
    </div>
  );
}
window.BuyerHome = BuyerHome;

// ── 06 CATALOG ─────────────────────────────────────────────
function Catalog({ nav, role, ctx }) {
  const [view, setView] = React.useState('products');
  const [filter, setFilter] = React.useState(ctx?.cat || 'Все');
  const filters = ['Все','Металл','Текстиль','Электроника','Упаковка','Оборудование'];
  const prods = filter==='Все' ? PRODUCTS : PRODUCTS.filter(p => p.cat.startsWith(filter.slice(0,4)));
  const sups = filter==='Все' ? SUPPLIERS : SUPPLIERS.filter(s => s.cat.startsWith(filter.slice(0,4)));
  return (
    <div style={{height:'100%', background:DS.bg, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontSize:24, fontWeight:800, color:DS.text, letterSpacing:-0.5}}>Каталог</div>
        <div style={{fontSize:11, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{view==='products'?prods.length:sups.length} результатов</div>
      </div>
      <div style={{padding:'12px 20px 0', flexShrink:0}}>
        <div onClick={()=>nav('search')}><SearchBar/></div>
      </div>
      <div style={{padding:'12px 20px 0', flexShrink:0}}>
        <Segmented active={view} onChange={setView} items={[
          {id:'products', label:`Товары · ${prods.length}`},
          {id:'suppliers', label:`Поставщики · ${sups.length}`},
        ]}/>
      </div>
      <div style={{padding:'10px 20px 0', display:'flex', gap:7, overflowX:'auto', flexShrink:0}}>
        {filters.map(f => <FilterChip key={f} label={f} active={filter===f} onPress={()=>setFilter(f)}/>)}
      </div>
      <div style={{padding:'12px 20px 0', flexShrink:0}}>
        <AIStrip text="Уточнить запрос через AI" onPress={()=>nav('ai')}/>
      </div>
      <div style={{flex:1, overflowY:'auto', padding:'12px 20px 20px', display:'flex', flexDirection:'column', gap:8}}>
        {view==='products'
          ? prods.map(p=><ProductRow key={p.id} p={p} onPress={()=>nav('product',{product:p})}/>)
          : sups.map(s=><SupplierRow key={s.id} s={s} onPress={()=>nav('supplier',{supplier:s})}/>)
        }
      </div>
      <TabBar role={role} active="catalog" onTab={(t)=>nav(t==='home'?'home':t==='catalog'?'catalog':t==='msgs'?'chat':t==='deals'?'tracking':'profile')}/>
    </div>
  );
}
window.Catalog = Catalog;

// ── 07 SEARCH ──────────────────────────────────────────────
function Search({ nav, ctx }) {
  const [q, setQ] = React.useState(ctx?.query || '');
  const [view, setView] = React.useState('all');
  const term = q.toLowerCase();
  const prods = !term ? PRODUCTS : PRODUCTS.filter(p=>p.name.toLowerCase().includes(term)||p.supplier.toLowerCase().includes(term)||p.cat.toLowerCase().includes(term));
  const sups  = !term ? SUPPLIERS : SUPPLIERS.filter(s=>s.name.toLowerCase().includes(term)||s.cat.toLowerCase().includes(term));
  const recent = ['Сталь 316L', 'PCB Китай', 'Хлопок 200г/м²', 'Упаковка крафт'];

  return (
    <div style={{height:'100%', background:DS.bg, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0', flexShrink:0, display:'flex', alignItems:'center', gap:10}}>
        <BackBtn onPress={()=>nav('back')}/>
        <div style={{flex:1}}>
          <SearchBar value={q} onChange={e=>setQ(e.target.value)} autoFocus showFilter={false}/>
        </div>
        <div onClick={()=>setQ('')} style={{fontSize:13, color:DS.sub, cursor:'pointer'}}>Отмена</div>
      </div>
      {!q && (
        <div style={{padding:'16px 20px 0', flexShrink:0}}>
          <SectionHeader title="История поиска"/>
          <div style={{display:'flex', flexDirection:'column', gap:2}}>
            {recent.map(r=>(
              <div key={r} onClick={()=>setQ(r)} style={{padding:'11px 0', borderBottom:`1px solid ${DS.border}`, display:'flex', alignItems:'center', gap:12, cursor:'pointer'}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={DS.muted} strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke={DS.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>
                <div style={{flex:1, fontSize:14, color:DS.text}}>{r}</div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 19L19 5M19 19L5 5" stroke={DS.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
            ))}
          </div>
        </div>
      )}
      {!q && (
        <div style={{padding:'16px 20px 0', flexShrink:0}}>
          <SectionHeader title="В тренде"/>
          <div style={{display:'flex', gap:7, flexWrap:'wrap'}}>
            {['#сталь','#pcb','#хлопок','#упаковка','#крафт','#фурнитура','#литье','#оптика'].map(t=>(
              <FilterChip key={t} label={t} onPress={()=>setQ(t.slice(1))}/>
            ))}
          </div>
        </div>
      )}
      {q && (
        <>
          <div style={{padding:'12px 20px 0', flexShrink:0}}>
            <AIStrip text={`Найти «${q}» через AI`} onPress={()=>nav('ai',{msg:q})}/>
          </div>
          <div style={{padding:'12px 20px 0', flexShrink:0}}>
            <Segmented active={view} onChange={setView} items={[
              {id:'all', label:`Все · ${prods.length+sups.length}`},
              {id:'suppliers', label:`Поставщики · ${sups.length}`},
              {id:'products', label:`Товары · ${prods.length}`},
            ]}/>
          </div>
          <div style={{flex:1, overflowY:'auto', padding:'12px 20px 20px', display:'flex', flexDirection:'column', gap:8}}>
            {(view==='all' || view==='suppliers') && sups.slice(0,3).map(s=><SupplierRow key={'s'+s.id} s={s} onPress={()=>nav('supplier',{supplier:s})}/>)}
            {(view==='all' || view==='products') && prods.map(p=><ProductRow key={'p'+p.id} p={p} onPress={()=>nav('product',{product:p})}/>)}
          </div>
        </>
      )}
    </div>
  );
}
window.Search = Search;

// ── 08 PRODUCT DETAIL ──────────────────────────────────────
function Product({ nav, ctx }) {
  const p = ctx?.product || PRODUCTS[0];
  const s = SUPPLIERS.find(x=>x.name===p.supplier) || SUPPLIERS[0];
  const specs = [
    ['Материал','Нержавеющая сталь 316L'],
    ['Стандарт','ASTM A240 / EN 10088'],
    ['Толщина','0.5 – 10 мм'],
    ['Форма','Лист, рулон, пруток'],
    ['Сертификат','ISO 9001, SGS, RoHS'],
  ];
  return (
    <div style={{height:'100%', background:DS.bg, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0', flexShrink:0, display:'flex', alignItems:'center', gap:10}}>
        <BackBtn onPress={()=>nav('back')}/>
        <div style={{flex:1, fontSize:14, fontWeight:600, color:DS.sub, letterSpacing:-0.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.name}</div>
        <div style={{width:38, height:38, borderRadius:12, background:DS.s1, border:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={DS.sub} strokeWidth="1.8"/></svg>
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'14px 20px 100px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
        <div style={{height:220, flexShrink:0, borderRadius:20, position:'relative', overflow:'hidden', border:`1px solid ${DS.border}`}}>
          <CatImg tone={p.tone} sub={p.sub}/>
          <div style={{position:'absolute', bottom:12, left:14, display:'flex', gap:6}}>
            <Tag tone="green">✓ Верифицирован</Tag>
            <Tag tone="warn">Готов к отправке</Tag>
          </div>
          <div style={{position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', borderRadius:10, padding:'5px 9px', fontSize:11, color:'#fff', fontFamily:'"SF Mono",ui-monospace,monospace'}}>1 / 4</div>
        </div>

        <div>
          <div style={{fontSize:11, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:600, marginBottom:6}}>{p.cat}</div>
          <div style={{fontSize:22, fontWeight:800, color:DS.text, letterSpacing:-0.5, lineHeight:1.15, marginBottom:10}}>{p.name}</div>
          <div style={{display:'flex', alignItems:'baseline', gap:8}}>
            <div style={{fontSize:28, fontWeight:800, color:'var(--accent)', letterSpacing:-0.5, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{p.price}</div>
            <div style={{fontSize:12, color:DS.muted}}>при заказе от {p.moq}</div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {[['Мин. заказ', p.moq],['Страна', p.country],['Наличие','В наличии'],['Срок','20–30 дн.']].map(([k,v])=>(
            <div key={k} style={{background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:12, padding:'11px 13px'}}>
              <div style={{fontSize:10, color:DS.muted, marginBottom:4, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600}}>{k}</div>
              <div style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.1}}>{v}</div>
            </div>
          ))}
        </div>

        <div onClick={()=>nav('supplier',{supplier:s})} style={{background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:16, padding:14, display:'flex', alignItems:'center', gap:12, cursor:'pointer'}}>
          <div style={{width:46, height:46, borderRadius:12, position:'relative', overflow:'hidden', flexShrink:0}}>
            <CatImg tone={s.tone} sub={s.country.toLowerCase()}/>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13.5, fontWeight:700, color:DS.text, marginBottom:3}}>{s.name}</div>
            <div style={{display:'flex', gap:6}}><VBadge/><Tag tone="muted">★ {s.rating}</Tag></div>
          </div>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={DS.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>

        <div style={{background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:16, padding:'14px 16px'}}>
          <SectionHeader title="Характеристики"/>
          {specs.map(([k,v],i)=>(
            <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: i<specs.length-1?`1px solid ${DS.border}`:'none', gap:12}}>
              <span style={{fontSize:12.5, color:DS.sub}}>{k}</span>
              <span style={{fontSize:12.5, color:DS.text, fontWeight:500, textAlign:'right'}}>{v}</span>
            </div>
          ))}
        </div>

        <AIStrip text="Спросить у AI: подходит ли этот товар?" onPress={()=>nav('ai',{msg:`Расскажи подробнее про ${p.name}`})}/>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
          {[
            {label:'Расчёт', sub:'доставка + налог', onPress:()=>nav('estimate',{product:p})},
            {label:'Сравнить', sub:'ещё 3 варианта', onPress:()=>{}},
            {label:'Запрос', sub:'КП от поставщика', onPress:()=>nav('chat',{supplier:s})},
          ].map(a=>(
            <div key={a.label} onClick={a.onPress} style={{background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:12, padding:'11px 10px', cursor:'pointer', textAlign:'center'}}>
              <div style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.1}}>{a.label}</div>
              <div style={{fontSize:10, color:DS.muted, marginTop:3, letterSpacing:0.02}}>{a.sub}</div>
            </div>
          ))}
        </div>
      </div>

      </div>
      {/* sticky CTA */}
      <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'12px 20px 30px', background:'linear-gradient(to top, rgba(11,12,14,0.95) 60%, transparent 100%)', display:'flex', gap:10, zIndex:10}}>
        <SecondaryBtn style={{flex:1}} onPress={()=>nav('chat',{supplier:s})}>Связаться</SecondaryBtn>
        <PrimaryBtn style={{flex:1.3}} onPress={()=>nav('deal',{product:p})}>Начать сделку</PrimaryBtn>
      </div>
    </div>
  );
}
window.Product = Product;

// ── 09 SUPPLIER PROFILE ────────────────────────────────────
function Supplier({ nav, ctx }) {
  const s = ctx?.supplier || SUPPLIERS[0];
  const products = PRODUCTS.filter(p => p.supplier === s.name).concat(PRODUCTS).slice(0,4);
  const reviews = [
    { name:'Иван В.', text:'Отличное качество, доставка вовремя. Рекомендую для оптовых закупок.', rating:5.0, date:'12.03' },
    { name:'Мария К.', text:'Хорошая коммуникация, AI-перевод работает точно. Заказ пришёл точно в срок.', rating:4.8, date:'03.03' },
  ];
  return (
    <div style={{height:'100%', background:DS.bg, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0', flexShrink:0, display:'flex', alignItems:'center', gap:10}}>
        <BackBtn onPress={()=>nav('back')}/>
        <div style={{flex:1}}/>
        <div style={{width:38, height:38, borderRadius:12, background:DS.s1, border:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.4" fill={DS.sub}/><circle cx="12" cy="12" r="1.4" fill={DS.sub}/><circle cx="12" cy="19" r="1.4" fill={DS.sub}/></svg>
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'14px 20px 100px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
        {/* Hero */}
        <div style={{position:'relative', height:140, flexShrink:0, borderRadius:20, overflow:'hidden', border:`1px solid ${DS.border}`}}>
          <CatImg tone={s.tone} sub={s.country.toLowerCase()+'-hq'}/>
          <div style={{position:'absolute', inset:0, background:'linear-gradient(to top, rgba(11,12,14,0.85) 0%, transparent 60%)'}}/>
          <div style={{position:'absolute', bottom:12, left:14, right:14, display:'flex', alignItems:'flex-end', gap:12}}>
            <div style={{
              width:56, height:56, borderRadius:14, flexShrink:0,
              background:`linear-gradient(135deg, var(--accent) 0%, var(--accentDeep) 100%)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--accentOn)', fontSize:19, fontWeight:800, letterSpacing:-0.5,
              border:`2px solid ${DS.bg}`, boxShadow:'0 4px 16px var(--accentDim2)',
            }}>{s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:17, fontWeight:800, color:'#fff', letterSpacing:-0.3, marginBottom:3, overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
              <div style={{display:'flex', gap:5}}><VBadge/><Tag tone="accent">Top-5</Tag></div>
            </div>
          </div>
        </div>

        <div style={{fontSize:13, color:DS.sub, lineHeight:1.55, letterSpacing:0.01}}>
          Производитель {s.cat.toLowerCase()} с 2008 года. Сертификаты ISO 9001, SGS. Экспорт в 40+ стран. Собственное производство, склад на {s.country==='CN'?'Шэньчжэне':'Хошимине'}.
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
          {[
            { v:s.rating, k:'Рейтинг', sub:'★' },
            { v:s.orders, k:'Заказов' },
            { v:s.lead, k:'Срок' },
          ].map(it=>(
            <div key={it.k} style={{background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:12, padding:'11px 10px', textAlign:'center'}}>
              <div style={{fontSize:18, fontWeight:800, color:'var(--accent)', letterSpacing:-0.3, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{it.sub?it.sub+' ':''}{it.v}</div>
              <div style={{fontSize:10, color:DS.muted, marginTop:4, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600}}>{it.k}</div>
            </div>
          ))}
        </div>

        <div>
          <SectionHeader title="Каталог" action="Все →" onAction={()=>nav('catalog',{cat:s.cat})}/>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:9}}>
            {products.slice(0,2).map(p=>(
              <div key={p.id} onClick={()=>nav('product',{product:p})} style={{borderRadius:14, border:`1px solid ${DS.border}`, background:DS.s1, overflow:'hidden', cursor:'pointer'}}>
                <div style={{height:72, position:'relative', overflow:'hidden'}}>
                  <CatImg tone={p.tone} sub={p.sub}/>
                </div>
                <div style={{padding:'9px 11px'}}>
                  <div style={{fontSize:11.5, color:DS.text, fontWeight:600, lineHeight:1.25, marginBottom:5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}}>{p.name}</div>
                  <div style={{fontSize:12, fontWeight:800, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace'}}>{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:16, padding:'14px 16px'}}>
          <SectionHeader title="Отзывы" action="Все 127 →"/>
          {reviews.map((r,i)=>(
            <div key={r.name} style={{paddingBottom:12, borderBottom: i<reviews.length-1?`1px solid ${DS.border}`:'none', marginBottom: i<reviews.length-1?12:0}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5}}>
                <div style={{fontSize:12.5, fontWeight:700, color:DS.text}}>{r.name}</div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{fontSize:11, color:'var(--accent)', fontWeight:700, fontFamily:'"SF Mono",ui-monospace,monospace'}}>★ {r.rating}</div>
                  <div style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{r.date}</div>
                </div>
              </div>
              <div style={{fontSize:12, color:DS.sub, lineHeight:1.55}}>{r.text}</div>
            </div>
          ))}
        </div>

        <div style={{background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:16, padding:14}}>
          <SectionHeader title="Расположение"/>
          <div style={{height:100, borderRadius:12, position:'relative', overflow:'hidden', marginBottom:10,
            background:`linear-gradient(135deg, #131618 0%, #0E1013 100%)`,
          }}>
            {/* faux map grid */}
            <div style={{position:'absolute', inset:0,
              backgroundImage:'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 28px)'}}/>
            <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)'}}>
              <div style={{width:22, height:22, borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 20px var(--accent)', border:`3px solid ${DS.bg}`}}/>
            </div>
          </div>
          <div style={{fontSize:12.5, color:DS.sub}}>{s.country==='CN'?'Шэньчжэнь, Китай':s.country==='VN'?'Хошимин, Вьетнам':'Мумбаи, Индия'} · {s.cat} Industrial Zone</div>
        </div>

        <AIStrip text="AI: сравнить с другими поставщиками" onPress={()=>nav('ai',{msg:`Сравни ${s.name} с другими`})}/>
      </div>
      </div>

      <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'12px 20px 30px', background:'linear-gradient(to top, rgba(11,12,14,0.95) 60%, transparent 100%)', display:'flex', gap:10, zIndex:10}}>
        <SecondaryBtn style={{flex:1}} onPress={()=>nav('chat',{supplier:s})} icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 1121 11.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>}>Написать</SecondaryBtn>
        <PrimaryBtn style={{flex:1.3}} onPress={()=>nav('deal')} icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8"/></svg>}>Сделка</PrimaryBtn>
      </div>
    </div>
  );
}
window.Supplier = Supplier;
