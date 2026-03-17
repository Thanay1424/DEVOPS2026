const User = require('../models/User');
const CrimeStats = require('../models/CrimeStats');

const seedDatabase = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@crimeindex.com' });
    if (adminExists) return;

    console.log('🌱 Seeding database with default data...');

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@crimeindex.com',
      password: 'Admin@1234',
      role: 'admin',
    });

    // Create demo user
    const demoUser = await User.create({
      username: 'analyst',
      email: 'analyst@crimeindex.com',
      password: 'Analyst@1234',
      role: 'user',
    });

    // Seed crime stats (12 months of data)
    const months = [
      { theft: 180, assault: 80, fraud: 50, cybercrime: 30, crimeIndex: 65, notes: 'January report' },
      { theft: 195, assault: 85, fraud: 55, cybercrime: 33, crimeIndex: 68, notes: 'February report' },
      { theft: 210, assault: 90, fraud: 58, cybercrime: 36, crimeIndex: 70, notes: 'March report' },
      { theft: 200, assault: 88, fraud: 54, cybercrime: 38, crimeIndex: 69, notes: 'April report' },
      { theft: 220, assault: 92, fraud: 60, cybercrime: 40, crimeIndex: 72, notes: 'May report' },
      { theft: 215, assault: 89, fraud: 57, cybercrime: 42, crimeIndex: 71, notes: 'June report' },
      { theft: 230, assault: 95, fraud: 63, cybercrime: 45, crimeIndex: 74, notes: 'July report' },
      { theft: 225, assault: 93, fraud: 61, cybercrime: 43, crimeIndex: 73, notes: 'August report' },
      { theft: 218, assault: 91, fraud: 59, cybercrime: 41, crimeIndex: 72, notes: 'September report' },
      { theft: 205, assault: 87, fraud: 56, cybercrime: 39, crimeIndex: 70, notes: 'October report' },
      { theft: 212, assault: 90, fraud: 60, cybercrime: 40, crimeIndex: 71, notes: 'November report' },
      { theft: 210, assault: 95, fraud: 60, cybercrime: 40, crimeIndex: 72, notes: 'December report (latest)' },
    ];

    for (const month of months) {
      await CrimeStats.create({
        ...month,
        region: 'National',
        reportedBy: admin._id,
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log('   👤 Admin  → email: admin@crimeindex.com  | password: Admin@1234');
    console.log('   👤 Analyst → email: analyst@crimeindex.com | password: Analyst@1234');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = seedDatabase;
