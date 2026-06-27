const User = require('../models/User');
const Parent = require('../models/Parent');
const Student = require('../models/Student');

exports.createParent = async (req, res) => {
  try {
    const { fullName, email, password, phone, occupation, address, childIds } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({
      fullName, email, password, role: 'parent',
      photoUrl: req.file ? req.file.path : '',
    });
    const parent = await Parent.create({ user: user._id, phone, occupation, address, children: childIds || [] });
    user.profileRef = parent._id;
    user.profileModel = 'Parent';
    await user.save();
    if (childIds && childIds.length) {
      await Student.updateMany({ _id: { $in: childIds } }, { $addToSet: { parents: parent._id } });
    }
    res.status(201).json({ parent, user: { id: user._id, fullName, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getParents = async (req, res) => {
  try {
    const parents = await Parent.find()
      .populate('user', 'fullName email photoUrl status')
      .populate({ path: 'children', populate: { path: 'user', select: 'fullName' } });
    res.json(parents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .populate('user', 'fullName email photoUrl status')
      .populate({ path: 'children', populate: [{ path: 'user', select: 'fullName photoUrl' }, { path: 'class', select: 'name' }] });
    if (!parent) return res.status(404).json({ message: 'Parent not found' });
    res.json(parent);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const { fullName, phone, occupation, address, status, childIds } = req.body;
    const parent = await Parent.findById(req.params.id);
    if (!parent) return res.status(404).json({ message: 'Parent not found' });
    if (phone !== undefined) parent.phone = phone;
    if (occupation !== undefined) parent.occupation = occupation;
    if (address !== undefined) parent.address = address;
    if (childIds !== undefined) {
      const removed = parent.children.filter((c) => !childIds.includes(String(c)));
      if (removed.length) await Student.updateMany({ _id: { $in: removed } }, { $pull: { parents: parent._id } });
      await Student.updateMany({ _id: { $in: childIds } }, { $addToSet: { parents: parent._id } });
      parent.children = childIds;
    }
    await parent.save();
    if (fullName || req.file || status) {
      const userUpdate = {};
      if (fullName) userUpdate.fullName = fullName;
      if (req.file) userUpdate.photoUrl = req.file.path;
      if (status) userUpdate.status = status;
      await User.findByIdAndUpdate(parent.user, userUpdate);
    }
    res.json({ message: 'Parent updated', parent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) return res.status(404).json({ message: 'Parent not found' });
    await Student.updateMany({ parents: parent._id }, { $pull: { parents: parent._id } });
    await User.findByIdAndDelete(parent.user);
    await parent.deleteOne();
    res.json({ message: 'Parent removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
