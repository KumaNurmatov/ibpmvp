// screens2.jsx — Screens 10–18: AI, Chat, Cost, Deal, Tracking, BuyerProfile, SellerDash, SellerCatalog, SellerRequests

// ── 10 AI ASSISTANT (expanded) ────────────────────────────
const AI_CHIPS = ['Подобрать поставщика','Рассчитать стоимость','Сравнить предложения','Оценить доставку'];

function AIScreen({onBack, initialMsg}) {
  const [msgs, setMsgs] = React.useState([]);
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const ref = React.useRef(null);
  const showIntro = msgs.length === 0;

  React.useEffect(() => {
    if (initialMsg) send(initialMsg);
  }, []);

  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [msgs, loading]);

  const send = async (text) => {
    const t = (text || q).trim();
    if (!t || loading) return;
    setMsgs(p => [...p, {role:'user', content:t}]);
    setQ('');
    setLoading(true);
    try {
      const hist = [...msgs, {role:'user', content:t}];
      const reply = await window.claude.complete({
        messages: [{role:'user', content: AI_SYSTEM + '\n\n' + hist.map(m=>`${m.role==='user'?'Пользователь':'Ассистент'}: ${m.content}`).join('\n')}]
      });
      setMsgs(p => [...p, {role:'assistant', content:reply}]);
    } catch(e) {
      setMsgs(p => [...p, {role:'assistant', content:'Ошибка соединения. Попробуйте снова.'}]);
    }
    setLoading(false);
  };

  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      {/* header */}
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',gap:12,flexShrink:0,borderBottom:`1px solid ${DS.border}`,paddingBottom:14}}>
        <BackBtn onPress={onBack}/>
        <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
          <LimeOrb size={36}/>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:DS.text}}>AI-ассистент</div>
            <div style={{fontSize:11,color:DS.sub}}>Поиск · Расчёт · Перевод</div>
          </div>
        </div>
        <Tag lime>ОНЛАЙН</Tag>
      </div>
      {/* messages */}
      <div ref={ref} style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:12,minHeight:0}}>
        {showIntro && (
          <>
            <div style={{textAlign:'center',padding:'20px 0 10px',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
              <LimeOrb size={56}/>
              <div style={{fontSize:20,fontWeight:800,color:DS.text,letterSpacing:-.5}}>Что вы хотите найти?</div>
              <div style={{fontSize:13,color:DS.sub,lineHeight:1.6,maxWidth:260,textAlign:'center'}}>Подберу поставщиков, рассчитаю стоимость и помогу сравнить предложения</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
              {AI_CHIPS.map(c=>(
                <div key={c} onClick={()=>send(c)} style={{borderRadius:14,background:DS.s1,border:`1px solid ${DS.border}`,padding:'12px 13px',cursor:'pointer',display:'flex',alignItems:'center',gap:9}}>
                  <div style={{width:28,height:28,borderRadius:9,background:DS.limeDim,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <LimeOrb size={16}/>
                  </div>
                  <span style={{fontSize:12,color:DS.sub,lineHeight:1.3}}>{c}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{animation:'fadeUp .2s ease',alignSelf:m.role==='user'?'flex-end':'flex-start',maxWidth:'86%'}}>
            {m.role==='user'
              ? <div style={{background:DS.lime,color:'#0d0e10',borderRadius:'16px 16px 4px 16px',padding:'10px 14px',fontSize:13,fontWeight:600,lineHeight:1.5}}>{m.content}</div>
              : <div style={{background:DS.s1,border:`1px solid ${DS.border}`,color:'rgba(255,255,255,.85)',borderRadius:'4px 16px 16px 16px',padding:'12px 14px',fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{m.content}</div>
            }
          </div>
        ))}
        {loading && (
          <div style={{alignSelf:'flex-start',background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:'4px 16px 16px 16px',padding:'13px 16px'}}>
            <TypingDots/>
          </div>
        )}
      </div>
      {/* quick actions when chatting */}
      {!showIntro && (
        <div style={{padding:'0 20px 8px',display:'flex',gap:8,overflowX:'auto',flexShrink:0}}>
          {['Найти ещё','Рассчитать цену','Перевести','Уточнить'].map(t=>(
            <div key={t} onClick={()=>send(t)} style={{height:30,borderRadius:100,padding:'0 12px',background:DS.limeDim,border:`1px solid ${DS.limeDim2}`,color:DS.lime,fontSize:12,fontWeight:600,display:'flex',alignItems:'center',whiteSpace:'nowrap',cursor:'pointer',flexShrink:0}}>{t}</div>
          ))}
        </div>
      )}
      {/* composer */}
      <div style={{padding:'4px 20px 16px',flexShrink:0,borderTop:`1px solid ${DS.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,background:DS.s2,border:`1.5px solid rgba(200,255,0,0.25)`,borderRadius:16,padding:'10px 10px 10px 16px',marginTop:10,boxShadow:`0 0 0 3px rgba(200,255,0,0.06)`}}>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Опишите задачу"
            style={{flex:1,background:'none',border:'none',outline:'none',color:DS.text,fontSize:13,fontFamily:'inherit'}}/>
          <div style={{width:36,height:36,borderRadius:12,flexShrink:0,cursor:'pointer',background:q?DS.lime:DS.s3,display:'flex',alignItems:'center',justifyContent:'center',transition:'background .2s'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke={q?'#0d0e10':'rgba(255,255,255,.35)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
window.AIScreen = AIScreen;

// ── 11 CHAT WITH TRANSLATION ──────────────────────────────
const CHAT_MSGS = [
  {id:1,side:'in', orig:'您好！我们可以为您提供最优惠的价格。', trans:'Здравствуйте! Мы можем предложить вам лучшую цену.', time:'14:02'},
  {id:2,side:'out',text:'Какой минимальный заказ и срок производства?', time:'14:04'},
  {id:3,side:'in', orig:'最小起订量为500件，生产周期15-20天。', trans:'Минимальный заказ — 500 ед., срок производства 15–20 дней.', time:'14:05'},
  {id:4,side:'out',text:'Есть ли сертификат ISO 9001?', time:'14:06'},
];

function ChatScreen({supplier, onBack}) {
  const s = supplier || SUPPLIERS[0];
  const [msg, setMsg] = React.useState('');
  const [showTrans, setShowTrans] = React.useState({});

  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      {/* header */}
      <div style={{padding:'10px 20px 12px',display:'flex',alignItems:'center',gap:12,flexShrink:0,borderBottom:`1px solid ${DS.border}`}}>
        <BackBtn onPress={onBack}/>
        <div style={{width:38,height:38,borderRadius:12,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🏭</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:DS.text}}>{s.name}</div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:DS.green}}/>
            <span style={{fontSize:11,color:DS.green,fontWeight:500}}>Перевод включён</span>
          </div>
        </div>
        <Tag lime>AI</Tag>
      </div>
      {/* messages */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 20px',display:'flex',flexDirection:'column',gap:12}}>
        {/* date divider */}
        <div style={{textAlign:'center',fontSize:11,color:DS.muted}}>Сегодня</div>
        {CHAT_MSGS.map(m=>(
          <div key={m.id} style={{display:'flex',flexDirection:'column',alignSelf:m.side==='out'?'flex-end':'flex-start',maxWidth:'80%',gap:4,animation:'fadeUp .15s ease'}}>
            {m.side==='in' ? (
              <div>
                <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:'4px 16px 16px 16px',padding:'10px 13px'}}>
                  <div style={{fontSize:12,color:DS.muted,marginBottom:4,lineHeight:1.4}}>{m.orig}</div>
                  <div style={{height:.5,background:DS.border,marginBottom:6}}/>
                  <div style={{fontSize:13,color:DS.text,lineHeight:1.5}}>{m.trans}</div>
                  <div style={{fontSize:10,color:DS.lime,marginTop:4}}>🌐 Переведено AI</div>
                </div>
                <div style={{fontSize:10,color:DS.muted,marginTop:3,paddingLeft:4}}>{m.time}</div>
              </div>
            ) : (
              <div>
                <div style={{background:DS.lime,borderRadius:'16px 16px 4px 16px',padding:'10px 14px'}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#0d0e10',lineHeight:1.5}}>{m.text}</div>
                </div>
                <div style={{fontSize:10,color:DS.muted,marginTop:3,textAlign:'right',paddingRight:4}}>✓✓ {m.time}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* AI quick replies */}
      <div style={{padding:'0 20px 8px',display:'flex',gap:8,overflowX:'auto',flexShrink:0}}>
        {['Уточнить цену','Запросить условия','Спросить о сроках','Запросить образец'].map(t=>(
          <div key={t} onClick={()=>setMsg(t)} style={{height:30,borderRadius:100,padding:'0 12px',background:DS.s2,border:`1px solid ${DS.border}`,color:DS.sub,fontSize:12,display:'flex',alignItems:'center',whiteSpace:'nowrap',cursor:'pointer',flexShrink:0}}>{t}</div>
        ))}
      </div>
      {/* composer */}
      <div style={{padding:'4px 20px 16px',flexShrink:0,borderTop:`1px solid ${DS.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,background:DS.s2,border:`1px solid ${DS.border}`,borderRadius:16,padding:'10px 10px 10px 16px',marginTop:10}}>
          <div style={{width:30,height:30,borderRadius:9,background:DS.s3,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Написать сообщение…"
            style={{flex:1,background:'none',border:'none',outline:'none',color:DS.text,fontSize:13,fontFamily:'inherit'}}/>
          <div style={{width:36,height:36,borderRadius:12,background:msg?DS.lime:DS.s3,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'background .2s',flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={msg?'#0d0e10':DS.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ChatScreen = ChatScreen;

// ── 12 COST ESTIMATE ──────────────────────────────────────
function CostEstimateScreen({product, onBack, onContact, onDeal, onAI}) {
  const p = product || PRODUCTS[0];
  const rows = [
    {label:'Товар (1 000 ед.)',sub:'$4.20 × 1000',value:'$4 200'},
    {label:'Доставка морем',sub:'Шанхай → Москва, 28 дн.',value:'$1 200'},
    {label:'Таможенная пошлина',sub:'≈15% от стоимости',value:'$630'},
    {label:'НДС 20%',sub:'от суммы после таможни',value:'$1 206'},
    {label:'Страхование груза',sub:'1% от стоимости',value:'$42'},
  ];
  const total = '$7 278';
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <BackBtn onPress={onBack}/>
        <div style={{flex:1,fontSize:17,fontWeight:700,color:DS.text}}>Предварительный расчёт</div>
        <Tag lime>≈ Оценка</Tag>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {/* product ref */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px',display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:44,height:44,borderRadius:12,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{p.img}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:DS.text}}>{p.name}</div>
            <div style={{fontSize:12,color:DS.sub,marginTop:2}}>1 000 ед. · {p.supplier}</div>
          </div>
        </div>
        {/* breakdown */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:18,overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${DS.border}`}}>
            <div style={{fontSize:14,fontWeight:700,color:DS.text}}>Стоимость товара</div>
          </div>
          {rows.map((r,i)=>(
            <div key={r.label} style={{padding:'12px 16px',borderBottom:i<rows.length-1?`1px solid ${DS.border}`:'none',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:13,color:DS.text,fontWeight:500}}>{r.label}</div>
                <div style={{fontSize:11,color:DS.muted,marginTop:2}}>{r.sub}</div>
              </div>
              <div style={{fontSize:14,fontWeight:600,color:DS.sub}}>{r.value}</div>
            </div>
          ))}
        </div>
        {/* total */}
        <div style={{background:DS.limeDim,border:`1.5px solid ${DS.limeDim2}`,borderRadius:18,padding:'18px 20px'}}>
          <div style={{fontSize:12,color:DS.lime,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8}}>Итоговая сумма</div>
          <div style={{fontSize:32,fontWeight:800,color:DS.lime,letterSpacing:-1}}>{total}</div>
          <div style={{fontSize:12,color:'rgba(200,255,0,0.6)',marginTop:6}}>Это ориентировочный расчёт. Точные данные уточните у поставщика.</div>
        </div>
        {/* AI refine */}
        <div onClick={onAI} style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:14,padding:'13px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
          <LimeOrb size={32}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:DS.text}}>Уточнить через AI</div>
            <div style={{fontSize:11,color:DS.sub,marginTop:2}}>Изменить объём, маршрут или условия</div>
          </div>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={DS.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>
        <div style={{display:'flex',gap:10}}>
          <LimeBtn dark style={{flex:1}} onPress={onContact} icon="💬">Связаться</LimeBtn>
          <LimeBtn style={{flex:1}} onPress={onDeal} icon="🔒">Начать сделку</LimeBtn>
        </div>
      </div>
    </div>
  );
}
window.CostEstimateScreen = CostEstimateScreen;

// ── 13 SAFE DEAL CHECKOUT ─────────────────────────────────
function SafeDealScreen({product, onBack, onPay}) {
  const p = product || PRODUCTS[0];
  const [method, setMethod] = React.useState('swift');
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <BackBtn onPress={onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:700,color:DS.text}}>Безопасная сделка</div>
          <div style={{fontSize:11,color:DS.green,fontWeight:600,marginTop:2}}>🔒 Оплата через платформу</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {/* order summary */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'16px'}}>
          <div style={{fontSize:13,color:DS.muted,marginBottom:10}}>Заказ</div>
          <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{p.img}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:DS.text}}>{p.name}</div>
              <div style={{fontSize:12,color:DS.sub}}>1 000 ед. · {p.supplier}</div>
            </div>
          </div>
          {[['Стоимость товара','$4 200'],['Доставка','$1 200'],['Налоги','$1 836']].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${DS.border}`}}>
              <span style={{fontSize:13,color:DS.sub}}>{k}</span>
              <span style={{fontSize:13,color:DS.text,fontWeight:500}}>{v}</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0 0'}}>
            <span style={{fontSize:15,fontWeight:700,color:DS.text}}>Итого</span>
            <span style={{fontSize:15,fontWeight:800,color:DS.lime}}>$7 236</span>
          </div>
        </div>
        {/* escrow explanation */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px'}}>
          <div style={{fontSize:14,fontWeight:700,color:DS.text,marginBottom:12}}>Как работает защита</div>
          {[['1','Вы оплачиваете через платформу'],['2','Поставщик отправляет товар'],['3','Вы подтверждаете получение'],['4','Средства переводятся поставщику']].map(([n,tx])=>(
            <div key={n} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
              <div style={{width:24,height:24,borderRadius:'50%',background:DS.limeDim,border:`1px solid ${DS.limeDim2}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:DS.lime,flexShrink:0}}>{n}</div>
              <div style={{fontSize:13,color:DS.sub}}>{tx}</div>
            </div>
          ))}
        </div>
        {/* payment method */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px'}}>
          <div style={{fontSize:14,fontWeight:700,color:DS.text,marginBottom:12}}>Способ оплаты</div>
          {[['swift','SWIFT •••• USD'],['card','Visa •••• 4421']].map(m=>(
            <div key={m[0]} onClick={()=>setMethod(m[0])} style={{display:'flex',alignItems:'center',gap:12,padding:'10px',borderRadius:12,background:method===m[0]?DS.limeDim:DS.s2,border:`1px solid ${method===m[0]?DS.limeDim2:DS.border}`,marginBottom:8,cursor:'pointer',transition:'all .15s'}}>
              <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${method===m[0]?DS.lime:DS.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {method===m[0]&&<div style={{width:10,height:10,borderRadius:'50%',background:DS.lime}}/>}
              </div>
              <div style={{fontSize:14,color:DS.text,fontWeight:500}}>{m[1]}</div>
            </div>
          ))}
        </div>
        <LimeBtn style={{width:'100%'}} onPress={onPay} icon="🔒">Оплатить $7 236</LimeBtn>
        <div style={{fontSize:11,color:DS.muted,textAlign:'center',lineHeight:1.5}}>Средства будут переведены продавцу после подтверждения получения товара</div>
      </div>
    </div>
  );
}
window.SafeDealScreen = SafeDealScreen;

// ── 14 DEAL TRACKING ──────────────────────────────────────
function DealTrackingScreen({onBack, onChat, onConfirm}) {
  const steps = [
    {label:'Оплата подтверждена',  sub:'TradeAI держит средства',date:'14 апр, 10:22',done:true},
    {label:'Поставщик готовит товар',sub:'Производство: 15–20 дней',date:'15–30 апр',done:true},
    {label:'Товар отправлен',       sub:'Морской фрейт · DHL',date:'2 мая',done:false},
    {label:'Ожидает получения',     sub:'Прибытие в Москву',date:'~30 мая',done:false},
    {label:'Сделка завершена',      sub:'Средства переведены',date:'—',done:false},
  ];
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <BackBtn onPress={onBack}/>
        <div style={{flex:1,fontSize:17,fontWeight:700,color:DS.text}}>Статус сделки</div>
        <Tag lime>В процессе</Tag>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {/* deal header */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:18,padding:'16px'}}>
          <div style={{fontSize:13,color:DS.muted,marginBottom:4}}>Сделка #ORD-2841</div>
          <div style={{fontSize:22,fontWeight:800,color:DS.text,marginBottom:4}}>$7 278</div>
          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
            <VBadge small/>
            <Tag muted>Shenzhen TechParts</Tag>
          </div>
          {/* progress bar */}
          <div style={{height:4,borderRadius:2,background:DS.s3,overflow:'hidden'}}>
            <div style={{width:'40%',height:'100%',background:DS.lime,borderRadius:2}}/>
          </div>
          <div style={{fontSize:11,color:DS.sub,marginTop:6}}>40% выполнено · Шаг 2 из 5</div>
        </div>
        {/* timeline */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:18,padding:'16px'}}>
          <div style={{fontSize:14,fontWeight:700,color:DS.text,marginBottom:16}}>Этапы сделки</div>
          {steps.map((st,i)=>(
            <div key={st.label} style={{display:'flex',gap:14,marginBottom:i<steps.length-1?16:0}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:0,flexShrink:0}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:st.done?DS.lime:DS.s2,border:`2px solid ${st.done?DS.lime:DS.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {st.done&&<svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#0d0e10" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                </div>
                {i<steps.length-1&&<div style={{width:2,flex:1,background:st.done?DS.lime:DS.border,minHeight:20,marginTop:4,borderRadius:1}}/>}
              </div>
              <div style={{flex:1,paddingBottom:i<steps.length-1?0:0}}>
                <div style={{fontSize:13,fontWeight:600,color:st.done?DS.text:DS.sub}}>{st.label}</div>
                <div style={{fontSize:11,color:DS.muted,marginTop:2}}>{st.sub}</div>
                <div style={{fontSize:10,color:st.done?DS.lime:DS.muted,marginTop:2,fontWeight:st.done?600:400}}>{st.date}</div>
              </div>
            </div>
          ))}
        </div>
        {/* actions */}
        <div style={{display:'flex',gap:10}}>
          <LimeBtn dark style={{flex:1}} onPress={onChat} icon="💬">Поставщику</LimeBtn>
          <LimeBtn dark style={{flex:1}} onPress={()=>{}} icon="🆘">Поддержка</LimeBtn>
        </div>
        <LimeBtn outline style={{width:'100%'}} onPress={onConfirm}>✓ Подтвердить получение</LimeBtn>
      </div>
    </div>
  );
}
window.DealTrackingScreen = DealTrackingScreen;

// ── 15 BUYER PROFILE ──────────────────────────────────────
function BuyerProfileScreen({onBack, tab, onTab}) {
  const menuItems = [
    {icon:'⚙️',label:'Настройки',sub:'Уведомления, язык, безопасность'},
    {icon:'💳',label:'Кошелёк и оплата',sub:'SWIFT · Visa •••• 4421'},
    {icon:'📂',label:'Сохранённые',sub:'12 поставщиков · 8 товаров'},
    {icon:'📋',label:'История поиска',sub:'Последние 30 дней'},
    {icon:'🌐',label:'Язык и валюта',sub:'Русский · USD'},
    {icon:'🔒',label:'Безопасность',sub:'2FA включена'},
  ];
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 14px',flexShrink:0}}>
        <div style={{fontSize:22,fontWeight:800,color:DS.text,letterSpacing:-.5}}>Профиль</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'0 20px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {/* profile card */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:20,padding:'20px',display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:60,height:60,borderRadius:20,background:`linear-gradient(135deg,${DS.lime},#3a6400)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:'#0d0e10',flexShrink:0}}>ИВ</div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:700,color:DS.text}}>Иван Волков</div>
            <div style={{fontSize:12,color:DS.sub,marginTop:2}}>Директор по закупкам</div>
            <div style={{display:'flex',gap:6,marginTop:8}}><Tag lime>Премиум</Tag><VBadge small/></div>
          </div>
          <div style={{width:32,height:32,borderRadius:10,background:DS.s2,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
        </div>
        {/* stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          <StatCard label="Оборот" value="$36.4K" lime/>
          <StatCard label="Сделки" value="3"/>
          <StatCard label="Поставщики" value="12"/>
        </div>
        {/* preferences */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px'}}>
          <div style={{fontSize:14,fontWeight:700,color:DS.text,marginBottom:10}}>Предпочтения</div>
          <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
            {['Металл','Электроника','Китай','Вьетнам','USD'].map(t=><Tag key={t} muted>{t}</Tag>)}
          </div>
        </div>
        {/* menu */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:18,overflow:'hidden'}}>
          {menuItems.map((it,i)=>(
            <div key={it.label} style={{display:'flex',alignItems:'center',gap:13,padding:'14px 16px',borderBottom:i<menuItems.length-1?`1px solid ${DS.border}`:'none',cursor:'pointer'}}>
              <div style={{width:36,height:36,borderRadius:11,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>{it.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,color:DS.text,fontWeight:500}}>{it.label}</div>
                <div style={{fontSize:11,color:DS.muted,marginTop:1}}>{it.sub}</div>
              </div>
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={DS.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
          ))}
        </div>
      </div>
      <TabBar tabs={[
        {id:'home',label:'Главная',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><polyline points="9,22 9,12 15,12 15,22" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
        {id:'catalog',label:'Каталог',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
        {id:'msgs',label:'Сообщения',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
        {id:'deals',label:'Сделки',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="9" y="3" width="6" height="4" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
        {id:'profile',label:'Профиль',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
      ]} active='profile' onTab={onTab}/>
    </div>
  );
}
window.BuyerProfileScreen = BuyerProfileScreen;

// ── 16 SELLER DASHBOARD ───────────────────────────────────
const SELLER_TABS = [
  {id:'home',label:'Главная',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><polyline points="9,22 9,12 15,12 15,22" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
  {id:'catalog',label:'Каталог',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
  {id:'requests',label:'Запросы',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><circle cx="9" cy="7" r="4" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={a?DS.lime:DS.muted} strokeWidth="1.8" strokeLinecap="round"/></svg>},
  {id:'deals',label:'Сделки',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="9" y="3" width="6" height="4" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
  {id:'profile',label:'Профиль',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
];

function SellerDashScreen({onRequests, onCatalog, onTab}) {
  const leads = [
    {buyer:'Иван В.', co:'ООО «МеталлТрейд»', interest:'Нержавеющая сталь 316L', qty:'5 т', time:'2 ч назад', urgent:true},
    {buyer:'Sophie M.', co:'EuroTrade GmbH', interest:'PCB контроллеры', qty:'2 000 ед.', time:'5 ч назад', urgent:false},
    {buyer:'王明', co:'Beijing Trading Co.', interest:'Текстиль 200г/м²', qty:'500 м', time:'вчера', urgent:false},
  ];
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontSize:11,color:DS.muted,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:600}}>Продавец</div>
          <div style={{fontSize:22,fontWeight:800,color:DS.text,letterSpacing:-.5}}>TradeAI</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <div style={{width:36,height:36,borderRadius:12,background:DS.s1,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <div style={{width:36,height:36,borderRadius:12,background:`linear-gradient(135deg,${DS.lime},#3a6400)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#0d0e10'}}>JT</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 20px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {/* company identity */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:18,padding:'16px',display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:48,height:48,borderRadius:16,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🏭</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:DS.text}}>Jiangsu Textile Group</div>
            <div style={{display:'flex',gap:6,marginTop:6}}><VBadge small/><Tag muted>🇨🇳 Китай</Tag></div>
          </div>
        </div>
        {/* KPI grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <StatCard label="Новые запросы" value="3" lime change="+2 сегодня"/>
          <StatCard label="Активные сделки" value="7"/>
          <StatCard label="Ожидают оплаты" value="2" lime/>
          <StatCard label="Выплаты" value="$24.1K"/>
        </div>
        {/* leads */}
        <div>
          <SectionHeader title="Входящие запросы" action="Все →" onAction={onRequests}/>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {leads.map((l,i)=>(
              <div key={i} style={{background:DS.s1,border:`1px solid ${l.urgent?DS.limeDim2:DS.border}`,borderRadius:16,padding:'14px 16px',cursor:'pointer'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <div style={{fontSize:14,fontWeight:600,color:DS.text}}>{l.buyer} · {l.co}</div>
                  <div style={{fontSize:11,color:DS.muted}}>{l.time}</div>
                </div>
                <div style={{fontSize:13,color:DS.sub,marginBottom:8}}>{l.interest} · {l.qty}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',gap:7}}>{l.urgent&&<Tag lime>Срочно</Tag>}<Tag muted>Новый запрос</Tag></div>
                  <div style={{fontSize:12,color:DS.lime,fontWeight:700,cursor:'pointer'}}>Ответить →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* catalog entry */}
        <div onClick={onCatalog} style={{background:DS.limeDim,border:`1.5px solid ${DS.limeDim2}`,borderRadius:16,padding:'16px',display:'flex',alignItems:'center',gap:14,cursor:'pointer'}}>
          <div style={{width:44,height:44,borderRadius:14,background:'rgba(200,255,0,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>📦</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:DS.lime}}>Управление каталогом</div>
            <div style={{fontSize:12,color:'rgba(200,255,0,0.6)',marginTop:2}}>4 товара · 2 активных</div>
          </div>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={DS.lime} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>
      </div>
      <TabBar tabs={SELLER_TABS} active='home' onTab={onTab}/>
    </div>
  );
}
window.SellerDashScreen = SellerDashScreen;

// ── 17 SELLER CATALOG MANAGEMENT ─────────────────────────
function SellerCatalogScreen({onBack, onTab}) {
  const myProducts = PRODUCTS.map((p,i)=>({...p,status:i<2?'active':'draft',views:Math.floor(Math.random()*200+50)}));
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <BackBtn onPress={onBack}/>
        <div style={{flex:1,fontSize:17,fontWeight:700,color:DS.text}}>Мой каталог</div>
        <LimeBtn small icon="+" onPress={()=>{}}>Добавить</LimeBtn>
      </div>
      <div style={{padding:'12px 20px 0',display:'flex',gap:8,overflowX:'auto',flexShrink:0}}>
        {['Все','Активные','Черновики','Архив'].map((f,i)=>(
          <FilterChip key={f} label={f} active={i===0}/>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 20px 20px',display:'flex',flexDirection:'column',gap:10}}>
        {myProducts.map(p=>(
          <div key={p.id} style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px',display:'flex',gap:14,alignItems:'center'}}>
            <div style={{width:52,height:52,borderRadius:14,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{p.img}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:DS.text,marginBottom:3}}>{p.name}</div>
              <div style={{fontSize:12,color:DS.sub,marginBottom:7}}>{p.price} · {p.moq}</div>
              <div style={{display:'flex',gap:7}}>
                <Tag green={p.status==='active'} muted={p.status!=='active'}>{p.status==='active'?'В наличии':'Черновик'}</Tag>
                <Tag muted>👁 {p.views}</Tag>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <div style={{width:32,height:32,borderRadius:9,background:DS.s2,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
            </div>
          </div>
        ))}
        {/* add empty state */}
        <div style={{background:DS.s1,border:`2px dashed ${DS.border}`,borderRadius:16,padding:'24px',display:'flex',flexDirection:'column',alignItems:'center',gap:10,cursor:'pointer'}}>
          <div style={{width:44,height:44,borderRadius:14,background:DS.limeDim,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>➕</div>
          <div style={{fontSize:14,fontWeight:600,color:DS.sub}}>Добавить товар</div>
        </div>
      </div>
      <TabBar tabs={SELLER_TABS} active='catalog' onTab={onTab}/>
    </div>
  );
}
window.SellerCatalogScreen = SellerCatalogScreen;

// ── 18 SELLER REQUESTS & ORDERS ───────────────────────────
function SellerRequestsScreen({onBack, onTab}) {
  const [activeTab, setActiveTab] = React.useState('new');
  const requests = [
    {id:1,buyer:'Иван Волков',co:'ООО «МеталлТрейд»',product:'Сталь 316L',qty:'5 т',date:'Сегодня',status:'new'},
    {id:2,buyer:'Sophie M.',co:'EuroTrade GmbH',product:'PCB v3',qty:'2 000 ед.',date:'Вчера',status:'new'},
    {id:3,buyer:'王明',co:'Beijing Trading',product:'Текстиль',qty:'500 м',date:'12 апр.',status:'negotiating'},
  ];
  const orders = [
    {id:'ORD-2841',buyer:'Иван Волков',amount:'$12 400',status:'В пути',payout:'После получения'},
    {id:'ORD-2790',buyer:'EuroTrade',amount:'$8 600',status:'На таможне',payout:'После получения'},
  ];
  const filtered = activeTab==='new' ? requests.filter(r=>r.status==='new') : activeTab==='neg' ? requests.filter(r=>r.status==='negotiating') : orders;
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 14px',flexShrink:0}}>
        <div style={{fontSize:22,fontWeight:800,color:DS.text,letterSpacing:-.5}}>Запросы</div>
      </div>
      {/* tabs */}
      <div style={{padding:'0 20px 0',flexShrink:0}}>
        <div style={{display:'flex',background:DS.s2,borderRadius:12,padding:4}}>
          {[['new','Новые'],['neg','В переговорах'],['orders','Заказы']].map(([id,lb])=>(
            <div key={id} onClick={()=>setActiveTab(id)} style={{flex:1,height:36,borderRadius:9,background:activeTab===id?DS.s3:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:12,fontWeight:activeTab===id?600:400,color:activeTab===id?DS.text:DS.sub}}>{lb}</div>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 20px 20px',display:'flex',flexDirection:'column',gap:10}}>
        {activeTab !== 'orders' ? filtered.map(r=>(
          <div key={r.id} style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px',cursor:'pointer'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <div style={{fontSize:14,fontWeight:600,color:DS.text}}>{r.buyer}</div>
              <div style={{fontSize:11,color:DS.muted}}>{r.date}</div>
            </div>
            <div style={{fontSize:12,color:DS.sub,marginBottom:3}}>{r.co}</div>
            <div style={{fontSize:13,color:DS.text,marginBottom:10}}>{r.product} · <span style={{color:DS.lime,fontWeight:600}}>{r.qty}</span></div>
            <div style={{display:'flex',gap:10}}>
              <LimeBtn dark small style={{flex:1}} onPress={()=>{}}>Детали</LimeBtn>
              <LimeBtn small style={{flex:1}} onPress={()=>{}}>Ответить</LimeBtn>
            </div>
          </div>
        )) : orders.map(o=>(
          <div key={o.id} style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <div style={{fontSize:12,color:DS.muted}}>#{o.id}</div>
              <Tag lime={o.status==='В пути'} muted={o.status!=='В пути'}>{o.status}</Tag>
            </div>
            <div style={{fontSize:14,fontWeight:600,color:DS.text,marginBottom:3}}>{o.buyer}</div>
            <div style={{fontSize:20,fontWeight:800,color:DS.lime,marginBottom:8}}>{o.amount}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:12,color:DS.muted}}>{o.payout}</div>
              <div style={{fontSize:12,color:DS.sub,cursor:'pointer',fontWeight:500}}>Детали →</div>
            </div>
          </div>
        ))}
      </div>
      <TabBar tabs={SELLER_TABS} active='requests' onTab={onTab}/>
    </div>
  );
}
window.SellerRequestsScreen = SellerRequestsScreen;
