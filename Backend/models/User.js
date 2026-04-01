import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    email: {type: String, required: true},
    full_name: {type: String, required: true},
    username: {type: String, unique: true},
    profile_picture: {type: String, default: ''},
    location: {type: String, default: ''},
    family_users: [{type: String, ref: 'User'}],
    devices: [{type: String, ref: 'Device'}]
}, {timestamps: true, minimize: false});

const User = mongoose.model('User', userSchema);

export default User