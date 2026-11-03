/* CFO "Today" tab: pure logic plus one mock-data module. No DOM access, no network.
   Replace TODAYDATA with real sources later; the functions only read plain objects.
   All values are fabricated. Anything derived from a model is labeled Modeled in the UI. */
(function(root){
  var TODAY='2026-11-01';
  function dayMs(d){return new Date(d+'T00:00:00').getTime()}
  function daysBetween(a,b){return Math.round((dayMs(b)-dayMs(a))/86400000)}

  /* KPI status. dir 'high' means higher is better. th = {watch, off}. Editing a threshold changes status immediately. */
  function status(value,th,dir){
    if(dir==='low')return value>th.off?'off':value>th.watch?'watch':'ontrack';
    return value<th.off?'off':value<th.watch?'watch':'ontrack';
  }
  var STATUS_LABEL={ontrack:'On track',watch:'Watch',off:'Off track'};
  var STATUS_ICON={ontrack:'✓',watch:'!',off:'✕'};

  /* Since yesterday feed: score = importance, dollars at stake and nearness of the due date.
     settings.types[type] === false hides that event type. */
  function rankFeed(items,settings,n){
    var types=(settings&&settings.types)||{};
    return items.filter(function(i){return types[i.type]!==false}).map(function(i){
      var urgency=i.dueDays==null?0:Math.max(0,14-Math.min(14,i.dueDays));
      return {id:i.id,t:i.t,why:i.why,link:i.link,type:i.type,score:i.imp*10+Math.min(5,i.dollarsM||0)*3+urgency};
    }).sort(function(a,b){return b.score-a.score||a.id.localeCompare(b.id)}).slice(0,n==null?7:n);
  }

  /* Aging buckets by days past due as of today. Anything not yet due is Current. */
  var BUCKETS=['Current','1 to 30','31 to 60','61 to 90','Over 90'];
  function agingBuckets(accounts,today){
    var t=today||TODAY,out=BUCKETS.map(function(k){return {k:k,amt:0}});
    accounts.forEach(function(a){var d=daysBetween(a.due,t),i=d<=0?0:d<=30?1:d<=60?2:d<=90?3:4;out[i].amt+=a.amt});
    out.forEach(function(b){b.amt=Math.round(b.amt*100)/100});
    return out;
  }
  function pastDueTotal(buckets){return Math.round(buckets.slice(1).reduce(function(t,b){return t+b.amt},0)*100)/100}

  /* What-if on net tuition revenue and days cash. Illustrative: in-year cash follows revenue at inYearShare. */
  function whatIf(base,inp){
    var gross=base.ntrM/(1-base.discountRate/100);
    var newGross=gross*(1+(inp.enrollPct||0)/100),newDisc=base.discountRate+(inp.discPts||0);
    var ntr=newGross*(1-newDisc/100);
    if(inp.policy)ntr=ntr*(1-base.policyHitPct/100);
    var dNtr=ntr-base.ntrM,cash=base.cashM+dNtr*base.inYearShare;
    var days=base.dailyOpexM>0?cash/base.dailyOpexM:0,days0=base.dailyOpexM>0?base.cashM/base.dailyOpexM:0;
    return {ntrM:ntr,deltaNtrM:dNtr,daysCash:days,deltaDays:days-days0};
  }

  /* Shared invoice state, derived from the bus state both the CFO and seller views read. */
  function invoiceState(s){
    s=s||{};
    if(s.accessPaid)return {status:'approved',label:'Approved and scheduled',tone:'ok'};
    if(s.invoiceDispute)return {status:'disputed',label:'Disputed: '+(s.invoiceDispute.reason||'reason on file'),tone:'err'};
    if(s.reconDone)return {status:'reconciled',label:'Reconciliation received, ready to approve',tone:'ok'};
    if(s.reconRequested)return {status:'reconciliation',label:'Reconciliation requested',tone:'warn'};
    return {status:'open',label:s.released?'Ready to approve':'Held on census date',tone:s.released?'blue':'warn'};
  }
  function dueIn(date,today){return daysBetween(today||TODAY,date)}

  var DATA={
    today:TODAY,dateLabel:'Sunday, Nov 1, 2026',phase:'Fall census complete, spring registration open',asOf:'Nov 1, 2026, 6:00 AM',
    /* kpis: cur, prev month, budget. dir says which direction is good. th is the default threshold pair. */
    kpis:[
      {id:'cash',label:'Days cash on hand',cur:142,prev:139,budget:135,unit:'days',dir:'high',th:{watch:120,off:90},modeled:true},
      {id:'margin',label:'Operating margin vs forecast',cur:2.1,prev:1.9,budget:1.8,unit:'%',dir:'high',th:{watch:1.5,off:0.5},modeled:true},
      {id:'ntr',label:'Net tuition revenue vs budget',cur:101.5,prev:100.8,budget:100,unit:'% of budget',dir:'high',th:{watch:100,off:98},modeled:true},
      {id:'disc',label:'Tuition discount rate',cur:52.4,prev:52.1,budget:52.0,unit:'%',dir:'low',th:{watch:52,off:55},modeled:true},
      {id:'census',label:'Census headcount vs target',cur:99.4,prev:99.7,budget:100,unit:'% of target',dir:'high',th:{watch:99.5,off:98},note:'24,800 enrolled, target 24,950'},
      {id:'recv',label:'Student receivables past due',cur:3.2,prev:2.9,budget:3.0,unit:'$M',dir:'low',th:{watch:3.0,off:4.5}},
      {id:'aux',label:'Auxiliary contribution margin',cur:21.4,prev:21.0,budget:20.8,unit:'%',dir:'high',th:{watch:20,off:18},modeled:true},
      {id:'risk',label:'Risk status',cur:2,prev:2,budget:1,unit:'open items',dir:'low',th:{watch:1,off:4}}],
    base:{ntrM:138.4,discountRate:52.4,cashM:96.6,dailyOpexM:0.68,policyHitPct:1.8,inYearShare:0.4},
    cash:{weeks:[{w:'Nov 1 to 7',inM:4.2,outM:5.1},{w:'Nov 8 to 14',inM:3.8,outM:4.9},{w:'Nov 15 to 21',inM:6.1,outM:7.9},{w:'Nov 22 to 30',inM:3.9,outM:4.6}],
      partner:[{wk:2,t:'Follett commission statement',amtM:1.45,dir:'in',date:'Nov 15'},{wk:2,t:'Fall Access invoice',amtM:2.44,dir:'out',date:'Nov 20'}],
      dtp:[['Aug',52],['Sep',50],['Oct',47]],
      invoices:[{id:'access',t:'Fall Access invoice',amtM:2.44,date:'Nov 20'},{id:'print',t:'Print services vendor',amtM:0.038,date:'Nov 24',status:'Scheduled'},{id:'fac',t:'Facilities contractor',amtM:0.215,date:'Nov 27',status:'In review'}],
      accounts:[{n:'Fall balances, not yet due',amt:6.4,due:'2026-11-15'},{n:'Fall balances',amt:1.4,due:'2026-10-15'},{n:'Housing and fees',amt:0.9,due:'2026-09-20'},
        {n:'Prior-term balances',amt:0.6,due:'2026-08-25'},{n:'Older balances',amt:0.3,due:'2026-07-10'}],
      planUptake:38,planDelta:3,badDebtPct:0.9,badDebtBudget:1.0},
    enroll:{regPace:-2.1,registered:14120,persistence:85.9,persistenceBudget:86.5,holds:[['Billing',251],['Advising',96],['Immunization',65]]},
    risks:[
      {id:'consent',t:'Student data-sharing and consent',state:'In scope, 0 exceptions',owner:'Privacy officer',due:'Dec 1',open:false},
      {id:'soc',t:'Security attestations',state:'SOC report on file',owner:'Security officer',due:'Dec 1 renewal',open:false},
      {id:'letter',t:'Audit management letter response',state:'In progress',owner:'Controller',due:'Nov 14',open:true},
      {id:'single',t:'Single audit',state:'Fieldwork planning',owner:'Controller',due:'Feb 3',open:true},
      {id:'incident',t:'Open incident',state:'None open',owner:'Security officer',due:'n/a',open:false}],
    calendar:[
      {id:'board',d:'Nov 12',t:'Board finance committee',prep:'in progress'},{id:'letter',d:'Nov 14',t:'Audit management letter response',prep:'in progress'},
      {id:'tuition',d:'Nov 18',t:'Spring tuition and fee rates posted',prep:'ready'},{id:'inv',d:'Nov 20',t:'Fall Access invoice due',prep:'not started'},
      {id:'audit',d:'Dec 2',t:'Single audit planning meeting',prep:'not started'},{id:'rating',d:'Dec 9',t:'Lender and rating touchpoint',prep:'not started'},
      {id:'reg',d:'Dec 15',t:'Spring registration closes',prep:'in progress'}],
    directors:['Marcus Hale, Auxiliary Services','Renee Castillo, Registrar','Owen Pritchard, Bursar'],
    disputeReasons:['Amount does not match the adoption file','Census date differs from the Registrar','Pricing difference','Other']
  };
  root.TODAYDATA=DATA;
  root.TODAYMODEL={TODAY:TODAY,status:status,STATUS_LABEL:STATUS_LABEL,STATUS_ICON:STATUS_ICON,rankFeed:rankFeed,agingBuckets:agingBuckets,pastDueTotal:pastDueTotal,whatIf:whatIf,invoiceState:invoiceState,dueIn:dueIn,daysBetween:daysBetween};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.TODAYMODEL;
})(typeof window!=='undefined'?window:this);
