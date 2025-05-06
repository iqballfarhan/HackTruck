const express = require('express');
const router = express.Router();
const { 
  createPost, 
  getPosts, 
  getDriverPosts, 
  updatePost, 
  deletePost 
} = require('../controllers/postController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.use(protect);

router.get('/', getPosts);
router.get('/driver', restrictTo('driver'), getDriverPosts);
router.post('/', restrictTo('driver'), upload.single('image'), createPost);
router.put('/:id', restrictTo('driver'), upload.single('image'), updatePost);
router.delete('/:id', restrictTo('driver'), deletePost);

module.exports = router;