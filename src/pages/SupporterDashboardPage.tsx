import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { SupportMessage } from '../types.js';
import { HeartHandshake, Star, Check, X, Send, Square, RefreshCw, CircleAlert, BadgeCheck } from 'lucide-react';
import { SupportedLanguage } from '../types.js';

const c: Record<SupportedLanguage, any> = {
  en:{dashboard:'Supporter Dashboard',welcome:'Welcome',id:'Supporter ID',live:'Live conversation',private:'Messages are shared only with this user.',end:'End Session',waiting:'Waiting for the user\'s first message...',reply:'Reply to the user...',requests:'Support Requests',auto:'New requests are checked automatically every few seconds.',none:'No support requests right now.',accept:'Accept',decline:'Decline',ratings:'Recent User Ratings',noRatings:'No ratings yet. Ratings appear here after completed sessions.',noFeedback:'No written feedback.',available:'Available',offline:'Offline',busy:'Busy',rating:'ratings',loading:'Loading supporter dashboard...',connecting:'Connecting to the support service',failed:'Supporter dashboard could not load',retry:'Try Again',demo:'Demo ID: HS001',account:'supporter1@moodjournal.ai',new:'New'},
  ta:{dashboard:'ஆதரவாளர் டாஷ்போர்டு',welcome:'வரவேற்கிறோம்',id:'ஆதரவாளர் ID',live:'நேரடி உரையாடல்',private:'இந்த பயனருடன் மட்டும் செய்திகள் பகிரப்படுகின்றன.',end:'அமர்வை முடி',waiting:'பயனரின் முதல் செய்திக்காக காத்திருக்கிறது...',reply:'பயனருக்கு பதில் எழுதுங்கள்...',requests:'ஆதரவு கோரிக்கைகள்',auto:'புதிய கோரிக்கைகள் சில விநாடிகளுக்கு ஒருமுறை தானாக சரிபார்க்கப்படும்.',none:'இப்போது ஆதரவு கோரிக்கைகள் இல்லை.',accept:'ஏற்கவும்',decline:'நிராகரிக்கவும்',ratings:'சமீபத்திய பயனர் மதிப்பீடுகள்',noRatings:'இன்னும் மதிப்பீடுகள் இல்லை. முடிந்த அமர்வுகளுக்குப் பிறகு இங்கே தோன்றும்.',noFeedback:'எழுத்து கருத்து இல்லை.',available:'கிடைக்கும்',offline:'ஆஃப்லைன்',busy:'பிஸி',rating:'மதிப்பீடுகள்',loading:'ஆதரவாளர் டாஷ்போர்டு ஏற்றப்படுகிறது...',connecting:'ஆதரவு சேவையுடன் இணைகிறது',failed:'ஆதரவாளர் டாஷ்போர்டை ஏற்ற முடியவில்லை',retry:'மீண்டும் முயற்சி',demo:'டெமோ ID: HS001',account:'supporter1@moodjournal.ai',new:'புதியது'},
  hi:{dashboard:'सपोर्टर डैशबोर्ड',welcome:'स्वागत है',id:'सपोर्टर ID',live:'लाइव बातचीत',private:'संदेश केवल इस यूज़र के साथ साझा किए जाते हैं।',end:'सेशन समाप्त करें',waiting:'यूज़र के पहले संदेश की प्रतीक्षा...',reply:'यूज़र को जवाब दें...',requests:'सपोर्ट रिक्वेस्ट',auto:'नई रिक्वेस्ट हर कुछ सेकंड में अपने आप जाँची जाती हैं।',none:'अभी कोई सपोर्ट रिक्वेस्ट नहीं है।',accept:'स्वीकार करें',decline:'अस्वीकार करें',ratings:'हाल की यूज़र रेटिंग',noRatings:'अभी कोई रेटिंग नहीं है। पूरे सेशन के बाद यहाँ दिखाई देंगी।',noFeedback:'लिखित प्रतिक्रिया नहीं है।',available:'उपलब्ध',offline:'ऑफ़लाइन',busy:'व्यस्त',rating:'रेटिंग',loading:'सपोर्टर डैशबोर्ड लोड हो रहा है...',connecting:'सपोर्ट सेवा से कनेक्ट हो रहा है',failed:'सपोर्टर डैशबोर्ड लोड नहीं हो सका',retry:'फिर कोशिश करें',demo:'डेमो ID: HS001',account:'supporter1@moodjournal.ai',new:'नया'},
  ml:{dashboard:'സപ്പോർട്ടർ ഡാഷ്ബോർഡ്',welcome:'സ്വാഗതം',id:'സപ്പോർട്ടർ ID',live:'ലൈവ് സംഭാഷണം',private:'സന്ദേശങ്ങൾ ഈ ഉപയോക്താവിനോട് മാത്രം പങ്കിടുന്നു.',end:'സെഷൻ അവസാനിപ്പിക്കുക',waiting:'ഉപയോക്താവിന്റെ ആദ്യ സന്ദേശത്തിനായി കാത്തിരിക്കുന്നു...',reply:'ഉപയോക്താവിന് മറുപടി നൽകുക...',requests:'സപ്പോർട്ട് അഭ്യർത്ഥനകൾ',auto:'പുതിയ അഭ്യർത്ഥനകൾ ഓരോ കുറച്ച് സെക്കൻഡിലും പരിശോധിക്കും.',none:'ഇപ്പോൾ സപ്പോർട്ട് അഭ്യർത്ഥനകളില്ല.',accept:'സ്വീകരിക്കുക',decline:'നിരസിക്കുക',ratings:'സമീപകാല ഉപയോക്തൃ റേറ്റിംഗുകൾ',noRatings:'ഇതുവരെ റേറ്റിംഗുകളില്ല. സെഷൻ പൂർത്തിയായ ശേഷം ഇവിടെ കാണാം.',noFeedback:'എഴുത്തുപരമായ അഭിപ്രായമില്ല.',available:'ലഭ്യമാണ്',offline:'ഓഫ്‌ലൈൻ',busy:'തിരക്കിലാണ്',rating:'റേറ്റിംഗുകൾ',loading:'സപ്പോർട്ടർ ഡാഷ്ബോർഡ് ലോഡ് ചെയ്യുന്നു...',connecting:'സപ്പോർട്ട് സേവനവുമായി ബന്ധപ്പെടുന്നു',failed:'സപ്പോർട്ടർ ഡാഷ്ബോർഡ് ലോഡ് ചെയ്യാനായില്ല',retry:'വീണ്ടും ശ്രമിക്കുക',demo:'ഡെമോ ID: HS001',account:'supporter1@moodjournal.ai',new:'പുതിയത്'},
  te:{dashboard:'సపోర్టర్ డాష్‌బోర్డ్',welcome:'స్వాగతం',id:'సపోర్టర్ ID',live:'లైవ్ సంభాషణ',private:'సందేశాలు ఈ యూజర్‌తో మాత్రమే పంచబడతాయి.',end:'సెషన్ ముగించు',waiting:'యూజర్ మొదటి సందేశం కోసం వేచి ఉంది...',reply:'యూజర్‌కు సమాధానం ఇవ్వండి...',requests:'సపోర్ట్ అభ్యర్థనలు',auto:'కొత్త అభ్యర్థనలు ప్రతి కొన్ని సెకన్లకు ఆటోమేటిక్‌గా తనిఖీ అవుతాయి.',none:'ప్రస్తుతం సపోర్ట్ అభ్యర్థనలు లేవు.',accept:'అంగీకరించు',decline:'తిరస్కరించు',ratings:'ఇటీవలి యూజర్ రేటింగ్‌లు',noRatings:'ఇంకా రేటింగ్‌లు లేవు. పూర్తయిన సెషన్ తర్వాత ఇక్కడ కనిపిస్తాయి.',noFeedback:'రాతపూర్వక అభిప్రాయం లేదు.',available:'అందుబాటులో',offline:'ఆఫ్‌లైన్',busy:'బిజీ',rating:'రేటింగ్‌లు',loading:'సపోర్టర్ డాష్‌బోర్డ్ లోడ్ అవుతోంది...',connecting:'సపోర్ట్ సేవకు కనెక్ట్ అవుతోంది',failed:'సపోర్టర్ డాష్‌బోర్డ్ లోడ్ కాలేదు',retry:'మళ్లీ ప్రయత్నించండి',demo:'డెమో ID: HS001',account:'supporter1@moodjournal.ai',new:'కొత్తది'},
  kn:{dashboard:'ಸಪೋರ್ಟರ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',welcome:'ಸ್ವಾಗತ',id:'ಸಪೋರ್ಟರ್ ID',live:'ಲೈವ್ ಸಂಭಾಷಣೆ',private:'ಸಂದೇಶಗಳನ್ನು ಈ ಬಳಕೆದಾರರೊಂದಿಗೆ ಮಾತ್ರ ಹಂಚಲಾಗುತ್ತದೆ.',end:'ಸೆಷನ್ ಮುಗಿಸಿ',waiting:'ಬಳಕೆದಾರರ ಮೊದಲ ಸಂದೇಶಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ...',reply:'ಬಳಕೆದಾರರಿಗೆ ಉತ್ತರಿಸಿ...',requests:'ಸಪೋರ್ಟ್ ವಿನಂತಿಗಳು',auto:'ಹೊಸ ವಿನಂತಿಗಳನ್ನು ಪ್ರತಿ ಕೆಲವು ಸೆಕೆಂಡುಗಳಿಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.',none:'ಈಗ ಯಾವುದೇ ಸಪೋರ್ಟ್ ವಿನಂತಿಗಳಿಲ್ಲ.',accept:'ಸ್ವೀಕರಿಸಿ',decline:'ನಿರಾಕರಿಸಿ',ratings:'ಇತ್ತೀಚಿನ ಬಳಕೆದಾರರ ರೇಟಿಂಗ್‌ಗಳು',noRatings:'ಇನ್ನೂ ರೇಟಿಂಗ್‌ಗಳಿಲ್ಲ. ಸೆಷನ್ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',noFeedback:'ಲಿಖಿತ ಪ್ರತಿಕ್ರಿಯೆ ಇಲ್ಲ.',available:'ಲಭ್ಯವಿದೆ',offline:'ಆಫ್‌ಲೈನ್',busy:'ಬಿಜಿ',rating:'ರೇಟಿಂಗ್‌ಗಳು',loading:'ಸಪೋರ್ಟರ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',connecting:'ಸಪೋರ್ಟ್ ಸೇವೆಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ',failed:'ಸಪೋರ್ಟರ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗಲಿಲ್ಲ',retry:'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',demo:'ಡೆಮೋ ID: HS001',account:'supporter1@moodjournal.ai',new:'ಹೊಸದು'},
  ur:{dashboard:'سپورٹر ڈیش بورڈ',welcome:'خوش آمدید',id:'سپورٹر ID',live:'لائیو گفتگو',private:'پیغامات صرف اس صارف کے ساتھ شیئر کیے جاتے ہیں۔',end:'سیشن ختم کریں',waiting:'صارف کے پہلے پیغام کا انتظار...',reply:'صارف کو جواب دیں...',requests:'سپورٹ درخواستیں',auto:'نئی درخواستیں ہر چند سیکنڈ میں خودکار طور پر چیک ہوتی ہیں۔',none:'اس وقت کوئی سپورٹ درخواست نہیں ہے۔',accept:'قبول کریں',decline:'مسترد کریں',ratings:'حالیہ صارف ریٹنگز',noRatings:'ابھی کوئی ریٹنگ نہیں۔ مکمل سیشن کے بعد یہاں نظر آئے گی۔',noFeedback:'تحریری رائے نہیں ہے۔',available:'دستیاب',offline:'آف لائن',busy:'مصروف',rating:'ریٹنگز',loading:'سپورٹر ڈیش بورڈ لوڈ ہو رہا ہے...',connecting:'سپورٹ سروس سے رابطہ ہو رہا ہے',failed:'سپورٹر ڈیش بورڈ لوڈ نہیں ہو سکا',retry:'دوبارہ کوشش کریں',demo:'ڈیمو ID: HS001',account:'supporter1@moodjournal.ai',new:'نیا'},
  tanglish:{dashboard:'Supporter Dashboard',welcome:'Welcome',id:'Supporter ID',live:'Live conversation',private:'Messages indha user-kitta mattum share aagum.',end:'Session End',waiting:'User-oda first message-ku wait panrom...',reply:'User-ku reply pannunga...',requests:'Support Requests',auto:'New requests few seconds-ku once automatic-a check aagum.',none:'Ippo support requests illa.',accept:'Accept',decline:'Decline',ratings:'Recent User Ratings',noRatings:'Innum ratings illa. Completed session apram inga varum.',noFeedback:'Written feedback illa.',available:'Available',offline:'Offline',busy:'Busy',rating:'ratings',loading:'Supporter dashboard load aagudhu...',connecting:'Support service-kku connect aagudhu',failed:'Supporter dashboard load aagala',retry:'Try Again',demo:'Demo ID: HS001',account:'supporter1@moodjournal.ai',new:'New'}
};

export const SupporterDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const textCopy = c[language] || c.en;
  const [data, setData] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyRequest, setBusyRequest] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const d = await api.getSupporterDashboard();
      setData(d);
      const active = d.requests?.find((x: any) => x.sessionId && x.sessionStatus === 'active');
      setSessionId(active?.sessionId || null);
      try { const r = await api.getSupporterRatings(); setRatings(r.ratings || []); } catch {}
    } catch (e: any) {
      console.error('Supporter dashboard error:', e);
      setError(e?.message || textCopy.failed);
    } finally { setLoading(false); }
  }, [textCopy.failed]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = window.setInterval(load, 5000); return () => window.clearInterval(id); }, [load]);

  useEffect(() => {
    if (!sessionId) return;
    const poll = async () => {
      try {
        const r = await api.getSupportMessages(sessionId);
        setMessages(r.messages || []);
        if (r.session.status === 'ended') { setSessionId(null); setMessages([]); await load(); }
      } catch (e) { console.error(e); }
    };
    poll(); const id = window.setInterval(poll, 2000); return () => window.clearInterval(id);
  }, [sessionId, load]);

  const send = async () => {
    if (!sessionId || !text.trim()) return;
    const message = text.trim(); setText('');
    try { await api.sendSupportMessage(sessionId, message); const r = await api.getSupportMessages(sessionId); setMessages(r.messages || []); }
    catch { setText(message); }
  };
  const accept = async (id: string) => { setBusyRequest(id); try { const r = await api.acceptSupportRequest(id); setSessionId(r.sessionId); await load(); } catch (e:any) { alert(e?.message || textCopy.failed); } finally { setBusyRequest(null); } };
  const decline = async (id: string) => { setBusyRequest(id); try { await api.declineSupportRequest(id); await load(); } catch (e:any) { alert(e?.message || textCopy.failed); } finally { setBusyRequest(null); } };
  const end = async () => { if (!sessionId) return; try { await api.endSupportSession(sessionId); setSessionId(null); setMessages([]); await load(); } catch {} };
  const setAvailability = async (value: 'Available' | 'Offline') => { try { await api.setSupporterAvailability(value); await load(); } catch (e:any) { alert(e?.message || textCopy.failed); } };

  if (loading && !data) return <div className="min-h-[60vh] flex items-center justify-center"><div className="text-center"><RefreshCw className="w-7 h-7 mx-auto mb-3 animate-spin text-emerald-600"/><p className="text-sm font-semibold">{textCopy.loading}</p><p className="text-xs text-slate-500 mt-1">{textCopy.connecting}</p></div></div>;
  if (error && !data) return <div className="max-w-xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl border p-7 text-center"><CircleAlert className="w-9 h-9 mx-auto text-rose-500 mb-3"/><h1 className="font-black text-lg">{textCopy.failed}</h1><p className="text-sm text-slate-500 mt-2">{error}</p><button onClick={()=>{setLoading(true);load();}} className="mt-5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"><RefreshCw className="w-3.5 h-3.5 inline mr-1"/> {textCopy.retry}</button></div>;

  const requests = data?.requests || [];
  const profile = data?.profile;
  const availability = profile?.availability || 'Available';

  return <div className="max-w-6xl mx-auto space-y-6 pb-16">
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div><h1 className="text-2xl font-black flex items-center gap-2"><HeartHandshake className="text-emerald-600"/> {textCopy.dashboard}</h1><p className="text-sm text-slate-500 mt-1">{textCopy.welcome}, {user?.name}. {textCopy.id}: <b>{profile?.supporterId || 'HS001'}</b></p><p className="text-xs text-slate-500 mt-1">{profile?.title}</p><div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold"><BadgeCheck className="w-3 h-3"/> {textCopy.demo} · {textCopy.account}</div></div>
      <div className="flex items-center gap-3"><div className="text-center px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/20"><div className="font-black text-lg">⭐ {profile?.ratingCount ? Number(profile.averageRating).toFixed(1) : textCopy.new}</div><div className="text-[10px] text-slate-500">{profile?.ratingCount || 0} {textCopy.rating}</div></div><select value={availability} onChange={e=>setAvailability(e.target.value as 'Available'|'Offline')} className="px-3 py-2 rounded-xl border text-xs font-bold"><option value="Available">{textCopy.available}</option><option value="Offline">{textCopy.offline}</option><option value="Busy" disabled>{textCopy.busy}</option></select></div>
    </div>

    {sessionId ? <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center"><div><b>{textCopy.live}</b><p className="text-xs text-slate-500">{textCopy.private}</p></div><button onClick={end} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold"><Square className="w-3 h-3 inline mr-1"/> {textCopy.end}</button></div>
      <div className="h-[420px] overflow-y-auto p-5 space-y-3">{messages.length===0?<p className="text-center text-xs text-slate-400 py-10">{textCopy.waiting}</p>:messages.map(m=><div key={m.id} className={`flex ${m.senderId===user?.id?'justify-end':'justify-start'}`}><div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${m.senderId===user?.id?'bg-emerald-600 text-white':'bg-slate-100 dark:bg-slate-800'}`}><div className="text-[10px] opacity-70 mb-1">{m.senderName}</div>{m.message}</div></div>)}</div>
      <div className="p-4 border-t flex gap-2"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={textCopy.reply} className="flex-1 px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm"/><button onClick={send} disabled={!text.trim()} className="px-4 rounded-xl bg-emerald-600 text-white disabled:opacity-40"><Send className="w-4 h-4"/></button></div>
    </div> : <div className="bg-white dark:bg-slate-900 rounded-3xl border p-5"><div className="flex items-center justify-between mb-4"><div><h2 className="font-black">{textCopy.requests}</h2><p className="text-xs text-slate-500">{textCopy.auto}</p></div><button onClick={load} className="p-2 rounded-xl border"><RefreshCw className="w-4 h-4"/></button></div><div className="space-y-3">{requests.length===0?<div className="p-8 text-center text-sm text-slate-400">{textCopy.none}</div>:requests.map((r:any)=><div key={r.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex flex-col md:flex-row md:items-center justify-between gap-3"><div><b>{r.userName}</b><p className="text-xs text-slate-500">{r.userEmail}</p>{r.notes&&<p className="text-xs mt-2">“{r.notes}”</p>}</div><div className="flex items-center gap-2"><span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{r.status}</span>{r.status==='pending'&&<><button disabled={busyRequest===r.id} onClick={()=>accept(r.id)} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-40"><Check className="w-3 h-3 inline"/> {textCopy.accept}</button><button disabled={busyRequest===r.id} onClick={()=>decline(r.id)} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold disabled:opacity-40"><X className="w-3 h-3 inline"/> {textCopy.decline}</button></>}</div></div>)}</div></div>}

    <div className="bg-white dark:bg-slate-900 rounded-3xl border p-5"><h2 className="font-black mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500"/> {textCopy.ratings}</h2>{ratings.length===0?<p className="text-sm text-slate-400">{textCopy.noRatings}</p>:<div className="space-y-2">{ratings.map((r,i)=><div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"><div className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div><p className="text-sm mt-1">{r.feedback||textCopy.noFeedback}</p><p className="text-[10px] text-slate-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p></div>)}</div>}</div>
  </div>;
};
