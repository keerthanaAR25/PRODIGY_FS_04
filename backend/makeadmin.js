const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/chatapp', { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('Connected to MongoDB!');
    const db = mongoose.connection.db;

    // Show all users
    const users = await db.collection('users').find({}).toArray();
    console.log('Total users found:', users.length);
    users.forEach(u => {
      console.log(' -', u.email, '| isAdmin:', u.isAdmin, '| isActive:', u.isActive);
    });

    // Make keerthana admin
    const result = await db.collection('users').updateOne(
      { email: 'keerthana@gmail.com' },
      { $set: { isAdmin: true, isActive: true } }
    );

    console.log('matchedCount:', result.matchedCount);
    console.log('modifiedCount:', result.modifiedCount);

    if (result.matchedCount === 0) {
      console.log('USER NOT FOUND - Please register at http://localhost:5173/register first!');
    } else {
      console.log('SUCCESS - keerthana@gmail.com is now admin!');
    }

    process.exit(0);
  })
  .catch(err => {
    console.log('MongoDB Error:', err.message);
    process.exit(1);
  });