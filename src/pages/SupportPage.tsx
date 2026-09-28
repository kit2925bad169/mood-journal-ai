import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { SupporterProfile, SupportRequest, SupportMessage } from '../types.js';
import {
  HeartHandshake, Star, MessageCircle, Send, CheckCircle2, Clock,
  UserRound, Circle, LogIn, Square
} from 'lucide-react';

export const SupportPage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [supporters, setSupporters] = useState<SupporterProfile[]>([]);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedSupporter, setSelectedSupporter] = useState<SupporterProfile | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ratingBusy, setRatingBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const ui = {
    en: {
      title: 'Real Human Support', subtitle: 'Choose an available human supporter, start a private conversation, and rate the session when it ends.',
      choose: 'Choose a supporter', available: 'Available', busy: 'Busy', offline: 'Offline',
      ratings: 'ratings', request: 'Request Support', requested: 'Request sent', note: 'Optional note',
      notePlaceholder: 'Briefly tell the supporter what you would like to discuss...',
      pending: 'Waiting for supporter', active: 'Conversation active', completed: 'Session completed',
      openChat: 'Open Chat', send: 'Send', end: 'End Session', rate: 'Rate Supporter',
      feedback: 'Optional feedback', submit: 'Submit Rating', thanks: 'Thank you for rating your supporter.',
      login: 'Supporter login', noSupporters: 'No human supporters are available right now.',
      supporterId: 'Supporter ID', yourRequests: 'Your support requests', noRequests: 'No support requests yet.',
      waiting: 'Your request is waiting for the selected supporter to accept it.'
    },
    ta: {
      title: 'உண்மையான மனித ஆதரவு', subtitle: 'கிடைக்கும் மனித ஆதரவாளரைத் தேர்ந்தெடுத்து தனிப்பட்ட உரையாடலைத் தொடங்குங்கள்.',
      choose: 'ஆதரவாளரைத் தேர்வு செய்யுங்கள்', available: 'கிடைக்கிறது', busy: 'பிஸி', offline: 'ஆஃப்லைன்',
      ratings: 'மதிப்பீடுகள்', request: 'ஆதரவு கோரிக்கை', requested: 'கோரிக்கை அனுப்பப்பட்டது', note: 'விருப்ப குறிப்பு',
      notePlaceholder: 'எதைப் பற்றி பேச விரும்புகிறீர்கள் என்பதை சுருக்கமாக எழுதுங்கள்...',
      pending: 'ஆதரவாளரின் பதிலை எதிர்பார்க்கிறது', active: 'உரையாடல் நடைபெறுகிறது', completed: 'உரையாடல் முடிந்தது',
      openChat: 'உரையாடலைத் திற', send: 'அனுப்பு', end: 'உரையாடலை முடி', rate: 'ஆதரவாளரை மதிப்பிடுங்கள்',
      feedback: 'விருப்ப கருத்து', submit: 'மதிப்பீட்டை அனுப்பு', thanks: 'மதிப்பீட்டுக்கு நன்றி.',
      login: 'ஆதரவாளர் உள்நுழைவு', noSupporters: 'இப்போது மனித ஆதரவாளர்கள் கிடைக்கவில்லை.',
      supporterId: 'ஆதரவாளர் ID', yourRequests: 'உங்கள் ஆதரவு கோரிக்கைகள்', noRequests: 'ஆதரவு கோரிக்கைகள் இல்லை.',
      waiting: 'தேர்ந்தெடுத்த ஆதரவாளர் உங்கள் கோரிக்கையை ஏற்க காத்திருக்கிறது.'
    }
  } as const;
  const copy = (ui as any)[language] || ui.en;

  const load = async () => {
    try {
      setLoading(true);
      const [s, r] = await Promise.all([api.getSupporters(), api.getSupportRequests()]);
      setSupporters(s.supporters);
      setRequests(r.requests);
      const active = r.requests.find((x) => x.sessionId && x.sessionStatus === 'active');
      if (active?.sessionId) setSessionId(active.sessionId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await api.getSupportMessages(sessionId);
        if (!cancelled) setMessages(r.messages);
        if (!cancelled && r.session.status === 'ended') {
          await load();
        }
      } catch (e) {
        console.error(e);
      }
    };
    poll();
    const timer = window.setInterval(poll, 2000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [sessionId]);

  const requestSupport = async () => {
    if (!selectedSupporter) return;
    setSendingRequest(true);
    try {
      const r = await api.requestSupport(selectedSupporter.supporterId, undefined, notes);
      setNotice(r.message);
      setNotes('');
      setSelectedSupporter(null);
      await load();
    } catch (e: any) {
      setNotice(e?.message || 'Could not send support request.');
    } finally {
      setSendingRequest(false);
    }
  };

  const sendMessage = async () => {
    if (!sessionId || !messageText.trim()) return;
    const text = messageText.trim();
    setMessageText('');
    try {
      await api.sendSupportMessage(sessionId, text);
      const r = await api.getSupportMessages(sessionId);
      setMessages(r.messages);
    } catch (e) {
      console.error(e);
      setMessageText(text);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    try {
      await api.endSupportSession(sessionId);
      await load();
      setSessionId(null);
      setMessages([]);
    } catch (e) { console.error(e); }
  };

  const rateSession = async (id: string) => {
    if (!rating) return;
    setRatingBusy(true);
    try {
      await api.rateSupporter(id, rating, feedback);
      setNotice(copy.thanks);
      setRating(0);
      setFeedback('');
      await load();
    } catch (e: any) {
      setNotice(e?.message || 'Could not save rating.');
    } finally {
      setRatingBusy(false);
    }
  };

  const activeRequest = requests.find((r) => r.sessionId && r.sessionStatus === 'active');
  const pendingRequest = requests.find((r) => r.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><span className="p-2 rounded-xl bg-emerald-100 text-emerald-600"><HeartHandshake className="w-6 h-6" /></span>{copy.title}</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{copy.subtitle}</p>
        </div>
        <a href="#supporter-login" onClick={(e) => { e.preventDefault(); onNavigate?.('supporter-login'); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:border-emerald-500">
          <LogIn className="w-4 h-4" /> {copy.login}
        </a>
      </div>

      {notice && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-sm text-emerald-800 dark:text-emerald-300">{notice}</div>}

      {sessionId && activeRequest ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div><h2 className="font-bold text-lg">{activeRequest.supporterName}</h2><p className="text-xs text-emerald-600">{copy.active}</p></div>
            <button onClick={endSession} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold"><Square className="w-3 h-3" /> {copy.end}</button>
          </div>
          <div className="h-[420px] overflow-y-auto p-5 space-y-3">
            {messages.length === 0 && <p className="text-center text-sm text-slate-400 py-20">Your supporter will reply here.</p>}
            {messages.map(m => <div key={m.id} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${m.senderId === user?.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}><div className="text-[10px] opacity-70 mb-1">{m.senderName || (m.senderRole === 'supporter' ? activeRequest.supporterName : 'You')}</div>{m.message}</div></div>)}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} placeholder="Type your message..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
            <button onClick={sendMessage} className="px-4 rounded-xl bg-emerald-600 text-white"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <>
          {pendingRequest && <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800"><Clock className="w-4 h-4 inline mr-2" />{copy.waiting}</div>}
          <div>
            <h2 className="text-lg font-black mb-4">{copy.choose}</h2>
            {loading ? <div className="py-12 text-center text-slate-500">Loading...</div> :
              supporters.length === 0 ? <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border">{copy.noSupporters}</div> :
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{supporters.map(s => (
                <div key={s.supporterId} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><UserRound /></div>
                    <div className="flex-1"><h3 className="font-bold">{s.name}</h3><p className="text-xs text-slate-500">{s.title}</p><p className="text-[11px] text-slate-400 mt-1">{copy.supporterId}: {s.supporterId}</p>
                      <div className="flex items-center gap-2 mt-2"><Star className="w-4 h-4 fill-current text-amber-500" /><b>{s.ratingCount ? s.averageRating.toFixed(1) : 'New'}</b><span className="text-xs text-slate-400">({s.ratingCount} {copy.ratings})</span></div>
                    </div>
                    <span className="text-[10px] font-bold flex items-center gap-1"><Circle className={`w-2.5 h-2.5 fill-current ${s.availability === 'Available' ? 'text-emerald-500' : s.availability === 'Busy' ? 'text-amber-500' : 'text-slate-400'}`} />{s.availability}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{s.bio}</p>
                  <button disabled={s.availability !== 'Available'} onClick={() => setSelectedSupporter(s)} className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-40">{copy.request}</button>
                </div>
              ))}</div>}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h2 className="font-bold mb-4">{copy.yourRequests}</h2>
            {requests.length === 0 ? <p className="text-sm text-slate-400">{copy.noRequests}</p> : <div className="space-y-2">{requests.map(r => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div><b className="text-sm">{r.supporterName}</b><p className="text-xs text-slate-500">{r.notes || ''}</p></div>
                <div className="flex items-center gap-2"><span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{r.status}</span>{r.sessionId && r.sessionStatus === 'active' && <button onClick={() => setSessionId(r.sessionId!)} className="text-xs font-bold text-emerald-600">{copy.openChat}</button>}</div>
              </div>
            ))}</div>}
          </div>
        </>
      )}

      {selectedSupporter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-black">Request {selectedSupporter.name}</h2>
            <p className="text-xs text-slate-500">{selectedSupporter.averageRating ? `⭐ ${selectedSupporter.averageRating.toFixed(1)} / 5 (${selectedSupporter.ratingCount} ${copy.ratings})` : 'No ratings yet'}</p>
            <label className="text-xs font-bold">{copy.note}</label>
            <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder={copy.notePlaceholder} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm" />
            <div className="flex justify-end gap-2"><button onClick={() => setSelectedSupporter(null)} className="px-4 py-2 rounded-xl text-xs font-bold">Cancel</button><button onClick={requestSupport} disabled={sendingRequest} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">{sendingRequest ? 'Sending...' : copy.request}</button></div>
          </div>
        </div>
      )}

      {requests.filter(r => r.status === 'completed' && r.sessionId && !r.rated).map(r => (
        <div key={`rate-${r.id}`} className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <h3 className="font-bold">{copy.rate}: {r.supporterName}</h3>
          <div className="flex gap-1 my-3">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} className={`text-3xl ${n <= rating ? 'text-amber-500' : 'text-slate-300'}`}>★</button>)}</div>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder={copy.feedback} className="w-full p-3 rounded-xl border bg-white/80 text-sm mb-3" rows={2} />
          <button disabled={!rating || ratingBusy} onClick={() => rateSession(r.sessionId!)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">{copy.submit}</button>
        </div>
      ))}
    </div>
  );
};
