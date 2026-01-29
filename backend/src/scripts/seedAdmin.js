/**
 * Admin Seed Script
 * 
 * Creates a default admin account for testing/development.
 * 
 * USAGE:
 *   npm run seed
 * 
 * DEFAULT CREDENTIALS:
 *   Username: admin
 *   Password: admin123
 * 
 * ⚠️ IMPORTANT: Change these credentials in production!
 * 
 */

import mongoose from 'mongoose';
import { config } from '../../config/env.js';
import { Admin } from '../models/Admin.js';

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seed...');
    
    // Connect to database
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      console.log('   Username: admin');
      console.log('   (password not shown for security)');
    } else {
      // Create new admin
      const admin = new Admin({
        username: 'admin',
        password: 'admin123', // Will be hashed by pre-save hook
        displayName: 'Administrator',
      });
      
      await admin.save();
      
      console.log('✅ Admin user created!');
      console.log('');
      console.log('   Credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('');
      console.log('   ⚠️ CHANGE THESE IN PRODUCTION!');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('');
    console.log('✅ Seed complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedAdmin();