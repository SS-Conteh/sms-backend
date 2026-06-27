const express = require('express');
const router = express.Router();
const { createClass, getClasses, getClassById, updateClass, deleteClass } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('principal'), createClass);
router.get('/', authorize('principal', 'teacher'), getClasses);
router.get('/:id', authorize('principal', 'teacher', 'student', 'parent'), getClassById);
router.put('/:id', authorize('principal'), updateClass);
router.delete('/:id', authorize('principal'), deleteClass);

module.exports = router;
