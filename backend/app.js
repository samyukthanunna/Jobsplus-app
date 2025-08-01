const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path'); // Add this line

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Dummy User and Job Models (simplified for this self-contained file)
class User {
    constructor({ id, name, email, password, profile }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.profile = profile || {};
    }
}

class Job {
    constructor({ id, title, company, description, location, type, salary, skills, isRemote, isWeb3, employerId, isPremium }) {
        this.id = id || 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.title = title;
        this.company = company;
        this.description = description;
        this.location = location;
        this.type = type;
        this.salary = salary;
        this.skills = skills || [];
        this.isRemote = isRemote || false;
        this.isWeb3 = isWeb3 || false;
        this.employerId = employerId;
        this.isPremium = isPremium || false;
        this.status = 'active';
        this.createdAt = new Date();
    }
}

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const users = {};
const jobs = {};

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};

// =====================
// AUTHENTICATION ENDPOINTS
// =====================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, profile } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please enter all fields' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        
        // Check if user already exists
        if (Object.values(users).find(u => u.email === email)) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name, 
            email, 
            password: hashedPassword, 
            profile: profile || {}
        });
        
        users[newUser.id] = newUser;
        
        const payload = { user: { id: newUser.id } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully', 
            token, 
            user: { 
                id: newUser.id, 
                name: newUser.name, 
                email: newUser.email 
            } 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please enter all fields' });
        }
        
        const user = Object.values(users).find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ 
            success: true, 
            message: 'Logged in successfully', 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// =====================
// PROFILE ENDPOINTS
// =====================
app.get('/api/profile', authMiddleware, (req, res) => {
    try {
        const user = users[req.user.id];
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ 
            success: true, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                profile: user.profile 
            } 
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.put('/api/profile', authMiddleware, (req, res) => {
    try {
        const user = users[req.user.id];
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { bio, skills, publicWalletAddress, location } = req.body;
        
        // Update profile fields if provided
        if (bio !== undefined) user.profile.bio = bio;
        if (skills !== undefined) user.profile.skills = Array.isArray(skills) ? skills : [];
        if (publicWalletAddress !== undefined) user.profile.publicWalletAddress = publicWalletAddress;
        if (location !== undefined) user.profile.location = location;

        res.json({ 
            success: true, 
            message: 'Profile updated successfully', 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                profile: user.profile 
            } 
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// =====================
// JOB ENDPOINTS
// =====================
app.get('/api/jobs', (req, res) => {
    try {
        const { search, location, type, isRemote, isWeb3, skills } = req.query;
        
        let filteredJobs = Object.values(jobs).filter(job => job.status === 'active');

        // Apply filters
        if (search) {
            const searchLower = search.toLowerCase();
            filteredJobs = filteredJobs.filter(job => 
                job.title.toLowerCase().includes(searchLower) ||
                job.description.toLowerCase().includes(searchLower) ||
                job.company.toLowerCase().includes(searchLower) ||
                (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchLower)))
            );
        }

        if (location) {
            const locationLower = location.toLowerCase();
            filteredJobs = filteredJobs.filter(job => 
                job.location.toLowerCase().includes(locationLower)
            );
        }

        if (type) {
            filteredJobs = filteredJobs.filter(job => job.type === type);
        }

        if (isRemote === 'true') {
            filteredJobs = filteredJobs.filter(job => job.isRemote);
        }

        if (isWeb3 === 'true') {
            filteredJobs = filteredJobs.filter(job => job.isWeb3);
        }

        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
            filteredJobs = filteredJobs.filter(job => 
                job.skills && job.skills.some(skill => 
                    skillsArray.includes(skill.toLowerCase())
                )
            );
        }

        // Sort by creation date (newest first)
        filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ 
            success: true, 
            count: filteredJobs.length, 
            jobs: filteredJobs 
        });
    } catch (error) {
        console.error('Jobs fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/jobs', authMiddleware, (req, res) => {
    try {
        const { title, company, description, location, type, salary, skills, isRemote, isWeb3 } = req.body;
        
        // Validation
        if (!title || !company || !description || !location || !type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill all required fields' 
            });
        }

        const jobData = {
            title,
            company,
            description,
            location,
            type,
            salary: salary || { min: 0, max: 0, currency: 'USD' },
            skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
            isRemote: Boolean(isRemote),
            isWeb3: Boolean(isWeb3),
            employerId: req.user.id,
            isPremium: false
        };

        const newJob = new Job(jobData);
        jobs[newJob.id] = newJob;
        
        res.status(201).json({ 
            success: true, 
            message: 'Job created successfully', 
            job: newJob 
        });
    } catch (error) {
        console.error('Job creation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/jobs/premium', authMiddleware, (req, res) => {
    try {
        const { title, company, description, location, type, salary, skills, isRemote, isWeb3 } = req.body;
        
        // Validation
        if (!title || !company || !description || !location || !type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill all required fields' 
            });
        }

        const jobData = {
            title,
            company,
            description,
            location,
            type,
            salary: salary || { min: 0, max: 0, currency: 'USD' },
            skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
            isRemote: Boolean(isRemote),
            isWeb3: Boolean(isWeb3),
            employerId: req.user.id,
            isPremium: true,
            txHash: txHash
        };

        const newJob = new Job(jobData);
        jobs[newJob.id] = newJob;
        
        res.status(201).json({ 
            success: true, 
            message: 'Premium job created successfully', 
            job: newJob 
        });
    } catch (error) {
        console.error('Premium job creation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/jobs/match', authMiddleware, (req, res) => {
    try {
        const user = users[req.user.id];
        if (!user || !user.profile || !user.profile.skills || user.profile.skills.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User profile or skills not found. Please update your profile first.' 
            });
        }
        
        const userSkills = user.profile.skills.map(skill => skill.toLowerCase());
        const allJobs = Object.values(jobs).filter(job => job.status === 'active');
        
        const matchedJobs = allJobs.map(job => {
            if (!job.skills || job.skills.length === 0) {
                return { ...job, matchScore: 0 };
            }
            
            const jobSkills = job.skills.map(skill => skill.toLowerCase());
            const intersection = userSkills.filter(skill => jobSkills.includes(skill));
            const matchScore = intersection.length / Math.max(jobSkills.length, userSkills.length);
            
            return { ...job, matchScore };
        });
        
        const sortedJobs = matchedJobs
            .filter(job => job.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);
        
        res.json({ 
            success: true, 
            message: 'Jobs matched successfully', 
            count: sortedJobs.length, 
            jobs: sortedJobs.map(job => ({ 
                ...job, 
                matchScore: parseFloat(job.matchScore.toFixed(2)) 
            })) 
        });
    } catch (error) {
        console.error('Job matching error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get job by ID
app.get('/api/jobs/:id', (req, res) => {
    try {
        const job = jobs[req.params.id];
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        
        res.json({ success: true, job });
    } catch (error) {
        console.error('Job fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete job (only by employer)
app.delete('/api/jobs/:id', authMiddleware, (req, res) => {
    try {
        const job = jobs[req.params.id];
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        
        if (job.employerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
        }
        
        delete jobs[req.params.id];
        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Job deletion error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// For all other routes, serve the index.html file from the 'frontend' directory
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialize sample data
async function initializeSampleData() {
    console.log('🔄 Initializing sample data...');
    try {
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create sample users
        const user1 = new User({
            id: 'user_sample_1',
            name: 'Samyuktha Nunna',
            email: 'samyuktha@jobsplus.com',
            password: hashedPassword,
            profile: {
                bio: 'Full-stack developer with a passion for elegant user interfaces and Web3 technologies.',
                location: 'Adoni, Andhra Pradesh, India',
                skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Web3', 'Solidity', 'Express.js']
            }
        });
        users[user1.id] = user1;

        const user2 = new User({
            id: 'user_sample_2',
            name: 'Tech Recruiter',
            email: 'recruiter@techcorp.com',
            password: hashedPassword,
            profile: {
                bio: 'Talent acquisition specialist focusing on tech roles',
                location: 'San Francisco, CA',
                skills: ['Recruiting', 'HR', 'Talent Acquisition']
            }
        });
        users[user2.id] = user2;

        // Create sample jobs
        const jobs_data = [
            {
                title: 'Senior Frontend Developer',
                company: 'TechCorp Inc.',
                description: 'We are looking for a skilled frontend developer to join our team and build amazing user experiences with React and modern JavaScript.',
                location: 'San Francisco, CA',
                type: 'full-time',
                salary: { min: 120000, max: 150000, currency: 'USD' },
                skills: ['React', 'JavaScript', 'CSS', 'Git', 'TypeScript'],
                isRemote: true,
                isWeb3: false,
                employerId: user2.id
            },
            {
                title: 'Smart Contract Developer',
                company: 'BlockchainCorp',
                description: 'Join us in building the future of decentralized finance. Work with cutting-edge blockchain technology and smart contracts.',
                location: 'Remote',
                type: 'contract',
                salary: { min: 80000, max: 120000, currency: 'USD' },
                skills: ['Solidity', 'Web3', 'Ethereum', 'JavaScript', 'DeFi'],
                isRemote: true,
                isWeb3: true,
                employerId: user2.id,
                isPremium: true
            },
            {
                title: 'Full Stack Developer',
                company: 'StartupXYZ',
                description: 'Be part of our growing startup! Work on both frontend and backend technologies in a fast-paced environment.',
                location: 'New York, NY',
                type: 'full-time',
                salary: { min: 90000, max: 130000, currency: 'USD' },
                skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript'],
                isRemote: false,
                isWeb3: false,
                employerId: user2.id
            },
            {
                title: 'Web3 Product Manager',
                company: 'CryptoVentures',
                description: 'Lead product development for our Web3 platform. Experience with DeFi protocols and crypto markets preferred.',
                location: 'Austin, TX',
                type: 'full-time',
                salary: { min: 140000, max: 180000, currency: 'USD' },
                skills: ['Product Management', 'Web3', 'DeFi', 'Blockchain', 'Strategy'],
                isRemote: true,
                isWeb3: true,
                employerId: user2.id,
                isPremium: true
            },
            {
                title: 'Python Backend Developer',
                company: 'DataCorp',
                description: 'Build scalable backend systems using Python and modern frameworks. Work with big data and machine learning pipelines.',
                location: 'Seattle, WA',
                type: 'full-time',
                salary: { min: 110000, max: 140000, currency: 'USD' },
                skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
                isRemote: true,
                isWeb3: false,
                employerId: user2.id
            }
        ];

        jobs_data.forEach(jobData => {
            const job = new Job(jobData);
            jobs[job.id] = job;
        });

        console.log('✅ Sample data initialized successfully!');
        console.log(`📊 Created ${Object.keys(users).length} users and ${Object.keys(jobs).length} jobs`);
    } catch (error) {
        console.log('❌ Error initializing sample data:', error.message);
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 JobsPlus Backend Server Started!');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log('📱 Frontend available at: http://localhost:${PORT}');
    console.log('🔗 API Base URL: http://localhost:${PORT}/api');
    console.log('✅ Ready for development!');
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('    POST /api/auth/register - User registration');
    console.log('    POST /api/auth/login - User login');
    console.log('    GET  /api/profile - Get user profile');
    console.log('    PUT  /api/profile - Update user profile');
    console.log('    GET  /api/jobs - Get jobs (with filters)');
    console.log('    POST /api/jobs - Create standard job');
    console.log('    POST /api/jobs/premium - Create premium job');
    console.log('    GET  /api/jobs/match - Get matched jobs');
    console.log('    GET  /api/jobs/:id - Get job by ID');
    console.log('    DELETE /api/jobs/:id - Delete job');
    console.log('');
    
    // Initialize sample data after server starts
    initializeSampleData();
});