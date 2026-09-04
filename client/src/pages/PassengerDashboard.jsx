import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import TrainSearch from '../components/TrainSearch';
import PaymentModal from '../components/PaymentModal';
import ProfileMenu from '../context/ProfileMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { BookingSkeleton } from '../components/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import axios from '../api/axios';
import { STATIONS } from '../utils/services';
import Brand from '../components/Brand';
import ThemeToggle from '../components/ThemeToggle';

const SERVICE_META = [
  { key: 'luggage', label: 'Luggage Assistance', price: 30, per: 'item', qty: true, desc: 'Porter from gate to your berth.' },
  { key: 'escort', label: 'Seat & Coach Escort', price: 60, per: 'trip', desc: 'Guide to your exact coach.' },
  { key: 'wheelchair', label: 'Wheelchair & Priority', price: 80, per: 'trip', desc: 'Mobility assistance for seniors.' },
  { key: 'language', label: 'Multilingual Guide', price: 30, per: 'trip', desc: 'Telugu / Hindi / English help.' },
  { key: 'snacks', label: 'Berth Refreshments', price: 50, per: 'trip', desc: 'Water & snacks at your seat.' },
  { key: 'transport', label: 'Exit Gate & Cab Transfer', price: 40, per: 'trip', desc: 'Escort to cabs / autos.' },
];
const ACTIVE_STATUSES = ['pending', 'accepted', 'arriving', 'in_service'];
const WIZARD = [
  { id: 1, label: 'Journey' },
  { id: 2, label: 'Meet Point' },
  { id: 3, label: 'Services' },
];

export default function PassengerDashboard() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState('book'); // 'book' | 'trips' | 'help'
  const [step, setStep] = useState(1);
  const [bookingMode, setBookingMode] = useState('pnr');

  const [pnrInput, setPnrInput] = useState('');
  const [pnrLoading, setPnrLoading] = useState(false);
  const [pnrError, setPnrError] = useState('');

  const [selectedTrain, setSelectedTrain] = useState(null);
  const [journeyDate, setJourneyDate] = useState('');
  const [journeyTime, setJourneyTime] = useState('');
  const [station, setStation] = useState('KZJ');

  const [coach, setCoach] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [berthType, setBerthType] = useState('Lower');
  const [actionType, setActionType] = useState('load_to_seat');

  const [services, setServices] = useState({
    luggage: 1, escort: true, language: false, wheelchair: false, snacks: false, transport: false,
  });

  const [payOpen, setPayOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const calculateTotal = () =>
    SERVICE_META.reduce((sum, s) =>
      s.qty ? sum + (services[s.key] || 0) * s.price : sum + (services[s.key] ? s.price : 0), 0);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await axios.get('/bookings/my-bookings');
      setBookings(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 8000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const active = bookings.filter((b) => ACTIVE_STATUSES.includes(b.booking_status));
  const history = bookings.filter((b) => !ACTIVE_STATUSES.includes(b.booking_status));

  useEffect(() => {
    const tNo = searchParams.get('trainNo');
    const tName = searchParams.get('trainName');
    const stCode = searchParams.get('station');
    if (tNo) {
      setSelectedTrain({ train_no: tNo, train_name: tName || 'Express', stops: [{ code: stCode || 'KZJ' }] });
      if (stCode) setStation(stCode);
      setBookingMode('train');
      setTab('book');
      if (!journeyDate) setJourneyDate(new Date().toISOString().split('T')[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFetchPnr = async (e) => {
    e?.preventDefault();
    const pnr = pnrInput.trim();
    if (!/^\d{10}$/.test(pnr)) return setPnrError('Enter a valid 10-digit PNR.');
    setPnrLoading(true); setPnrError('');
    try {
      const res = await axios.get('/trains/pnr-status', { params: { pnrNumber: pnr } });
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setSelectedTrain({
          train_no: d.trainNumber, train_name: d.trainName,
          from: { name: d.boardingStation }, to: { name: d.destinationStation },
          stops: [{ code: d.boardingStation }],
        });
        if (d.boardingStation && STATIONS.some((s) => s.code === d.boardingStation)) setStation(d.boardingStation);
        if (d.journeyDate) {
          const parsed = new Date(d.journeyDate);
          if (!isNaN(parsed.getTime())) setJourneyDate(parsed.toISOString().split('T')[0]);
        }
        if (d.coach) setCoach(d.coach);
        if (d.berthNumber) setSeatNumber(d.berthNumber);
        if (d.berthType) setBerthType(d.berthType);
        if (!journeyDate) setJourneyDate(new Date().toISOString().split('T')[0]);
        toast.success(`PNR verified · Coach ${d.coach || 'TBD'} · Seat ${d.berthNumber || 'TBD'}`);
      }
    } catch (err) {
      setPnrError(err?.response?.data?.message || 'PNR fetch failed — use Station & Train mode instead.');
    } finally { setPnrLoading(false); }
  };

  const next1 = () => {
    if (!selectedTrain) return toast.error('Please select your train.');
    if (!journeyDate) return toast.error('Please choose the journey date.');
    setStep(2);
  };
  const next2 = () => {
    if (!coach.trim() || !seatNumber.trim()) return toast.error('Coach and Seat are required so your assistant can find you.');
    setStep(3);
  };
  const openPayment = () => {
    if (calculateTotal() === 0) return toast.error('Select at least one service.');
    setPayOpen(true);
  };

  const handlePaid = async (method) => {
    try {
      const { data } = await axios.post('/bookings', {
        train_no: selectedTrain.train_no,
        train_name: selectedTrain.train_name,
        station_code: station,
        journey_date: journeyDate,
        journey_time: journeyTime,
        services,
        total_price: calculateTotal(),
        payment_method: method,
        coach: coach.trim(),
        seat_number: seatNumber.trim(),
        berth_type: berthType,
        action_type: actionType,
        pnr: pnrInput.trim(),
      });
      setPayOpen(false);
      toast.success('Assistance booking confirmed!');
      navigate(`/booking/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const doCancel = async () => {
    if (!confirmCancel) return;
    try {
      await axios.post(`/bookings/${confirmCancel}/cancel`);
      setConfirmCancel(null);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Cancellation failed'); }
  };

  const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-sm';
  const label = 'block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <Brand sub={station || 'SC'} dark={theme === 'dark'} noLink={true} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ProfileMenu role="passenger" onNavigate={(x) => setTab(x)} />
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 mx-4 sm:mx-6 mb-3">
          {[
            { id: 'book', label: t('book') || 'Book' },
            { id: 'trips', label: t('myTrips') || 'My Trips', badge: active.length },
            { id: 'help', label: 'Help' },
          ].map((x) => (
            <button key={x.id} type="button" onClick={() => setTab(x.id)}
              className={`flex-1 px-3 py-2 min-h-[44px] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${tab === x.id ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>
              <span>{x.label}</span>
              {x.badge > 0 && <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">{x.badge}</span>}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 sm:pb-10">
        {tab === 'book' && (
          <div className="space-y-5 animate-fade-in">
            {/* Progress */}
            <div className="grid grid-cols-3 gap-2">
              {WIZARD.map((w) => (
                <button key={w.id} type="button" onClick={() => w.id < step && setStep(w.id)}
                  className="space-y-1.5 text-left">
                  <div className={`h-1.5 rounded-full transition-all ${step >= w.id ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                  <p className={`text-[11px] font-bold ${step === w.id ? 'text-black dark:text-white' : 'text-zinc-400'}`}>
                    {w.id}. {w.label}
                  </p>
                </button>
              ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className={`${card} space-y-5 animate-fade-in`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">Your Journey</h2>
                  <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <button type="button" onClick={() => setBookingMode('pnr')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg ${bookingMode === 'pnr' ? 'bg-white dark:bg-zinc-900 shadow-sm' : 'text-zinc-500'}`}>🎫 PNR</button>
                    <button type="button" onClick={() => setBookingMode('train')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg ${bookingMode === 'train' ? 'bg-white dark:bg-zinc-900 shadow-sm' : 'text-zinc-500'}`}>🚂 Train</button>
                  </div>
                </div>

                {bookingMode === 'pnr' ? (
                  <form onSubmit={handleFetchPnr} className="flex flex-col sm:flex-row gap-2.5">
                    <input type="text" maxLength={10} placeholder="10-digit PNR (auto-fills everything)"
                      value={pnrInput}
                      onChange={(e) => { setPnrInput(e.target.value.replace(/\D/g, '').slice(0, 10)); setPnrError(''); }}
                      className="input-base text-sm font-mono font-bold tracking-wider" />
                    <button type="submit" disabled={pnrLoading || pnrInput.length !== 10} className="btn-primary py-2.5 px-5 text-xs shrink-0">
                      {pnrLoading ? 'Verifying...' : 'Fetch →'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {STATIONS.map((st) => (
                        <button key={st.code} type="button" onClick={() => setStation(st.code)}
                          className={`p-3 rounded-xl border text-left ${station === st.code ? 'border-blue-600 bg-zinc-50 dark:bg-zinc-800/60' : 'border-zinc-200 dark:border-zinc-700'}`}>
                          <p className="font-bold text-xs font-mono text-blue-600 dark:text-blue-400">{st.code}</p>
                          <p className="font-semibold text-[11px] truncate">{st.name}</p>
                        </button>
                      ))}
                    </div>
                    <TrainSearch station={station} onSelect={(train) => {
                      setSelectedTrain(train);
                      const time = train.expected_arrival || train.scheduled_arrival || train.expected_departure || train.scheduled_departure;
                      if (time) setJourneyTime(time);
                      if (!journeyDate) setJourneyDate(new Date().toISOString().split('T')[0]);
                    }} />
                  </div>
                )}
                {pnrError && <p className="text-xs text-rose-600 dark:text-rose-400">{pnrError}</p>}
                {selectedTrain && (
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold font-mono text-blue-600 dark:text-blue-400">Train {selectedTrain.train_no}</p>
                      <p className="font-semibold">{selectedTrain.train_name} · {station}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Verified</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Journey Date</label>
                    <input type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} className="input-base text-sm" />
                  </div>
                  <div>
                    <label className={label}>Time (optional)</label>
                    <input type="time" value={journeyTime} onChange={(e) => setJourneyTime(e.target.value)} className="input-base text-sm" />
                  </div>
                </div>
                <div className="hidden sm:flex justify-end">
                  <button type="button" onClick={next1} className="btn-primary py-3 px-6 text-xs">Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className={`${card} space-y-5 animate-fade-in`}>
                <h2 className="text-lg font-bold tracking-tight">Where should we meet you?</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button type="button" onClick={() => setActionType('load_to_seat')}
                    className={`p-4 rounded-xl border text-left ${actionType === 'load_to_seat' ? 'border-blue-600 ring-1 ring-blue-600 bg-zinc-50 dark:bg-zinc-800/60' : 'border-zinc-200 dark:border-zinc-700'}`}>
                    <p className="font-bold text-xs">🚶 Boarding — load to seat</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Meet at entrance, carry bags to your berth.</p>
                  </button>
                  <button type="button" onClick={() => setActionType('collect_from_seat')}
                    className={`p-4 rounded-xl border text-left ${actionType === 'collect_from_seat' ? 'border-blue-600 ring-1 ring-blue-600 bg-zinc-50 dark:bg-zinc-800/60' : 'border-zinc-200 dark:border-zinc-700'}`}>
                    <p className="font-bold text-xs">🚪 De-boarding — collect at coach</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Meet at coach door, escort you out.</p>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={label}>Coach *</label>
                    <input type="text" placeholder="B2" value={coach} onChange={(e) => setCoach(e.target.value.toUpperCase())} className="input-base text-sm font-mono font-bold" />
                  </div>
                  <div>
                    <label className={label}>Seat *</label>
                    <input type="text" placeholder="45" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} className="input-base text-sm font-mono font-bold" />
                  </div>
                  <div>
                    <label className={label}>Berth</label>
                    <select value={berthType} onChange={(e) => setBerthType(e.target.value)} className="input-base text-sm">
                      <option>Lower</option><option>Middle</option><option>Upper</option>
                      <option>Side Lower</option><option>Side Upper</option><option>Window</option><option>Aisle</option>
                    </select>
                  </div>
                </div>
                <div className="hidden sm:flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary py-3 px-5 text-xs">← Back</button>
                  <button type="button" onClick={next2} className="btn-primary py-3 px-6 text-xs">Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className={`${card} space-y-4 animate-fade-in`}>
                <h2 className="text-lg font-bold tracking-tight">Choose services</h2>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {SERVICE_META.map((s) => {
                    const on = s.qty ? services[s.key] > 0 : Boolean(services[s.key]);
                    return (
                      <div key={s.key} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-xs">{s.label}</p>
                          <p className="text-[11px] text-zinc-500 truncate">{s.desc}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-xs">₹{s.price}</span>
                          {s.qty ? (
                            <div className="flex items-center gap-2">
                              <button type="button" aria-label="Decrease" onClick={() => setServices((p) => ({ ...p, [s.key]: Math.max(0, (p[s.key] || 0) - 1) }))}
                                className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800">-</button>
                              <span className="font-mono font-bold text-sm w-5 text-center">{services[s.key] || 0}</span>
                              <button type="button" aria-label="Increase" onClick={() => setServices((p) => ({ ...p, [s.key]: (p[s.key] || 0) + 1 }))}
                                className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800">+</button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => setServices((p) => ({ ...p, [s.key]: !p[s.key] }))}
                              className={`px-4 py-2 min-h-[40px] rounded-lg text-xs font-bold border transition-all ${on ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                              {on ? '✓ Added' : '+ Add'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="hidden sm:flex justify-between">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary py-3 px-5 text-xs">← Back</button>
                  <button type="button" onClick={openPayment} className="btn-primary py-3 px-6 text-xs">Review & Pay →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'trips' && (
          <div className="space-y-6 animate-fade-in">
            {loading ? (
              <div className="space-y-4"><BookingSkeleton /><BookingSkeleton /></div>
            ) : bookings.length === 0 ? (
              <div className={`${card} text-center py-12`}>
                <p className="font-bold text-sm mb-1">No bookings yet</p>
                <p className="text-xs text-zinc-500 mb-5">Book your first station assistance.</p>
                <button type="button" onClick={() => setTab('book')} className="btn-primary py-2.5 px-6 text-xs">Book Now →</button>
              </div>
            ) : (
              <>
                {active.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">Active ({active.length})</p>
                    {active.map((b) => (
                      <div key={b.id} className={`${card} flex items-center justify-between gap-3`}>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">Train {b.train_no} · {b.station_code}</p>
                          <p className="text-[11px] font-mono text-zinc-500">{b.booking_status?.toUpperCase()} · ₹{b.total_price}</p>
                        </div>
                        <button type="button" onClick={() => navigate(`/booking/${b.id}`)} className="btn-primary py-2 px-4 text-xs shrink-0">Live →</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">History</p>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                    {history.map((b) => (
                      <div key={b.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold">Train {b.train_no} · {b.journey_date}</p>
                          <p className="text-zinc-400 font-mono mt-0.5">{b.booking_status} · ₹{b.total_price}</p>
                        </div>
                        <button type="button" onClick={() => navigate(`/booking/${b.id}`)} className="btn-secondary py-1.5 px-3 text-[11px]">Details</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'help' && (
          <div className="max-w-md mx-auto space-y-4 animate-fade-in">
            <div className={`${card} text-center space-y-3`}>
              <p className="text-lg font-bold tracking-tight">Need urgent help?</p>
              <p className="text-xs text-zinc-500">SOS is available inside any active trip's live page.</p>
              {active.length > 0 ? (
                <button type="button" onClick={() => navigate(`/booking/${active[0].id}`)} className="btn-black w-full py-3.5 text-sm">🚨 Open Active Trip & SOS</button>
              ) : (
                <p className="text-[11px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">No active trip right now.</p>
              )}
            </div>
            <div className={`${card} text-xs space-y-2.5`}>
              <p className="font-bold uppercase tracking-widest text-zinc-400 font-mono text-[11px]">Support</p>
              <p>• Share your 6-digit OTP only in person on the platform.</p>
              <p>• Fixed tariffs — no platform bargaining ever.</p>
              <p>• Email: support@onecoolie.in · 24×7 station control at pilot hubs.</p>
            </div>
          </div>
        )}
      </main>

      {/* Mobile sticky action bar */}
      {tab === 'book' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-md sm:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Total</p>
              <p className="text-lg font-bold font-mono leading-none">₹{calculateTotal()}</p>
            </div>
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary py-3 px-4 text-xs">←</button>
            )}
            <button type="button" onClick={step === 1 ? next1 : step === 2 ? next2 : openPayment} className="btn-primary flex-1 py-3 text-xs">
              {step === 3 ? 'Review & Pay →' : 'Continue →'}
            </button>
          </div>
        </div>
      )}

      <PaymentModal open={payOpen} total={calculateTotal()} onClose={() => setPayOpen(false)} onPaid={handlePaid} />
      <ConfirmDialog
        open={Boolean(confirmCancel)}
        title="Cancel Assistance Booking"
        message="Your allocated assistant will be released back to the platform pool."
        confirmText="Yes, Cancel" cancelText="Keep Booking"
        onConfirm={doCancel} onCancel={() => setConfirmCancel(null)}
      />
    </div>
  );
}