import mongoose from 'mongoose';

const treeSpeciesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tamilName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const TreeSpecies = mongoose.model('TreeSpecies', treeSpeciesSchema);
export default TreeSpecies;
