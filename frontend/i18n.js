// Each key: [English, Hindi, Marathi]. Any other language is translated live by the backend (/api/translate) and cached.
export const LANGS = { en:"English", hi:"हिन्दी", mr:"मराठी", bn:"বাংলা", ta:"தமிழ்", te:"తెలుగు", gu:"ગુજરાતી", kn:"ಕನ್ನಡ", ml:"മലയാളം", pa:"ਪੰਜਾਬੀ", or:"ଓଡ଼ିଆ", ur:"اردو", as:"অসমীয়া" };
const S = {
 app_tag:["Smarter preparation. Safer care.","बेहतर तैयारी। सुरक्षित इलाज।","उत्तम तयारी. सुरक्षित उपचार."],
 feat1:["Describe symptoms once, in any language. Your doctor gets a clear summary.","एक बार, किसी भी भाषा में लक्षण बताइए। डॉक्टर को साफ़ सारांश मिलता है।","एकदा, कोणत्याही भाषेत लक्षणे सांगा. डॉक्टरांना स्पष्ट सारांश मिळतो."],
 feat2:["Dangerous symptoms stop the booking and point you to emergency care.","खतरनाक लक्षण होने पर बुकिंग रुकती है और आपको आपातकालीन मदद दिखती है।","धोकादायक लक्षणे असल्यास बुकिंग थांबते आणि आणीबाणी मदत दिसते."],
 feat3:["Allergies and medicines saved once. Never repeated.","एलर्जी और दवाइयाँ एक बार सहेजें। दोबारा नहीं बतानी।","ॲलर्जी आणि औषधे एकदाच सेव्ह. पुन्हा सांगायची नाहीत."],
 signin:["Sign in","साइन इन करें","साइन इन करा"], signup:["Create account","खाता बनाएँ","खाते तयार करा"],
 email:["Email","ईमेल","ईमेल"], password:["Password (6+ characters)","पासवर्ड (6+ अक्षर)","पासवर्ड (6+ अक्षरे)"], fullname:["Full name","पूरा नाम","पूर्ण नाव"],
 i_patient:["I am a patient","मैं मरीज़ हूँ","मी रुग्ण आहे"], i_doctor:["I am a doctor","मैं डॉक्टर हूँ","मी डॉक्टर आहे"],
 spec:["Specialty","विशेषज्ञता","विशेषता"], city:["City","शहर","शहर"], fee:["Fee (₹)","फ़ीस (₹)","फी (₹)"], langs_spoken:["Languages you speak","आप जो भाषाएँ बोलते हैं","तुम्ही बोलता त्या भाषा"],
 exp:["Years of experience","अनुभव (वर्ष)","अनुभव (वर्षे)"],
 demo_patient:["Try demo patient","डेमो मरीज़ आज़माएँ","डेमो रुग्ण वापरा"], demo_doctor:["Try demo doctor","डेमो डॉक्टर आज़माएँ","डेमो डॉक्टर वापरा"], or:["or","या","किंवा"],
 signout:["Sign out","साइन आउट","साइन आउट"], auth_err:["Could not sign in. Check your details and try again.","साइन इन नहीं हो सका। विवरण जाँचकर फिर कोशिश करें।","साइन इन झाले नाही. तपशील तपासून पुन्हा प्रयत्न करा."],
 nav_home:["Home","होम","मुख्यपृष्ठ"], nav_find:["Find doctors","डॉक्टर खोजें","डॉक्टर शोधा"], nav_appts:["Appointments","अपॉइंटमेंट","अपॉइंटमेंट"],
 nav_profile:["Health profile","स्वास्थ्य प्रोफ़ाइल","आरोग्य प्रोफाइल"], nav_chat:["Assistant","सहायक","सहाय्यक"], nav_queue:["Patient queue","मरीज़ सूची","रुग्ण यादी"], nav_dprofile:["My profile","मेरी प्रोफ़ाइल","माझी प्रोफाइल"],
 sos:["SOS","SOS","SOS"], hello:["Hello, {n}","नमस्ते, {n}","नमस्कार, {n}"], home_sub:["What do you need today?","आज आपको क्या चाहिए?","आज तुम्हाला काय हवे?"],
 qa_book:["Describe symptoms and book","लक्षण बताएँ और बुक करें","लक्षणे सांगा आणि बुक करा"], qa_book_s:["Your doctor reads a summary before you arrive.","आपके आने से पहले डॉक्टर सारांश पढ़ लेते हैं।","तुम्ही येण्यापूर्वी डॉक्टर सारांश वाचतात."],
 qa_chat:["Ask the assistant","सहायक से पूछें","सहाय्यकाला विचारा"], qa_chat_s:["Which doctor? What to expect? Any language.","कौन सा डॉक्टर? क्या होगा? किसी भी भाषा में।","कोणता डॉक्टर? काय होईल? कोणत्याही भाषेत."],
 qa_prof:["Complete your health profile","स्वास्थ्य प्रोफ़ाइल पूरी करें","आरोग्य प्रोफाइल पूर्ण करा"], qa_prof_s:["Save allergies and medicines once.","एलर्जी और दवाइयाँ एक बार सहेजें।","ॲलर्जी व औषधे एकदा सेव्ह करा."],
 next_appt:["Next appointment","अगली अपॉइंटमेंट","पुढील अपॉइंटमेंट"], none_appt:["No appointments yet.","अभी कोई अपॉइंटमेंट नहीं।","अजून अपॉइंटमेंट नाही."],
 search_ph:["Search by doctor name","डॉक्टर के नाम से खोजें","डॉक्टरच्या नावाने शोधा"], all_spec:["All specialties","सभी विशेषज्ञताएँ","सर्व विशेषता"], all_city:["All cities","सभी शहर","सर्व शहरे"],
 yrs:["{n} years","{n} वर्ष","{n} वर्षे"], book:["Book","बुक करें","बुक करा"], no_docs:["No doctors match your search.","कोई डॉक्टर नहीं मिला।","कोणताही डॉक्टर सापडला नाही."],
 date:["Date","तारीख़","तारीख"], slot:["Time slot","समय","वेळ"], quickfill:["Fill with a sample patient","नमूना मरीज़ से भरें","नमुना रुग्णाने भरा"],
 q1:["Headache","सिरदर्द","डोकेदुखी"], q2:["Chest pain (Hindi)","सीने में दर्द (हिंदी)","छातीत दुखणे (हिंदी)"], q3:["Pregnancy bleeding","गर्भावस्था में रक्तस्राव","गर्भावस्थेत रक्तस्राव"],
 symptoms:["What is bothering you?","आपको क्या तकलीफ़ है?","तुम्हाला काय त्रास होतोय?"], symptoms_ph:["Describe in your own words, in any language","अपनी भाषा में, अपने शब्दों में बताइए","तुमच्या भाषेत, तुमच्या शब्दांत सांगा"],
 speak:["Speak","बोलें","बोला"], duration:["For how long?","कितने समय से?","किती दिवसांपासून?"], severity:["Severity (1 to 10)","गंभीरता (1 से 10)","तीव्रता (1 ते 10)"],
 age:["Age","उम्र","वय"], sex:["Sex","लिंग","लिंग"], female:["Female","महिला","स्त्री"], male:["Male","पुरुष","पुरुष"], other:["Other","अन्य","इतर"],
 pregnant:["I am pregnant","मैं गर्भवती हूँ","मी गर्भवती आहे"], allergies:["Allergies","एलर्जी","ॲलर्जी"], meds:["Medicines you take now","अभी ली जा रही दवाइयाँ","सध्या घेत असलेली औषधे"], history:["Past conditions or surgeries","पुरानी बीमारियाँ या ऑपरेशन","जुने आजार किंवा शस्त्रक्रिया"],
 consent:["I agree to share this health information with my doctor.","मैं यह जानकारी अपने डॉक्टर से साझा करने के लिए सहमत हूँ।","ही माहिती माझ्या डॉक्टरांना देण्यास माझी संमती आहे."],
 check_book:["Check and book","जाँचें और बुक करें","तपासा आणि बुक करा"], working:["Reading your details…","आपकी जानकारी पढ़ी जा रही है…","तुमची माहिती वाचत आहे…"],
 booked:["Booked. Your doctor will read this before you arrive.","बुक हो गया। डॉक्टर आपके आने से पहले यह पढ़ लेंगे।","बुक झाले. तुम्ही येण्यापूर्वी डॉक्टर हे वाचतील."], view_appts:["View appointments","अपॉइंटमेंट देखें","अपॉइंटमेंट पहा"],
 em_title:["Get help now. Do not wait for an appointment.","अभी मदद लें। अपॉइंटमेंट का इंतज़ार न करें।","आत्ताच मदत घ्या. अपॉइंटमेंटची वाट पाहू नका."], call112:["Call 112","112 पर कॉल करें","112 वर कॉल करा"], call108:["Call ambulance 108","एम्बुलेंस 108 बुलाएँ","रुग्णवाहिका 108 बोलवा"],
 hospitals:["Find hospitals near me","नज़दीकी अस्पताल खोजें","जवळची रुग्णालये शोधा"], helpline:["Talk to someone now: Tele-MANAS 14416","अभी बात करें: टेली-मानस 14416","आत्ता बोला: टेली-मानस 14416"], back:["Go back","वापस जाएँ","मागे जा"],
 why:["Why this level","यह स्तर क्यों","हा स्तर का"], lvl_routine:["Routine","सामान्य","सामान्य"], lvl_soon:["See within days","कुछ दिनों में दिखाएँ","काही दिवसांत दाखवा"], lvl_urgent:["See today","आज दिखाएँ","आज दाखवा"], lvl_emergency:["Emergency","आपातकाल","आणीबाणी"],
 rl_chief:["Chief complaint","मुख्य शिकायत","मुख्य तक्रार"], rl_history:["History of illness","बीमारी का इतिहास","आजाराचा इतिहास"], rl_assoc:["Other symptoms","अन्य लक्षण","इतर लक्षणे"], rl_flags:["Red flags checked","जाँचे गए खतरे के संकेत","तपासलेली धोक्याची चिन्हे"],
 rl_allergies:["Allergies","एलर्जी","ॲलर्जी"], rl_meds:["Medicines","दवाइयाँ","औषधे"], rl_past:["Past history","पुराना इतिहास","जुना इतिहास"], rl_q:["Questions to ask","पूछने योग्य सवाल","विचारण्यासारखे प्रश्न"],
 pr_note:["Patient-reported. Decision support, not a diagnosis.","मरीज़ द्वारा बताया गया। निर्णय में सहायता, निदान नहीं।","रुग्णाने सांगितलेले. निर्णयात मदत, निदान नाही."],
 cancel:["Cancel","रद्द करें","रद्द करा"], cancelled:["Cancelled","रद्द","रद्द"], seen:["Seen","देख लिया","पाहिले"], mark_seen:["Mark as seen","देखा गया चिह्नित करें","पाहिले म्हणून नोंदवा"],
 waiting:["Waiting","प्रतीक्षा में","प्रतीक्षेत"], empty_queue:["No patients yet.","अभी कोई मरीज़ नहीं।","अजून रुग्ण नाहीत."], save:["Save","सहेजें","सेव्ह करा"], saved:["Saved","सहेजा गया","सेव्ह झाले"],
 profile_sub:["Saved once, filled in automatically every time you book.","एक बार सहेजें, हर बुकिंग में अपने आप भरा जाएगा।","एकदा सेव्ह करा, प्रत्येक बुकिंगमध्ये आपोआप भरले जाईल."],
 chat_ph:["Ask about doctors or symptoms","डॉक्टर या लक्षण के बारे में पूछें","डॉक्टर किंवा लक्षणांबद्दल विचारा"], send:["Send","भेजें","पाठवा"],
 chat_hi:["Hello. Tell me what you need help with, in any language.","नमस्ते। किसी भी भाषा में बताइए, किसमें मदद चाहिए?","नमस्कार. कोणत्याही भाषेत सांगा, कशात मदत हवी?"],
 s1:["Which doctor should I see for knee pain?","घुटने के दर्द के लिए कौन सा डॉक्टर?","गुडघेदुखीसाठी कोणता डॉक्टर?"], s2:["How does the pre-visit report work?","विज़िट से पहले की रिपोर्ट कैसे काम करती है?","भेटीपूर्वीचा अहवाल कसा चालतो?"], s3:["I have a fever and a cough","मुझे बुखार और खांसी है","मला ताप आणि खोकला आहे"],
 translating:["Translating the app…","ऐप का अनुवाद हो रहा है…","ॲपचे भाषांतर होत आहे…"], disclaimer:["CareSync supports decisions. It does not diagnose. Your doctor has the final say.","CareSync निर्णय में मदद करता है, निदान नहीं। अंतिम फ़ैसला डॉक्टर का है।","CareSync निर्णयात मदत करते, निदान नाही. अंतिम निर्णय डॉक्टरांचा."],
 total_pat:["Waiting","प्रतीक्षा में","प्रतीक्षेत"],
 sp_0:["General Physician","सामान्य चिकित्सक","सामान्य चिकित्सक"], sp_1:["Cardiologist","हृदय रोग विशेषज्ञ","हृदयरोगतज्ञ"], sp_2:["Gynecologist","स्त्री रोग विशेषज्ञ","स्त्रीरोगतज्ञ"], sp_3:["Pediatrician","बाल रोग विशेषज्ञ","बालरोगतज्ञ"],
 sp_4:["Neurologist","न्यूरोलॉजिस्ट","न्यूरोलॉजिस्ट"], sp_5:["Pulmonologist","फेफड़े रोग विशेषज्ञ","फुफ्फुसरोगतज्ञ"], sp_6:["Dermatologist","त्वचा रोग विशेषज्ञ","त्वचारोगतज्ञ"], sp_7:["Psychiatrist","मनोचिकित्सक","मानसोपचारतज्ञ"]
};
Object.assign(S, {
 history:["Other past illnesses","अन्य पुरानी बीमारियाँ","इतर जुने आजार"],
 sec_visit:["Visit","विज़िट","भेट"], visit_type:["Visit type","विज़िट का प्रकार","भेटीचा प्रकार"], vt_first:["First visit","पहली विज़िट","पहिली भेट"], vt_follow:["Follow-up","फ़ॉलो-अप","पाठपुरावा"],
 sec_problem:["Your main problem","आपकी मुख्य समस्या","तुमची मुख्य समस्या"], body_area:["Where is it?","यह कहाँ है?","हे कुठे आहे?"],
 b_head:["Head","सिर","डोके"], b_chest:["Chest","छाती","छाती"], b_abdomen:["Stomach or abdomen","पेट","पोट"], b_back:["Back","पीठ","पाठ"], b_limbs:["Arms or legs","हाथ या पैर","हात किंवा पाय"], b_skin:["Skin","त्वचा","त्वचा"], b_general:["Whole body","पूरा शरीर","संपूर्ण शरीर"], b_other:["Other","अन्य","इतर"],
 onset:["How did it start?","यह कैसे शुरू हुआ?","हे कसे सुरू झाले?"], on_sudden:["Suddenly","अचानक","अचानक"], on_gradual:["Gradually","धीरे-धीरे","हळूहळू"],
 course:["Is it getting…","क्या यह…","हे…"], c_worse:["Worse","बिगड़ रहा है","वाढत आहे"], c_same:["About the same","लगभग वैसा ही","जवळजवळ तसेच"], c_better:["Better","बेहतर हो रहा है","बरे होत आहे"],
 modifiers:["What makes it better or worse?","क्या इसे बेहतर या बदतर करता है?","काय त्रास कमी किंवा जास्त करते?"], tried:["What have you already tried?","आपने अब तक क्या किया?","तुम्ही आतापर्यंत काय केले?"],
 sec_symptoms:["Other symptoms you have","आपके अन्य लक्षण","तुमची इतर लक्षणे"],
 sy_fever:["Fever","बुखार","ताप"], sy_cough:["Cough","खांसी","खोकला"], sy_headache:["Headache","सिरदर्द","डोकेदुखी"], sy_nausea:["Nausea or vomiting","जी मिचलाना या उल्टी","मळमळ किंवा उलटी"], sy_diarrhea:["Loose motions","दस्त","जुलाब"],
 sy_dizzy:["Dizziness","चक्कर","चक्कर"], sy_fatigue:["Unusual tiredness","असामान्य थकान","असामान्य थकवा"], sy_rash:["Skin rash or itching","त्वचा पर दाने या खुजली","त्वचेवर पुरळ किंवा खाज"], sy_throat:["Sore throat","गले में दर्द","घसा दुखणे"],
 sy_bodyache:["Body ache","बदन दर्द","अंगदुखी"], sy_appetite:["Loss of appetite","भूख न लगना","भूक न लागणे"], sy_weightloss:["Weight loss","वज़न घटना","वजन घटणे"], sy_urine:["Burning or frequent urine","पेशाब में जलन या बार-बार","लघवीत जळजळ किंवा वारंवार"],
 sy_swelling:["Swelling in feet","पैरों में सूजन","पायांवर सूज"], sy_palpitations:["Racing heartbeat","दिल की तेज़ धड़कन","हृदयाची धडधड"],
 sec_screen:["Do you have any of these right now?","क्या अभी इनमें से कुछ है?","आत्ता यापैकी काही आहे का?"], screen_note:["Tick any that apply. These are checked first.","जो लागू हो उस पर निशान लगाएँ। इन्हें पहले जाँचा जाता है।","लागू असेल त्यावर खूण करा. यांची आधी तपासणी होते."],
 sc_chest:["Chest pain or pressure","सीने में दर्द या दबाव","छातीत दुखणे किंवा दाब"], sc_breath:["Trouble breathing","सांस लेने में तकलीफ","श्वास घेण्यास त्रास"], sc_faint:["Fainting or blackout","बेहोशी","बेशुद्ध पडणे"],
 sc_stroke:["Face drooping, slurred speech or one-sided weakness","चेहरा टेढ़ा, बोलने में दिक्कत या एक तरफ कमज़ोरी","चेहरा वाकडा, बोलण्यास त्रास किंवा एका बाजूला अशक्तपणा"], sc_bleed:["Heavy bleeding","भारी रक्तस्राव","जास्त रक्तस्राव"],
 sc_seizure:["Seizure or fits","दौरे","झटके"], sc_confusion:["Sudden confusion","अचानक भ्रम","अचानक गोंधळ"], sc_bloodvomit:["Vomiting or coughing blood","खून की उल्टी या खांसी","रक्ताची उलटी किंवा खोकला"],
 sec_vitals:["Readings, if you have them","आपके पास हों तो रीडिंग","असल्यास मोजमाप"], temp:["Temperature (°C)","तापमान (°C)","तापमान (°C)"], bp_sys:["BP upper number","BP ऊपरी","BP वरचा"], bp_dia:["BP lower number","BP निचला","BP खालचा"],
 pulse:["Pulse (per minute)","नाड़ी (प्रति मिनट)","नाडी (प्रति मिनिट)"], spo2:["Oxygen level (%)","ऑक्सीजन स्तर (%)","ऑक्सिजन पातळी (%)"],
 sec_you:["About you","आपके बारे में","तुमच्याबद्दल"], height:["Height (cm)","कद (सेमी)","उंची (सेमी)"], weight:["Weight (kg)","वज़न (किग्रा)","वजन (किग्रा)"], blood:["Blood group","रक्त समूह","रक्तगट"],
 preg_weeks:["Weeks pregnant (if applicable)","गर्भावस्था के सप्ताह (यदि लागू)","गर्भावस्थेचे आठवडे (लागू असल्यास)"], preg_issues:["Any pregnancy problems so far?","अब तक गर्भावस्था में कोई समस्या?","आतापर्यंत गर्भावस्थेत काही त्रास?"],
 sec_back:["Medical background","चिकित्सा पृष्ठभूमि","वैद्यकीय पार्श्वभूमी"], conditions:["Long-term conditions","दीर्घकालिक बीमारियाँ","दीर्घकालीन आजार"],
 cd_diabetes:["Diabetes","मधुमेह","मधुमेह"], cd_bp:["High blood pressure","उच्च रक्तचाप","उच्च रक्तदाब"], cd_asthma:["Asthma or lung disease","अस्थमा या फेफड़ों की बीमारी","दमा किंवा फुफ्फुसाचा आजार"], cd_heart:["Heart disease","हृदय रोग","हृदयरोग"],
 cd_thyroid:["Thyroid","थायरॉइड","थायरॉईड"], cd_kidney:["Kidney disease","गुर्दे की बीमारी","मूत्रपिंडाचा आजार"], cd_epilepsy:["Epilepsy","मिर्गी","अपस्मार"], cd_cancer:["Cancer","कैंसर","कर्करोग"], cd_tb:["Tuberculosis","टीबी","क्षयरोग"],
 surgeries:["Past surgeries or hospital stays","पुराने ऑपरेशन या अस्पताल में भर्ती","जुन्या शस्त्रक्रिया किंवा रुग्णालयात दाखल"], family:["Family history (diabetes, heart disease, cancer…)","पारिवारिक इतिहास (मधुमेह, हृदय रोग, कैंसर…)","कौटुंबिक इतिहास (मधुमेह, हृदयरोग, कर्करोग…)"],
 smoking:["Tobacco use","तंबाकू का सेवन","तंबाखू सेवन"], alcohol:["Alcohol","शराब","मद्य"], o_no:["No","नहीं","नाही"], o_some:["Sometimes","कभी-कभी","कधीकधी"], o_daily:["Daily","रोज़","रोज"],
 ec_name:["Emergency contact name","आपातकालीन संपर्क का नाम","आणीबाणी संपर्काचे नाव"], ec_phone:["Emergency contact phone","आपातकालीन संपर्क फ़ोन","आणीबाणी संपर्क फोन"],
 notes:["Anything else your doctor should know?","और कुछ जो डॉक्टर को पता होना चाहिए?","डॉक्टरांना आणखी काही सांगायचे आहे का?"],
 rl_onset:["Onset and course","शुरुआत और प्रगति","सुरुवात आणि प्रगती"], rl_vitals:["Readings","रीडिंग","मोजमाप"], rl_risk:["Risk factors","जोखिम कारक","जोखीम घटक"], rl_contact:["Emergency contact","आपातकालीन संपर्क","आणीबाणी संपर्क"]
});
Object.assign(S, { // English only: other languages are translated on first use and cached
 reg_no:["Medical registration number (NMC / State Medical Council)"], pending_title:["Your registration is being verified"], pending_body:["An administrator checks your registration number before you can see patients. This usually takes about a day."],
 nav_admin:["Admin"], admin_title:["Dashboard"], st_users:["Users"], st_appts:["Appointments"], st_emerg:["Emergencies caught"], st_ai:["Summaries rated accurate"], st_rules:["Triages that used safety rules only (AI unavailable)"], adm_doctors:["Doctors"], approve:["Approve"], reject:["Reject"], audit:["Recent activity"],
 complete_visit:["Complete visit"], diagnosis:["Diagnosis or findings"], advice:["Advice"], prescription:["Prescription"], followup:["Follow up after"], save_visit:["Save and notify patient"], saving:["Saving and writing the patient summary…"], visit_summary:["Your visit summary"], doc_notes:["Doctor's notes"],
 accurate:["Was this AI summary accurate?"], rules_only:["AI summary unavailable. This result uses the safety rules only."], cal:["Add to calendar"], export:["Download my data"], delete_acct:["Delete my account"], delete_confirm:["This permanently deletes your account and your appointments. Continue?"],
 privacy:["Your data"], days:["Working days and hours"], start:["Starts"], end:["Ends"], slot_min:["Minutes per visit"], no_slots:["No slots on this day. Try another date."], slot_taken:["That slot was just taken. Please pick another."],
 wd_0:["Mon"], wd_1:["Tue"], wd_2:["Wed"], wd_3:["Thu"], wd_4:["Fri"], wd_5:["Sat"], wd_6:["Sun"]
});
Object.assign(S, {
 step_n:["Step {a} of {b}"], next:["Next"], prev:["Back"], pick_slot:["Please choose a time slot first."], how_title:["How CareSync works"],
 how1:["Pick a doctor and a time that suits you."], how2:["Tell us what is wrong once, in any language. Danger signs are checked first."], how3:["Your doctor reads a clear summary before you arrive."], prof_pct:["Your health profile is {n}% complete"]
});
Object.assign(S, { resched:["Reschedule"], confirm:["Confirm"], rescheduled:["Appointment moved"] });
Object.assign(S, {
 nav_records:["Records"], upcoming:["Upcoming"], past:["Past"], presc_active:["Recent prescriptions"], visit_history:["Visit history"], none_records:["No completed visits yet. After a doctor completes your visit, the summary and prescription appear here."], t_upcoming:["Upcoming visits"], t_visits:["Visits completed"],
 nav_overview:["Overview"], nav_users:["People"], nav_allappts:["All appointments"], nav_system:["System"], suspend:["Suspend"], restore:["Restore"], role:["Role"], search_users:["Search by name or email"], sys_ai:["AI connection"], sys_email:["Email reminders"], sys_google:["Google sign-in"],
 on:["On"], off:["Off"], test_ai:["Test AI connection"], all:["All"], name_c:["Name"], email_c:["Email"], visits_c:["Visits"], patient_c:["Patient"], doctor_c:["Doctor"], when_c:["When"], level_c:["Level"], status_c:["Status"], suspended:["Suspended"], active:["Active"], sys_hint:["Settings live in backend/.env. Restart the app after changing them."]
});
const pick = i => Object.fromEntries(Object.entries(S).filter(([, v]) => v[i] !== undefined).map(([k, v]) => [k, v[i]]));
export const EN = pick(0);
export const STATIC = { en: EN, hi: pick(1), mr: pick(2) };
export const SPECS = ["General Physician", "Cardiologist", "Gynecologist", "Pediatrician", "Neurologist", "Pulmonologist", "Dermatologist", "Psychiatrist"];