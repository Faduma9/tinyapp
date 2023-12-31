const getUserByEmail = function(email, database) {
    for (const userId in database) {
      const user = database[userId];
      if (user.email === email) {
        return user;
      }
    }
    return null; // Return null if the user is not found
  }
  
  module.exports = { getUserByEmail };
  
  