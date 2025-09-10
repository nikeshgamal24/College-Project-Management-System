require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/user/Admin');
const bcrypt = require('bcryptjs');

async function createTestAdmin() {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if test admin already exists
    const existingAdmin = await Admin.findOne({ email: 'test@admin.com' });
    if (existingAdmin) {
      console.log('⚠️  Test admin already exists');
      await mongoose.disconnect();
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create test admin
    const testAdmin = new Admin({
      email: 'test@admin.com',
      fullname: 'Test Admin',
      password: hashedPassword,
      role: [5150], // Admin role
      phoneNumber: '1234567890'
    });
    
    await testAdmin.save();
    console.log('✅ Test admin created successfully');
    console.log('Email: test@admin.com');
    console.log('Password: password123');
    console.log('Role: Admin (5150)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createTestAdmin();

