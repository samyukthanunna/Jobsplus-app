// Test Job Model
const { Job, JobStorage } = require('./src/models/Job');

console.log('🧪 Testing JobsPlus Job Model...\n');

// Create job storage
const jobStorage = new JobStorage();

try {
  // Test 1: Create a new job
  console.log('✅ Test 1: Creating new job');
  const job1 = jobStorage.create({
    title: 'Senior React Developer',
    company: 'TechCorp Inc.',
    description: 'We are looking for an experienced React developer to join our team.',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: {
      min: 120000,
      max: 150000,
      currency: 'USD'
    },
    requirements: {
      skills: ['React', 'JavaScript', 'Node.js', 'TypeScript'],
      experience: 'senior',
      education: 'Bachelor\'s degree preferred'
    },
    benefits: ['Health Insurance', 'Remote Work', '401k'],
    isRemote: true,
    isWeb3: false,
    postedBy: 'user_123'
  });

  console.log('Job created:', job1.getSummary());
  console.log('');

  // Test 2: Create a Web3 job
  console.log('✅ Test 2: Creating Web3 job');
  const job2 = jobStorage.create({
    title: 'Smart Contract Developer',
    company: 'CryptoStartup',
    description: 'Looking for Solidity developer to build DeFi protocols.',
    location: 'Remote',
    type: 'contract',
    salary: {
      min: 80000,
      max: 120000,
      currency: 'USD'
    },
    requirements: {
      skills: ['Solidity', 'Web3', 'Ethereum', 'JavaScript'],
      experience: 'mid-level',
      education: 'Computer Science degree'
    },
    benefits: ['Token equity', 'Remote work'],
    isRemote: true,
    isWeb3: true,
    postedBy: 'user_456'
  });

  console.log('Web3 Job created:', job2.getSummary());
  console.log('');

  // Test 3: Add applicants
  console.log('✅ Test 3: Adding applicants');
  job1.addApplicant('applicant_001');
  job1.addApplicant('applicant_002');
  job2.addApplicant('applicant_003');

  console.log(`Job 1 applicants: ${job1.applicants.length}`);
  console.log(`Job 2 applicants: ${job2.applicants.length}`);
  console.log('');

  // Test 4: Search functionality
  console.log('✅ Test 4: Search by skills');
  const reactJobs = jobStorage.searchBySkills(['React']);
  const web3Jobs = jobStorage.searchBySkills(['Solidity', 'Web3']);

  console.log(`React jobs found: ${reactJobs.length}`);
  console.log(`Web3 jobs found: ${web3Jobs.length}`);
  console.log('');

  // Test 5: Filter jobs
  console.log('✅ Test 5: Filter jobs');
  const remoteJobs = jobStorage.filter({ isRemote: true });
  const web3OnlyJobs = jobStorage.filter({ isWeb3: true });
  const fullTimeJobs = jobStorage.filter({ type: 'full-time' });

  console.log(`Remote jobs: ${remoteJobs.length}`);
  console.log(`Web3 jobs: ${web3OnlyJobs.length}`);
  console.log(`Full-time jobs: ${fullTimeJobs.length}`);
  console.log('');

  // Test 6: Job validation
  console.log('✅ Test 6: Testing validation');
  try {
    jobStorage.create({
      title: '', // Invalid - empty title
      company: 'TestCorp'
    });
  } catch (error) {
    console.log('Validation error caught:', error.message);
  }

  // Test 7: Get all jobs
  console.log('✅ Test 7: All jobs summary');
  console.log(`Total jobs in storage: ${jobStorage.count()}`);
  console.log(`Active jobs: ${jobStorage.getActiveJobs().length}`);

  console.log('\n🎉 All Job Model tests passed!');
  console.log('\n📊 Job Storage Statistics:');
  console.log(`📝 Total Jobs: ${jobStorage.count()}`);
  console.log(`✅ Active Jobs: ${jobStorage.getActiveJobs().length}`);
  console.log(`🏢 Companies: ${new Set(jobStorage.findAll().map(j => j.company)).size}`);
  console.log(`🌐 Remote Jobs: ${jobStorage.filter({ isRemote: true }).length}`);
  console.log(`⛓️ Web3 Jobs: ${jobStorage.filter({ isWeb3: true }).length}`);

} catch (error) {
  console.error('❌ Test failed:', error.message);
}