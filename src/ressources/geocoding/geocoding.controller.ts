import { Router } from 'express';
import { GeocodingService } from './geocoding.service';
import { Exception } from '../../utils/exceptions';
import { ReverseGeocodingResponse } from '../../types/geocoding';
import { rateLimit } from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // Limit each IP to 5 requests per `window` (here, per 1 second)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
const GeocodingController = Router();

const service: GeocodingService = new GeocodingService();

/**
 * @openapi
 * /geocode/reverse/:lon/:lat:
 *   get:
 *     summary: get information about location
 *     tags:
 *       - Geocode
 *     description: get information about location.
 *     parameters:
 *       - in: path
 *         name: lon
 *         required: true
 *         description: Longitude coordinate.
 *         schema:
 *           type: string
 *       - in: path
 *         name: lat
 *         required: true
 *         description: Latitude coordinate.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully processed the destinations.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/ReverseGeocodingResponse'
 *       400:
 *         description: Bad request. This can happen due to invalid input format or other client errors.
 */
GeocodingController.get('/reverse/:lon/:lat', limiter, async (req, res) => {
  try {
    if (!req.params.lon) {
      throw new Exception('no longitude attribute provided', 400);
    } else if (!req.params.lat) {
      throw new Exception('no latitude attribute provided', 400);
    }
    const response: ReverseGeocodingResponse | any = await service.fetchReverseGeocoding(
      req.params.lon,
      req.params.lat
    );
    if (response.error) {
      throw new Exception(response.error, 400);
    }
    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(400).json(err);
  }
});

export { GeocodingController };
