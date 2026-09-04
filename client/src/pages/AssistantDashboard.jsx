import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import ProfileMenu from '../context/ProfileMenu';
import { activeServices } from '../utils/services';
import AssistantJobCard from '../components/AssistantJobCard';
import Brand from '../components/Brand';
import ThemeToggle from '../components/ThemeToggle';

const STATIONS = [
  { code: 'KZJ', name: 'Kazipet Junction' },
  { code: 'WL', name: 'Warangal' },
  { code: 'BZA', name: 'Vijayawada Junction' },
  { code: 'SC', name: 'Secunderabad Junction' },
];

export default function AssistantDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [station, setStation] = useState('KZJ');
  const [requests, setRequests] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [tab, setTab] = useState('live'); // 'live' | 'jobs' | 'history'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      const response = await axios.get('/assistants/me');
      setProfile(response.data);
      if (response.data?.station_code) setStation(response.data.station_code);
      setError('');
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired. Please sign in again.' : 'Unable to retrieve profile.');
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const [availableResponse, jobsResponse] = await Promise.all([
        axios.get('/assistants/available'),
        axios.get('/assistants/my-jobs'),
      ]);
      setRequests(Array.isArray(availableResponse.data) ? availableResponse.data : []);
      setMyJobs(Array.isArray(jobsResponse.data) ? jobsResponse.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.status === 401 ? 'Session expired. Please sign in again.' : 'Unable to sync dispatch board.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProfile(); loadDashboard(); }, [loadProfile, loadDashboard]);
  useEffect(() => {
    const interval = setInterval(() => loadDashboard(), 8000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const online = Boolean(profile?.is_online);
  const toggleDuty = async () => {
    if (!profile || actionLoading) return;
    const nextStatus = !online;
    setActionLoading(true); setError(''); setMessage('');
    try {
      const response = await axios.post('/assistants/availability', { is_online: nextStatus, station_code: station });
      setProfile(response.data);
      setMessage(nextStatus ? `On duty at ${station}.` : 'You are now off duty.');
      await loadDashboard();
    } catch (err) { setError(err.response?.data?.message || 'Unable to update availability.'); }
    finally { setActionLoading(false); }
  };

  const acceptJob = async (requestId) => {
    if (actionLoading) return;
    setActionLoading(true); setError(''); setMessage('');
    try {
      await axios.post(`/assistants/${requestId}/accept`);
      setMessage('Request accepted. Proceed to platform.');
      await loadDashboard();
      setTab('jobs');
    } catch (err) { setError(err.response?.data?.message || 'Request is no longer available.'); }
    finally { setActionLoading(false); }
  };

  const handleJobUpdate = useCallback(async (updatedJob) => {
    if (!updatedJob) { await loadDashboard(); return; }
    const normalizedJob = updatedJob.booking || updatedJob;
    setMyJobs((prev) => prev.map((j) => (j.id === normalizedJob.id ? { ...j, ...normalizedJob } : j)));
    await loadDashboard();
  }, [loadDashboard]);

  const activeJobs = myJobs.filter((j) => j.booking_status !== 'completed' && j.booking_status !== 'cancelled');
  const completedJobs = myJobs.filter((j) => j.booking_status === 'completed');
  const totalEarnings = completedJobs.reduce((t, j) => t + Number(j.total_price || 0), 0);
  const ratedJobs = completedJobs.filter((j) => j.rating);
  const averageRating = ratedJobs.length > 0
    ? (ratedJobs.reduce((t, j) => t + Number(j.rating), 0) / ratedJobs.length).toFixed(1)
    : '—';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-xs font-mono text-zinc-400">LOADING DISPATCH BOARD...</div>;
  }

  const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Brand sub={user?.station || 'SC'} noLink={true} />
            <button type="button" onClick={toggleDuty} disabled={actionLoading}
              className={`flex items-center gap-2 px-3 py-1.5 min-h-[44px] rounded-full border text-xs font-bold transition-all ${online ? 'border-blue-600 bg-zinc-50 dark:bg-zinc-800/60' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}>
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-blue-600 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
              <span className="hidden sm:inline">{online ? 'On Duty' : 'Off Duty'}</span>
              <span className="sm:hidden">{online ? 'On' : 'Off'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ProfileMenu role="assistant" onNavigate={(x) => setTab(x)} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-900/60 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</div>
        )}
        {message && (
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-medium">{message}</div>
        )}

        {/* Compact stat strip + tabs + station */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full sm:w-auto">
            {[
              { id: 'live', label: 'Requests', badge: requests.length },
              { id: 'jobs', label: 'Active', badge: activeJobs.length },
              { id: 'history', label: 'History', badge: 0 },
            ].map((x) => (
              <button key={x.id} type="button" onClick={() => setTab(x.id)}
                className={`flex-1 sm:flex-initial px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${tab === x.id ? 'bg-white dark:bg-zinc-900 shadow-sm' : 'text-zinc-500'}`}>
                <span>{x.label}</span>
                {x.badge > 0 && <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono">{x.badge}</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-mono text-zinc-500">
              ₹{totalEarnings} · ★{averageRating} · {completedJobs.length} done
            </p>
            <select value={station} onChange={(e) => setStation(e.target.value)}
              className="input-base text-xs py-2 px-3 w-auto font-mono font-bold min-h-[44px]">
              {STATIONS.map((st) => <option key={st.code} value={st.code}>{st.code}</option>)}
            </select>
          </div>
        </div>

        {tab === 'live' && (
          <div className="space-y-4 animate-fade-in">
            {!online ? (
              <div className={`${card} p-10 text-center max-w-md mx-auto`}>
                <p className="font-bold text-sm mb-1">You are Off Duty</p>
                <p className="text-xs text-zinc-500 mb-5">Go on duty to receive dispatches at {station}.</p>
                <button type="button" onClick={toggleDuty} className="btn-primary py-2.5 px-6 text-xs">Go On Duty →</button>
              </div>
            ) : requests.length === 0 ? (
              <div className={`${card} p-10 text-center max-w-md mx-auto`}>
                <p className="font-bold text-sm mb-1">No incoming requests</p>
                <p className="text-xs text-zinc-500">Waiting for bookings at {station}. Auto-refreshing.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {requests.map((req) => (
                  <div key={req.id} className={`${card} p-5 flex flex-col justify-between gap-4`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">Train {req.train_no}</span>
                        <span className="text-lg font-bold font-mono">₹{req.total_price}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3">{req.journey_date} · {req.passenger?.name || 'Traveller'}</p>
                      <div className="space-y-1">
                        {activeServices(req.services || {}).map((s) => (
                          <div key={s.key} className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                            <span>{s.label}</span><span className="font-mono font-bold">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => acceptJob(req.id)} disabled={actionLoading} className="btn-primary w-full py-2.5 text-xs">
                      Accept Request →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'jobs' && (
          <div className="space-y-5 animate-fade-in">
            {activeJobs.length === 0 ? (
              <div className={`${card} p-10 text-center max-w-md mx-auto`}>
                <p className="font-bold text-sm mb-1">No active jobs</p>
                <p className="text-xs text-zinc-500 mb-5">Accept a request from the board to begin.</p>
                <button type="button" onClick={() => setTab('live')} className="btn-primary py-2.5 px-6 text-xs">View Requests →</button>
              </div>
            ) : (
              activeJobs.map((job) => <AssistantJobCard key={job.id} job={job} onUpdate={handleJobUpdate} />)
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className={`${card} divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden animate-fade-in`}>
            {completedJobs.length === 0 ? (
              <div className="p-10 text-center text-xs text-zinc-400">No completed jobs yet.</div>
            ) : (
              completedJobs.map((job) => (
                <div key={job.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-sm">Train {job.train_no} · {job.train_name}</p>
                    <p className="text-zinc-400 font-mono mt-0.5">{job.journey_date} · {job.passenger?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {job.rating && <span className="font-bold font-mono">{job.rating}★</span>}
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">₹{job.total_price}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}