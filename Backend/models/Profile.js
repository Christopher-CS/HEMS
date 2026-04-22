import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    name: {type: String, required: true},
    profile_picture: {type: String}
}, {timestamps: true, minimize: false});

const Profile = mongoose.model('Profile', profileSchema);

export default profileSchema