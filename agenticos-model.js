/* Wolfie PA Impact model. Pure calculation plus illustrative mock data, no DOM access.
   Swap DATA and DEFAULTS for an API response later; compute() only needs the assumptions object.
   All figures are fabricated for the prototype. */
(function(root){
  var DEFAULTS={eligible:12000,tuition:14500,baseline:82,adoption:45,lift:4.0,credit:60,cost:120};
  /* slider metadata: [key, label, min, max, step, unit, hint] */
  var INPUTS=[
    ['eligible','Eligible students',4000,30000,500,'n','Students who can use the assistant'],
    ['tuition','Net tuition revenue per student',8000,30000,250,'$','Per student per year'],
    ['baseline','Baseline term-to-term persistence',70,95,1,'%','Matched non-users'],
    ['adoption','Weekly active adoption',10,80,1,'%','Share of eligible students'],
    ['lift','Observed persistence lift',0,8,0.1,'pts','Active vs matched non-users'],
    ['credit','Share of lift credited to Wolfie PA',0,100,5,'%','Discounts for opt-in selection bias'],
    ['cost','Program cost per active student',40,300,5,'$','Per year']];
  var CONFIG={
    activatedShare:0.7,   /* weekly active students as a share of activated students */
    flaggedShare:0.18,    /* share of active students flagged at risk */
    followedShare:0.8,    /* share of flagged students followed up by a person or an agent */
    expandAt:1.5,holdAt:1.0};
  var DATA={
    scorecard:[
      ['Course completion, C or better',79,83,'pct'],
      ['Credits earned per term',11.6,12.4,'num'],
      ['Aid tasks done by deadline',71,88,'pct'],
      ['Days to clear a billing hold',9.5,3.2,'days'],
      ['DFW rate in gateway courses',18,14,'pct']],
    segments:[['First-year traditional',5.2],['Transfer',4.6],['Adult learner',3.8],['Continuing traditional',2.4]],
    guardrails:[
      ['Consent on file for active users','94%','ok'],
      ['Escalations to a person within one business day','91%','ok'],
      ['Lift gap between Pell and non-Pell students','0.6 pts','ok'],
      ['Opt-out rate after first term','3.1%','ok','Watch if above 5%'],
      ['Data leaving campus','Aggregate insights only, no student records','enforced']],
    /* what students ask Wolfie this month: questions, and change vs last month. Aggregate and anonymized. */
    searchTerms:[['Spring registration',1010,61],['Financial aid deadline',1240,34],['Billing hold',780,22],['Tutoring, Econ',520,47],['Game-day gear',380,29],['Access savings',640,18],['Pack Points',350,15],['Parking pass',410,-8]],
    /* most resolved issues: resolved count, share resolved without a person, typical time to resolve */
    resolved:[['Billing hold cleared',1180,83,'3.2 days'],['Aid task reminder completed',960,91,'1.1 days'],['Course materials not live on day one',410,88,'0.5 days'],
      ['Registration hold explained',372,79,'1.8 days'],['Tutoring slot booked',340,94,'0.4 days'],['Pack Points question',295,96,'Same day']],
    /* insights joined from Wolfie questions and the Slack community. Associations only, never causes. */
    insights:[
      {src:'Slack community',t:'Study group members ask fewer tutoring questions',d:'Students active in the course study channels ask Wolfie about 38% fewer tutoring questions and book earlier slots. This is associated with peers answering the first question.',next:'Seed study channels for the five gateway courses before midterms.'},
      {src:'Wolfie',t:'Registration questions jumped 61%',d:'Most arrive within a day of a billing hold notice. Wolfie answers them, but the hold is the real blocker.',next:'Send the hold reminder before registration opens, not after.'},
      {src:'Slack community',t:'Ambassador questions doubled after the channel launched',d:'Wolfie questions about the ambassador program roughly doubled in the two weeks after the ambassador channel opened. Applications followed the same pattern.',next:'Pin the apply link in the channel and in the Wolfie answer.'},
      {src:'Wolfie and Slack',t:'Game-day chatter comes before pop-up sales',d:'Gear questions in Wolfie and game-day threads in Slack rise the day before home games, which is associated with higher Arena Store pop-up traffic.',next:'Time the pop-up offer to the day before, not the day of.'}]};
  function num(v){v=Number(v);return isFinite(v)?v:0}
  function compute(a,cfg){
    a=a||DEFAULTS;cfg=cfg||CONFIG;
    var eligible=Math.max(0,num(a.eligible)),tuition=Math.max(0,num(a.tuition)),costPer=Math.max(0,num(a.cost));
    var adoption=Math.min(1,Math.max(0,num(a.adoption)/100)),observed=num(a.lift)/100,share=Math.min(1,Math.max(0,num(a.credit)/100));
    var active=eligible*adoption,creditedLift=observed*share,retained=active*creditedLift;
    var revenue=retained*tuition,cost=active*costPer;
    var breakEven=tuition>0?costPer/tuition:null;   /* lift needed to repay the cost */
    var ratio=breakEven===null?0:breakEven>0?creditedLift/breakEven:(creditedLift>0?Infinity:0);
    var signal=active<=0?'pause':ratio>=cfg.expandAt?'expand':ratio>=cfg.holdAt?'hold':'pause';   /* no active students means nothing to evaluate */
    var activated=cfg.activatedShare>0?Math.min(eligible,active/cfg.activatedShare):0;
    var flagged=active*cfg.flaggedShare,followed=flagged*cfg.followedShare;
    return {
      activeStudents:active,creditedLift:creditedLift,breakEvenLift:breakEven,ratio:ratio,signal:signal,
      retained:retained,revenueRetained:revenue,programCost:cost,
      returnPerDollar:cost>0?revenue/cost:null,costPerRetained:retained>0?cost/retained:null,
      funnel:[['Eligible',eligible],['Activated',activated],['Weekly active',active],['Flagged at risk',flagged],['Followed up',followed],['Added retained',retained]],
      persistence:{nonUsers:num(a.baseline),users:num(a.baseline)+num(a.lift),change:num(a.lift)}};
  }
  root.AGENTICOS={DEFAULTS:DEFAULTS,INPUTS:INPUTS,CONFIG:CONFIG,DATA:DATA,compute:compute};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.AGENTICOS;
})(typeof window!=='undefined'?window:this);
