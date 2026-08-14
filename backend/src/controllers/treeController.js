import Tree from '../models/Tree.js';
import User from '../models/User.js';
import TreeSpecies from '../models/TreeSpecies.js';
import { saveImage } from '../utils/storage.js';

// Helper to generate unique Tree ID sequential like TN-TREE-000001
const generateUniqueTreeId = async () => {
  let attempts = 0;
  while (attempts < 5) {
    // Find the tree with the highest numeric suffix in its treeId
    const lastTree = await Tree.findOne({}, { treeId: 1 })
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1;
    if (lastTree && lastTree.treeId) {
      const match = lastTree.treeId.match(/TN-TREE-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const formattedId = `TN-TREE-${String(nextNumber).padStart(6, '0')}`;
    
    // Check if it already exists (just in case of parallel requests)
    const exists = await Tree.findOne({ treeId: formattedId });
    if (!exists) {
      return formattedId;
    }
    attempts++;
  }
  // Fallback to random ID if sequencing fails
  return `TN-TREE-${Math.floor(100000 + Math.random() * 900000)}`;
};

// @desc    Register a new tree
// @route   POST /api/trees
// @access  Private
export const registerTree = async (req, res) => {
  try {
    const {
      species,
      treeType,
      plantingDate,
      latitude,
      longitude,
      district,
      area,
      description,
    } = req.body;

    if (!species || !treeType || !plantingDate || !latitude || !longitude || !district || !area) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'A tree photograph is required' });
    }

    // Convert types
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const pDate = new Date(plantingDate);

    // Save image to storage (local uploads directory)
    const photoUrl = await saveImage(req.file);

    // Generate unique Tree ID
    const treeId = await generateUniqueTreeId();

    // 17. DUPLICATE DETECTION:
    // Check if this user has already registered a tree of the same species,
    // planted within 1 day, and within a very close GPS radius (approx ~20 meters, ~0.0002 degrees)
    const oneDay = 24 * 60 * 60 * 1000;
    const sameUserTrees = await Tree.find({
      user: req.user._id,
      species: species,
    });

    let duplicateSuspicion = false;
    for (const otherTree of sameUserTrees) {
      const timeDiff = Math.abs(otherTree.plantingDate.getTime() - pDate.getTime());
      const latDiff = Math.abs(otherTree.latitude - lat);
      const lngDiff = Math.abs(otherTree.longitude - lng);

      // Within 1 day AND very close coordinates
      if (timeDiff <= oneDay && latDiff < 0.0002 && lngDiff < 0.0002) {
        duplicateSuspicion = true;
        break;
      }
    }

    let warningNotes = '';
    if (duplicateSuspicion) {
      warningNotes = 'Warning: Possible duplicate submission detected (similar location & date for same user).';
    }

    const tree = await Tree.create({
      treeId,
      user: req.user._id,
      species,
      treeType,
      plantingDate: pDate,
      latitude: lat,
      longitude: lng,
      district,
      area,
      description,
      photoUrl,
      status: 'PENDING_VERIFICATION',
      rejectionNotes: warningNotes, // store warnings here for admin review
    });

    res.status(201).json({
      message: 'Your tree has been submitted and is waiting for verification.',
      tree,
    });
  } catch (error) {
    console.error('Error registering tree:', error);
    res.status(500).json({ message: 'Server error registering tree' });
  }
};

// @desc    Get current user's registered trees
// @route   GET /api/trees/my
// @access  Private
export const getMyTrees = async (req, res) => {
  try {
    const trees = await Tree.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(trees);
  } catch (error) {
    console.error('Error fetching my trees:', error);
    res.status(500).json({ message: 'Server error fetching your trees' });
  }
};

// @desc    Get single tree details
// @route   GET /api/trees/:id
// @access  Private/Public (Conditional check in controller)
export const getTreeDetails = async (req, res) => {
  try {
    // If request contains authorization, verify and allow full details
    const tree = await Tree.findById(req.params.id)
      .populate('user', 'name email phone district profileImage')
      .populate('verifiedBy', 'name');

    if (!tree) {
      return res.status(404).json({ message: 'Tree record not found' });
    }

    // Determine if requester is owner or admin
    let isAuthorized = false;
    if (req.user) {
      isAuthorized = 
        req.user.role === 'ADMIN' || 
        req.user._id.toString() === tree.user._id.toString();
    }

    if (isAuthorized) {
      return res.json(tree);
    } else {
      // Obfuscate private user data and exact GPS locations for public view
      // Add slight noise of +/- 0.0004 (~40m) to map coordinates to protect private spaces
      // Note: Seeded/fixed offset so the marker doesn't dance on every refresh.
      // We can use a deterministic noise using the tree ID's hash.
      const seedNoise = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return (hash % 100) / 250000; // generates a small offset between -0.0004 and 0.0004
      };

      const latNoise = seedNoise(tree.treeId + 'lat');
      const lngNoise = seedNoise(tree.treeId + 'lng');

      const obfuscatedTree = {
        _id: tree._id,
        treeId: tree.treeId,
        species: tree.species,
        treeType: tree.treeType,
        plantingDate: tree.plantingDate,
        latitude: tree.status === 'VERIFIED' ? tree.latitude + latNoise : null,
        longitude: tree.status === 'VERIFIED' ? tree.longitude + lngNoise : null,
        district: tree.district,
        area: tree.area, // show broad area name
        description: tree.description,
        photoUrl: tree.photoUrl,
        status: tree.status,
        createdAt: tree.createdAt,
        verifiedAt: tree.verifiedAt,
      };

      return res.json(obfuscatedTree);
    }
  } catch (error) {
    console.error('Error fetching tree details:', error);
    res.status(500).json({ message: 'Server error fetching tree details' });
  }
};
