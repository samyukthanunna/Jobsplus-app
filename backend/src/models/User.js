// User Model for JobsPlus Platform
// Simple version without external dependencies

class User {
  constructor(userData) {
    this.id = userData.id || this.generateId();
    this.name = userData.name || '';
    this.email = userData.email || '';
    this.password = userData.password || '';
    this.role = userData.role || 'user'; // 'user', 'employer', 'admin'
    this.profile = {
      bio: userData.bio || '',
      location: userData.location || '',
      skills: userData.skills || [],
      experience: userData.experience || [],
      education: userData.education || [],
      profilePicture: userData.profilePicture || null
    };
    this.wallet = {
      address: userData.walletAddress || null,
      balance: userData.balance || 0
    };
    this.connections = userData.connections || [];
    this.createdAt = userData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.isActive = userData.isActive !== false; // default to true
  }

  // Generate unique ID
  generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      profile: this.profile,
      wallet: {
        address: this.wallet.address,
        // Don't expose balance in basic JSON
      },
      connections: this.connections,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }

  // Get public profile (for other users to see)
  getPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      profile: {
        bio: this.profile.bio,
        location: this.profile.location,
        skills: this.profile.skills,
        profilePicture: this.profile.profilePicture
      },
      role: this.role
    };
  }

  // Add a skill
  addSkill(skill) {
    if (!this.profile.skills.includes(skill)) {
      this.profile.skills.push(skill);
      this.updatedAt = new Date().toISOString();
    }
  }

  // Add connection
  addConnection(userId) {
    if (!this.connections.includes(userId)) {
      this.connections.push(userId);
      this.updatedAt = new Date().toISOString();
    }
  }

  // Update profile
  updateProfile(updates) {
    Object.keys(updates).forEach(key => {
      if (this.profile.hasOwnProperty(key)) {
        this.profile[key] = updates[key];
      }
    });
    this.updatedAt = new Date().toISOString();
  }

  // Validate user data
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }
    
    if (!this.password || this.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Simple in-memory storage for development
class UserStorage {
  constructor() {
    this.users = new Map();
  }

  // Create new user
  create(userData) {
    const user = new User(userData);
    const validation = user.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Check if email already exists
    const existingUser = this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    this.users.set(user.id, user);
    return user;
  }

  // Find user by ID
  findById(id) {
    return this.users.get(id) || null;
  }

  // Find user by email
  findByEmail(email) {
    for (let user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  // Update user
  update(id, updates) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    Object.keys(updates).forEach(key => {
      if (key !== 'id' && user.hasOwnProperty(key)) {
        user[key] = updates[key];
      }
    });
    
    user.updatedAt = new Date().toISOString();
    return user;
  }

  // Delete user
  delete(id) {
    return this.users.delete(id);
  }

  // Get all users (for admin)
  getAll() {
    return Array.from(this.users.values());
  }

  // Get user count
  count() {
    return this.users.size;
  }
}

// Export for use in other files
module.exports = {
  User,
  UserStorage
};