const mongoose = require('mongoose');
const Idea = require('./models/Idea');
const Counter = require('./models/Counter');
require('dotenv').config();

const migrate = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for migration...');

    const ideas = await Idea.find({ customId: { $exists: false } }).sort({ createdAt: 1 });
    console.log(`Found ${ideas.length} ideas needing custom IDs.`);

    const prefixMap = {
      'Software': 'S',
      'Mechanical': 'M',
      'Controls': 'C',
      'Electrical': 'E',
      'Other': 'O'
    };

    for (const idea of ideas) {
      const prefix = prefixMap[idea.category] || 'O';
      const counter = await Counter.findOneAndUpdate(
        { _id: prefix },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      idea.customId = `${prefix}${counter.seq}`;
      
      // Bypass validation in case legacy ideas are missing required fields (e.g. problemStatement)
      await Idea.updateOne({ _id: idea._id }, { $set: { customId: idea.customId } });
      
      console.log(`Assigned ${idea.customId} to idea: ${idea.title}`);
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
