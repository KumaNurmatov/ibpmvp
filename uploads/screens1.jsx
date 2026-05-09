// screens1.jsx — Screens 01–09: Splash, Role, Auth, Home, Catalog, Search, Product, Supplier, AI

// ── 01 SPLASH ─────────────────────────────────────────────
function SplashScreen({onNext}) {
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingTop:60,padding:'60px 32px 40px',gap:0}}>
      {/* ambient globe */}
      <div style={{width:160,height:160,borderRadius:'50%',background:`radial-gradient(circle at 38% 38%, rgba(200,255,0,0.18) 0%, rgba(200,255,0,0.04) 55%, transparent 70%)`,border:`1px solid rgba(200,255,0,0.15)`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:32,position:'relative'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle at 35% 35%, #fff 0%, ${DS.lime} 45%, #3a6400 100%)`,boxShadow:`0 0 40px 10px rgba(200,255,0,0.25)`,animation:'orbPulse 3s ease-in-out infinite'}}/>
        {/* orbit dots */}
        {[0,60,120,180,240,300].map(deg=>(
          <div key={deg} style={{position:'absolute',width:6,height:6,borderRadius:'50%',background:`rgba(200,255,0,${0.2+Math.sin(deg/60)*0.3})`,top:'50%',left:'50%',transform:`rotate(${deg}deg) translateX(72px) translateY(-3px)`}}/>
        ))}
      </div>
      <div style={{fontSize:13,color:DS.lime,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:12}}>TradeAI</div>
      <div style={{fontSize:28,fontWeight:800,color:DS.text,textAlign:'center',lineHeight:1.2,letterSpacing:-.5,marginBottom:14}}>Глобальные закупки без барьеров</div>
      <div style={{fontSize:14,color:DS.sub,textAlign:'center',lineHeight:1.6,maxWidth:260,marginBottom:48}}>Поиск поставщиков, AI-помощь и безопасные международные сделки</div>
      {/* feature pills */}
      <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',marginBottom:40}}>
        {[['🌍','Поставщики из 80+ стран'],['🤖','AI-ассистент по закупкам'],['🔒','Защищённые платежи']].map(([ic,tx])=>(
          <div key={tx} style={{display:'flex',alignItems:'center',gap:12,background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:14,padding:'12px 16px'}}>
            <div style={{fontSize:20}}>{ic}</div>
            <div style={{fontSize:14,color:DS.sub,fontWeight:500}}>{tx}</div>
          </div>
        ))}
      </div>
      <LimeBtn style={{width:'100%'}} onPress={onNext}>Начать</LimeBtn>
      <div style={{fontSize:12,color:DS.muted,marginTop:16,textAlign:'center'}}>Уже есть аккаунт? <span style={{color:DS.lime,fontWeight:600}}>Войти</span></div>
    </div>
  );
}
window.SplashScreen = SplashScreen;

// ── 02 ROLE SELECTION ─────────────────────────────────────
function RoleScreen({onBuyer, onSeller}) {
  const [sel, setSel] = React.useState(null);
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:72,padding:'72px 24px 32px'}}>
      <div style={{fontSize:28,fontWeight:800,color:DS.text,letterSpacing:-.5,marginBottom:8}}>Выберите роль</div>
      <div style={{fontSize:14,color:DS.sub,marginBottom:36,lineHeight:1.5}}>Настроим интерфейс под ваши задачи</div>
      <div style={{display:'flex',flexDirection:'column',gap:14,flex:1}}>
        {[
          {id:'buyer',icon:'🛒',title:'Покупатель',desc:'Ищет товары, поставщиков и фабрики по всему миру',points:['Поиск и сравнение поставщиков','AI-расчёт стоимости','Безопасные сделки']},
          {id:'seller',icon:'🏭',title:'Продавец',desc:'Размещает товары и получает запросы от международных покупателей',points:['Управление каталогом','Входящие запросы','Выплаты через платформу']},
        ].map(r=>(
          <div key={r.id} onClick={()=>setSel(r.id)} style={{borderRadius:20,background:DS.s1,border:`2px solid ${sel===r.id?DS.lime:DS.border}`,padding:'20px',cursor:'pointer',transition:'border-color .15s',flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:44,height:44,borderRadius:14,background:sel===r.id?DS.limeDim:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,transition:'background .15s'}}>{r.icon}</div>
              <div>
                <div style={{fontSize:17,fontWeight:700,color:DS.text}}>{r.title}</div>
                <div style={{fontSize:12,color:DS.sub,marginTop:2}}>{r.desc}</div>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {r.points.map(p=>(
                <div key={p} style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:sel===r.id?DS.limeDim:DS.s3,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2.5" stroke={sel===r.id?DS.lime:DS.muted} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                  </div>
                  <div style={{fontSize:13,color:DS.sub}}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <LimeBtn style={{width:'100%',marginTop:24}} onPress={()=>sel==='buyer'?onBuyer():onSeller()}>Продолжить</LimeBtn>
    </div>
  );
}
window.RoleScreen = RoleScreen;

// ── 03 BUYER AUTH ─────────────────────────────────────────
function BuyerAuthScreen({onNext}) {
  const [tab, setTab] = React.useState('login');
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:72,padding:'72px 24px 32px'}}>
      <div style={{marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:28,height:28,borderRadius:8,background:DS.limeDim,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🛒</div>
        <div style={{fontSize:12,color:DS.lime,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Покупатель</div>
      </div>
      <div style={{fontSize:26,fontWeight:800,color:DS.text,letterSpacing:-.5,marginBottom:6}}>Вход для покупателя</div>
      <div style={{fontSize:14,color:DS.sub,marginBottom:28}}>Найдите поставщиков и начните закупку</div>
      {/* tab */}
      <div style={{display:'flex',background:DS.s2,borderRadius:12,padding:4,marginBottom:24}}>
        {[['login','Войти'],['reg','Регистрация']].map(([id,lb])=>(
          <div key={id} onClick={()=>setTab(id)} style={{flex:1,height:38,borderRadius:9,background:tab===id?DS.s3:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,fontWeight:tab===id?600:400,color:tab===id?DS.text:DS.sub,transition:'all .15s'}}>{lb}</div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14,flex:1}}>
        {tab==='reg'&&<Input label="Имя и фамилия" placeholder="Иван Петров"/>}
        <Input label="Телефон или email" placeholder="+7 999 000-00-00"/>
        <Input label="Пароль" type="password" placeholder="••••••••"/>
        {tab==='login'&&<div style={{textAlign:'right',marginTop:-6}}><span style={{fontSize:12,color:DS.lime,fontWeight:600,cursor:'pointer'}}>Забыли пароль?</span></div>}
      </div>
      <div style={{marginTop:24}}>
        <LimeBtn style={{width:'100%',marginBottom:14}} onPress={onNext}>{tab==='login'?'Войти':'Создать аккаунт'}</LimeBtn>
        <Divider my={0}/>
        <div style={{fontSize:12,color:DS.muted,textAlign:'center',marginTop:14}}>Продолжая, вы соглашаетесь с <span style={{color:DS.lime}}>условиями платформы</span></div>
      </div>
    </div>
  );
}
window.BuyerAuthScreen = BuyerAuthScreen;

// ── 04 SELLER AUTH ─────────────────────────────────────────
function SellerAuthScreen({onNext}) {
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:72,padding:'72px 24px 32px'}}>
      <div style={{marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:28,height:28,borderRadius:8,background:DS.limeDim,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🏭</div>
        <div style={{fontSize:12,color:DS.lime,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Продавец</div>
      </div>
      <div style={{fontSize:26,fontWeight:800,color:DS.text,letterSpacing:-.5,marginBottom:6}}>Вход для продавца</div>
      <div style={{fontSize:14,color:DS.sub,marginBottom:28}}>Управляйте каталогом и входящими запросами</div>
      <div style={{display:'flex',flexDirection:'column',gap:14,flex:1}}>
        <Input label="Название компании" placeholder="Ваша компания Ltd."/>
        <Input label="Страна" placeholder="Китай, Индия, Вьетнам…"/>
        <Input label="Телефон или email" placeholder="+86 000 000-0000"/>
        <Input label="Пароль" type="password" placeholder="••••••••"/>
        <div style={{display:'flex',alignItems:'flex-start',gap:10,background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:12,padding:'12px 14px',marginTop:4}}>
          <div style={{fontSize:18,marginTop:1}}>🔒</div>
          <div style={{fontSize:12,color:DS.sub,lineHeight:1.5}}>Данные компании можно будет подтвердить позже для получения статуса «Верифицирован»</div>
        </div>
      </div>
      <LimeBtn style={{width:'100%',marginTop:24}} onPress={onNext}>Продолжить</LimeBtn>
    </div>
  );
}
window.SellerAuthScreen = SellerAuthScreen;

// ── Category product illustrations ────────────────────────
function MetalImg({small}) {
  const s = small ? 0.7 : 1;
  return (
    <svg width={110*s} height={90*s} viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      {/* Steel coil */}
      <ellipse cx="62" cy="62" rx="36" ry="22" fill="#3a3a3c" stroke="#555" strokeWidth="1"/>
      <ellipse cx="62" cy="58" rx="36" ry="22" fill="#48484a" stroke="#666" strokeWidth="1"/>
      <ellipse cx="62" cy="54" rx="36" ry="22" fill="#555" stroke="#777" strokeWidth="1"/>
      <ellipse cx="62" cy="50" rx="36" ry="22" fill="#636366" stroke="#888" strokeWidth="1"/>
      <ellipse cx="62" cy="46" rx="36" ry="22" fill="#6e6e73" stroke="#999" strokeWidth="1"/>
      <ellipse cx="62" cy="46" rx="22" ry="13" fill="#3a3a3c" stroke="#555" strokeWidth="1"/>
      <ellipse cx="62" cy="46" rx="12" ry="7" fill="#2c2c2e" stroke="#444" strokeWidth="1"/>
      {/* gear */}
      <g transform="translate(18,18) scale(0.9)">
        <circle cx="22" cy="22" r="14" fill="#6e6e73" stroke="#888" strokeWidth="1.5"/>
        <circle cx="22" cy="22" r="8" fill="#3a3a3c" stroke="#555" strokeWidth="1"/>
        {[0,45,90,135,180,225,270,315].map(a=>(
          <rect key={a} x="20" y="6" width="4" height="7" rx="2" fill="#888"
            transform={`rotate(${a} 22 22)`}/>
        ))}
      </g>
    </svg>
  );
}

function TextileImg({small}) {
  const s = small ? 0.7 : 1;
  return (
    <svg width={110*s} height={90*s} viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      {/* fabric rolls stacked */}
      {[
        {x:55,y:72,rx:18,ry:11,fill:'#8B5E3C',stroke:'#A0714A'},
        {x:30,y:65,rx:16,ry:10,fill:'#C17F3A',stroke:'#D4924E'},
        {x:78,y:62,rx:14,ry:9, fill:'#6B4B8A',stroke:'#7E5EA0'},
        {x:52,y:56,rx:17,ry:10,fill:'#2E7D52',stroke:'#3B9464'},
        {x:28,y:50,rx:15,ry:9, fill:'#B5451B',stroke:'#C85A2A'},
      ].map((r,i)=>(
        <g key={i}>
          <ellipse cx={r.x} cy={r.y} rx={r.rx} ry={r.ry} fill={r.stroke}/>
          <ellipse cx={r.x} cy={r.y-6} rx={r.rx} ry={r.ry} fill={r.fill} stroke={r.stroke} strokeWidth="0.5"/>
          <ellipse cx={r.x} cy={r.y-6} rx={r.rx*0.5} ry={r.ry*0.5} fill={r.stroke} opacity="0.4"/>
        </g>
      ))}
    </svg>
  );
}

function ElectroImg({small}) {
  const s = small ? 0.7 : 1;
  return (
    <svg width={110*s} height={90*s} viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      {/* PCB board */}
      <rect x="10" y="22" width="90" height="62" rx="4" fill="#1B4D1B" stroke="#2D6A2D" strokeWidth="1"/>
      <rect x="14" y="26" width="82" height="54" rx="3" fill="#1E5C1E"/>
      {/* traces */}
      {[[20,40,60,40],[20,50,40,50],[60,60,90,60],[30,70,30,50],[70,40,70,65]].map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C8FF00" strokeWidth="1" opacity="0.5"/>
      ))}
      {/* chips */}
      <rect x="30" y="34" width="20" height="14" rx="2" fill="#1c1c1e" stroke="#555" strokeWidth="1"/>
      <rect x="60" y="42" width="24" height="16" rx="2" fill="#1c1c1e" stroke="#555" strokeWidth="1"/>
      <rect x="32" y="58" width="16" height="10" rx="2" fill="#48484a" stroke="#666" strokeWidth="1"/>
      {/* capacitors */}
      {[[80,32,4,10],[84,48,4,10]].map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#C17F3A" stroke="#888" strokeWidth="0.5"/>
      ))}
      {/* connectors edge */}
      {[28,36,44,52,60,68].map((y,i)=>(
        <rect key={i} x="10" y={y} width="6" height="4" rx="1" fill="#888"/>
      ))}
    </svg>
  );
}

function PackagingImg({small}) {
  const s = small ? 0.7 : 1;
  return (
    <svg width={110*s} height={90*s} viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      {/* back box */}
      <rect x="42" y="28" width="52" height="42" rx="3" fill="#8B6914" stroke="#A07818" strokeWidth="1"/>
      <polygon points="42,28 70,18 94,28" fill="#A07818"/>
      <polygon points="94,28 94,70 70,60 70,18" fill="#6B4F0E"/>
      {/* front box open */}
      <rect x="16" y="42" width="46" height="38" rx="3" fill="#C8960A" stroke="#D4A412" strokeWidth="1"/>
      <polygon points="16,42 39,32 62,42" fill="#D4A412"/>
      <polygon points="62,42 62,80 39,70 39,32" fill="#A07818"/>
      {/* flaps open */}
      <polygon points="16,42 39,32 30,22 10,30" fill="#B88010" stroke="#C8960A" strokeWidth="0.5"/>
      <polygon points="62,42 39,32 46,20 68,30" fill="#B88010" stroke="#C8960A" strokeWidth="0.5"/>
    </svg>
  );
}

function ToolsImg({small}) {
  const s = small ? 0.65 : 1;
  return (
    <svg width={90*s} height={80*s} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      {/* drill */}
      <rect x="30" y="30" width="42" height="18" rx="4" fill="#333" stroke="#555" strokeWidth="1"/>
      <rect x="64" y="34" width="16" height="10" rx="2" fill="#666"/>
      <rect x="72" y="32" width="8" height="16" rx="2" fill="#444"/>
      <circle cx="80" cy="40" r="4" fill="#888"/>
      <rect x="36" y="48" width="20" height="12" rx="3" fill="#222" stroke="#444" strokeWidth="1"/>
      <rect x="34" y="33" width="4" height="12" rx="1" fill="#C8FF00" opacity="0.8"/>
      {/* screwdriver */}
      <line x1="10" y1="20" x2="55" y2="65" stroke="#888" strokeWidth="5" strokeLinecap="round"/>
      <rect x="6" y="16" width="10" height="7" rx="2" fill="#C17F3A" transform="rotate(-45 11 19)"/>
      <line x1="52" y1="62" x2="58" y2="68" stroke="#aaa" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function ConstructImg({small}) {
  const s = small ? 0.65 : 1;
  return (
    <svg width={90*s} height={80*s} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      {/* bricks */}
      {[[8,52,26,12],[38,52,26,12],[8,38,26,12],[38,38,26,12],[23,24,26,12],[53,24,26,12]].map(([x,y,w,h],i)=>(
        <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill={i%2===0?'#8B4513':'#A0522D'} stroke="#6B3410" strokeWidth="0.5"/>
      ))}
      {/* aluminium profile */}
      <rect x="58" y="36" width="26" height="8" rx="2" fill="#8E8E93" stroke="#636366" strokeWidth="1"/>
      <rect x="60" y="38" width="22" height="4" rx="1" fill="#636366"/>
      <rect x="58" y="48" width="26" height="8" rx="2" fill="#8E8E93" stroke="#636366" strokeWidth="1"/>
      <rect x="60" y="50" width="22" height="4" rx="1" fill="#636366"/>
      <rect x="58" y="60" width="26" height="8" rx="2" fill="#aeaeb2" stroke="#8E8E93" strokeWidth="1"/>
    </svg>
  );
}

function HardwareImg({small}) {
  const s = small ? 0.65 : 1;
  return (
    <svg width={90*s} height={80*s} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      {/* hinges */}
      <rect x="10" y="22" width="28" height="36" rx="3" fill="#8E8E93" stroke="#636366" strokeWidth="1"/>
      <rect x="14" y="22" width="8" height="36" rx="2" fill="#636366"/>
      <circle cx="18" cy="28" r="3" fill="#48484a"/>
      <circle cx="18" cy="40" r="3" fill="#48484a"/>
      <circle cx="18" cy="52" r="3" fill="#48484a"/>
      {/* bolts scattered */}
      {[[52,18],[62,22],[56,32],[70,28],[64,42],[54,48],[72,46],[58,60],[74,58]].map(([x,y],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill="#8E8E93" stroke="#636366" strokeWidth="0.5"/>
          <circle cx={x} cy={y} r="3" fill="#636366"/>
          <line x1={x-4} y1={y} x2={x+4} y2={y} stroke="#48484a" strokeWidth="1"/>
          <line x1={x} y1={y-4} x2={x} y2={y+4} stroke="#48484a" strokeWidth="1"/>
        </g>
      ))}
    </svg>
  );
}

// ── 05 BUYER HOME ─────────────────────────────────────────
const CATS = [
  {id:'meta',label:'Металл',      icon:'⚙️', bg:'#1a1410'},
  {id:'text',label:'Текстиль',    icon:'🧵', bg:'#0f1a14'},
  {id:'elec',label:'Электроника', icon:'⚡', bg:'#101528'},
  {id:'pack',label:'Упаковка',    icon:'📦', bg:'#1a1020'},
  {id:'equi',label:'Оборудование',icon:'🔧', bg:'#1a1810'},
  {id:'cons',label:'Стройматериалы',icon:'🧱',bg:'#181410'},
  {id:'furn',label:'Мебель',      icon:'🪑', bg:'#14180f'},
];
const AI_PROMPTS_HOME = [
  {icon:'🏭',text:'Найти поставщиков металла'},
  {icon:'🚢',text:'Рассчитать доставку'},
  {icon:'📊',text:'Сравнить фабрики'},
  {icon:'✅',text:'Проверенные производители'},
  {icon:'🌐',text:'Перевести переписку'},
  {icon:'💰',text:'Итоговая стоимость'},
];

function BuyerHomeScreen({onCat, onSupplier, onAI, onAIMsg, tab, onTab}) {
  const [aiQuery, setAiQuery] = React.useState('');
  const [aiOpen, setAiOpen] = React.useState(true);
  const buyerTabs = [
    {id:'home',  label:'Главная', icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={a?DS.lime:DS.muted} strokeWidth="1.8" fill={a?DS.limeDim:'none'}/><polyline points="9,22 9,12 15,12 15,22" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
    {id:'catalog',label:'Каталог',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
    {id:'msgs',  label:'Сообщения',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
    {id:'deals', label:'Сделки',  icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="9" y="3" width="6" height="4" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><path d="M9 12l2 2 4-4" stroke={a?DS.lime:DS.muted} strokeWidth="1.8" strokeLinecap="round"/></svg>},
    {id:'profile',label:'Профиль',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
  ];

  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden',transition:'background .3s'}}>
      {/* header */}
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontSize:11,color:DS.muted,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:600}}>Маркетплейс</div>
          <div style={{fontSize:22,fontWeight:800,color:DS.text,letterSpacing:-.5}}>TradeAI</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <div style={{width:36,height:36,borderRadius:12,background:DS.s1,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={DS.sub} strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <div style={{width:36,height:36,borderRadius:12,background:`linear-gradient(135deg,${DS.lime},#3a6400)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#0d0e10'}}>ИВ</div>
        </div>
      </div>
      {/* search */}
      <div style={{padding:'12px 20px 0',flexShrink:0}}>
        <SearchBar onFilter={()=>{}}/>
      </div>
      {/* filters */}
      <div style={{padding:'10px 20px 0',display:'flex',gap:8,overflowX:'auto',flexShrink:0}}>
        {['Все','Проверенные','Готово к отправке','MOQ < 50','Металл','Текстиль'].map((f,i)=>(
          <FilterChip key={f} label={f} active={i===0}/>
        ))}
      </div>
      {/* categories — large visual cards */}
      <div style={{padding:'12px 20px 0',flexShrink:0}}>
        {/* Row 1+2: 2-col large cards */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:9}}>
          {[
            {id:'meta',label:'Металл',      bg:'#1c1e20', img:MetalImg},
            {id:'text',label:'Текстиль',    bg:'#1c1e20', img:TextileImg},
            {id:'elec',label:'Электроника', bg:'#1c1e20', img:ElectroImg},
            {id:'pack',label:'Упаковка',    bg:'#1c1e20', img:PackagingImg},
          ].map(c=>(
            <div key={c.id} onClick={()=>onCat(c)} style={{borderRadius:16,background:c.bg,border:'1px solid rgba(255,255,255,0.07)',height:118,overflow:'hidden',cursor:'pointer',position:'relative',flexShrink:0}}>
              <div style={{position:'absolute',top:12,left:13,fontSize:14,fontWeight:700,color:'#fff',letterSpacing:-.2,zIndex:2}}>{c.label}</div>
              <div style={{position:'absolute',bottom:0,right:0,width:'62%',height:'100%',display:'flex',alignItems:'flex-end',justifyContent:'flex-end'}}>
                <c.img/>
              </div>
            </div>
          ))}
        </div>
        {/* Row 3: 3-col smaller cards */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9}}>
          {[
            {id:'equi',label:'Оборудование',  bg:'#1c1e20', img:ToolsImg},
            {id:'cons',label:'Стройматериалы',bg:'#1c1e20', img:ConstructImg},
            {id:'furn',label:'Фурнитура',     bg:'#1c1e20', img:HardwareImg},
          ].map(c=>(
            <div key={c.id} onClick={()=>onCat(c)} style={{borderRadius:16,background:c.bg,border:'1px solid rgba(255,255,255,0.07)',height:90,overflow:'hidden',cursor:'pointer',position:'relative'}}>
              <div style={{position:'absolute',top:9,left:10,fontSize:12,fontWeight:700,color:'#fff',letterSpacing:-.1,zIndex:2,lineHeight:1.2}}>{c.label}</div>
              <div style={{position:'absolute',bottom:0,right:0,width:'58%',height:'100%',display:'flex',alignItems:'flex-end',justifyContent:'flex-end'}}>
                <c.img small/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PERSISTENT AI PANEL ══ */}
      <div style={{marginTop:'auto',flexShrink:0,borderRadius:'22px 22px 0 0',background:DS.s1,borderTop:`1px solid ${DS.border2}`,boxShadow:`0 -4px 24px rgba(0,0,0,0.15), 0 -1px 0 rgba(200,255,0,0.12)`,transition:'all .25s ease'}}>
        {/* drag pill — tap to toggle */}
        <div onClick={()=>setAiOpen(o=>!o)} style={{display:'flex',justifyContent:'center',paddingTop:10,paddingBottom:6,cursor:'pointer'}}>
          <div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.18)'}}/>
        </div>
        {/* ai header — always visible */}
        <div style={{padding:'0 18px 10px',display:'flex',alignItems:'center',gap:12}}>
          <LimeOrb size={40}/>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:DS.text,letterSpacing:-.2}}>AI-ассистент по закупкам</div>
            {aiOpen && <div style={{fontSize:11,color:DS.sub,marginTop:1}}>Найдёт поставщиков, рассчитает стоимость</div>}
          </div>
          {/* collapse / expand */}
          <div onClick={()=>setAiOpen(o=>!o)} style={{width:32,height:32,borderRadius:10,background:DS.s2,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              {aiOpen
                ? <path d="M18 15l-6-6-6 6" stroke={DS.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M6 9l6 6 6-6" stroke={DS.lime} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
          </div>
          {aiOpen && <div onClick={onAI} style={{fontSize:10,color:DS.lime,background:DS.limeDim,border:`1px solid ${DS.limeDim2}`,borderRadius:20,padding:'3px 10px',fontWeight:700,cursor:'pointer',flexShrink:0}}>Открыть</div>}
        </div>
        {/* expanded content */}
        {aiOpen && (
          <>
            {/* prompt chips */}
            <div style={{padding:'0 18px 10px',display:'flex',gap:8,overflowX:'auto'}}>
              {AI_PROMPTS_HOME.map(p=>(
                <div key={p.text} onClick={()=>onAIMsg(p.text)} style={{display:'flex',alignItems:'center',gap:7,background:DS.s2,border:`1px solid ${DS.border}`,borderRadius:22,padding:'7px 12px',cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>
                  <span style={{fontSize:13}}>{p.icon}</span>
                  <span style={{fontSize:12,color:DS.sub}}>{p.text}</span>
                </div>
              ))}
            </div>
            {/* input */}
            <div style={{padding:'0 18px 20px'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,background:DS.s2,border:`1.5px solid rgba(200,255,0,0.25)`,borderRadius:16,padding:'10px 10px 10px 16px',boxShadow:`0 0 0 3px rgba(200,255,0,0.06)`}}>
                <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} placeholder="Опишите товар или задачу"
                  onFocus={onAI}
                  style={{flex:1,background:'none',border:'none',outline:'none',color:DS.text,fontSize:13,fontFamily:'inherit'}}/>
                <div onClick={()=>{if(aiQuery.trim())onAIMsg(aiQuery)}} style={{width:36,height:36,borderRadius:12,background:aiQuery?DS.lime:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'background .2s',flexShrink:0}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke={aiQuery?'#0d0e10':'rgba(255,255,255,0.4)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </>
        )}
        {!aiOpen && <div style={{height:10}}/>}
      </div>
      <TabBar tabs={buyerTabs} active={tab||'home'} onTab={onTab}/>
    </div>
  );
}
window.BuyerHomeScreen = BuyerHomeScreen;

// ── 06 CATALOG ────────────────────────────────────────────
function CatalogScreen({onBack, onProduct, onSupplier, tab, onTab}) {
  const [view, setView] = React.useState('products');
  const [activeFilter, setActiveFilter] = React.useState('Все');
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0',flexShrink:0}}>
        <div style={{fontSize:22,fontWeight:800,color:DS.text,letterSpacing:-.5,marginBottom:12}}>Каталог</div>
        <SearchBar onFilter={()=>{}}/>
      </div>
      {/* segment */}
      <div style={{padding:'12px 20px 0',flexShrink:0}}>
        <div style={{display:'flex',background:DS.s2,borderRadius:12,padding:4}}>
          {[['products','Товары'],['suppliers','Поставщики']].map(([id,lb])=>(
            <div key={id} onClick={()=>setView(id)} style={{flex:1,height:36,borderRadius:9,background:view===id?DS.s3:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,fontWeight:view===id?600:400,color:view===id?DS.text:DS.sub,transition:'all .15s'}}>{lb}</div>
          ))}
        </div>
      </div>
      {/* filter chips */}
      <div style={{padding:'10px 20px 0',display:'flex',gap:8,overflowX:'auto',flexShrink:0}}>
        {['Все','Металл','Текстиль','Электроника','Упаковка','Оборудование'].map(f=>(
          <FilterChip key={f} label={f} active={activeFilter===f} onPress={()=>setActiveFilter(f)}/>
        ))}
      </div>
      {/* AI strip */}
      <div style={{margin:'12px 20px 0',background:DS.limeDim,border:`1px solid ${DS.limeDim2}`,borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',flexShrink:0}}>
        <LimeOrb size={28}/>
        <div style={{flex:1,fontSize:12,color:DS.lime,fontWeight:600}}>Уточнить запрос через AI</div>
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={DS.lime} strokeWidth="1.6" strokeLinecap="round"/></svg>
      </div>
      {/* list */}
      <div style={{flex:1,overflowY:'auto',padding:'12px 20px 20px',display:'flex',flexDirection:'column',gap:10}}>
        {view==='products' ? PRODUCTS.map(p=>(
          <div key={p.id} onClick={()=>onProduct(p)} style={{borderRadius:16,background:DS.s1,border:`1px solid ${DS.border}`,padding:'14px 16px',cursor:'pointer',display:'flex',gap:12,alignItems:'center'}}>
            <div style={{width:52,height:52,borderRadius:14,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{p.img}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600,color:DS.text,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
              <div style={{fontSize:12,color:DS.sub,marginBottom:6}}>{p.supplier} · {p.country}</div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap'}}><VBadge small/><Tag muted>МЗ {p.moq}</Tag></div>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:DS.lime,flexShrink:0,marginLeft:4}}>{p.price}</div>
          </div>
        )) : SUPPLIERS.map(s=>(
          <SupplierCard key={s.id} s={s} onPress={()=>onSupplier(s)}/>
        ))}
      </div>
      <TabBar tabs={[
        {id:'home',label:'Главная',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><polyline points="9,22 9,12 15,12 15,22" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
        {id:'catalog',label:'Каталог',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
        {id:'msgs',label:'Сообщения',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
        {id:'deals',label:'Сделки',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><rect x="9" y="3" width="6" height="4" rx="2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
        {id:'profile',label:'Профиль',icon:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={a?DS.lime:DS.muted} strokeWidth="1.8"/></svg>},
      ]} active='catalog' onTab={onTab}/>
    </div>
  );
}
window.CatalogScreen = CatalogScreen;

// ── 07 SEARCH RESULTS ─────────────────────────────────────
function SearchResultsScreen({query, onBack, onProduct, onSupplier}) {
  const [view, setView] = React.useState('suppliers');
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <BackBtn onPress={onBack}/>
        <div style={{flex:1,height:44,borderRadius:14,background:DS.s2,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',gap:10,padding:'0 14px'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={DS.muted} strokeWidth="1.8"/><path d="M21 21l-4.35-4.35" stroke={DS.muted} strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{fontSize:14,color:DS.sub}}>{query||'Сталь Китай'}</span>
        </div>
        <div style={{fontSize:12,color:DS.sub,background:DS.s2,border:`1px solid ${DS.border}`,borderRadius:10,padding:'6px 10px',whiteSpace:'nowrap',cursor:'pointer'}}>Фильтры</div>
      </div>
      <div style={{padding:'8px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div style={{fontSize:12,color:DS.muted}}>Найдено: {SUPPLIERS.length + PRODUCTS.length} результатов</div>
        <div style={{fontSize:12,color:DS.sub,cursor:'pointer'}}>Сортировка</div>
      </div>
      <div style={{padding:'0 20px 10px',flexShrink:0}}>
        <div style={{display:'flex',background:DS.s2,borderRadius:12,padding:4}}>
          {[['suppliers','Поставщики'],['products','Товары']].map(([id,lb])=>(
            <div key={id} onClick={()=>setView(id)} style={{flex:1,height:36,borderRadius:9,background:view===id?DS.s3:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,fontWeight:view===id?600:400,color:view===id?DS.text:DS.sub}}>{lb}</div>
          ))}
        </div>
      </div>
      {/* AI strip */}
      <div style={{margin:'0 20px 10px',background:DS.limeDim,border:`1px solid ${DS.limeDim2}`,borderRadius:12,padding:'9px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',flexShrink:0}}>
        <LimeOrb size={24}/>
        <div style={{flex:1,fontSize:12,color:DS.lime,fontWeight:600}}>Уточнить параметры через AI</div>
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={DS.lime} strokeWidth="1.6" strokeLinecap="round"/></svg>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'0 20px 20px',display:'flex',flexDirection:'column',gap:10}}>
        {view==='suppliers'
          ? SUPPLIERS.map(s=><SupplierCard key={s.id} s={s} onPress={()=>onSupplier(s)}/>)
          : PRODUCTS.map(p=>(
            <div key={p.id} onClick={()=>onProduct(p)} style={{borderRadius:16,background:DS.s1,border:`1px solid ${DS.border}`,padding:'14px 16px',cursor:'pointer',display:'flex',gap:12,alignItems:'center'}}>
              <div style={{width:52,height:52,borderRadius:14,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{p.img}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:DS.text,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                <div style={{fontSize:12,color:DS.sub,marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.supplier}</div>
                <div style={{display:'flex',gap:7,flexWrap:'wrap'}}><VBadge small/><Tag muted>МЗ {p.moq}</Tag></div>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:DS.lime,flexShrink:0,marginLeft:4}}>{p.price}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
window.SearchResultsScreen = SearchResultsScreen;

// ── 08 PRODUCT DETAIL ─────────────────────────────────────
function ProductDetailScreen({product, onBack, onSupplier, onEstimate, onAI, onDeal}) {
  const p = product || PRODUCTS[0];
  const specs = [['Материал','Нержавеющая сталь 316L'],['Стандарт','ASTM A240'],['Толщина','0.5–10 мм'],['Форма','Лист, рулон'],['Сертификат','ISO 9001, SGS']];
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <BackBtn onPress={onBack}/>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:DS.text,letterSpacing:-.3}}>{p.name}</div>
        <div style={{width:36,height:36,borderRadius:12,background:DS.s1,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={DS.sub} strokeWidth="1.8"/></svg>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 20px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {/* image */}
        <div style={{height:160,borderRadius:20,background:DS.s1,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:72}}>{p.img}</div>
        {/* summary */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:18,padding:'16px'}}>
          <div style={{fontSize:18,fontWeight:700,color:DS.text,marginBottom:4}}>{p.name}</div>
          <div style={{fontSize:24,fontWeight:800,color:DS.lime,marginBottom:10}}>{p.price}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[['Мин. заказ',p.moq],['Страна',p.country],['Наличие','В наличии'],['Срок',`20–30 дн.`]].map(([k,v])=>(
              <div key={k} style={{background:DS.s2,borderRadius:12,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:DS.muted,marginBottom:3}}>{k}</div>
                <div style={{fontSize:13,fontWeight:600,color:DS.text}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* supplier */}
        <div onClick={()=>onSupplier(SUPPLIERS.find(s=>s.name===p.supplier)||SUPPLIERS[0])} style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
          <div style={{width:40,height:40,borderRadius:12,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🏭</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:DS.text}}>{p.supplier}</div>
            <div style={{display:'flex',gap:6,marginTop:4}}><VBadge small/></div>
          </div>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={DS.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>
        {/* specs */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px'}}>
          <div style={{fontSize:14,fontWeight:700,color:DS.text,marginBottom:12}}>Характеристики</div>
          {specs.map(([k,v],i)=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:i<specs.length-1?`1px solid ${DS.border}`:'none'}}>
              <span style={{fontSize:13,color:DS.sub}}>{k}</span>
              <span style={{fontSize:13,color:DS.text,fontWeight:500,textAlign:'right',maxWidth:'55%'}}>{v}</span>
            </div>
          ))}
        </div>
        {/* AI actions */}
        <div style={{display:'flex',gap:9}}>
          {[['💰','Рассчитать стоимость',onEstimate],['📊','Сравнить',''],['🤖','Спросить AI',onAI]].map(([ic,lb,fn])=>(
            <div key={lb} onClick={fn} style={{flex:1,background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:14,padding:'11px 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer'}}>
              <span style={{fontSize:18}}>{ic}</span>
              <span style={{fontSize:10,color:DS.sub,textAlign:'center',fontWeight:500}}>{lb}</span>
            </div>
          ))}
        </div>
        {/* CTAs */}
        <div style={{display:'flex',gap:10}}>
          <LimeBtn dark style={{flex:1}} onPress={()=>onSupplier(SUPPLIERS[0])} icon="💬">Связаться</LimeBtn>
          <LimeBtn style={{flex:1}} onPress={onDeal} icon="🔒">Начать сделку</LimeBtn>
        </div>
      </div>
    </div>
  );
}
window.ProductDetailScreen = ProductDetailScreen;

// ── 09 SUPPLIER PROFILE ───────────────────────────────────
function SupplierProfileScreen({supplier, onBack, onChat, onAI, onDeal, onEstimate}) {
  const s = supplier || SUPPLIERS[0];
  const products = PRODUCTS.filter(p=>p.supplier===s.name).concat(PRODUCTS).slice(0,3);
  return (
    <div style={{height:'100%',background:DS.bg,display:'flex',flexDirection:'column',paddingTop:60,overflow:'hidden'}}>
      <div style={{padding:'10px 20px 0',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <BackBtn onPress={onBack}/>
        <div style={{flex:1}}/>
        <div style={{width:36,height:36,borderRadius:12,background:DS.s1,border:`1px solid ${DS.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1" fill={DS.sub}/><circle cx="12" cy="12" r="1" fill={DS.sub}/><circle cx="12" cy="19" r="1" fill={DS.sub}/></svg>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 20px 20px',display:'flex',flexDirection:'column',gap:14}}>
        {/* header */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:20,padding:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
            <div style={{width:60,height:60,borderRadius:18,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30}}>🏭</div>
            <div style={{flex:1}}>
              <div style={{fontSize:18,fontWeight:700,color:DS.text,marginBottom:4}}>{s.country} {s.name}</div>
              <VBadge/>
            </div>
          </div>
          <div style={{fontSize:13,color:DS.sub,lineHeight:1.6,marginBottom:12}}>Производитель промышленной продукции с 2008 года. Специализация: {s.cat}. Экспорт в 40+ стран.</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[[s.rating,'★ Рейтинг'],[s.orders,'Заказов'],[s.lead,'Срок']].map(([v,k])=>(
              <div key={k} style={{background:DS.s2,borderRadius:12,padding:'10px',textAlign:'center'}}>
                <div style={{fontSize:15,fontWeight:800,color:DS.lime}}>{v}</div>
                <div style={{fontSize:10,color:DS.muted,marginTop:3}}>{k}</div>
              </div>
            ))}
          </div>
        </div>
        {/* catalog preview */}
        <div>
          <SectionHeader title="Каталог"/>
          <div style={{display:'flex',gap:10,overflowX:'auto'}}>
            {products.map(p=>(
              <div key={p.id} style={{width:110,borderRadius:14,background:DS.s1,border:`1px solid ${DS.border}`,padding:'12px',flexShrink:0,cursor:'pointer'}}>
                <div style={{fontSize:32,textAlign:'center',marginBottom:8}}>{p.img}</div>
                <div style={{fontSize:11,color:DS.text,fontWeight:500,lineHeight:1.3,marginBottom:4}}>{p.name}</div>
                <div style={{fontSize:12,fontWeight:700,color:DS.lime}}>{p.price}</div>
              </div>
            ))}
          </div>
        </div>
        {/* reviews */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px'}}>
          <SectionHeader title="Отзывы" action="Все →"/>
          {[['Иван В.','Отличное качество, доставка вовремя. Рекомендую!','5.0'],['Мария К.','Хорошая коммуникация через переводчик AI.','4.8']].map(([name,text,rating])=>(
            <div key={name} style={{paddingBottom:12,borderBottom:`1px solid ${DS.border}`,marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:600,color:DS.text}}>{name}</div>
                <div style={{fontSize:12,color:DS.lime,fontWeight:700}}>★ {rating}</div>
              </div>
              <div style={{fontSize:12,color:DS.sub,lineHeight:1.5}}>{text}</div>
            </div>
          ))}
        </div>
        {/* location */}
        <div style={{background:DS.s1,border:`1px solid ${DS.border}`,borderRadius:16,padding:'14px 16px'}}>
          <div style={{fontSize:14,fontWeight:700,color:DS.text,marginBottom:10}}>Расположение</div>
          <div style={{height:80,borderRadius:12,background:DS.s2,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
            <div style={{fontSize:12,color:DS.muted}}>🗺 Карта</div>
          </div>
          <div style={{fontSize:13,color:DS.sub}}>{s.country} · {s.cat} Industrial Zone</div>
        </div>
        {/* actions */}
        <div style={{display:'flex',gap:10}}>
          <LimeBtn dark style={{flex:1}} onPress={onChat} icon="💬">Связаться</LimeBtn>
          <LimeBtn dark style={{width:50}} onPress={onAI} icon="🤖"/>
          <LimeBtn style={{flex:1}} onPress={onDeal} icon="🔒">Сделка</LimeBtn>
        </div>
      </div>
    </div>
  );
}
window.SupplierProfileScreen = SupplierProfileScreen;
