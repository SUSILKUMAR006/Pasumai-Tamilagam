import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import District from './models/District.js';
import TreeSpecies from './models/TreeSpecies.js';
import User from './models/User.js';

dotenv.config();

const districts = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

const species = [
  { name: 'Neem', tamilName: 'வேம்பு (Vembu)', category: 'Native' },
  { name: 'Banyan', tamilName: 'ஆலமரம் (Aalamaram)', category: 'Shade' },
  { name: 'Peepal', tamilName: 'அரசமரம் (Arasamaram)', category: 'Shade' },
  { name: 'Tamarind', tamilName: 'புளியமரம் (Puliyamaram)', category: 'Fruit' },
  { name: 'Mango', tamilName: 'மாமரம் (Maamaram)', category: 'Fruit' },
  { name: 'Coconut', tamilName: 'தென்னை மரம் (Thennai)', category: 'Fruit' },
  { name: 'Teak', tamilName: 'தேக்கு (Thekku)', category: 'Timber' },
  { name: 'Jackfruit', tamilName: 'பலா மரம் (Palaamaram)', category: 'Fruit' },
  { name: 'Pongame Oiltree', tamilName: 'புங்க மரம் (Punga Maram)', category: 'Native' },
  { name: 'Jamun', tamilName: 'நாவல் மரம் (Naaval Maram)', category: 'Fruit' },
  { name: 'Sandalwood', tamilName: 'சந்தன மரம் (Chandana Maram)', category: 'Timber' },
  { name: 'Mahogany', tamilName: 'மகாகனி (Mahogany)', category: 'Timber' }
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Seeding Districts...');
    for (const dName of districts) {
      await District.findOneAndUpdate(
        { name: dName },
        { name: dName },
        { upsert: true, new: true }
      );
    }
    console.log(`${districts.length} Districts seeded.`);

    console.log('Seeding Tree Species...');
    for (const sp of species) {
      await TreeSpecies.findOneAndUpdate(
        { name: sp.name },
        sp,
        { upsert: true, new: true }
      );
    }
    console.log(`${species.length} Tree Species seeded.`);

    console.log('Seeding Default Admin User...');
    const adminEmail = 'admin@treemission.tn.gov.in';
    const adminPassword = 'Uzg-5JaBrc7M-Tn';
    const adminExists = await User.findOne({ email: adminEmail });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    if (!adminExists) {
      await User.create({
        name: 'Pasumai Tamilagam Admin',
        email: adminEmail,
        phone: '044-12345678',
        passwordHash,
        district: 'Chennai',
        role: 'ADMIN',
        status: 'ACTIVE',
      });
      console.log('Admin account created successfully.');
    } else {
      adminExists.passwordHash = passwordHash;
      await adminExists.save();
      console.log('Admin account password updated.');
    }
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
