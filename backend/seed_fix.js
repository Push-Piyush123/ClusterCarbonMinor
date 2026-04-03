const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const InviteCode = require('./models/InviteCode');
const User = require('./models/User');
const Admin = require('./models/Admin');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        // 1. Clean up any failed registrations for Rajesh so we don't get "Email already registered"
        const deletedUser = await User.deleteOne({ email: 'rajesh@clustercarbon.org' });
        await Admin.deleteOne({ email: 'rajesh@clustercarbon.org' });
        console.log(`Cleaned up previous User registration attempts.`);

        // 2. Clean up the manually inserted InviteCode that has "dummy_admin_id"
        // We will use deleteMany to catch any variations
        await InviteCode.deleteMany({ code: '12344' });
        console.log('Cleaned up invalid InviteCodes.');

        // 3. Create a valid InviteCode
        // We must generate a valid 24-character hex ObjectId for createdBy
        const validDummyObjectId = new mongoose.Types.ObjectId();

        const newCode = new InviteCode({
            code: '12344',
            isUsed: false,
            expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
            createdBy: validDummyObjectId
        });

        await newCode.save();
        console.log('Successfully created valid InviteCode: 12344');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
