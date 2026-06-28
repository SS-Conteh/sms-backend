const User = require("../models/User");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const Class = require("../models/Class");
const { uploadToCloudinary } = require("../config/cloudinary");

exports.createStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      admissionNumber,
      classId,
      dateOfBirth,
      gender,
      address,
      parentIds,
    } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    let photoUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "sms/photos");
      photoUrl = result.secure_url;
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: "student",
      photoUrl,
    });
    const student = await Student.create({
      user: user._id,
      admissionNumber,
      class: classId || undefined,
      dateOfBirth,
      gender,
      address,
      parents: parentIds || [],
    });
    user.profileRef = student._id;
    user.profileModel = "Student";
    await user.save();
    if (classId)
      await Class.findByIdAndUpdate(classId, {
        $addToSet: { students: student._id },
      });
    if (parentIds && parentIds.length) {
      await Parent.updateMany(
        { _id: { $in: parentIds } },
        { $addToSet: { children: student._id } },
      );
    }
    res
      .status(201)
      .json({
        student,
        user: { id: user._id, fullName, email, role: user.role },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) filter.class = req.query.classId;
    const students = await Student.find(filter)
      .populate("user", "fullName email photoUrl status")
      .populate("class", "name")
      .populate("parents", "user");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "fullName email photoUrl status")
      .populate("class", "name")
      .populate({
        path: "parents",
        populate: { path: "user", select: "fullName email" },
      });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const {
      fullName,
      classId,
      dateOfBirth,
      gender,
      address,
      status,
      parentIds,
    } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (classId !== undefined && String(classId) !== String(student.class)) {
      if (student.class)
        await Class.findByIdAndUpdate(student.class, {
          $pull: { students: student._id },
        });
      if (classId)
        await Class.findByIdAndUpdate(classId, {
          $addToSet: { students: student._id },
        });
      student.class = classId || undefined;
    }
    if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;
    if (gender !== undefined) student.gender = gender;
    if (address !== undefined) student.address = address;
    if (status !== undefined) student.status = status;
    if (parentIds !== undefined) student.parents = parentIds;
    await student.save();
    if (fullName || req.file || status) {
      const userUpdate = {};
      if (fullName) userUpdate.fullName = fullName;
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, "sms/photos");
        userUpdate.photoUrl = result.secure_url;
      }
      if (status)
        userUpdate.status = status === "active" ? "active" : "inactive";
      await User.findByIdAndUpdate(student.user, userUpdate);
    }
    res.json({ message: "Student updated", student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.class)
      await Class.findByIdAndUpdate(student.class, {
        $pull: { students: student._id },
      });
    await Parent.updateMany(
      { children: student._id },
      { $pull: { children: student._id } },
    );
    await User.findByIdAndDelete(student.user);
    await student.deleteOne();
    res.json({ message: "Student removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
