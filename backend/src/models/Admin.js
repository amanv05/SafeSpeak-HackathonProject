/**
 * Admin Model
 * 
 * WHY THIS EXISTS:
 * - Separate authentication system just for admins
 * - Regular users (reporters) don't have accounts
 * - Passwords are hashed using bcrypt for security
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema({
  // Admin username (used for login)
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true, // No duplicate usernames
    lowercase: true, // Store as lowercase for consistent lookup
    trim: true, // Remove whitespace
    minlength: [3, 'Username must be at least 3 characters'],
  },
  
  // Hashed password
  // WHY hashed: NEVER store plain text passwords
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },
  
  // Admin display name (optional)
  displayName: {
    type: String,
    default: 'Admin',
  },
  
  // Last login timestamp
  lastLogin: {
    type: Date,
    default: null,
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },

}, {
  timestamps: true,
});

/**
 * Pre-save hook to hash password
 * 
 * WHY:
 * - Automatically hashes password before saving
 * - Only hashes if password was modified (not on every save)
 * - Uses bcrypt with salt rounds of 10 (good balance of security/speed)
 */
adminSchema.pre('save', async function(next) {
  // Only hash the password if it's been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate a salt (random data added to password before hashing)
    // WHY salt: Prevents rainbow table attacks
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare password for login
 * 
 * WHY a method:
 * - Encapsulates the comparison logic
 * - Keeps bcrypt usage consistent
 * - Can be called as: admin.comparePassword(candidatePassword)
 */
adminSchema.methods.comparePassword = async function(candidatePassword) {
  // bcrypt.compare handles the salt extraction and comparison
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Static method to find admin by credentials
 * 
 * WHY:
 * - Convenient method for login process
 * - Explicitly selects password field (since it's excluded by default)
 */
adminSchema.statics.findByCredentials = async function(username, password) {
  // Find admin and include password field
  const admin = await this.findOne({ username, isActive: true }).select('+password');
  
  if (!admin) {
    return null;
  }
  
  // Check password
  const isMatch = await admin.comparePassword(password);
  
  if (!isMatch) {
    return null;
  }
  
  return admin;
};

export const Admin = mongoose.model('Admin', adminSchema);