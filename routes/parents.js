const express = require('express');
const router = express.Router();
const { createParent, getParents, getParentById, updateParent, deleteParent } = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPhoto } = require('../config/cloudinary');

router.use(protect);
router.post('/', authorize('principal'), uploadPhoto.single('photo'), createParent);
router.get('/', authorize('principal'), getParents);
router.get('/:id', authorize('principal', 'parent'), getParentById);
router.put('/:id', authorize('principal'), uploadPhoto.single('photo'), updateParent);
router.delete('/:id', authorize('principal'), deleteParent);

module.exports = router;
