import express from 'express';
import Landmark, { LANDMARK_TYPES } from '../models/Landmark.js';
import z from 'zod';
import { isObjectIdOrHexString } from 'mongoose';

const router = express.Router();

const landmarkQuerySchema = z
    .object({
        search: z.string().optional(),
        type: z.enum(LANDMARK_TYPES).optional(),
        /*latitude: z.coerce.number()
            .refine(x => !isNaN(x), { message: 'Latitude must be a number' })
            .gte(-90).lte(90)
            .optional(),
        longitude: z.coerce.number()
            .refine(x => !isNaN(x), { message: 'Longitude must be a number' })
            .gte(-180).lte(180)
            .optional(),
        maxDistance: z.coerce.number()
            .refine(x => !isNaN(x), { message: 'Max distance must be a number' })
            .gte(0)
            .optional()*/
        latitude: z.coerce.number()
            .gte(-90, { message: 'Latitude must be >= -90' })
            .lte(90, { message: 'Latitude must be <= 90' })
            .refine(x => !isNaN(x), { message: 'Latitude must be a number' })
            .optional(),
        longitude: z.coerce.number()
            .gte(-180, { message: 'Longitude must be >= -180' })
            .lte(180, { message: 'Longitude must be <= 180' })
            .refine(x => !isNaN(x), { message: 'Longitude must be a number' })
            .optional(),
          maxDistance: z.coerce.number()
            .gte(0, { message: 'Max distance must be >= 0' })
            .refine(x => !isNaN(x), { message: 'Max distance must be a number' })
            .optional(),
    })
    .refine(
        data => (data.latitude === undefined) === (data.longitude === undefined),
        { message: 'Latitude and longitude must be provided together or not at all' }
    );

/**
 * `GET /api/landmarks`
 * 
 * Obtain a list of landmarks based on optional search and location.
 * 
 * Request body:
 * 
 * ```ts
 * {
 *   search?: string, // Search term (name/description)
 *   type?: string, // Type of landmark (building, restroom, etc.)
 *   latitude?: number, // Latitude (-90 to 90 degrees)
 *   longitude?: number, // Longitude (-180 to 180 degrees)
 *   maxDistance?: number // Max distance from the location in meters
 * }
 * ```
 * 
 * **NOTE**: Latitude and longitude must be provided together if specified.
 * 
 * Response:
 * 
 * `200 OK` with a list of landmarks matching the criteria.
 * 
 * ```ts
 * {
 *   landmarks: {
 *     name: string,
 *     type?: string,
 *     location: {
 *       type: 'Point',
 *       coordinates: [number, number]
 *     },
 *     parent?: string
 *   }[]
 * }
 * ```
 * 
 * `400 Bad Request` if the query parameters are invalid.
 * 
 * ```ts
 * {
 *   errors: string[]
 * }
 * ```
 * 
 */
router.get('/', async (req, res) => {
    const {
        success: parseSuccess,
        error: parseError,
        data: query
    } = await landmarkQuerySchema.safeParseAsync(req.query);

    if (!parseSuccess) {
        res.status(400).json({ errors: parseError.issues.map(x => x.message) });
        return;
    }

    const mongoQuery = {};

    if (query.search) {
        mongoQuery.$text = { $search: query.search };
    }

    if (query.type) {
        mongoQuery.type = query.type;
    }
    
    if (query.longitude !== undefined) {
        mongoQuery.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [query.longitude, query.latitude],
                },
                $maxDistance: query.maxDistance || 1000,
            },
        };
    }

    const landmarks = await Landmark.find(mongoQuery).lean();
    res.json({ landmarks });
});

/**
 * `GET /api/landmarks/:id`
 * 
 * Get a specific landmark by its ID.
 * 
 * Parameters:
 * - id: MongoDB ObjectId of the landmark
 * 
 * Response:
 * 
 * `200 OK` with the landmark data.
 * 
 * ```ts
 * {
 *   landmark: {
 *     _id: string,
 *     name: string,
 *     type?: string,
 *     location: {
 *       type: 'Point',
 *       coordinates: [number, number]
 *     },
 *     parent?: string
 *   }
 * }
 * ```
 * 
 * `404 Not Found` if the landmark doesn't exist.
 * 
 * ```ts
 * {
 *   error: string
 * }
 * ```
 */
router.get('/:id', async (req, res) => {
    console.log('foo');
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Landmark ID is required' });
        }

        if (!isObjectIdOrHexString(id)) {
            return res.status(400).json({ error: 'Invalid landmark ID format' });
        }

        const landmark = await Landmark.findById(id).lean();
        
        if (!landmark) {
            return res.status(404).json({ error: 'Landmark not found' });
        }

        res.json({ landmark });
    } catch (error) {
        console.error('Error fetching landmark:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;