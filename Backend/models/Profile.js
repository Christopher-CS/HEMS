import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:   { type: String, required: true },
    avatar: { type: String },
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;