const mongoose = require('mongoose');

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
});
LandmarkSchema.index({ name: 'text', location: '2dsphere' });

const HoursSchema = new mongoose.Schema({
    isOpen: { type: Boolean, required: true },
    open: {
        type: Number,
        min: 0,
        max: function() { return this.close; },
        required: function() { return this.isOpen; },
    },
    close: {
        type: Number,
        max: 1439,
        required: function() { return this.isOpen; }
    },
}, { _id: false });

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

module.exports = mongoose.models.Landmark || mongoose.model('Landmark', LandmarkSchema);