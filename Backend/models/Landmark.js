const mongoose = require('mongoose');

/**
 * Landmark represents a real-world place a user cares about,
 * such as a restroom, classroom, printer, etc.
 * It connects to IndoorNodes via `connectedTo`.
 */
const HoursSchema = new mongoose.Schema({
  isOpen: { type: Boolean, required: true },

  open: {
    type: Number,
    min: 0,
    max: 1439         
  },

  close: {
    type: Number,
    min: 0,
    max: 1439
  }
}, { _id: false });

// Perform additional “open < close” verification
HoursSchema.pre("validate", function (next) {
  if (this.isOpen && !(this.open < this.close)) {
    return next(new Error("open must be less than close"));
  }
  next();
});

const GeoJSONSchema = new mongoose.Schema({
    type: { type: String, enum: ['Point'], required: true },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: function(coords) {
                return coords.length === 2 &&
                    coords[0] >= -180 && coords[0] <= 180 &&
                    coords[1] >= -90 && coords[1] <= 90;
            }
        }
    }
}, { _id: false });

const LandmarkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: [
        'building',
        'male-restroom',
        'female-restroom',
        'neutral-restroom',
        'study-spot',
        'classroom',
        'printer'
    ] },
    location: GeoJSONSchema,
    hours: {
        type: [HoursSchema],
        validate: { validator: hours => hours.length === 7 },
    },
    parent: { type: mongoose.Types.ObjectId, ref: 'Landmark' },
    
    //  Landmark is linked to one or more IndoorNodes
    connectedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IndoorNode' }]
});
LandmarkSchema.index({ location: '2dsphere' });


module.exports = mongoose.models.Landmark || mongoose.model('Landmark', LandmarkSchema);