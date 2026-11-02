/* SPR mock data. Fabricated and generated per campus from the sample campus record, so the 12 sample
   campuses each get their own numbers. To use real sources, replace build() with a function that returns
   the same shape. Names, dates, amounts and comments below are clearly fake placeholders. */
(function(root){
  function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function rng(seed){var a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  var PERIODS={ytd:{n:'Year to date',f:1},term:{n:'Current term',f:0.42},last:{n:'Last term',f:0.38}};
  function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}
  function r1(n){return Math.round(n*10)/10}

  var COMMENTS=[
    'Checkout was fast and the staff were helpful. Reach me at pat.sample@example.com if you want to follow up.',
    'The line at the start of term was long. Ms. Rivera at the front desk was great though.',
    'Please call me at 555-010-4477 about my special order. This is Jordan K.',
    'Great selection of game-day gear this year.',
    'My online order arrived two days early. Thanks, from Sam Lee.',
    'I could not find my course materials on day one, but the team fixed it quickly.',
    'Love the new birthday club. See https://example.com/club for details.'];
  var COURSES=[['ENGL 1101','Composition I'],['MATH 1210','Calculus I'],['CHEM 1101','General chemistry'],['ECON 2010','Principles of economics'],
    ['PSYC 1001','Intro to psychology'],['BIOL 1106','Biology I'],['ACCT 2101','Financial accounting'],['HIST 1030','World history']];
  var CAMPAIGNS=[['Spring welcome week','Jan 12'],['Game-day pop-up series','Feb 6'],['Alumni appreciation weekend','Mar 14'],['Spring break travel gear','Mar 2'],
    ['Graduation countdown','Apr 20'],['Student appreciation sale','Apr 28']];
  var STATUS=['Scheduled','In planning','Needs approval','Complete'];

  function build(c,period,ctx){
    var p=PERIODS[period]||PERIODS.ytd,r=rng(hash(c.id+':'+period)),rs=rng(hash(c.id+':static'));
    var g=r1(c.gm*0.9+(r()*2-1));            /* sales growth vs last year, percent */
    var totalK=Math.round(c.enroll*0.38*p.f);
    function pair(cur,gr){return {cur:cur,prev:Math.round(cur/(1+gr/100))}}

    var channels=[['Store',0.6,g-1.5],['E-commerce',0.24,g+9],['Access',0.16,g+(c.access-60)/12]].map(function(x){
      var pr=pair(Math.round(totalK*x[1]),r1(x[2]));return {n:x[0],cur:pr.cur,prev:pr.prev,g:r1(x[2])}});
    var names=ctx.stores||['Main Store'];var wts=[0.55,0.3,0.15].slice(0,names.length);var ws=wts.reduce(function(a,b){return a+b},0);
    var stores=names.map(function(n,i){var cur=Math.round(totalK*0.6*wts[i]/ws),gr=r1(g+(r()*4-2));return {n:n,cur:cur,prev:Math.round(cur/(1+gr/100)),g:gr}});
    var depts=[['Course materials','materials',0.4],['Drinkware and accessories','hard',0.1],['Technology','hard',0.08],['Supplies','hard',0.07],['Convenience','hard',0.05],
      ['Apparel','soft',0.22],['Gifts and cards','soft',0.08]].map(function(x){var gr=r1(g+(r()*6-3)),cur=Math.round(totalK*x[2]);
      return {n:x[0],line:x[1],cur:cur,prev:Math.round(cur/(1+gr/100)),g:gr}});

    var smgNow=c.smg,trend=[];for(var i=5;i>=0;i--)trend.push(Math.round(smgNow-i*(r()*1.4-0.5)));trend[5]=smgNow;
    var cm=COMMENTS.slice(),k=Math.floor(r()*cm.length);cm=cm.slice(k).concat(cm.slice(0,k)).slice(0,5);

    var adoptPct=Math.min(98,Math.round(76+(c.ready-65)*0.35)),avail=Math.min(99,Math.round(90+(c.smg-72)*0.35));
    var titles=Math.round(c.enroll*0.062*p.f+40),upTitles=Math.round(titles*0.62),goal=Math.round(upTitles*1.12);
    var courses=COURSES.map(function(x,i){return {code:x[0],title:x[1],adopted:rs()<(c.ready/100)*0.95-(i>5?0.1:0),deadline:addDays(ctx.today,6+i*5+Math.floor(rs()*4))}});
    var materials={cur:{titles:titles,titlesLY:Math.round(titles/(1+(g+1)/100)),adoptPct:adoptPct,availStart:avail,units:Math.round(c.enroll*1.9*p.f),unitsLY:Math.round(c.enroll*1.9*p.f/(1+g/100)),share:Math.min(95,Math.round(68+(c.ready-60)*0.4))},
      up:{titles:upTitles,goal:goal,adoptVsGoal:Math.round(upTitles/goal*100),avail:Math.min(99,avail-2),availGoal:96},courses:courses};

    var served=Math.round(c.enroll*c.access/100*0.55);
    var access={served:served,titles:Math.round(served/18),digital:Math.min(90,Math.round(60+(c.access-50)*0.3)),savingsK:Math.round(served*0.135),participation:c.access,
      sections:Math.round(c.enroll/22*c.access/100),optout:c.optout,pubs:[['Publisher A',34],['Publisher B',27],['Publisher C',19]]};

    var merch={fresh:[['Loyalty program',['Live','Planned','Pilot'][Math.floor(r()*3)],'Points on store and online purchases'],
        ['Appreciation events',['Planned','Scheduled'][Math.floor(r()*2)],'One event each term for students and staff'],
        ['Birthday club',['Pilot','Live','Planned'][Math.floor(r()*3)],'A small offer in the month of the birthday']],
      campaigns:CAMPAIGNS.map(function(x,i){return {t:x[0],date:x[1],status:STATUS[Math.floor(r()*STATUS.length)]}}),
      brands:['Harbor & Stitch','North Pine Supply','Quad Letter Co'].slice(0,2+(c.stores>1?1:0)),
      ask:'Ways to partner on social and email: share the campaign calendar with the campus communications office and agree two joint sends per term.'};

    var phases=['Planning','Pilot','Rollout','Live'],pi=function(o){return Math.max(0,Math.min(3,Math.round((c.ready-50)/14)+o))};
    var tech=[['Storefront platform',0],['Student course-materials experience',-1],['Faculty course-materials experience',-1],['Faculty adoption tool',0]].map(function(x,i){
      var ph=phases[pi(x[1])];return {t:x[0],phase:ph,date:addDays(ctx.today,ph==='Live'?-30-i*20:20+i*25)}});

    var community=[{t:'Scholarship fund',v:'$'+Math.round(c.enroll*0.003)+'K',n:'Placeholder amount'},
      {t:'Campus events supported',v:String(6+Math.floor(r()*8)),n:'Placeholder count'},
      {t:'Student employment',v:String(Math.round(c.enroll/450)),n:'Student workers across stores (placeholder)'}];

    var earned=Math.round(ctx.proj*0.58),guar=ctx.guar;
    var partner={term:'Placeholder 10-year term',end:c.renew,earnedK:earned,guarK:guar,earnedPct:Math.round(earned/guar*100),
      tiers:[['Tier 1',100],['Tier 2',Math.min(100,Math.round(c.cover*0.85))],['Tier 3',Math.min(100,Math.round(c.cover*0.6))]],
      bonus:c.cover>=100?'On track':'At risk',scholarship:c.cover>=95?'Funded':'Review',
      next:['Confirm renewal timeline with the campus sponsor','Agree the spring campus commerce calendar','Schedule the readiness review before the contract window'],
      strategy:'Lead with the savings and outcome results, then connect renewal timing to the '+(c.cover<100?'guarantee gap':'strong coverage')+'. Placeholder guidance for the seller only.'};

    var good=[],work=[];
    if(c.gm>0)good.push(['Gross margin is up '+c.gm.toFixed(1)+' pts','Associated with better mix and event-day sales.']);
    if(c.smg>=78)good.push(['Customer service score is '+c.smg,'Above the group midpoint, associated with shorter lines at the start of term.']);
    if(c.access>=70)good.push(['Access coverage reached '+c.access+'%','Associated with lower costs for students in gateway courses.']);
    good.push(['E-commerce is growing faster than the store','Students are ordering ahead of registration windows.']);
    if(c.cover>=100)good.push(['Guarantee is covered at '+c.cover+'%','Projected commission is ahead of plan.']);
    if(ctx.disp>100)work.push(['Disputed invoices are $'+Math.round(ctx.disp)+'K','Mostly add/drop timing. A cleanup plan is in progress.']);
    if(c.access<60)work.push(['Access coverage is '+c.access+'%','Room to bring more sections in before the next adoption deadline.']);
    if(c.optout>7)work.push(['Opt-out rate is '+c.optout+'%','Associated with repricing on a few high-enrollment courses.']);
    if(Math.max(c.cfo,c.prov,c.athl,c.aux)>85)work.push(['A campus contact has gone quiet','Re-engage within two weeks.']);
    if(work.length<2)work.push(['Adoption readiness for the upcoming term','Some courses are not adopted yet. Deadlines are listed below.']);
    var highlights=good.slice(0,4).map(function(x,i){return {id:'g'+i,kind:'good',t:x[0],why:x[1]}}).concat(work.slice(0,3).map(function(x,i){return {id:'w'+i,kind:'work',t:x[0],why:x[1]}}));

    var talking={
      health:[['Open with the renewal score and the contract end date.','Readiness '+c.ready+', ends '+c.renew],['Guarantee coverage is the anchor number.','Coverage '+c.cover+'%']],
      highlights:[['Lead with what went well, then name the areas being worked on.','Pinned items appear first']],
      community:[['Connect the scholarship and events to student retention without claiming cause.','Placeholder values']],
      financial:[['E-commerce growth is the story to tell.','E-commerce '+channels[1].g+'% vs last year'],['Use the by-department view to talk mix.','Hardlines and softlines filter']],
      service:[['Show the SMG trend, then two comments.','Score '+c.smg]],
      materials:[['Ask for help closing the courses not yet adopted.','Deadline countdown below']],
      access:[['Savings first, then participation.','Savings '+(access.savingsK>=1000?'$'+(access.savingsK/1000).toFixed(2)+'M':'$'+access.savingsK+'K')+' (assumed)']],
      merch:[['Ask for two joint sends per term.','Request item below']],
      tech:[['Name the next rollout date for each tool.','Per-campus phase table']],
      growth:[['Pick the two with the nearest timing trigger.','Ranked by the agent']],
      partner:[['Be direct about where commission stands against the guarantee.','Earned '+Math.round(earned/guar*100)+'% of guarantee so far']],
      discuss:[['Leave with three dated action items.','Open items carry forward']]};

    var metrics=[
      {k:'sales',label:'Sales',cur:totalK,prev:Math.round(totalK/(1+(g-1.5)/100)),goodHigh:true},
      {k:'ecom',label:'E-commerce sales',cur:channels[1].cur,prev:Math.round(channels[1].cur/(1+(channels[1].g-4)/100)),goodHigh:true},
      {k:'smg',label:'Customer service score',cur:c.smg,prev:c.smg-Math.round(r()*5-1.5),goodHigh:true},
      {k:'part',label:'Access participation',cur:c.access,prev:c.access-Math.round(r()*6-1),goodHigh:true},
      {k:'opt',label:'Opt-out rate',cur:c.optout,prev:r1(c.optout-(r()*2-0.6)),goodHigh:false},
      {k:'disp',label:'Disputed invoices',cur:Math.round(ctx.disp),prev:Math.round(ctx.disp*(0.8+r()*0.5)),goodHigh:false},
      {k:'cover',label:'Guarantee coverage',cur:c.cover,prev:c.cover-Math.round(r()*5-1),goodHigh:true},
      {k:'avail',label:'Availability at start of classes',cur:avail,prev:avail-Math.round(r()*4-1),goodHigh:true}];

    var history=[['2026-08-12','Fall planning review'],['2026-05-14','Spring results review'],['2026-02-11','Winter check-in']].map(function(x,i){
      return {date:x[0],title:x[1],lines:['Guarantee coverage '+(c.cover-i*2)+'%','Customer service score '+(c.smg-i)+'','Disputed invoices $'+Math.round(ctx.disp*(1+i*0.15))+'K','Open actions carried: '+(2-Math.min(i,1))]}});

    var actions=[{id:'a1',t:'Send the Access savings summary to the campus sponsor',owner:'Seller',due:addDays(ctx.today,9),status:'open'},
      {id:'a2',t:'Confirm the spring pop-up dates with athletics',owner:'Campus manager',due:addDays(ctx.today,16),status:'open'},
      {id:'a3',t:'Share the add/drop file schedule with the registrar',owner:'Seller',due:addDays(ctx.today,-12),status:'done'}];

    return {period:period,periodName:p.n,asOf:'Nov 1, 2026, 6:00 AM',g:g,totalK:totalK,
      health:{ready:c.ready,end:c.renew,cover:c.cover,smg:c.smg,disp:ctx.disp,contactDays:Math.min(c.cfo,c.prov,c.athl,c.aux)},
      highlights:highlights,community:community,sales:{channels:channels,stores:stores,depts:depts},
      service:{trend:trend,comments:cm},materials:materials,access:access,merch:merch,tech:tech,partner:partner,talking:talking,
      metrics:metrics,history:history,actions:actions};
  }
  root.SPRDATA={PERIODS:PERIODS,build:build};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.SPRDATA;
})(typeof window!=='undefined'?window:this);
