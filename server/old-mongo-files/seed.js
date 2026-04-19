const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Idea = require('./models/Idea');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/automation-ideas'
    );
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Idea.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Pratik Admin',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT'
    });

    const employee1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@company.com',
      password: 'rahul123',
      role: 'user',
      department: 'Operations'
    });

    const employee2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@company.com',
      password: 'priya123',
      role: 'user',
      department: 'Finance'
    });

    // Create ideas with rich status histories
    const ideas = [
      {
        title: 'Automated Invoice Processing',
        description:
          'Implement an AI-powered system to automatically extract data from invoices, validate against PO numbers, and route for approval. This would eliminate manual data entry for 500+ invoices per month and reduce processing time from 3 days to 4 hours. The system would use OCR technology combined with machine learning to continuously improve accuracy.',
        category: 'Software',
        priority: 'High',
        status: 'Implemented',
        submittedBy: employee2._id,
        impact: {
          timeSaved: '120 hours/month',
          costSaved: '₹15,000/month',
          notes: 'Reduces human error by 95%. ROI expected within 3 months.'
        },
        statusHistory: [
          { status: 'Pending', date: new Date('2024-01-15'), note: 'Idea submitted by Finance team', updatedBy: employee2._id },
          { status: 'Pending', date: new Date('2024-01-22'), note: 'Reviewed by IT and Finance leads', updatedBy: admin._id },
          { status: 'Approved', date: new Date('2024-02-01'), note: 'Approved — high ROI potential', updatedBy: admin._id },
          { status: 'In Progress', date: new Date('2024-02-15'), note: 'Development started with vendor', updatedBy: admin._id },
          { status: 'Implemented', date: new Date('2024-04-01'), note: 'Successfully deployed to production', updatedBy: admin._id }
        ]
      },
      {
        title: 'Employee Onboarding Automation',
        description:
          'Create an automated onboarding workflow that handles account creation, equipment requests, training module assignments, and digital document signing. New hires would receive a personalized portal with step-by-step guidance for their first 90 days.',
        category: 'Software',
        status: 'In Progress',
        submittedBy: admin._id,
        impact: {
          timeSaved: '40 hours/month',
          costSaved: '₹8,000/month',
          notes: 'Improves new hire satisfaction score by 60%'
        },
        statusHistory: [
          { status: 'Pending', date: new Date('2024-03-01'), note: 'Idea submitted', updatedBy: admin._id },
          { status: 'Approved', date: new Date('2024-03-10'), note: 'Fast-tracked due to high impact', updatedBy: admin._id },
          { status: 'In Progress', date: new Date('2024-03-20'), note: 'Phase 1: Account automation underway', updatedBy: admin._id }
        ]
      },
      {
        title: 'Warehouse Inventory Real-Time Sync',
        description:
          'Build a real-time inventory synchronization system between warehouse management and ERP. Currently, inventory counts are updated manually twice daily, causing discrepancies and overselling. This system would use barcode scanners and IoT sensors.',
        category: 'Controls',
        priority: 'High',
        status: 'Approved',
        submittedBy: employee1._id,
        impact: {
          timeSaved: '60 hours/month',
          costSaved: '₹25,000/month',
          notes: 'Eliminates stock discrepancies and reduces overselling by 99%'
        },
        statusHistory: [
          { status: 'Pending', date: new Date('2024-04-05'), note: 'Idea submitted', updatedBy: employee1._id },
          { status: 'Pending', date: new Date('2024-04-10'), note: 'Under logistics and IT review', updatedBy: admin._id },
          { status: 'Approved', date: new Date('2024-04-20'), note: 'Approved — pending resource allocation', updatedBy: admin._id }
        ]
      },
      {
        title: 'IT Ticket Auto-Classification',
        description:
          'Use NLP to automatically classify and route IT support tickets to the appropriate team. A machine learning model trained on 2 years of ticket history would predict category, priority level, and team assignment with 90%+ accuracy.',
        category: 'Software',
        status: 'Pending',
        submittedBy: employee1._id,
        impact: {
          timeSaved: '30 hours/month',
          costSaved: '₹5,000/month',
          notes: 'Reduces average ticket resolution time by 40%'
        },
        statusHistory: [
          { status: 'Pending', date: new Date('2024-05-01'), note: 'Idea submitted', updatedBy: employee1._id },
          { status: 'Pending', date: new Date('2024-05-05'), note: 'IT architecture team evaluating feasibility', updatedBy: admin._id }
        ]
      },
      {
        title: 'Automated Shift Scheduling',
        description:
          'Develop an intelligent scheduling system that considers employee availability, skill requirements, labor law compliance, and historical demand patterns to generate optimal shift schedules automatically. Includes swap request handling.',
        category: 'Software',
        status: 'Pending',
        submittedBy: employee1._id,
        impact: {
          timeSaved: '80 hours/month',
          costSaved: '₹12,000/month',
          notes: 'Improves schedule fairness and shift coverage by 45%'
        },
        statusHistory: [
          { status: 'Pending', date: new Date('2024-05-15'), note: 'Idea submitted', updatedBy: employee1._id }
        ]
      },
      {
        title: 'Customer Feedback Analysis Bot',
        description:
          'Build a bot that aggregates customer feedback from multiple channels (email, social media, surveys), performs sentiment analysis, and generates weekly insight reports with actionable recommendations for product teams.',
        category: 'Software',
        status: 'Rejected',
        submittedBy: employee1._id,
        impact: {
          timeSaved: '20 hours/month',
          costSaved: '₹3,000/month',
          notes: 'Better customer insights and faster response to trends'
        },
        statusHistory: [
          { status: 'Pending', date: new Date('2024-02-10'), note: 'Idea submitted', updatedBy: employee1._id },
          { status: 'Pending', date: new Date('2024-02-15'), note: 'Marketing team reviewing', updatedBy: admin._id },
          { status: 'Rejected', date: new Date('2024-02-25'), note: 'Similar tool already being procured from vendor', updatedBy: admin._id }
        ]
      },
      {
        title: 'Vendor Payment Reminder System',
        description:
          'Automated email and Slack reminders for upcoming vendor payment deadlines. Integrates with accounting system to track due dates and send escalation alerts for overdue payments. Includes dashboard for payment status overview.',
        category: 'Electrical',
        priority: 'High',
        status: 'Approved',
        submittedBy: admin._id,
        impact: {
          timeSaved: '15 hours/month',
          costSaved: '₹2,000/month',
          notes: 'Avoids late payment penalties averaging ₹500/month'
        },
        statusHistory: [
          { status: 'Pending', date: new Date('2024-04-12'), note: 'Idea submitted', updatedBy: admin._id },
          { status: 'Approved', date: new Date('2024-04-18'), note: 'Quick win — approved for immediate development', updatedBy: admin._id }
        ]
      },
      {
        title: 'Smart Meeting Room Booking',
        description:
          'Smart meeting room booking system that suggests optimal rooms based on attendee locations, room capacity, AV equipment requirements, and historical usage patterns. Features auto-release for no-shows after 10 minutes.',
        category: 'Mechanical',
        priority: 'Medium',
        status: 'In Progress',
        submittedBy: employee2._id,
        impact: {
          timeSaved: '25 hours/month',
          costSaved: '₹4,000/month',
          notes: 'Increases room utilization by 35%'
        },
        statusHistory: [
          { status: 'Pending', date: new Date('2024-03-05'), note: 'Idea submitted', updatedBy: employee2._id },
          { status: 'Pending', date: new Date('2024-03-08'), note: 'Facilities and IT review', updatedBy: admin._id },
          { status: 'Approved', date: new Date('2024-03-15'), note: 'Approved with modifications', updatedBy: admin._id },
          { status: 'In Progress', date: new Date('2024-04-01'), note: 'Development started — Phase 1: booking API', updatedBy: admin._id }
        ]
      }
    ];

    await Idea.insertMany(ideas);

    console.log('\n🎉 Seed data inserted successfully!\n');
    console.log('👤 Admin:     admin@company.com  /  admin123');
    console.log('👤 User:      rahul@company.com   /  rahul123');
    console.log('👤 User:      priya@company.com   /  priya123');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
