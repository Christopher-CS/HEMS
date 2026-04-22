import mongoose from 'mongoose';

const sceneActionSchema = new mongoose.Schema({
    device:  { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    type:    { type: String, required: true },  // same command types as executeCommand
    payload: { type: mongoose.Schema.Types.Mixed },
    order:   { type: Number, default: 0 },      // execution sequence
}, { _id: false });

const sceneSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actions:   [sceneActionSchema],
    isActive:  { type: Boolean, default: false },
}, { timestamps: true });

const Scene = mongoose.model('Scene', sceneSchema);
export default Scene;