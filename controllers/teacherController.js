const User = require('../models/User');
const Teacher = require('../models/Teacher');

exports.createTeacher = async (req, res) => {
  try {
    const { fullName, email, password, staffId, qualification, subjects, classesTaught } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({
      fullName, email, password, role: 'teacher',
      photoUrl: req.file ? req.file.path : '',
    });
    const teacher = await Teacher.create({
      user: user._id, staffId, qualification,
      subjects: subjects || [], classesTaught: classesTaught || [],
    });
    user.profileRef = teacher._id;
    user.profileModel = 'Teacher';
    await user.save();
    res.status(201).json({ teacher, user: { id: user._id, fullName, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('user', 'fullName email photoUrl status')
      .populate('subjects', 'name')
      .populate('classesTaught', 'name');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'fullName email photoUrl status')
      .populate('subjects', 'name')
      .populate('classesTaught', 'name')
      .populate('homeroomOf', 'name');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { fullName, qualification, subjects, classesTaught, status } = req.body;
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    if (qualification !== undefined) teacher.qualification = qualification;
    if (subjects !== undefined) teacher.subjects = subjects;
    if (classesTaught !== undefined) teacher.classesTaught = classesTaught;
    if (status !== undefined) teacher.status = status;
    await teacher.save();
    if (fullName || req.file || status) {
      const userUpdate = {};
      if (fullName) userUpdate.fullName = fullName;
      if (req.file) userUpdate.photoUrl = req.file.path;
      if (status) userUpdate.status = status;
      await User.findByIdAndUpdate(teacher.user, userUpdate);
    }
    res.json({ message: 'Teacher updated', teacher });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    await User.findByIdAndDelete(teacher.user);
    await teacher.deleteOne();
    res.json({ message: 'Teacher removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
