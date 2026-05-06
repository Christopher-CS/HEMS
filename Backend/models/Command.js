import mongoose from 'mongoose';

const commandSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    type: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed },
    status: {
        type: String,
        enum: ["pending", "executed", "failed"],
        default: "pending"
    },
    executedAt: { type: Date }
}, {timestamps: true, minimize: false});

const Command = mongoose.model('Command', commandSchema);

export default Command