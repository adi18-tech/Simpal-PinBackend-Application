// seeds/sampleData.js

const sampleUsers = [
  { username: 'alice', email: 'alice@example.com' },
  { username: 'bob', email: 'bob@example.com' }
];

const sampleBoardNames = ['Travel', 'Recipes'];

const sampleImages = [
  'https://via.placeholder.com/300x200.png?text=Mountain',
  'https://via.placeholder.com/300x200.png?text=Beach',
  'https://via.placeholder.com/300x200.png?text=Pasta',
  'https://via.placeholder.com/300x200.png?text=Salad'
];

const getSamplePins = (userId, boardId) => [
  {
    title: 'Beautiful View',
    image: sampleImages[0],
    description: 'Amazing mountain landscape',
    user: userId,
    board: boardId
  },
  {
    title: 'Tasty Dish',
    image: sampleImages[2],
    description: 'Delicious pasta recipe',
    user: userId,
    board: boardId
  }
];

module.exports = {
  sampleUsers,
  sampleBoardNames,
  getSamplePins
};
