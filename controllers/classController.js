const Class = require('../models/Class');

exports.createClass = async (req, res) => {
  try {
    const { name, academicYear, homeroomTeacher } = req.body;
    const newClass = await Class.create({ name, academicYear, homeroomTeacher });
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate({ path: 'homeroomTeacher', populate: { path: 'user', select: 'fullName' } })
      .populate('subjects', 'name');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate({ path: 'homeroomTeacher', populate: { path: 'user', select: 'fullName' } })
      .populate({ path: 'students', populate: { path: 'user', select: 'fullName photoUrl' } })
      .populate('subjects', 'name');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { name, academicYear, homeroomTeacher } = req.body;
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (name !== undefined) cls.name = name;
    if (academicYear !== undefined) cls.academicYear = academicYear;
    if (homeroomTeacher !== undefined) cls.homeroomTeacher = homeroomTeacher;
    await cls.save();
    res.json({ message: 'Class updated', class: cls });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    await cls.deleteOne();
    res.json({ message: 'Class removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
