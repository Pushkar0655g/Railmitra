import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Brand from '../components/Brand';
import ThemeToggle from '../components/ThemeToggle';
import axios from '../api/axios';

/* ============================================================
   ADMIN DASHBOARD — Swiss Operations Command Center
   Strictly Black (#000000), White (#FFFFFF), and OneCoolie Blue (#2563EB)
   ============================================================ */

function KycQueueCard({ applicant, onDecide }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-base shrink-0">
          {applicant.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-black dark:text-white">
              {applicant.name}
            </h4>
            <span className="badge-blue text-[10px]">
              KYC Pending
            </span>
          </div>

          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {applicant.email} · Station Hub:{' '}
            <strong className="text-blue-600 dark:text-blue-400">
              {applicant.station_code}
            </strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onDecide(applicant.id, 'approve')}
          className="btn-primary flex-1 sm:flex-none py-2 px-4 text-xs min-h-[44px]"
        >
          Approve Assistant
        </button>
        <button
          type="button"
          onClick={() => onDecide(applicant.id, 'reject')}
          className="btn-secondary flex-1 sm:flex-none py-2 px-4 text-xs min-h-[44px]"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingAssistants: 0,
    revenue: 0,
  });
  const [kycQueue, setKycQueue] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [s, p, b, sos] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/pending-assistants'),
        axios.get('/admin/bookings'),
        axios.get('/admin/sos-alerts').catch(() => ({ data: [] })),
      ]);
      setStats(s.data);
      setKycQueue(p.data);
      setBookings(b.data);
      setSosAlerts(sos.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 6000);

    if (window.socket) {
      const handleSos = () => fetchAll();
      const handleStatus = () => fetchAll();
      window.socket.on('sos_alert', handleSos);
      window.socket.on('status_update', handleStatus);
      return () => {
        clearInterval(interval);
        window.socket.off('sos_alert', handleSos);
        window.socket.off('status_update', handleStatus);
      };
    }

    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleDecide = async (id, action) => {
    try {
      if (action === 'approve') {
        await axios.post(`/admin/assistants/${id}/approve`);
      } else {
        await axios.post(`/admin/assistants/${id}/reject`);
      }
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Booking ID',
      'Passenger',
      'Train',
      'Station',
      'Date',
      'Amount',
      'Status',
      'Assistant',
    ];
    const rows = bookings.map((b) => [
      b.id?.slice(-8),
      b.passenger?.name || '—',
      b.train_no,
      b.station_code,
      b.journey_date,
      b.total_price,
      b.booking_status,
      b.assistant?.name || 'Unassigned',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OneCoolie-dispatch-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
  };

  const filteredBookings = bookings.filter((b) => {
    const q = filterQuery.toLowerCase();
    return (
      b.train_no?.toLowerCase().includes(q) ||
      b.train_name?.toLowerCase().includes(q) ||
      b.station_code?.toLowerCase().includes(q) ||
      b.passenger?.name?.toLowerCase().includes(q) ||
      b.booking_status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white font-sans">
      {/* ── Command Navigation ─────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-black text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          <Brand dark sub="HQ" noLink={true} />

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono text-zinc-400 hidden md:inline-block">
              {user?.name || 'Admin'} · Controller
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={exportCSV}
              className="btn-secondary text-xs py-2 px-3 min-h-[44px] bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800"
            >
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-xs font-bold text-blue-400 hover:text-white transition-colors min-h-[44px] px-2 flex items-center"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* ── SOS Alerts Banner ─────────────────────────────── */}
        {sosAlerts.length > 0 && (
          <div className="bg-black text-white border border-zinc-700 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
                Active Station SOS Alerts ({sosAlerts.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sosAlerts.map((sos, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1"
                >
                  <p className="font-bold text-white font-mono">
                    Station {sos.station_code} · Train {sos.train_no}
                  </p>
                  <p className="text-zinc-400">
                    Passenger ID: #{sos.booking_id?.slice(-6).toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Top Metric Cards (1 col below sm) ─────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Total Platform Bookings',
              value: loading ? '—' : stats.totalBookings,
              sub: 'All recorded platform jobs',
            },
            {
              label: 'KYC Verification Queue',
              value: loading ? '—' : stats.pendingAssistants,
              sub: 'Awaiting ID review',
            },
            {
              label: 'Total Settled Revenue',
              value: loading ? '—' : `₹${stats.revenue || 0}`,
              sub: 'Completed trips total',
            },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 font-mono block mb-1">
                {m.label}
              </span>
              <p className="text-3xl font-bold font-mono text-black dark:text-white">
                {m.value}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {m.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── KYC Queue ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Assistant KYC Verification Queue
              </h3>
              <p className="text-xs text-zinc-500">
                Review and approve incoming assistant applications
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {kycQueue.length} Pending
            </span>
          </div>

          {kycQueue.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-xs text-zinc-400 font-mono">
              KYC verification queue is clear. No pending applicants.
            </div>
          ) : (
            <div className="space-y-3">
              {kycQueue.map((app) => (
                <KycQueueCard
                  key={app.id}
                  applicant={app}
                  onDecide={handleDecide}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Bookings Master Table ─────────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Network Bookings Master
              </h3>
              <p className="text-xs text-zinc-500">
                Real-time transaction and passenger log
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search train, station, status..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="input-base text-xs py-2"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
                  <th className="pb-3 font-bold">Booking ID</th>
                  <th className="pb-3 font-bold">Passenger</th>
                  <th className="pb-3 font-bold">Train</th>
                  <th className="pb-3 font-bold">Hub</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Assistant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400 font-mono">
                      No matching bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        #{b.id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 font-bold text-black dark:text-white">
                        {b.passenger?.name || '—'}
                      </td>
                      <td className="py-3.5 font-mono">
                        {b.train_no} · {b.train_name}
                      </td>
                      <td className="py-3.5 font-mono font-bold">
                        {b.station_code}
                      </td>
                      <td className="py-3.5 font-mono text-zinc-500">
                        {b.journey_date}
                      </td>
                      <td className="py-3.5 font-mono font-bold text-black dark:text-white">
                        ₹{b.total_price}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            b.booking_status === 'completed'
                              ? 'bg-[#f5f5f7] dark:bg-[#0a0f1c] text-[#000000] dark:text-[#ffffff] border-[#e5e5e7] dark:border-[#1a1f2e]'
                              : 'bg-[#f5f5f7] dark:bg-[#0a0f1c] text-[#2563eb] border-[#2563eb]/40'
                          }`}
                        >
                          {b.booking_status}
                        </span>
                      </td>
                      <td className="py-3.5 text-zinc-600 dark:text-zinc-300">
                        {b.assistant?.name || (
                          <span className="text-zinc-400 italic">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}