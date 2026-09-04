const supabase = require('../config/db');

// --------------------------------------------------
// PLATFORM STATS (GET /admin/stats)
// --------------------------------------------------

exports.getStats = async (req, res) => {
  try {
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    const { count: pendingAssistants } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'assistant')
      .eq('is_approved', false);

    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_price, payment_status');

    const revenue = (bookings || [])
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.total_price || 0), 0);

    res.json({
      totalBookings:      totalBookings || 0,
      pendingAssistants:  pendingAssistants || 0,
      revenue,
    });
  } catch (err) {
    console.error('ADMIN STATS ERROR:', err);
    res.status(500).json({ message: 'Unable to load stats.' });
  }
};

// --------------------------------------------------
// PENDING ASSISTANTS (GET /admin/pending-assistants)
// --------------------------------------------------

exports.getPendingAssistants = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, station_code, created_at')
    .eq('role', 'assistant')
    .eq('is_approved', false)
    .order('created_at', { ascending: true });

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
};

// --------------------------------------------------
// APPROVE ASSISTANT (POST /admin/assistants/:id/approve)
// --------------------------------------------------

exports.approveAssistant = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .update({ is_approved: true })
    .eq('id', req.params.id)
    .eq('role', 'assistant')
    .select();

  if (error || data.length === 0)
    return res.status(400).json({ message: 'Assistant not found.' });

  res.json(data[0]);
};

// --------------------------------------------------
// REJECT ASSISTANT (POST /admin/assistants/:id/reject)
// --------------------------------------------------

exports.rejectAssistant = async (req, res) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', req.params.id)
    .eq('role', 'assistant');

  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: 'Assistant rejected and removed.' });
};

// --------------------------------------------------
// MASTER BOOKING LEDGER (GET /admin/bookings)
//
// Returns every booking record with:
//   - booking/service ID
//   - passenger ID + details
//   - assistant ID + details
//   - requested services
//   - train number / name
//   - journey date
//   - total amount
//   - payment status / method
//   - booking status
//   - created / completed timestamps
// --------------------------------------------------

exports.getAllBookings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_id,
        passenger_id,
        assistant_id,
        train_number,
        train_name,
        station_code,
        source,
        journey_date,
        service,
        service_description,
        total_price,
        payment_status,
        payment_method,
        booking_status,
        assistant_status,
        rating,
        created_at,
        updated_at,
        service_started_at,
        completed_at,
        passenger:passenger_id(id, name, email, phone),
        assistant:assistant_id(id, name, email, phone, station_code)
      `)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    // Normalise field names so AdminDashboard CSV export works
    const result = (data || []).map((b) => ({
      ...b,
      train_no:     b.train_number,  // Admin table uses train_no
      total_price:  Number(b.total_price) || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error('ADMIN ALL BOOKINGS ERROR:', err);
    res.status(500).json({ message: 'Unable to load bookings.' });
  }
};

// --------------------------------------------------
// SOS ALERTS (GET /admin/sos-alerts)
// --------------------------------------------------

exports.getSOSAlerts = async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, passenger:passenger_id(name, email)')
    .eq('sos_triggered', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ message: error.message });
  res.json(data || []);
};