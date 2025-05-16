import mongoose from 'mongoose';

export const LANDMARK_TYPES = [
    'building',
    'male-restroom',
    'female-restroom',
    'neutral-restroom',
    'study-spot',
    'classroom',
    'printer'
];

// Define HoursSchema before using it in LandmarkSchema
const HoursSchema = new mongoose.Schema({
    isOpen: { type: Boolean, required: true },
    open: {
        type: Number,
        min: 0,
        required: function() { return this.isOpen; },
    },
    close: {
        type: Number,
        max: 1439,
        required: function() { return this.isOpen; }
    },
}, { _id: false });

// Custom validator to ensure 'open' is always before 'close' when 'isOpen' is true
HoursSchema.pre('validate', function(next) {
    if (this.isOpen && this.open > this.close) {
        this.invalidate('open', 'Open time must be less than or equal to close time');
    }
    next();
});

// Define GeoJSONSchema before using it in LandmarkSchema
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

// Define LandmarkSchema after HoursSchema and GeoJSONSchema are defined
const LandmarkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: LANDMARK_TYPES },
    location: GeoJSONSchema,
    hours: {
        type: [HoursSchema],
        validate: { validator: hours => hours.length === 7 },
    },
    parent: { type: mongoose.Types.ObjectId, ref: 'Landmark' },
});

LandmarkSchema.index({ name: 'text', location: '2dsphere' });

export default mongoose.models.Landmark || mongoose.model('Landmark', LandmarkSchema);
