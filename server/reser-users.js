require('dotenv').config();
const db = require('./src/config/db');

async function reset() {
    // Dynamically load whichever bcrypt package is installed
    let bcryptLib;
    try { bcryptLib = require('bcryptjs'); } catch (e) { bcryptLib = require('bcrypt'); }

    const password = 'password12345';
    const hash = await bcryptLib.hash(password, 10);
    console.log('🔒 Password hashed successfully.');

    console.log('🗑️ Deleting all previous users...');
    const { error: delError } = await db.from('users').delete().not('id', 'is', null);
    if (delError) console.error('Delete error:', delError.message);
    else console.log('✅ All previous users deleted.');

    const users = [
        { name: 'Admin', email: 'admin@railmitra.com', password: hash, role: 'admin', is_approved: true, kyc_status: 'approved' },
        { name: 'Assistant SC', email: 'assistant@railmitra.com', password: hash, role: 'assistant', station_code: 'SC', is_approved: true, is_online: true, kyc_status: 'approved' },
        { name: 'Passenger 1', email: 'passenger@railmitra.com', password: hash, role: 'passenger', is_approved: true, kyc_status: 'approved' },
        { name: 'Pushkar', email: 'chirrapushkar19@gmail.com', password: hash, role: 'passenger', is_approved: true, kyc_status: 'approved' }
    ];

    console.log('⏳ Inserting new users...');
    const { data, error: insertError } = await db.from('users').insert(users).select();
    if (insertError) console.error('❌ Insert error:', insertError.message);
    else console.log(`🎉 Success! Created ${data.length} new accounts.`);

    process.exit(0);
}

reset().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});