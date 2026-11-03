/* Follett Sales Command Center (GVP view) and Operations Control. Synthetic data only. */
(function(){
var D=CAMPUS_DATA,NF=D.NF,C=D.CAMPUSES,B=CampusBus;
var $=function(s,r){return (r||document).querySelector(s)};
var byId={};C.forEach(function(c){byId[c.id]=c});
var S={view:'home',campus:'nfs',ctab:'perf',otab:'feeds',region:null,market:null,sortK:'ready',sortD:1,proc:'acc',step:null,feed:null,scope:'all',agent:'all',drill:null,
  ask:null,loop:{},ex:{},plays:[],leads:{},motion:{},prep:'nfs',anim:false,bannerOn:false,flagged:[]};
var REF=new Date('2026-11-01');
function sum(a,f){return a.reduce(function(t,x){return t+f(x)},0)}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function money(k){return k>=1000?'$'+(k/1000).toFixed(2)+'M':'$'+(+k).toFixed(1).replace(/\.0$/,'')+'K'}
function dol(n){return '$'+Math.round(n).toLocaleString()}
function sgn(n,d){return (n>0?'+':n<0?'-':'')+Math.abs(n).toFixed(d==null?1:d)}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('on')},2600)}
function disp(c){return c.id==='nfs'?B.live.disputed():c.disp}
function guarK(c){return c.id==='nfs'?NF.contract.guarantee:Math.round(c.enroll*0.1048)}
function projK(c){return c.id==='nfs'?NF.contract.scenarios.base:Math.round(guarK(c)*c.cover/100)}
function monthsTo(c){var d=new Date(c.renew);return Math.round((d-REF)/2629800000)}
function gaps(c){var o=[];[['CFO',c.cfo],['Provost',c.prov],['Athletics',c.athl],['Auxiliary',c.aux]].forEach(function(x){if(x[1]>85)o.push(x)});return o}
function nonOk(c){var m=D.FEEDSTAT[c.id];return D.FEEDS.filter(function(f){return m[f.id]>0})}
function heat(v,lo,hi,goodHigh,txt){var t=Math.max(0,Math.min(1,(v-lo)/(hi-lo)));if(!goodHigh)t=1-t;
  var bg=t<.34?'rgba(122,31,43,.17)':t<.67?'rgba(227,167,47,.28)':'rgba(31,122,109,.17)';var c=t<.34?'#7a1f2b':t<.67?'#6b4d0a':'#12584d';
  return '<span class="heat" style="background:'+bg+';color:'+c+'">'+txt+'</span>'}
function lim(k){var v=C.map(function(c){return k==='disp'?disp(c):c[k]});return [Math.min.apply(null,v),Math.max.apply(null,v)]}
function filtered(){return C.filter(function(c){return(!S.region||c.region===S.region)&&(!S.market||c.market===S.market)})}
function storeNames(c){var n=['Main Store','Arena Store','Commons Store'];return n.slice(0,Math.max(1,Math.min(c.stores,3)))}

/* ---------- agents: items resolved per consumption unit are Assumed placeholders ---------- */
var UPI={inv:3.8,com:3.1,ret:2.6,aff:3.0,evt:3.4,ren:2.2,prv:1.8,agr:4.1,cmc:3.5,ful:3.3};
var UNIT_PRICE=D.VALUE.unitPrice;
function items(cid,aid){return Math.round(D.CONSUME[cid][aid]/UPI[aid])}
function cu(cid){return D.DERIVED.campusUnits(cid)}

/* ====================== shell ====================== */
function crumbs(){
  var h='<button data-a="home">East Group</button>';
  if(S.view==='campus'){var c=byId[S.campus];
    h+=' <span>/</span> <button data-a="reg:'+c.region+'">'+c.region+'</button> <span>/</span> <button data-a="mkt:'+c.market+'">'+c.market+'</button> <span>/</span> <b>'+c.n+' ('+storeNames(c)[0]+')</b>';}
  else{if(S.region)h+=' <span>/</span> '+(S.market?'<button data-a="reg:'+S.region+'">'+S.region+'</button>':'<b>'+S.region+'</b>');
    if(S.market)h+=' <span>/</span> <b>'+S.market+'</b>';
    if(S.view!=='home')h+=' <span>/</span> <b>'+{ops:'Operations Control',growth:'Access Growth Console',programs:'Campus programs',spr:'SPR'}[S.view]+'</b>'}
  $('#crumbs').innerHTML=h;
  var items=[['home','Sales Command Center'],['growth','Access Growth Console'],['programs','Campus programs'],['spr','SPR'],['ops','Operations Control']];
  $('#nav').innerHTML=items.map(function(i){var on=S.view===i[0]||(S.view==='campus'&&i[0]==='home');return '<button class="'+(on?'on':'')+'" data-a="view:'+i[0]+'">'+i[1]+'</button>'}).join('')+'<span class="sp"></span><button class="reset" data-a="reset">Reset demo state</button>';
}
function render(){var m=$('#main'),st=m.scrollTop;crumbs();
  var f={home:vHome,campus:vCampus,ops:vOps,growth:vGrowth,programs:vPrograms,spr:vSpr}[S.view];m.innerHTML=f();m.scrollTop=st;
  if(S.anim){S.anim=false;animateDays()}}
function invBanner(){
  var st=B.state(),is=B.live.invoiceStatus(),tk=(st.tasks||[]).filter(function(t){return t.status!=='done'});
  if(is==='disputed')return '<b>The CFO disputed the $2.44M fall Access invoice.</b> Reason: '+esc(st.invoiceDispute.reason||'on file')+'.'+(tk.length?' '+tk.length+' open task'+(tk.length>1?'s':'')+' for the partner team.':'');
  if(is==='reconciliation'||tk.length)return '<b>The CFO requested a reconciliation on the fall Access invoice.</b> '+tk.length+' open task'+(tk.length!==1?'s':'')+' for the partner team.';
  if(is==='reconciled')return '<b>Reconciliation received.</b> The invoice is ready for the CFO to approve.';
  return '';
}
function banner(){var b=$('#banner'),im=S.bannerOn?'':invBanner(),tk=(B.state().tasks||[]).filter(function(t){return t.status!=='done'});
  if(!S.bannerOn&&im){b.className='banner on warnb';b.innerHTML='<span class="dot"></span><span>'+im+'</span>'+(tk[0]?'<button class="btn sm" data-a="taskdone:'+tk[0].id+'">Mark task done</button>':'');return}
  b.className='banner'+(S.bannerOn?' on':'');
  b.innerHTML=S.bannerOn?'<span class="dot"></span><span><b>CFO approved the $2.44M fall Access invoice.</b> Northfield State days-to-pay fell from '+NF.daysToPay.before+' to '+NF.daysToPay.after+' and the cash panel updated.</span><button data-a="bn" aria-label="Dismiss">&times;</button>':''}
function animateDays(){var el=$('#dtp');if(!el)return;var a=NF.daysToPay.before,z=NF.daysToPay.after,t0=Date.now();
  var cash=$('#cashv');
  (function tick(){var p=Math.min(1,(Date.now()-t0)/1400);el.textContent=Math.round(a+(z-a)*p);if(cash)cash.textContent='$'+(9.86+2.44*p).toFixed(2)+'M';if(p<1)requestAnimationFrame(tick)})();
  var cp=$('#cashp');if(cp)cp.classList.add('flash')}

/* ====================== home ====================== */
function kpis(){
  var list=filtered(),risk=list.filter(function(c){return c.ready<60}),behind=list.filter(function(c){return c.cover<92});
  var cov=Math.round(sum(list,function(c){return c.cover})/list.length),dsp=sum(list,disp),gm=sum(list,function(c){return c.gm})/list.length,smg=Math.round(sum(list,function(c){return c.smg})/list.length);
  var gp=list.filter(function(c){return gaps(c).length});
  function k(l,v,s,cls){return '<div class="card kpi '+(cls||'')+'"><div class="l">'+l+'</div><div class="v">'+v+'</div><div class="s">'+s+'</div></div>'}
  return '<div class="grid g6">'+
   k('Renewals at risk',risk.length,risk.map(function(c){return c.n}).join(', ')||'None',risk.length?'bad':'good')+
   k('Guarantee coverage',cov+'%',behind.length+' campus'+(behind.length===1?'':'es')+' below 92%',behind.length?'':'good')+
   k('Disputed invoices',money(dsp),B.state().released?'Northfield State released $110.2K':'Across '+list.length+' campuses','')+
   k('GM vs last year',sgn(gm)+' pts','Average across '+list.length+' campuses',gm<0?'bad':'good')+
   k('SMG score',smg,'Customer experience, group average','')+
   k('Relationship gaps',gp.length,'Campuses with a contact over 85 days','bad')+'</div>';
}
function cashPanel(){var paid=B.state().accessPaid,dtp=B.live.daysToPay();
  return '<div class="card" id="cashp"><h3>Cash and days-to-pay</h3><div class="sub">Northfield State, Follett side</div>'+
   '<div class="row" style="margin-top:10px;align-items:flex-end;gap:20px"><div><div class="sub">Days-to-pay</div><div style="font-size:38px;font-weight:800;line-height:1" id="dtp">'+dtp+'</div></div>'+
   '<div><div class="sub">Group Access cash collected</div><div style="font-size:24px;font-weight:800" id="cashv">$'+(9.86+(paid?2.44:0)).toFixed(2)+'M</div></div></div>'+
   '<div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="tag '+(paid?'ok':'warn')+'">'+NF.accessInvoice.label+' $'+NF.accessInvoice.amountM+'M, due '+NF.accessInvoice.due+': '+(paid?'Paid':'Open')+'</span>'+
   (paid?'<span class="tag ok">Was '+NF.daysToPay.before+' days</span>':'<span class="sub">Waiting on the CFO approval</span>')+'</div></div>';
}
function askPanel(){
  var a=S.ask;
  return '<div class="card ask"><h3>Ask Sales Command Center</h3><div class="row" style="margin:8px 0"><input id="askin" placeholder="Ask about a campus, profitability, sales trends or fulfillment" autocomplete="off"><button class="btn pri" data-a="askgo">Ask</button></div>'+
   '<div class="chips">'+['Tell me about this school and how it\'s doing','Which campuses are least profitable?','Show sales trends','How is fulfillment?','Why is Northfield State\'s cash slow?'].map(function(q){return '<button class="chip" data-a="askq" data-q="'+esc(q).replace(/"/g,'&quot;')+'">'+esc(q)+'</button>'}).join('')+'</div>'+
   (a?'<div class="ans"><div class="q">'+esc(a.q)+'</div>'+a.html+'<div>'+a.src.map(function(s){return '<span class="src">'+s+'</span>'}).join('')+'</div></div>':'')+'</div>';
}
function prepPanel(){
  return '<div class="card"><h3>Prep time back</h3><div class="sub">One tap, built from the same data the CFO sees</div>'+
   '<div class="flt" style="margin:10px 0 8px"><select id="prepsel">'+C.map(function(c){return '<option value="'+c.id+'"'+(S.prep===c.id?' selected':'')+'>'+c.n+'</option>'}).join('')+'</select></div>'+
   '<div class="chips"><button class="btn" data-a="prep:brief">Campus brief</button><button class="btn" data-a="prep:spr">Strategic partnership review</button><button class="btn" data-a="prep:news">Monthly newsletter</button></div></div>';
}
function prio(i,title,body,why,cta){return '<div class="card prio"><span class="n">'+i+'</span><h3>'+title+'</h3>'+body+'<div class="why">'+why+'</div><div class="cta">'+cta+'</div></div>'}
function priorities(){
  var list=filtered(),P=[];
  var rs=list.slice().sort(function(a,b){return a.ready-b.ready}).slice(0,3);
  P.push(prio(1,'Renew and avoid RFP','<ul>'+rs.map(function(c){return '<li><span>'+c.n+'</span><span>'+c.renew+' &middot; '+heat(c.ready,45,90,true,c.ready)+'</span></li>'}).join('')+'</ul>',
    'Agent reason: '+list.filter(function(c){return c.ready<60}).length+' contracts score under 60 and end within 15 months. Invoicing and commission reporting are the most common reasons a campus goes to RFP (Assumed).',
    '<button class="btn pri sm" data-a="camp:'+rs[0].id+':contract">Open '+rs[0].n+'</button>'));
  var cv=list.slice().sort(function(a,b){return a.cover-b.cover}).slice(0,3);
  P.push(prio(2,'Guarantee and payment obligations','<ul>'+cv.map(function(c){return '<li><span>'+c.n+'</span><span style="display:flex;gap:8px;align-items:center"><span class="bar '+(c.cover<92?'bad':c.cover<100?'mid':'')+'" style="width:70px"><i style="width:'+Math.min(100,c.cover*.85)+'%"></i></span>'+c.cover+'%</span></li>'}).join('')+'</ul>',
    'Agent reason: '+list.filter(function(c){return c.cover<100}).length+' campuses are projected under 100% of guarantee. Lowest three shown.',
    '<button class="btn sm" data-a="camp:'+cv[0].id+':contract">Open '+cv[0].n+'</button>'));
  var regs=D.REGIONS.map(function(r){var cs=C.filter(function(c){return c.region===r});return [r,sum(cs,function(c){return c.gm})/cs.length]});
  P.push(prio(3,'Store and campus performance','<ul>'+regs.map(function(r){return '<li><span>'+r[0]+'</span><span>'+heat(r[1],-4,8,true,sgn(r[1])+' pts')+'</span></li>'}).join('')+'</ul>',
    'Agent reason: gross margin vs last year spans '+sgn(Math.min.apply(null,C.map(function(c){return c.gm})))+' to '+sgn(Math.max.apply(null,C.map(function(c){return c.gm})))+' pts across the group. Rolled up by region.',
    '<button class="btn sm" data-a="askq" data-q="Which campuses are least profitable?">Ask: least profitable</button>'));
  var ws=list.filter(function(c){return c.access<60}).length;
  P.push(prio(4,'Grow the footprint','<div class="big">'+Math.round(sum(list,function(c){return c.access})/list.length)+'%</div><div class="sub">Average Access coverage. '+ws+' campuses have under 60% coverage and are whitespace.</div>',
    'Agent reason: lead flow from market managers and department clusters point to '+ws+' near-term Access expansions.',
    '<button class="btn pri sm" data-a="view:growth">Open Access Growth Console</button>'));
  var gp=list.filter(function(c){return gaps(c).length});
  P.push(prio(5,'Relationship coverage','<ul>'+gp.map(function(c){var g=gaps(c)[0];return '<li><span>'+c.n+'</span><span class="tag err">'+g[0]+' '+g[1]+' days</span></li>'}).join('')+'</ul>',
    'Agent reason: no touch logged with these contacts in more than 85 days. Today there is no single line of sight (Assumed).',
    gp.length?'<button class="btn sm" data-a="camp:'+gp[0].id+':rel">Open '+gp[0].n+'</button>':''));
  P.push(prio(6,'Access program execution','<ul><li><span>Disputed invoices</span><span><b>'+money(sum(list,disp))+'</b></span></li><li><span>Add/drop mismatch cases</span><span><b>'+D.PROCESSES[1].cases[2]+'</b></span></li><li><span>Opt-out watch (above 9%)</span><span><b>'+list.filter(function(c){return c.optout>9}).length+' campuses</b></span></li><li><span>Feeds needing attention</span><span><b>'+sum(list,function(c){return nonOk(c).length})+'</b></span></li></ul>',
    'Agent reason: disputes and late Registrar files are what hold up cash. Open the stuck step to see the fix.',
    '<button class="btn pri sm" data-a="ops:processes">Processes</button><button class="btn sm" data-a="ops:feeds">Feeds</button><button class="btn sm" data-a="ops:agents">Agents</button>'));
  var sm=list.slice().sort(function(a,b){return a.smg-b.smg}).slice(0,3);
  P.push(prio(7,'Customer experience','<div class="big">'+Math.round(sum(list,function(c){return c.smg})/list.length)+'</div><ul>'+sm.map(function(c){return '<li><span>'+c.n+'</span><span>'+heat(c.smg,65,92,true,c.smg)+'</span></li>'}).join('')+'</ul>',
    'Agent reason: lowest three SMG scores shown with the group average above.',
    '<button class="btn sm" data-a="camp:'+sm[0].id+':exp">Open '+sm[0].n+'</button>'));
  P.push(prio(8,'Prep time back','<div class="sub">Research before a campus call takes 30 to 90 minutes today (Assumed). Build the brief, review and newsletter in one tap.</div>',
    'Agent reason: every prep output is templated from the data on this screen.',
    '<button class="btn pri sm" data-a="prep:brief">Campus brief</button><button class="btn sm" data-a="prep:spr">SPR</button><button class="btn sm" data-a="prep:news">Newsletter</button>'));
  var calN=Object.keys(B.state().calendar||{}).filter(function(k){return B.state().calendar[k]}).length;
  P.push(prio(9,'Campus programs','<div class="big">'+PROGRAMS.length+' programs</div><div class="sub">Pop-ups, collabs, trade-in, alumni shelf, store-in-store, ambassadors, wish list and delivery. '+(calN?calN+' spring calendar lines approved by the CFO.':'Results by campus vs last year.')+'</div>',
    'Agent reason: programs that beat last year at one campus can be run at a campus that has not tried them.',
    '<button class="btn pri sm" data-a="view:programs">Run this play at another campus</button>'));
  return '<div class="grid g3">'+P.join('')+'</div>';
}
var COLS=[['n','Campus'],['region','Region'],['renew','Renewal'],['ready','Readiness'],['cover','Guarantee'],['disp','Disputed'],['gm','GM vs LY'],['smg','SMG'],['access','Access'],['rel','Last touch'],['feeds','Feeds']];
function table(){
  var list=filtered().slice(),k=S.sortK,d=S.sortD;
  function val(c){return k==='disp'?disp(c):k==='rel'?Math.max(c.athl,c.cfo,c.prov,c.aux):k==='feeds'?nonOk(c).length:k==='renew'?new Date(c.renew).getTime():c[k]}
  list.sort(function(a,b){var x=val(a),y=val(b);return (typeof x==='string'?x.localeCompare(y):x-y)*d});
  var L={ready:lim('ready'),cover:lim('cover'),disp:lim('disp'),gm:lim('gm'),smg:lim('smg'),access:lim('access')};
  return '<div class="card" style="padding:0;overflow:auto;max-height:430px"><table><thead><tr>'+COLS.map(function(c){return '<th class="s" data-a="sort:'+c[0]+'">'+c[1]+(S.sortK===c[0]?(S.sortD>0?' &#9650;':' &#9660;'):'')+'</th>'}).join('')+'</tr></thead><tbody>'+
   list.map(function(c){var mx=Math.max(c.athl,c.cfo,c.prov,c.aux),no=nonOk(c).length;
    return '<tr class="click" data-a="camp:'+c.id+':perf"><td><b>'+c.n+'</b></td><td>'+c.region+'</td><td>'+c.renew+'</td><td>'+heat(c.ready,L.ready[0],L.ready[1],true,c.ready)+'</td><td>'+heat(c.cover,L.cover[0],L.cover[1],true,c.cover+'%')+'</td><td>'+heat(disp(c),L.disp[0],L.disp[1],false,money(disp(c)))+'</td><td>'+heat(c.gm,L.gm[0],L.gm[1],true,sgn(c.gm))+'</td><td>'+heat(c.smg,L.smg[0],L.smg[1],true,c.smg)+'</td><td>'+heat(c.access,L.access[0],L.access[1],true,c.access+'%')+'</td><td>'+heat(mx,20,105,false,mx+' d')+'</td><td>'+(no?'<span class="tag '+(D.FEEDS.some(function(f){return D.FEEDSTAT[c.id][f.id]===2})?'err':'warn')+'">'+no+' to check</span>':'<span class="tag ok">All ok</span>')+'</td></tr>'}).join('')+'</tbody></table></div>';
}
function vHome(){
  return '<div class="sub" style="margin-bottom:8px">Ellen Brooks, East Group. 4 regions, 40 campuses. The 12 below are a synthetic sample. Cards are ranked by an agent, with its reason shown.</div>'+
   kpis()+'<div class="grid" style="grid-template-columns:1fr 1.6fr 1fr;margin-top:14px">'+cashPanel()+askPanel()+prepPanel()+'</div>'+
   '<div class="sec"><h2>Your priorities, ranked</h2><span class="sub">Built from your nine priorities. Ranking reason on each card.</span></div>'+priorities()+
   '<div class="sec"><h2>Campus heat table</h2><span class="sub">Click a header to sort, click a row to open Campus 360.'+(S.region?' Filtered to '+S.region+(S.market?' / '+S.market:'')+'.':'')+'</span></div>'+table();
}

/* ====================== ask ====================== */
function findCampus(q){q=q.toLowerCase();for(var i=0;i<C.length;i++){var n=C[i].n.toLowerCase();if(q.indexOf(n)>-1||q.indexOf(n.split(' ')[0])>-1)return C[i]}return null}
function answer(q){var l=q.toLowerCase(),c=findCampus(q),r;
  if(/cash|slow|days.to.pay|paid/.test(l)){c=c||byId.nfs;var paid=B.state().accessPaid&&c.id==='nfs';
    r={html:'<p><b>'+c.n+'</b> '+(c.id==='nfs'?(paid?'cash is moving: days-to-pay is now '+B.live.daysToPay()+' after the CFO approved the $2.44M fall Access invoice.':'has days-to-pay of '+B.live.daysToPay()+'. The Access invoice cycle is stuck at the census step: the Registrar feed arrived four hours late and 104 students differ between enrollment and billing, which holds '+B.live.disputedCount()+' invoices ('+money(B.live.disputed())+').'):'shows '+money(disp(c))+' in disputed invoices and '+nonOk(c).length+' feeds to check.')+'</p><p><button class="btn pri sm" data-a="ops:processes">Open Operations Control: Processes</button></p>',src:['Access invoice cycle','Registrar feed','Operations Control']};}
  else if(/profit|margin|least/.test(l)){var s=C.slice().sort(function(a,b){return a.gm-b.gm});
    r={html:'<p>Lowest gross margin vs last year: '+s.slice(0,3).map(function(x){return '<b>'+x.n+'</b> ('+sgn(x.gm)+' pts)'}).join(', ')+'. Strongest: '+s.slice(-2).reverse().map(function(x){return '<b>'+x.n+'</b> ('+sgn(x.gm)+' pts)'}).join(', ')+'.</p><p>The same campuses carry the largest disputed balances, so cash timing and margin are linked.</p>',src:['Store P&L (synthetic)','Heat table']};}
  else if(/sales|trend/.test(l)){var cur=MONTHS.cur,ly=MONTHS.ly,t=sum(cur,function(x){return x}),tl=sum(ly,function(x){return x});
    r={html:'<p>Northfield State commission is <b>$'+(t/1000).toFixed(2)+'M</b> year to date vs $'+(tl/1000).toFixed(2)+'M last year ('+sgn((t/tl-1)*100)+'%). October is a partial month. Group average gross margin is '+sgn(sum(C,function(x){return x.gm})/C.length)+' pts vs last year.</p><p>Game-day pop-ups are the best performer: Homecoming at Northfield State was '+money(NF.campaigns.homecoming.salesK)+', up '+NF.campaigns.homecoming.vsLY+'%.</p>',src:['Northfield State ledger','Event POS']};}
  else if(/fulfil|deliver|dorm/.test(l)){var p=D.PROCESSES[4];
    r={html:'<p>Wish list to dorm delivery has <b>'+p.cases[0]+'</b> lists started, <b>'+p.cases[4]+'</b> delivered and <b>'+p.cases[3]+'</b> in transit. <b>'+p.sla[3]+'</b> packages are past SLA, concentrated at Lakeshore University residence halls (delivery feed shows a warning).</p><p><button class="btn pri sm" data-a="ops:processes:wsh">Open the delivery process</button></p>',src:['Wish list to dorm delivery','Delivery partner feed']};}
  else if(/tell me|how.*doing|about|school/.test(l)||c){c=c||byId[S.campus]||byId.nfs;var g=gaps(c);
    r={html:'<p><b>'+c.n+'</b> ('+c.region+', '+c.market+') has '+c.enroll.toLocaleString()+' students and a renewal on '+c.renew+' with readiness '+c.ready+'. Guarantee coverage is '+c.cover+'%, gross margin is '+sgn(c.gm)+' pts vs last year, SMG is '+c.smg+'. Disputed invoices: '+money(disp(c))+'. '+(g.length?'Relationship gap: '+g.map(function(x){return x[0]+' '+x[1]+' days'}).join(', ')+'.':'No relationship gaps.')+'</p><p><button class="btn sm" data-a="camp:'+c.id+':perf">Open Campus 360</button></p>',src:['Campus 360','Heat table']};}
  else r={html:'<p>I can answer questions about a campus ("tell me about Northfield State"), profitability, sales trends, fulfillment and cash. Try one of the suggestions above.</p>',src:['Sales Command Center']};
  r.q=q;return r}
function ask(q){if(!q)return;S.ask=answer(q);render();var m=$('#main');m.scrollTop=0}

/* ====================== local data ====================== */
var MONTHS={labels:['Jul','Aug','Sep','Oct*'],cur:[112,478,521,383],ly:[104,441,470,334]};
var PROGRAMS=[
  {id:'popup',n:'Game-day and event pop-ups',unit:'sales',res:{nfs:[186,22],mag:[141,9],lks:[122,14]}},
  {id:'collab',n:'Campus-exclusive collabs',unit:'sell-through %',res:{cdf:[78,31],pal:[64,18]}},
  {id:'trade',n:'Trade-in and resale',unit:'items',res:{grv:[420,12],cdf:[366,9]}},
  {id:'alumni',n:'Alumni and maker shelf',unit:'slots filled',res:{rdg:[6,0],grv:[4,0]}},
  {id:'sis',n:'Store-in-store',unit:'partner revenue $K',res:{bay:[18,0]}},
  {id:'amb',n:'Student ambassador program',unit:'revenue per $1',res:{nfs:[16,12],cdf:[11,8]}},
  {id:'wish',n:'Wish list and delivery attach',unit:'attach %',res:{nfs:[D.SERVICES.attachPct,14],pal:[41,17]}}
];
var LEADS=[
  {id:'l1',c:'nfs',d:'Economics',s:'Faculty asked for digital access in 3 sections',m:'Capital Market'},
  {id:'l2',c:'rdg',d:'Chemistry',s:'Peer departments moved to Access',m:'Capital Market'},
  {id:'l3',c:'hbr',d:'Business',s:'Adoption deadline is in 16 days',m:'Coastal Market'},
  {id:'l4',c:'mag',d:'Biology',s:'Price repricing triggered opt-out watch',m:'Gulf Market'},
  {id:'l5',c:'lks',d:'Nursing',s:'Dean requested a savings summary',m:'North Shore Market'},
  {id:'l6',c:'cyp',d:'Engineering',s:'Two peer campuses at full coverage',m:'Gulf Market'},
  {id:'l7',c:'irw',d:'Psychology',s:'Faculty champion identified',m:'Prairie Market'},
  {id:'l8',c:'cal',d:'Chemistry',s:'Provost review pending 21 days',m:'Piedmont Market'}
];
var VENUES=[['Golf pro shop',['live','mag','pal'],['pilot','nfs','cyp'],['white','hbr','lks','irw','cdf']],['Arena store',['live','nfs','lks','mag','hbr'],['pilot','cal','irw'],['white','grv','rdg','bay','pal','cyp','cdf']],['Rec center shop',['live','pal'],['pilot','cdf'],['white','nfs','hbr','grv','rdg','cal','bay','mag','cyp','lks','irw']]];
function nil(c){var i=C.indexOf(c);return i%4===0?'Eligible':i%4===1?'Needs university agreement':i%4===2?'Eligible':'Not started'}
function attach(c){return c.id==='nfs'?D.SERVICES.attachPct:Math.round(18+c.access*0.28+(C.indexOf(c)%3)*3)}

/* ====================== campus 360 ====================== */
var CT=[['perf','Performance'],['contract','Contract and commission'],['access','Access'],['rel','Relationships'],['exp','Experience']];
function vCampus(){
  var c=byId[S.campus];
  var h='<div class="row" style="align-items:center"><div style="flex:1"><h2 style="font-size:21px">'+c.n+'</h2><div class="sub">'+c.region+' / '+c.market+' &middot; '+c.stores+' store'+(c.stores>1?'s':'')+' &middot; '+c.enroll.toLocaleString()+' students &middot; renewal '+c.renew+'</div></div>'+
   '<button class="btn gold" data-a="cfo">View as the CFO sees it</button><button class="btn pri" data-a="ops:feeds:'+c.id+'">Operations Control</button></div>'+
   (c.id!=='nfs'?'<div class="assume" style="margin-top:10px">The CFO workspace in this demo is Northfield State. For this campus it opens the same layout with Northfield State data.</div>':'')+
   '<div class="tabs">'+CT.map(function(t){return '<button class="'+(S.ctab===t[0]?'on':'')+'" data-a="ctab:'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>';
  return h+({perf:cPerf,contract:cContract,access:cAccess,rel:cRel,exp:cExp}[S.ctab])(c);
}
function kv(a){return '<div class="kvs">'+a.map(function(x){return '<div><b>'+x[1]+'</b><span>'+x[0]+'</span></div>'}).join('')+'</div>'}
function cPerf(c){
  var scale=guarK(c)/NF.contract.guarantee,cur,ly;
  if(c.id==='nfs'){cur=MONTHS.cur;ly=MONTHS.ly}else{ly=MONTHS.ly.map(function(x){return Math.round(x*scale)});cur=ly.map(function(x){return Math.round(x*(1+c.gm/100))})}
  var mx=Math.max.apply(null,cur.concat(ly));
  var t=sum(cur,function(x){return x}),tl=sum(ly,function(x){return x});
  var sc=c.id==='nfs'?[['Soft retail',NF.contract.scenarios.soft],['Base case',NF.contract.scenarios.base],['Strong',NF.contract.scenarios.strong]]:[['Soft',Math.round(projK(c)*.93)],['Base',projK(c)],['Strong',Math.round(projK(c)*1.05)]];
  return '<div class="grid g2"><div class="card"><h3>Commission year to date vs last year</h3>'+kv([['Year to date',money(t)],['Last year',money(tl)],['Change',sgn((t/tl-1)*100)+'%']])+
   '<div class="spark" style="height:90px;margin-top:12px">'+cur.map(function(v,i){return '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;height:100%"><div style="display:flex;gap:3px;align-items:flex-end;height:100%;width:100%"><i style="background:#b9c0cd;height:'+ly[i]/mx*100+'%"></i><i style="height:'+v/mx*100+'%"></i></div><span class="sub">'+MONTHS.labels[i]+'</span></div>'}).join('')+'</div><div class="sub" style="margin-top:6px">Gray is last year. October is a partial month.</div></div>'+
   '<div class="card"><h3>Season outlook vs guarantee</h3>'+kv([['Guarantee',money(guarK(c))],['Projected',money(projK(c))],['Coverage',c.cover+'%']])+
   '<table style="margin-top:8px"><tbody>'+sc.map(function(s){return '<tr><td>'+s[0]+'</td><td class="num">'+money(s[1])+'</td><td>'+heat(s[1]/guarK(c)*100,85,125,true,Math.round(s[1]/guarK(c)*100)+'%')+'</td></tr>'}).join('')+'</tbody></table></div></div>'+
   '<div class="grid g3" style="margin-top:14px"><div class="card"><h3>Gross margin vs last year</h3><div style="font-size:26px;font-weight:800;margin:6px 0">'+sgn(c.gm)+' pts</div><div class="sub">Group average '+sgn(sum(C,function(x){return x.gm})/C.length)+' pts</div></div>'+
   '<div class="card"><h3>Fulfillment on time</h3><div style="font-size:26px;font-weight:800;margin:6px 0">'+Math.round(98-nonOk(c).length*1.4-(c.id==='lks'?3:0))+'%</div><div class="sub">Delivery feed: '+['ok','warning','error'][D.FEEDSTAT[c.id].dly]+'</div></div>'+
   '<div class="card"><h3>Stores</h3><div style="margin-top:6px">'+storeNames(c).map(function(n){return '<div class="pill" style="margin:0 6px 6px 0">'+n+'</div>'}).join('')+'</div></div></div>';
}
function cContract(c){
  var nf=c.id==='nfs',cv=B.live.commissionVariance(),mo=monthsTo(c);
  return '<div class="grid g2"><div class="card"><h3>Contract</h3><div class="kv" style="margin-top:8px"><b>Agreement ends</b><span>'+c.renew+' ('+mo+' months)</span><b>RFP window</b><span>'+(nf?NF.contract.rfpWindow:(mo<=14?'Opens within the next two terms':'Not yet open'))+' (Assumed)</span><b>Readiness score</b><span>'+heat(c.ready,45,90,true,c.ready+'/100')+'</span>'+(nf?'<b>Readiness drivers</b><span>Digital '+NF.renewal.digital+', NPS '+NF.renewal.nps+'</span><b>Board committee</b><span>'+NF.renewal.boardDate+'</span>':'')+'</div></div>'+
   '<div class="card"><h3>Guarantee and commission</h3><div class="kv" style="margin-top:8px"><b>Guarantee coverage</b><span>'+c.cover+'%</span><b>Projected vs guarantee</b><span>'+money(projK(c))+' vs '+money(guarK(c))+'</span>'+
   (nf?'<b>Commission variance</b><span>'+(cv?'<span class="tag err">'+money(cv)+' short on '+NF.commission.lines+' lines</span>':'<span class="tag ok">Credit requested, variance $0</span>')+'</span><b>Blended vs peers</b><span>'+sgn(NF.commission.blended-NF.commission.peers)+' pts above the peer median</span>':'<b>Commission variance</b><span>'+(c.cover<95?'<span class="tag warn">Open, reviewed with the campus CFO</span>':'<span class="tag ok">None open</span>')+'</span>')+'</div></div></div>'+
   (nf?'<div class="card" style="margin-top:14px"><h3>This is the CFO\'s view of the same number</h3><div class="sub">Sales Command Center reads the same commission variance as the CFO workspace. When the CFO requests the credit, this value changes.</div></div>':'');
}
function cAccess(c){
  var nf=c.id==='nfs',dc=D.NF.disputes.causes,live=B.state().released;
  var risk=nf?D.NF.gateway.length:Math.max(1,Math.round(c.optout/2.2));
  return '<div class="grid g3"><div class="card kpi"><div class="l">Access coverage</div><div class="v">'+c.access+'%</div><div class="s">'+(c.access<60?'Whitespace campus':'Established')+'</div></div><div class="card kpi"><div class="l">Opt-out rate</div><div class="v">'+c.optout+'%</div><div class="s">'+(c.optout>9?'On the watch list':'Within range')+'</div></div><div class="card kpi"><div class="l">Disputed invoices</div><div class="v">'+money(disp(c))+'</div><div class="s">'+(nf?B.live.disputedCount()+' invoices open':'Synthetic')+'</div></div></div>'+
   '<div class="grid g2" style="margin-top:14px">'+(nf?'<div class="card"><h3>Disputes by cause</h3><table style="margin-top:6px"><tbody>'+dc.map(function(x,i){return '<tr><td>'+x.n+'</td><td class="num">'+(i===0&&live?'<span class="tag ok">Released</span>':money(x.amt))+'</td><td class="sub">'+x.inv+' invoices</td></tr>'}).join('')+'</tbody></table><div class="sub" style="margin-top:6px">Total open: '+money(B.live.disputed())+'</div></div>'+
   '<div class="card"><h3>Gateway courses at risk (aggregate)</h3><table style="margin-top:6px"><tbody>'+D.NF.gateway.map(function(g){return '<tr><td>'+g.c+'</td><td class="num">'+g.w6+'% week-6 access</td><td>'+heat(D.DERIVED.gatewayDrop(g),0,14,false,'-'+D.DERIVED.gatewayDrop(g)+' pts')+'</td></tr>'}).join('')+'</tbody></table></div>':
   '<div class="card"><h3>Courses at risk</h3><div style="font-size:26px;font-weight:800;margin:6px 0">'+risk+'</div><div class="sub">Gateway courses below 70% week-6 access, aggregate only.</div></div><div class="card"><h3>Modeled student savings</h3><div style="font-size:26px;font-weight:800;margin:6px 0">'+money(D.NF.savings.termM*1000*c.enroll/24800)+'</div><div class="sub">This term, from Access vs market price (synthetic).</div></div>')+'</div>'+
   (nf?'<div class="card" style="margin-top:14px"><h3>Savings and opt-in</h3>'+kv([['Modeled student savings this term','$'+NF.savings.termM+'M'],['Business college opt-outs',NF.optOuts.from+'% to '+NF.optOuts.to+'%'],['Risk per term','$'+NF.optOuts.riskPerTermK+'K']])+'</div>':'');
}
function cRel(c){
  var rows=[['CFO',c.cfo,'Share the dispute cleanup result'],['Provost',c.prov,'Send the course-level early-warning report'],['Athletics',c.athl,'Review spring pop-ups and NIL items'],['Auxiliary director',c.aux,'Walk through the Campus programs results']];
  return '<div class="card"><h3>Last touch by contact</h3><table style="margin-top:8px"><thead><tr><th>Contact</th><th>Days since last touch</th><th>Status</th><th>Suggested next step</th><th></th></tr></thead><tbody>'+rows.map(function(r){var st=r[1]>85?'err':r[1]>45?'warn':'ok';return '<tr><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td><td><span class="tag '+st+'">'+(st==='err'?'Gap':st==='warn'?'Watch':'Healthy')+'</span></td><td>'+r[2]+'</td><td><button class="btn sm" data-a="toast:Outreach draft created for '+r[0]+' at '+c.n+'">Draft outreach</button></td></tr>'}).join('')+'</tbody></table></div>';
}
function cExp(c){
  var ranks=C.slice().sort(function(a,b){return b.smg-a.smg}),rk=ranks.indexOf(c)+1,nf=c.id==='nfs';
  return '<div class="grid g3"><div class="card kpi"><div class="l">SMG score</div><div class="v">'+c.smg+'</div><div class="s">Rank '+rk+' of '+C.length+', group average '+Math.round(sum(C,function(x){return x.smg})/C.length)+'</div></div>'+
   '<div class="card kpi"><div class="l">Event reach</div><div class="v">'+(nf?NF.arena.firstTimeFans:Math.round(c.enroll*0.0086))+'</div><div class="s">First-time fans at the latest game (aggregate)</div></div>'+
   '<div class="card kpi"><div class="l">Pop-up ROI vs last year</div><div class="v">'+(nf?'+'+NF.campaigns.homecoming.vsLY+'%':sgn(c.gm*1.8,0)+'%')+'</div><div class="s">'+(nf?'Homecoming pop-up, '+money(NF.campaigns.homecoming.salesK):'Latest pop-up (synthetic)')+'</div></div></div>'+
   '<div class="grid g2" style="margin-top:14px"><div class="card"><h3>Store rankings</h3><table style="margin-top:6px"><tbody>'+storeNames(c).map(function(n,i){return '<tr><td>'+n+'</td><td class="num">'+heat(c.smg-i*2+((C.indexOf(c)+i)%3),60,95,true,c.smg-i*2+((C.indexOf(c)+i)%3))+'</td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="card"><h3>Community adoption</h3><div class="sub">Opt-in community channels as a consumption driver.</div><div style="font-size:26px;font-weight:800;margin:6px 0">'+Math.round(18+c.access*0.3)+'%</div><div class="sub">of enrolled students in at least one channel (synthetic)</div></div></div>';
}

/* ====================== operations control ====================== */
function vOps(){
  var T=[['feeds','Feeds'],['processes','Processes'],['agents','Agents and consumption']];
  var sc='<div class="flt"><span class="sub">Scope</span><select id="scope"><option value="all">All campuses</option>'+C.map(function(c){return '<option value="'+c.id+'"'+(S.scope===c.id?' selected':'')+'>'+c.n+'</option>'}).join('')+'</select></div>';
  return '<div class="row" style="align-items:center"><h2 style="font-size:20px;flex:1">Operations Control</h2>'+sc+'</div><div class="tabs">'+T.map(function(t){return '<button class="'+(S.otab===t[0]?'on':'')+'" data-a="otab:'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+({feeds:oFeeds,processes:oProc,agents:oAgents}[S.otab])();
}
function scoped(){return S.scope==='all'?C:[byId[S.scope]]}
var SHORT={reg:'Registrar',aid:'Aid',pos:'POS',cat:'Catalog',lms:'LMS',pub:'Publisher',smg:'SMG',pbi:'Power BI',dly:'Delivery',trd:'Trade-in',wsh:'Wish list',loy:'Loyalty',enr:'Consent',ais:'AI traffic'};
function oFeeds(){
  var cs=scoped();
  var t='<div class="card" style="padding:0;overflow:auto"><table><thead><tr><th>Campus</th>'+D.FEEDS.map(function(f){return '<th style="text-align:center;font-size:10px;white-space:normal;line-height:1.15">'+SHORT[f.id]+(f.isNew?'<br><span class="tag new" style="font-size:9px;padding:0 5px">new</span>':'')+'</th>'}).join('')+'<th>To check</th></tr></thead><tbody>'+
   cs.map(function(c){return '<tr><td><b>'+c.n+'</b></td>'+D.FEEDS.map(function(f){var s=D.FEEDSTAT[c.id][f.id];return '<td style="text-align:center"><button class="fd'+(S.feed&&S.feed[0]===c.id&&S.feed[1]===f.id?' sel':'')+'" data-a="feed:'+c.id+':'+f.id+'" title="'+f.n+'"><span class="dot '+['','warn','err'][s]+'"></span></button></td>'}).join('')+'<td>'+nonOk(c).length+'</td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="sub" style="margin:8px 2px"><span class="dot"></span> Fresh &nbsp; <span class="dot warn"></span> Late or off volume &nbsp; <span class="dot err"></span> Missing or failing &nbsp; Click any dot for the feed detail and the Watch, Compare, Flag, Learn loop.</div>';
  return t+(S.feed?feedDetail():'');
}
function feedDetail(){
  var c=byId[S.feed[0]],f=D.FEEDS.filter(function(x){return x.id===S.feed[1]})[0],s=D.FEEDSTAT[c.id][f.id],key=c.id+f.id,lp=S.loop[key]||{step:0,msgs:[]};
  var fresh=s===0?'Fresh, 12 min ago':s===1?(c.id==='nfs'&&f.id==='reg'?'4 hours late':'3 h 40 min late'):'26 hours late';
  var vol=s===0?'99% of expected':s===1?'82% of expected':'0% of expected';
  var drift=s===0?'None':s===1?(f.id==='reg'?'None':'1 field renamed'):'2 fields changed';
  var inc=s===0?'None in 30 days':s===1?'Late delivery, today':'Missing file, 26 hours ago';
  var names=['Watch','Compare','Flag','Learn'];
  var msg=['Monitoring '+f.n+' at '+c.n+'. Alert if freshness slips past 2 hours.','Compared with the prior 14 days: median arrival '+(s===0?'on time':'about 3 hours earlier than today')+', volume '+(s===0?'within 2%':'down 17%')+'.','Flagged to '+f.owner+'. An exception was added to the Processes queue.','Rule learned: for '+f.n+' at campuses like '+c.n+', hold downstream steps until the file lands, then re-run matching automatically.'];
  return '<div class="panel" style="margin-top:6px"><div class="row" style="align-items:center"><h3 style="flex:1;font-size:15px">'+f.n+' at '+c.n+'</h3><span class="tag '+['ok','warn','err'][s]+'">'+['Healthy','Needs a look','Needs action'][s]+'</span></div>'+
   '<div class="kv" style="margin-top:8px"><b>Arrival</b><span>'+f.how+'</span><b>Freshness</b><span>'+fresh+'</span><b>Volume vs expected</b><span>'+vol+'</span><b>Schema drift</b><span>'+drift+'</span><b>Owner</b><span>'+f.owner+'</span><b>Last incident</b><span>'+inc+'</span></div>'+
   '<div class="loop">'+names.map(function(n,i){return '<button class="'+(i<lp.step?'done':i===lp.step?'next':'')+'" data-a="loop:'+key+':'+i+'">'+(i+1)+'. '+n+'</button>'}).join('')+'</div>'+
   lp.msgs.map(function(m){return '<div class="loopmsg">'+m+'</div>'}).join('')+(lp.step===0?'<div class="sub">Start with Watch.</div>':'')+'</div>';
}
function oProc(){
  var p=D.PROCESSES.filter(function(x){return x.id===S.proc})[0],rel=B.state().released&&p.id==='acc';
  var h='<div class="chips" style="margin-bottom:12px">'+D.PROCESSES.map(function(x){return '<button class="chip'+(x.id===S.proc?'" style="border-color:#7a1f2b;color:#7a1f2b;font-weight:700':'')+'" data-a="proc:'+x.id+'">'+x.n+'</button>'}).join('')+'</div>';
  var cases=p.cases.slice(),sla=p.sla.slice();if(rel){sla[2]=Math.max(0,sla[2]-1);cases[4]=Math.max(0,cases[4]-7);cases[2]=cases[2]-7}
  h+='<div class="card"><h3>'+p.n+'</h3>'+(p.note?'<div class="sub" style="margin:4px 0 10px">'+p.note+'</div>':'')+
   '<div class="pm">'+p.steps.map(function(st,i){var sb=sla[i],isStuck=i===p.stuck&&!(rel&&sla[i]===0);
    return '<button class="step'+(isStuck?' stuck':'')+(S.step===i?' sel':'')+'" data-a="step:'+i+'">'+(sb?'<span class="br tag err">'+sb+' SLA</span>':'')+'<div class="nm">'+st+'</div><div class="cs">'+cases[i].toLocaleString()+'</div><div class="dw">'+p.dwellDays[i]+' days dwell</div></button>'}).join('')+'</div>'+
   '<div class="sub" style="margin-top:6px">Cases in flight at each step. Click the highlighted step, or any step with an SLA breach, to open the exception queue.</div></div>';
  if(S.step!==null)h+=exQueue(p,S.step);
  return h;
}
function exQueue(p,i){
  var exs=D.EXCEPTIONS.filter(function(e){return e.proc===p.id});
  var h='<div class="panel" style="margin-top:12px"><h3>Exception queue: '+p.steps[i]+'</h3>';
  if(i!==p.stuck||!exs.length)return h+'<div class="sub" style="margin-top:6px">No open exceptions at this step. '+(p.sla[i]?p.sla[i]+' SLA breaches are covered by an auto-resolve rule.':'Everything here is within SLA.')+'</div></div>';
  return h+exs.map(function(e){var c=byId[e.campus],done=S.ex[e.id]||(e.id==='ex1'&&B.state().released);
    return '<div class="ex'+(done?' done':'')+'"><div class="row" style="align-items:center"><b style="flex:1">'+c.n+'</b><span class="tag '+(done?'ok':'err')+'">'+(done?'Resolved':'Open')+'</span></div><div class="vs"><div><b>Source A</b><br>'+e.a+'</div><div><b>Source B</b><br>'+e.b+'</div></div><div class="sub">'+e.evidence+'</div>'+
     '<div style="margin-top:6px"><b>Proposed fix:</b> '+e.fix+' <span class="sub">(agent: '+e.owner+')</span></div>'+
     (done?'<div class="rule">Rule learned: '+e.learn+'</div>':'<div style="margin-top:8px;display:flex;gap:8px"><button class="btn pri sm" data-a="ex:'+e.id+':approve">Approve</button><button class="btn sm" data-a="ex:'+e.id+':auto">Auto-resolve from now on</button></div>')+'</div>'}).join('')+'</div>';
}
function agentCell(cid,aid){var u=D.CONSUME[cid][aid],b=D.AGENTS.filter(function(a){return a.id===aid})[0].budget;return heat(u/b*100,35,100,false,u)}
function oAgents(){
  var cs=scoped(),ag=D.AGENTS.filter(function(a){return S.agent==='all'||a.id===S.agent});
  var total=sum(cs,function(c){return sum(ag,function(a){return D.CONSUME[c.id][a.id]})});
  var h='<div class="flt"><span class="sub">Agent</span><select id="agentsel"><option value="all">All agents</option>'+D.AGENTS.map(function(a){return '<option value="'+a.id+'"'+(S.agent===a.id?' selected':'')+'>'+a.n+(a.isNew?' (new)':'')+'</option>'}).join('')+'</select><span class="sub">Click a campus row for what each agent did this month.</span></div>';
  h+='<div class="card" style="padding:0;overflow:auto"><table><thead><tr><th>Campus</th>'+ag.map(function(a){return '<th class="num" style="white-space:normal;font-size:10px;line-height:1.15">'+a.n+'</th>'}).join('')+'<th class="num">Units</th><th class="num">Items resolved</th><th class="num">Hours saved</th><th class="num">Cost per item</th></tr></thead><tbody>'+
   cs.map(function(c){var u=sum(ag,function(a){return D.CONSUME[c.id][a.id]}),it=sum(ag,function(a){return items(c.id,a.id)});
    return '<tr class="click'+(S.drill===c.id?' sel-row':'')+'" data-a="drill:'+c.id+'"><td><b>'+c.n+'</b></td>'+ag.map(function(a){return '<td class="num">'+agentCell(c.id,a.id)+'</td>'}).join('')+'<td class="num"><b>'+u.toLocaleString()+'</b></td><td class="num">'+it.toLocaleString()+'</td><td class="num">'+Math.round(it*D.VALUE.hoursPerItem).toLocaleString()+'</td><td class="num">$'+(u*UNIT_PRICE/it).toFixed(2)+'</td></tr>'}).join('')+
   '<tr><td><b>Total</b></td>'+ag.map(function(a){return '<td class="num"><b>'+sum(cs,function(c){return D.CONSUME[c.id][a.id]}).toLocaleString()+'</b></td>'}).join('')+'<td class="num"><b>'+total.toLocaleString()+'</b></td><td></td><td></td><td></td></tr></tbody></table></div>'+
   '<div class="sub" style="margin:8px 2px">Table total equals the sum of the agent log: '+total.toLocaleString()+' units'+(S.agent==='all'&&S.scope==='all'?' (matches '+D.DERIVED.totalUnits().toLocaleString()+' in the data module)':'')+'. Cell shading shows use against each agent\'s monthly budget (Assumed placeholder units). Items per unit, hours per item and the unit price are Assumed.</div>';
  if(S.drill&&byId[S.drill])h+=drill(byId[S.drill]);
  h+=commercial(cs)+commerceMonitor();
  return h;
}
function drill(c){
  return '<div class="panel" style="margin-top:12px"><h3>'+c.n+': what each agent did this month</h3><table style="margin-top:6px"><thead><tr><th>Agent</th><th>Charter</th><th class="num">Units</th><th class="num">Items resolved</th><th>Wrote back to</th></tr></thead><tbody>'+D.AGENTS.map(function(a){return '<tr><td><b>'+a.n+'</b>'+(a.isNew?' <span class="tag new">new</span>':'')+'</td><td style="white-space:normal;max-width:340px">'+a.charter+'</td><td class="num">'+D.CONSUME[c.id][a.id]+'</td><td class="num">'+items(c.id,a.id)+'</td><td>'+a.writes+'</td></tr>'}).join('')+'</tbody></table></div>';
}
function commercial(cs){
  var u=sum(cs,function(c){return cu(c.id)}),it=sum(cs,function(c){return sum(D.AGENTS,function(a){return items(c.id,a.id)})}),hrs=it*D.VALUE.hoursPerItem,valueK=it*0.55;
  var tier=sum(cs,function(c){return c.enroll<10000?4000:c.enroll<25000?9000:14000}),cons=u*UNIT_PRICE,out=valueK*1000*0.06+22*hrs;
  var fee={incl:0,tier:tier,cons:cons,out:out,spon:cons*0.6};
  var note={incl:'Folded into the Access price. Internal cost '+dol(cons),tier:'Flat tier by campus size',cons:u.toLocaleString()+' units x $'+UNIT_PRICE.toFixed(2),out:'6% of value released plus $22 per hour saved',spon:'University pays 60%, sponsors cover 40%'};
  return '<div class="sec"><h2>The same month under five commercial models</h2><span class="sub">'+(S.scope==='all'?'All 12 campuses':byId[S.scope].n)+'</span></div><div class="assume"><b>Assumed placeholders.</b> Prices, tiers, unit price, value per item and the sponsor split are illustrative and need validation before any commercial discussion.</div>'+
   '<div class="mm">'+D.VALUE.models.map(function(m){return '<div class="m"><b>'+m.n+'</b><div class="p">'+(fee[m.id]?dol(fee[m.id]):'$0')+'</div><small>'+note[m.id]+'</small></div>'}).join('')+'</div>'+
   '<div class="sub" style="margin-top:8px">Value delivered this month (Assumed): '+money(valueK)+' released or recovered, '+Math.round(hrs).toLocaleString()+' hours saved, '+it.toLocaleString()+' items resolved.</div>';
}
function commerceMonitor(){
  var s=[11200,12850,14100,15980,18420],mx=18420;
  return '<div class="sec"><h2>Agent Commerce monitor</h2><span class="sub">Inbound AI shopper traffic, verified-student pricing and price parity (synthetic)</span></div><div class="grid g3">'+
   '<div class="card"><h3>Inbound AI shopper sessions</h3><div style="font-size:26px;font-weight:800;margin:4px 0">18,420 <span class="tag ok" style="vertical-align:middle">+15% vs last week</span></div><div class="spark">'+s.map(function(v){return '<i style="height:'+v/mx*100+'%"></i>'}).join('')+'</div><div class="sub" style="margin-top:6px">Five most recent weeks, edge logs</div></div>'+
   '<div class="card"><h3>Verified-student pricing</h3><div style="font-size:26px;font-weight:800;margin:4px 0">92%</div><div class="sub">of agent-driven visits were shown the verified-student price. 8% were shown list price because verification was missing.</div></div>'+
   '<div class="card"><h3>Price parity</h3><div style="font-size:26px;font-weight:800;margin:4px 0">99.2%</div><div class="sub">1,240 titles checked against three other sellers. 10 titles sit above the lowest seller.</div><table style="margin-top:6px"><tbody><tr><td>Intro Econ (digital)</td><td class="num">+$3.10</td></tr><tr><td>General Chemistry (print)</td><td class="num">+$2.40</td></tr><tr><td>Calculus I (digital)</td><td class="num">+$1.75</td></tr></tbody></table></div></div>';
}

/* ====================== access growth console ====================== */
/* ====================== Access Growth Console: Northfield land-and-expand plan ====================== */
/* Synthetic. Names are fictional roles for the demo. Percentages are the share of course sections on Access (Assumed). */
var NG_GOALS=[['Affordability','Lower the cost of course materials for every student'],['Retention','Persistence to 87% by 2028'],['Career readiness','Experiential learning in every college'],['Fund student success','Revenue that returns to campus, including athletics']];
var NG_COLLEGES=[
  {id:'bus',n:'Business',students:4200,depts:[['Economics',78],['Accounting',62],['Finance',48],['Management',15],['Marketing',22]]},
  {id:'as',n:'Arts and Sciences',students:9100,depts:[['Biology',55],['Chemistry',44],['Mathematics',36],['Psychology',18],['English',0]]},
  {id:'hs',n:'Health Sciences',students:3300,depts:[['Nursing',70],['Public health',10]]},
  {id:'eng',n:'Engineering',students:4600,depts:[['Engineering core',24],['Computer science',12]]},
  {id:'edu',n:'Education',students:3600,depts:[['Elementary education',0],['Secondary education',8]]}];
var NG_PLAYS=[
 {id:'bus',t:'Business: from two departments to the whole college',move:'Department to college',target:'Business',
  why:'Economics and Accounting are already above 60%, and Finance is close. A repricing on three Business courses doubled opt-outs to 11.8%, so the college is also where the CFO feels the cost today.',
  people:[['Raymond Okafor','Dean of Business','Competitive programs and student cost','One college-wide price and one adoption rule, with peer Business schools as proof'],
          ['Victor Salazar','Economics chair, faculty champion','Day-one access for students','Share the department results with the other four chairs'],
          ['Dana Whitfield','CFO','Net tuition revenue and opt-out loss','About $21.6K a term of Access revenue is at risk until the pricing is fixed']],
  solution:['Total Access for Business, priced once for the college','Pricing and adoption review with the publisher before the Nov 14 spring deadline','Early-warning signals for gateway Business courses'],
  steps:[['Nov 3','Dean','One-pager and email','What peer Business schools save with one college rate'],['Nov 5','Chairs','Department meeting','Economics chair shares day-one access results'],
         ['Nov 7','Dean and chairs','Peer roundtable','Three peer Business deans, 45 minutes'],['Nov 10','CFO','Executive note','Opt-out revenue at risk and the pricing fix'],
         ['Nov 14','Faculty','Adoption reminder','Spring adoption deadline nudge to Finance, Management and Marketing']],
  next:[['Access sales director','Book the dean and chairs roundtable','Nov 5'],['Market manager, Business','Send adoption reminders to three departments','Nov 10'],['Program lead','Draft the college-wide price','Nov 12']],
  out:{students:1600,saveM:0.52,revM:0.2,ret:'Credited retention lift on gateway Business courses',goals:['Affordability','Retention']},when:'Decision by the Nov 14 adoption deadline, live for spring'},
 {id:'sci',t:'Sciences: Biology and Chemistry as one gateway cluster',move:'Department to cluster',target:'Arts and Sciences',
  why:'Week-6 access in CHEM 1101 and BIOL 1106 sits 8 to 13 points below last fall. These are the gateway courses where retention is won or lost.',
  people:[['Lena Marchetti','Dean of Arts and Sciences','Gateway course success','Link Access to early-warning signals for the five gateway courses'],
          ['Anita Rao','Chemistry chair','Course materials ready on day one','Show the week-6 gap and how Access closes it'],
          ['Helen Ostrander','Provost','Retention and academic outcomes','Matched-cohort evidence, aggregate only']],
  solution:['Access for the Biology and Chemistry gateway sections','Course-level engagement signals shared with the Provost, never student names','Tutoring booking in Wolfie for the same courses'],
  steps:[['Nov 4','Provost','Executive brief','Gateway course signals and the cohort evidence'],['Nov 6','Chairs','1:1 conversations','Walk through the week-6 data'],
         ['Nov 12','Dean','Working session','Agree the cluster and the spring sections'],['Nov 17','Faculty','Case study email','What changed in the first Econ sections']],
  next:[['Market manager, Arts and Sciences','Confirm spring adoptions for Biology and Chemistry','Nov 12'],['Access sales director','Brief the Provost on the gateway signals','Nov 6']],
  out:{students:1900,saveM:0.46,revM:0.17,ret:'Fewer gateway course drops, associated with day-one access',goals:['Retention','Affordability']},when:'Spring sections, results in the week-6 data'},
 {id:'hs',t:'Health Sciences: Nursing as the template for the college',move:'Pilot to college',target:'Health Sciences',
  why:'Nursing is at 70% and the dean already asked for a savings summary. The college has the strongest tie to career readiness.',
  people:[['Imani Cole','Dean of Health Sciences','Licensure pass rates and clinical placement','Pair Access with exam prep and experiential tracks'],
          ['Rosa Delgado','Nursing program director','Predictable costs per cohort','One cohort price, set once']],
  solution:['Cohort-priced Access for Nursing and Public health','Experiential learning bundle tied to clinical rotations'],
  steps:[['Nov 5','Dean','Savings summary','Cost per cohort and per student'],['Nov 11','Program directors','Working session','Cohort pricing and experiential bundle'],['Nov 19','Dean','Follow-up','Proposal and a start term']],
  next:[['Access sales director','Send the savings summary to the dean','Nov 5'],['Program lead','Draft the experiential bundle','Nov 18']],
  out:{students:900,saveM:0.31,revM:0.12,ret:'Cohort stability through a program',goals:['Career readiness','Affordability']},when:'Cohort pricing for the spring intake'},
 {id:'full',t:'Whole campus: Total Access for the Northfield renewal',move:'College to full Access',target:'Whole campus',
  why:'The operating agreement ends Aug 31, 2027 and the RFP window opens in January. Full Access is the cleanest way to lock the renewal and the retention story together.',
  people:[['Helen Ostrander','Provost','Retention and outcomes','Total Access ties to persistence and course-day access'],
          ['Dana Whitfield','CFO','Net tuition revenue, one rate, one census rule','Billing gets simpler and student savings are reported'],
          ['Renee Castillo','Registrar','Clean add/drop and census dates','One rule ends the invoice disputes']],
  solution:['Total Access, campus-wide, tied to the operating agreement','Savings and retention reporting each term','Wolfie assistant included for students'],
  steps:[['Dec 2','Provost and CFO','Executive briefing','Save students $1.6M a term and the outcome evidence'],['Jan 14','Provost','RFP window briefing','What full Access does for the renewal'],
         ['Feb 10','Board','Board finance committee','Business case and implementation plan'],['Apr 15','Contract','Signature target','Signed for an August launch']],
  next:[['Group VP','Agree the executive briefing date with the Provost','Nov 20'],['Access sales director','Draft the account plan','Nov 12'],['Total Access program lead','Scope implementation (90 to 180 days, assumed)','Dec 1']],
  out:{students:24800,saveM:1.61,revM:0.62,ret:'Persistence tracked against the matched cohort',goals:['Affordability','Retention','Fund student success']},when:'Signed by mid-April for an August 2027 launch (assumed)'}];
var NG_TEAM=[
 ['Group Vice President','Ellen Brooks','Executive sponsor','Provost and CFO relationships, renewal'],
 ['Access sales director, East','Marisol Vega','Net new Access programs','Leads the top-down account plan'],
 ['Total Access program lead','Teodoro Reyes','Post-sale management','Pricing, faculty education, reporting'],
 ['Campus store manager','Jordan Ellis','Day-to-day on campus','Adoption lists and faculty access'],
 ['Course materials market managers','One per college','Faculty relationships','Own the leads in their college'],
 ['Campaign marketing','B2B campaign owner','Account-based sequences','Runs the touches on each play'],
 ['Access Growth agent','Agent','Ranks plays, drafts plans','Queues campaigns. People approve every send.']];
var NG_CMM=[['Business','4','3 leads'],['Arts and Sciences','8','2 leads'],['Health Sciences','2','1 lead'],['Engineering','3','1 lead'],['Education','2','0 leads']];
function ngCov(c){return Math.round(c.depts.reduce(function(t,d){return t+d[1]},0)/c.depts.length)}
function ngReady(c){var n=c.depts.filter(function(d){return d[1]>=50}).length;return n/c.depts.length}
function ngStatus(c){var r=ngReady(c);return r>=0.4?['Within reach','ok']:r>0?['Building','blue']:['Seed','']}
function vNorthfield(){
  var allD=[];NG_COLLEGES.forEach(function(c){allD=allD.concat(c.depts)});
  var d50=allD.filter(function(d){return d[1]>=50}).length,reach=NG_COLLEGES.filter(function(c){return ngReady(c)>=0.4}).length,full=NG_COLLEGES.filter(function(c){return ngCov(c)>=75}).length;
  var ap=B.state().accessPlan,h='<div class="row" style="align-items:center"><h2 style="font-size:20px;flex:1">Access Growth Console</h2><span class="tag new">Access Growth agent</span></div>'+
   '<div class="sub">Northfield State: where Access is today, which departments can become whole colleges, and the plan to reach full Access. Each play names the team, the people, the campaign, the next steps and the outcome.</div>';
  h+='<div class="card" style="margin-top:12px"><div class="row" style="align-items:center;flex-wrap:wrap;gap:8px"><b>Campus goals this plan serves</b>'+NG_GOALS.map(function(g){return '<span class="chip" title="'+esc(g[1])+'">'+g[0]+': '+g[1]+'</span>'}).join('')+'</div></div>';
  /* the ladder */
  var rungs=[['Courses','38 courses live','Land with faculty champions'],['Departments',d50+' of '+allD.length+' above 50%','Scale inside the department'],['Colleges',full+' of 5 college-wide ('+reach+' within reach)','Convert departments to a college'],['Campus partial','412 of 1,180 sections (35%)','Add colleges one by one'],['Full Access','Target: Aug 2027','Total Access, tied to the renewal']];
  h+='<div class="card" style="margin-top:12px"><h3>The path from department to full Access</h3><div class="sub">Northfield is between the department and college rungs.</div><div class="ladder">'+rungs.map(function(r,i){return '<div class="rung '+(i<2?'done':i===2?'now':'')+'"><i>'+(i+1)+'</i><b>'+r[0]+'</b><span>'+r[1]+'</span><small>'+r[2]+'</small></div>'}).join('')+'</div></div>';
  h+='<div class="card" style="margin-top:12px;padding:0;overflow:auto"><table><thead><tr><th>College</th><th class="num">Students</th><th style="min-width:120px">Sections on Access</th><th>Departments</th><th>Status</th></tr></thead><tbody>'+NG_COLLEGES.map(function(c){var st=ngStatus(c),cv=ngCov(c);
    return '<tr><td><b>'+c.n+'</b></td><td class="num">'+c.students.toLocaleString()+'</td><td><div class="bar '+(cv<30?'bad':cv<60?'mid':'')+'"><i style="width:'+cv+'%"></i></div><span class="sub">'+cv+'% average</span></td><td style="white-space:normal">'+c.depts.map(function(d){var hu=Math.round(d[1]*1.3);return '<span class="dpt" style="background:hsl('+hu+',60%,90%);color:hsl('+hu+',60%,22%)">'+d[0]+' '+d[1]+'%</span>'}).join('')+'</td><td><span class="tag '+st[1]+'">'+st[0]+'</span></td></tr>'}).join('')+'</tbody></table></div>';
  /* the plays */
  h+='<div class="sec"><h2>Growth plays, ranked</h2><span class="sub">Ranked by the agent on student savings, retention fit and timing. Reason on each card.</span></div>';
  NG_PLAYS.forEach(function(p,i){var cq=S.motion['ngc:'+p.id],ct=S.motion['ngt:'+p.id],o=p.out;
    h+='<div class="card ngp" id="ng-'+p.id+'"><div class="ngh"><span class="n">'+(i+1)+'</span><div style="flex:1"><h3>'+p.t+'</h3><div class="sub"><span class="tag blue">'+p.move+'</span> Target: '+p.target+' &middot; Timing: '+p.when+'</div></div></div>'+
     '<div class="why" style="margin:8px 0">Agent reason: '+p.why+'</div>'+
     '<div class="grid g2" style="gap:14px"><div><h4>Key people and the message for each</h4><table class="ngt"><tbody>'+p.people.map(function(x){return '<tr><td><b>'+x[0]+'</b><br><span class="sub">'+x[1]+'</span></td><td><span class="sub">Cares about:</span> '+x[2]+'<br><span class="sub">Message:</span> '+x[3]+'</td></tr>'}).join('')+'</tbody></table>'+
       '<h4 style="margin-top:10px">What we bring</h4><ul class="ngl">'+p.solution.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ul></div>'+
     '<div><h4>Account-based campaign</h4><ol class="ngc">'+p.steps.map(function(s){return '<li><b>'+s[0]+'</b> &middot; '+s[1]+' &middot; '+s[2]+'<br><span class="sub">'+s[3]+'</span></li>'}).join('')+'</ol>'+
       '<h4 style="margin-top:10px">Next steps</h4><table class="ngt"><tbody>'+p.next.map(function(x){return '<tr><td>'+x[1]+'<br><span class="sub">'+x[0]+'</span></td><td class="num">'+(ct?'<span class="tag ok">In CRM</span>':x[2])+'</td></tr>'}).join('')+'</tbody></table></div></div>'+
     '<div class="kvs ngo" style="margin-top:12px"><div><b>'+o.students.toLocaleString()+'</b><span>Students in scope</span></div><div><b>$'+o.saveM.toFixed(2)+'M</b><span>Student savings per term (modeled)</span></div><div><b>$'+o.revM.toFixed(2)+'M</b><span>Follett revenue per term (assumed)</span></div><div style="min-width:220px"><b style="font-size:13px;font-weight:600">'+o.ret+'</b><span>Expected outcome, associated with Access, not proof of cause</span></div></div>'+
     '<div class="row" style="align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap"><span class="sub">Serves:</span>'+o.goals.map(function(g){return '<span class="tag new">'+g+'</span>'}).join('')+'<span style="flex:1"></span>'+
       (ct?'':'<button class="btn" data-a="ngt:'+p.id+'">Add next steps to CRM</button>')+(cq?'<span class="tag ok">Campaign queued: '+p.steps.length+' touches</span>':'<button class="btn pri" data-a="ngc:'+p.id+'">Queue the campaign</button>')+'</div></div>';});
  /* the team */
  h+='<div class="sec"><h2>The team working Northfield</h2><span class="sub">Team selling: one owner for each relationship and each rung</span></div>';
  h+='<div class="grid g2"><div class="card" style="padding:0;overflow:auto"><table><thead><tr><th>Role</th><th>Who</th><th>Owns</th></tr></thead><tbody>'+NG_TEAM.map(function(t){return '<tr><td><b>'+t[0]+'</b></td><td>'+t[1]+'</td><td style="white-space:normal">'+t[2]+'<br><span class="sub">'+t[3]+'</span></td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="card"><h3>Course materials market managers by college</h3><div class="sub">The people on campus faculty already call. They own the leads and the department-level nudges.</div><table style="margin-top:6px"><thead><tr><th>College</th><th class="num">Managers</th><th class="num">Open leads</th></tr></thead><tbody>'+NG_CMM.map(function(r){return '<tr><td>'+r[0]+'</td><td class="num">'+r[1]+'</td><td class="num">'+r[2]+'</td></tr>'}).join('')+'</tbody></table>'+
   '<div class="assume" style="margin-top:10px">Assumed sales rhythm: peak selling in September to October and February to March, with a signature by mid-April for an August launch and 90 to 180 days to implement.</div></div></div>';
  return h;
}
function vGrowth(){return vNorthfield()+vGrowthGroup()}
function vGrowthGroup(){
  var ap=B.state().accessPlan,h='<div class="sec"><h2>Across the East Group</h2><span class="sub">Leads from market managers, department clusters, campus rollups and automated plays. Two motions: bottoms-up student campaigns and top-down "save students $X" account plans.</span></div>';
  h+='<div class="grid g2" style="margin-top:12px"><div class="card"><h3>Lead feed</h3><div class="sub">From about 200 market managers who already talk to faculty (Assumed ratio)</div><table style="margin-top:6px"><tbody>'+LEADS.map(function(l){var c=byId[l.c],sent=S.leads[l.id];return '<tr><td><b>'+c.n+'</b><br><span class="sub">'+l.d+' &middot; '+l.s+'</span></td><td style="text-align:right">'+(sent?'<span class="tag ok">With Access team</span>':'<button class="btn sm" data-a="lead:'+l.id+'">Send to Access team</button>')+'</td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="card"><h3>FOMO clusters by department</h3><div class="sub">Departments where peers already moved. Aggregate only, never individuals.</div><table style="margin-top:6px"><thead><tr><th>Department</th><th>Campuses</th><th class="num">Peers on Access</th></tr></thead><tbody>'+[['Economics','Northfield State, Ridgeway State',D.ACCESSPLAN.clusters.length+4],['Chemistry','Ridgeway State, Calloway University',7],['Biology','Northfield State, Magnolia State',6],['Business','Harbor Point University, Northfield State',9],['Nursing','Lakeshore University',3]].map(function(r){return '<tr><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td><td class="num">'+r[2]+'</td></tr>'}).join('')+'</tbody></table></div></div>';
  h+='<div class="grid g2" style="margin-top:14px"><div class="card"><h3>Automated play: bottoms-up student campaign</h3><div class="sub">Peer signal ("most Econ 2010 sections already use Access"), never individuals.</div>'+
   (S.motion.up?'<div class="rule">Campaign queued at 4 campuses. Modeled reach: '+(D.NF.gatewayStudents).toLocaleString()+' students in gateway courses. Campaign queue updated.</div>':'<div style="margin-top:10px"><button class="btn pri" data-a="motion:up">Run the play</button></div>')+'</div>'+
   '<div class="card"><h3>Automated play: top-down account plan</h3><div class="sub">"Save students $X" proposal for the Provost and CFO.</div>'+
   '<div class="kvs" style="margin:8px 0"><div><b>$'+D.ACCESSPLAN.saveStudentsM+'M</b><span>Modeled student savings</span></div><div><b>$'+D.ACCESSPLAN.follettRevM+'M</b><span>Follett revenue</span></div></div>'+
   (ap?'<div class="rule">The CFO sent the Access expansion proposal to the Provost. It is now on the review calendar.</div>':S.motion.down?'<div class="rule">Account plan drafted for Northfield State and sent to the CRM lead queue.</div>':'<button class="btn pri" data-a="motion:down">Draft the account plan</button>')+'</div></div>';
  h+='<div class="card" style="margin-top:14px;padding:0;overflow:auto"><table><thead><tr><th>Campus rollup</th><th class="num">Access coverage</th><th>Whitespace</th><th>NIL eligibility</th><th class="num">Services attach</th></tr></thead><tbody>'+
   C.map(function(c){var ni=nil(c);return '<tr><td><b>'+c.n+'</b></td><td class="num">'+heat(c.access,35,95,true,c.access+'%')+'</td><td>'+(c.access>=90?'<span class="tag ok">Full coverage</span>':c.access>=60?'<span class="tag blue">Partial</span>':'<span class="tag warn">Whitespace</span>')+'</td><td><span class="tag '+(ni==='Eligible'?'ok':ni==='Not started'?'':'warn')+'">'+ni+'</span></td><td class="num">'+attach(c)+'%</td></tr>'}).join('')+'</tbody></table></div>';
  h+='<div class="sec"><h2>New venue types</h2><span class="sub">Where the same stack (merch, lease operation, e-commerce, transactions) can run beyond the bookstore</span></div><div class="card" style="padding:0;overflow:auto"><table><thead><tr><th>Venue</th><th>Live</th><th>Pilot</th><th>Whitespace</th></tr></thead><tbody>'+VENUES.map(function(v){return '<tr><td><b>'+v[0]+'</b></td>'+v.slice(1).map(function(g,i){return '<td style="white-space:normal">'+g.slice(1).map(function(id){return '<span class="tag '+(i===0?'ok':i===1?'blue':'')+'" style="margin:2px">'+byId[id].n+'</span>'}).join('')+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>';
  h+='<div class="sec"><h2>Services attach</h2><span class="sub">Dorm setup, delivery and a device each term as an add-on to Access</span></div><div class="card">'+kv([['Attach rate at Northfield State',D.SERVICES.attachPct+'%'],['Next invoice impact',money(D.SERVICES.invoiceImpactK)],['Per term add-on',D.SERVICES.perTermAdd],['First-year students',D.SERVICES.firstYear.toLocaleString()]])+(B.state().services?'<div class="rule">The CFO approved the services add-on. It shows on the next Access invoice preview.</div>':'')+'</div>';
  return h;
}

/* ====================== campus programs ====================== */
function vPrograms(){
  var calAp=B.state().calendar||{},ap=D.CALENDAR.filter(function(l){return calAp[l.id]});
  var h='<div class="row" style="align-items:center"><h2 style="font-size:20px;flex:1">Campus programs</h2><span class="tag new">Campus Commerce agent</span></div><div class="sub">Results by campus vs last year. Run a play that works at one campus at a campus that has not tried it.</div>';
  h+='<div class="card" style="margin-top:12px;padding:0;overflow:auto"><table><thead><tr><th>Program</th><th>Running at</th><th>Best result</th><th class="num">vs last year</th><th></th></tr></thead><tbody>'+PROGRAMS.map(function(p){
    var ids=Object.keys(p.res).concat(S.plays.filter(function(x){return x[0]===p.id}).map(function(x){return x[1]}));var best=Object.keys(p.res).sort(function(a,b){return p.res[b][0]-p.res[a][0]})[0];
    return '<tr><td><b>'+p.n+'</b></td><td style="white-space:normal">'+ids.map(function(id){return '<span class="tag '+(p.res[id]?'ok':'blue')+'" style="margin:2px">'+byId[id].n+(p.res[id]?'':' (queued)')+'</span>'}).join('')+'</td><td>'+byId[best].n+': '+p.res[best][0]+' '+p.unit+'</td><td class="num">'+(p.res[best][1]?'+'+p.res[best][1]+'%':'New')+'</td><td><button class="btn pri sm" data-a="play:'+p.id+'">Run this play at another campus</button></td></tr>'}).join('')+'</tbody></table></div>';
  h+='<div class="sec"><h2>Spring calendar from the CFO</h2><span class="sub">'+(ap.length?ap.length+' of '+D.CALENDAR.length+' lines approved':'Waiting on the CFO approval')+'</span></div><div class="card" style="padding:0;overflow:auto"><table><thead><tr><th>Line</th><th class="num">Revenue</th><th class="num">Commission to the university</th><th>Status</th></tr></thead><tbody>'+D.CALENDAR.map(function(l){return '<tr><td>'+l.n+'</td><td class="num">'+money(l.revK)+'</td><td class="num">'+money(l.commK)+'</td><td>'+(calAp[l.id]?'<span class="tag ok">Approved</span>':'<span class="tag">Pending</span>')+'</td></tr>'}).join('')+'</tbody></table></div>';
  return h;
}

/* ====================== prep generators ====================== */
function prepText(kind,c){
  var g=gaps(c),dc=c.id==='nfs'?B.live.disputed():c.disp,cv=B.live.commissionVariance();
  var base='Campus: '+c.n+' ('+c.region+', '+c.market+')\nStudents: '+c.enroll.toLocaleString()+' &middot; Stores: '+c.stores+'\n'.replace(' &middot; ',', ');
  var ln=function(a){return a.join('\n')};
  if(kind==='brief')return ln(['CAMPUS BRIEF: '+c.n,'Prepared for Ellen Brooks, East Group. Synthetic data.','','Where it stands',
    '- Students: '+c.enroll.toLocaleString()+' across '+c.stores+' store'+(c.stores>1?'s':''),'- Agreement ends '+c.renew+'. Readiness score '+c.ready+'/100.','- Guarantee coverage '+c.cover+'% ('+money(projK(c))+' projected vs '+money(guarK(c))+').','- Gross margin '+sgn(c.gm)+' pts vs last year. SMG '+c.smg+'.',
    '','Access','- Coverage '+c.access+'%. Opt-out rate '+c.optout+'%.','- Disputed invoices: '+money(dc)+(c.id==='nfs'?' ('+B.live.disputedCount()+' invoices). '+(cv?'Commission variance '+money(cv)+'.':'Commission credit requested.'):'.'),
    '','Relationships',g.length?'- Gaps: '+g.map(function(x){return x[0]+' '+x[1]+' days'}).join(', '):'- No gaps. Last touch with the CFO was '+c.cfo+' days ago.',
    '','Ask for the call','1. Confirm the next renewal milestone.','2. '+(dc>100?'Walk through the dispute cleanup plan.':'Share the savings and outcome results.'),'3. Agree one campus program for spring.']);
  if(kind==='spr')return ln(['STRATEGIC PARTNERSHIP REVIEW: '+c.n,'Draft for review. Synthetic data.','','1. Performance','Gross margin '+sgn(c.gm)+' pts vs last year, SMG '+c.smg+', guarantee coverage '+c.cover+'%.','',
    '2. Commission and guarantee','Projected '+money(projK(c))+' against a '+money(guarK(c))+' guarantee.'+(c.id==='nfs'?' '+(cv?'An open variance of '+money(cv)+' is with the CFO for a same-week credit.':'The commission credit has been requested.'):''),'',
    '3. Access','Coverage '+c.access+'%, opt-out rate '+c.optout+'%, disputed invoices '+money(dc)+'.','',
    '4. Programs','Pop-ups, collabs, trade-in and the alumni shelf are candidates for spring. See Campus programs for results at peer campuses.','',
    '5. Relationship plan',g.length?'Re-engage '+g.map(function(x){return x[0]}).join(' and ')+' within 14 days.':'Maintain the current touch cadence.','',
    '6. Asks','- Agree the spring campus commerce calendar.','- Confirm the next Registrar feed cadence.','- Schedule the renewal readiness review.']);
  return ln(['PARTNER NEWSLETTER: '+c.n,'Monthly update from Follett. Synthetic data.','','Highlights',
    '- '+(c.id==='nfs'?'Arena Store pop-up welcomed '+NF.arena.firstTimeFans+' first-time fans.':'Store traffic is '+sgn(c.gm*1.8,0)+'% vs last year on event days.'),'- Students are saving an estimated '+(c.id==='nfs'?'$'+NF.savings.termM+'M':money(c.enroll*0.065))+' this term with Access.',
    '- Customer experience score: '+c.smg+'.','','Coming up',(c.id==='nfs'?'- Parents Weekend, '+NF.campaigns.parents.date+'.\n- Board finance committee, '+NF.renewal.boardDate+'.\n- Adoption deadline, Nov 14.':'- Spring adoption deadline and registration windows.\n- Game-day pop-ups at home events.'),'','Thank you','To the faculty and staff who helped students find affordable course materials this term.']);
}
function openModal(t,b){$('#mt').textContent=t;$('#mb').textContent=b;$('#modal').classList.add('on')}

/* ====================== SPR: strategic partnership review ====================== */
function sprFresh(){return {mode:'prep',period:'ytd',cfg:SPRMODEL.defaultConfig(),tp:true,cust:false,filter:'all',by:{},snaps:[],ask:null}}
S.spr=sprFresh();S.ro=false;
(function(){var q=location.search,m=/[?&]spr=([a-z]+)/.exec(q),p=/[?&]period=(ytd|term|last)/.exec(q);
  if(m&&byId[m[1]]){S.view='spr';S.campus=m[1];S.prep=m[1];S.spr.mode='present';S.ro=true;document.documentElement.classList.add('ro');if(p)S.spr.period=p[1]}})();
function sprCtx(c){return {guar:guarK(c),proj:projK(c),disp:disp(c),stores:storeNames(c),today:'2026-11-01'}}
function sprEd(id){var b=S.spr.by;return b[id]||(b[id]={take:{},hl:null,pins:{},rm:{},opp:null,deck:{},notes:'',actions:null,comm:{}})}
function sprData(c){return SPRDATA.build(c,S.spr.period,sprCtx(c))}
function spA(E,d){return E.actions||(E.actions=d.actions.map(function(a){return {id:a.id,t:a.t,owner:a.owner,due:a.due,status:a.status}}))}
function spHl(E,d){if(!E.hl)E.hl=d.highlights.map(function(h){return h.id});return E.hl}
function sFmt(n,unit){return unit==='k'?money(n):n}
function sup(g){return '<span class="'+(g>=0?'up':'dn')+'">'+sgn(g)+'%</span>'}
function srcL(label,fresh){return '<span class="srcl">Source: '+label+'. Updated '+fresh+'.</span>'}
function kpiT(l,v,s,cls){return '<div class="card kpi '+(cls||'')+'"><div class="l">'+l+'</div><div class="v">'+v+'</div><div class="s">'+s+'</div></div>'}
function hb(rows,label){
  var mx=Math.max.apply(null,rows.map(function(r){return Math.max(r.cur,r.prev)}));
  return '<div role="img" aria-label="'+esc(label+': '+rows.map(function(r){return r.n+' '+money(r.cur)+', '+sgn(r.g)+'% versus last year'}).join('; '))+'">'+rows.map(function(r){
    return '<div class="hb"><span class="hl">'+esc(r.n)+'</span><div class="bar"><i style="width:'+Math.round(r.cur/mx*100)+'%"></i><u style="left:'+Math.round(r.prev/mx*100)+'%" title="Last year"></u></div><b>'+money(r.cur)+'</b>'+sup(r.g)+'</div>'}).join('')+'</div>'+
    '<table class="sr"><caption>'+esc(label)+'</caption><tr><th>Item</th><th>Now</th><th>Last year</th></tr>'+rows.map(function(r){return '<tr><td>'+esc(r.n)+'</td><td>'+money(r.cur)+'</td><td>'+money(r.prev)+'</td></tr>'}).join('')+'</table>';
}
function tk(E,key,text,ed){
  var v=E.take[key]!=null?E.take[key]:text;
  return ed?'<div class="tk"><label>Key takeaway (editable)</label><textarea rows="2" data-spr="take:'+key+'">'+esc(v)+'</textarea></div>':'<p class="tkp"><b>Key takeaway.</b> '+esc(v)+'</p>';
}
function tpBox(d,id,show){
  if(!show||!d.talking[id])return '';
  return '<div class="tp"><b>Talking points <span class="tag warn">Internal only</span></b><ul>'+d.talking[id].map(function(t){return '<li>'+esc(t[0])+' <span class="sub">Data: '+esc(t[1])+'</span></li>'}).join('')+'</ul></div>';
}

function sprSection(id,c,d,E,mode,live){
  var ed=live&&mode==='prep',tp=live&&mode==='prep'&&S.spr.tp,h='';
  if(id==='health'){
    var m=SPRMODEL.filterInternal([
      {h:kpiT('Renewal score',d.health.ready+'<span class="sub"> /100</span>','Readiness index',d.health.ready<65?'bad':'')},
      {h:kpiT('Contract end',d.health.end,monthsTo(c)+' months out')},
      {h:kpiT('Guarantee coverage',d.health.cover+'%',money(sprCtx(c).proj)+' projected',d.health.cover<100?'bad':'good')},
      {h:kpiT('Customer service (SMG)',d.health.smg,'Score out of 100')},
      {h:kpiT('Disputed invoices',money(d.health.disp),'Open now',d.health.disp>200?'bad':'')},
      {h:kpiT('Days since executive contact',d.health.contactDays,'Longest gap across four contacts',d.health.contactDays>85?'bad':''),internal:true}],mode);
    h='<div class="grid" style="grid-template-columns:repeat('+m.length+',1fr);gap:10px">'+m.map(function(x){return x.h}).join('')+'</div>'+srcL('contract record and invoice ledger','daily');
  }
  if(id==='highlights'){
    var order=spHl(E,d).filter(function(k){return !E.rm[k]}).sort(function(a,b){return (E.pins[b]?1:0)-(E.pins[a]?1:0)});
    var by={};d.highlights.forEach(function(x){by[x.id]=x});
    function list(kind,title){
      var ids=order.filter(function(k){return by[k].kind===kind});
      return '<div><h3>'+title+'</h3>'+(ids.length?'<ul class="hl-list">'+ids.map(function(k,i){var x=by[k];
        return '<li><div><b>'+(E.pins[k]?'Pinned: ':'')+esc(x.t)+'</b>'+(mode==='prep'?'<div class="why int">Why this: '+esc(x.why)+'</div>':'')+'</div>'+
          (ed?'<span class="ctl"><button class="btn sm" data-a="sprhl:'+k+':pin" aria-label="Pin">'+(E.pins[k]?'Unpin':'Pin')+'</button><button class="btn sm" data-a="sprhl:'+k+':up" aria-label="Move up">Up</button><button class="btn sm" data-a="sprhl:'+k+':down" aria-label="Move down">Down</button><button class="btn sm" data-a="sprhl:'+k+':rm" aria-label="Remove">Remove</button></span>':'')+'</li>'}).join('')+'</ul>':'<div class="sub">Nothing here.</div>')+'</div>';
    }
    h='<div class="grid g2">'+list('good','What went well since the last review')+list('work','Areas being worked on')+'</div>'+
      (ed&&Object.keys(E.rm).length?'<button class="btn sm" data-a="sprhl:all:restore">Restore removed items</button>':'')+srcL('agent summary of POS, SMG and invoice data','daily');
  }
  if(id==='community'){
    h='<div class="grid g3">'+d.community.map(function(x,i){var v=E.comm[i]!=null?E.comm[i]:x.v;
      return '<div class="card kpi"><div class="l">'+esc(x.t)+'</div>'+(ed?'<input class="inl" data-spr="comm:'+i+'" value="'+esc(v)+'" aria-label="'+esc(x.t)+'">':'<div class="v">'+esc(v)+'</div>')+'<div class="s">'+esc(x.n)+'</div></div>'}).join('')+'</div>'+srcL('campus partnership records (placeholder)','as entered');
  }
  if(id==='financial'){
    var ch=d.sales.channels,sum=function(a,k){return a.reduce(function(t,x){return t+x[k]},0)},dl=SPRMODEL.delta(sum(ch,'cur'),sum(ch,'prev'));
    var depts=d.sales.depts.filter(function(x){return S.spr.filter==='all'||x.line===S.spr.filter});
    var dd=SPRMODEL.delta(sum(depts,'cur'),sum(depts,'prev'));
    h='<div class="card"><h3>Sales vs last year by channel</h3>'+hb(ch,'Sales by channel')+tk(E,'ch',SPRMODEL.takeaway('Total sales',dl,'channel'),ed)+'</div>';
    if(SPRMODEL.showByStore(c)){var sd=SPRMODEL.delta(sum(d.sales.stores,'cur'),sum(d.sales.stores,'prev'));
      h+='<div class="card" style="margin-top:12px"><h3>Sales vs last year by store</h3>'+hb(d.sales.stores,'Sales by store')+tk(E,'st',SPRMODEL.takeaway('Store sales',sd,'stores'),ed)+'</div>'}
    h+='<div class="card" style="margin-top:12px"><div class="row" style="align-items:center"><h3 style="flex:1">Sales vs last year by department</h3>'+(live?'<div class="seg2">'+[['all','All'],['hard','Hardlines'],['soft','Softlines']].map(function(f){return '<button class="'+(S.spr.filter===f[0]?'on':'')+'" data-a="sprfilter:'+f[0]+'">'+f[1]+'</button>'}).join('')+'</div>':'')+'</div>'+
      hb(depts,'Sales by department')+tk(E,'dp'+S.spr.filter,SPRMODEL.takeaway('Department sales',dd,'dept'),ed)+'</div>'+srcL('POS and e-commerce ledgers','daily');
  }
  if(id==='service'){
    var mx=Math.max.apply(null,d.service.trend),mn=Math.min.apply(null,d.service.trend);
    h='<div class="grid g2"><div class="card"><h3>Customer service score (SMG)</h3><div class="row" style="align-items:flex-end;gap:18px"><div class="big" style="font-size:32px;font-weight:800">'+d.health.smg+'</div>'+
      '<div class="spark" role="img" aria-label="SMG score, last six months: '+d.service.trend.join(', ')+'" style="flex:1">'+d.service.trend.map(function(v){return '<i style="height:'+Math.round(14+(v-mn)/(Math.max(1,mx-mn))*40)+'px" title="'+v+'"></i>'}).join('')+'</div></div><div class="sub">Last six months</div></div>'+
      '<div class="card"><h3>Comment cards</h3><div class="sub">Names and contact details are removed before display.</div><ul class="cm">'+d.service.comments.map(function(t){return '<li>'+esc(SPRMODEL.redact(t))+'</li>'}).join('')+'</ul></div></div>'+srcL('customer comment cards and SMG survey','weekly');
  }
  if(id==='materials'){
    var mc=d.materials.cur,mu=d.materials.up,gaps=SPRMODEL.readinessGaps(d.materials.courses,'2026-11-01');
    h='<h3>Current term</h3><div class="grid g6" style="grid-template-columns:repeat(5,1fr);gap:10px">'+
      kpiT('Titles adopted',mc.titles,sup(SPRMODEL.delta(mc.titles,mc.titlesLY).pct)+' vs last year')+kpiT('Adoption',mc.adoptPct+'%','Of courses with a list')+
      kpiT('Available at start',mc.availStart+'%','Day-one availability')+kpiT('Units sold',mc.units.toLocaleString(),sup(SPRMODEL.delta(mc.units,mc.unitsLY).pct)+' vs last year')+kpiT('Market share',mc.share+'%','Of enrolled students')+'</div>'+
      '<h3 style="margin-top:14px">Upcoming term</h3><div class="grid g3" style="gap:10px">'+kpiT('Titles adopted',mu.titles,'Goal '+mu.goal)+kpiT('Adoption vs goal',mu.adoptVsGoal+'%',mu.adoptVsGoal>=100?'Goal met':'Below goal',mu.adoptVsGoal<90?'bad':'')+kpiT('Order availability',mu.avail+'%','Goal '+mu.availGoal+'%',mu.avail<mu.availGoal?'bad':'')+'</div>'+
      '<h3 style="margin-top:14px">Adoption readiness: courses not yet adopted</h3>'+(gaps.length?'<table><thead><tr><th>Course</th><th>Title</th><th>Deadline</th><th>Countdown</th></tr></thead><tbody>'+gaps.map(function(g){return '<tr><td><b>'+g.code+'</b></td><td>'+g.title+'</td><td>'+g.deadline+'</td><td><span class="tag '+(g.urgent?'err':'warn')+'">'+g.days+' days</span></td></tr>'}).join('')+'</tbody></table>':'<div class="sub">Every course is adopted.</div>')+srcL('adoption file and inventory system','daily');
  }
  if(id==='access'){
    var a=d.access;
    h='<div class="grid g6" style="grid-template-columns:repeat(4,1fr);gap:10px">'+kpiT('Students served',a.served.toLocaleString(),'In Access sections')+kpiT('Unique titles',a.titles,'Across '+a.sections+' sections')+kpiT('Reported savings',money(a.savingsK),'Assumed, per term')+kpiT('Participation',a.participation+'%','Opt-out '+a.optout+'%',a.optout>7?'bad':'')+'</div>'+
      '<div class="grid g2" style="margin-top:12px"><div class="card"><h3>Digital vs physical</h3><div class="hb"><span class="hl">Digital</span><div class="bar"><i style="width:'+a.digital+'%"></i></div><b>'+a.digital+'%</b></div><div class="hb"><span class="hl">Physical</span><div class="bar mid"><i style="width:'+(100-a.digital)+'%"></i></div><b>'+(100-a.digital)+'%</b></div></div>'+
      '<div class="card"><h3>Top publisher partners</h3>'+a.pubs.map(function(p){return '<div class="hb"><span class="hl">'+p[0]+'</span><div class="bar"><i style="width:'+p[1]*2+'%"></i></div><b>'+p[1]+'%</b></div>'}).join('')+'</div></div>'+srcL('Access provisioning and publisher files','daily');
  }
  if(id==='merch'){
    var mg=d.merch;
    h='<div class="grid g2"><div class="card"><h3>New this fiscal year</h3><ul class="cm">'+mg.fresh.map(function(x){return '<li><b>'+x[0]+'</b> <span class="tag '+(x[1]==='Live'?'ok':'blue')+'">'+x[1]+'</span><div class="sub">'+x[2]+'</div></li>'}).join('')+'</ul></div>'+
      '<div class="card"><h3>Exclusive apparel brands</h3><div class="chips">'+mg.brands.map(function(b){return '<span class="tag blue">'+b+'</span>'}).join('')+'</div><h3 style="margin-top:12px">Ways to partner on social and email</h3><div class="sub" style="font-size:13px;color:var(--ink)">'+esc(mg.ask)+'</div></div></div>'+
      '<div class="card" style="margin-top:12px;padding:0;overflow:auto"><table><thead><tr><th>Campaign</th><th>Date</th><th>Status</th></tr></thead><tbody>'+mg.campaigns.map(function(x){return '<tr><td><b>'+x.t+'</b></td><td>'+x.date+'</td><td><span class="tag '+(x.status==='Complete'?'ok':x.status==='Needs approval'?'warn':'blue')+'">'+x.status+'</span></td></tr>'}).join('')+'</tbody></table></div>'+srcL('marketing calendar','weekly');
  }
  if(id==='tech'){
    h='<div class="card" style="padding:0;overflow:auto"><table><thead><tr><th>Rollout</th><th>Phase</th><th>Date</th></tr></thead><tbody>'+d.tech.map(function(x){return '<tr><td><b>'+x.t+'</b></td><td><span class="tag '+(x.phase==='Live'?'ok':x.phase==='Planning'?'':'blue')+'">'+x.phase+'</span></td><td>'+x.date+'</td></tr>'}).join('')+'</tbody></table></div>'+srcL('technology rollout plan for '+esc(c.n),'weekly');
  }
  if(id==='growth'){
    var ranked=SPRMODEL.rankOpportunities(c),top=E.opp||ranked.slice(0,5).map(function(o){return o.id});E.opp=top;
    var byo={};ranked.forEach(function(o){byo[o.id]=o});
    h='<div class="sub" style="margin-bottom:8px">Ranked by the agent for '+esc(c.n)+'. '+(mode==='prep'?'Swap any item, then add it to the deck.':'')+'</div><div class="grid" style="gap:10px">'+top.map(function(id2,i){var o=byo[id2],inD=!!E.deck[id2];
      return '<div class="card opp"><div style="flex:1"><b>'+(i+1)+'. '+esc(o.t)+'</b><div class="sub">Timing: '+esc(o.trigger)+'</div>'+(mode==='prep'?'<div class="why int">Why this: '+esc(o.reason)+' Rough size '+money(o.sizeK)+' (assumed).</div>':'')+'</div>'+
        (ed?'<span class="ctl"><button class="btn sm" data-a="sprswap:'+i+'">Swap</button><button class="btn sm '+(inD?'':'pri')+'" data-a="sprdeck:'+id2+'">'+(inD?'In deck':'Add to deck')+'</button></span>':(inD?'<span class="tag ok">In deck</span>':''))+'</div>'}).join('')+'</div>'+
      '<div class="sub" style="margin-top:8px">In deck: '+(Object.keys(E.deck).filter(function(k){return E.deck[k]}).length?Object.keys(E.deck).filter(function(k){return E.deck[k]}).map(function(k){return byo[k].t}).join(', '):'none yet')+'</div>'+srcL('opportunity library and campus signals','daily');
  }
  if(id==='partner'){
    var pt=d.partner;
    h='<div class="grid g3" style="gap:10px">'+kpiT('Contract term',esc(pt.term),'Ends '+pt.end)+kpiT('Commission earned',money(pt.earnedK),'of '+money(pt.guarK)+' guarantee ('+pt.earnedPct+'%)')+kpiT('Bonus and scholarship',pt.bonus+' / '+pt.scholarship,'Status')+'</div>'+
      '<div class="card" style="margin-top:12px"><h3>Progress to commission tiers</h3>'+pt.tiers.map(function(t){return '<div class="hb"><span class="hl">'+t[0]+'</span><div class="bar '+(t[1]<70?'bad':t[1]<95?'mid':'')+'"><i style="width:'+t[1]+'%"></i></div><b>'+t[1]+'%</b></div>'}).join('')+'</div>'+
      '<div class="card" style="margin-top:12px"><h3>Renewal next steps</h3><ul class="cm">'+pt.next.map(function(n){return '<li>'+esc(n)+'</li>'}).join('')+'</ul></div>'+
      (mode==='prep'?'<div class="card int" style="margin-top:12px"><h3>Renewal strategy guidance <span class="tag warn">Internal only</span></h3><div style="font-size:13px">'+esc(pt.strategy)+'</div></div>':'')+srcL('contract record and commission ledger','daily');
  }
  if(id==='discuss'){
    var acts=spA(E,d);
    h=(mode==='prep'?'<div class="card int"><h3>Live notes <span class="tag warn">Internal only</span></h3>'+(ed?'<textarea rows="4" data-spr="notes" placeholder="Notes from the meeting" style="width:100%">'+esc(E.notes)+'</textarea>':'<div style="font-size:13px">'+esc(E.notes||'No notes yet.')+'</div>')+'</div>':'')+
      '<div class="card" style="margin-top:12px"><h3>Action items</h3><div class="sub">Open items carry forward to the next review for '+esc(c.n)+'.</div><table><thead><tr><th>Item</th><th>Owner</th><th>Due</th><th>Status</th>'+(ed?'<th></th>':'')+'</tr></thead><tbody>'+
      acts.map(function(x,i){return '<tr><td>'+esc(x.t)+'</td><td>'+esc(x.owner)+'</td><td>'+esc(x.due)+'</td><td><span class="tag '+(x.status==='done'?'ok':'blue')+'">'+(x.status==='done'?'Done':'Open')+'</span></td>'+(ed?'<td><button class="btn sm" data-a="spract:done:'+i+'">'+(x.status==='done'?'Reopen':'Mark done')+'</button> <button class="btn sm" data-a="spract:rm:'+i+'">Remove</button></td>':'')+'</tr>'}).join('')+'</tbody></table>'+
      (ed?'<div class="row" style="margin-top:10px"><input class="inl" id="actnew" placeholder="New action item" style="flex:1"><button class="btn" data-a="spract:add">Add</button></div>':'')+'</div>'+
      (ed?'<div style="margin-top:12px"><button class="btn pri" data-a="sprfollow">Draft follow-up email</button></div>':'');
  }
  return h+tpBox(d,id,tp);
}

function sprStrip(d){
  var mv=SPRMODEL.movers(d.metrics.map(function(m){return {k:m.k,label:m.label,cur:m.cur,prev:m.prev,goodHigh:m.goodHigh}}),2),all=mv.up.concat(mv.down);
  return '<div class="card strip"><b>What changed since the last review (Aug 12)</b><div class="chips" style="margin-top:6px">'+all.map(function(x){return '<span class="chg '+(x.good?'good':'bad')+'">'+(x.pct>0?'Up ':'Down ')+Math.abs(x.pct).toFixed(1)+'%: '+esc(x.label)+'</span>'}).join('')+'</div></div>';
}
function sprSections(c,d,mode,live){
  var E=sprEd(c.id),secs=SPRMODEL.visibleSections(S.spr.cfg,mode);
  return secs.map(function(s){
    var collapsed=live&&s.collapsed;
    return '<section class="card sprsec" id="spr-'+s.id+'"><div class="sprh"><h2>'+s.t+'</h2><span class="sp"></span>'+(live?'<button class="btn sm" data-a="sprtoggle:'+s.id+'" aria-expanded="'+(!collapsed)+'">'+(collapsed?'Expand':'Collapse')+'</button>':'')+'</div>'+
      (collapsed?'':'<div class="sprb">'+sprSection(s.id,c,d,E,mode,live)+'</div>')+'</section>'}).join('');
}
function sprDoc(c,d,mode){
  return '<div class="prdoc"><h1>Strategic partnership review: '+esc(c.n)+'</h1><div class="sub">'+d.periodName+'. Data as of '+d.asOf+'. Snapshot saved Nov 1, 2026. Synthetic data.</div>'+sprStrip(d)+sprSections(c,d,mode,false)+'</div>';
}
function sprShareUrl(c){return location.origin+location.pathname+'?spr='+c.id+'&period='+S.spr.period+'&present=1'}
function vSpr(){
  var c=byId[S.campus],d=sprData(c),mode=S.ro?'present':S.spr.mode,E=sprEd(c.id),ro=S.ro;
  var top='';
  if(!ro){
    var hist=d.history.map(function(x,i){return '<button class="chip" data-a="sprhist:'+i+'">'+x.date+' '+x.title+'</button>'}).join('')+S.spr.snaps.filter(function(x){return x.cid===c.id}).map(function(x,i){return '<button class="chip" data-a="sprsnap:'+S.spr.snaps.indexOf(x)+'">Saved '+x.date+' ('+x.period+')</button>'}).join('');
    top='<div class="card sprtop"><div class="row" style="align-items:center;flex-wrap:wrap;gap:10px"><h2 style="font-size:20px">SPR</h2><span class="sub">Strategic partnership review</span><span class="sp" style="flex:1"></span>'+
      '<label class="sub">Campus <select id="sprcamp">'+C.map(function(x){return '<option value="'+x.id+'"'+(x.id===S.campus?' selected':'')+'>'+x.n+'</option>'}).join('')+'</select></label>'+
      '<label class="sub">Period <select id="sprperiod">'+Object.keys(SPRDATA.PERIODS).map(function(k){return '<option value="'+k+'"'+(S.spr.period===k?' selected':'')+'>'+SPRDATA.PERIODS[k].n+'</option>'}).join('')+'</select></label>'+
      '<span class="sub">Data as of '+d.asOf+'</span>'+
      '<div class="seg2" role="group" aria-label="Mode"><button class="'+(mode==='prep'?'on':'')+'" data-a="sprmode:prep">Prep</button><button class="'+(mode==='present'?'on':'')+'" data-a="sprmode:present">Present</button></div></div>'+
      '<div class="row" style="align-items:center;flex-wrap:wrap;gap:8px;margin-top:10px"><button class="btn" data-a="sprexport">Export snapshot</button><button class="btn" data-a="sprshare">Share link</button><button class="btn" data-a="sprcust">Sections</button>'+(mode==='prep'?'<button class="btn" data-a="sprtp">'+(S.spr.tp?'Hide':'Show')+' talking points</button>':'')+
      '<span class="sp" style="flex:1"></span><input id="sprq" class="inl" placeholder="Ask about '+esc(c.n)+'" style="min-width:240px" aria-label="Ask about this campus"><button class="btn pri" data-a="sprask">Ask</button></div>'+
      (S.spr.cust?'<div class="cust"><b>Sections for this meeting</b>'+S.spr.cfg.map(function(x,i){var m=SPRMODEL.sectionMeta(x.id);return '<div class="cr"><label><input type="checkbox" data-a="sprvis:'+x.id+'" '+(x.visible?'checked':'')+'> '+m.t+'</label><button class="btn sm" data-a="sprmove:'+x.id+':-1" aria-label="Move up">Up</button><button class="btn sm" data-a="sprmove:'+x.id+':1" aria-label="Move down">Down</button></div>'}).join('')+'</div>':'')+
      (S.spr.ask?'<div class="ans" style="max-height:none"><div class="q">'+esc(S.spr.ask.q)+'</div>'+S.spr.ask.html+'</div>':'')+
      '<div style="margin-top:10px"><span class="sub">Meeting history (read-only): </span><span class="chips" style="display:inline-flex">'+hist+'</span></div></div>';
  }
  var jump=SPRMODEL.visibleSections(S.spr.cfg,mode).map(function(s){return '<button data-a="sprjump:'+s.id+'">'+s.t+'</button>'}).join('');
  return top+(ro?'<div class="card" style="margin-bottom:12px"><b>Strategic partnership review: '+esc(c.n)+'</b> <span class="sub">Read-only customer view. '+d.periodName+'. Data as of '+d.asOf+'.</span></div>':'')+
    '<div class="sprwrap"><nav class="sprjump" aria-label="Sections">'+jump+'</nav><div class="sprbody">'+sprStrip(d)+sprSections(c,d,mode,!ro)+'</div></div>';
}
function sprFollowup(c,d){
  var E=sprEd(c.id),acts=spA(E,d),open=acts.filter(function(a){return a.status!=='done'});
  return ['Subject: Follow-up from our partnership review','','Thank you for the time today. A few notes from our conversation:','',
    '- Guarantee coverage is '+d.health.cover+'% and the customer service score is '+d.health.smg+'.','- Access participation is '+d.access.participation+'% with an assumed savings of '+money(d.access.savingsK)+'.','',
    'Next steps:'].concat(open.map(function(a){return '- '+a.t+' ('+a.owner+', due '+a.due+')'})).concat(['','Synthetic draft for review before sending.']).join('\n');
}
function sprSnapText(x){return x.lines.join('\n')}

/* ====================== events ====================== */
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-a]');
  if(e.target.id==='modal'||e.target.id==='mclose'){$('#modal').classList.remove('on');return}
  if(e.target.id==='mcopy'){try{navigator.clipboard.writeText($('#mb').textContent)}catch(x){}toast('Copied to clipboard');return}
  if(!el)return;var a=el.getAttribute('data-a').split(':'),k=a[0];
  switch(k){
   case 'home':S.view='home';S.region=null;S.market=null;break;
   case 'view':S.view=a[1];if(a[1]==='home'){S.region=null;S.market=null}break;
   case 'reg':S.region=a[1];S.market=null;S.view='home';break;
   case 'mkt':S.market=a[1];S.view='home';break;
   case 'sort':S.sortD=S.sortK===a[1]?-S.sortD:1;S.sortK=a[1];break;
   case 'camp':S.campus=a[1];S.ctab=a[2]||'perf';S.view='campus';break;
   case 'ctab':S.ctab=a[1];break;
   case 'ops':S.view='ops';if(a[1])S.otab=a[1];if(a[2]){if(byId[a[2]])S.scope=a[2];else{S.proc=a[2];S.step=null}}break;
   case 'otab':S.otab=a[1];break;
   case 'proc':S.proc=a[1];S.step=null;break;
   case 'step':S.step=+a[1];break;
   case 'feed':S.feed=[a[1],a[2]];break;
   case 'loop':{var key=a[1],i=+a[2],lp=S.loop[key]||(S.loop[key]={step:0,msgs:[]});
     if(i!==lp.step)return;var c=byId[S.feed[0]],f=D.FEEDS.filter(function(x){return x.id===S.feed[1]})[0],s=D.FEEDSTAT[c.id][f.id];
     var msg=['Monitoring '+f.n+' at '+c.n+'. Alert if freshness slips past 2 hours.','Compared with the prior 14 days: volume '+(s===0?'within 2% and on time.':'down 17% and about 3 hours later than usual.'),'Flagged to '+f.owner+' and added to the exception queue.','Rule learned: for '+f.n+' at campuses like '+c.n+', hold downstream steps until the file lands, then re-run matching automatically.'];
     lp.msgs.push(msg[i]);lp.step++;break}
   case 'ex':{var id=a[1];if(id==='ex1'&&!B.state().released){B.set('released',true,'Sales Command Center','Confirmed Sep 12 census date from Operations Control, 7 invoices released')}S.ex[id]=a[2];toast(a[2]==='auto'?'Auto-resolve rule saved':'Fix approved and written back');break}
   case 'drill':S.drill=S.drill===a[1]?null:a[1];break;
   case 'lead':S.leads[a[1]]=1;toast('Lead sent to the Access team');break;
   case 'motion':S.motion[a[1]]=1;toast('Play started');break;
   case 'play':{var p=PROGRAMS.filter(function(x){return x.id===a[1]})[0],taken=Object.keys(p.res).concat(S.plays.filter(function(x){return x[0]===p.id}).map(function(x){return x[1]}));
     var nxt=C.filter(function(c){return taken.indexOf(c.id)<0}).sort(function(x,y){return y.enroll-x.enroll})[0];
     if(nxt){S.plays.push([p.id,nxt.id]);toast('Queued '+p.n+' at '+nxt.n+'. Campus Commerce will draft the plan.')}else toast('Already running at every campus');break}
   case 'prep':{var c2=byId[S.prep];var kind=a[1];if(kind==='spr'){S.campus=S.prep;S.view='spr';break}openModal({brief:'Campus brief',spr:'Strategic partnership review',news:'Monthly partner newsletter'}[kind]+': '+c2.n,prepText(kind,c2));return}
   case 'sprmode':S.spr.mode=a[1];break;
   case 'sprtoggle':S.spr.cfg.forEach(function(x){if(x.id===a[1])x.collapsed=!x.collapsed});break;
   case 'sprvis':S.spr.cfg.forEach(function(x){if(x.id===a[1])x.visible=el.checked});break;
   case 'sprmove':{var mi=-1;S.spr.cfg.forEach(function(x,j){if(x.id===a[1])mi=j});var mj=mi+(+a[2]);if(mi>=0&&mj>=0&&mj<S.spr.cfg.length){var mt=S.spr.cfg[mi];S.spr.cfg[mi]=S.spr.cfg[mj];S.spr.cfg[mj]=mt}break}
   case 'sprcust':S.spr.cust=!S.spr.cust;break;
   case 'sprtp':S.spr.tp=!S.spr.tp;break;
   case 'sprfilter':S.spr.filter=a[1];break;
   case 'sprhl':{var E1=sprEd(S.campus),d1=sprData(byId[S.campus]),ids=spHl(E1,d1),hid=a[1],op=a[2],kindOf={};d1.highlights.forEach(function(x){kindOf[x.id]=x.kind});
     if(hid==='all'){E1.rm={}}else if(op==='pin')E1.pins[hid]=!E1.pins[hid];else if(op==='rm')E1.rm[hid]=true;
     else{var ix=ids.indexOf(hid),step=op==='up'?-1:1,jx=ix+step;while(jx>=0&&jx<ids.length&&(kindOf[ids[jx]]!==kindOf[hid]||E1.rm[ids[jx]]))jx+=step;if(ix>=0&&jx>=0&&jx<ids.length){ids[ix]=ids[jx];ids[jx]=hid}}break}
   case 'sprswap':{var E2=sprEd(S.campus),rk=SPRMODEL.rankOpportunities(byId[S.campus]),old=E2.opp[+a[1]];E2.opp=SPRMODEL.swapOpportunity(rk,E2.opp,+a[1]);delete E2.deck[old];break}
   case 'sprdeck':{var E3=sprEd(S.campus);E3.deck[a[1]]=!E3.deck[a[1]];break}
   case 'sprfollow':{var c4=byId[S.campus];openModal('Draft follow-up email: '+c4.n,sprFollowup(c4,sprData(c4)));return}
   case 'sprhist':{var hh=sprData(byId[S.campus]).history[+a[1]];openModal('Past review: '+hh.title+' ('+hh.date+')',sprSnapText(hh));return}
   case 'sprsnap':{var sn=S.spr.snaps[+a[1]];openModal('Saved snapshot ('+sn.date+')',sprSnapText(sn));return}
   case 'sprshare':{var c6=byId[S.campus];openModal('Share link: read-only customer view',sprShareUrl(c6)+'\n\nOpens the Present view for '+c6.n+'. Internal notes, talking points and renewal strategy are not included.');return}
   case 'sprexport':{var c7=byId[S.campus],d7=sprData(c7);$('#printroot').innerHTML=sprDoc(c7,d7,'present');
     S.spr.snaps.unshift({cid:c7.id,date:'Nov 1, 2026',period:d7.periodName,lines:[c7.n+' snapshot (Present view)',d7.periodName,'Guarantee coverage '+d7.health.cover+'%','Customer service score '+d7.health.smg,'Access participation '+d7.access.participation+'%']});
     toast('Snapshot saved to meeting history. Choose Save as PDF in the print dialog.');setTimeout(function(){try{window.print()}catch(x){}},60);break}
   case 'sprjump':{var tgt=$('#spr-'+a[1]);if(tgt)tgt.scrollIntoView({behavior:'smooth',block:'start'});return}
   case 'sprask':{var q2=($('#sprq')||{}).value;if(q2&&q2.trim()){S.spr.ask=answer(q2+' ('+byId[S.campus].n+')');S.spr.ask.q=q2}break}
   case 'spract':{var E8=sprEd(S.campus),acts=spA(E8,sprData(byId[S.campus]));
     if(a[1]==='add'){var ni=$('#actnew'),nv=ni&&ni.value.trim();if(nv)acts.push({id:'n'+acts.length+'x',t:nv,owner:'Seller',due:'2026-11-15',status:'open'})}
     else if(a[1]==='done'){var it=acts[+a[2]];it.status=it.status==='done'?'open':'done'}else if(a[1]==='rm')acts.splice(+a[2],1);break}
   case 'ngc':S.motion['ngc:'+a[1]]=1;toast('Campaign queued. Marketing has the sequence and every send needs approval.');break;
   case 'ngt':S.motion['ngt:'+a[1]]=1;toast('Next steps added to the CRM with owners and dates.');break;
   case 'askq':ask(el.getAttribute('data-q'));return;
   case 'askgo':ask($('#askin').value.trim());return;
   case 'cfo':try{window.parent.postMessage({campusosNav:'cfo'},'*')}catch(x){}toast('Opening the CFO workspace');return;
   case 'toast':toast(a.slice(1).join(':'));return;
   case 'reset':B.reset();S.step=null;S.ex={};S.loop={};S.leads={};S.motion={};S.plays=[];S.spr=sprFresh();S.bannerOn=false;banner();toast('Demo state reset');break;
   case 'bn':S.bannerOn=false;banner();return;
   case 'taskdone':{var ts=(B.state().tasks||[]),tt=ts.filter(function(x){return x.id===a[1]})[0];if(tt){B.set('tasks',ts.map(function(x){return x.id===a[1]?Object.assign({},x,{status:'done'}):x}),'Sales Command Center','Partner task done: '+tt.title);
     if(tt.kind==='recon'){B.set('reconDone',true,'Sales Command Center','Sent the Fall Access invoice reconciliation to the CFO');B.logDecision(tt.title,'Completed','Partner team sent the reconciliation','Follett partner team','Sales Command Center')}}banner();toast('Task marked done. The CFO view updated.');break}
  }
  render();
});
document.addEventListener('change',function(e){var t=e.target;
  if(t.id==='scope'){S.scope=t.value;render()}else if(t.id==='agentsel'){S.agent=t.value;render()}else if(t.id==='prepsel'){S.prep=t.value}else if(t.id==='sprcamp'){S.campus=t.value;S.prep=t.value;render()}else if(t.id==='sprperiod'){S.spr.period=t.value;render()}});
document.addEventListener('input',function(e){var t=e.target,k=t.getAttribute&&t.getAttribute('data-spr');if(!k)return;var E=sprEd(S.campus),p=k.split(':');
  if(p[0]==='take')E.take[p[1]]=t.value;else if(p[0]==='notes')E.notes=t.value;else if(p[0]==='comm')E.comm[p[1]]=t.value});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='askin')ask(e.target.value.trim());if(e.key==='Enter'&&e.target.id==='sprq'){var b=document.querySelector('[data-a="sprask"]');if(b)b.click()}});

B.on(function(type,payload,st){
  if(type==='accessPaid'&&st.accessPaid&&!S.bannerOn){S.bannerOn=true;S.anim=true;banner()}
  if(type==='reset'){S.bannerOn=false}
  banner();render();
});
if(B.state().accessPaid){S.bannerOn=true}banner();
render();
})();
