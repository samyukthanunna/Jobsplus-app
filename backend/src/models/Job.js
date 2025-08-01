// Job Model for JobsPlus Platform
// Simple version without external dependencies

class Job {
  constructor(jobData) {
    this.id = jobData.id || this.generateId();
    this.title = jobData.title || '';
    this.company = jobData.company || '';
    this.description = jobData.description || '';
    this.location = jobData.location || '';
    this.type = jobData.type || 'full-time'; // full-time, part-time, contract, remote
    this.salary = {
      min: jobData.salary?.min || 0,
      max: jobData.salary?.max || 0,
      currency: jobData.salary?.currency || 'USD'
    };
    this.requirements = {
      skills: jobData.requirements?.skills || [],
      experience: jobData.requirements?.experience || 'entry-level',
      education: jobData.requirements?.education || ''
    };
    this.benefits = jobData.benefits || [];
    this.isRemote = jobData.isRemote || false;
    this.isWeb3 = jobData.isWeb3 || false;
    this.postedBy = jobData.postedBy || '';
    this.applicants = jobData.applicants || [];
    this.status = jobData.status || 'active'; // active, closed, draft
    this.createdAt = jobData.createdAt || new Date().toISOString();
    this.updatedAt = jobData.updatedAt || new Date().toISOString();
    this.expiresAt = jobData.expiresAt || this.getExpiryDate();
  }

  generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `job_${timestamp}_${random}`;
  }

  getExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    return date.toISOString();
  }

  // Update job details
  updateJob(updates) {
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        this[key] = updates[key];
      }
    });
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Add applicant to job
  addApplicant(userId) {
    if (!this.applicants.includes(userId)) {
      this.applicants.push(userId);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Remove applicant
  removeApplicant(userId) {
    const index = this.applicants.indexOf(userId);
    if (index > -1) {
      this.applicants.splice(index, 1);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Check if job is expired
  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  // Get job summary
  getSummary() {
    return {
      id: this.id,
      title: this.title,
      company: this.company,
      location: this.location,
      type: this.type,
      salary: this.salary,
      isRemote: this.isRemote,
      isWeb3: this.isWeb3,
      applicantsCount: this.applicants.length,
      status: this.status,
      createdAt: this.createdAt
    };
  }

  // Validate job data
  validate() {
    const errors = [];
    
    if (!this.title.trim()) errors.push('Job title is required');
    if (!this.company.trim()) errors.push('Company name is required');
    if (!this.description.trim()) errors.push('Job description is required');
    if (this.salary.min < 0) errors.push('Minimum salary cannot be negative');
    if (this.salary.max < this.salary.min) errors.push('Maximum salary cannot be less than minimum');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Job Storage Class (In-memory for development)
class JobStorage {
  constructor() {
    this.jobs = new Map();
  }

  // Create new job
  create(jobData) {
    const job = new Job(jobData);
    const validation = job.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    this.jobs.set(job.id, job);
    return job;
  }

  // Find job by ID
  findById(id) {
    return this.jobs.get(id) || null;
  }

  // Find all jobs
  findAll() {
    return Array.from(this.jobs.values());
  }

  // Find jobs by company
  findByCompany(company) {
    return Array.from(this.jobs.values())
      .filter(job => job.company.toLowerCase().includes(company.toLowerCase()));
  }

  // Search jobs by skills
  searchBySkills(skills) {
    const searchSkills = skills.map(skill => skill.toLowerCase());
    return Array.from(this.jobs.values())
      .filter(job => {
        const jobSkills = job.requirements.skills.map(skill => skill.toLowerCase());
        return searchSkills.some(skill => jobSkills.includes(skill));
      });
  }

  // Filter jobs
  filter(filters) {
    let results = Array.from(this.jobs.values());

    if (filters.type) {
      results = results.filter(job => job.type === filters.type);
    }

    if (filters.isRemote !== undefined) {
      results = results.filter(job => job.isRemote === filters.isRemote);
    }

    if (filters.isWeb3 !== undefined) {
      results = results.filter(job => job.isWeb3 === filters.isWeb3);
    }

    if (filters.location) {
      results = results.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.salaryMin) {
      results = results.filter(job => job.salary.min >= filters.salaryMin);
    }

    if (filters.salaryMax) {
      results = results.filter(job => job.salary.max <= filters.salaryMax);
    }

    return results;
  }

  // Update job
  update(id, updates) {
    const job = this.jobs.get(id);
    if (!job) return null;
    
    job.updateJob(updates);
    const validation = job.validate();
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    return job;
  }

  // Delete job
  delete(id) {
    return this.jobs.delete(id);
  }

  // Get jobs count
  count() {
    return this.jobs.size;
  }

  // Get active jobs
  getActiveJobs() {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'active' && !job.isExpired());
  }
}

module.exports = { Job, JobStorage };