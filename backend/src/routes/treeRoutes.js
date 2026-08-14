import express from 'express';
import {
  registerTree,
  getMyTrees,
  getTreeDetails,
} from '../controllers/treeController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.single('photo'), registerTree);
router.get('/my', protect, getMyTrees);
router.get('/:id', optionalProtect, getTreeDetails);

export default router;
