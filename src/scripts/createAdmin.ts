import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    // Use localhost:27018 for Docker setup, or localhost:27017 for local MongoDB
    const mongoUri = process.env.MONGODB_URI_LOCAL || 
                     'mongodb://localhost:27018/taahod';
    
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 URI:', mongoUri.replace(/\/\/.*@/, '//<credentials>@')); // Hide credentials if any
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@alhikmah.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminName = process.env.ADMIN_NAME || 'المسؤول';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
      
      await mongoose.disconnect();
      return;
    }

    await User.create({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'admin',
      language: 'ar',
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Name:', adminName);
    console.log('\n⚠️  Please change the password after first login!');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdminUser();
