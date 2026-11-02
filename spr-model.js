/* SPR (strategic partnership review) logic. Pure functions, no DOM access, no network.
   Everything here works on plain objects so it can be tested and later pointed at real sources.
   All inputs and outputs are synthetic placeholders. */
(function(root){
  /* Section config: order, visibility and internal-only flags live here, not in the UI.
     A section marked internal never renders in Present mode, the export or the share link. */
  var SECTIONS=[
    {id:'health',t:'Partnership health snapshot'},
    {id:'highlights',t:'Highlights and key opportunities'},
    {id:'community',t:'Investing in your community'},
    {id:'financial',t:'Financial results'},
    {id:'service',t:'Customer service'},
    {id:'materials',t:'Course materials'},
    {id:'access',t:'Access program'},
    {id:'merch',t:'Merchandise and marketing'},
    {id:'tech',t:'Technology'},
    {id:'growth',t:'Opportunities for growth'},
    {id:'partner',t:'Partnership update'},
    {id:'discuss',t:'Discussion and takeaways'}];
  function defaultConfig(){return SECTIONS.map(function(s){return {id:s.id,visible:true,collapsed:false}})}
  function sectionMeta(id){for(var i=0;i<SECTIONS.length;i++)if(SECTIONS[i].id===id)return SECTIONS[i];return null}
  /* ordered, visible sections for a mode */
  function visibleSections(cfg,mode){
    return cfg.filter(function(c){var m=sectionMeta(c.id);return c.visible&&m&&!(mode==='present'&&m.internal)})
      .map(function(c){return {id:c.id,t:sectionMeta(c.id).t,collapsed:c.collapsed}});
  }
  /* internal-only filter: items flagged internal are dropped outside Prep mode */
  function filterInternal(items,mode){return mode==='prep'?items.slice():items.filter(function(i){return !i.internal})}

  function delta(cur,prev){
    var abs=cur-prev,pct=prev?abs/prev*100:null;
    return {abs:abs,pct:pct,dir:abs>0?'up':abs<0?'down':'flat'};
  }
  function showByStore(c){return (c.stores||0)>1}

  /* takeaway drafts use association wording only, never causation */
  var DRIVERS={
    store:'in-store traffic on event days',ecom:'online ordering around registration windows',access:'wider Access coverage in gateway courses',
    dept:'seasonal mix and the campus collab drops',channel:'the shift toward online ordering',stores:'the main store carrying most event-day traffic',
    smg:'faster checkout and better availability at the start of classes'};
  function takeaway(label,d,kind){
    var w=d.dir==='flat'?'flat':(d.dir==='up'?'up ':'down ')+Math.abs(d.pct==null?0:d.pct).toFixed(1)+'%';
    return label+' is '+w+' versus last year, associated with '+(DRIVERS[kind]||DRIVERS.dept)+'. Matched against the prior-year period.';
  }

  /* opportunity library, ranked per campus. score is 0 to 100, reason names the signal that drove it */
  var LIBRARY=[
    {id:'print',t:'Print and mail services',base:30,trigger:'Before the spring semester starts'},
    {id:'access',t:'Access growth',base:40,trigger:'Before the spring adoption deadline'},
    {id:'exp',t:'Experiential learning',base:25,trigger:'Ahead of summer term planning'},
    {id:'integ',t:'Learning integrations',base:30,trigger:'Before the next term opens'},
    {id:'aid',t:'Expanded financial aid',base:30,trigger:'Before aid refunds go out'},
    {id:'email',t:'School email marketing support',base:28,trigger:'Before the next campaign window'},
    {id:'venue',t:'In-venue sales',base:30,trigger:'Before the first home event'},
    {id:'grad',t:'Graduation',base:26,trigger:'Before the spring regalia window'},
    {id:'custom',t:'Custom merchandise',base:28,trigger:'Before the holiday season'},
    {id:'living',t:'Campus living',base:30,trigger:'Before move-in'},
    {id:'kits',t:'Course kits',base:24,trigger:'Before the next adoption deadline'},
    {id:'orient',t:'Accepted-student and orientation programs',base:26,trigger:'Before summer orientation'},
    {id:'friends',t:'Friends-and-family giving',base:24,trigger:'Before the holiday gifting window'}];
  var SCORE={
    access:function(c){return (100-c.access)*0.9},
    aid:function(c){return c.optout*3},
    email:function(c){return Math.max(0,60-c.smg*0.4)},
    venue:function(c){return c.athl>60?30:10},
    living:function(c){return c.enroll/1500},
    grad:function(c){return c.enroll/2000},
    print:function(c){return c.stores>1?12:4},
    custom:function(c){return c.gm<2?14:6},
    kits:function(c){return c.optout>7?12:3}};
  var REASON={
    access:function(c){return 'Access coverage is '+c.access+'%, so there are more sections to bring in.'},
    aid:function(c){return 'The opt-out rate is '+c.optout+'%, which is associated with price sensitivity.'},
    email:function(c){return 'Customer service score is '+c.smg+', so targeted email could lift engagement.'},
    venue:function(c){return 'Athletics contact is '+c.athl+' days old, so game-day sales are an open door.'},
    living:function(c){return 'A campus of '+c.enroll.toLocaleString()+' students has a large move-in window.'},
    grad:function(c){return 'A campus of '+c.enroll.toLocaleString()+' students supports a graduation program.'},
    print:function(c){return c.stores+' stores can support print and mail services.'},
    custom:function(c){return 'Gross margin is '+c.gm.toFixed(1)+' pts versus last year, so custom items could help.'},
    kits:function(c){return 'The opt-out rate is '+c.optout+'%, and kits bundle the materials students need.'}};
  /* rough size is an assumed placeholder: a share of enrollment times a per-student value */
  function sizeFor(o,c){var per={access:42,aid:30,email:12,venue:22,living:26,grad:18,print:9,custom:15,kits:20,exp:10,integ:12,orient:8,friends:6}[o.id]||10;
    return Math.round(c.enroll*per/1000)}
  function rankOpportunities(c,n){
    return LIBRARY.map(function(o){
      var s=o.base+(SCORE[o.id]?SCORE[o.id](c):0);
      return {id:o.id,t:o.t,score:Math.round(s),trigger:o.trigger,sizeK:sizeFor(o,c),
        reason:REASON[o.id]?REASON[o.id](c):'A fit for a campus with '+c.enroll.toLocaleString()+' students and '+c.stores+' store'+(c.stores>1?'s':'')+'.'};
    }).sort(function(a,b){return b.score-a.score||a.t.localeCompare(b.t)}).slice(0,n==null?LIBRARY.length:n);
  }
  /* swap: replace the opportunity at an index with the next best one that is not already shown */
  function swapOpportunity(ranked,shownIds,index){
    var pool=ranked.filter(function(o){return shownIds.indexOf(o.id)<0});
    if(!pool.length)return shownIds.slice();
    var out=shownIds.slice();out[index]=pool[0].id;return out;
  }
  /* adoption readiness: courses not yet adopted, with a deadline countdown */
  function readinessGaps(courses,today){
    var t=new Date(today).getTime();
    return courses.filter(function(c){return !c.adopted}).map(function(c){
      var days=Math.ceil((new Date(c.deadline).getTime()-t)/86400000);
      return {code:c.code,title:c.title,deadline:c.deadline,days:days,urgent:days<=14};
    }).sort(function(a,b){return a.days-b.days});
  }
  /* biggest movers between the last review and now. goodHigh says which direction is good. */
  function movers(metrics,n){
    var m=metrics.map(function(x){var d=delta(x.cur,x.prev);return {k:x.k,label:x.label,cur:x.cur,prev:x.prev,pct:d.pct==null?0:d.pct,
      good:x.goodHigh?d.abs>0:d.abs<0,fmt:x.fmt}}).filter(function(x){return x.pct!==0});
    m.sort(function(a,b){return Math.abs(b.pct)-Math.abs(a.pct)});
    return {up:m.filter(function(x){return x.pct>0}).slice(0,n||2),down:m.filter(function(x){return x.pct<0}).slice(0,n||2)};
  }
  /* strip names and contact details from comment-card text before it is shown */
  function redact(text){
    return String(text)
      .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,'[contact removed]')
      .replace(/\(?\b\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,'[contact removed]')
      .replace(/https?:\/\/\S+/g,'[link removed]')
      .replace(/\b(?:Mr|Ms|Mrs|Dr|Prof)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g,'[name removed]')
      .replace(/\b(?:my name is|this is|signed|from)\s+[A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+)?/gi,function(m){return m.replace(/\s+[A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+)?$/,' [name removed]')});
  }
  /* last-review carry forward: open items stay on the list for the next review */
  function carryForward(actions){return actions.filter(function(a){return a.status!=='done'})}

  root.SPRMODEL={SECTIONS:SECTIONS,LIBRARY:LIBRARY,defaultConfig:defaultConfig,sectionMeta:sectionMeta,visibleSections:visibleSections,filterInternal:filterInternal,
    delta:delta,showByStore:showByStore,takeaway:takeaway,rankOpportunities:rankOpportunities,swapOpportunity:swapOpportunity,readinessGaps:readinessGaps,
    movers:movers,redact:redact,carryForward:carryForward};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.SPRMODEL;
})(typeof window!=='undefined'?window:this);
