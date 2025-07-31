// models/History.js
import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  xAxis: {
    type: String,
    required: true
  },
  yAxis: {
    type: String,
    required: true
  },
  chartType: {
    type: String,
    enum: ['Bar', 'Line', 'Pie'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const History = mongoose.model('History', historySchema);
export default History;
