// Run this from your backend folder:
// node check_and_fix_admin.js

const mongoose = require('mongoose');
require('dotenv').config();

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // First check what users exist
    const allUsers = await users.find({}).toArray();
    console.log('\n📋 All users in database:');
    allUsers.forEach(u => {
      console.log(`  - ${u.email} | username: ${u.username} | isAdmin: ${u.isAdmin} | isActive: ${u.isActive}`);
    });

    if (allUsers.length === 0) {
      console.log('\n❌ NO USERS FOUND! You need to register first at http://localhost:5173/register');
      process.exit(0);
    }

    // Fix keerthana@gmail.com
    const result = await users.updateOne(
      { email: 'keerthana@gmail.com' },
      { $set: { isAdmin: true, isActive: true } }
    );

    if (result.matchedCount === 0) {
      console.log('\n❌ User keerthana@gmail.com NOT FOUND in database!');
      console.log('➡️  Please register at http://localhost:5173/register first, then run this script again.');
    } else {
      console.log('\n✅ SUCCESS! keerthana@gmail.com is now admin');
      
      // Verify
      const adminUser = await users.findOne({ email: 'keerthana@gmail.com' });
      console.log('✅ Verified - isAdmin:', adminUser.isAdmin);
      console.log('\n🎉 Now login at: http://localhost:5173/admin/login');
      console.log('   Email:      keerthana@gmail.com');
      console.log('   Password:   Keerthana@123');
      console.log('   Secret Key: Keerthana@123');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixAdmin();