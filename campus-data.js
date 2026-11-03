/* Shared synthetic data for every Campus OS surface (CFO Command Center, Teams, Sales Command Center, Idea Shelf).
   All data is fictional. Fictional institution: Northfield State University (Wolves, Wolfie).
   Any number shown on two surfaces must come from here so it reconciles. No student-level fields. No em or en dashes in copy. */
(function(){
var K=function(n){return n>=1000?'$'+(n/1000).toFixed(2).replace(/0$/,'')+'M':'$'+(+n).toFixed(1).replace(/\.0$/,'')+'K'};

/* ---------- Northfield State: the anchor campus. Matches the existing CFO workspace. ---------- */
var NF={
  id:'nfs',name:'Northfield State University',short:'Northfield State',mascot:'Wolves',assistant:'Wolfie',
  cfo:{name:'Dana Whitfield',title:'VP Finance and CFO'},
  gvp:{name:'Ellen Brooks',title:'Group Vice President, East Group',campuses:40,regions:4},
  contract:{ends:'Aug 31, 2027',rfpWindow:'January',guarantee:2600,scenarios:{base:2870,soft:2620,strong:3020}}, /* $K */
  disputes:{ /* must sum to $212.0K everywhere, 14 invoices */
    total:212.0,count:14,
    causes:[
      {id:'census',n:'Add/drop census date mismatch',amt:110.2,inv:7,note:'Registrar census is Sep 12, billing used Sep 8'},
      {id:'cohort',n:'Section or cohort flag',amt:63.8,inv:4,note:'Cohort flags differ between Registrar file and billing'},
      {id:'price',n:'Price or adoption change',amt:38.0,inv:3,note:'Repriced titles billed at the old adoption'}
    ]
  },
  commission:{contractRate:18,digitalPaid:14,shortK:41.8,lines:4,blended:15.4,peers:14.6},
  optOuts:{college:'Business',from:6.1,to:11.8,priceFrom:98,priceTo:146,riskPerTermK:21.6,reviewBy:'Nov 14'},
  gateway:[ /* name, students, week-6 digital access %, prior-term %. Drops are computed, never hard-coded. */
    {c:'CHEM 1101',n:640,w6:61,prior:74},{c:'MATH 1210',n:710,w6:64,prior:73},{c:'ACCT 2101',n:520,w6:66,prior:75},
    {c:'BIOL 1106',n:580,w6:68,prior:76},{c:'ECON 2010',n:490,w6:69,prior:72}
  ],
  gatewayStudents:2940,sections:1180,registerLines:4212,
  campaigns:{parents:{n:'Parents Weekend',spendK:10,multiple:3.1,liftK:140,commissionK:30.8,date:'Nov 7 to 8'},
             homecoming:{n:'Homecoming pop-up',salesK:186,vsLY:22}},
  arena:{firstTimeFans:214,firstFanOffer:20,receipt:11.20,points:120},
  accessInvoice:{amountM:2.44,due:'Nov 20',label:'Fall Access invoice'},
  savings:{termM:1.61,studentTo:64,spring:{access:212,market:389,save:177}},
  renewal:{score:74,digital:58,nps:64,boardDate:'Nov 12'},
  daysToPay:{before:47,after:31} /* Follett side, shown on Sales Command Center after the CFO approves */
};

/* ---------- Agent roster. Defined once, rendered by every surface. ---------- */
var AGENTS=[
  {id:'inv',n:'Invoice Reconciliation',charter:'Match invoices to Registrar census and cohort files, propose fixes',writes:'Follett billing, audit log',budget:400},
  {id:'com',n:'Commission Audit',charter:'Tie POS lines to the contract rate card, flag variance',writes:'Follett finance, audit log',budget:300},
  {id:'ret',n:'Retention Signals',charter:'Score week-6 digital access by course, aggregate only',writes:'Provost report',budget:250},
  {id:'aff',n:'Affordability',charter:'Watch repricing, opt-outs, adoption changes',writes:'Adoption review',budget:200},
  {id:'evt',n:'Event Performance',charter:'Model and track campaigns, pop-ups, game days',writes:'Campaign approvals',budget:200},
  {id:'ren',n:'Renewal',charter:'Readiness score, peer benchmarks, board summary',writes:'Board memo draft',budget:150},
  {id:'prv',n:'Private Workspace',charter:'CFO-only questions and drafts, never visible to Follett',writes:'Nothing external',budget:150},
  {id:'agr',n:'Access Growth',isNew:true,charter:'Turn adoption and faculty signals into leads, clusters and campaign plays, bottoms-up and top-down',writes:'CRM leads, campaign queue',budget:300},
  {id:'cmc',n:'Campus Commerce',isNew:true,charter:'Plan and track pop-ups, collabs, wish lists, trade-ins, alumni shelf, store-in-store, ambassador program',writes:'Event calendar, merch and POS',budget:300},
  {id:'ful',n:'Fulfillment and Services',isNew:true,charter:'Last-mile delivery, dorm setup, device bundles, delivery partner SLAs',writes:'Fulfillment queue, invoice add-ons',budget:200}
];

/* ---------- Thirteen CFO use cases. Same ids on Command Center and Teams. ---------- */
var USECASES=[
  {id:1,k:'release',n:'Release held invoices',agent:'inv',trigger:'$212K in dispute, 52% from one census date mismatch (Sep 8 vs Sep 12)',action:'Confirm census date, release 7 invoices ($110.2K)',proof:'Disputed $ falls live'},
  {id:2,k:'commission',n:'Fix commission variance',agent:'com',trigger:'Digital paid at 14%, contract says 18%, $41.8K short',action:'Request same-week credit with 4 variance lines',proof:'Variance to $0'},
  {id:3,k:'afford',n:'Protect affordability',agent:'aff',trigger:'Business opt-outs 6.1% to 11.8% after $98 to $146 repricing',action:'Open spring adoption review before Nov 14',proof:'Opt-out and $21.6K a term at risk'},
  {id:4,k:'early',n:'Early warning, no names',agent:'ret',trigger:'5 gateway courses below 70% week-6 access, 2,940 students',action:'Send course-level report to the Provost',proof:'Courses flagged, no student data sent'},
  {id:5,k:'campaign',n:'Approve campaign',agent:'evt',trigger:'Parents Weekend 3.1x on $10K',action:'Approve $10K, creative released',proof:'Modeled $140K lift, $30.8K commission'},
  {id:6,k:'renewal',n:'Renewal readiness',agent:'ren',trigger:'Score 74/100, digital 58, NPS 64, commission 15.4% vs peers 14.6%',action:'Draft board finance summary for Nov 12',proof:'Memo drafted, editable'},
  {id:7,k:'event',n:'Event proof (student tie)',agent:'evt',isNew:true,trigger:'Arena Store pop-up: 214 first-time fans, first-fan offer redemptions',action:'Compare to Homecoming pop-up ($186K, +22%), one click to repeat at the spring home opener',proof:'Pop-up card ties to the student receipt'},
  {id:8,k:'pay',n:'Pay the invoice (closing beat)',agent:'inv',isNew:true,trigger:'Net fall Access invoice $2.44M due Nov 20 after disputes cleared',action:'Approve and schedule payment',proof:'Follett days-to-pay drops (shown on Sales Command Center)'},
  {id:9,k:'ask',n:'Ask anything',agent:'prv',trigger:'Free text',action:'Answers with source chips and a zone label (Follett, University, CFO-only)',proof:'Source on every answer'},
  {id:10,k:'accessplan',n:'Access expansion proposal',agent:'agr',isNew:true,idea:'D2',trigger:'4 departments cluster on Access, peers already moved',action:'Save-students-$X proposal card, send to Provost, schedule review',proof:'Modeled student savings and Follett revenue side by side'},
  {id:11,k:'outcome',n:'Outcome proof',agent:'ret',isNew:true,idea:'D5',trigger:'Access vs non-Access cohorts, aggregate, from Institutional Research',action:'Share with Provost and board packet',proof:'Retention delta with its source and an aggregate-only label'},
  {id:12,k:'calendar',n:'Spring campus commerce calendar',agent:'cmc',isNew:true,idea:'J1 J3 J4 J5 J6 J10 D3 D6',trigger:'One card lists proposed pop-ups at games and events, an exclusive collab drop, alumni shelf slots, a trade-in charity partner, a store-in-store corner, a golf pro shop pilot, NIL items with proceeds to athletics',action:'Approve all, approve each, or comment. Writes to the event calendar',proof:'Each line shows revenue, commission to the university, and student benefit'},
  {id:13,k:'services',n:'Services add-on',agent:'ful',isNew:true,idea:'J2 J9 D4',trigger:'First-year move-in: dorm setup, delivery, a device each term as an add-on to Access',action:'Approve add-on, line appears on the next Access invoice preview',proof:'Attach rate and invoice impact shown before approval'}
];
/* Spring calendar lines for use case 12. Fictional brands only. revenue, commission to the university, and student benefit in each. */
var CALENDAR=[
  {id:'cal1',idea:'J1',n:'Game-day pop-ups at 3 home games and Parents Weekend',revK:96,commK:9.6,benefit:'Pop-up slots near gates, Wolfie routes students to the nearest one'},
  {id:'cal2',idea:'J3',n:'Campus-exclusive collab drop with a fictional brand (Harbor & Stitch)',revK:58,commK:8.7,benefit:'Exclusive item, price shown after login'},
  {id:'cal3',idea:'J5',n:'Alumni and maker shelf, 6 slots',revK:22,commK:3.3,benefit:'Alumni-owned products, proceeds support the student CPG accelerator'},
  {id:'cal4',idea:'J4',n:'Spring trade-in with a charity partner',revK:18,commK:1.8,benefit:'Store credit or Pack Points, the rest is donated'},
  {id:'cal5',idea:'J10',n:'Store-in-store: Learning Commons corner and an adulting corner',revK:14,commK:2.1,benefit:'Tutoring booking and budgeting help inside the store'},
  {id:'cal6',idea:'D6',n:'Golf Pro Shop pilot at the university course',revK:41,commK:6.2,benefit:'New venue, same merch, e-commerce and POS stack'},
  {id:'cal7',idea:'D3',n:'NIL items with proceeds returning to athletics',revK:27,commK:4.1,benefit:'Proceeds return to campus'}
];
var SERVICES={attachPct:38,firstYear:3400,perTermAdd:'$62',invoiceImpactK:78.6,lines:['Dorm setup','Last-mile delivery','Device each term'],benefit:'Move-in is one less thing for families'};
var ACCESSPLAN={clusters:['Economics','Biology','Chemistry','Business'],saveStudentsM:1.61,follettRevM:0.62,note:'Peers in the same cohort already moved to Total Access'};
var OUTCOME={access:{retention:88.4,n:'Access cohort'},non:{retention:84.1,n:'Non-Access cohort'},source:'Institutional Research, aggregate, no grades'};

/* ---------- 12 synthetic campuses, 4 regions. Northfield State must match the CFO workspace exactly. ---------- */
var REGIONS=['Northeast','Mid-Atlantic','Southeast','Great Lakes'];
var CAMPUSES=[
  {id:'nfs',n:'Northfield State',region:'Mid-Atlantic',market:'Capital Market',stores:2,enroll:24800,renew:'Aug 31, 2027',ready:74,cover:110,gm:6.4,smg:81,disp:212.0,optout:6.4,access:68,athl:5,cfo:6,prov:12,aux:21,fresh:'ok'},
  {id:'hbr',n:'Harbor Point University',region:'Northeast',market:'Coastal Market',stores:3,enroll:31200,renew:'Jun 30, 2027',ready:58,cover:94,gm:-2.1,smg:72,disp:341.5,optout:9.8,access:41,athl:94,cfo:48,prov:70,aux:31,fresh:'warn'},
  {id:'grv',n:'Granite Valley College',region:'Northeast',market:'Coastal Market',stores:1,enroll:9100,renew:'Dec 31, 2027',ready:82,cover:118,gm:8.9,smg:88,disp:46.2,optout:4.1,access:92,athl:12,cfo:9,prov:14,aux:18,fresh:'ok'},
  {id:'rdg',n:'Ridgeway State',region:'Mid-Atlantic',market:'Capital Market',stores:2,enroll:19800,renew:'Aug 31, 2028',ready:79,cover:106,gm:3.2,smg:79,disp:118.4,optout:6.9,access:74,athl:33,cfo:15,prov:40,aux:22,fresh:'ok'},
  {id:'cal',n:'Calloway University',region:'Mid-Atlantic',market:'Piedmont Market',stores:3,enroll:28400,renew:'Jan 31, 2027',ready:51,cover:89,gm:-4.6,smg:68,disp:402.7,optout:11.2,access:37,athl:102,cfo:55,prov:81,aux:44,fresh:'err'},
  {id:'bay',n:'Bayview College',region:'Mid-Atlantic',market:'Piedmont Market',stores:1,enroll:7400,renew:'May 31, 2028',ready:77,cover:103,gm:1.8,smg:84,disp:61.0,optout:5.2,access:81,athl:20,cfo:17,prov:25,aux:12,fresh:'ok'},
  {id:'mag',n:'Magnolia State',region:'Southeast',market:'Gulf Market',stores:3,enroll:33600,renew:'Jul 31, 2027',ready:63,cover:97,gm:0.9,smg:74,disp:276.3,optout:8.4,access:52,athl:61,cfo:29,prov:52,aux:38,fresh:'warn'},
  {id:'pal',n:'Palmetto Coast University',region:'Southeast',market:'Atlantic Market',stores:2,enroll:18200,renew:'Mar 31, 2028',ready:80,cover:112,gm:5.5,smg:86,disp:73.9,optout:4.8,access:86,athl:16,cfo:11,prov:19,aux:15,fresh:'ok'},
  {id:'cyp',n:'Cypress Bend College',region:'Southeast',market:'Gulf Market',stores:1,enroll:6800,renew:'Oct 31, 2027',ready:69,cover:101,gm:2.4,smg:77,disp:92.1,optout:6.1,access:63,athl:47,cfo:21,prov:33,aux:26,fresh:'ok'},
  {id:'lks',n:'Lakeshore University',region:'Great Lakes',market:'North Shore Market',stores:3,enroll:29700,renew:'Sep 30, 2027',ready:66,cover:99,gm:1.2,smg:75,disp:188.8,optout:7.7,access:58,athl:88,cfo:37,prov:58,aux:29,fresh:'warn'},
  {id:'cdf',n:'Cedar Falls State',region:'Great Lakes',market:'Prairie Market',stores:2,enroll:15600,renew:'Apr 30, 2028',ready:84,cover:114,gm:7.3,smg:90,disp:39.8,optout:3.9,access:95,athl:8,cfo:7,prov:10,aux:9,fresh:'ok'},
  {id:'irw',n:'Ironwood University',region:'Great Lakes',market:'Prairie Market',stores:2,enroll:21300,renew:'Nov 30, 2027',ready:72,cover:104,gm:2.9,smg:80,disp:104.5,optout:6.6,access:70,athl:39,cfo:24,prov:46,aux:27,fresh:'ok'}
];

/* ---------- Feeds, per Operations Control. status per campus is deterministic. ---------- */
var FEEDS=[
  {id:'reg',n:'Registrar add/drop',how:'SFTP, 1 to 4 times a day',owner:'University registrar'},
  {id:'aid',n:'Financial aid and tender',how:'CARP, near real time',owner:'University bursar'},
  {id:'pos',n:'POS nightly batch',how:'Nightly file',owner:'Follett retail'},
  {id:'cat',n:'Catalog price feed',how:'Daily API',owner:'Follett merchandising'},
  {id:'lms',n:'Learning platform clean room',how:'Aggregate, daily',owner:'University IT'},
  {id:'pub',n:'Publisher access logs',how:'Files and APIs, daily',owner:'Publisher partners'},
  {id:'smg',n:'SMG360 scores',how:'Weekly export',owner:'Follett customer experience'},
  {id:'pbi',n:'Power BI refresh',how:'Scheduled, 6 AM',owner:'Follett analytics'},
  {id:'dly',n:'Delivery partner status',isNew:true,how:'Webhook',owner:'Delivery partner'},
  {id:'trd',n:'Trade-in grading and inventory',isNew:true,how:'Store app events',owner:'Follett retail'},
  {id:'wsh',n:'Wish list and registry events',isNew:true,how:'Event stream',owner:'Follett e-commerce'},
  {id:'loy',n:'Loyalty platform events',isNew:true,how:'Event stream',owner:'Follett loyalty'},
  {id:'enr',n:'Enrichment consent changes',isNew:true,how:'Consent registry events',owner:'Follett data office'},
  {id:'ais',n:'Inbound AI shopper traffic',isNew:true,how:'Edge logs',owner:'Follett e-commerce'}
];
/* feed status by campus index: 0 ok, 1 warn, 2 error. Northfield has the late Registrar feed from the story. */
var FEEDSTAT={
  nfs:{reg:1,aid:0,pos:0,cat:0,lms:0,pub:0,smg:0,pbi:0,dly:0,trd:0,wsh:0,loy:0,enr:0,ais:0},
  hbr:{reg:1,aid:0,pos:0,cat:1,lms:0,pub:0,smg:0,pbi:0,dly:1,trd:0,wsh:0,loy:0,enr:0,ais:0},
  grv:{reg:0,aid:0,pos:0,cat:0,lms:0,pub:0,smg:0,pbi:0,dly:0,trd:0,wsh:0,loy:0,enr:0,ais:0},
  rdg:{reg:0,aid:0,pos:0,cat:0,lms:1,pub:0,smg:0,pbi:0,dly:0,trd:0,wsh:0,loy:0,enr:0,ais:0},
  cal:{reg:2,aid:1,pos:0,cat:0,lms:2,pub:1,smg:0,pbi:0,dly:0,trd:1,wsh:0,loy:0,enr:0,ais:1},
  bay:{reg:0,aid:0,pos:0,cat:0,lms:0,pub:0,smg:0,pbi:0,dly:0,trd:0,wsh:0,loy:0,enr:0,ais:0},
  mag:{reg:1,aid:0,pos:1,cat:0,lms:0,pub:1,smg:0,pbi:0,dly:0,trd:0,wsh:0,loy:0,enr:0,ais:0},
  pal:{reg:0,aid:0,pos:0,cat:0,lms:0,pub:0,smg:0,pbi:0,dly:0,trd:0,wsh:0,loy:0,enr:0,ais:0},
  cyp:{reg:0,aid:1,pos:0,cat:0,lms:0,pub:0,smg:0,pbi:0,dly:0,trd:0,wsh:0,loy:0,enr:0,ais:0},
  lks:{reg:1,aid:0,pos:0,cat:0,lms:0,pub:0,smg:1,pbi:0,dly:1,trd:0,wsh:0,loy:0,enr:0,ais:0},
  cdf:{reg:0,aid:0,pos:0,cat:0,lms:0,pub:0,smg:0,pbi:0,dly:0,trd:0,wsh:0,loy:0,enr:0,ais:0},
  irw:{reg:0,aid:0,pos:0,cat:0,lms:0,pub:1,smg:0,pbi:0,dly:0,trd:0,wsh:0,loy:0,enr:0,ais:0}
};

/* ---------- Process maps for Operations Control. Cases in flight, dwell, SLA breaches. ---------- */
var PROCESSES=[
  {id:'acc',n:'Access invoice cycle',steps:['Adoption','Provisioning','Census','Invoice','Dispute','Cash'],stuck:2,cases:[212,188,141,96,14,3],dwellDays:[4,6,11,3,9,31],sla:[0,0,3,0,2,1],note:'Northfield State is stuck at census: the Registrar feed arrived four hours late and 104 students differ between enrollment and billing.'},
  {id:'adr',n:'Add/drop census reconciliation',steps:['File received','Matched to billing','Differences found','Fix proposed','Approved','Posted'],stuck:2,cases:[12,12,9,7,4,4],dwellDays:[0.2,0.5,2.4,0.8,1.2,0.3],sla:[0,0,2,0,0,0]},
  {id:'cmt',n:'Commission tie-out to statement',steps:['POS lines','Rate card match','Variance','Credit request','Statement'],stuck:2,cases:[4212,4212,4,4,1],dwellDays:[1,0.5,3,5,2],sla:[0,0,1,1,0]},
  {id:'onb',n:'New campus Access onboarding',steps:['Agreement','Data mapping','Pilot','Rollout','Steady state'],stuck:1,cases:[3,3,2,1,0],dwellDays:[18,52,34,29,0],sla:[0,2,1,0,0],note:'Today 90 to 180 days. The target of weeks is an assumed aspiration.'},
  {id:'wsh',n:'Wish list to dorm delivery',steps:['List built','Family pays','Picked','In transit','Delivered'],stuck:3,cases:[340,298,271,64,207],dwellDays:[2,1,1.5,2.2,0.3],sla:[0,0,0,11,0]},
  {id:'trd',n:'Trade-in to grading, resale or donation',steps:['Intake','Grading','Credit issued','Resale','Donation'],stuck:1,cases:[184,121,99,57,42],dwellDays:[0.2,3.1,0.4,6,5],sla:[0,8,0,0,0]},
  {id:'led',n:'Lead to Access proposal to signed campus',steps:['Lead','Cluster found','Proposal','Review','Signed'],stuck:3,cases:[96,41,17,9,3],dwellDays:[3,6,12,21,0],sla:[0,0,1,4,0]}
];
/* an exception queue entry per stuck step: two sources that disagree */
var EXCEPTIONS=[
  {id:'ex1',proc:'acc',campus:'nfs',a:'Registrar census file: Sep 12',b:'Billing census date: Sep 8',evidence:'104 students differ between enrollment and billing, 7 invoices ($110.2K) held',fix:'Confirm Sep 12 as the census date and release 7 invoices',owner:'Invoice Reconciliation',learn:'Use the Registrar census date when the two disagree and the file is newer than 24 hours'},
  {id:'ex2',proc:'wsh',campus:'lks',a:'Delivery partner: 11 packages in transit past SLA',b:'Dorm hall receiving: not scanned in',evidence:'Move-in week, 3 residence halls',fix:'Reroute to the hall front desk and notify families',owner:'Fulfillment and Services',learn:'Reroute to the front desk after 24 hours past SLA'},
  {id:'ex3',proc:'trd',campus:'hbr',a:'Grading queue: 8 items past SLA',b:'Credit already shown to students',evidence:'Credit issued before grading finished',fix:'Hold credit until grading, auto-notify students',owner:'Campus Commerce',learn:'Issue credit only after grading status is final'},
  {id:'ex4',proc:'led',campus:'mag',a:'Proposal draft ready: 4 departments',b:'Provost review: 21 days waiting',evidence:'Two follow-ups sent, no reply',fix:'Send a one-page savings summary and book a 20 minute review',owner:'Access Growth',learn:'Lead with the savings summary after 14 days of silence'}
];
/* consumption units by campus x agent for the current month. Totals are derived from this one matrix so tables reconcile. */
var CONSUME={
  nfs:{inv:372,com:268,ret:204,aff:151,evt:176,ren:104,prv:92,agr:188,cmc:141,ful:97},
  hbr:{inv:391,com:233,ret:137,aff:182,evt:121,ren:118,prv:63,agr:241,cmc:96,ful:84},
  grv:{inv:121,com:96,ret:118,aff:64,evt:88,ren:41,prv:30,agr:57,cmc:71,ful:36},
  rdg:{inv:204,com:168,ret:141,aff:92,evt:107,ren:67,prv:54,agr:104,cmc:88,ful:51},
  cal:{inv:446,com:301,ret:221,aff:208,evt:94,ren:144,prv:41,agr:262,cmc:63,ful:74},
  bay:{inv:88,com:71,ret:66,aff:41,evt:52,ren:33,prv:22,agr:49,cmc:38,ful:21},
  mag:{inv:318,com:244,ret:176,aff:157,evt:139,ren:96,prv:70,agr:197,cmc:117,ful:92},
  pal:{inv:162,com:131,ret:128,aff:79,evt:111,ren:60,prv:44,agr:93,cmc:102,ful:61},
  cyp:{inv:97,com:79,ret:71,aff:52,evt:46,ren:35,prv:25,agr:58,cmc:40,ful:27},
  lks:{inv:344,com:262,ret:190,aff:166,evt:158,ren:101,prv:66,agr:211,cmc:132,ful:122},
  cdf:{inv:109,com:92,ret:94,aff:48,evt:76,ren:44,prv:31,agr:62,cmc:64,ful:38},
  irw:{inv:187,com:142,ret:118,aff:86,evt:97,ren:59,prv:46,agr:96,cmc:79,ful:55}
};
var VALUE={ /* per resolved item, placeholder prices and units, Assumed */
  unitPrice:0.42, /* $ per consumption unit, Assumed */
  hoursPerItem:0.9,
  models:[
    {id:'incl',n:'Included with Access',desc:'No separate fee. Cost is folded into the Access price.'},
    {id:'tier',n:'Per-campus platform tier',desc:'Flat monthly tier by campus size.'},
    {id:'cons',n:'Consumption-based',desc:'Units used times the unit price.'},
    {id:'out',n:'Outcome-linked',desc:'Fee tied to dollars released and hours saved.'},
    {id:'spon',n:'Co-funded by sponsors',desc:'Brand sponsors cover part of the usage.'}
  ]
};

/* ---------- The 17 ideas (J1 to J10, D1 to D7). Status uses the site legend. ---------- */
var STATUS={have:'Have today',upg:'Needs upgrade',uni:'Needs university agreement',neu:'New initiative',opt:'Student opt-in only'};
var IDEAS=[
  {id:'J1',n:'Game-day and campus event pop-ups',beat:'Extends beat 5',status:'have',lens:{s:1,c:1,g:1},student:'Pop-up slots near gates, tailgates and Parents Weekend. Wolfie routes to the nearest.',cfo:'Spring pop-up calendar approval (use case 12)',gvp:'Pop-up ROI vs last year by campus',guard:'Event POS history exists. Venue slots need university agreement.'},
  {id:'J2',n:'Dorm wish lists',beat:'Beat 0',status:'neu',lens:{s:1,c:1,g:1},student:'Student builds a list, family claims and pays, it is delivered to the dorm. Generic registry look.',cfo:'First-year attach rate (use case 13), aggregate',gvp:'Wish list to delivery process map',guard:'Payers are Follett customers. Student opt-in.'},
  {id:'J3',n:'Gen-Z brand and campus collabs',beat:'Beat 5b',status:'neu',lens:{s:1,c:1,g:1},student:'Campus-exclusive drop from a fictional brand. Price shown after login.',cfo:'Collab commission and exclusivity calendar (use case 12)',gvp:'Collab sell-through by campus',guard:'Licensing and campus marks. Fictional brands only in the demo.'},
  {id:'J4',n:'Trade-in and resale',beat:'Beat 6b',status:'neu',lens:{s:1,c:1,g:1},student:'Credit as Pack Points or store credit. Best pieces resold, the rest donated.',cfo:'Sustainability and charity line, charity partner approval',gvp:'Trade-in volume, grading queue, resale margin',guard:'Needs POS credit, grading and a donation partner per campus.'},
  {id:'J5',n:'Alumni and maker shelf',beat:'Beat 5b',status:'neu',lens:{s:1,c:1,g:1},student:'"New this month: alumni-owned."',cfo:'Shelf partner approvals, link to the advancement office',gvp:'Shelf slots by store, vendor onboarding',guard:'Dropship take rate is assumed.'},
  {id:'J6',n:'Student influencer and marketing program',beat:'Existing ambassador flow',status:'opt',lens:{s:1,c:1,g:1},student:'Ambassador flow with a quarterly plan scorecard: engagement, traffic, transactions.',cfo:'Program card, certifications earned',gvp:'Program results by campus',guard:'Student opt-in. Brand and compliance review. Figures are synthetic.'},
  {id:'J7',n:'Four-year gamified loyalty',beat:'Existing Pack Points',status:'upg',lens:{s:1,c:1,g:1},student:'Year tiers across 2 or 4 years, tied to Earn Your Colors.',cfo:'Loyalty cost vs lift panel',gvp:'Enrollment and tier mix by campus',guard:'Loyalty platform rebuild in progress.'},
  {id:'J8',n:'Alumni of the Year, cross-school',beat:'Epilogue',status:'uni',lens:{s:1,c:0,g:1},student:'Cross-school leaderboard only Follett can run.',cfo:'Alumni engagement counts',gvp:'Network view across campuses in Sales Command Center',guard:'Needs university agreement for alumni lists.'},
  {id:'J9',n:'Last-mile delivery',beat:'Beats 0 and 5',status:'neu',lens:{s:1,c:1,g:1},student:'Delivered to the dorm or seat. A generic delivery partner.',cfo:'Delivery fee and services lines',gvp:'Partner feed and SLA in Operations Control',guard:'New. Generic partner, no brand.'},
  {id:'J10',n:'Store-in-store',beat:'Beat 1',status:'neu',lens:{s:1,c:1,g:1},student:'Tutoring booking becomes a Learning Commons corner in the store, plus an adulting corner.',cfo:'Partner revenue share',gvp:'Slot map by store and partner results',guard:'Partner contracts per campus.'},
  {id:'D1',n:'Supercharge first-party data',beat:'Consent passport',status:'opt',lens:{s:1,c:1,g:1},student:'The consent passport gains an enrichment step: degree, graduation year, interests. Loyalty is the way it is collected.',cfo:'"Enriched with consent" zone, aggregate coverage',gvp:'Enrichment coverage by campus, anonymized segment export only',guard:'Never from FERPA records. Anonymized segments only. Flag for legal.'},
  {id:'D2',n:'Access go-to-market engine',beat:'Beat 6',status:'upg',lens:{s:1,c:1,g:1},student:'Bottoms-up campaign with an aggregate peer signal, never individuals.',cfo:'Save-students-$X proposal (use case 10)',gvp:'Access Growth Console: leads, clusters, campus rollups, plays',guard:'Adoption and SIS feeds exist. Lead activation needs an upgrade.'},
  {id:'D3',n:'NIL beyond jerseys',beat:'Beat 5b',status:'uni',lens:{s:1,c:1,g:1},student:'Label: proceeds return to campus.',cfo:'NIL line on the ledger, flow to athletics',gvp:'NIL eligibility by campus',guard:'Athletics contracts vary by campus.'},
  {id:'D4',n:'Campus services beyond the bookstore',beat:'Beat 0',status:'neu',lens:{s:1,c:1,g:1},student:'Dorm setup and a device each term, bundled with Access.',cfo:'Services add-on on the Access invoice (use case 13)',gvp:'Services attach rate, dorm setup process map',guard:'New. Vendor management is a Follett strength.'},
  {id:'D5',n:'Student achievement',beat:'Beats 1 and 2 extended',status:'uni',lens:{s:1,c:1,g:1},student:'Completion nudges, tutoring, study group.',cfo:'Outcome proof, Access vs non-Access cohorts (use case 11)',gvp:'Outcome-linked model in consumption',guard:'Outcomes arrive in aggregate from Institutional Research. No grades.'},
  {id:'D6',n:'Retail operator beyond books',beat:'Beat 5',status:'neu',lens:{s:1,c:1,g:1},student:'The Arena Store is already a non-bookstore venue. Add a Golf Pro Shop pilot.',cfo:'Venue proposals inside use case 12',gvp:'New venue types whitespace map',guard:'Same stack: merch, lease operation, e-commerce, transactions.'},
  {id:'D7',n:'AI and commerce',beat:'Beat 6c',status:'neu',lens:{s:1,c:1,g:1},student:'Wolfie compares sellers for the student and picks Access, $212 vs $389.',cfo:'Price integrity card only',gvp:'Agent Commerce monitor: inbound AI shopper traffic, verified-student pricing, price parity',guard:'Highest trust risk. Fictional examples only.'}
];
var BEATS=[
  {id:'b0',n:'Beat 0: Before day one (August)',ideas:['J2','J9','D4'],optional:true},
  {id:'b1',n:'Beat 1: The nudge',ideas:['J10','D5'],optional:false},
  {id:'b2',n:'Beat 2: Trust over time',ideas:['D1','D5','J7'],optional:false},
  {id:'b3',n:'Beat 3: Community',ideas:['J6'],optional:false},
  {id:'b4',n:'Beat 4: First game',ideas:['J1'],optional:false},
  {id:'b5',n:'Beat 5: Arena Store pop-up',ideas:['D6','J1'],optional:false},
  {id:'b5b',n:'Beat 5b: Pop-up menu grows',ideas:['J1','J3','J5','D3'],optional:true},
  {id:'b6',n:'Beat 6: Next morning',ideas:['D2'],optional:false},
  {id:'b6b',n:'Beat 6b: Spring clean',ideas:['J4'],optional:true},
  {id:'b6c',n:'Beat 6c: Wolfie shops for you',ideas:['D7','D2'],optional:true},
  {id:'ep',n:'Epilogue: Class of 2030',ideas:['J7','J8'],optional:true}
];

/* ---------- Group-level derived numbers, always computed from the arrays above ---------- */
function sum(a,f){return a.reduce(function(t,x){return t+f(x)},0)}
var DERIVED={
  campusUnits:function(id){var m=CONSUME[id];return sum(Object.keys(m),function(k){return m[k]})},
  agentUnits:function(aid){return sum(CAMPUSES,function(c){return CONSUME[c.id][aid]})},
  totalUnits:function(){var t=0;CAMPUSES.forEach(function(c){t+=DERIVED.campusUnits(c.id)});return t},
  disputedTotal:function(){return sum(NF.disputes.causes,function(c){return c.amt})},
  gatewayDrop:function(g){return g.prior-g.w6},
  gatewayDrops:function(){return NF.gateway.map(function(g){return g.prior-g.w6})},
  gatewayRange:function(){var d=DERIVED.gatewayDrops();return {min:Math.min.apply(null,d),max:Math.max.apply(null,d)}},
  savings:function(){return NF.savings.termM}
};

/* ---------- Cross-surface bus. State is shared by localStorage and BroadcastChannel (same origin), with a window.postMessage relay as a fallback. ---------- */
var KEY='campusos.state.v1';
var DEFAULT={released:false,commissionCredit:false,adoptionReview:false,provostReport:false,campaign:false,memo:false,accessPaid:false,accessPlan:false,outcome:false,calendar:{},services:false,eventRepeat:false,invoiceDispute:null,reconRequested:false,reconDone:false,tasks:[],delegations:[],decisions:[],todayDec:{},log:[]};
var listeners=[],chan=null;
function load(){try{var s=localStorage.getItem(KEY);return s?Object.assign({},DEFAULT,JSON.parse(s)):JSON.parse(JSON.stringify(DEFAULT))}catch(e){return JSON.parse(JSON.stringify(DEFAULT))}}
var state=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function notify(type,payload,remote){listeners.forEach(function(f){try{f(type,payload,state,!!remote)}catch(e){}})}
try{chan=new BroadcastChannel('campusos')}catch(e){}
if(chan)chan.onmessage=function(m){if(!m.data)return;state=m.data.state;notify(m.data.type,m.data.payload,true)};
window.addEventListener('storage',function(e){if(e.key===KEY){state=load();notify('sync',null,true)}});
window.addEventListener('message',function(e){var d=e.data;if(d&&d.campusos&&d.state){state=d.state;notify(d.type,d.payload,true)}});
var Bus={
  state:function(){return state},
  /* set a key and tell every other surface. surface is a short label for the audit log. */
  set:function(k,v,surface,desc){state[k]=v;if(desc)state.log=[{t:Date.now(),surface:surface||'',what:desc}].concat(state.log).slice(0,60);save();var msg={campusos:1,type:k,payload:v,state:state};
    if(chan)try{chan.postMessage({type:k,payload:v,state:state})}catch(e){}
    try{if(window.parent&&window.parent!==window)window.parent.postMessage(msg,'*');for(var i=0;i<window.frames.length;i++)window.frames[i].postMessage(msg,'*')}catch(e){}
    notify(k,v,false)},
  on:function(f){listeners.push(f)},
  reset:function(){state=JSON.parse(JSON.stringify(DEFAULT));save();if(chan)try{chan.postMessage({type:'reset',payload:null,state:state})}catch(e){}notify('reset',null,false)}
};

/* derived live values that depend on bus state: use these so every surface agrees */
Bus.live={
  disputed:function(){var s=state;var t=NF.disputes.total;if(s.released)t-=NF.disputes.causes[0].amt;return Math.round(t*10)/10},
  disputedCount:function(){return NF.disputes.count-(state.released?NF.disputes.causes[0].inv:0)},
  commissionVariance:function(){return state.commissionCredit?0:NF.commission.shortK},
  daysToPay:function(){return state.accessPaid?NF.daysToPay.after:NF.daysToPay.before},
  /* one status for the Fall Access invoice, read by the CFO Today tab and the Sales Command Center */
  invoiceStatus:function(){var s=state;return s.accessPaid?'approved':s.invoiceDispute?'disputed':s.reconDone?'reconciled':s.reconRequested?'reconciliation':'open'}
};
/* decision log and partner tasks live in shared state so both views show the same record */
Bus.logDecision=function(item,status,detail,who,surface){
  var e={t:Date.now(),who:who||NF.cfo.name,item:item,status:status,detail:detail||''};
  Bus.set('decisions',[e].concat(state.decisions||[]).slice(0,40),surface||'Command Center',status+': '+item+(detail?' ('+detail+')':''))};
Bus.addTask=function(title,owner,due,kind,surface){
  var t={id:'t'+Date.now(),title:title,owner:owner,due:due,kind:kind||'',status:'open'};
  Bus.set('tasks',(state.tasks||[]).concat([t]),surface||'Command Center','Task created for '+owner+': '+title)};

window.CAMPUS_DATA={NF:NF,AGENTS:AGENTS,USECASES:USECASES,CALENDAR:CALENDAR,SERVICES:SERVICES,ACCESSPLAN:ACCESSPLAN,OUTCOME:OUTCOME,
  REGIONS:REGIONS,CAMPUSES:CAMPUSES,FEEDS:FEEDS,FEEDSTAT:FEEDSTAT,PROCESSES:PROCESSES,EXCEPTIONS:EXCEPTIONS,CONSUME:CONSUME,VALUE:VALUE,
  STATUS:STATUS,IDEAS:IDEAS,BEATS:BEATS,DERIVED:DERIVED,K:K,
  TOKENS:{maroon:'#7a1f2b',gold:'#e3a72f',teal:'#1f7a6d',ink:'#14171c'},
  FOOTER:'Illustrative simulation. Synthetic data.'};
window.CampusBus=Bus;
})();
