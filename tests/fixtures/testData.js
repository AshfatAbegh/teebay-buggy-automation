module.exports = {
  existingUser: {
    email: 'testuser@teebay.com',
    password: '123456',
  },
  categories: [
    'Electronics',
    'Furniture',
    'Home Appliances',
    'Sporting Goods',
    'Outdoor',
    'Toys',
  ],
  // Seed data from src/testData/additionalProducts.json, useful as fixed anchors for tests.
  seedProducts: {
    availableForBuyAndRent: { id: 1241, title: 'Funshine bear' },
    alreadySold: { id: 2134, title: 'Last of Us Part II PS5 game' },
    currentlyRented: { id: 2432, title: 'Blender' },
  },
};
