import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  data: Array,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export default mongoose.model('Upload', uploadSchema);
