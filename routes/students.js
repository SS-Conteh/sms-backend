const express = require('express');
const router = express.Router();
const { createStudent, getStudents, getStudentById, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPhoto } = require('../config/cloudinary');

router.use(protect);
router.post('/', authorize('principal'), uploadPhoto.single('photo'), createStudent);
router.get('/', authorize('principal', 'teacher'), getStudents);
router.get('/:id', authorize('principal', 'teacher', 'parent', 'student'), getStudentById);
router.put('/:id', authorize('principal'), uploadPhoto.single('photo'), updateStudent);
router.delete('/:id', authorize('principal'), deleteStudent);

module.exports = router;
