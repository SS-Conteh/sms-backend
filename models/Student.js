const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    admissionNumber: { type: String, required: true, unique: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female'] },
    address: String,
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }],
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive', 'graduated'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
