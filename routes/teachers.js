const express = require('express');
const router = express.Router();
const { createTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPhoto } = require('../config/cloudinary');

router.use(protect);
router.post('/', authorize('principal'), uploadPhoto.single('photo'), createTeacher);
router.get('/', authorize('principal'), getTeachers);
router.get('/:id', authorize('principal', 'teacher'), getTeacherById);
router.put('/:id', authorize('principal'), uploadPhoto.single('photo'), updateTeacher);
router.delete('/:id', authorize('principal'), deleteTeacher);

module.exports = router;
