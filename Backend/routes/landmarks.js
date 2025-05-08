import express from 'express';
import Landmark, { LANDMARK_TYPES } from '../models/Landmark.js';
import z from 'zod';

const router = express.Router();

const landmarkQuerySchema = z
    .object({
        search: z.string().optional(),
        type: z.enum(LANDMARK_TYPES).optional(),
        latitude: z.coerce.number()
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
            .optional()
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
        result: parseResult,
        error: parseError,
        data: query
    } = await landmarkQuerySchema.safeParseAsync(req.query);
    if (!parseResult.success) {
        res.status(400).json({ errors: parseError.issues.map(x => x.message) });
        return;
    }

    const landmarks = await Landmark.find({
        $text: { $search: query.search },
        type: query.type ? query.type : undefined,
        location: query.longitude ? {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [query.longitude, query.latitude],
                },
                $maxDistance: query.maxDistance || 1000,
            },
        } : undefined,
    }).lean();

    res.json({ landmarks });
});

export default router;