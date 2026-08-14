import mongoose from 'mongoose';

const verificationHistorySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    decision: {
      type: String,
      enum: ['VERIFIED', 'REJECTED'],
      required: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const treeSchema = new mongoose.Schema(
  {
    treeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    species: {
      type: String,
      required: true,
      trim: true,
    },
    treeType: {
      type: String,
      enum: ['Native', 'Fruit', 'Shade', 'Timber', 'Other'],
      required: true,
    },
    plantingDate: {
      type: Date,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    photoUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'],
      default: 'PENDING_VERIFICATION',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    rejectionNotes: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationHistory: [verificationHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Indexing for faster statistics, leaderboard, map and search queries
treeSchema.index({ user: 1 });
treeSchema.index({ status: 1 });
treeSchema.index({ district: 1 });
treeSchema.index({ species: 1 });

const Tree = mongoose.model('Tree', treeSchema);
export default Tree;
