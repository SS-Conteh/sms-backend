const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    staffId: { type: String, required: true, unique: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    classesTaught: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    homeroomOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    qualification: String,
    dateJoined: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
