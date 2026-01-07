const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://jameel:11223344@cluster0.dgwxhjh.mongodb.net/Loyalty-Point-E-com');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  loyaltyPoints: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function updateUserPoints() {
  try {
    // Update all users to have 500 loyalty points
    const result = await User.updateMany({}, { loyaltyPoints: 500 });
    console.log('Updated users:', result.modifiedCount);
    
    // Show all users with their points
    const users = await User.find({}, 'name email loyaltyPoints');
    console.log('All users:');
    users.forEach(user => {
      console.log(`${user.name} (${user.email}): ${user.loyaltyPoints} points`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateUserPoints();