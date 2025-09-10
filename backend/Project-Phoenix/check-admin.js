require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/user/Admin');

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('✅ Connected to MongoDB');
    
    const admins = await Admin.find({});
    console.log(`\n👥 Found ${admins.length} admin(s):`);
    
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. Email: ${admin.email}`);
      console.log(`   Fullname: ${admin.fullname || 'N/A'}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Created: ${admin.createdAt}`);
    });
    
    if (admins.length === 0) {
      console.log('\n⚠️  No admin users found. You may need to create one first.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkAdmins();

