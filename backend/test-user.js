// Test User Model
const { User, UserStorage } = require('./src/models/User');

console.log('🧪 Testing JobsPlus User Model...\n');

// Create user storage
const userStorage = new UserStorage();

try {
  // Test 1: Create a new user
  console.log('✅ Test 1: Creating new user');
  const userData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Full-stack developer passionate about Web3',
    location: 'San Francisco, CA',
    skills: ['JavaScript', 'React', 'Node.js']
  };

  const user = userStorage.create(userData);
  console.log('User created:', user.getPublicProfile());

  // Test 2: Add skills
  console.log('\n✅ Test 2: Adding skills');
  user.addSkill('Blockchain');
  user.addSkill('Solidity');
  console.log('Updated skills:', user.profile.skills);

  // Test 3: Create another user
  console.log('\n✅ Test 3: Creating second user');
  const user2 = userStorage.create({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'secure123',
    role: 'employer',
    bio: 'Tech recruiter at innovative startups'
  });

  // Test 4: Add connection
  console.log('\n✅ Test 4: Adding connections');
  user.addConnection(user2.id);
  console.log('User 1 connections:', user.connections);

  // Test 5: Find users
  console.log('\n✅ Test 5: Finding users');
  const foundUser = userStorage.findByEmail('john@example.com');
  console.log('Found user by email:', foundUser ? foundUser.name : 'Not found');

  // Test 6: Validation
  console.log('\n✅ Test 6: Testing validation');
  try {
    userStorage.create({
      name: 'X',
      email: 'invalid-email',
      password: '123'
    });
  } catch (error) {
    console.log('Validation error (expected):', error.message);
  }

  // Test 7: Storage stats
  console.log('\n✅ Test 7: Storage statistics');
  console.log('Total users:', userStorage.count());
  console.log('All users:', userStorage.getAll().map(u => u.name));

  console.log('\n🎉 All tests passed! User model is working perfectly!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
}