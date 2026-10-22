// Generates the Phase 1 SAMPLE content (src/data/*.json).
// All items are ORIGINAL practice items written from commonly taught rules.
// NOTHING here is marked verified:true. Each must be checked against the cited
// official source (see SOURCES.md) before the verified flag is flipped.
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = new URL('../../src/data/', import.meta.url).pathname;
mkdirSync(OUT + 'questions', { recursive: true });

const SRC_RULES = {
  sourceUrl: 'https://indiacode.nic.in',
  sourceDoc: 'Rules of the Road Regulations, 2017 / Motor Vehicles Act 1988 (original practice item - clause to be verified)',
  retrievedOn: null,
  verified: false
};
const SRC_SIGNS = {
  sourceUrl: 'https://morth.nic.in',
  sourceDoc: 'Motor Vehicles Act 1988, First Schedule (Road signs) / MoRTH (original practice item - to be verified)',
  retrievedOn: null,
  verified: false
};

// ---------------- Signs ----------------
const S = (id, category, style, shape, glyph, name, name_hi, meaning, meaning_hi, overlay) =>
  ({ id, category, style, shape, glyph, overlay, name, name_hi, meaning, meaning_hi,
     sourceDoc: SRC_SIGNS.sourceDoc, sourceUrl: SRC_SIGNS.sourceUrl, imagePlaceholder: true });

const signs = [
  S('stop','mandatory','stop','octagon','STOP','Stop','रुकें','Come to a complete halt at the stop line, then proceed only when safe.','स्टॉप लाइन पर पूरी तरह रुकें और सुरक्षित होने पर ही आगे बढ़ें।'),
  S('give-way','mandatory','giveway','inv-triangle','','Give Way','रास्ता दें','Slow down and give way to traffic on the road you are entering.','धीमे हों और जिस सड़क पर जा रहे हैं उस पर यातायात को रास्ता दें।'),
  S('no-entry','mandatory','prohibit','circle','','No Entry','प्रवेश निषेध','Vehicles must not enter from this direction.','इस दिशा से वाहनों का प्रवेश मना है।','bar'),
  S('no-parking','mandatory','prohibit','circle','P','No Parking','पार्किंग निषेध','Parking is prohibited here.','यहाँ पार्किंग मना है।','cross'),
  S('no-overtaking','mandatory','prohibit','circle','⇉','No Overtaking','ओवरटेक करना मना','Overtaking other vehicles is prohibited.','दूसरे वाहनों को ओवरटेक करना मना है।','cross'),
  S('speed-40','mandatory','prohibit','circle','40','Speed Limit 40','गति सीमा 40','Do not exceed 40 km/h.','40 किमी/घंटा से अधिक गति न रखें।'),
  S('no-horn','mandatory','prohibit','circle','♪','No Horn','हॉर्न बजाना मना','Sounding the horn is prohibited.','हॉर्न बजाना मना है।','cross'),
  S('no-u-turn','mandatory','prohibit','circle','↶','No U-Turn','यू-टर्न निषेध','U-turns are prohibited.','यू-टर्न लेना मना है।','cross'),
  S('no-right-turn','mandatory','prohibit','circle','↱','No Right Turn','दाएँ मुड़ना मना','Right turns are prohibited.','दाएँ मुड़ना मना है।','cross'),
  S('no-left-turn','mandatory','prohibit','circle','↰','No Left Turn','बाएँ मुड़ना मना','Left turns are prohibited.','बाएँ मुड़ना मना है।','cross'),
  S('ahead-only','mandatory','compulsory','circle','↑','Ahead Only','केवल सीधे','Vehicles must go straight ahead only.','वाहन केवल सीधे जाएँ।'),
  S('turn-left','mandatory','compulsory','circle','↰','Compulsory Turn Left','बाएँ मुड़ें (अनिवार्य)','Vehicles must turn left.','वाहन को बाएँ मुड़ना अनिवार्य है।'),

  S('hairpin-left','cautionary','warn','triangle','↰','Left Hairpin Bend','बाएँ तीखा मोड़','Sharp bend to the left ahead; slow down.','आगे बाएँ तीखा मोड़ है; गति धीमी करें।'),
  S('narrow-bridge','cautionary','warn','triangle','⌇','Narrow Bridge','संकरा पुल','Bridge ahead is narrow; slow down and give way if needed.','आगे संकरा पुल है; धीमे चलें और ज़रूरत हो तो रास्ता दें।'),
  S('school-ahead','cautionary','warn','triangle','🏫','School Ahead','आगे स्कूल है','School nearby; expect children, slow down.','पास में स्कूल है; बच्चों की आशंका, धीमे चलें।'),
  S('pedestrian-crossing','cautionary','warn','triangle','🚶','Pedestrian Crossing','पैदल पारपथ','Pedestrian crossing ahead; be ready to stop.','आगे पैदल पारपथ है; रुकने के लिए तैयार रहें।'),
  S('men-at-work','cautionary','warn','triangle','⚒','Men at Work','काम चालू है','Road works ahead; slow down and be careful.','आगे सड़क का काम चल रहा है; सावधानी से धीमे चलें।'),
  S('cattle','cattle'.length ? 'cautionary':'cautionary','warn','triangle','🐄','Cattle','मवेशी','Animals may be on the road; slow down.','सड़क पर पशु हो सकते हैं; धीमे चलें।'),
  S('slippery-road','cautionary','warn','triangle','≈','Slippery Road','फिसलन भरी सड़क','Road may be slippery; reduce speed, avoid sudden braking.','सड़क फिसलन भरी हो सकती है; गति कम करें, अचानक ब्रेक न लगाएँ।'),
  S('roundabout','cautionary','warn','triangle','⟳','Roundabout','गोलचक्कर','Roundabout ahead; slow down and give way to traffic already on it.','आगे गोलचक्कर है; धीमे हों और उस पर पहले से चल रहे यातायात को रास्ता दें।'),
  S('t-junction','cautionary','warn','triangle','⊤','T-Junction','टी-चौराहा','Road ends at a T-junction ahead.','आगे सड़क टी-चौराहे पर समाप्त होती है।'),

  S('parking','informatory','info','rect','P','Parking','पार्किंग','A designated parking place.','यह निर्धारित पार्किंग स्थान है।'),
  S('hospital','informatory','info','rect','H','Hospital','अस्पताल','A hospital is nearby; drive quietly, avoid horn.','पास में अस्पताल है; शांति से चलाएँ, हॉर्न न बजाएँ।'),
  S('petrol-pump','informatory','info','rect','⛽','Petrol Pump','पेट्रोल पंप','Fuel station ahead.','आगे ईंधन स्टेशन है।'),
  S('first-aid','informatory','info','rect','✚','First Aid Post','प्राथमिक उपचार केंद्र','First aid is available here.','यहाँ प्राथमिक उपचार उपलब्ध है।'),
  S('telephone','informatory','info','rect','☎','Telephone','टेलीफोन','A public telephone is available.','यहाँ सार्वजनिक टेलीफोन उपलब्ध है।'),
  S('eating-place','informatory','info','rect','🍴','Eating Place','भोजनालय','Food is available nearby.','पास में भोजन उपलब्ध है।'),
  S('resting-place','informatory','info','rect','🛏','Resting Place','विश्राम स्थल','A place to rest is nearby.','पास में विश्राम स्थल है।')
];
writeFileSync(OUT + 'signs.json', JSON.stringify(signs, null, 1));

// ---------------- Units ----------------
const L = (id, title, title_hi, checkpoint = false) => ({ id, title, title_hi, checkpoint, perSession: checkpoint ? 10 : 8 });
const units = [
  { id: 'signs', title: 'Road Signs', title_hi: 'सड़क चिह्न', icon: '🛑', color: '#0f9d94', available: true,
    lessons: [L('signs-1','Mandatory signs','अनिवार्य चिह्न'), L('signs-2','Cautionary signs','सावधानी चिह्न'), L('signs-3','Informatory signs','सूचना चिह्न'), L('signs-cp','Unit checkpoint','यूनिट चेकपॉइंट',true)] },
  { id: 'row', title: 'Right of Way', title_hi: 'रास्ते का अधिकार', icon: '🔀', color: '#f5a000', available: true,
    lessons: [L('row-1','Junctions & roundabouts','चौराहे और गोलचक्कर'), L('row-2','Pedestrians & crossings','पैदल यात्री और क्रॉसिंग'), L('row-3','Overtaking & emergencies','ओवरटेकिंग और आपातकाल'), L('row-cp','Unit checkpoint','यूनिट चेकपॉइंट',true)] },
  { id: 'signals', title: 'Signals & Markings', title_hi: 'संकेत और मार्किंग', icon: '🚦', color: '#e0566b', available: true,
    lessons: [L('sig-1','Hand signals & indicators','हाथ के संकेत'), L('sig-2','Road markings','सड़क की मार्किंग'), L('sig-3','Traffic lights, lamps & horn','ट्रैफिक लाइट, लाइट और हॉर्न'), L('sig-cp','Unit checkpoint','यूनिट चेकपॉइंट',true)] },
  ...[
    ['speed','Speed & Overtaking','गति और ओवरटेकिंग','🏎'],['parking','Parking','पार्किंग','🅿'],['docs','Documents & Insurance','दस्तावेज़ और बीमा','📄'],
    ['fines','Fines & Penalties','जुर्माने और दंड','💸'],['safe','Safe Driving','सुरक्षित ड्राइविंग','🛡'],['firstaid','First Aid & Accidents','प्राथमिक उपचार और दुर्घटना','⛑'],['vehicle','Vehicle Basics','वाहन की बुनियादी बातें','🔧']
  ].map(([id,title,title_hi,icon]) => ({ id, title, title_hi, icon, color: '#7a8b94', available: false, lessons: [] }))
];
writeFileSync(OUT + 'units.json', JSON.stringify(units, null, 1));

// ---------------- Questions ----------------
const byUnit = { signs: [], row: [], signals: [] };
const counters = {};
const TF = ['True', 'False'], TF_HI = ['सही', 'गलत'];

function add(unit, lessonId, topic, q) {
  counters[unit] = (counters[unit] || 0) + 1;
  const id = `q-${unit}-${String(counters[unit]).padStart(3, '0')}`;
  byUnit[unit].push({
    id, topic, unit, lessonId, type: q.type, difficulty: q.difficulty ?? 1,
    question: q.question, options: q.options, correctAnswer: q.correctAnswer,
    ...(q.pairs ? { pairs: q.pairs } : {}),
    explanation: q.explanation, ...(q.imageRef ? { imageRef: q.imageRef } : {}),
    languages: q.hi ? { en: { question: q.question, options: q.options, explanation: q.explanation }, hi: q.hi } : { en: { question: q.question, options: q.options, explanation: q.explanation } },
    applicableVehicleClasses: ['all'], statesApplicable: ['all'],
    ruleRef: q.ruleRef, ...(q.src ?? SRC_RULES)
  });
}
const mcq = (unit, lesson, topic, question, options, correct, explanation, hi, ruleRef) =>
  add(unit, lesson, topic, { type: 'mcq', question, options, correctAnswer: correct, explanation, hi, ruleRef });
const tf = (unit, lesson, topic, question, truth, explanation, hi, ruleRef) =>
  add(unit, lesson, topic, { type: 'true-false', question, options: TF, correctAnswer: truth ? 0 : 1, explanation,
    hi: hi && { question: hi.question, options: TF_HI, explanation: hi.explanation }, ruleRef });

// Signs - text questions
mcq('signs','signs-1','Mandatory signs','Which shape do most mandatory (regulatory) road signs have?',['Circular','Triangular','Rectangular','Diamond'],0,'Most mandatory signs are circular with a red border. Stop (octagon) and Give Way (inverted triangle) are the main exceptions.',
  { question:'अधिकांश अनिवार्य (नियामक) चिह्न किस आकार के होते हैं?', options:['गोलाकार','त्रिकोणीय','आयताकार','समचतुर्भुज'], explanation:'अधिकांश अनिवार्य चिह्न लाल किनारे वाले गोल होते हैं। स्टॉप (अष्टभुज) और रास्ता दें (उल्टा त्रिकोण) अपवाद हैं।' }, 'MV Act 1988, First Schedule');
tf('signs','signs-1','Mandatory signs','The STOP sign is octagonal (eight-sided).',true,'STOP is the only octagonal road sign.',{question:'स्टॉप चिह्न अष्टभुजाकार (आठ भुजाओं वाला) होता है।',explanation:'स्टॉप ही एकमात्र अष्टभुजाकार चिह्न है।'});
tf('signs','signs-1','Mandatory signs','The Give Way sign is an upward-pointing triangle.',false,'The Give Way sign is an inverted (downward-pointing) triangle. Upward-pointing triangles are cautionary signs.',{question:'रास्ता दें चिह्न ऊपर की ओर नुकीला त्रिकोण होता है।',explanation:'रास्ता दें चिह्न उल्टा (नीचे की ओर नुकीला) त्रिकोण होता है। ऊपर नुकीले त्रिकोण सावधानी चिह्न होते हैं।'});
mcq('signs','signs-1','Mandatory signs','What must you do at a STOP sign?',['Slow down and continue if clear','Come to a complete halt, then go when safe','Honk and proceed','Stop only if other vehicles are present'],1,'A STOP sign requires a complete halt at the stop line every time, whether or not other traffic is visible.',
  { question:'स्टॉप चिह्न पर आपको क्या करना चाहिए?', options:['धीमे होकर रास्ता साफ हो तो निकल जाएँ','पूरी तरह रुकें, फिर सुरक्षित होने पर चलें','हॉर्न बजाकर निकल जाएँ','केवल तभी रुकें जब दूसरे वाहन हों'], explanation:'स्टॉप चिह्न पर हर बार स्टॉप लाइन पर पूरी तरह रुकना आवश्यक है, चाहे दूसरा यातायात दिखे या नहीं।' });
mcq('signs','signs-1','Mandatory signs','A "Speed Limit 40" sign tells you that:',['40 km/h is the minimum speed','40 km/h is the maximum speed','40 km/h is the recommended speed only','The road ends in 40 metres'],1,'A speed limit sign gives the maximum permitted speed.');
tf('signs','signs-1','Mandatory signs','A No Entry sign means vehicles must not enter from that direction.',true,'No Entry prohibits vehicles from entering the road from the direction of the sign.');
mcq('signs','signs-1','Mandatory signs','What does a circular sign with a red cross over an arrow pair indicate?',['Overtaking is allowed','Overtaking is prohibited','Two-way traffic ahead','Parking ahead'],1,'The No Overtaking sign prohibits overtaking other vehicles.');
mcq('signs','signs-1','Mandatory signs','A blue circular sign with a white arrow pointing up means:',['Go straight ahead only','Road ends ahead','Speed limit','One-way road ends'],0,'Blue circular signs are compulsory instructions; the up arrow is "Ahead Only".');

mcq('signs','signs-2','Cautionary signs','Cautionary (warning) signs are usually which shape?',['Circular','Triangular with point upward','Octagonal','Square'],1,'Cautionary signs warn of hazards and are generally upward-pointing triangles with a red border.',
  { question:'सावधानी (चेतावनी) चिह्न आमतौर पर किस आकार के होते हैं?', options:['गोलाकार','ऊपर की ओर नुकीला त्रिकोण','अष्टभुज','वर्गाकार'], explanation:'सावधानी चिह्न खतरे की चेतावनी देते हैं और आमतौर पर लाल किनारे वाले, ऊपर नुकीले त्रिकोण होते हैं।' });
mcq('signs','signs-2','Cautionary signs','You see a "School Ahead" sign. You should:',['Maintain speed','Slow down and be ready to stop','Sound the horn continuously','Overtake quickly'],1,'Near schools children may enter the road suddenly; reduce speed and be ready to stop.');
mcq('signs','signs-2','Cautionary signs','A "Slippery Road" sign warns you to:',['Reduce speed and avoid sudden braking','Increase speed','Use high beam','Stop immediately'],0,'On slippery surfaces sudden braking or steering can cause skidding.');
tf('signs','signs-2','Cautionary signs','A "Cattle" sign means animals may be crossing, so you should slow down.',true,'Cattle signs warn that animals may be on or crossing the road.');
mcq('signs','signs-2','Cautionary signs','A "Narrow Bridge" sign means:',['Bridge is closed','Bridge ahead is narrow; slow down and give way if required','Only two-wheelers allowed','Speed up to cross quickly'],1,'Slow down and be ready to give way to oncoming vehicles on narrow bridges.');
tf('signs','signs-2','Cautionary signs','A "Men at Work" sign means you may drive at normal speed.',false,'Road works are hazardous: slow down and follow any instructions of workers.');

mcq('signs','signs-3','Informatory signs','Informatory signs are generally which shape?',['Rectangular','Triangular','Circular','Octagonal'],0,'Informatory signs give information such as parking, hospitals and fuel and are generally rectangular.');
mcq('signs','signs-3','Informatory signs','A rectangular sign with a white "P" on blue indicates:',['No parking','Parking place','Police post','Petrol pump'],1,'A white "P" on blue marks a place where parking is permitted.');
tf('signs','signs-3','Informatory signs','Near a hospital sign you should avoid unnecessary use of the horn.',true,'Hospitals are silence zones; avoid honking.');
mcq('signs','signs-3','Informatory signs','Which sign tells you that medical help is available nearby?',['First Aid Post','Resting Place','Eating Place','Telephone'],0,'The First Aid Post sign shows where basic medical help is available.');

// Right of way
mcq('row','row-1','Junctions','In India vehicles are driven on which side of the road?',['Left','Right','Centre','Either'],0,'India follows left-hand traffic: keep to the left.',
  { question:'भारत में वाहन सड़क के किस ओर चलाए जाते हैं?', options:['बाईं ओर','दाईं ओर','बीच में','किसी भी ओर'], explanation:'भारत में बाएँ हाथ का यातायात है: बाईं ओर चलें।' });
mcq('row','row-1','Roundabouts','At a roundabout you should give way to:',['Traffic already on the roundabout','Traffic entering after you','Only buses','Nobody'],0,'Traffic already circulating has priority; give way before entering.',
  { question:'गोलचक्कर पर आपको किसे रास्ता देना चाहिए?', options:['गोलचक्कर पर पहले से चल रहे यातायात को','आपके बाद प्रवेश करने वाले को','केवल बसों को','किसी को नहीं'], explanation:'पहले से चल रहे यातायात की प्राथमिकता होती है; प्रवेश से पहले रास्ता दें।' }, 'Rules of the Road Regulations 2017 - roundabouts');
mcq('row','row-1','Junctions','You are on a minor road joining a main road. You should:',['Give way to traffic on the main road','Expect the main road to give way','Speed up and merge','Stop only at night'],0,'Traffic on the main road has priority over vehicles joining from a minor road.');
mcq('row','row-1','Junctions','When turning right at a junction, you must give way to:',['Oncoming traffic going straight','Nobody','Only pedestrians','Vehicles behind you'],0,'Oncoming traffic going straight ahead has priority over a vehicle turning across its path.');
tf('row','row-1','Hills','On a narrow hill road, the vehicle going downhill should give way to the vehicle going uphill.',true,'The uphill vehicle has more difficulty restarting, so the descending vehicle should give way.');
tf('row','row-1','Junctions','You may enter a junction even if your exit is blocked and you would obstruct cross traffic.',false,'Do not enter a junction unless your exit is clear, to avoid blocking other traffic.');
mcq('row','row-1','Junctions','At an unmarked crossing where two roads of equal importance meet, the safest approach is to:',['Slow down, look both ways and give way as required','Honk and go','Accelerate','Stop and wait for the other to leave without looking'],0,'Approach slowly, observe, and give way as required by the rules and traffic conditions.');

mcq('row','row-2','Pedestrians','A pedestrian is crossing at a zebra crossing. You should:',['Stop and let them cross','Honk to hurry them','Drive around quickly','Flash headlights and proceed'],0,'Pedestrians on a zebra crossing have priority; stop and give way.',
  { question:'ज़ेब्रा क्रॉसिंग पर एक पैदल यात्री सड़क पार कर रहा है। आपको क्या करना चाहिए?', options:['रुककर उसे पार करने दें','उसे जल्दी करने के लिए हॉर्न बजाएँ','तेजी से बगल से निकल जाएँ','लाइट चमकाकर आगे बढ़ें'], explanation:'ज़ेब्रा क्रॉसिंग पर पैदल यात्री को प्राथमिकता होती है; रुकें और रास्ता दें।' });
tf('row','row-2','Pedestrians','You may overtake a vehicle that has stopped at a zebra crossing to let pedestrians cross.',false,'Never overtake a vehicle stopped at a crossing; a pedestrian may be hidden from your view.');
mcq('row','row-2','Pedestrians','You see a person with a white cane waiting to cross. You should:',['Stop and give way','Honk loudly','Pass closely','Ignore'],0,'Give way to visually impaired pedestrians and give them plenty of time.');
mcq('row','row-2','Pedestrians','Near a school at closing time you should:',['Drive slowly and be ready to stop','Maintain speed','Use the horn continuously','Overtake'],0,'Children are unpredictable; slow down and be prepared to stop.');
tf('row','row-2','Pedestrians','It is permitted to park on a pedestrian crossing if you stay in the vehicle.',false,'Parking or stopping on a pedestrian crossing is not allowed; it blocks pedestrians.');
mcq('row','row-2','Pedestrians','When turning at a junction where pedestrians are crossing the road you are entering, you should:',['Give way to the pedestrians','Expect them to give way','Honk','Speed up'],0,'Pedestrians already crossing should be allowed to complete the crossing.');

mcq('row','row-3','Emergencies','An ambulance with a siren approaches from behind. You should:',['Pull to the left and let it pass','Speed up','Stay in the middle','Stop suddenly in the middle of the road'],0,'Give way to emergency vehicles by moving safely to the left and slowing or stopping if needed.',
  { question:'पीछे से सायरन बजाती एम्बुलेंस आ रही है। आपको क्या करना चाहिए?', options:['बाईं ओर होकर उसे निकलने दें','गति बढ़ाएँ','बीच सड़क पर रहें','अचानक बीच सड़क में रुकें'], explanation:'आपातकालीन वाहनों को रास्ता दें: सुरक्षित रूप से बाईं ओर होकर धीमे हों या ज़रूरत हो तो रुकें।' });
mcq('row','row-3','Overtaking','Normally you should overtake a vehicle on its:',['Right side','Left side','Either side freely','Footpath side'],0,'In left-hand traffic you normally overtake on the right, unless the vehicle ahead is turning right or other exceptions apply.');
tf('row','row-3','Overtaking','Overtaking on a curve or bend is safe if you honk.',false,'Do not overtake on bends, near crests or where your view ahead is not clear.');
tf('row','row-3','Overtaking','A driver being overtaken should not increase speed.',true,'Increasing speed makes overtaking dangerous; allow the overtaking vehicle to pass.');
mcq('row','row-3','Following','The safest way to follow another vehicle is to:',['Keep a safe distance','Stay very close','Use high beam','Honk repeatedly'],0,'A safe gap gives you time to react and stop.');
tf('row','row-3','Overtaking','You may overtake near a pedestrian crossing.',false,'Overtaking near crossings is dangerous and generally prohibited.');
mcq('row','row-3','Emergencies','A fire engine is approaching with its bell or siren. You must:',['Give way','Race it','Block the lane','Ignore it'],0,'Emergency vehicles on duty must be given priority.');

// Signals & markings
mcq('signals','sig-1','Hand signals','To signal a right turn by hand, you extend your right arm:',['Horizontally, palm facing forward','Straight down','Pointing upward','Rotating anti-clockwise'],0,'A right turn is signalled by extending the right arm horizontally out of the window.',
  { question:'हाथ से दाएँ मुड़ने का संकेत देने के लिए आप दायाँ हाथ कैसे फैलाते हैं?', options:['क्षैतिज, हथेली आगे की ओर','सीधा नीचे','ऊपर की ओर','वामावर्त घुमाते हुए'], explanation:'दाएँ मुड़ने का संकेत दायाँ हाथ खिड़की से बाहर क्षैतिज फैलाकर दिया जाता है।' }, 'Rules of the Road Regulations 2017 - signals');
mcq('signals','sig-1','Hand signals','Moving the right arm up and down signals that you intend to:',['Slow down or stop','Turn left','Turn right','Overtake'],0,'The up-and-down arm movement indicates slowing down or stopping.');
tf('signals','sig-1','Indicators','You should signal your intention in good time before turning or changing lanes.',true,'Early signalling lets others respond safely.');
tf('signals','sig-1','Indicators','Once you have turned, you can leave your indicator on for the rest of the journey.',false,'Cancel the indicator after the manoeuvre so you do not mislead other road users.');
mcq('signals','sig-1','Hand signals','An anticlockwise circular motion of the right arm signals that you intend to:',['Turn left','Turn right','Stop','Reverse'],0,'This is the traditional hand signal for a left turn.');
mcq('signals','sig-1','Indicators','Hazard (four-way) lamps should be used:',['When your vehicle is a temporary hazard, e.g. breakdown','While overtaking','At all junctions','In heavy rain only'],0,'Use hazard lights to warn others when your vehicle is stationary or obstructing traffic unavoidably.');

mcq('signals','sig-2','Markings','A solid white line along the centre of the road means:',['Do not cross it','You may cross freely','Parking allowed','Speed limit ends'],0,'A continuous centre line must not be crossed (or straddled).',
  { question:'सड़क के बीच में ठोस सफेद रेखा का अर्थ है:', options:['इसे पार न करें','इसे आराम से पार कर सकते हैं','पार्किंग की अनुमति','गति सीमा समाप्त'], explanation:'ठोस केंद्र रेखा को पार नहीं करना चाहिए।' });
mcq('signals','sig-2','Markings','A broken (dashed) white centre line means:',['You may cross it when safe','Never cross','Road is closed','Stop'],0,'A broken line may be crossed to overtake when it is safe.');
mcq('signals','sig-2','Markings','Where should you stop at a signal or stop sign with a stop line marked?',['Behind the stop line','On the line','Past the line','Anywhere'],0,'Stop behind the line so pedestrians and cross traffic are not obstructed.');
mcq('signals','sig-2','Markings','Wide white stripes across the road parallel to traffic mark a:',['Pedestrian (zebra) crossing','Parking area','Speed breaker only','Overtaking zone'],0,'This is a zebra crossing; pedestrians have priority.');
tf('signals','sig-2','Markings','You may stop on a zebra crossing if the signal ahead is red and the queue is long.',false,'Keep zebra crossings clear; stop behind the stop line.');

mcq('signals','sig-3','Traffic lights','A steady red traffic light means:',['Stop behind the stop line','Slow down','Proceed with caution','Turn left freely'],0,'Red means stop and wait behind the line.',
  { question:'ट्रैफिक लाइट में स्थिर लाल बत्ती का अर्थ है:', options:['स्टॉप लाइन के पीछे रुकें','धीमे हों','सावधानी से आगे बढ़ें','बाएँ आराम से मुड़ें'], explanation:'लाल का अर्थ है रुकें और लाइन के पीछे प्रतीक्षा करें।' });
mcq('signals','sig-3','Traffic lights','A steady amber (yellow) light means:',['Prepare to stop','Speed up','Go','Reverse'],0,'Amber warns that the signal is about to turn red; stop if you can do so safely.');
mcq('signals','sig-3','Traffic lights','A flashing amber light means:',['Proceed with caution','Stop','Speed up','Road closed'],0,'A flashing amber requires caution; give way as needed.');
tf('signals','sig-3','Lights','You should dip your headlights when meeting oncoming traffic at night.',true,'High beam can dazzle oncoming drivers.');
tf('signals','sig-3','Horn','Using the horn is permitted in silence zones near hospitals.',false,'Silence zones prohibit unnecessary horn use.');
mcq('signals','sig-3','Lights','At night, you should switch on:',['Headlamps and tail lamps','Only the indicator','Only hazard lamps','No lamps if road is lit'],0,'Use proper lighting between sunset and sunrise and in poor visibility.');

// Auto-generated sign identification + match questions
const names = (list, lang) => list.map(s => lang === 'hi' ? (s.name_hi ?? s.name) : s.name);
function pick(arr, n, seed) { const a = [...arr]; let s = seed; const out = []; while (out.length < n && a.length) { s = (s * 9301 + 49297) % 233280; out.push(a.splice(Math.floor(s / 233280 * a.length), 1)[0]); } return out; }
const lessonOfCategory = { mandatory: 'signs-1', cautionary: 'signs-2', informatory: 'signs-3' };
signs.forEach((sg, idx) => {
  const sameCat = signs.filter(x => x.category === sg.category && x.id !== sg.id);
  const others = pick(sameCat, 3, idx + 7);
  const opts = [sg, ...others];
  const shuffled = pick(opts, 4, idx + 13);
  add('signs', lessonOfCategory[sg.category], 'Sign identification', {
    type: 'sign-id', question: 'What does this sign mean?', imageRef: sg.id,
    options: shuffled.map(o => o.name), correctAnswer: shuffled.findIndex(o => o.id === sg.id),
    explanation: sg.meaning,
    hi: { question: 'यह चिह्न क्या दर्शाता है?', options: shuffled.map(o => o.name_hi ?? o.name), explanation: sg.meaning_hi ?? sg.meaning },
    src: SRC_SIGNS
  });
});
for (const [cat, lesson] of Object.entries(lessonOfCategory)) {
  const list = signs.filter(s => s.category === cat);
  for (let g = 0; g < 2; g++) {
    const grp = pick(list, 4, g * 31 + 5);
    add('signs', lesson, 'Match signs', {
      type: 'match', question: 'Match each sign to its meaning', options: [],
      pairs: grp.map(s => [`sign:${s.id}`, s.name]), correctAnswer: 'pairs',
      explanation: grp.map(s => `${s.name}: ${s.meaning}`).join(' '),
      hi: { question: 'प्रत्येक चिह्न को उसके अर्थ से मिलाएँ', explanation: grp.map(s => `${s.name_hi}: ${s.meaning_hi}`).join(' ') },
      src: SRC_SIGNS
    });
  }
}

for (const [unit, list] of Object.entries(byUnit)) writeFileSync(`${OUT}questions/${unit}.json`, JSON.stringify(list, null, 1));
console.log('questions:', Object.fromEntries(Object.entries(byUnit).map(([k, v]) => [k, v.length])), 'signs:', signs.length);

// ---------------- States ----------------
const st = (code, name, questionCount, passMark) => ({
  code, name, llTest: { questionCount, passMark, secondsPerQuestion: 30, optionsPerQuestion: 4 },
  notes: 'PLACEHOLDER values for development. Confirm the current question count, pass mark and timing on the official Parivahan/Sarathi portal before relying on them.',
  sourceUrl: 'https://sarathi.parivahan.gov.in', verified: false
});
const states = [
  st('DL','Delhi',20,12), st('MH','Maharashtra',15,9), st('KA','Karnataka',20,12), st('TN','Tamil Nadu',20,12),
  st('UP','Uttar Pradesh',20,12), st('GJ','Gujarat',15,9), st('WB','West Bengal',15,9), st('RJ','Rajasthan',20,12),
  st('TS','Telangana',20,12), st('default','Other state / UT (generic)',15,9)
];
writeFileSync(OUT + 'states.json', JSON.stringify(states, null, 1));

// ---------------- Fines (sample; unverified) ----------------
const f = (id, offence, section, penalty, vehicle='All') => ({ id, offence, section, penalty, vehicle, sourceUrl: 'https://indiacode.nic.in', verified: false });
writeFileSync(OUT + 'fines.json', JSON.stringify({
  lastUpdated: null,
  note: 'SAMPLE entries - amounts are NOT verified. Load verified figures from India Code (MV Act 1988 as amended 2019) and state notifications, then set verified:true.',
  items: [
    f('f1','Driving without a valid licence','Sec 181','See MV Act 1988 as amended (verify)'),
    f('f2','Driving without a helmet (two-wheeler)','Sec 129 / 194D','See MV Act 1988 as amended (verify)','Two-wheeler'),
    f('f3','Driving without a seat belt','Sec 194B','See MV Act 1988 as amended (verify)','Car'),
    f('f4','Over-speeding','Sec 183','See MV Act 1988 as amended (verify)'),
    f('f5','Drunken driving','Sec 185','See MV Act 1988 as amended (verify)'),
    f('f6','Driving without insurance','Sec 196','See MV Act 1988 as amended (verify)'),
    f('f7','Failing to give way to emergency vehicles','Sec 194E','See MV Act 1988 as amended (verify)')
  ]
}, null, 1));
