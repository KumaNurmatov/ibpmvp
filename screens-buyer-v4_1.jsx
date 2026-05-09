// Atoms v3 + Search v3 + Catalog v3

// Country chip with flag-letters
function CountryChip({ code }) {
  const labels = { CN:'Китай', VN:'Вьетнам', IN:'Индия', RU:'Россия', TR:'Турция' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      fontSize:10.5, fontWeight:600, color:DS.sub,
      background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
      borderRadius:5, padding:'2px 7px',
    }}>
      <span style={{fontFamily:'"SF Mono",ui-monospace,monospace', fontSize:9.5, color:'var(--accent)', fontWeight:700, letterSpacing:'0.06em'}}>{code}</span>
      <span style={{color:DS.sub}}>{labels[code] || code}</span>
    </span>
  );
}
window.CountryChip = CountryChip;

// Premium product row v3
function ProductRow({ p, onPress }) {
  return (
    <div onClick={onPress} style={{
      borderRadius:18, background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
      border:`1px solid ${DS.border}`,
      padding:12, cursor:'pointer', display:'flex', gap:12, alignItems:'center',
    }}>
      <div style={{width:64, height:64, borderRadius:14, position:'relative', overflow:'hidden', flexShrink:0,
        background:`linear-gradient(160deg, #1B1E22 0%, #0F1114 100%)`, border:`1px solid ${DS.border}`}}>
        <div style={{position:'absolute', inset:0, opacity:0.55, pointerEvents:'none'}}>
          <CatIllustration kind={p.kind || (p.cat==='Металлы'?'metal':p.cat==='Текстиль'?'textile':p.cat==='Электроника'?'electronics':p.cat==='Пластик'?'hw':'pack')}/>
        </div>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:10, color:DS.muted, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3}}>{p.cat}</div>
        <div style={{fontSize:13.5, fontWeight:700, color:DS.text, letterSpacing:-0.2, marginBottom:5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.name}</div>
        <div style={{display:'flex', gap:5, alignItems:'center', flexWrap:'wrap'}}>
          <CountryChip code={p.country}/>
          <span style={{fontSize:10.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>MOQ {p.moq}</span>
        </div>
      </div>
      <div style={{flexShrink:0, textAlign:'right', marginLeft:6}}>
        <div style={{fontSize:10, color:DS.muted, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600, marginBottom:2}}>Цена от</div>
        <div style={{fontSize:14, fontWeight:800, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.3}}>{p.price}</div>
      </div>
    </div>
  );
}
window.ProductRow = ProductRow;

// Premium supplier row v3
function SupplierRow({ s, onPress }) {
  return (
    <div onClick={onPress} style={{
      borderRadius:18, background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
      border:`1px solid ${DS.border}`,
      padding:12, cursor:'pointer', display:'flex', gap:12, alignItems:'center',
    }}>
      <div style={{width:56, height:56, borderRadius:13, flexShrink:0,
        background:`linear-gradient(135deg, var(--accentDim2) 0%, transparent 100%), linear-gradient(160deg, #1F2226 0%, #101215 100%)`,
        border:`1px solid ${DS.border2}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:15, fontWeight:800, color:DS.text, letterSpacing:-0.4,
      }}>{s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
          <span style={{fontSize:13.5, fontWeight:700, color:DS.text, letterSpacing:-0.2, overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="9" fill="var(--accent)"/><path d="M8 12.5l3 3 5-6" stroke="var(--accentOn)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{fontSize:11.5, color:DS.sub, marginBottom:6}}>{s.cat}</div>
        <div style={{display:'flex', gap:5, alignItems:'center', flexWrap:'wrap'}}>
          <CountryChip code={s.country}/>
          <span style={{fontSize:10.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>MOQ {s.moq.replace('МЗ ','').replace(' ед.','')}</span>
          <span style={{fontSize:10.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>· ★ {s.rating}</span>
        </div>
      </div>
      <div style={{flexShrink:0, textAlign:'right', marginLeft:4}}>
        <div style={{fontSize:18, fontWeight:800, color:'var(--accent)', letterSpacing:-0.4, lineHeight:1, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{s.score}</div>
        <div style={{fontSize:9, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:'0.08em', textTransform:'uppercase', marginTop:4}}>trust</div>
      </div>
    </div>
  );
}
window.SupplierRow = SupplierRow;

// AI strip — refined helper, system component
function AIStrip({ text, onPress, sub }) {
  return (
    <div onClick={onPress} style={{
      background:`linear-gradient(135deg, var(--accentDim) 0%, rgba(255,255,255,0.02) 100%)`,
      border:`1px solid var(--accentDim2)`,
      borderRadius:14, padding:'11px 12px 11px 14px',
      display:'flex', alignItems:'center', gap:11, cursor:'pointer',
      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <AIOrb size={28}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:12.5, color:DS.text, fontWeight:600, letterSpacing:-0.1, lineHeight:1.2}}>{text}</div>
        {sub && <div style={{fontSize:10.5, color:DS.sub, marginTop:2, lineHeight:1.3}}>{sub}</div>}
      </div>
      <div style={{
        width:28, height:28, borderRadius:9,
        background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
window.AIStrip = AIStrip;


// ── 05 BUYER HOME v3 ────────────────────────────────────
// ── 05 BUYER HOME ──────────────────────────────────────────
// ── BUYER HOME v3 ──────────────────────────────────────────

// Category illustrations — abstract industrial visuals built from CSS shapes.
// Each renders inside a 100% sized container; placeholder dimensions assumed.
function CatIllustration({ kind }) {
  const C = {
    hi:  '#E6E8EA',     // bright (hero strokes)
    mid: 'rgba(230,232,234,0.55)',
    lo:  'rgba(230,232,234,0.18)',
  };
  switch (kind) {
    case 'metal': return (
      // Stacked steel coils — concentric rings + perspective
      <div style={{position:'absolute', inset:0}}>
        <div style={{position:'absolute', left:'10%', bottom:'20%', width:'48%', height:'52%', borderRadius:'50%',
          background:`radial-gradient(circle at 35% 30%, ${C.hi} 0%, transparent 6%, transparent 9%, ${C.mid} 10%, transparent 11%, transparent 16%, ${C.lo} 17%, transparent 18%, transparent 24%, ${C.lo} 25%, transparent 26%)`,
          boxShadow:'inset 0 0 20px rgba(0,0,0,0.6)'}}/>
        <div style={{position:'absolute', left:'42%', bottom:'30%', width:'42%', height:'46%', borderRadius:'50%',
          background:`radial-gradient(circle at 35% 30%, ${C.hi} 0%, transparent 7%, transparent 11%, ${C.mid} 12%, transparent 13%, transparent 19%, ${C.lo} 20%, transparent 21%)`,
          boxShadow:'inset 0 0 16px rgba(0,0,0,0.6)', opacity:0.9}}/>
      </div>
    );
    case 'textile': return (
      // Folded fabric rolls — stacked rectangles with edge highlight
      <div style={{position:'absolute', inset:0}}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position:'absolute', left:`${10+i*8}%`, bottom:`${15+i*16}%`,
            width:'70%', height:'14%', borderRadius:'2px',
            background:`linear-gradient(180deg, ${C.mid} 0%, ${C.lo} 100%)`,
            borderTop:`1px solid ${C.hi}`,
            boxShadow:'inset 0 -2px 0 rgba(0,0,0,0.4)',
          }}/>
        ))}
      </div>
    );
    case 'electronics': return (
      // PCB chip — square with pins
      <div style={{position:'absolute', inset:0}}>
        <div style={{position:'absolute', left:'25%', top:'25%', width:'50%', height:'50%',
          background:`linear-gradient(135deg, ${C.mid} 0%, ${C.lo} 100%)`,
          border:`1px solid ${C.hi}`, borderRadius:'4px',
          boxShadow:'inset 0 0 12px rgba(0,0,0,0.5)'}}>
          <div style={{position:'absolute', left:'15%', top:'15%', width:'25%', height:'25%', border:`1px solid ${C.mid}`, borderRadius:1}}/>
          <div style={{position:'absolute', right:'15%', bottom:'15%', width:'30%', height:'10%', background:C.lo}}/>
        </div>
        {/* pins */}
        {[0,1,2,3,4].map(i => <div key={'t'+i} style={{position:'absolute', left:`${28+i*10}%`, top:'18%', width:'3%', height:'8%', background:C.mid}}/>)}
        {[0,1,2,3,4].map(i => <div key={'b'+i} style={{position:'absolute', left:`${28+i*10}%`, bottom:'18%', width:'3%', height:'8%', background:C.mid}}/>)}
        {[0,1,2,3,4].map(i => <div key={'l'+i} style={{position:'absolute', top:`${28+i*10}%`, left:'18%', width:'8%', height:'3%', background:C.mid}}/>)}
        {[0,1,2,3,4].map(i => <div key={'r'+i} style={{position:'absolute', top:`${28+i*10}%`, right:'18%', width:'8%', height:'3%', background:C.mid}}/>)}
      </div>
    );
    case 'pack': return (
      // Stacked cardboard boxes — isometric
      <div style={{position:'absolute', inset:0}}>
        <div style={{position:'absolute', left:'25%', bottom:'25%', width:'40%', height:'40%',
          background:`linear-gradient(135deg, ${C.mid} 0%, ${C.lo} 100%)`,
          border:`1px solid ${C.hi}`, borderRadius:'2px',
          boxShadow:'inset 0 -4px 0 rgba(0,0,0,0.3)'}}>
          <div style={{position:'absolute', left:0, right:0, top:'50%', height:'1px', background:C.hi, opacity:0.4, pointerEvents:'none'}}/>
          <div style={{position:'absolute', top:0, bottom:0, left:'50%', width:'1px', background:C.hi, opacity:0.4, pointerEvents:'none'}}/>
        </div>
        <div style={{position:'absolute', left:'45%', bottom:'15%', width:'32%', height:'32%',
          background:`linear-gradient(135deg, ${C.lo} 0%, transparent 100%)`,
          border:`1px solid ${C.mid}`, borderRadius:'2px'}}/>
      </div>
    );
    case 'equip': return (
      // Gear teeth — circular with notches
      <div style={{position:'absolute', inset:0}}>
        <div style={{position:'absolute', left:'25%', top:'25%', width:'50%', height:'50%', borderRadius:'50%',
          border:`2px solid ${C.hi}`,
          boxShadow:`0 0 0 4px transparent, inset 0 0 12px rgba(0,0,0,0.5)`}}>
          {Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{
              position:'absolute', left:'45%', top:'-8%', width:'10%', height:'15%',
              background:C.hi,
              transformOrigin:'50% 380%',
              transform:`rotate(${i*45}deg)`,
            }}/>
          ))}
          <div style={{position:'absolute', left:'30%', top:'30%', width:'40%', height:'40%', borderRadius:'50%',
            background:`linear-gradient(135deg, ${C.mid} 0%, ${C.lo} 100%)`}}/>
        </div>
      </div>
    );
    case 'build': return (
      // Brick stack
      <div style={{position:'absolute', inset:0}}>
        {[0,1,2].map(row=>{
          const off = row%2===0 ? 0 : 12;
          return [0,1,2,3].map(col=>(
            <div key={row+'-'+col} style={{
              position:'absolute',
              left:`${10+col*22+off}%`, bottom:`${20+row*18}%`,
              width:'18%', height:'14%',
              background:`linear-gradient(180deg, ${C.mid} 0%, ${C.lo} 100%)`,
              border:`1px solid ${C.hi}`,
              borderRadius:'1px',
              boxShadow:'inset 0 -2px 0 rgba(0,0,0,0.3)',
            }}/>
          ));
        })}
      </div>
    );
    case 'hw': return (
      // Hex bolts / hardware
      <div style={{position:'absolute', inset:0}}>
        <div style={{position:'absolute', left:'20%', top:'25%', width:'30%', height:'30%',
          background:`linear-gradient(135deg, ${C.mid} 0%, ${C.lo} 100%)`,
          clipPath:'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)',
          border:`1px solid ${C.hi}`}}/>
        <div style={{position:'absolute', right:'15%', bottom:'20%', width:'22%', height:'22%', borderRadius:'50%',
          border:`2px solid ${C.hi}`,
          background:`radial-gradient(circle, ${C.lo} 0%, transparent 70%)`}}/>
      </div>
    );
    default: return null;
  }
}
window.CatIllustration = CatIllustration;

// Premium category card
function CatCard({ cat, onPress, big }) {
  return (
    <div onClick={onPress} style={{
      position:'relative',
      height: big ? 132 : 108,
      borderRadius: 18,
      background:`linear-gradient(160deg, #1B1E22 0%, #101215 100%)`,
      border:`1px solid ${DS.border}`,
      overflow:'hidden',
      cursor:'pointer',
      boxShadow:'0 1px 0 rgba(255,255,255,0.04) inset',
    }}>
      {/* Illustration area — absolute, top-right */}
      <div style={{position:'absolute', right:-6, top:-6, width: big? '62%':'56%', height: big? '74%':'70%', opacity:0.55, pointerEvents:'none'}}>
        <CatIllustration kind={cat.kind}/>
      </div>
      {/* lime corner glow on hero */}
      {cat.featured && (
        <div style={{position:'absolute', right:0, top:0, width:'70%', height:'70%',
          background:'radial-gradient(80% 80% at 100% 0%, var(--accentDim) 0%, transparent 60%)', pointerEvents:'none'}}/>
      )}
      <div style={{position:'absolute', inset:0, padding: big?'14px 14px':'12px 12px', display:'flex', flexDirection:'column', justifyContent:'space-between', zIndex:2}}>
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          {cat.featured && <span style={{
            fontSize:9, fontWeight:700, letterSpacing:'0.08em',
            color:'var(--accent)', background:'var(--accentDim)', border:'1px solid var(--accentDim2)',
            borderRadius:4, padding:'2px 6px', textTransform:'uppercase'
          }}>Топ</span>}
        </div>
        <div>
          <div style={{fontSize: big?16:14, fontWeight:700, color:'#fff', letterSpacing:-0.25, lineHeight:1.15}}>{cat.label}</div>
          <div style={{fontSize: big?11:10, color:'rgba(255,255,255,0.45)', marginTop:5,
            fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:0.02}}>
            {cat.count} <span style={{color:'rgba(255,255,255,0.32)'}}>· {cat.unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
window.CatCard = CatCard;

const V3_CATS = [
  { id:'metal',  label:'Металл',         kind:'metal',       count:'384',  unit:'поставщика',  featured:true },
  { id:'text',   label:'Текстиль',       kind:'textile',     count:'212',  unit:'поставщика' },
  { id:'elec',   label:'Электроника',    kind:'electronics', count:'506',  unit:'поставщиков' },
  { id:'pack',   label:'Упаковка',       kind:'pack',        count:'148',  unit:'поставщиков' },
  { id:'equip',  label:'Оборудование',   kind:'equip',       count:'92',   unit:'фабрик' },
  { id:'build',  label:'Стройматериалы', kind:'build',       count:'167',  unit:'поставщиков' },
  { id:'hw',     label:'Фурнитура',      kind:'hw',          count:'74',   unit:'фабрик' },
];

// ── Header v3 ──────────────────────────────────────────────
function HomeHeaderV3({ onProfile }) {
  return (
    <div style={{padding:'10px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
      <div style={{display:'flex', alignItems:'center', gap:11}}>
        <div onClick={onProfile} style={{
          width:40, height:40, borderRadius:13, cursor:'pointer', position:'relative',
          background:`linear-gradient(135deg, #2A2D31 0%, #14171A 100%)`,
          border:`1px solid ${DS.border2}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13.5, fontWeight:700, color:'#fff', letterSpacing:-0.3,
        }}>
          ИВ
          <div style={{position:'absolute', right:-2, bottom:-2, width:12, height:12, borderRadius:'50%',
            background:'var(--accent)', border:`2px solid ${DS.bg}`,
            boxShadow:'0 0 6px var(--accent)'}}/>
        </div>
        <div>
          <div style={{fontSize:10, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700}}>Покупатель</div>
          <div style={{fontSize:15, fontWeight:700, color:DS.text, letterSpacing:-0.25, marginTop:2, display:'flex', alignItems:'center', gap:5}}>
            Иван Волков
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{opacity:0.4}}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <div style={{
          height:36, borderRadius:11, padding:'0 11px',
          background:DS.s1, border:`1px solid ${DS.border}`,
          display:'flex', alignItems:'center', gap:7,
        }}>
          <span style={{fontSize:9.5, color:DS.muted, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase'}}>USD</span>
          <span style={{fontSize:11.5, color:DS.text, fontFamily:'"SF Mono",ui-monospace,monospace', fontWeight:600}}>92.40</span>
          <span style={{fontSize:10, color:DS.green, fontFamily:'"SF Mono",ui-monospace,monospace'}}>+0.3</span>
        </div>
        <div style={{
          width:36, height:36, borderRadius:11,
          background:DS.s1, border:`1px solid ${DS.border}`,
          display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={DS.sub} strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
          <div style={{position:'absolute', top:7, right:7, minWidth:14, height:14, borderRadius:7, padding:'0 4px',
            background:'var(--accent)', color:'var(--accentOn)', fontSize:9, fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center', border:`1.5px solid ${DS.bg}`}}>3</div>
        </div>
      </div>
    </div>
  );
}

// ── AI Panel v3 — bottom sheet, ~38% of phone height ───────
function AIPanelV3({ onAI, onAIMsg }) {
  const chips = [
    'Найти поставщиков в Китае',
    'Рассчитать доставку и налоги',
    'Сравнить предложения фабрик',
    'Найти проверенных производителей',
    'Перевести переписку',
    'Рассчитать итоговую стоимость',
  ];
  return (
    <div style={{
      position:'relative', flexShrink:0,
      borderRadius:'28px 28px 0 0', overflow:'hidden',
      background:'linear-gradient(180deg, rgba(26,29,32,0.94) 0%, rgba(16,18,21,0.98) 100%)',
      backdropFilter:'blur(28px) saturate(170%)',
      WebkitBackdropFilter:'blur(28px) saturate(170%)',
      borderTop:`1px solid ${DS.border3}`,
      boxShadow:`0 -16px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)`,
    }}>
      {/* hairline accent at top */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:1,
        background:`linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)`,
        opacity:0.55, pointerEvents:'none'}}/>
      {/* grabber */}
      <div style={{display:'flex', justifyContent:'center', paddingTop:9, paddingBottom:6}}>
        <div style={{width:38, height:4, borderRadius:2, background:'rgba(255,255,255,0.15)'}}/>
      </div>

      {/* Header row */}
      <div style={{padding:'4px 18px 10px', display:'flex', alignItems:'center', gap:12}}>
        <AIOrb size={42}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14.5, fontWeight:700, color:DS.text, letterSpacing:-0.25, display:'flex', alignItems:'center', gap:7, lineHeight:1.15}}>
            AI-ассистент по закупкам
          </div>
          <div style={{fontSize:11.5, color:DS.sub, marginTop:3, lineHeight:1.35, letterSpacing:-0.05}}>
            Найдёт поставщиков, рассчитает стоимость и поможет с выбором
          </div>
        </div>
        <div style={{
          fontSize:9, fontWeight:700, letterSpacing:'0.1em',
          color:'var(--accent)', textTransform:'uppercase',
          display:'flex', alignItems:'center', gap:5, flexShrink:0,
        }}>
          <span style={{width:6, height:6, borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 6px var(--accent)'}}/>
          Online
        </div>
      </div>

      {/* Chip rail — 2 rows */}
      <div style={{padding:'0 18px 12px', display:'grid', gridTemplateColumns:'auto auto auto', gap:7, overflow:'hidden'}}>
        {chips.slice(0,3).map(t => (
          <div key={t} onClick={()=>onAIMsg(t)} style={{
            fontSize:11.5, color:DS.text, fontWeight:500,
            background:'rgba(255,255,255,0.04)',
            border:`1px solid ${DS.border2}`,
            borderRadius:11, padding:'7px 11px',
            cursor:'pointer',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          }}>{t}</div>
        ))}
      </div>
      <div style={{padding:'0 18px 14px', display:'flex', gap:7, overflowX:'auto', flexShrink:0}}>
        {chips.slice(3).map(t => (
          <div key={t} onClick={()=>onAIMsg(t)} style={{
            fontSize:11.5, color:DS.text, fontWeight:500, flexShrink:0,
            background:'rgba(255,255,255,0.04)',
            border:`1px solid ${DS.border2}`,
            borderRadius:11, padding:'7px 11px',
            cursor:'pointer', whiteSpace:'nowrap',
          }}>{t}</div>
        ))}
      </div>

      {/* Input row */}
      <div style={{padding:'0 16px 14px'}}>
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          background:'rgba(255,255,255,0.05)',
          border:`1px solid ${DS.border3}`,
          borderRadius:16, padding:'8px 8px 8px 16px',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 4px var(--accentDim)',
        }}>
          <input readOnly onFocus={onAI} placeholder="Опишите товар или задачу"
            style={{flex:1, background:'none', border:'none', outline:'none',
              color:DS.text, fontSize:13.5, fontFamily:'inherit', cursor:'pointer'}}/>
          <div style={{
            width:32, height:32, borderRadius:10,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer',
          }}>
            <svg width="13" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="12" rx="3" stroke={DS.sub} strokeWidth="1.8"/>
              <path d="M5 11a7 7 0 0014 0M12 18v3" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div onClick={onAI} style={{
            width:40, height:40, borderRadius:13, background:'var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer',
            boxShadow:'0 4px 16px var(--accentDim2)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--accentOn)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BUYER HOME v3 — main composition ───────────────────────
function BuyerHome({ nav, role }) {
  const [tab, setTab] = React.useState('foryou');
  const [feedFilter, setFeedFilter] = React.useState('all');
  const [draft, setDraft] = React.useState('');
  const [sheetExpanded, setSheetExpanded] = React.useState(false);

  const stories = [
    { id:'sp', label:'Спецпредл.',  hot:true,  glyph:'fire'   },
    { id:'p',  label:'Прайс',       hot:false, glyph:'price'  },
    { id:'ai', label:'AI: спрос',   hot:true,  glyph:'ai',    self:true },
    { id:'cat',label:'Каталог +',   hot:false, glyph:'box'    },
    { id:'log',label:'Логистика',   hot:false, glyph:'ship'   },
    { id:'fab',label:'Фабрика',     hot:false, glyph:'factory'},
  ];

  // Hero is always shown at top of "all" feed
  const hero = {
    type:'hero', id:'h1',
    cover:'metal',
    eyebrow:'СПЕЦПРЕДЛОЖЕНИЕ',
    title:'Сталь 316L 0.5 мм со скидкой 8% до конца декабря',
    supplier:{ name:'Shenzhen Yifeng Steel', city:'Шэньчжэнь', country:'CN', verified:true, badge:'Top-5', initials:'SY' },
    price:'$2.40',
    unit:'кг',
    moq:'500 кг',
  };

  const feed = [
    {
      type:'supplier_post', id:'f1',
      author:{ name:'Foshan MetalCorp', city:'Фошань', country:'CN', verified:true, badge:'Pro', initials:'FM' },
      time:'2 ч',
      cover:'industrial',
      text:'Запустили новый цех холодного проката. Принимаем заявки на пробные партии — экспорт в РФ за 18 дней.',
    },
    {
      type:'market_news', id:'f2',
      headline:'Юань укрепился к рублю на 1.4%',
      summary:'Эксперты прогнозируют коридор 12.6–13.1 ₽ на горизонте двух недель и рекомендуют фиксировать сделки сейчас.',
      ai:'Ваш текущий заказ Yifeng подорожает примерно на 4 200 ₽ при оплате через неделю.',
      source:'РБК',
      time:'14:20',
    },
    {
      type:'ai_recommendation', id:'f3',
      title:'3 поставщика под вашу задачу',
      ctx:'на основе истории закупок · сталь 316L',
      items:[
        { name:'Yifeng Steel',     city:'Шэньчжэнь', why:'Лучший рейтинг · 320 сделок' },
        { name:'Foshan MetalCorp', city:'Фошань',    why:'Цена ниже на 5%' },
        { name:'Tianjin Iron',     city:'Тяньцзинь', why:'MOQ 5 т, объёмы' },
      ],
    },
    {
      type:'product_spotlight', id:'f4',
      product:{
        title:'Алюминиевый профиль 6063-T5',
        cover:'industrial',
        price:'$1.85',
        unit:'кг',
        moq:'1 000 кг',
        supplier:'Tianjin Iron Group',
        tag:'Выгодное предложение',
      },
    },
    {
      type:'supplier_update', id:'f5',
      author:{ name:'Tianjin Iron Group', city:'Тяньцзинь', country:'CN', verified:true, initials:'TI' },
      time:'5 ч',
      text:'Производство загружено на 87%. Ближайший слот для новых заказов — 12 мая.',
    },
  ];

  const filtered = feedFilter === 'all' ? feed
    : feedFilter === 'suppliers' ? feed.filter(f=>['supplier_post','supplier_update'].includes(f.type))
    : feedFilter === 'products'  ? feed.filter(f=>f.type==='product_spotlight')
    : feedFilter === 'news'      ? feed.filter(f=>f.type==='market_news')
    : feed.filter(f=>f.type==='ai_recommendation');

  const showHero = feedFilter === 'all';
  const SHEET_H = 304;

  return (
    <div style={{height:'100%', background:DS.bg, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden', position:'relative'}}>

      {/* HEADER */}
      <div style={{flexShrink:0, background:DS.bg}}>
        <div style={{padding:'2px 16px 9px', display:'flex', alignItems:'center', gap:10}}>
          <div style={{display:'flex', alignItems:'center', gap:7, flexShrink:0}}>
            <div style={{
              width:26, height:26, borderRadius:7,
              background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <div style={{width:9, height:9, borderRadius:'50%', background:DS.bg}}/>
            </div>
            <div style={{fontSize:14.5, fontWeight:800, color:DS.text, letterSpacing:-0.4, lineHeight:1}}>
              TradeAI
              <span style={{fontSize:8, fontWeight:700, color:'var(--accent)', letterSpacing:'0.1em', marginLeft:5, fontFamily:'"SF Mono",ui-monospace,monospace'}}>B2B</span>
            </div>
          </div>
          <div style={{flex:1}}/>
          {/* Inline tabs (compact) */}
          <div style={{display:'flex', gap:0, padding:2, background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`, borderRadius:9}}>
            {[
              {id:'foryou',    label:'Для вас'},
              {id:'following', label:'Подписки'},
              {id:'market',    label:'Рынок'},
            ].map(t=>{
              const on = tab===t.id;
              return (
                <div key={t.id} onClick={()=>setTab(t.id)} style={{
                  padding:'4px 9px', borderRadius:7, cursor:'pointer',
                  background: on ? `linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)` : 'transparent',
                  fontSize:10, fontWeight: on?800:700,
                  color: on ? 'var(--accentOn)' : DS.sub,
                  letterSpacing:-0.05, transition:'all .18s', whiteSpace:'nowrap',
                  boxShadow: on ? '0 2px 6px var(--accentDim2)' : 'none',
                }}>{t.label}</div>
              );
            })}
          </div>
          <div style={{position:'relative', width:30, height:30, borderRadius:8, cursor:'pointer',
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9 M14 21a2 2 0 01-4 0" stroke={DS.text} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div style={{position:'absolute', top:-2, right:-2, width:7, height:7, borderRadius:'50%',
              background:'var(--accent)', border:`2px solid ${DS.bg}`,
            }}/>
          </div>
          <div onClick={()=>nav('profile')} style={{
            width:30, height:30, borderRadius:8, cursor:'pointer', flexShrink:0,
            background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
            border:`1px solid var(--accentDim2)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:10.5, fontWeight:800, color:DS.text, letterSpacing:-0.3,
          }}>ИВ</div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div style={{flex:1, overflowY:'auto', paddingBottom: SHEET_H + 12}}>

        {/* Search row */}
        <div style={{padding:'8px 16px 10px'}}>
          <div onClick={()=>nav('search')} style={{
            display:'flex', alignItems:'center', gap:9, cursor:'pointer',
            background:'rgba(255,255,255,0.04)',
            border:`1px solid ${DS.border}`, borderRadius:12,
            padding:'10px 11px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={DS.muted} strokeWidth="1.7"/><path d="M21 21l-4-4" stroke={DS.muted} strokeWidth="1.7" strokeLinecap="round"/></svg>
            <span style={{flex:1, fontSize:12, color:DS.muted, letterSpacing:-0.05, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              Поиск товаров, поставщиков, публикаций и фабрик
            </span>
            <div style={{display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:6,
              background:'var(--accentDim)', border:`1px solid var(--accentDim2)`}}>
              <div style={{width:5, height:5, borderRadius:'50%', background:'var(--accent)'}}/>
              <span style={{fontSize:9.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.06em', textTransform:'uppercase'}}>Спросить AI</span>
            </div>
          </div>
        </div>

        {/* STORIES (compact) */}
        <div style={{padding:'2px 0 10px'}}>
          <div style={{display:'flex', gap:10, overflowX:'auto', padding:'0 16px 4px', scrollbarWidth:'none'}}>
            {stories.map(s => <StoryItem key={s.id} item={s}/>)}
          </div>
        </div>

        {/* FEED FILTER (slim sticky) */}
        <div style={{position:'sticky', top:0, background:DS.bg, zIndex:1, padding:'4px 0 10px'}}>
          <div style={{display:'flex', gap:14, overflowX:'auto', padding:'0 16px',
            borderBottom:`1px solid ${DS.border}`, scrollbarWidth:'none',
          }}>
            {[
              {id:'all',       label:'Лента'},
              {id:'suppliers', label:'Поставщики'},
              {id:'products',  label:'Товары'},
              {id:'news',      label:'Новости'},
              {id:'ai',        label:'AI-подборка'},
            ].map(f=>{
              const on = feedFilter===f.id;
              return (
                <div key={f.id} onClick={()=>setFeedFilter(f.id)} style={{
                  flexShrink:0, padding:'6px 0 9px',
                  borderBottom: on ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom:-1,
                  fontSize:12, fontWeight: on?800:600,
                  color: on ? DS.text : DS.muted,
                  letterSpacing:-0.05, cursor:'pointer',
                  transition:'all .18s', whiteSpace:'nowrap',
                }}>{f.label}</div>
              );
            })}
          </div>
        </div>

        {/* HERO CARD */}
        {showHero && (
          <div style={{padding:'2px 14px 12px'}}>
            <HeroCard item={hero} nav={nav}/>
          </div>
        )}

        {/* FEED — large rectangular cards */}
        <div style={{padding:'0 14px 12px', display:'flex', flexDirection:'column', gap:12}}>
          {filtered.map(item => <FeedCard key={item.id} item={item} nav={nav}/>)}

          {/* Commerce shortcuts — unified single rectangular block embedded in feed */}
          <ShortcutsBlock nav={nav}/>
        </div>
      </div>

      {/* AI BOTTOM SHEET */}
      <AISheet
        height={SHEET_H}
        expanded={sheetExpanded}
        onToggle={()=>setSheetExpanded(!sheetExpanded)}
        draft={draft}
        setDraft={setDraft}
        nav={nav}
      />
    </div>
  );
}

// ── STORY ITEM (compact) ───────────────────────────────────
function StoryItem({ item }) {
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:5, width:54, flexShrink:0}}>
      <div style={{
        width:50, height:50, borderRadius:'50%',
        padding:1.4,
        background: item.hot ? `conic-gradient(from 200deg, var(--accent) 0%, var(--accentDeep) 60%, var(--accent) 100%)` : DS.border2,
        position:'relative',
      }}>
        <div style={{
          width:'100%', height:'100%', borderRadius:'50%',
          background:DS.bg, padding:1.6,
        }}>
          <div style={{
            width:'100%', height:'100%', borderRadius:'50%',
            background: item.self
              ? `linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`
              : `linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            border: item.self ? 'none' : `1px solid ${DS.border2}`,
          }}>
            <StoryGlyph kind={item.glyph} self={item.self}/>
          </div>
        </div>
      </div>
      <div style={{fontSize:9, color:DS.sub, fontWeight:600, letterSpacing:-0.05, textAlign:'center', maxWidth:54, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.label}</div>
    </div>
  );
}

function StoryGlyph({ kind, self }) {
  const c = self ? 'var(--accentOn)' : DS.text;
  const s = 19;
  if(kind==='fire')   return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 2c1 4 3 5 3 8a3 3 0 11-6 0c0-2 2-3 3-8z M8 12c-1 2-2 3-2 5a6 6 0 0012 0c0-3-3-5-4-8" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if(kind==='price')  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 12l9-9 9 9-9 9-9-9z M9 9l6 6 M9 15l6-6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if(kind==='ai')     return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke={c} strokeWidth="1.5"/><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if(kind==='box')    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 8l9-5 9 5v8l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v9" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if(kind==='ship')   return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M2 18l2-7h16l2 7M5 11V7h14v4 M9 11V5h6v6 M2 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if(kind==='factory')return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 21V11l5 3V11l5 3V11l5 3v7H3z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return null;
}

// ── COVERS ─────────────────────────────────────────────────
function Cover({ kind, h=200, badge, children }) {
  const isMetal = kind==='metal';
  return (
    <div style={{height:h, position:'relative', overflow:'hidden',
      background: isMetal
        ? `linear-gradient(135deg, #2E3338 0%, #14181C 70%)`
        : `linear-gradient(135deg, #1F2226 0%, #0E1013 100%)`,
    }}>
      <div style={{position:'absolute', inset:0,
        backgroundImage: isMetal
          ? 'repeating-linear-gradient(115deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 14px)'
          : 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 22px)',
        pointerEvents:'none',
      }}/>
      {isMetal ? (
        <>
          <div style={{position:'absolute', left:'8%', top:'28%', width:'76%', height:'46%', borderRadius:8,
            background:'linear-gradient(180deg, #4A5057 0%, #1F2227 100%)',
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.1), 0 6px 20px rgba(0,0,0,0.4)', pointerEvents:'none',
          }}/>
          <div style={{position:'absolute', left:'12%', top:'33%', width:'68%', height:'36%',
            background:'repeating-linear-gradient(0deg, transparent 0 6px, rgba(0,0,0,0.18) 6px 7px)',
            pointerEvents:'none',
          }}/>
        </>
      ) : (
        <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" style={{position:'absolute', inset:0, opacity:0.55, pointerEvents:'none'}}>
          <path d="M20 80h160v15H20z M30 80V50l25 12V50l25 12V50l25 12V50l25 12V80 M40 80v-8h6v8 M65 80v-8h6v8 M90 80v-8h6v8 M115 80v-8h6v8 M140 80v-8h6v8" stroke={DS.sub} strokeWidth="0.8" fill="none"/>
          <path d="M40 50V30l5-3 5 3v6 M70 50V25l4-3 4 3v8" stroke={DS.muted} strokeWidth="0.8" fill="none"/>
        </svg>
      )}
      {/* gradient overlay for legibility */}
      <div style={{position:'absolute', inset:0,
        background:'linear-gradient(180deg, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.85) 100%)',
        pointerEvents:'none',
      }}/>
      {badge}
      {children}
    </div>
  );
}

// ── HERO CARD (large editorial block) ──────────────────────
function HeroCard({ item, nav }) {
  return (
    <div style={{
      borderRadius:18, overflow:'hidden',
      background:`linear-gradient(160deg, #16191D 0%, #0E1114 100%)`,
      border:`1px solid ${DS.border2}`,
      boxShadow:'0 12px 30px rgba(0,0,0,0.35)',
    }}>
      <Cover kind={item.cover} h={244}
        badge={
          <div style={{position:'absolute', top:14, left:14, display:'flex', alignItems:'center', gap:5,
            padding:'4px 9px', borderRadius:6,
            background:'var(--accent)',
          }}>
            <span style={{fontSize:9, fontWeight:900, color:'var(--accentOn)', letterSpacing:'0.14em'}}>−8%</span>
          </div>
        }
      >
        {/* Bottom-overlay content */}
        <div style={{position:'absolute', left:14, right:14, bottom:14}}>
          <div style={{fontSize:9, fontWeight:800, color:'var(--accent)', letterSpacing:'0.18em', marginBottom:6}}>{item.eyebrow}</div>
          <div style={{fontSize:18, fontWeight:800, color:'#fff', letterSpacing:-0.3, lineHeight:1.22, textShadow:'0 2px 12px rgba(0,0,0,0.6)'}}>{item.title}</div>
        </div>
      </Cover>

      {/* Footer row */}
      <div style={{padding:'12px 14px 14px', display:'flex', alignItems:'center', gap:10}}>
        <div style={{
          width:32, height:32, borderRadius:8, flexShrink:0,
          background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
          border:`1px solid ${DS.border2}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:10.5, fontWeight:800, color:DS.text, letterSpacing:-0.3,
        }}>{item.supplier.initials}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:5}}>
            <span style={{fontSize:11.5, fontWeight:700, color:DS.text, letterSpacing:-0.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.supplier.name}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="9" fill="var(--accent)"/><path d="M8 12.5l3 3 5-6" stroke="var(--accentOn)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:5, marginTop:1}}>
            <span style={{fontSize:9.5, color:DS.muted}}>{item.supplier.city}</span>
            <span style={{color:DS.border2, fontSize:9}}>·</span>
            <span style={{fontSize:18, fontWeight:800, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.3, lineHeight:1}}>{item.price}<span style={{fontSize:9.5, color:DS.muted, marginLeft:2}}>/{item.unit}</span></span>
            <span style={{color:DS.border2, fontSize:9}}>·</span>
            <span style={{fontSize:9.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>MOQ {item.moq}</span>
          </div>
        </div>
        <div onClick={()=>nav('product')} style={{
          height:36, padding:'0 14px', borderRadius:9, cursor:'pointer', flexShrink:0,
          background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 12px var(--accentDim2)',
        }}>
          <span style={{fontSize:11, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.05}}>Открыть товар</span>
        </div>
      </div>
    </div>
  );
}

// ── FEED CARD ROUTER ───────────────────────────────────────
function FeedCard({ item, nav }) {
  switch(item.type){
    case 'supplier_post':       return <SupplierPostCard item={item} nav={nav}/>;
    case 'product_spotlight':   return <ProductSpotlightCard item={item} nav={nav}/>;
    case 'market_news':         return <MarketNewsCard item={item} nav={nav}/>;
    case 'ai_recommendation':   return <AIRecCard item={item} nav={nav}/>;
    case 'supplier_update':     return <SupplierUpdateCard item={item} nav={nav}/>;
    default: return null;
  }
}

const _cardBase = {
  background:`linear-gradient(160deg, #16191D 0%, #0F1216 100%)`,
  border:`1px solid ${DS.border}`, borderRadius:18, overflow:'hidden',
};

function CardAuthor({ a, time, kind, compact }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10}}>
      <div style={{
        width:32, height:32, borderRadius:8, flexShrink:0,
        background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
        border:`1px solid ${DS.border2}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10.5, fontWeight:800, color:DS.text, letterSpacing:-0.3,
      }}>{a.initials}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:5, marginBottom:1}}>
          <span style={{fontSize:12, fontWeight:700, color:DS.text, letterSpacing:-0.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.name}</span>
          {a.verified && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="9" fill="var(--accent)"/><path d="M8 12.5l3 3 5-6" stroke="var(--accentOn)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <div style={{fontSize:9.5, color:DS.muted, letterSpacing:0.005, display:'flex', alignItems:'center', gap:5}}>
          {kind && <><span style={{fontWeight:700, color:'var(--accent)', letterSpacing:'0.08em', textTransform:'uppercase', fontSize:8.5}}>{kind}</span><span style={{color:DS.border2}}>·</span></>}
          <span>{a.city}</span>
          <span style={{color:DS.border2}}>·</span>
          <span>{time}</span>
          {a.badge && <><span style={{color:DS.border2}}>·</span><span style={{fontWeight:700, color:DS.sub}}>{a.badge}</span></>}
        </div>
      </div>
      {!compact && <div style={{width:26, height:26, borderRadius:6, background:'rgba(255,255,255,0.03)', border:`1px solid ${DS.border}`,
        display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0}}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.4" fill={DS.sub}/><circle cx="12" cy="12" r="1.4" fill={DS.sub}/><circle cx="12" cy="19" r="1.4" fill={DS.sub}/></svg>
      </div>}
    </div>
  );
}

// ── SUPPLIER POST (editorial) ──────────────────────────────
function SupplierPostCard({ item, nav }) {
  return (
    <div style={_cardBase}>
      <div style={{padding:'12px 14px 11px'}}>
        <CardAuthor a={item.author} time={item.time}/>
      </div>
      <Cover kind={item.cover} h={196}/>
      <div style={{padding:'13px 14px 14px'}}>
        <div style={{fontSize:13, color:DS.text, lineHeight:1.45, letterSpacing:-0.05, marginBottom:12}}>{item.text}</div>
        <div style={{display:'flex', gap:6}}>
          <div onClick={()=>nav('supplier',{supplier:{name:item.author.name, country:item.author.country, rating:'4.9'}})} style={{
            flex:1.4, height:36, borderRadius:9, cursor:'pointer',
            background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 12px var(--accentDim2)',
          }}>
            <span style={{fontSize:11, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.05}}>Открыть профиль</span>
          </div>
          <div onClick={()=>nav('chat',{supplier:{name:item.author.name, country:item.author.country}})} style={{
            flex:1, height:36, borderRadius:9, cursor:'pointer',
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{fontSize:11, fontWeight:700, color:DS.text, letterSpacing:-0.05}}>Связаться</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PRODUCT SPOTLIGHT (rectangular, premium) ───────────────
function ProductSpotlightCard({ item, nav }) {
  const p = item.product;
  return (
    <div style={_cardBase}>
      <Cover kind={p.cover} h={172}
        badge={
          <div style={{position:'absolute', top:14, left:14, display:'flex', alignItems:'center', gap:4,
            padding:'4px 9px', borderRadius:6,
            background:'rgba(0,0,0,0.6)', backdropFilter:'blur(10px)',
            border:`1px solid var(--accentDim2)`,
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
            <span style={{fontSize:9, fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase'}}>{p.tag}</span>
          </div>
        }
      >
        <div style={{position:'absolute', left:14, right:14, bottom:12}}>
          <div style={{fontSize:8.5, fontWeight:800, color:'rgba(255,255,255,0.7)', letterSpacing:'0.18em', marginBottom:4}}>ТОВАР</div>
          <div style={{fontSize:15, fontWeight:800, color:'#fff', letterSpacing:-0.2, lineHeight:1.25, textShadow:'0 2px 10px rgba(0,0,0,0.5)'}}>{p.title}</div>
        </div>
      </Cover>
      <div style={{padding:'13px 14px 14px'}}>
        <div style={{display:'flex', alignItems:'baseline', gap:11, marginBottom:5}}>
          <div style={{fontSize:22, fontWeight:800, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.3, lineHeight:1}}>{p.price}<span style={{fontSize:11, color:DS.muted, marginLeft:3}}>/{p.unit}</span></div>
          <div style={{flex:1, height:1, background:DS.border}}/>
          <span style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>MOQ {p.moq}</span>
        </div>
        <div style={{fontSize:10, color:DS.muted, marginBottom:11, letterSpacing:-0.05}}>от <span style={{color:DS.sub, fontWeight:600}}>{p.supplier}</span></div>
        <div style={{display:'flex', gap:6}}>
          <div onClick={()=>nav('product')} style={{
            flex:1.3, height:36, borderRadius:9, cursor:'pointer',
            background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 12px var(--accentDim2)',
          }}>
            <span style={{fontSize:11, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.05}}>Открыть товар</span>
          </div>
          <div style={{
            flex:1, height:36, borderRadius:9, cursor:'pointer',
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{fontSize:11, fontWeight:700, color:DS.text, letterSpacing:-0.05}}>Сравнить</span>
          </div>
          <div onClick={()=>nav('ai',{msg:`Сравни ${p.title} с альтернативами`})} style={{
            width:36, height:36, borderRadius:9, cursor:'pointer', flexShrink:0,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <div style={{width:6, height:6, borderRadius:'50%', background:'var(--accent)'}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MARKET NEWS (editorial insight) ────────────────────────
function MarketNewsCard({ item, nav }) {
  return (
    <div style={_cardBase}>
      <div style={{padding:'14px 16px 14px'}}>
        <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:11}}>
          <span style={{fontSize:9, fontWeight:800, color:'var(--accent)', letterSpacing:'0.16em'}}>РЫНОК</span>
          <div style={{width:14, height:1, background:DS.border2}}/>
          <span style={{fontSize:9.5, fontWeight:600, color:DS.muted, letterSpacing:-0.05}}>{item.source} · {item.time}</span>
        </div>
        <div style={{fontSize:18, fontWeight:800, color:DS.text, letterSpacing:-0.4, lineHeight:1.22, marginBottom:9}}>{item.headline}</div>
        <div style={{fontSize:12, color:DS.sub, lineHeight:1.5, letterSpacing:-0.05, marginBottom:13}}>{item.summary}</div>

        {/* AI insight strip */}
        <div style={{
          padding:'11px 12px', borderRadius:12, marginBottom:13,
          background:`linear-gradient(160deg, rgba(200,255,0,0.06) 0%, rgba(200,255,0,0.015) 100%)`,
          border:`1px solid var(--accentDim2)`,
          display:'flex', alignItems:'flex-start', gap:9,
        }}>
          <div style={{position:'relative', width:14, height:14, flexShrink:0, marginTop:1}}>
            <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'var(--accent)', pointerEvents:'none'}}/>
            <div style={{position:'absolute', inset:3, borderRadius:'50%', background:DS.bg, pointerEvents:'none'}}/>
            <div style={{position:'absolute', inset:5.5, borderRadius:'50%', background:'var(--accent)', pointerEvents:'none'}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:9, fontWeight:800, color:'var(--accent)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4}}>Почему это важно</div>
            <div style={{fontSize:11.5, color:DS.text, fontWeight:600, lineHeight:1.42, letterSpacing:-0.05}}>{item.ai}</div>
          </div>
        </div>

        <div style={{display:'flex', gap:6}}>
          <div style={{
            flex:1.3, height:34, borderRadius:9, cursor:'pointer',
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{fontSize:11, fontWeight:700, color:DS.text, letterSpacing:-0.05}}>Открыть анализ</span>
          </div>
          <div onClick={()=>nav('ai',{msg:`Объясни новость: ${item.headline}`})} style={{
            flex:1, height:34, borderRadius:9, cursor:'pointer',
            background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 3px 10px var(--accentDim2)',
          }}>
            <span style={{fontSize:11, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.05}}>Спросить AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI RECOMMENDATION (calm, embedded) ─────────────────────
function AIRecCard({ item, nav }) {
  return (
    <div style={{
      ..._cardBase,
      background:`linear-gradient(160deg, #181B1F 0%, #0F1216 70%)`,
      border:`1px solid var(--accentDim2)`,
    }}>
      <div style={{padding:'13px 16px 14px'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
          <div style={{
            width:22, height:22, borderRadius:6, flexShrink:0,
            background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="var(--accentOn)" strokeWidth="2"/><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2" stroke="var(--accentOn)" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <span style={{fontSize:9, fontWeight:800, color:'var(--accent)', letterSpacing:'0.16em'}}>AI-ПОДБОРКА</span>
          <div style={{flex:1}}/>
          <span style={{fontSize:9.5, color:DS.muted, letterSpacing:-0.05}}>{item.ctx}</span>
        </div>
        <div style={{fontSize:16, fontWeight:800, color:DS.text, letterSpacing:-0.3, lineHeight:1.25, marginBottom:11}}>{item.title}</div>

        <div style={{display:'flex', flexDirection:'column', marginBottom:13, borderTop:`1px solid ${DS.border}`}}>
          {item.items.map((s,i)=>(
            <div key={i} onClick={()=>nav('supplier',{supplier:{name:s.name, country:'CN', rating:'4.8'}})} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 0', cursor:'pointer',
              borderBottom:`1px solid ${DS.border}`,
            }}>
              <div style={{
                width:30, height:30, borderRadius:7, flexShrink:0,
                background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
                border:`1px solid ${DS.border2}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:800, color:DS.text, letterSpacing:-0.2,
              }}>{s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
              <div style={{
                width:18, height:18, borderRadius:'50%', flexShrink:0,
                background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:9.5, fontWeight:900, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace',
              }}>{i+1}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:12, fontWeight:700, color:DS.text, letterSpacing:-0.1, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.name}</div>
                <div style={{fontSize:9.5, color:DS.muted, marginTop:2, letterSpacing:-0.05, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.city} · {s.why}</div>
              </div>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M9 6l6 6-6 6" stroke={DS.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          ))}
        </div>

        <div style={{display:'flex', gap:6}}>
          <div style={{
            flex:1.3, height:34, borderRadius:9, cursor:'pointer',
            background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 3px 10px var(--accentDim2)',
          }}>
            <span style={{fontSize:11, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.05}}>Открыть подборку</span>
          </div>
          <div onClick={()=>nav('ai',{msg:'Рассчитай стоимость для топ-3'})} style={{
            flex:1, height:34, borderRadius:9, cursor:'pointer',
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{fontSize:11, fontWeight:700, color:DS.text, letterSpacing:-0.05}}>Рассчитать</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SUPPLIER UPDATE (compact rect) ─────────────────────────
function SupplierUpdateCard({ item, nav }) {
  return (
    <div style={_cardBase}>
      <div style={{padding:'13px 16px 14px'}}>
        <CardAuthor a={item.author} time={item.time} kind="Производство"/>
        <div style={{fontSize:13, color:DS.text, lineHeight:1.45, letterSpacing:-0.05, marginTop:11, marginBottom:12}}>
          {item.text}
        </div>
        <div style={{display:'flex', gap:6}}>
          <div style={{
            flex:1, height:34, borderRadius:9, cursor:'pointer',
            background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:5,
            boxShadow:'0 3px 10px var(--accentDim2)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="var(--accentOn)" strokeWidth="2.2" strokeLinecap="round"/></svg>
            <span style={{fontSize:11, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.05}}>Подписаться</span>
          </div>
          <div onClick={()=>nav('supplier',{supplier:{name:item.author.name, country:item.author.country, rating:'4.7'}})} style={{
            flex:1, height:34, borderRadius:9, cursor:'pointer',
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{fontSize:11, fontWeight:700, color:DS.text, letterSpacing:-0.05}}>Открыть фабрику</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMMERCE SHORTCUTS — unified rectangular block ─────────
function ShortcutsBlock({ nav }) {
  const items = [
    {id:'catalog', label:'Каталог',   nav:'catalog',  ic:'box'},
    {id:'deals',   label:'Сделки',    nav:'tracking', ic:'check'},
    {id:'msg',     label:'Сообщения', nav:'chat',     ic:'msg', badge:2},
    {id:'pay',     label:'Оплата',    nav:'deal',     ic:'shield'},
    {id:'files',   label:'Файлы',     nav:null,       ic:'file'},
    {id:'fact',    label:'Фабрики',   nav:'catalog',  ic:'factory'},
  ];
  const ICO = {
    box:    <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    check:  <><path d="M9 11l3 3L22 4 M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9c2 0 4 .7 5.5 1.8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    msg:    <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    shield: <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z M9 12l2 2 4-4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    file:   <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6 M9 13h6 M9 17h6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    factory:<path d="M3 21V11l5 3V11l5 3V11l5 3v7H3z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
  };
  return (
    <div style={{
      ..._cardBase,
      padding:'14px 14px 14px',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:11}}>
        <span style={{fontSize:9, fontWeight:800, color:DS.text, letterSpacing:'0.16em'}}>БЫСТРЫЙ ДОСТУП</span>
        <div style={{flex:1, height:1, background:DS.border}}/>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:2}}>
        {items.map(s=>(
          <div key={s.id} onClick={()=>s.nav && nav(s.nav)} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:6,
            padding:'2px 0 0', cursor:'pointer', position:'relative',
          }}>
            <div style={{position:'relative', width:24, height:24,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.text}>{ICO[s.ic]}</svg>
              {s.badge && <div style={{position:'absolute', top:-4, right:-6, minWidth:13, height:13, padding:'0 3px', borderRadius:7,
                background:'var(--accent)', color:'var(--accentOn)', fontSize:8, fontWeight:900,
                display:'flex', alignItems:'center', justifyContent:'center', border:`1.5px solid #16191D`,
              }}>{s.badge}</div>}
            </div>
            <div style={{fontSize:9.5, color:DS.sub, fontWeight:600, letterSpacing:-0.05, textAlign:'center', lineHeight:1.1}}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI BOTTOM SHEET ────────────────────────────────────────
function AISheet({ height, expanded, onToggle, draft, setDraft, nav }) {
  const h = expanded ? Math.min(height + 220, 560) : height;
  return (
    <div style={{
      position:'absolute', left:0, right:0, bottom:0, height:h,
      background:`linear-gradient(180deg, rgba(11,12,14,0.0) 0%, rgba(11,12,14,0.95) 18%, #0B0C0E 35%)`,
      pointerEvents:'auto',
      display:'flex', flexDirection:'column',
      transition:'height .3s cubic-bezier(.4,0,.2,1)',
    }}>
      {/* Subtle separator (no glow) */}
      <div style={{position:'absolute', top:14, left:14, right:14, height:1,
        background: DS.border, pointerEvents:'none',
      }}/>

      <div style={{
        flex:1, margin:'14px 12px 0', borderRadius:'18px 18px 0 0',
        background:`linear-gradient(180deg, #14171B 0%, #0F1216 100%)`,
        border:`1px solid ${DS.border2}`, borderBottom:'none',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div onClick={onToggle} style={{display:'flex', justifyContent:'center', paddingTop:7, paddingBottom:5, cursor:'pointer'}}>
          <div style={{width:38, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)'}}/>
        </div>

        {/* Header */}
        <div style={{padding:'2px 14px 10px', display:'flex', alignItems:'center', gap:10}}>
          <div style={{
            width:32, height:32, borderRadius:9, flexShrink:0,
            background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="var(--accentOn)" strokeWidth="1.8"/><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2" stroke="var(--accentOn)" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:1}}>
              <div style={{fontSize:12.5, fontWeight:800, color:DS.text, letterSpacing:-0.2}}>AI-ассистент по закупкам</div>
              <div style={{display:'flex', alignItems:'center', gap:3, padding:'1px 5px', borderRadius:4,
                background:'var(--accentDim)', border:`1px solid var(--accentDim2)`}}>
                <div style={{width:4, height:4, borderRadius:'50%', background:'var(--accent)'}}/>
                <span style={{fontSize:8, fontWeight:800, color:'var(--accent)', letterSpacing:'0.06em', textTransform:'uppercase'}}>online</span>
              </div>
            </div>
            <div style={{fontSize:9.5, color:DS.muted, letterSpacing:-0.03, lineHeight:1.3}}>Найдёт поставщиков, покажет рынок и поможет в сделке</div>
          </div>
          <div onClick={()=>nav('ai')} style={{
            width:30, height:30, borderRadius:8, cursor:'pointer',
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7 M9 7h8v8" stroke={DS.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{padding:'0 14px 10px'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
            {[
              {label:'Найти поставщиков',     ic:'search',  msg:'Найди поставщиков по моему запросу'},
              {label:'Сравнить предложения',  ic:'compare', msg:'Сравни топ-3 предложения'},
              {label:'Рассчитать стоимость',  ic:'calc',    msg:'Рассчитай полную стоимость с доставкой'},
              {label:'Подготовить сообщение', ic:'msg',     msg:'Подготовь сообщение поставщику'},
              {label:'Что выгодно купить?',   ic:'star',    msg:'Что сейчас выгодно купить?'},
              {label:'Новости рынка',         ic:'news',    msg:'Покажи новости рынка'},
            ].map(a=>(
              <QuickAction key={a.label} a={a} onPress={()=>nav('ai',{msg:a.msg})}/>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div style={{padding:'2px 14px 14px', marginTop:'auto'}}>
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            background:`linear-gradient(160deg, #0E1114 0%, #07080A 100%)`,
            border:`1px solid ${DS.border2}`, borderRadius:12,
            padding:'5px 5px 5px 12px',
          }}>
            <input
              value={draft}
              onChange={e=>setDraft(e.target.value)}
              placeholder="Опишите товар, задачу или вопрос"
              style={{
                flex:1, background:'transparent', border:'none', outline:'none',
                color:DS.text, fontSize:12.5, fontFamily:'inherit', letterSpacing:-0.05,
                padding:'8px 0',
              }}
            />
            <div onClick={()=>{ if(draft.trim()) nav('ai',{msg:draft}); }} style={{
              width:34, height:34, borderRadius:9, cursor:'pointer', flexShrink:0,
              background: draft.trim() ? `linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)` : 'rgba(255,255,255,0.04)',
              border: draft.trim() ? '1px solid transparent' : `1px solid ${DS.border}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: draft.trim() ? '0 3px 10px var(--accentDim2)' : 'none',
              transition:'all .2s',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={draft.trim()?'var(--accentOn)':DS.muted} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{flexShrink:0, padding:'8px 10px 22px',
        background:'rgba(8,9,11,0.95)', backdropFilter:'blur(14px)',
      }}>
        <div style={{display:'flex', justifyContent:'space-around', alignItems:'center'}}>
          {[
            {id:'home',     label:'Главная',   ic:'home',   on:true,  nav:null},
            {id:'catalog',  label:'Каталог',   ic:'box',    nav:'catalog'},
            {id:'msg',      label:'Сообщения', ic:'msg',    badge:2, nav:'chat'},
            {id:'deal',     label:'Сделки',    ic:'check',  nav:'tracking'},
            {id:'profile',  label:'Профиль',   ic:'user',   nav:'profile'},
          ].map(t=>(
            <NavItem key={t.id} t={t} onPress={()=>t.nav && nav(t.nav)}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ a, onPress }) {
  const ICO = {
    search:  <><circle cx="11" cy="11" r="6" strokeWidth="1.6"/><path d="M21 21l-4-4" strokeWidth="1.6" strokeLinecap="round"/></>,
    compare: <path d="M9 3L4 8h5v6h2V8h5l-5-5z M15 21l5-5h-5v-6h-2v6H8l5 5z" strokeWidth="1.4" strokeLinejoin="round"/>,
    calc:    <><rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="1.5"/><path d="M8 7h8M8 11h2M11 11h2M14 11h2M8 15h2M11 15h2M14 15h2M8 19h8" strokeWidth="1.4" strokeLinecap="round"/></>,
    msg:     <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    star:    <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" strokeWidth="1.4" strokeLinejoin="round"/>,
    news:    <path d="M3 7v13h18V7 M3 7l9-4 9 4 M9 13h6 M9 17h6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>,
  };
  return (
    <div onClick={onPress} style={{
      display:'flex', alignItems:'center', gap:7, padding:'8px 9px', cursor:'pointer',
      background:'rgba(255,255,255,0.025)',
      border:`1px solid ${DS.border}`, borderRadius:9,
    }}>
      <div style={{width:18, height:18, borderRadius:5, flexShrink:0,
        background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)">{ICO[a.ic]}</svg>
      </div>
      <span style={{fontSize:10.5, fontWeight:600, color:DS.text, letterSpacing:-0.05, lineHeight:1.2, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.label}</span>
    </div>
  );
}

function NavItem({ t, onPress }) {
  const ICO = {
    home: <path d="M3 12l9-9 9 9 M5 10v11h5v-7h4v7h5V10" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    box:  <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    msg:  <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>,
    check:<path d="M9 11l3 3L22 4 M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9c2 0 4 .7 5.5 1.8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    user: <><circle cx="12" cy="8" r="4" strokeWidth="1.6"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeWidth="1.6" strokeLinecap="round"/></>,
  };
  const c = t.on ? 'var(--accent)' : DS.muted;
  return (
    <div onClick={onPress} style={{
      display:'flex', flexDirection:'column', alignItems:'center', gap:3,
      padding:'4px 10px', cursor:'pointer', position:'relative',
    }}>
      <div style={{position:'relative'}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c}>{ICO[t.ic]}</svg>
        {t.badge && <div style={{position:'absolute', top:-3, right:-5, minWidth:13, height:13, padding:'0 3px', borderRadius:7,
          background:'var(--accent)', color:'var(--accentOn)', fontSize:8, fontWeight:900,
          display:'flex', alignItems:'center', justifyContent:'center', border:`1.5px solid #08090B`,
        }}>{t.badge}</div>}
      </div>
      <span style={{fontSize:9, fontWeight:700, color:c, letterSpacing:-0.03}}>{t.label}</span>
    </div>
  );
}


window.BuyerHome = BuyerHome;



// ── 06 CATALOG v3 ──────────────────────────────────────────
function Catalog({ nav, role, ctx }) {
  const [view, setView] = React.useState('products');
  const [filter, setFilter] = React.useState(ctx?.cat || 'Все');

  const filters = [
    { id:'verified', label:'Проверенные',  icon:'✓' },
    { id:'country',  label:'Страна',       chevron:true },
    { id:'moq',      label:'MOQ',          chevron:true },
    { id:'price',    label:'Цена',         chevron:true },
    { id:'ship',     label:'Доставка',     chevron:true },
  ];
  const [activeFilters, setActiveFilters] = React.useState({verified:true});

  const cats = ['Все','Металл','Текстиль','Электроника','Упаковка','Оборудование'];
  const prods = filter==='Все' ? PRODUCTS : PRODUCTS.filter(p => p.cat.startsWith(filter.slice(0,4)));
  const sups  = filter==='Все' ? SUPPLIERS : SUPPLIERS.filter(s => s.cat.startsWith(filter.slice(0,4)));

  return (
    <div style={{height:'100%', background:`radial-gradient(120% 80% at 50% -10%, #14181C 0%, ${DS.bg} 65%)`, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'10px 20px 0', flexShrink:0, display:'flex', alignItems:'flex-end', justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:10, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700, marginBottom:3}}>Discovery</div>
          <div style={{fontSize:24, fontWeight:800, color:DS.text, letterSpacing:-0.5, lineHeight:1}}>Каталог</div>
        </div>
        <div style={{display:'flex', gap:7}}>
          <div style={{
            height:36, borderRadius:11, padding:'0 11px',
            background:DS.s1, border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', gap:6, cursor:'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M6 12h12M10 18h4" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/></svg>
            <span style={{fontSize:11.5, color:DS.text, fontWeight:600}}>Сортировка</span>
          </div>
          <div style={{
            height:36, width:36, borderRadius:11,
            background:DS.s1, border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 4h18l-7 9v6l-4 2v-8L3 4z" stroke={DS.sub} strokeWidth="1.8" strokeLinejoin="round"/></svg>
            <div style={{position:'absolute', top:6, right:6, width:7, height:7, borderRadius:'50%', background:'var(--accent)', border:`1.5px solid ${DS.bg}`}}/>
          </div>
        </div>
      </div>

      {/* Search shortcut */}
      <div style={{padding:'12px 20px 0', flexShrink:0}}>
        <div onClick={()=>nav('search')}><SearchBar/></div>
      </div>

      {/* Segmented */}
      <div style={{padding:'12px 20px 0', flexShrink:0}}>
        <Segmented active={view} onChange={setView} items={[
          {id:'products',  label:`Товары · ${prods.length}`},
          {id:'suppliers', label:`Поставщики · ${sups.length}`},
        ]}/>
      </div>

      {/* Category chips */}
      <div style={{padding:'10px 0 0', display:'flex', gap:7, overflowX:'auto', flexShrink:0,
        paddingLeft:20, paddingRight:20, WebkitMaskImage:'linear-gradient(to right, #000 88%, transparent 100%)'}}>
        {cats.map(f => <FilterChip key={f} label={f} active={filter===f} onPress={()=>setFilter(f)}/>)}
      </div>

      {/* Filter row — sourcing-specific */}
      <div style={{padding:'8px 0 0', display:'flex', gap:7, overflowX:'auto', flexShrink:0,
        paddingLeft:20, paddingRight:20, WebkitMaskImage:'linear-gradient(to right, #000 88%, transparent 100%)'}}>
        {filters.map(f => {
          const on = activeFilters[f.id];
          return (
            <div key={f.id} onClick={()=>setActiveFilters(a=>({...a,[f.id]:!a[f.id]}))} style={{
              height:30, borderRadius:9, padding:'0 11px', flexShrink:0,
              background: on ? 'var(--accentDim)' : DS.s1,
              border: on ? `1px solid var(--accentDim2)` : `1px solid ${DS.border}`,
              color: on ? 'var(--accent)' : DS.sub,
              fontSize:12, fontWeight: on?700:500,
              display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap', cursor:'pointer',
            }}>
              {f.icon && <span style={{fontSize:10}}>{f.icon}</span>}
              {f.label}
              {f.chevron && <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>}
            </div>
          );
        })}
      </div>

      {/* AI strip */}
      <div style={{padding:'12px 20px 0', flexShrink:0}}>
        <AIStrip text="Сравнить через AI" sub="Подскажу, какой поставщик подходит под задачу" onPress={()=>nav('ai')}/>
      </div>

      {/* Results count */}
      <div style={{padding:'14px 20px 4px', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>
          {view==='products' ? `${prods.length} товаров` : `${sups.length} поставщиков`}
        </div>
        <div style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>обновлено 2 мин. назад</div>
      </div>

      {/* Results scroll */}
      <div style={{flex:1, overflowY:'auto', padding:'8px 20px 20px', display:'flex', flexDirection:'column', gap:8}}>
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

// ── 07 SEARCH v3 ───────────────────────────────────────────
function Search({ nav, ctx }) {
  const [q, setQ] = React.useState(ctx?.query || '');
  const [view, setView] = React.useState('all');

  const term = q.toLowerCase();
  const prods = !term ? PRODUCTS : PRODUCTS.filter(p=>p.name.toLowerCase().includes(term)||p.supplier.toLowerCase().includes(term)||p.cat.toLowerCase().includes(term));
  const sups  = !term ? SUPPLIERS : SUPPLIERS.filter(s=>s.name.toLowerCase().includes(term)||s.cat.toLowerCase().includes(term));

  const recent = [
    { q:'Сталь 316L', cat:'Металлы', count:42 },
    { q:'PCB Китай', cat:'Электроника', count:128 },
    { q:'Хлопок 200г/м²', cat:'Текстиль', count:67 },
    { q:'Упаковка крафт', cat:'Упаковка', count:31 },
  ];
  const trending = [
    { q:'Литьё под давлением', heat:'+38%' },
    { q:'OEM электроника', heat:'+24%' },
    { q:'Складная мебель', heat:'+19%' },
    { q:'Гофрокартон 5-сл.', heat:'+12%' },
  ];

  return (
    <div style={{height:'100%', background:`radial-gradient(120% 80% at 50% -10%, #14181C 0%, ${DS.bg} 65%)`, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      {/* Search header */}
      <div style={{padding:'10px 20px 0', flexShrink:0}}>
        <div style={{fontSize:10, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700, marginBottom:6}}>Search</div>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <BackBtn onPress={()=>nav('back')}/>
          <div style={{flex:1, position:'relative'}}>
            <div style={{
              height:50, borderRadius:14,
              background:DS.s1, border:`1px solid ${q?'var(--accentDim2)':DS.border}`,
              display:'flex', alignItems:'center', gap:10, padding:'0 12px 0 16px',
              boxShadow: q ? `0 0 0 4px var(--accentDim), inset 0 1px 0 rgba(255,255,255,0.03)` : 'inset 0 1px 0 rgba(255,255,255,0.03)',
              transition:'box-shadow .15s, border-color .15s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke={q?'var(--accent)':DS.sub} strokeWidth="1.8"/>
                <path d="M20 20l-4-4" stroke={q?'var(--accent)':DS.sub} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <input value={q} onChange={e=>setQ(e.target.value)} autoFocus
                placeholder="Поиск товаров, поставщиков и фабрик"
                style={{flex:1, background:'none', border:'none', outline:'none',
                  color:DS.text, fontSize:14, fontFamily:'inherit',
                  caretColor:'var(--accent)', fontWeight: q?600:400, letterSpacing:-0.1}}/>
              {q && (
                <div onClick={()=>setQ('')} style={{
                  width:22, height:22, borderRadius:'50%', background:'rgba(255,255,255,0.08)',
                  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={DS.sub} strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!q && (
        <div style={{flex:1, overflowY:'auto', padding:'18px 20px 20px', display:'flex', flexDirection:'column', gap:18}}>
          {/* Recent */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
              <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Недавние запросы</div>
              <div style={{fontSize:11, color:DS.sub, fontWeight:600, cursor:'pointer'}}>Очистить</div>
            </div>
            <div style={{background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:16, overflow:'hidden'}}>
              {recent.map((r,i)=>(
                <div key={r.q} onClick={()=>setQ(r.q)} style={{
                  padding:'12px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer',
                  borderBottom: i<recent.length-1 ? `1px solid ${DS.border}` : 'none',
                }}>
                  <div style={{
                    width:30, height:30, borderRadius:9,
                    background:DS.s2, border:`1px solid ${DS.border}`,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={DS.muted} strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke={DS.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13.5, fontWeight:600, color:DS.text, letterSpacing:-0.15, marginBottom:2, overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.q}</div>
                    <div style={{fontSize:10.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>
                      {r.cat} · {r.count} результатов
                    </div>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 5l7 7-7 7M21 12H3" stroke={DS.muted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
              <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Популярные запросы</div>
              <div style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>За 7 дней</div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {trending.map(t=>(
                <div key={t.q} onClick={()=>setQ(t.q)} style={{
                  background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:13,
                  padding:'10px 12px', cursor:'pointer',
                }}>
                  <div style={{fontSize:12.5, color:DS.text, fontWeight:600, letterSpacing:-0.15, marginBottom:5, lineHeight:1.2, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical'}}>{t.q}</div>
                  <div style={{fontSize:10.5, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace', fontWeight:700}}>↗ {t.heat}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI promo */}
          <AIStrip text="Уточнить запрос через AI" sub="Опишите задачу — найду поставщиков точнее" onPress={()=>nav('ai')}/>
        </div>
      )}

      {q && (
        <>
          <div style={{padding:'14px 20px 0', flexShrink:0}}>
            <AIStrip text={`Уточнить «${q}» через AI`} sub="Подберу 3 лучших варианта по вашему запросу" onPress={()=>nav('ai',{msg:q})}/>
          </div>
          <div style={{padding:'12px 20px 0', flexShrink:0}}>
            <Segmented active={view} onChange={setView} items={[
              {id:'all',       label:`Все · ${prods.length+sups.length}`},
              {id:'suppliers', label:`Поставщики · ${sups.length}`},
              {id:'products',  label:`Товары · ${prods.length}`},
            ]}/>
          </div>
          {view==='suppliers' && (
            <div style={{padding:'10px 20px 0', flexShrink:0}}>
              <FilterChip label="Только проверенные поставщики" active/>
            </div>
          )}
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


// ── 08 PRODUCT DETAIL ──────────────────────────────────
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
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
        {/* HERO v3 — premium framed media */}
        <div style={{
          height:260, flexShrink:0, borderRadius:22, position:'relative', overflow:'hidden',
          background:`linear-gradient(160deg, #1B1E22 0%, #0E1013 100%)`,
          border:`1px solid ${DS.border2}`,
          boxShadow:'0 1px 0 rgba(255,255,255,0.04) inset, 0 16px 40px rgba(0,0,0,0.45)',
        }}>
          {/* Illustration centered, larger and clean */}
          <div style={{position:'absolute', inset:'10% 12% 22% 12%', opacity:0.7, pointerEvents:'none'}}>
            <CatIllustration kind={p.kind || (p.cat==='Металлы'?'metal':p.cat==='Текстиль'?'textile':p.cat==='Электроника'?'electronics':p.cat==='Пластик'?'hw':'pack')}/>
          </div>
          {/* corner accent glow */}
          <div style={{position:'absolute', right:0, top:0, width:'70%', height:'70%',
            background:'radial-gradient(80% 80% at 100% 0%, var(--accentDim) 0%, transparent 65%)', pointerEvents:'none'}}/>
          {/* top row: index + favorite */}
          <div style={{position:'absolute', top:14, left:14, right:14, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{
              fontSize:9.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace',
              letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700,
              background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
              border:`1px solid ${DS.border}`, borderRadius:7, padding:'4px 8px',
            }}>SKU · {(p.id||'00')+'4382'}</div>
            <div style={{
              fontSize:10.5, color:DS.text, fontFamily:'"SF Mono",ui-monospace,monospace', fontWeight:600,
              background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
              border:`1px solid ${DS.border}`, borderRadius:8, padding:'4px 9px',
            }}>1 / 4</div>
          </div>
          {/* bottom: refined badges */}
          <div style={{position:'absolute', bottom:14, left:14, right:14, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
            <div style={{display:'flex', gap:6}}>
              <span style={{
                display:'inline-flex', alignItems:'center', gap:5,
                fontSize:10.5, fontWeight:700, color:'var(--accent)',
                background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
                border:`1px solid var(--accentDim2)`, borderRadius:8, padding:'5px 9px', letterSpacing:0.02,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 12.5l3 3 5-6" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Верифицирован
              </span>
              <span style={{
                fontSize:10.5, fontWeight:600, color:DS.text,
                background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
                border:`1px solid ${DS.border}`, borderRadius:8, padding:'5px 9px',
              }}>В наличии</span>
            </div>
            {/* page dots */}
            <div style={{display:'flex', gap:4, alignItems:'center'}}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  width: i===0?16:5, height:5, borderRadius:3,
                  background: i===0?'var(--accent)':'rgba(255,255,255,0.25)',
                  transition:'all .2s',
                }}/>
              ))}
            </div>
          </div>
        </div>

        {/* SUMMARY v3 — strong title + premium price hierarchy */}
        <div>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <span style={{
              fontSize:10, color:'var(--accent)', fontWeight:700,
              letterSpacing:'0.14em', textTransform:'uppercase',
              background:'var(--accentDim)', border:'1px solid var(--accentDim2)',
              borderRadius:5, padding:'3px 7px',
            }}>{p.cat}</span>
            <CountryChip code={p.country}/>
          </div>
          <div style={{fontSize:24, fontWeight:800, color:DS.text, letterSpacing:-0.6, lineHeight:1.12, marginBottom:14, textWrap:'pretty'}}>{p.name}</div>

          {/* Price card */}
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
            border:`1px solid ${DS.border2}`,
            borderRadius:18, padding:'14px 16px',
            position:'relative', overflow:'hidden',
          }}>
            <div style={{position:'absolute', right:-20, top:-20, width:120, height:120, borderRadius:'50%',
              background:'radial-gradient(circle, var(--accentDim) 0%, transparent 65%)', pointerEvents:'none'}}/>
            <div style={{position:'relative', display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12}}>
              <div>
                <div style={{fontSize:10, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700, marginBottom:4}}>Цена</div>
                <div style={{display:'flex', alignItems:'baseline', gap:6}}>
                  <span style={{fontSize:32, fontWeight:800, color:DS.text, letterSpacing:-0.8, fontFamily:'"SF Mono",ui-monospace,monospace', lineHeight:1}}>{p.price}</span>
                </div>
                <div style={{fontSize:11, color:DS.sub, marginTop:6, letterSpacing:-0.05}}>
                  при заказе от <span style={{color:DS.text, fontWeight:600, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{p.moq}</span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:10, color:DS.muted, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, marginBottom:4}}>Партия 500</div>
                <div style={{fontSize:14, fontWeight:700, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.3}}>−12%</div>
                <div style={{fontSize:10, color:DS.muted, marginTop:3, fontFamily:'"SF Mono",ui-monospace,monospace'}}>скидка</div>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS v3.2 — 2×2, icon glyphs, premium compact */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:9}}>
          {[
            {k:'MOQ',                v:p.moq,       sub:'мин. партия',
              icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 8l9-5 9 5-9 5-9-5z M3 13l9 5 9-5 M3 18l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>},
            {k:'Срок производства',  v:'20–30 дн.', sub:'после оплаты',
              icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>},
            {k:'Доставка',           v:'CN → RU',   sub:'18 дн. море',  accent:true,
              icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 17h18l-2-5H5l-2 5zM6 12V7h12v5M9 7V4h6v3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>},
            {k:'Материал',           v:'316L',      sub:'нерж. сталь',
              icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5z M12 12l9-5 M12 12L3 7 M12 12v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>},
          ].map(m=>(
            <div key={m.k} style={{
              background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
              border:`1px solid ${DS.border}`, borderRadius:14,
              padding:'11px 13px 12px', position:'relative', overflow:'hidden',
            }}>
              <div style={{display:'flex', alignItems:'center', gap:6, color:DS.muted, marginBottom:8}}>
                {m.icon}
                <span style={{fontSize:9.5, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700}}>{m.k}</span>
              </div>
              <div style={{
                fontSize:15, fontWeight:800, letterSpacing:-0.3, lineHeight:1,
                color: m.accent ? 'var(--accent)' : DS.text,
                fontFamily: '"SF Mono",ui-monospace,monospace',
              }}>{m.v}</div>
              <div style={{fontSize:10.5, color:DS.muted, marginTop:5, letterSpacing:-0.05}}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* SUPPLIER TRUST ROW v3 */}
        <div>
          <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8}}>Поставщик</div>
          <div onClick={()=>nav('supplier',{supplier:s})} style={{
            background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
            border:`1px solid ${DS.border2}`, borderRadius:18,
            padding:14, cursor:'pointer', position:'relative', overflow:'hidden',
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            <div style={{position:'absolute', right:0, top:0, width:'50%', height:'100%',
              background:'radial-gradient(80% 80% at 100% 0%, var(--accentDim) 0%, transparent 65%)', pointerEvents:'none'}}/>
            <div style={{position:'relative', display:'flex', alignItems:'center', gap:12}}>
              <div style={{
                width:52, height:52, borderRadius:14, flexShrink:0,
                background:`linear-gradient(135deg, var(--accentDim2) 0%, transparent 100%), linear-gradient(160deg, #1F2226 0%, #101215 100%)`,
                border:`1px solid ${DS.border2}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14.5, fontWeight:800, color:DS.text, letterSpacing:-0.4,
              }}>{s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                  <span style={{fontSize:14, fontWeight:700, color:DS.text, letterSpacing:-0.25, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="9" fill="var(--accent)"/><path d="M8 12.5l3 3 5-6" stroke="var(--accentOn)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{fontSize:10.5, fontWeight:700, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6}}>Проверенный поставщик</div>
                <div style={{display:'flex', gap:6, alignItems:'center', flexWrap:'wrap'}}>
                  <CountryChip code={s.country}/>
                  <span style={{fontSize:10.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>★ {s.rating}</span>
                  <span style={{fontSize:10.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>· {s.years || '6'} лет</span>
                </div>
              </div>
              <div style={{textAlign:'right', flexShrink:0}}>
                <div style={{fontSize:18, fontWeight:800, color:'var(--accent)', letterSpacing:-0.4, lineHeight:1, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{s.score || '94'}</div>
                <div style={{fontSize:9, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:'0.08em', textTransform:'uppercase', marginTop:4}}>trust</div>
              </div>
            </div>
            <div style={{position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:12, paddingTop:12, borderTop:`1px solid ${DS.border}`}}>
              {[
                {k:'Сделок',     v:'487'},
                {k:'На платформе',v:'2021'},
                {k:'Отклик',     v:'< 2 ч.'},
              ].map(x=>(
                <div key={x.k}>
                  <div style={{fontSize:9, color:DS.muted, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginBottom:3}}>{x.k}</div>
                  <div style={{fontSize:12.5, fontWeight:700, color:DS.text, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.2}}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SPECIFICATIONS v3 — grouped, elegant rows */}
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
            <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Характеристики</div>
            <div style={{fontSize:10.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{specs.length} полей</div>
          </div>
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:18, padding:'4px 14px',
          }}>
            {specs.map(([k,v],i)=>(
              <div key={k} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'12px 0', gap:12,
                borderBottom: i<specs.length-1?`1px solid ${DS.border}`:'none',
              }}>
                <span style={{fontSize:12, color:DS.muted, letterSpacing:-0.05, fontWeight:500}}>{k}</span>
                <span style={{
                  fontSize:12.5, color:DS.text, fontWeight:600, textAlign:'right', letterSpacing:-0.1,
                  fontFamily: /^[\d.,\-–\s/A-Z]+$/.test(v) ? '"SF Mono",ui-monospace,monospace' : 'inherit',
                }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI HELPER v3 — integrated sourcing copilot */}
        <div style={{
          background:`linear-gradient(135deg, var(--accentDim) 0%, rgba(255,255,255,0.02) 100%)`,
          border:`1px solid var(--accentDim2)`,
          borderRadius:18, padding:'14px 14px 12px',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{position:'absolute', right:-30, top:-30, width:140, height:140, borderRadius:'50%',
            background:'radial-gradient(circle, var(--accentDim) 0%, transparent 65%)', pointerEvents:'none'}}/>
          <div style={{position:'relative', display:'flex', alignItems:'center', gap:11, marginBottom:11}}>
            <AIOrb size={32}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.2, lineHeight:1.2}}>AI-помощник по товару</div>
              <div style={{fontSize:10.5, color:DS.sub, marginTop:2, lineHeight:1.3}}>Подскажу, рассчитаю, сравню — за 30 секунд</div>
            </div>
          </div>
          <div style={{position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
            {[
              {label:'Рассчитать стоимость', sub:'итог в рублях',  msg:`Рассчитай итоговую стоимость ${p.name}`,
                icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>},
              {label:'Сравнить предложения', sub:'3 варианта',     msg:`Сравни ${p.name} с другими поставщиками`,
                icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 6h7v14H4zM13 4h7v16h-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>},
              {label:'Спросить AI',          sub:'про этот товар', msg:`Расскажи подробнее про ${p.name}`,
                icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>},
            ].map(a=>(
              <div key={a.label} onClick={()=>nav('ai',{msg:a.msg})} style={{
                background:'rgba(0,0,0,0.25)',
                border:`1px solid ${DS.border2}`,
                borderRadius:12, padding:'10px 9px', cursor:'pointer',
                display:'flex', flexDirection:'column', gap:6,
                minHeight:74,
              }}>
                <div style={{color:'var(--accent)'}}>{a.icon}</div>
                <div style={{fontSize:11, fontWeight:700, color:DS.text, letterSpacing:-0.1, lineHeight:1.2, textWrap:'balance'}}>{a.label}</div>
                <div style={{fontSize:9.5, color:DS.muted, letterSpacing:0.02, marginTop:'auto'}}>{a.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECONDARY ACTIONS */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          <div onClick={()=>nav('estimate',{product:p})} style={{
            background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:14,
            padding:'12px 13px', cursor:'pointer', display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{
              width:32, height:32, borderRadius:9, flexShrink:0,
              background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
              display:'flex', alignItems:'center', justifyContent:'center', color:DS.sub,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M5 5h11a3 3 0 010 6H7a3 3 0 000 6h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:12.5, fontWeight:700, color:DS.text, letterSpacing:-0.15, lineHeight:1.2}}>Рассчитать</div>
              <div style={{fontSize:10, color:DS.muted, marginTop:2}}>доставка + налог</div>
            </div>
          </div>
          <div onClick={()=>nav('chat',{supplier:s})} style={{
            background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:14,
            padding:'12px 13px', cursor:'pointer', display:'flex', alignItems:'center', gap:10,
          }}>
            <div style={{
              width:32, height:32, borderRadius:9, flexShrink:0,
              background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
              display:'flex', alignItems:'center', justifyContent:'center', color:DS.sub,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18v12H7l-4 4V6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:12.5, fontWeight:700, color:DS.text, letterSpacing:-0.15, lineHeight:1.2}}>Запросить КП</div>
              <div style={{fontSize:10, color:DS.muted, marginTop:2}}>от поставщика</div>
            </div>
          </div>
        </div>
      </div>

      </div>
      {/* STICKY CTA v3 — premium dual-action */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, zIndex:10,
        padding:'18px 20px 28px',
        background:'linear-gradient(to top, rgba(11,12,14,0.98) 35%, rgba(11,12,14,0.85) 70%, transparent 100%)',
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
      }}>
        <div style={{
          display:'flex', gap:8, alignItems:'stretch',
          background:`linear-gradient(160deg, #16191D 0%, #0D0F12 100%)`,
          border:`1px solid ${DS.border2}`, borderRadius:16,
          padding:6,
          boxShadow:'0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          <div onClick={()=>nav('chat',{supplier:s})} style={{
            flex:1, height:50, borderRadius:11,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            cursor:'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18v12H7l-4 4V6z" stroke={DS.text} strokeWidth="1.8" strokeLinejoin="round"/></svg>
            <span style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.15}}>Написать</span>
          </div>
          <div onClick={()=>nav('deal',{product:p})} style={{
            flex:1.4, height:50, borderRadius:11,
            background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            cursor:'pointer', position:'relative', overflow:'hidden',
            boxShadow:'0 6px 20px var(--accentDim2), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}>
            <span style={{fontSize:14, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.2}}>Начать сделку</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="var(--accentOn)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div style={{
          marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          fontSize:10, color:DS.muted, letterSpacing:'0.05em',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" stroke="var(--accent)" strokeWidth="1.6"/><path d="M9 12l2 2 4-4" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Защищённая сделка · Escrow · возврат при браке</span>
        </div>
      </div>
    </div>
  );
}
window.Product = Product;

// ── 09 SUPPLIER PROFILE ────────────────────────────────
// ── 09 SUPPLIER PROFILE ────────────────────────────────────
function Supplier({ nav, ctx }) {
  const s = ctx?.supplier || SUPPLIERS[0];
  const products = PRODUCTS.filter(p => p.supplier === s.name).concat(PRODUCTS).slice(0,4);
  const reviews = [
    { name:'Иван В.', co:'ООО «Полимер‑Трейд»', text:'Отличное качество, доставка вовремя. Рекомендую для оптовых закупок.', rating:5.0, date:'12.03', deals:7 },
    { name:'Мария К.', co:'Фабрика «Норд»',     text:'Хорошая коммуникация, AI‑перевод работает точно. Заказ пришёл точно в срок.', rating:4.8, date:'03.03', deals:3 },
  ];
  const city = s.country==='CN'?'Шэньчжэнь':s.country==='VN'?'Хошимин':'Мумбаи';
  const country = s.country==='CN'?'Китай':s.country==='VN'?'Вьетнам':'Индия';

  return (
    <div style={{height:'100%', background:`radial-gradient(120% 80% at 50% -10%, #14181C 0%, ${DS.bg} 65%)`, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'10px 20px 0', flexShrink:0, display:'flex', alignItems:'center', gap:10}}>
        <BackBtn onPress={()=>nav('back')}/>
        <div style={{flex:1, fontSize:10, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700}}>Поставщик</div>
        <div style={{width:38, height:38, borderRadius:12, background:DS.s1, border:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={DS.sub} strokeWidth="1.7"/></svg>
        </div>
        <div style={{width:38, height:38, borderRadius:12, background:DS.s1, border:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.4" fill={DS.sub}/><circle cx="12" cy="12" r="1.4" fill={DS.sub}/><circle cx="12" cy="19" r="1.4" fill={DS.sub}/></svg>
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'14px 20px 130px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:16}}>

        {/* HERO v3 — premium identity */}
        <div style={{
          position:'relative', borderRadius:22, overflow:'hidden',
          background:`linear-gradient(160deg, #1B1E22 0%, #0E1013 100%)`,
          border:`1px solid ${DS.border2}`,
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04), 0 16px 40px rgba(0,0,0,0.4)',
        }}>
          {/* Banner with industrial illustration */}
          <div style={{height:120, position:'relative', overflow:'hidden', borderBottom:`1px solid ${DS.border}`}}>
            <div style={{position:'absolute', inset:'-10% -5%', opacity:0.45, pointerEvents:'none'}}>
              <CatIllustration kind={s.cat==='Металлы'?'metal':s.cat==='Текстиль'?'textile':s.cat==='Электроника'?'electronics':s.cat==='Пластик'?'hw':'pack'}/>
            </div>
            <div style={{position:'absolute', inset:0,
              background:'radial-gradient(80% 80% at 100% 0%, var(--accentDim) 0%, transparent 60%), linear-gradient(to bottom, rgba(11,12,14,0.0) 30%, rgba(11,12,14,0.7) 100%)', pointerEvents:'none'}}/>
            {/* TOP-5 ribbon */}
            <div style={{position:'absolute', top:14, right:14, display:'flex', alignItems:'center', gap:5,
              fontSize:9.5, fontWeight:800, color:'var(--accent)',
              background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
              border:`1px solid var(--accentDim2)`, borderRadius:7, padding:'5px 9px',
              letterSpacing:'0.12em', textTransform:'uppercase',
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-1L12 2z" fill="var(--accent)"/></svg>
              Top‑5 поставщик
            </div>
          </div>

          {/* Identity row */}
          <div style={{padding:'0 16px 16px', display:'flex', alignItems:'flex-start', gap:14, marginTop:-28, position:'relative'}}>
            <div style={{
              width:60, height:60, borderRadius:16, flexShrink:0,
              background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
              border:`2px solid ${DS.bg}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, fontWeight:800, color:DS.text, letterSpacing:-0.5,
              boxShadow:'0 8px 22px rgba(0,0,0,0.5)',
            }}>{s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
            <div style={{flex:1, minWidth:0, paddingTop:30}}>
              <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:5}}>
                <span style={{fontSize:18, fontWeight:800, color:DS.text, letterSpacing:-0.4, lineHeight:1.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="9" fill="var(--accent)"/><path d="M8 12.5l3 3 5-6" stroke="var(--accentOn)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{fontSize:10.5, fontWeight:700, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:7}}>Проверенный поставщик</div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                <CountryChip code={s.country}/>
                <span style={{
                  fontSize:10.5, fontWeight:600, color:DS.sub,
                  background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
                  borderRadius:5, padding:'2px 7px',
                }}>{city}</span>
                <span style={{
                  fontSize:10.5, fontWeight:600, color:DS.sub,
                  background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
                  borderRadius:5, padding:'2px 7px',
                }}>{s.cat}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST STATS — 4-col grid */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8}}>
          {[
            {k:'Trust',          v:s.score||'94',  unit:'/100', accent:true},
            {k:'Сделок',         v:s.orders||'487'},
            {k:'На платформе',   v:'5 лет'},
            {k:'Отклик',         v:'< 2 ч.'},
          ].map(it=>(
            <div key={it.k} style={{
              background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
              border:`1px solid ${DS.border}`, borderRadius:13,
              padding:'10px 9px', textAlign:'center',
            }}>
              <div style={{
                fontSize:15, fontWeight:800, letterSpacing:-0.3, lineHeight:1,
                color: it.accent ? 'var(--accent)' : DS.text,
                fontFamily:'"SF Mono",ui-monospace,monospace',
              }}>{it.v}{it.unit && <span style={{fontSize:9, color:DS.muted, fontWeight:600}}>{it.unit}</span>}</div>
              <div style={{fontSize:9, color:DS.muted, marginTop:6, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700}}>{it.k}</div>
            </div>
          ))}
        </div>

        {/* ABOUT */}
        <div>
          <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8}}>О компании</div>
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:16, padding:'13px 14px',
          }}>
            <div style={{fontSize:12.5, color:DS.sub, lineHeight:1.6, letterSpacing:0.005, marginBottom:11}}>
              Производитель {s.cat.toLowerCase()} с 2008 года. Собственный завод площадью 12 000 м², 240 сотрудников, экспорт в 40+ стран. Специализация — оптовые поставки B2B с полным циклом контроля качества.
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
              {['ISO 9001','SGS','RoHS','OEM/ODM','CE'].map(t=>(
                <span key={t} style={{
                  fontSize:10, fontWeight:700, color:DS.text, letterSpacing:'0.04em',
                  background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
                  borderRadius:6, padding:'3px 7px', fontFamily:'"SF Mono",ui-monospace,monospace',
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* CATALOG */}
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
            <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Каталог</div>
            <div onClick={()=>nav('catalog',{cat:s.cat})} style={{fontSize:11, color:'var(--accent)', fontWeight:700, cursor:'pointer'}}>Все {products.length+18} →</div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:9}}>
            {products.slice(0,4).map(p=>(
              <div key={p.id} onClick={()=>nav('product',{product:p})} style={{
                borderRadius:14, border:`1px solid ${DS.border}`,
                background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
                overflow:'hidden', cursor:'pointer',
              }}>
                <div style={{height:78, position:'relative', overflow:'hidden', borderBottom:`1px solid ${DS.border}`}}>
                  <div style={{position:'absolute', inset:0, opacity:0.55, pointerEvents:'none'}}>
                    <CatIllustration kind={p.kind || (p.cat==='Металлы'?'metal':p.cat==='Текстиль'?'textile':p.cat==='Электроника'?'electronics':p.cat==='Пластик'?'hw':'pack')}/>
                  </div>
                </div>
                <div style={{padding:'9px 11px 10px'}}>
                  <div style={{fontSize:11.5, color:DS.text, fontWeight:600, lineHeight:1.25, marginBottom:5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', minHeight:30}}>{p.name}</div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <span style={{fontSize:12, fontWeight:800, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.2}}>{p.price}</span>
                    <span style={{fontSize:9.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>MOQ {p.moq}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REVIEWS */}
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
            <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Отзывы</div>
            <div style={{fontSize:11, color:'var(--accent)', fontWeight:700, cursor:'pointer'}}>Все 127 →</div>
          </div>
          {/* Rating summary */}
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:16, padding:'12px 14px', marginBottom:9,
            display:'flex', alignItems:'center', gap:14,
          }}>
            <div>
              <div style={{fontSize:28, fontWeight:800, color:'var(--accent)', letterSpacing:-0.6, lineHeight:1, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{s.rating||'4.9'}</div>
              <div style={{fontSize:9, color:DS.muted, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginTop:5}}>★★★★★</div>
            </div>
            <div style={{flex:1, display:'flex', flexDirection:'column', gap:4}}>
              {[
                {k:'Качество',     v:96},
                {k:'Сроки',        v:92},
                {k:'Коммуникация', v:98},
              ].map(b=>(
                <div key={b.k} style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{fontSize:10.5, color:DS.sub, width:78, flexShrink:0}}>{b.k}</span>
                  <div style={{flex:1, height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden'}}>
                    <div style={{width:b.v+'%', height:'100%', background:'var(--accent)'}}/>
                  </div>
                  <span style={{fontSize:10, color:DS.text, fontFamily:'"SF Mono",ui-monospace,monospace', width:24, textAlign:'right', fontWeight:700}}>{b.v}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Review cards */}
          <div style={{display:'flex', flexDirection:'column', gap:9}}>
            {reviews.map(r=>(
              <div key={r.name} style={{
                background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
                border:`1px solid ${DS.border}`, borderRadius:14, padding:'12px 13px',
              }}>
                <div style={{display:'flex', alignItems:'flex-start', gap:10, marginBottom:7}}>
                  <div style={{
                    width:30, height:30, borderRadius:9, flexShrink:0,
                    background:DS.s2, border:`1px solid ${DS.border2}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:800, color:DS.text, letterSpacing:-0.3,
                  }}>{r.name.split(' ').map(w=>w[0]).join('')}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8}}>
                      <span style={{fontSize:12.5, fontWeight:700, color:DS.text, letterSpacing:-0.15}}>{r.name}</span>
                      <span style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', flexShrink:0}}>{r.date}</span>
                    </div>
                    <div style={{fontSize:10.5, color:DS.muted, marginTop:1, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{r.co} · {r.deals} сделки</div>
                  </div>
                  <div style={{fontSize:11, color:'var(--accent)', fontWeight:700, fontFamily:'"SF Mono",ui-monospace,monospace', flexShrink:0}}>★ {r.rating}</div>
                </div>
                <div style={{fontSize:12, color:DS.sub, lineHeight:1.55, letterSpacing:0.005}}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LOCATION */}
        <div>
          <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8}}>Расположение</div>
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:16, overflow:'hidden',
          }}>
            <div style={{height:140, position:'relative', overflow:'hidden',
              background:`linear-gradient(135deg, #131618 0%, #0B0D0F 100%)`,
              borderBottom:`1px solid ${DS.border}`,
            }}>
              {/* faux topographic map */}
              <div style={{position:'absolute', inset:0,
                backgroundImage:'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 24px)', pointerEvents:'none'}}/>
              {/* roads */}
              <svg style={{position:'absolute', inset:0, width:'100%', height:'100%'}} viewBox="0 0 360 140" preserveAspectRatio="none">
                <path d="M0,80 C80,60 140,90 220,70 C280,55 320,90 360,75" stroke="rgba(255,255,255,0.08)" strokeWidth="1.4" fill="none"/>
                <path d="M40,140 C60,100 90,80 110,40 C125,15 140,5 160,0" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none"/>
                <path d="M260,140 C250,110 240,90 250,60 C260,30 280,15 300,0" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none"/>
              </svg>
              {/* district label */}
              <div style={{position:'absolute', top:14, left:14,
                fontSize:9, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace',
                letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700,
              }}>{s.country} · {city.toUpperCase()}</div>
              {/* coordinates */}
              <div style={{position:'absolute', top:14, right:14,
                fontSize:9, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:0.04,
              }}>22.5431° N · 114.0579° E</div>
              {/* pin */}
              <div style={{position:'absolute', top:'52%', left:'50%', transform:'translate(-50%,-50%)'}}>
                <div style={{position:'absolute', inset:-22, borderRadius:'50%', background:'var(--accentDim)', filter:'blur(8px)', pointerEvents:'none'}}/>
                <div style={{position:'relative', width:28, height:28, borderRadius:'50%',
                  background:'var(--accent)', border:`3px solid ${DS.bg}`,
                  boxShadow:'0 0 0 1px var(--accentDim2), 0 4px 12px rgba(0,0,0,0.5)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <div style={{width:8, height:8, borderRadius:'50%', background:DS.bg}}/>
                </div>
              </div>
              {/* zoom */}
              <div style={{position:'absolute', bottom:14, right:14, display:'flex', flexDirection:'column', borderRadius:7, overflow:'hidden', border:`1px solid ${DS.border2}`, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)'}}>
                <div style={{width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', borderBottom:`1px solid ${DS.border2}`, color:DS.text, fontSize:14, fontWeight:600, cursor:'pointer'}}>+</div>
                <div style={{width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', color:DS.text, fontSize:14, fontWeight:600, cursor:'pointer'}}>−</div>
              </div>
            </div>
            <div style={{padding:'12px 14px', display:'flex', alignItems:'center', gap:10}}>
              <div style={{
                width:32, height:32, borderRadius:9, flexShrink:0,
                background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2a8 8 0 00-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 00-8-8z" stroke="var(--accent)" strokeWidth="1.7"/><circle cx="12" cy="10" r="2.5" stroke="var(--accent)" strokeWidth="1.7"/></svg>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:12.5, color:DS.text, fontWeight:700, letterSpacing:-0.15, lineHeight:1.2}}>{city}, {country}</div>
                <div style={{fontSize:10.5, color:DS.muted, marginTop:2, letterSpacing:0.005}}>Industrial Park · Завод 12 000 м² · Склад 4 000 м²</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI helper card */}
        <div style={{
          background:`linear-gradient(135deg, var(--accentDim) 0%, rgba(255,255,255,0.02) 100%)`,
          border:`1px solid var(--accentDim2)`,
          borderRadius:18, padding:'13px 14px 11px',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{position:'absolute', right:-30, top:-30, width:130, height:130, borderRadius:'50%',
            background:'radial-gradient(circle, var(--accentDim) 0%, transparent 65%)', pointerEvents:'none'}}/>
          <div style={{position:'relative', display:'flex', alignItems:'center', gap:11, marginBottom:10}}>
            <AIOrb size={30}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.2, lineHeight:1.2}}>AI: проверить и сравнить</div>
              <div style={{fontSize:10.5, color:DS.sub, marginTop:2}}>Подскажу, подходит ли этот поставщик</div>
            </div>
          </div>
          <div style={{position:'relative', display:'flex', gap:6, flexWrap:'wrap'}}>
            {['Сравнить с Top-3','Проверить надёжность','Спросить про MOQ'].map(t=>(
              <div key={t} onClick={()=>nav('ai',{msg:t+' для '+s.name})} style={{
                fontSize:11, color:DS.text, fontWeight:600,
                background:'rgba(0,0,0,0.25)', border:`1px solid ${DS.border2}`,
                borderRadius:9, padding:'6px 10px', cursor:'pointer',
              }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* STICKY CTA v3 */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, zIndex:10,
        padding:'18px 20px 28px',
        background:'linear-gradient(to top, rgba(11,12,14,0.98) 35%, rgba(11,12,14,0.85) 70%, transparent 100%)',
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
      }}>
        <div style={{
          display:'flex', gap:8, alignItems:'stretch',
          background:`linear-gradient(160deg, #16191D 0%, #0D0F12 100%)`,
          border:`1px solid ${DS.border2}`, borderRadius:16, padding:6,
          boxShadow:'0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          <div onClick={()=>nav('chat',{supplier:s})} style={{
            flex:1, height:50, borderRadius:11,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:7, cursor:'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18v12H7l-4 4V6z" stroke={DS.text} strokeWidth="1.8" strokeLinejoin="round"/></svg>
            <span style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.15}}>Связаться</span>
          </div>
          <div onClick={()=>nav('deal',{supplier:s})} style={{
            flex:1.4, height:50, borderRadius:11,
            background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer',
            boxShadow:'0 6px 20px var(--accentDim2), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}>
            <span style={{fontSize:14, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.2}}>Начать сделку</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="var(--accentOn)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div style={{marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:10, color:DS.muted}}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" stroke="var(--accent)" strokeWidth="1.6"/><path d="M9 12l2 2 4-4" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Защищённая сделка · Escrow · возврат при браке</span>
        </div>
      </div>
    </div>
  );
}
window.Supplier = Supplier;



// ── 10 BUYER PROFILE / CABINET v3 ──────────────────────────
function Profile({ nav, role }) {
  const interests  = ['Металл','Электроника','Упаковка','Текстиль'];
  const focus      = ['Китай','Вьетнам','Индия'];

  const recos = [
    { name:'Холоднокатаный лист 0.8мм',     cat:'Металл',      price:'$1.18/кг',   moq:'500 кг',  country:'CN', kind:'metal' },
    { name:'Хлопок 200 г/м², отбелённый',    cat:'Текстиль',    price:'$2.40/м',    moq:'2000 м',  country:'IN', kind:'textile' },
    { name:'OEM-плата ESP32, серия',         cat:'Электроника', price:'$4.20/шт',   moq:'1000 шт', country:'CN', kind:'electronics' },
  ];
  const viewed = [
    { name:'Нержавеющая сталь 316L',  cat:'Металл',      price:'$2.40/кг', country:'CN', when:'сегодня',     kind:'metal' },
    { name:'Гофрокартон 5-слойный',    cat:'Упаковка',    price:'$0.42/м²', country:'CN', when:'вчера',       kind:'pack' },
    { name:'PCB двусторонний FR-4',    cat:'Электроника', price:'$1.85/шт', country:'CN', when:'2 дн. назад', kind:'electronics' },
  ];
  const savedSuppliers = [
    { name:'Shenzhen Yifeng Steel',   cat:'Металл',      country:'CN', score:94 },
    { name:'Hanoi Textile Co.',        cat:'Текстиль',    country:'VN', score:91 },
  ];

  return (
    <div style={{height:'100%', background:`radial-gradient(120% 80% at 50% -10%, #14181C 0%, ${DS.bg} 65%)`, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'10px 20px 0', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontSize:10, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700}}>Профиль</div>
        <div style={{display:'flex', gap:8}}>
          <div style={{
            width:36, height:36, borderRadius:11,
            background:DS.s1, border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={DS.sub} strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{
            width:36, height:36, borderRadius:11,
            background:DS.s1, border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke={DS.sub} strokeWidth="1.7"/>
              <path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.09A1.7 1.7 0 008 19.4a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 003.7 15a1.7 1.7 0 00-1.55-1H2a2 2 0 110-4h.09A1.7 1.7 0 003.7 9 1.7 1.7 0 003.36 7.13L3.3 7.07a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 008 4.6a1.7 1.7 0 001-1.55V3a2 2 0 114 0v.09A1.7 1.7 0 0014 4.6a1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 9c.18.43.55.74 1 .85.55.13.96.55 1.07 1.1.05.22.05.45 0 .67-.11.55-.52.97-1.07 1.1-.45.11-.82.42-1 .85z" stroke={DS.sub} strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'14px 20px 20px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:18}}>

          {/* IDENTITY HERO */}
          <div style={{
            position:'relative', borderRadius:22, overflow:'hidden',
            background:`linear-gradient(160deg, #1B1E22 0%, #0E1013 100%)`,
            border:`1px solid ${DS.border2}`,
            padding:'16px 16px 14px',
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            <div style={{position:'absolute', right:-30, top:-30, width:160, height:160, borderRadius:'50%',
              background:'radial-gradient(circle, var(--accentDim) 0%, transparent 65%)', pointerEvents:'none'}}/>
            <div style={{position:'relative', display:'flex', alignItems:'flex-start', gap:14}}>
              <div style={{
                width:60, height:60, borderRadius:16, flexShrink:0, position:'relative',
                background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
                border:`1px solid ${DS.border3}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, fontWeight:800, color:DS.text, letterSpacing:-0.5,
              }}>
                ИВ
                <div style={{position:'absolute', right:-3, bottom:-3, width:14, height:14, borderRadius:'50%',
                  background:'var(--accent)', border:`2.5px solid ${DS.bg}`,
                  boxShadow:'0 0 8px var(--accent)'}}/>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:18, fontWeight:800, color:DS.text, letterSpacing:-0.4, lineHeight:1.1, marginBottom:5}}>Иван Волков</div>
                <div style={{fontSize:11.5, color:DS.sub, marginBottom:8, letterSpacing:-0.05}}>ООО «Полимер‑Трейд» · закупки</div>
                <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                  <span style={{
                    fontSize:10, fontWeight:700, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase',
                    background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
                    borderRadius:5, padding:'3px 7px',
                  }}>Покупатель · Pro</span>
                  <CountryChip code="RU"/>
                </div>
              </div>
            </div>
            {/* Stats strip */}
            <div style={{position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:14, paddingTop:14, borderTop:`1px solid ${DS.border}`}}>
              {[
                {k:'Сделок',     v:'24'},
                {k:'Поставщиков',v:'18'},
                {k:'На платформе',v:'1.5 г.'},
              ].map(it=>(
                <div key={it.k}>
                  <div style={{fontSize:9, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:4}}>{it.k}</div>
                  <div style={{fontSize:14, fontWeight:800, color:DS.text, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.3}}>{it.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* WALLET / BALANCE */}
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:18, padding:'13px 14px',
            display:'flex', alignItems:'center', gap:12,
          }}>
            <div style={{
              width:38, height:38, borderRadius:11, flexShrink:0,
              background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke={DS.text} strokeWidth="1.7"/><path d="M3 10h18M16 14h2" stroke={DS.text} strokeWidth="1.7" strokeLinecap="round"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:9, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:3}}>Баланс счёта</div>
              <div style={{display:'flex', alignItems:'baseline', gap:6}}>
                <span style={{fontSize:18, fontWeight:800, color:DS.text, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.4, lineHeight:1}}>184 320</span>
                <span style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>₽</span>
                <span style={{fontSize:10.5, color:DS.muted, marginLeft:8}}>· в эскроу <span style={{color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace', fontWeight:700}}>$2 480</span></span>
              </div>
            </div>
            <div style={{
              fontSize:11, fontWeight:700, color:'var(--accent)',
              padding:'7px 11px', borderRadius:9,
              background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
              cursor:'pointer',
            }}>Пополнить</div>
          </div>

          {/* INTERESTS / PREFERENCES */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Мои интересы</div>
              <div style={{fontSize:11, color:'var(--accent)', fontWeight:700, cursor:'pointer'}}>Изменить</div>
            </div>
            <div style={{
              background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
              border:`1px solid ${DS.border}`, borderRadius:16, padding:'13px 14px',
            }}>
              <div style={{fontSize:9.5, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:7}}>Категории</div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:13}}>
                {interests.map(t=>(
                  <span key={t} style={{
                    fontSize:11.5, fontWeight:600, color:DS.text,
                    background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
                    borderRadius:8, padding:'5px 10px',
                  }}>{t}</span>
                ))}
                <span style={{
                  fontSize:11.5, fontWeight:600, color:DS.muted,
                  border:`1px dashed ${DS.border3}`, borderRadius:8, padding:'5px 10px', cursor:'pointer',
                }}>+ добавить</span>
              </div>
              <div style={{fontSize:9.5, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:7}}>Страны</div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {focus.map(t=>(
                  <span key={t} style={{
                    fontSize:11.5, fontWeight:600, color:DS.text,
                    background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
                    borderRadius:8, padding:'5px 10px',
                  }}>{t}</span>
                ))}
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:13, paddingTop:13, borderTop:`1px solid ${DS.border}`}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <span style={{fontSize:11, color:DS.muted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700}}>Валюта</span>
                  <span style={{fontSize:12, color:DS.text, fontWeight:700, fontFamily:'"SF Mono",ui-monospace,monospace'}}>USD</span>
                </div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <span style={{fontSize:11, color:DS.muted, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700}}>Язык</span>
                  <span style={{fontSize:12, color:DS.text, fontWeight:700}}>Русский</span>
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <div style={{display:'flex', alignItems:'center', gap:7}}>
                <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Рекомендации</div>
                <span style={{
                  fontSize:9, fontWeight:800, color:'var(--accent)', letterSpacing:'0.08em', textTransform:'uppercase',
                  background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
                  borderRadius:4, padding:'2px 6px',
                }}>AI</span>
              </div>
              <div onClick={()=>nav('catalog')} style={{fontSize:11, color:'var(--accent)', fontWeight:700, cursor:'pointer'}}>Все →</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {recos.map(r=>(
                <div key={r.name} onClick={()=>nav('product',{product:{...r,id:r.name,supplier:'Demo'}})} style={{
                  borderRadius:14,
                  background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
                  border:`1px solid ${DS.border}`,
                  padding:11, cursor:'pointer', display:'flex', gap:11, alignItems:'center',
                }}>
                  <div style={{width:48, height:48, borderRadius:11, position:'relative', overflow:'hidden', flexShrink:0,
                    background:`linear-gradient(160deg, #1B1E22 0%, #0F1114 100%)`, border:`1px solid ${DS.border}`}}>
                    <div style={{position:'absolute', inset:0, opacity:0.55, pointerEvents:'none'}}><CatIllustration kind={r.kind}/></div>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:9, color:DS.muted, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3}}>{r.cat}</div>
                    <div style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.2, marginBottom:5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.name}</div>
                    <div style={{display:'flex', gap:6, alignItems:'center'}}>
                      <CountryChip code={r.country}/>
                      <span style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>MOQ {r.moq}</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <div style={{fontSize:10, color:DS.muted, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600, marginBottom:2}}>от</div>
                    <div style={{fontSize:13, fontWeight:800, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.3}}>{r.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORY — viewed products */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Просмотренные товары</div>
              <div style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{viewed.length} из 47</div>
            </div>
            <div style={{
              background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
              border:`1px solid ${DS.border}`, borderRadius:16, overflow:'hidden',
            }}>
              {viewed.map((v,i)=>(
                <div key={v.name} onClick={()=>nav('product',{product:{...v,id:v.name,supplier:'Demo'}})} style={{
                  padding:'11px 14px', display:'flex', alignItems:'center', gap:11, cursor:'pointer',
                  borderBottom: i<viewed.length-1?`1px solid ${DS.border}`:'none',
                }}>
                  <div style={{width:36, height:36, borderRadius:9, position:'relative', overflow:'hidden', flexShrink:0,
                    background:`linear-gradient(160deg, #1B1E22 0%, #0F1114 100%)`, border:`1px solid ${DS.border}`}}>
                    <div style={{position:'absolute', inset:0, opacity:0.55, pointerEvents:'none'}}><CatIllustration kind={v.kind}/></div>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12.5, fontWeight:600, color:DS.text, letterSpacing:-0.15, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{v.name}</div>
                    <div style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{v.cat} · {v.country}</div>
                  </div>
                  <div style={{textAlign:'right', flexShrink:0}}>
                    <div style={{fontSize:12, fontWeight:700, color:DS.text, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.2}}>{v.price}</div>
                    <div style={{fontSize:9.5, color:DS.muted, marginTop:2, letterSpacing:0.02}}>{v.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SAVED SUPPLIERS */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Сохранённые поставщики</div>
              <div style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{savedSuppliers.length}</div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:9}}>
              {savedSuppliers.map(s=>(
                <div key={s.name} onClick={()=>nav('supplier',{supplier:{...s, rating:'4.9', orders:'487', score:s.score, tone:'metal'}})} style={{
                  borderRadius:14,
                  background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
                  border:`1px solid ${DS.border}`,
                  padding:'12px 12px', cursor:'pointer',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:9, marginBottom:9}}>
                    <div style={{
                      width:36, height:36, borderRadius:10, flexShrink:0,
                      background:`linear-gradient(135deg, var(--accentDim2) 0%, transparent 100%), linear-gradient(160deg, #1F2226 0%, #101215 100%)`,
                      border:`1px solid ${DS.border2}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:800, color:DS.text, letterSpacing:-0.3,
                    }}>{s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{flexShrink:0, marginLeft:'auto'}}><circle cx="12" cy="12" r="9" fill="var(--accent)"/><path d="M8 12.5l3 3 5-6" stroke="var(--accentOn)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div style={{fontSize:12, fontWeight:700, color:DS.text, letterSpacing:-0.15, lineHeight:1.2, marginBottom:6, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', minHeight:30}}>{s.name}</div>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <CountryChip code={s.country}/>
                    <span style={{fontSize:11, fontWeight:800, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace'}}>{s.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SETTINGS */}
          <div>
            <div style={{fontSize:11, fontWeight:700, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8}}>Настройки</div>
            <div style={{
              background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
              border:`1px solid ${DS.border}`, borderRadius:16, overflow:'hidden',
            }}>
              {[
                {label:'Компания и реквизиты', sub:'ИНН, документы',
                  icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 21V8l9-5 9 5v13M9 21V12h6v9" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>},
                {label:'Способы оплаты',     sub:'2 карты · СБП',
                  icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M3 10h18" stroke="currentColor" strokeWidth="1.7"/></svg>},
                {label:'Уведомления',         sub:'AI, сделки, чаты',
                  icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>},
                {label:'Безопасность',        sub:'2FA включена',
                  icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.7"/></svg>},
                {label:'Помощь и поддержка',  sub:'Чат · база знаний',
                  icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/><path d="M9.1 9.5a3 3 0 015.83 1c0 2-3 2.5-3 4.5M12 18h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>},
              ].map((it,i,a)=>(
                <div key={it.label} style={{
                  padding:'12px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer',
                  borderBottom: i<a.length-1?`1px solid ${DS.border}`:'none',
                }}>
                  <div style={{
                    width:32, height:32, borderRadius:9, flexShrink:0,
                    background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
                    display:'flex', alignItems:'center', justifyContent:'center', color:DS.sub,
                  }}>{it.icon}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12.5, fontWeight:600, color:DS.text, letterSpacing:-0.1, lineHeight:1.2}}>{it.label}</div>
                    <div style={{fontSize:10.5, color:DS.muted, marginTop:2, letterSpacing:0.005}}>{it.sub}</div>
                  </div>
                  <svg width="7" height="11" viewBox="0 0 7 11" fill="none"><path d="M1 1l5 4.5L1 10" stroke={DS.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>
                </div>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <div style={{
            textAlign:'center', padding:'14px 20px', cursor:'pointer',
            fontSize:12, fontWeight:700, color:DS.muted, letterSpacing:0.04,
          }}>Выйти из аккаунта</div>
          <div style={{textAlign:'center', fontSize:9.5, color:DS.faint, fontFamily:'"SF Mono",ui-monospace,monospace', marginTop:-10, marginBottom:8}}>
            TradeAI · v1.4.2
          </div>
        </div>
      </div>

      <TabBar role={role} active="profile" onTab={(t)=>nav(t==='home'?'home':t==='catalog'?'catalog':t==='msgs'?'chat':t==='deals'?'tracking':'profile')}/>
    </div>
  );
}
window.Profile = Profile;

// ── 11 MESSAGES / TRANSLATION CHAT v3 ───────────────────────
function Chat({ nav, ctx }) {
  const s = ctx?.supplier || (typeof SUPPLIERS !== 'undefined' ? SUPPLIERS[0] : { name:'Shenzhen Yifeng Steel', country:'CN', cat:'Металлы', tone:'metal', rating:'4.9' });
  const city = s.country==='CN'?'Шэньчжэнь':s.country==='VN'?'Хошимин':'Мумбаи';
  const myLang = 'RU';
  const theirLang = s.country==='CN'?'ZH':s.country==='VN'?'VI':'EN';

  const [draft, setDraft] = React.useState('');
  const [showHelpers, setShowHelpers] = React.useState(true);

  const messages = [
    { from:'them', time:'10:42', orig:'您好！很高兴收到您的询价。', tr:'Здравствуйте! Рады получить ваш запрос.', srcLang:theirLang },
    { from:'me',   time:'10:45', text:'Здравствуйте. Интересует нержавеющая сталь 316L, 0.8 мм. Какой минимальный заказ и условия доставки в РФ?' },
    { from:'them', time:'10:51',
      orig:'最小起订量 500 公斤。FOB 深圳每公斤 2.40 美元。海运到莫斯科 18 天。',
      tr:'MOQ — 500 кг. Цена FOB Шэньчжэнь $2.40/кг. Морем до Москвы — 18 дней.',
      srcLang:theirLang },
    { from:'them', time:'10:52', kind:'quote',
      quote:{ title:'316L · 0.8 мм · Холоднокатаный', price:'$2.40/кг', moq:'500 кг', lead:'20–30 дн.', valid:'до 15.05'} },
    { from:'me',   time:'10:58', text:'Готовы заказать 1.2 тонны. Возможна скидка при оплате 50% предоплатой?' },
    { from:'them', time:'11:03', orig:'1.2 吨可以减 4%。50% 预付款，余款发货前。',
      tr:'На 1.2 т возможна скидка 4%. Предоплата 50%, остаток до отгрузки.', srcLang:theirLang },
  ];

  const helpers = [
    { label:'Запросить КП',      text:'Пришлите официальное КП с условиями FOB и CIF Москва.' },
    { label:'Уточнить MOQ',       text:'Какой минимальный заказ для скидки и какие тиражи у вас в наличии?' },
    { label:'Спросить о сроках', text:'Уточните, пожалуйста, точные сроки производства и отгрузки.' },
    { label:'Уточнить доставку',  text:'Какие условия доставки до Москвы — морем и ж/д? Срок и стоимость?' },
    { label:'Спросить об оплате', text:'Какие условия оплаты — предоплата, аккредитив или эскроу через TradeAI?' },
  ];

  return (
    <div style={{height:'100%', background:DS.bg, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>

      {/* HEADER — supplier identity + translation status */}
      <div style={{
        flexShrink:0, padding:'8px 14px 10px',
        background:`linear-gradient(180deg, #14171B 0%, ${DS.bg} 100%)`,
        borderBottom:`1px solid ${DS.border}`,
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div onClick={()=>nav('back')} style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={DS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>

          <div onClick={()=>nav('supplier',{supplier:s})} style={{flex:1, minWidth:0, display:'flex', alignItems:'center', gap:10, cursor:'pointer'}}>
            <div style={{
              width:38, height:38, borderRadius:11, flexShrink:0, position:'relative',
              background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
              border:`1px solid ${DS.border2}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:800, color:DS.text, letterSpacing:-0.4,
            }}>
              {s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
              <div style={{position:'absolute', right:-2, bottom:-2, width:11, height:11, borderRadius:'50%',
                background:'var(--accent)', border:`2px solid ${DS.bg}`}}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:5}}>
                <span style={{fontSize:13.5, fontWeight:700, color:DS.text, letterSpacing:-0.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.name}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="9" fill="var(--accent)"/><path d="M8 12.5l3 3 5-6" stroke="var(--accentOn)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{fontSize:10, color:DS.muted, marginTop:2, letterSpacing:0.005, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                Поставщик · {city} · в сети
              </div>
            </div>
          </div>

          <div style={{display:'flex', gap:6, flexShrink:0}}>
            <div style={{width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" stroke={DS.sub} strokeWidth="1.7" strokeLinejoin="round"/></svg>
            </div>
            <div style={{width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.4" fill={DS.sub}/><circle cx="12" cy="12" r="1.4" fill={DS.sub}/><circle cx="12" cy="19" r="1.4" fill={DS.sub}/></svg>
            </div>
          </div>
        </div>

        {/* Translation status strip */}
        <div style={{
          marginTop:10, display:'flex', alignItems:'center', gap:8,
          background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
          borderRadius:10, padding:'7px 11px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 5h12M9 3v2m1.5 0c-.5 4-3 7-7.5 9M5 12c2 2 5 4 9 4M14 19l5-10 5 10M16 17h6" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div style={{flex:1, fontSize:11, color:DS.text, fontWeight:600, letterSpacing:-0.05}}>
            Перевод включён
            <span style={{color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', marginLeft:6, fontWeight:500, letterSpacing:0.03}}>{theirLang} → {myLang}</span>
          </div>
          <div style={{
            fontSize:9, fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase',
            background:'rgba(0,0,0,0.3)', border:`1px solid var(--accentDim2)`,
            borderRadius:5, padding:'2px 6px',
          }}>AI</div>
        </div>
      </div>

      {/* MESSAGES SCROLL */}
      <div style={{flex:1, overflowY:'auto', padding:'14px 16px 12px', display:'flex', flexDirection:'column', gap:10}}>
        <div style={{display:'flex', justifyContent:'center', margin:'2px 0 4px'}}>
          <span style={{fontSize:9.5, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700,
            background:DS.s1, border:`1px solid ${DS.border}`, borderRadius:6, padding:'3px 10px'}}>Сегодня</span>
        </div>

        {messages.map((m,i)=>{
          const mine = m.from==='me';
          if(m.kind==='quote'){
            return (
              <div key={i} style={{alignSelf:'flex-start', maxWidth:'88%'}}>
                <div style={{
                  background:`linear-gradient(160deg, #16191D 0%, #101215 100%)`,
                  border:`1px solid var(--accentDim2)`,
                  borderRadius:'14px 14px 14px 4px', padding:'12px 13px',
                  position:'relative', overflow:'hidden',
                }}>
                  <div style={{position:'absolute', right:-20, top:-20, width:90, height:90, borderRadius:'50%',
                    background:'radial-gradient(circle, var(--accentDim) 0%, transparent 65%)', pointerEvents:'none'}}/>
                  <div style={{position:'relative', display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8M16 17H8M10 9H8" stroke="var(--accent)" strokeWidth="1.7" strokeLinejoin="round"/></svg>
                    <span style={{fontSize:9.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.12em', textTransform:'uppercase'}}>Коммерческое предложение</span>
                  </div>
                  <div style={{position:'relative', fontSize:12.5, fontWeight:700, color:DS.text, letterSpacing:-0.2, marginBottom:9}}>{m.quote.title}</div>
                  <div style={{position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:10}}>
                    {[
                      {k:'Цена', v:m.quote.price, accent:true},
                      {k:'MOQ', v:m.quote.moq},
                      {k:'Срок', v:m.quote.lead},
                      {k:'Срок действия', v:m.quote.valid},
                    ].map(x=>(
                      <div key={x.k}>
                        <div style={{fontSize:8.5, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:2}}>{x.k}</div>
                        <div style={{fontSize:12, fontWeight:700, fontFamily:'"SF Mono",ui-monospace,monospace', color:x.accent?'var(--accent)':DS.text, letterSpacing:-0.2}}>{x.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{position:'relative', display:'flex', gap:6}}>
                    <div onClick={()=>nav('estimate')} style={{flex:1, fontSize:11, fontWeight:700, color:DS.text, textAlign:'center', padding:'7px 8px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`, cursor:'pointer'}}>Рассчитать</div>
                    <div onClick={()=>nav('deal',{supplier:s})} style={{flex:1.2, fontSize:11, fontWeight:800, color:'var(--accentOn)', textAlign:'center', padding:'7px 8px', borderRadius:8,
                      background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
                      cursor:'pointer'}}>Принять</div>
                  </div>
                </div>
                <div style={{fontSize:9, color:DS.muted, marginTop:4, marginLeft:8, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{m.time}</div>
              </div>
            );
          }
          return (
            <div key={i} style={{alignSelf: mine?'flex-end':'flex-start', maxWidth:'85%'}}>
              <div style={{
                background: mine
                  ? `linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`
                  : `linear-gradient(160deg, #181B1F 0%, #101215 100%)`,
                color: mine ? 'var(--accentOn)' : DS.text,
                border: mine ? '1px solid transparent' : `1px solid ${DS.border}`,
                borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding:'9px 12px 10px',
                fontSize:13, lineHeight:1.45, letterSpacing:-0.05,
                fontWeight: mine ? 600 : 500,
                boxShadow: mine ? '0 4px 12px var(--accentDim2)' : 'none',
              }}>
                {m.tr ? (
                  <>
                    <div style={{whiteSpace:'pre-wrap'}}>{m.tr}</div>
                    <div style={{marginTop:7, paddingTop:7, borderTop:`1px solid ${DS.border}`,
                      fontSize:10.5, color:DS.muted, fontStyle:'normal', lineHeight:1.4,
                      display:'flex', gap:6, alignItems:'flex-start',
                    }}>
                      <span style={{
                        fontSize:8.5, fontWeight:800, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase',
                        background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
                        borderRadius:4, padding:'1px 5px', flexShrink:0, marginTop:1, fontFamily:'"SF Mono",ui-monospace,monospace',
                      }}>{m.srcLang}</span>
                      <span style={{flex:1, opacity:0.85}}>{m.orig}</span>
                    </div>
                  </>
                ) : (
                  <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
                )}
              </div>
              <div style={{
                fontSize:9, color:DS.muted, marginTop:4,
                marginLeft: mine?0:8, marginRight: mine?8:0,
                textAlign: mine?'right':'left',
                fontFamily:'"SF Mono",ui-monospace,monospace',
                display:'flex', justifyContent: mine?'flex-end':'flex-start', alignItems:'center', gap:5,
              }}>
                <span>{m.time}</span>
                {mine && <svg width="11" height="9" viewBox="0 0 14 10" fill="none"><path d="M1 5l3 3 5-6M6 7l5-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
          );
        })}

        <div style={{alignSelf:'flex-start', display:'flex', alignItems:'center', gap:6, padding:'4px 12px',
          background:`linear-gradient(160deg, #181B1F 0%, #101215 100%)`,
          border:`1px solid ${DS.border}`, borderRadius:'12px 12px 12px 4px', height:28,
        }}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:5, height:5, borderRadius:'50%', background:DS.muted,
              animation:`tdot 1.2s ${i*0.18}s infinite ease-in-out`}}/>
          ))}
          <style>{`@keyframes tdot{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}`}</style>
        </div>
      </div>

      {showHelpers && (
        <div style={{flexShrink:0, padding:'4px 14px 10px', position:'relative'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:7, padding:'0 2px'}}>
            <div style={{position:'relative', width:14, height:14, flexShrink:0}}>
              <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'var(--accent)'}}/>
              <div style={{position:'absolute', inset:3, borderRadius:'50%', background:DS.bg}}/>
              <div style={{position:'absolute', inset:5, borderRadius:'50%', background:'var(--accent)'}}/>
            </div>
            <span style={{fontSize:9.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.12em', textTransform:'uppercase'}}>AI · подсказать вопрос</span>
            <div style={{flex:1}}/>
            <div onClick={()=>setShowHelpers(false)} style={{fontSize:10, color:DS.muted, cursor:'pointer', fontWeight:600, letterSpacing:0.04, padding:'2px 6px'}}>Скрыть</div>
          </div>
          <div style={{display:'flex', gap:6, overflowX:'auto', paddingBottom:2, marginRight:-14, paddingRight:14, scrollbarWidth:'none'}}>
            {helpers.map(h=>(
              <div key={h.label} onClick={()=>setDraft(h.text)} style={{
                fontSize:11, fontWeight:700, color:DS.text, letterSpacing:-0.05,
                background:`linear-gradient(160deg, #181B1F 0%, #101215 100%)`,
                border:`1px solid ${DS.border2}`, borderRadius:9,
                padding:'8px 11px', whiteSpace:'nowrap', cursor:'pointer', flexShrink:0,
              }}>{h.label}</div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        flexShrink:0, padding:'10px 14px 22px',
        background:'rgba(11,12,14,0.85)',
        backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
        borderTop:`1px solid ${DS.border}`,
      }}>
        <div style={{
          display:'flex', alignItems:'flex-end', gap:8,
          background:`linear-gradient(160deg, #16191D 0%, #0D0F12 100%)`,
          border:`1px solid ${DS.border2}`, borderRadius:14,
          padding:'6px 6px 6px 10px',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          <div style={{
            width:32, height:32, borderRadius:9, flexShrink:0,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginBottom:2,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21.4 11l-9 9a6 6 0 01-8.5-8.5l9-9a4 4 0 015.7 5.7l-9 9a2 2 0 01-2.8-2.8L14.4 7" stroke={DS.sub} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <textarea
            value={draft}
            onChange={e=>setDraft(e.target.value)}
            placeholder="Написать сообщение"
            rows={1}
            style={{
              flex:1, minHeight:32, maxHeight:90, resize:'none',
              background:'transparent', border:'none', outline:'none',
              color:DS.text, fontSize:13, lineHeight:1.4, fontFamily:'inherit',
              padding:'8px 0', letterSpacing:-0.05,
            }}
          />
          <div style={{
            width:38, height:38, borderRadius:10, flexShrink:0, cursor:'pointer',
            background: draft.trim() ? `linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)` : 'rgba(255,255,255,0.06)',
            border: draft.trim() ? '1px solid transparent' : `1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: draft.trim() ? '0 4px 12px var(--accentDim2)' : 'none',
            transition:'all .2s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={draft.trim()?'var(--accentOn)':DS.muted} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:9, padding:'0 2px'}}>
          <div style={{display:'flex', gap:6}}>
            <div onClick={()=>setDraft('Пришлите официальное КП с условиями FOB и CIF Москва.')} style={{
              fontSize:10.5, fontWeight:700, color:DS.sub, letterSpacing:-0.05,
              background:'rgba(255,255,255,0.03)', border:`1px solid ${DS.border}`,
              borderRadius:7, padding:'5px 9px', cursor:'pointer',
            }}>Запросить КП</div>
            <div style={{
              fontSize:10.5, fontWeight:700, color:DS.sub, letterSpacing:-0.05,
              background:'rgba(255,255,255,0.03)', border:`1px solid ${DS.border}`,
              borderRadius:7, padding:'5px 9px', cursor:'pointer', display:'flex', alignItems:'center', gap:5,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Файл
            </div>
          </div>
          <div onClick={()=>nav('deal',{supplier:s})} style={{
            fontSize:10.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.04em',
            cursor:'pointer', display:'flex', alignItems:'center', gap:5,
          }}>
            Начать сделку
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Chat = Chat;

// ── 12 SAFE DEAL / CHECKOUT v3 ──────────────────────────────
function Deal({ nav, ctx }) {
  const s = ctx?.supplier || (typeof SUPPLIERS !== 'undefined' ? SUPPLIERS[0] : { name:'Shenzhen Yifeng Steel', country:'CN', rating:'4.9' });
  const p = ctx?.product || { title:'Нержавеющая сталь 316L · 0.8 мм', price:'$2.40', unit:'кг' };
  const qty = ctx?.qty || 1200;
  const subtotalUSD = 2.40 * qty;
  const deliveryUSD = 380;
  const taxesUSD = subtotalUSD * 0.07;
  const totalUSD = subtotalUSD + deliveryUSD + taxesUSD;
  const rate = 92.4;
  const totalRUB = Math.round(totalUSD * rate);

  const fmtUSD = v => '$' + v.toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0});
  const fmtRUB = v => v.toLocaleString('ru-RU').replace(/,/g,' ') + ' ₽';

  return (
    <div style={{height:'100%', background:DS.bg, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      {/* HEADER */}
      <div style={{flexShrink:0, padding:'4px 16px 12px',
        background:`linear-gradient(180deg, #14171B 0%, ${DS.bg} 100%)`,
        borderBottom:`1px solid ${DS.border}`,
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
          <div onClick={()=>nav('back')} style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={DS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:9.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:2}}>Шаг 2 из 3 · Оплата</div>
            <div style={{fontSize:18, fontWeight:800, color:DS.text, letterSpacing:-0.5}}>Безопасная сделка</div>
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:5,
            background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
            borderRadius:8, padding:'5px 8px',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z M9 12l2 2 4-4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{fontSize:9.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Escrow</span>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          {[
            {label:'Расчёт', done:true},
            {label:'Оплата', active:true},
            {label:'Доставка'},
          ].map((st,i,arr)=>(
            <React.Fragment key={i}>
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                <div style={{
                  width:18, height:18, borderRadius:'50%',
                  background: st.active ? 'var(--accent)' : st.done ? 'rgba(200,255,0,0.15)' : 'rgba(255,255,255,0.06)',
                  border: st.active || st.done ? '1px solid var(--accentDim2)' : `1px solid ${DS.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:9, fontWeight:800,
                  color: st.active ? 'var(--accentOn)' : st.done ? 'var(--accent)' : DS.muted,
                  fontFamily:'"SF Mono",ui-monospace,monospace',
                }}>
                  {st.done ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> : (i+1)}
                </div>
                <span style={{fontSize:10.5, fontWeight: st.active?700:600, color: st.active?DS.text:DS.muted, letterSpacing:-0.05}}>{st.label}</span>
              </div>
              {i<arr.length-1 && <div style={{flex:1, height:1, background: arr[i+1].done||arr[i+1].active?'var(--accentDim2)':DS.border}}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* SCROLL */}
      <div style={{flex:1, overflowY:'auto', padding:'14px 16px 24px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>

          {/* Order summary card */}
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #0F1216 100%)`,
            border:`1px solid ${DS.border2}`, borderRadius:16, padding:14,
          }}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:11}}>
              <span style={{fontSize:9.5, fontWeight:800, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Заказ</span>
              <div style={{flex:1, height:1, background:DS.border}}/>
              <span style={{fontSize:9.5, fontWeight:700, color:DS.muted, letterSpacing:0.04, fontFamily:'"SF Mono",ui-monospace,monospace'}}>#TR-49021</span>
            </div>

            <div style={{display:'flex', gap:11, marginBottom:12}}>
              <div style={{
                width:54, height:54, borderRadius:11, flexShrink:0,
                background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
                border:`1px solid ${DS.border2}`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="1" stroke={DS.sub} strokeWidth="1.4"/><path d="M3 10h18M7 14h3" stroke={DS.muted} strokeWidth="1.2"/></svg>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.2, lineHeight:1.3, marginBottom:3}}>{p.title}</div>
                <div style={{fontSize:11, color:DS.sub, marginBottom:4, lineHeight:1.3}}>
                  <span style={{fontFamily:'"SF Mono",ui-monospace,monospace', color:DS.text, fontWeight:600}}>{qty}</span> {p.unit} · <span style={{fontFamily:'"SF Mono",ui-monospace,monospace'}}>{p.price}/{p.unit}</span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:5}}>
                  <div style={{width:14, height:14, borderRadius:4, background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`, border:`1px solid ${DS.border2}`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, fontWeight:800, color:DS.text}}>
                    {s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
                  </div>
                  <span style={{fontSize:10.5, color:DS.sub, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.name}</span>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="9" fill="var(--accent)"/><path d="M8 12.5l3 3 5-6" stroke="var(--accentOn)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Total in primary currency */}
            <div style={{
              borderTop:`1px solid ${DS.border}`, paddingTop:12,
              display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            }}>
              <div>
                <div style={{fontSize:9.5, fontWeight:800, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:3}}>К оплате</div>
                <div style={{fontSize:11, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:0.02}}>≈ {fmtUSD(totalUSD)}</div>
              </div>
              <div style={{fontSize:24, fontWeight:800, color:DS.text, letterSpacing:-0.8, fontFamily:'"SF Mono",ui-monospace,monospace', lineHeight:1}}>
                {fmtRUB(totalRUB)}
              </div>
            </div>
          </div>

          {/* Escrow / safe payment card */}
          <div style={{
            background:`linear-gradient(160deg, rgba(200,255,0,0.06) 0%, rgba(200,255,0,0.02) 100%)`,
            border:`1px solid var(--accentDim2)`, borderRadius:16, padding:14,
            position:'relative', overflow:'hidden',
          }}>
            <div style={{position:'absolute', right:-30, top:-30, width:120, height:120, borderRadius:'50%',
              background:'radial-gradient(circle, var(--accentDim) 0%, transparent 65%)', pointerEvents:'none'}}/>
            <div style={{position:'relative', display:'flex', alignItems:'flex-start', gap:11}}>
              <div style={{
                width:38, height:38, borderRadius:11, flexShrink:0,
                background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 14px var(--accentDim2)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" stroke="var(--accentOn)" strokeWidth="2" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="var(--accentOn)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:800, color:DS.text, letterSpacing:-0.2, marginBottom:3}}>Защищённая оплата</div>
                <div style={{fontSize:11.5, color:DS.sub, lineHeight:1.45, letterSpacing:-0.05}}>
                  Средства зачисляются на счёт TradeAI и переводятся продавцу только после подтверждения получения товара.
                </div>
              </div>
            </div>
            <div style={{position:'relative', display:'flex', gap:7, marginTop:11, paddingTop:11, borderTop:`1px solid var(--accentDim2)`}}>
              {[
                {ic:<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>, label:'Контроль платежа'},
                {ic:<path d="M9 11l3 3 6-6 M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9c2 0 4 .7 5.5 1.8" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>, label:'Гарантия качества'},
                {ic:<path d="M3 10c0-2 2-4 4-4h10c2 0 4 2 4 4v4c0 2-2 4-4 4H7c-2 0-4-2-4-4v-4z M8 12h8" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>, label:'Возврат при споре'},
              ].map((x,i)=>(
                <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'4px 2px'}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">{x.ic}</svg>
                  <span style={{fontSize:9.5, color:DS.sub, fontWeight:600, textAlign:'center', letterSpacing:-0.05, lineHeight:1.2}}>{x.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment breakdown */}
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #0F1216 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:16, padding:'14px 14px 12px',
          }}>
            <div style={{fontSize:9.5, fontWeight:800, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:11}}>Детали платежа</div>
            <div style={{display:'flex', flexDirection:'column', gap:9}}>
              {[
                {k:'Сумма', v:fmtUSD(subtotalUSD)},
                {k:'Доставка · морем CIF', v:fmtUSD(deliveryUSD)},
                {k:'Налоги и сборы (7%)', v:fmtUSD(taxesUSD)},
              ].map(r=>(
                <div key={r.k} style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
                  <span style={{fontSize:12, color:DS.sub, letterSpacing:-0.05}}>{r.k}</span>
                  <span style={{fontSize:12.5, color:DS.text, fontWeight:600, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:0.02}}>{r.v}</span>
                </div>
              ))}
            </div>
            <div style={{height:1, background:DS.border, margin:'11px 0 9px'}}/>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
              <span style={{fontSize:12.5, color:DS.text, fontWeight:700, letterSpacing:-0.1}}>Итог</span>
              <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                <span style={{fontSize:11, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{fmtUSD(totalUSD)}</span>
                <span style={{fontSize:15, color:DS.text, fontWeight:800, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.2}}>{fmtRUB(totalRUB)}</span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #0F1216 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:16, padding:'12px 14px',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:11}}>
              <div style={{
                width:42, height:32, borderRadius:7, flexShrink:0,
                background:`linear-gradient(135deg, #2A2D31 0%, #14171A 100%)`,
                border:`1px solid ${DS.border2}`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <svg width="20" height="14" viewBox="0 0 32 22" fill="none"><rect x="0" y="0" width="32" height="22" rx="3" fill="none" stroke={DS.sub} strokeWidth="0.5"/><rect x="3" y="4" width="6" height="4" rx="0.5" fill="var(--accent)"/><path d="M3 13h20M3 16h12" stroke={DS.muted} strokeWidth="1"/></svg>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:9.5, fontWeight:800, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:2}}>Способ оплаты</div>
                <div style={{fontSize:12.5, color:DS.text, fontWeight:700, letterSpacing:-0.1, marginBottom:2}}>Расчётный счёт · Сбербанк</div>
                <div style={{fontSize:10.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:0.02}}>•••• 4081 · ООО «Атлас»</div>
              </div>
              <div style={{fontSize:11, color:DS.sub, fontWeight:700, padding:'5px 9px', borderRadius:7, background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`, cursor:'pointer'}}>Сменить</div>
            </div>
            <div style={{marginTop:9, paddingTop:9, borderTop:`1px solid ${DS.border}`,
              display:'flex', alignItems:'center', gap:6, fontSize:10.5, color:DS.muted, letterSpacing:-0.05,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke={DS.muted} strokeWidth="1.4" strokeLinecap="round"/></svg>
              <span>Конвертация по курсу ЦБ + 0.5% · <span style={{fontFamily:'"SF Mono",ui-monospace,monospace', color:DS.sub, fontWeight:600}}>1 $ = 92.4 ₽</span></span>
            </div>
          </div>

          {/* Trust footer */}
          <div style={{display:'flex', alignItems:'flex-start', gap:8, padding:'10px 12px',
            background:'rgba(255,255,255,0.02)', border:`1px solid ${DS.border}`, borderRadius:12,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{flexShrink:0, marginTop:1}}><circle cx="12" cy="12" r="9" stroke={DS.sub} strokeWidth="1.6"/><path d="M12 8v4M12 16h.01" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/></svg>
            <div style={{flex:1, fontSize:10.5, color:DS.sub, lineHeight:1.45, letterSpacing:-0.05}}>
              Нажимая «Подтвердить и оплатить», вы соглашаетесь с условиями <span style={{color:'var(--accent)', fontWeight:600}}>защищённой сделки</span> и публичной офертой TradeAI.
            </div>
          </div>
        </div>
      </div>

      {/* STICKY CTA */}
      <div style={{flexShrink:0, padding:'10px 16px 22px',
        background:'rgba(11,12,14,0.92)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
        borderTop:`1px solid ${DS.border}`,
      }}>
        <div onClick={()=>nav('tracking',{supplier:s, product:p, qty})} style={{
          height:54, borderRadius:14, cursor:'pointer',
          background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
          display:'flex', alignItems:'center', justifyContent:'center', gap:9,
          boxShadow:'0 8px 24px var(--accentDim2), inset 0 1px 0 rgba(255,255,255,0.25)',
          position:'relative', overflow:'hidden',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z M9 12l2 2 4-4" stroke="var(--accentOn)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontSize:15, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.2}}>Подтвердить и оплатить · {fmtRUB(totalRUB)}</span>
        </div>
      </div>
    </div>
  );
}
window.Deal = Deal;


// ── 13 DEAL TRACKING v3 ─────────────────────────────────────
function Tracking({ nav, ctx }) {
  const s = ctx?.supplier || (typeof SUPPLIERS !== 'undefined' ? SUPPLIERS[0] : { name:'Shenzhen Yifeng Steel', country:'CN', rating:'4.9' });
  const p = ctx?.product || { title:'Нержавеющая сталь 316L · 0.8 мм', price:'$2.40', unit:'кг' };
  const qty = ctx?.qty || 1200;
  const total = '266 460 ₽';

  // current step index
  const currentStep = 3;
  const steps = [
    { label:'Оплата подтверждена',           detail:'25 апр · 14:32',       icon:'check' },
    { label:'Средства в Escrow',             detail:'Защищённый счёт TradeAI', icon:'shield' },
    { label:'Поставщик готовит отправку',    detail:'Производство · 12–15 дн.', icon:'box' },
    { label:'Товар отправлен',               detail:'COSCO · CMA-4072 · морем', icon:'ship' },
    { label:'Ожидает получения',             detail:'Прибытие ≈ 14 мая',    icon:'pin' },
    { label:'Подтверждение и перевод средств', detail:'После приёмки на складе', icon:'release' },
    { label:'Сделка завершена',              detail:'',                       icon:'flag' },
  ];

  const ICON = {
    check:   <path d="M5 12l5 5L20 7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>,
    shield:  <><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    box:     <><path d="M3 8l9-5 9 5v8l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v9" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></>,
    ship:    <><path d="M2 18l2-7h16l2 7M5 11V7h14v4 M9 11V5h6v6 M2 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></>,
    pin:     <><path d="M12 2c-4 0-7 3-7 7 0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" strokeWidth="1.8"/></>,
    release: <><path d="M3 12l5 5L21 5 M12 19v3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    flag:    <><path d="M5 22V4l9 3-9 3 M5 4l14 5-14 5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
  };

  return (
    <div style={{height:'100%', background:DS.bg, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>
      {/* HEADER */}
      <div style={{flexShrink:0, padding:'4px 16px 12px',
        background:`linear-gradient(180deg, #14171B 0%, ${DS.bg} 100%)`,
        borderBottom:`1px solid ${DS.border}`,
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div onClick={()=>nav('back')} style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={DS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:2}}>
              <span style={{fontSize:9.5, fontWeight:800, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Сделка</span>
              <span style={{fontSize:9.5, fontWeight:700, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:0.04}}>#TR-49021</span>
              <div style={{display:'flex', alignItems:'center', gap:4, padding:'2px 7px', borderRadius:5,
                background:'var(--accentDim)', border:`1px solid var(--accentDim2)`}}>
                <div style={{width:5, height:5, borderRadius:'50%', background:'var(--accent)'}}/>
                <span style={{fontSize:8.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase'}}>Активна</span>
              </div>
            </div>
            <div style={{fontSize:18, fontWeight:800, color:DS.text, letterSpacing:-0.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>Статус сделки</div>
          </div>
        </div>
      </div>

      {/* SCROLL */}
      <div style={{flex:1, overflowY:'auto', padding:'14px 16px 24px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>

          {/* Deal summary */}
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #0F1216 100%)`,
            border:`1px solid ${DS.border2}`, borderRadius:16, padding:14,
          }}>
            <div style={{display:'flex', gap:11, marginBottom:11}}>
              <div style={{
                width:46, height:46, borderRadius:11, flexShrink:0,
                background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
                border:`1px solid ${DS.border2}`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="1" stroke={DS.sub} strokeWidth="1.4"/><path d="M3 10h18" stroke={DS.muted} strokeWidth="1.2"/></svg>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:700, color:DS.text, letterSpacing:-0.2, lineHeight:1.3, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.title}</div>
                <div style={{fontSize:11, color:DS.sub, lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {s.name} · <span style={{fontFamily:'"SF Mono",ui-monospace,monospace'}}>{qty} {p.unit}</span>
                </div>
              </div>
              <div style={{textAlign:'right', flexShrink:0}}>
                <div style={{fontSize:9.5, fontWeight:800, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:2}}>Сумма</div>
                <div style={{fontSize:14, fontWeight:800, color:DS.text, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.2}}>{total}</div>
              </div>
            </div>
            <div style={{
              borderTop:`1px solid ${DS.border}`, paddingTop:10,
              display:'flex', alignItems:'center', gap:7,
            }}>
              <div style={{width:28, height:28, borderRadius:8, background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z M9 12l2 2 4-4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:11.5, fontWeight:700, color:DS.text, letterSpacing:-0.05}}>Защищённая сделка · Escrow</div>
                <div style={{fontSize:10, color:DS.muted, letterSpacing:-0.03, lineHeight:1.3, marginTop:1}}>Средства будут переведены продавцу после подтверждения получения</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #0F1216 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:16, padding:'14px 14px 4px',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:13}}>
              <span style={{fontSize:9.5, fontWeight:800, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Прогресс</span>
              <div style={{flex:1, height:1, background:DS.border}}/>
              <span style={{fontSize:10.5, fontWeight:700, color:'var(--accent)', letterSpacing:-0.05}}>
                Шаг <span style={{fontFamily:'"SF Mono",ui-monospace,monospace'}}>{currentStep+1}/{steps.length}</span>
              </span>
            </div>

            <div style={{position:'relative'}}>
              {steps.map((st,i)=>{
                const done = i < currentStep;
                const active = i === currentStep;
                const isLast = i === steps.length-1;
                return (
                  <div key={i} style={{display:'flex', gap:12, position:'relative'}}>
                    <div style={{position:'relative', flexShrink:0, width:30}}>
                      {/* connector line */}
                      {!isLast && <div style={{
                        position:'absolute', left:14, top:30, bottom:-4, width:1.5,
                        background: done ? 'var(--accent)' : DS.border,
                      }}/>}
                      {/* node */}
                      <div style={{
                        width:30, height:30, borderRadius:'50%', position:'relative',
                        background: done ? 'var(--accent)' : active ? 'var(--accentDim)' : 'rgba(255,255,255,0.04)',
                        border: done ? '1px solid var(--accent)'
                              : active ? '1px solid var(--accent)'
                              : `1px solid ${DS.border2}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        boxShadow: active ? '0 0 0 4px var(--accentDim)' : 'none',
                      }}>
                        {active && (
                          <div style={{position:'absolute', inset:-1, borderRadius:'50%', border:'1px solid var(--accent)',
                            animation:'pulseRing 1.8s ease-in-out infinite', pointerEvents:'none'}}/>
                        )}
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke={done ? 'var(--accentOn)' : active ? 'var(--accent)' : DS.muted}>
                          {ICON[st.icon]}
                        </svg>
                      </div>
                    </div>

                    <div style={{flex:1, paddingBottom: isLast ? 14 : 18}}>
                      <div style={{
                        fontSize: active?13:12.5,
                        fontWeight: active?800:done?700:600,
                        color: active?DS.text:done?DS.text:DS.muted,
                        letterSpacing:-0.1, lineHeight:1.3,
                      }}>{st.label}</div>
                      {st.detail && <div style={{fontSize:10.5, color: active?DS.sub:DS.muted, marginTop:3, letterSpacing:-0.05, lineHeight:1.3}}>{st.detail}</div>}
                      {active && (
                        <div style={{
                          marginTop:8, padding:'7px 10px', borderRadius:8,
                          background:'var(--accentDim)', border:`1px solid var(--accentDim2)`,
                          fontSize:10.5, color:DS.text, fontWeight:600, letterSpacing:-0.05, lineHeight:1.4,
                          display:'flex', alignItems:'center', gap:6,
                        }}>
                          <div style={{width:5, height:5, borderRadius:'50%', background:'var(--accent)',
                            animation:'pulseDot 1.4s ease-in-out infinite'}}/>
                          В пути · обновлено 2 ч назад
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <style>{`
                @keyframes pulseRing { 0%,100% { transform:scale(1); opacity:.7 } 50% { transform:scale(1.3); opacity:0 } }
                @keyframes pulseDot  { 0%,100% { opacity:1 } 50% { opacity:.4 } }
              `}</style>
            </div>
          </div>

          {/* Logistics block */}
          <div style={{
            background:`linear-gradient(160deg, #16191D 0%, #0F1216 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:16, padding:14,
          }}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:11}}>
              <span style={{fontSize:9.5, fontWeight:800, color:DS.muted, letterSpacing:'0.14em', textTransform:'uppercase'}}>Логистика</span>
              <div style={{flex:1, height:1, background:DS.border}}/>
              <span style={{fontSize:10, color:DS.sub, fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:0.02}}>CMA-4072</span>
            </div>

            <div style={{
              position:'relative', height:50, marginBottom:10,
              background:'rgba(0,0,0,0.25)', borderRadius:10, border:`1px solid ${DS.border}`,
              padding:'0 14px', display:'flex', alignItems:'center', overflow:'hidden',
            }}>
              <div style={{position:'absolute', left:14, right:14, top:'50%', height:1, background:DS.border, transform:'translateY(-0.5px)'}}/>
              <div style={{position:'absolute', left:14, top:'50%', height:1.5, background:'var(--accent)', width:'52%', transform:'translateY(-0.75px)',
                boxShadow:'0 0 8px var(--accentDim2)'}}/>
              {/* origin */}
              <div style={{position:'relative', display:'flex', flexDirection:'column', alignItems:'flex-start', flex:1, minWidth:0}}>
                <div style={{fontSize:8.5, fontWeight:800, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase'}}>Шэньчжэнь</div>
                <div style={{width:9, height:9, borderRadius:'50%', background:'var(--accent)', marginTop:4}}/>
                <div style={{fontSize:8.5, color:DS.sub, marginTop:3, fontFamily:'"SF Mono",ui-monospace,monospace'}}>27.04</div>
              </div>
              {/* in transit indicator */}
              <div style={{position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:1, padding:'0 6px'}}>
                <div style={{fontSize:8.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase'}}>В пути</div>
                <svg width="20" height="14" viewBox="0 0 32 22" fill="none">
                  <path d="M2 18l2-7h24l2 7M5 11V7h22v4 M11 11V5h10v6 M2 18c3 2 5 2 7 0s4-2 7 0 4 2 7 0 4-2 7 0" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{fontSize:8.5, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace'}}>52%</div>
              </div>
              {/* destination */}
              <div style={{position:'relative', display:'flex', flexDirection:'column', alignItems:'flex-end', flex:1, minWidth:0}}>
                <div style={{fontSize:8.5, fontWeight:800, color:DS.muted, letterSpacing:'0.12em', textTransform:'uppercase'}}>Москва</div>
                <div style={{width:9, height:9, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:`1px solid ${DS.border2}`, marginTop:4}}/>
                <div style={{fontSize:8.5, color:DS.sub, marginTop:3, fontFamily:'"SF Mono",ui-monospace,monospace'}}>14.05</div>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
              {[
                {k:'Перевозчик', v:'COSCO'},
                {k:'Тип', v:'Море · CIF'},
                {k:'Прибытие', v:'14 мая', accent:true},
              ].map(x=>(
                <div key={x.k} style={{padding:'7px 9px', background:'rgba(255,255,255,0.02)', border:`1px solid ${DS.border}`, borderRadius:8}}>
                  <div style={{fontSize:8.5, color:DS.muted, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3}}>{x.k}</div>
                  <div style={{fontSize:11.5, fontWeight:700, color:x.accent?'var(--accent)':DS.text, letterSpacing:-0.05, fontFamily: x.accent?'"SF Mono",ui-monospace,monospace':'inherit'}}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI helper */}
          <div onClick={()=>nav('ai',{msg:`Объясни статус сделки #TR-49021`})} style={{
            display:'flex', alignItems:'center', gap:10, padding:'11px 13px', cursor:'pointer',
            background:`linear-gradient(160deg, #16191D 0%, #0F1216 100%)`,
            border:`1px solid ${DS.border}`, borderRadius:13,
          }}>
            <div style={{position:'relative', width:18, height:18, flexShrink:0}}>
              <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'var(--accent)'}}/>
              <div style={{position:'absolute', inset:4, borderRadius:'50%', background:DS.bg}}/>
              <div style={{position:'absolute', inset:7, borderRadius:'50%', background:'var(--accent)'}}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:9.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:2}}>AI-помощник</div>
              <div style={{fontSize:11.5, fontWeight:600, color:DS.text, letterSpacing:-0.05, lineHeight:1.3}}>Объяснить текущий шаг и что делать дальше</div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke={DS.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>

        </div>
      </div>

      {/* STICKY ACTIONS */}
      <div style={{flexShrink:0, padding:'10px 16px 22px',
        background:'rgba(11,12,14,0.92)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
        borderTop:`1px solid ${DS.border}`,
      }}>
        <div style={{display:'flex', gap:7, marginBottom:8}}>
          <div onClick={()=>nav('chat',{supplier:s})} style={{
            flex:1, height:42, borderRadius:11, cursor:'pointer',
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z" stroke={DS.text} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{fontSize:11.5, fontWeight:700, color:DS.text, letterSpacing:-0.05}}>Поставщик</span>
          </div>
          <div style={{
            flex:1, height:42, borderRadius:11, cursor:'pointer',
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border2}`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={DS.text} strokeWidth="1.7"/><path d="M12 8v4M12 16h.01" stroke={DS.text} strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{fontSize:11.5, fontWeight:700, color:DS.text, letterSpacing:-0.05}}>Открыть спор</span>
          </div>
        </div>
        <div style={{
          height:54, borderRadius:14, cursor:'pointer',
          background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          boxShadow:'0 8px 24px var(--accentDim2), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="var(--accentOn)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontSize:15, fontWeight:800, color:'var(--accentOn)', letterSpacing:-0.2}}>Подтвердить получение</span>
        </div>
      </div>
    </div>
  );
}
window.Tracking = Tracking;

// ── 14 AI CHAT / SOURCING COPILOT v3 ────────────────────────
function AI({ nav, ctx }) {
  const initialMsg = ctx?.msg || '';
  const [draft, setDraft] = React.useState(initialMsg);
  const [sentInitial, setSentInitial] = React.useState(false);

  const baseMessages = [
    { from:'ai', kind:'intro' },
    { from:'me', text:'Найди надёжных поставщиков нержавеющей стали 316L в Китае, объёмы от 1 тонны' },
    { from:'ai', kind:'suppliers',
      text:'Подобрал 3 поставщика по вашему запросу — все с верификацией TradeAI и опытом поставок в РФ:',
      suppliers:[
        { name:'Shenzhen Yifeng Steel', city:'Шэньчжэнь', rating:'4.9', deals:'320', price:'$2.40/кг', moq:'500 кг', tag:'Лучший выбор' },
        { name:'Foshan MetalCorp',      city:'Фошань',    rating:'4.7', deals:'180', price:'$2.28/кг', moq:'1 т',    tag:'Низкая цена' },
        { name:'Tianjin Iron Group',    city:'Тяньцзинь', rating:'4.8', deals:'410', price:'$2.55/кг', moq:'500 кг', tag:'Большой объём' },
      ]
    },
    { from:'me', text:'Рассчитай полную стоимость 1.2 тонны от первого поставщика с доставкой в Москву' },
    { from:'ai', kind:'estimate',
      text:'Расчёт по Shenzhen Yifeng Steel:',
      breakdown:[
        { k:'Товар · 1.2 т × $2.40', v:'$2 880' },
        { k:'Доставка морем CIF Москва', v:'$380' },
        { k:'Налоги и сборы (7%)', v:'$202' },
      ],
      total:'$3 462', totalRub:'≈ 319 889 ₽',
      lead:'20–30 дней'
    },
    { from:'me', text:'Подготовь сообщение поставщику с уточнением MOQ и условий оплаты' },
    { from:'ai', kind:'message',
      text:'Готовое сообщение для отправки:',
      draft:'Здравствуйте! Интересует нержавеющая сталь 316L (0.8 мм), объём 1.2 т. Уточните минимальный заказ для скидки и условия оплаты — возможна ли предоплата 50% с остатком до отгрузки? Также интересуют сроки производства. Спасибо.'
    },
  ];

  const prompts = [
    'Найти поставщиков',
    'Рассчитать стоимость',
    'Сравнить предложения',
    'Подготовить сообщение',
    'Уточнить MOQ',
    'Спросить о сроках',
  ];

  const messages = sentInitial && initialMsg
    ? [...baseMessages, { from:'me', text:initialMsg }, { from:'ai', text:'Секунду, анализирую запрос…', typing:true }]
    : baseMessages;

  React.useEffect(()=>{
    if(initialMsg && !sentInitial){
      setTimeout(()=>{ setSentInitial(true); setDraft(''); }, 100);
    }
  // eslint-disable-next-line
  },[]);

  return (
    <div style={{height:'100%', background:DS.bg, display:'flex', flexDirection:'column', paddingTop:58, overflow:'hidden'}}>

      {/* HEADER */}
      <div style={{flexShrink:0, padding:'4px 14px 12px',
        background:`linear-gradient(180deg, #14171B 0%, ${DS.bg} 100%)`,
        borderBottom:`1px solid ${DS.border}`,
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div onClick={()=>nav('back')} style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={DS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{flex:1, display:'flex', alignItems:'center', gap:9, minWidth:0}}>
            <div style={{position:'relative', width:34, height:34, flexShrink:0,
              background:`linear-gradient(160deg, #1B1F23 0%, #0E1013 100%)`,
              border:`1px solid var(--accentDim2)`, borderRadius:10,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <div style={{width:8, height:8, borderRadius:'50%', background:'var(--accent)',
                boxShadow:'0 0 8px var(--accent)'}}/>
              <div style={{position:'absolute', inset:-1, borderRadius:11, border:'1px solid var(--accentDim2)', pointerEvents:'none'}}/>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:14.5, fontWeight:800, color:DS.text, letterSpacing:-0.3, lineHeight:1.1}}>AI-ассистент</div>
              <div style={{fontSize:10, color:DS.muted, marginTop:2, letterSpacing:0.005, display:'flex', alignItems:'center', gap:5}}>
                <div style={{width:5, height:5, borderRadius:'50%', background:'var(--accent)'}}/>
                Помощник по закупкам
              </div>
            </div>
          </div>
          <div style={{width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.4" fill={DS.sub}/><circle cx="12" cy="12" r="1.4" fill={DS.sub}/><circle cx="12" cy="19" r="1.4" fill={DS.sub}/></svg>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{flex:1, overflowY:'auto', padding:'14px 14px 8px', display:'flex', flexDirection:'column', gap:11}}>

        {messages.map((m,i)=>{
          if(m.from==='ai' && m.kind==='intro'){
            return (
              <div key={i} style={{alignSelf:'stretch'}}>
                <div style={{
                  background:`linear-gradient(160deg, rgba(200,255,0,0.05) 0%, rgba(200,255,0,0.01) 100%)`,
                  border:`1px solid var(--accentDim2)`, borderRadius:14,
                  padding:'13px 14px', position:'relative', overflow:'hidden',
                }}>
                  <div style={{position:'absolute', right:-30, top:-30, width:120, height:120, borderRadius:'50%',
                    background:'radial-gradient(circle, var(--accentDim) 0%, transparent 65%)', pointerEvents:'none'}}/>
                  <div style={{position:'relative', display:'flex', alignItems:'flex-start', gap:11}}>
                    <div style={{
                      width:34, height:34, borderRadius:10, flexShrink:0,
                      background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 4px 12px var(--accentDim2)',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2" stroke="var(--accentOn)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="12" r="4" stroke="var(--accentOn)" strokeWidth="1.8"/></svg>
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:9.5, fontWeight:800, color:'var(--accent)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4}}>Sourcing copilot</div>
                      <div style={{fontSize:13, color:DS.text, fontWeight:600, letterSpacing:-0.1, lineHeight:1.4}}>
                        Помогу найти поставщика, сравнить предложения и рассчитать стоимость.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          const mine = m.from === 'me';

          if(m.kind === 'suppliers'){
            return (
              <div key={i} style={{alignSelf:'flex-start', maxWidth:'92%', width:'100%'}}>
                <AIBubble>
                  <div style={{fontSize:12.5, color:DS.text, lineHeight:1.45, letterSpacing:-0.05, marginBottom:10}}>{m.text}</div>
                  <div style={{display:'flex', flexDirection:'column', gap:7}}>
                    {m.suppliers.map((sp,idx)=>(
                      <div key={idx} onClick={()=>nav('supplier',{supplier:sp})} style={{
                        display:'flex', gap:10, padding:'9px 10px', borderRadius:10, cursor:'pointer',
                        background:'rgba(0,0,0,0.25)', border:`1px solid ${DS.border}`,
                      }}>
                        <div style={{
                          width:36, height:36, borderRadius:9, flexShrink:0,
                          background:`linear-gradient(160deg, #2A2D31 0%, #14171A 100%)`,
                          border:`1px solid ${DS.border2}`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:11, fontWeight:800, color:DS.text, letterSpacing:-0.3,
                        }}>
                          {sp.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{display:'flex', alignItems:'center', gap:5, marginBottom:2}}>
                            <span style={{fontSize:11.5, fontWeight:700, color:DS.text, letterSpacing:-0.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{sp.name}</span>
                            {idx===0 && <div style={{fontSize:8, fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase',
                              background:'var(--accentDim)', border:`1px solid var(--accentDim2)`, borderRadius:4, padding:'1px 5px', flexShrink:0}}>{sp.tag}</div>}
                          </div>
                          <div style={{fontSize:10, color:DS.muted, display:'flex', gap:7, alignItems:'center', marginBottom:2}}>
                            <span>{sp.city}</span>
                            <span style={{color:DS.border2}}>·</span>
                            <span style={{display:'flex', alignItems:'center', gap:3}}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
                              <span style={{fontFamily:'"SF Mono",ui-monospace,monospace', color:DS.sub, fontWeight:600}}>{sp.rating}</span>
                            </span>
                            <span style={{color:DS.border2}}>·</span>
                            <span style={{fontFamily:'"SF Mono",ui-monospace,monospace'}}>{sp.deals} сделок</span>
                          </div>
                          <div style={{fontSize:10.5, fontFamily:'"SF Mono",ui-monospace,monospace', color:DS.text, fontWeight:700, letterSpacing:0.02}}>
                            {sp.price} <span style={{color:DS.muted, fontWeight:500}}>· MOQ {sp.moq}</span>
                          </div>
                        </div>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{alignSelf:'center', flexShrink:0}}><path d="M9 6l6 6-6 6" stroke={DS.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    ))}
                  </div>
                </AIBubble>
                <AITime/>
              </div>
            );
          }

          if(m.kind === 'estimate'){
            return (
              <div key={i} style={{alignSelf:'flex-start', maxWidth:'92%', width:'100%'}}>
                <AIBubble>
                  <div style={{fontSize:12.5, color:DS.text, lineHeight:1.45, letterSpacing:-0.05, marginBottom:10}}>{m.text}</div>
                  <div style={{
                    background:'rgba(0,0,0,0.25)', border:`1px solid ${DS.border}`, borderRadius:10,
                    padding:'10px 11px', marginBottom:9,
                  }}>
                    <div style={{display:'flex', flexDirection:'column', gap:7, marginBottom:9}}>
                      {m.breakdown.map(r=>(
                        <div key={r.k} style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                          <span style={{fontSize:11, color:DS.sub, letterSpacing:-0.05}}>{r.k}</span>
                          <span style={{fontSize:11.5, color:DS.text, fontWeight:600, fontFamily:'"SF Mono",ui-monospace,monospace'}}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{height:1, background:DS.border, marginBottom:8}}/>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                      <span style={{fontSize:11.5, color:DS.text, fontWeight:700, letterSpacing:-0.05}}>Итог</span>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:14, fontWeight:800, color:'var(--accent)', fontFamily:'"SF Mono",ui-monospace,monospace', letterSpacing:-0.2, lineHeight:1.1}}>{m.total}</div>
                        <div style={{fontSize:10, color:DS.muted, fontFamily:'"SF Mono",ui-monospace,monospace', marginTop:2}}>{m.totalRub}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:9, padding:'5px 9px',
                    background:'var(--accentDim)', border:`1px solid var(--accentDim2)`, borderRadius:7,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="1.7"/><path d="M12 7v5l3 2" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span style={{fontSize:10.5, fontWeight:700, color:DS.text, letterSpacing:-0.05}}>Срок поставки · <span style={{fontFamily:'"SF Mono",ui-monospace,monospace'}}>{m.lead}</span></span>
                  </div>
                  <div style={{display:'flex', gap:6}}>
                    <div onClick={()=>nav('deal')} style={{
                      flex:1, fontSize:11, fontWeight:800, color:'var(--accentOn)', textAlign:'center',
                      padding:'8px 8px', borderRadius:8,
                      background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`, cursor:'pointer',
                    }}>Начать сделку</div>
                    <div style={{
                      flex:1, fontSize:11, fontWeight:700, color:DS.text, textAlign:'center',
                      padding:'8px 8px', borderRadius:8,
                      background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`, cursor:'pointer',
                    }}>Сравнить варианты</div>
                  </div>
                </AIBubble>
                <AITime/>
              </div>
            );
          }

          if(m.kind === 'message'){
            return (
              <div key={i} style={{alignSelf:'flex-start', maxWidth:'92%', width:'100%'}}>
                <AIBubble>
                  <div style={{fontSize:12.5, color:DS.text, lineHeight:1.45, letterSpacing:-0.05, marginBottom:9}}>{m.text}</div>
                  <div style={{
                    background:'rgba(0,0,0,0.3)', border:`1px solid ${DS.border}`, borderRadius:10,
                    padding:'11px 12px', marginBottom:9,
                    fontSize:12, color:DS.text, lineHeight:1.5, letterSpacing:-0.05, fontStyle:'italic',
                    borderLeft:'2px solid var(--accent)',
                  }}>
                    «{m.draft}»
                  </div>
                  <div style={{display:'flex', gap:6}}>
                    <div onClick={()=>nav('chat')} style={{
                      flex:1.2, fontSize:11, fontWeight:800, color:'var(--accentOn)', textAlign:'center',
                      padding:'8px 8px', borderRadius:8,
                      background:`linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="var(--accentOn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Отправить
                    </div>
                    <div style={{
                      flex:1, fontSize:11, fontWeight:700, color:DS.text, textAlign:'center',
                      padding:'8px 8px', borderRadius:8,
                      background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`, cursor:'pointer',
                    }}>Скопировать</div>
                  </div>
                </AIBubble>
                <AITime/>
              </div>
            );
          }

          if(m.typing){
            return (
              <div key={i} style={{alignSelf:'flex-start', display:'flex', alignItems:'center', gap:6, padding:'8px 12px',
                background:`linear-gradient(160deg, #181B1F 0%, #101215 100%)`,
                border:`1px solid ${DS.border}`, borderRadius:'12px 12px 12px 4px',
              }}>
                {[0,1,2].map(d=>(
                  <div key={d} style={{width:5, height:5, borderRadius:'50%', background:'var(--accent)',
                    animation:`aidot 1.2s ${d*0.18}s infinite ease-in-out`}}/>
                ))}
                <style>{`@keyframes aidot{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}`}</style>
              </div>
            );
          }

          // plain bubble
          return (
            <div key={i} style={{alignSelf: mine?'flex-end':'flex-start', maxWidth:'85%'}}>
              <div style={{
                background: mine
                  ? `linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)`
                  : `linear-gradient(160deg, #181B1F 0%, #101215 100%)`,
                color: mine ? 'var(--accentOn)' : DS.text,
                border: mine ? '1px solid transparent' : `1px solid ${DS.border}`,
                borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding:'9px 12px 10px',
                fontSize:13, lineHeight:1.45, letterSpacing:-0.05,
                fontWeight: mine ? 600 : 500,
                boxShadow: mine ? '0 4px 12px var(--accentDim2)' : 'none',
                whiteSpace:'pre-wrap',
              }}>{m.text}</div>
            </div>
          );
        })}
      </div>

      {/* PROMPT CHIPS */}
      <div style={{flexShrink:0, padding:'4px 14px 10px', position:'relative'}}>
        <div style={{display:'flex', gap:6, overflowX:'auto', paddingBottom:2, marginRight:-14, paddingRight:14, scrollbarWidth:'none'}}>
          {prompts.map(p=>(
            <div key={p} onClick={()=>setDraft(p)} style={{
              fontSize:11, fontWeight:700, color:DS.text, letterSpacing:-0.05,
              background:`linear-gradient(160deg, #181B1F 0%, #101215 100%)`,
              border:`1px solid ${DS.border2}`, borderRadius:9,
              padding:'7px 11px', whiteSpace:'nowrap', cursor:'pointer', flexShrink:0,
            }}>{p}</div>
          ))}
        </div>
      </div>

      {/* COMPOSER */}
      <div style={{flexShrink:0, padding:'4px 14px 22px',
        background:'rgba(11,12,14,0.85)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
        borderTop:`1px solid ${DS.border}`,
      }}>
        <div style={{
          display:'flex', alignItems:'flex-end', gap:8, marginTop:8,
          background:`linear-gradient(160deg, #16191D 0%, #0D0F12 100%)`,
          border:`1px solid ${DS.border2}`, borderRadius:14,
          padding:'6px 6px 6px 10px',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          <div style={{
            width:32, height:32, borderRadius:9, flexShrink:0,
            background:'rgba(255,255,255,0.04)', border:`1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', marginBottom:2,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21.4 11l-9 9a6 6 0 01-8.5-8.5l9-9a4 4 0 015.7 5.7l-9 9a2 2 0 01-2.8-2.8L14.4 7" stroke={DS.sub} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <textarea
            value={draft}
            onChange={e=>setDraft(e.target.value)}
            placeholder="Опишите товар, задачу или вопрос"
            rows={1}
            style={{
              flex:1, minHeight:32, maxHeight:90, resize:'none',
              background:'transparent', border:'none', outline:'none',
              color:DS.text, fontSize:13, lineHeight:1.4, fontFamily:'inherit',
              padding:'8px 0', letterSpacing:-0.05,
            }}
          />
          <div style={{
            width:38, height:38, borderRadius:10, flexShrink:0, cursor:'pointer',
            background: draft.trim() ? `linear-gradient(180deg, var(--accent) 0%, var(--accentDeep) 100%)` : 'rgba(255,255,255,0.06)',
            border: draft.trim() ? '1px solid transparent' : `1px solid ${DS.border}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: draft.trim() ? '0 4px 12px var(--accentDim2)' : 'none',
            transition:'all .2s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={draft.trim()?'var(--accentOn)':DS.muted} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIBubble({ children }) {
  return (
    <div style={{
      background:`linear-gradient(160deg, #181B1F 0%, #101215 100%)`,
      border:`1px solid ${DS.border}`,
      borderRadius:'14px 14px 14px 4px',
      padding:'11px 12px',
    }}>{children}</div>
  );
}
function AITime() {
  return <div style={{fontSize:9, color:DS.muted, marginTop:4, marginLeft:8, fontFamily:'"SF Mono",ui-monospace,monospace'}}>сейчас</div>;
}

window.AI = AI;
