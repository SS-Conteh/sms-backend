const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
