// seeds/seed.js

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Board = require('../models/Board');
const Pin = require('../models/Pin');
const { sampleUsers, sampleBoardNames, getSamplePins } = require('./sampalData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pinapp';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    await User.deleteMany({});
    await Board.deleteMany({});
    await Pin.deleteMany({});

    const users = await User.insertMany(sampleUsers);
    const allBoards = [];    

    for (const user of users) {
      const userBoards = await Board.insertMany(
        sampleBoardNames.map(name => ({
          name: `${user.username}'s ${name}`,
          description: `This is ${name} board`,
          user: user._id
        }))
      );

      for (const board of userBoards) {
        const pins = await Pin.insertMany(getSamplePins(user._id, board._id));
        board.pins = pins.map(pin => pin._id);
        await board.save();
        allBoards.push(board);
      }
    }

    console.log('✅ Seeding complete!');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Seed error:', err);
    mongoose.connection.close();
  }
};

seed();
