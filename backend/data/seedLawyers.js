const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Lawyer = require('../models/Lawyer');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SEED_LAWYERS = [
  // Delhi NCR Region
  {
    name: 'Advocate Rajesh Sharma',
    specialization: 'Criminal Law',
    experience: 15,
    rating: 4.7,
    reviewCount: 128,
    contact: { phone: '98XXXX1001', email: 'rajesh.sharma@advocate.in' },
    barCouncilId: 'DL/1234/2010',
    location: { city: 'New Delhi', state: 'Delhi', address: 'Patiala House Courts, New Delhi', coordinates: { lat: 28.6139, lng: 77.2090 } },
    languages: ['English', 'Hindi'],
    availability: 'available',
    consultationFee: 2000,
    categories: ['Criminal'],
    isVerified: true
  },
  {
    name: 'Advocate Priya Mehta',
    specialization: 'Family Law',
    experience: 10,
    rating: 4.8,
    reviewCount: 95,
    contact: { phone: '98XXXX1002', email: 'priya.mehta@advocate.in' },
    barCouncilId: 'DL/2345/2013',
    location: { city: 'New Delhi', state: 'Delhi', address: 'Saket District Court, New Delhi', coordinates: { lat: 28.5245, lng: 77.2066 } },
    languages: ['English', 'Hindi'],
    availability: 'available',
    consultationFee: 1500,
    categories: ['Family'],
    isVerified: true
  },
  {
    name: 'Advocate Vikram Singh',
    specialization: 'Cyber Law',
    experience: 8,
    rating: 4.5,
    reviewCount: 67,
    contact: { phone: '98XXXX1003', email: 'vikram.singh@advocate.in' },
    barCouncilId: 'DL/3456/2015',
    location: { city: 'Noida', state: 'Uttar Pradesh', address: 'Sector 62, Noida', coordinates: { lat: 28.6270, lng: 77.3769 } },
    languages: ['English', 'Hindi'],
    availability: 'available',
    consultationFee: 1800,
    categories: ['Cyber', 'Criminal'],
    isVerified: true
  },
  {
    name: 'Advocate Neha Gupta',
    specialization: 'Consumer Law',
    experience: 12,
    rating: 4.6,
    reviewCount: 150,
    contact: { phone: '98XXXX1004', email: 'neha.gupta@advocate.in' },
    barCouncilId: 'DL/4567/2011',
    location: { city: 'Gurugram', state: 'Haryana', address: 'DLF Cyber City, Gurugram', coordinates: { lat: 28.4595, lng: 77.0266 } },
    languages: ['English', 'Hindi', 'Punjabi'],
    availability: 'available',
    consultationFee: 2500,
    categories: ['Consumer', 'Financial'],
    isVerified: true
  },
  {
    name: 'Advocate Arun Tiwari',
    specialization: 'Property Law',
    experience: 20,
    rating: 4.9,
    reviewCount: 210,
    contact: { phone: '98XXXX1005', email: 'arun.tiwari@advocate.in' },
    barCouncilId: 'DL/5678/2004',
    location: { city: 'New Delhi', state: 'Delhi', address: 'Tis Hazari Courts, New Delhi', coordinates: { lat: 28.6665, lng: 77.2247 } },
    languages: ['English', 'Hindi'],
    availability: 'available',
    consultationFee: 3000,
    categories: ['Property'],
    isVerified: true
  },

  // Mumbai Region
  {
    name: 'Advocate Sneha Desai',
    specialization: 'Corporate Law',
    experience: 14,
    rating: 4.7,
    reviewCount: 89,
    contact: { phone: '98XXXX2001', email: 'sneha.desai@advocate.in' },
    barCouncilId: 'MH/1234/2009',
    location: { city: 'Mumbai', state: 'Maharashtra', address: 'Bombay High Court, Fort, Mumbai', coordinates: { lat: 18.9280, lng: 72.8325 } },
    languages: ['English', 'Hindi', 'Marathi'],
    availability: 'available',
    consultationFee: 3500,
    categories: ['Financial', 'Consumer'],
    isVerified: true
  },
  {
    name: 'Advocate Rohan Patil',
    specialization: 'Labor Law',
    experience: 11,
    rating: 4.4,
    reviewCount: 73,
    contact: { phone: '98XXXX2002', email: 'rohan.patil@advocate.in' },
    barCouncilId: 'MH/2345/2012',
    location: { city: 'Mumbai', state: 'Maharashtra', address: 'Andheri Court, Mumbai', coordinates: { lat: 19.1136, lng: 72.8697 } },
    languages: ['English', 'Hindi', 'Marathi'],
    availability: 'available',
    consultationFee: 2000,
    categories: ['Labor'],
    isVerified: true
  },
  {
    name: 'Advocate Meera Joshi',
    specialization: 'Criminal Law',
    experience: 18,
    rating: 4.8,
    reviewCount: 190,
    contact: { phone: '98XXXX2003', email: 'meera.joshi@advocate.in' },
    barCouncilId: 'MH/3456/2006',
    location: { city: 'Pune', state: 'Maharashtra', address: 'Pune District Court', coordinates: { lat: 18.5204, lng: 73.8567 } },
    languages: ['English', 'Hindi', 'Marathi'],
    availability: 'available',
    consultationFee: 2500,
    categories: ['Criminal'],
    isVerified: true
  },

  // Bangalore Region
  {
    name: 'Advocate Karthik Reddy',
    specialization: 'Cyber Law',
    experience: 9,
    rating: 4.6,
    reviewCount: 82,
    contact: { phone: '98XXXX3001', email: 'karthik.reddy@advocate.in' },
    barCouncilId: 'KA/1234/2014',
    location: { city: 'Bengaluru', state: 'Karnataka', address: 'Koramangala, Bengaluru', coordinates: { lat: 12.9352, lng: 77.6245 } },
    languages: ['English', 'Hindi', 'Kannada', 'Telugu'],
    availability: 'available',
    consultationFee: 2000,
    categories: ['Cyber', 'Criminal'],
    isVerified: true
  },
  {
    name: 'Advocate Lakshmi Iyer',
    specialization: 'Environmental Law',
    experience: 13,
    rating: 4.5,
    reviewCount: 56,
    contact: { phone: '98XXXX3002', email: 'lakshmi.iyer@advocate.in' },
    barCouncilId: 'KA/2345/2010',
    location: { city: 'Bengaluru', state: 'Karnataka', address: 'MG Road, Bengaluru', coordinates: { lat: 12.9716, lng: 77.5946 } },
    languages: ['English', 'Hindi', 'Kannada', 'Tamil'],
    availability: 'available',
    consultationFee: 1800,
    categories: ['Environmental'],
    isVerified: true
  },

  // Chennai Region
  {
    name: 'Advocate Suresh Kumar',
    specialization: 'Consumer Law',
    experience: 16,
    rating: 4.7,
    reviewCount: 134,
    contact: { phone: '98XXXX4001', email: 'suresh.kumar@advocate.in' },
    barCouncilId: 'TN/1234/2008',
    location: { city: 'Chennai', state: 'Tamil Nadu', address: 'Madras High Court, Chennai', coordinates: { lat: 13.0827, lng: 80.2707 } },
    languages: ['English', 'Hindi', 'Tamil'],
    availability: 'available',
    consultationFee: 1500,
    categories: ['Consumer', 'Financial'],
    isVerified: true
  },
  {
    name: 'Advocate Anitha Rajan',
    specialization: 'Family Law',
    experience: 10,
    rating: 4.6,
    reviewCount: 78,
    contact: { phone: '98XXXX4002', email: 'anitha.rajan@advocate.in' },
    barCouncilId: 'TN/2345/2013',
    location: { city: 'Chennai', state: 'Tamil Nadu', address: 'T. Nagar, Chennai', coordinates: { lat: 13.0418, lng: 80.2341 } },
    languages: ['English', 'Tamil'],
    availability: 'available',
    consultationFee: 1200,
    categories: ['Family'],
    isVerified: true
  },

  // Kolkata Region
  {
    name: 'Advocate Amit Banerjee',
    specialization: 'Constitutional Law',
    experience: 22,
    rating: 4.9,
    reviewCount: 230,
    contact: { phone: '98XXXX5001', email: 'amit.banerjee@advocate.in' },
    barCouncilId: 'WB/1234/2002',
    location: { city: 'Kolkata', state: 'West Bengal', address: 'Calcutta High Court, Kolkata', coordinates: { lat: 22.5726, lng: 88.3639 } },
    languages: ['English', 'Hindi', 'Bengali'],
    availability: 'available',
    consultationFee: 3000,
    categories: ['Criminal', 'Government'],
    isVerified: true
  },
  {
    name: 'Advocate Dipika Sen',
    specialization: 'Healthcare Law',
    experience: 7,
    rating: 4.3,
    reviewCount: 45,
    contact: { phone: '98XXXX5002', email: 'dipika.sen@advocate.in' },
    barCouncilId: 'WB/2345/2016',
    location: { city: 'Kolkata', state: 'West Bengal', address: 'Salt Lake, Kolkata', coordinates: { lat: 22.5800, lng: 88.4150 } },
    languages: ['English', 'Hindi', 'Bengali'],
    availability: 'available',
    consultationFee: 1500,
    categories: ['Healthcare'],
    isVerified: true
  },

  // Hyderabad Region
  {
    name: 'Advocate Ravi Prasad',
    specialization: 'Property Law',
    experience: 17,
    rating: 4.7,
    reviewCount: 156,
    contact: { phone: '98XXXX6001', email: 'ravi.prasad@advocate.in' },
    barCouncilId: 'TS/1234/2007',
    location: { city: 'Hyderabad', state: 'Telangana', address: 'HITEC City, Hyderabad', coordinates: { lat: 17.4485, lng: 78.3908 } },
    languages: ['English', 'Hindi', 'Telugu'],
    availability: 'available',
    consultationFee: 2000,
    categories: ['Property'],
    isVerified: true
  },
  {
    name: 'Advocate Swathi Naidu',
    specialization: 'Civil Law',
    experience: 12,
    rating: 4.5,
    reviewCount: 92,
    contact: { phone: '98XXXX6002', email: 'swathi.naidu@advocate.in' },
    barCouncilId: 'TS/2345/2011',
    location: { city: 'Hyderabad', state: 'Telangana', address: 'Jubilee Hills, Hyderabad', coordinates: { lat: 17.4326, lng: 78.4071 } },
    languages: ['English', 'Hindi', 'Telugu'],
    availability: 'available',
    consultationFee: 1800,
    categories: ['Consumer', 'Government'],
    isVerified: true
  },

  // Jaipur Region
  {
    name: 'Advocate Mahesh Agarwal',
    specialization: 'Financial Law',
    experience: 14,
    rating: 4.6,
    reviewCount: 103,
    contact: { phone: '98XXXX7001', email: 'mahesh.agarwal@advocate.in' },
    barCouncilId: 'RJ/1234/2009',
    location: { city: 'Jaipur', state: 'Rajasthan', address: 'Rajasthan High Court, Jaipur', coordinates: { lat: 26.9124, lng: 75.7873 } },
    languages: ['English', 'Hindi'],
    availability: 'available',
    consultationFee: 1500,
    categories: ['Financial', 'Consumer'],
    isVerified: true
  },
  {
    name: 'Advocate Sunita Rathore',
    specialization: 'Education Law',
    experience: 8,
    rating: 4.4,
    reviewCount: 38,
    contact: { phone: '98XXXX7002', email: 'sunita.rathore@advocate.in' },
    barCouncilId: 'RJ/2345/2015',
    location: { city: 'Jaipur', state: 'Rajasthan', address: 'Malviya Nagar, Jaipur', coordinates: { lat: 26.8580, lng: 75.8030 } },
    languages: ['English', 'Hindi'],
    availability: 'available',
    consultationFee: 1000,
    categories: ['Education'],
    isVerified: true
  },

  // Lucknow Region
  {
    name: 'Advocate Sanjay Verma',
    specialization: 'Criminal Law',
    experience: 19,
    rating: 4.8,
    reviewCount: 175,
    contact: { phone: '98XXXX8001', email: 'sanjay.verma@advocate.in' },
    barCouncilId: 'UP/1234/2005',
    location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Allahabad High Court Bench, Lucknow', coordinates: { lat: 26.8467, lng: 80.9462 } },
    languages: ['English', 'Hindi', 'Urdu'],
    availability: 'available',
    consultationFee: 2000,
    categories: ['Criminal'],
    isVerified: true
  },
  {
    name: 'Advocate Pooja Mishra',
    specialization: 'Traffic Law',
    experience: 5,
    rating: 4.2,
    reviewCount: 29,
    contact: { phone: '98XXXX8002', email: 'pooja.mishra@advocate.in' },
    barCouncilId: 'UP/2345/2018',
    location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Hazratganj, Lucknow', coordinates: { lat: 26.8557, lng: 80.9514 } },
    languages: ['English', 'Hindi'],
    availability: 'available',
    consultationFee: 800,
    categories: ['Traffic'],
    isVerified: true
  },

  // Ahmedabad Region
  {
    name: 'Advocate Harish Patel',
    specialization: 'Labor Law',
    experience: 16,
    rating: 4.6,
    reviewCount: 112,
    contact: { phone: '98XXXX9001', email: 'harish.patel@advocate.in' },
    barCouncilId: 'GJ/1234/2008',
    location: { city: 'Ahmedabad', state: 'Gujarat', address: 'Gujarat High Court, Ahmedabad', coordinates: { lat: 23.0225, lng: 72.5714 } },
    languages: ['English', 'Hindi', 'Gujarati'],
    availability: 'available',
    consultationFee: 1800,
    categories: ['Labor'],
    isVerified: true
  },
  {
    name: 'Advocate Alka Shah',
    specialization: 'General Practice',
    experience: 10,
    rating: 4.4,
    reviewCount: 65,
    contact: { phone: '98XXXX9002', email: 'alka.shah@advocate.in' },
    barCouncilId: 'GJ/2345/2013',
    location: { city: 'Ahmedabad', state: 'Gujarat', address: 'SG Highway, Ahmedabad', coordinates: { lat: 23.0300, lng: 72.5100 } },
    languages: ['English', 'Hindi', 'Gujarati'],
    availability: 'available',
    consultationFee: 1200,
    categories: ['Other', 'Consumer', 'Property'],
    isVerified: true
  },
  // Chandigarh Region
  {
    name: 'Advocate Gurpreet Kaur',
    specialization: 'Family Law',
    experience: 11,
    rating: 4.5,
    reviewCount: 84,
    contact: { phone: '98XXXX0001', email: 'gurpreet.kaur@advocate.in' },
    barCouncilId: 'CH/1234/2012',
    location: { city: 'Chandigarh', state: 'Chandigarh', address: 'Punjab & Haryana High Court', coordinates: { lat: 30.7333, lng: 76.7794 } },
    languages: ['English', 'Hindi', 'Punjabi'],
    availability: 'available',
    consultationFee: 1500,
    categories: ['Family'],
    isVerified: true
  },
  {
    name: 'Advocate Deepak Thakur',
    specialization: 'Criminal Law',
    experience: 13,
    rating: 4.6,
    reviewCount: 97,
    contact: { phone: '98XXXX0002', email: 'deepak.thakur@advocate.in' },
    barCouncilId: 'CH/2345/2010',
    location: { city: 'Chandigarh', state: 'Chandigarh', address: 'Sector 17, Chandigarh', coordinates: { lat: 30.7415, lng: 76.7683 } },
    languages: ['English', 'Hindi', 'Punjabi'],
    availability: 'available',
    consultationFee: 2000,
    categories: ['Criminal', 'Government'],
    isVerified: true
  },
];

const seedLawyers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing lawyers
    await Lawyer.deleteMany({});
    console.log('🗑️  Cleared existing lawyers');

    // Insert seed data
    const result = await Lawyer.insertMany(SEED_LAWYERS);
    console.log(`✅ Seeded ${result.length} lawyers across India`);

    // Summary
    const cities = [...new Set(result.map(l => l.location.city))];
    console.log(`📍 Cities covered: ${cities.join(', ')}`);

    await mongoose.disconnect();
    console.log('✅ Done! Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedLawyers();
