import express from 'express';
import {
  getStatistics,
  getDistricts,
  getTreeMap,
  getLeaderboard,
  getPublicSpecies,
} from '../controllers/publicController.js';

const router = express.Router();

router.get('/statistics', getStatistics);
router.get('/districts', getDistricts);
router.get('/tree-map', getTreeMap);
router.get('/leaderboard', getLeaderboard);
router.get('/species', getPublicSpecies);

export default router;
