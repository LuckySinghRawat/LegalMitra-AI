const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legalmitra');
  const Complaint = require('./models/Complaint');

  // Find complaints that are NOT already resolved/rejected and don't have scheduled dates
  const complaints = await Complaint.find({
    status: { $nin: ['resolved', 'rejected'] },
    scheduledDate: null
  }).sort({ createdAt: 1 }).limit(2);

  if (complaints.length === 0) {
    console.log('No available complaints to mark as past. All complaints are either scheduled or already resolved.');
    process.exit(0);
  }

  // Mark first one as resolved
  if (complaints[0]) {
    complaints[0].status = 'resolved';
    complaints[0].notes.push({
      text: 'Issue resolved after mediation with the consumer forum.',
      addedAt: new Date()
    });
    await complaints[0].save();
    console.log('Marked as RESOLVED: ' + complaints[0].title);
  }

  // Mark second one as rejected (if exists)
  if (complaints[1]) {
    complaints[1].status = 'rejected';
    complaints[1].notes.push({
      text: 'Complaint rejected due to insufficient evidence.',
      addedAt: new Date()
    });
    await complaints[1].save();
    console.log('Marked as REJECTED: ' + complaints[1].title);
  }

  console.log('\nDone! Past complaints seeded.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
