import { Router } from "express";
import { RapidAPIService } from "./rapidapi.service";
import { CategoryFilterResponse, FiltersRapidResponse, HotelRapidResponse, LocationRapidResponse, MultiFilterRapidResponse } from "../../types/rapidapi";
import { Exception } from "../../utils/exceptions";
import { rateLimit } from 'express-rate-limit';
const limiter = rateLimit({
	windowMs:  1000, // 1 second
	max: 5, // Limit each IP to 5 requests per `window` (here, per 1 second)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const RapidAPIController = Router();

const service: RapidAPIService = new RapidAPIService();

/**
 * @openapi
 * /rapid/locations:
 *   post:
 *     tags:
 *          - Rapid API
 *     summary: get rapid  location ids
 *     description: Accepts an array of destinations and processes them asynchronously.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destinations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of destination strings to be processed.
 *     responses:
 *       200:
 *         description: Successfully processed the destinations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LocationRapidResponse'
 *       400:
 *         description: Bad request. This can happen due to invalid input format or other client errors.
 *       429:
 *         description: Too many requests. The request is rate-limited.
 *       422:
 *          description: Unprocessable Entity
 *   
*/
RapidAPIController.post('/locations', limiter, async (req, res) => {
    try {
        const destinationsArray = req.body.destinations;
        
        if (!destinationsArray || !Array.isArray(destinationsArray)) {
            throw new Exception('An array is required', 400)
        }
    
        const responses: LocationRapidResponse[] = await Promise.all(
            destinationsArray.map(async (destination) => {
                return await service.fetchDestination(destination);
            })
        );
    
        console.log("locations:");
        console.log(responses);
        return res.status(200).json(responses);
    } catch (err: any) {
        if (err.code === 429) {
            return res.status(429).json(err);
        }
        return res.status(400).json(err);
    }
});

/**
 * @openapi
 * /rapid/filters:
 *   post:
 *     summary: get filters for given reservations
 *     tags:
 *          - Rapid API
 *     description: reutnr filters for an array of parameters of reservation.
*     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 adults_number:
 *                   type: integer
 *                   description: Number of adults
 *                 currency:
 *                   type: string
 *                   description: Currency code (e.g., EUR)
 *                 checkin_date:
 *                   type: string
 *                   format: date
 *                   description: Check-in date in the format YYYY-MM-DD
 *                 dest_id:
 *                   type: string
 *                   description: Destination ID
 *                 dest_type:
 *                   type: string
 *                   description: Destination type (e.g., city)
 *                 checkout_date:
 *                   type: string
 *                   format: date
 *                   description: Check-out date in the format YYYY-MM-DD
 *                 units:
 *                   type: string
 *                   description: Units (e.g., metric)
 *                 room_number:
 *                   type: string
 *                   description: Room number
 *                 order_by:
 *                   type: string
 *                   description: Order by (e.g., popularity)
 *                 locale:
 *                   type: string
 *                   description: Locale (e.g., en-gb)
 *                 children_number:
 *                   type: integer
 *                   description: Number of children
 *                 children_ages:
 *                   type: string
 *                   description: Comma-separated list of children ages
 *     responses:
 *       200:
 *         description: Successfully processed the destinations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/MultiFilterRapidResponse'
 *       400:
 *         description: Bad request. This can happen due to invalid input format or other client errors.
 *       429:
 *         description: Too many requests. The request is rate-limited.
 *       422:
 *          description: Unprocessable Entity
*/
RapidAPIController.post('/filters',limiter, async (req, res) => {
    try {
        const result: MultiFilterRapidResponse[] = req.body.map(async (destinationFilter: any) => {
            const filtersResponse: FiltersRapidResponse[] = [];
    
            const rapidFiltersResponse = await service.fetchFilters(
                destinationFilter.order_by,
                destinationFilter.dest_id,
                destinationFilter.checkin_date,
                destinationFilter.checkout_date,
                destinationFilter.adults_number,
                destinationFilter.room_number,
                destinationFilter.children_ages,
                destinationFilter.children_number,
                destinationFilter.dest_type,
                destinationFilter.currency
            )
    
            const processFilter = (rapidFilter: FiltersRapidResponse) => {
                if (!['previous', 'popular', 'free_cancellation'].includes(rapidFilter.id)) {                    
                    const categories: CategoryFilterResponse[] = rapidFilter.categories.map((categorie: any) => {
                        const { style_for_count, popular, selected, popular_rank,experiment_tracking_data, ...nouvelleCategorie } = categorie;
                        return nouvelleCategorie;
                    });
                    const filters: FiltersRapidResponse = {
                        categories,
                        title: rapidFilter.title,
                        type: rapidFilter.type,
                        id: rapidFilter.id
                    };
                    filtersResponse.push(filters);
                }
            };
    
            rapidFiltersResponse.forEach(processFilter);
    
            const multiDestFiltersArray: MultiFilterRapidResponse = {
                dest_name: destinationFilter.dest_name,
                dest_id: destinationFilter.dest_id,
                dest_type: destinationFilter.dest_type,
                filters: filtersResponse
            };
            return multiDestFiltersArray;
        });
    
        const resolvedResult = await Promise.all(result);
        return res.status(200).json(resolvedResult);
    } catch (err: any) {
        // console.log(err)
        return res.status(err.code).json(err);
    }
    
});


/**
 * @openapi
 * /rapid/hotels:
 *   post:
 *     summary: get hotels 
 *     tags:
 *          - Rapid API
 *     description: return hotels for an array of parameters of reservation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 order_by:
 *                   type: string
 *                   description: Order by parameter (e.g., popularity)
 *                 dest_id:
 *                   type: string
 *                   description: Destination ID
 *                 checkin_date:
 *                   type: string
 *                   format: date
 *                   description: Check-in date in the format YYYY-MM-DD
 *                 checkout_date:
 *                   type: string
 *                   format: date
 *                   description: Check-out date in the format YYYY-MM-DD
 *                 adults_number:
 *                   type: integer
 *                   description: Number of adults
 *                 room_number:
 *                   type: integer
 *                   description: Number of rooms
 *                 children_ages:
 *                   type: string
 *                   description: Comma-separated list of children ages
 *                 categories_filter_ids:
 *                   type: string
 *                   description: Comma-separated list of category filter IDs
 *                 include_adjacency:
 *                   type: boolean
 *                   description: Include adjacency parameter
 *                 children_number:
 *                   type: integer
 *                   description: Number of children
 *                 dest_name:
 *                   type: string
 *                   description: Destination name
 *                 dest_type:
 *                   type: string
 *                   description: Destination type (e.g., city)
 *     responses:
 *       200:
 *         description: Successfully processed the destinations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/HotelRapidResponse'
 *       400:
 *         description: Bad request. This can happen due to invalid input format or other client errors.
 *       429:
 *         description: Too many requests. The request is rate-limited.
 *       422:
 *          description: Unprocessable Entity
*/
RapidAPIController.post('/hotels', limiter, async (req, res) => {

    try {
        const responses: HotelRapidResponse[] = await (await Promise.all(req.body.map(async (userRequest: any) => {
            try {
                const hotelsResponse = await service.fetchHotels(
                    userRequest.order_by,
                    userRequest.dest_id,
                    userRequest.dest_type,
                    userRequest.checkin_date,
                    userRequest.checkout_date,
                    userRequest.adults_number,
                    userRequest.room_number,
                    userRequest.children_ages,
                    userRequest.categories_filter_ids,
                    userRequest.include_adjacency,
                    userRequest.children_number,
                    userRequest.currency,
                    userRequest.locale
                );

                const uniqueHotelsMap = new Map();

                const transformedHotels = hotelsResponse.map((hotelRes: any) => {
                    const hotelId = hotelRes.hotel_id;
                
                    console.log('hotelId')
                    console.log(hotelId)
                    // Check if the hotel_id is already in the Map
                    if (uniqueHotelsMap.has(hotelId)) {
                        // Handle duplicate logic if needed, for now, just skip
                        console.warn(`Duplicate hotel found with id: ${hotelId}`);
                        return null; // Skip this duplicate
                    }
                
                    // Add the hotel_id to the Map to mark it as seen
                    uniqueHotelsMap.set(hotelId, true);

                    const hotel: HotelRapidResponse = {
                        hotel_id: hotelRes.hotel_id,
                        address: hotelRes.address,
                        url: hotelRes.url,
                        imageUrl: hotelRes.max_1440_photo_url,
                        name: hotelRes.hotel_name,
                        price: parseInt(hotelRes.price_breakdown.gross_price, 10) || 0,
                        review_score: hotelRes.review_score,
                        review_score_word: hotelRes.review_score_word,
                        review_nb: hotelRes.review_nr,
                        currencycode: hotelRes.currencycode,
                        city: userRequest.dest_name,
                        dest_id: userRequest.dest_id,
                        alt_city_name: hotelRes.city_name_en,
                        distance_to_cc: hotelRes.distance_to_cc_formatted || '',
                        price_per_night: hotelRes.composite_price_breakdown.gross_amount_per_night?.value || 0,
                        configuration: hotelRes.unit_configuration_label,
                        free_cancellable: hotelRes.is_free_cancellable,
                        class: hotelRes.class,
                        is_beach_front: hotelRes.is_beach_front
                    };
                
                    return hotel;
                });

                const uniqueTransformedHotels = transformedHotels.filter((hotel: any) => hotel !== null);
                return uniqueTransformedHotels;

                // return hotelsResponse.map((hotelRes: any) => {
                    // const hotel: HotelRapidResponse = {
                    //     hotel_id: hotelRes.hotel_id,
                    //     address: hotelRes.address,
                    //     url: hotelRes.url,
                    //     imageUrl: hotelRes.main_photo_url,
                    //     name: hotelRes.hotel_name,
                    //     price: parseInt(hotelRes.price_breakdown.gross_price, 10) || 0,
                    //     review_score: hotelRes.review_score,
                    //     review_score_word: hotelRes.review_score_word,
                    //     review_nb: hotelRes.review_nr,
                    //     currencycode: hotelRes.currencycode,
                    //     city: userRequest.dest_name,
                    //     dest_id: userRequest.dest_id,
                    //     alt_city_name: hotelRes.city_name_en,
                    //     distance_to_cc: hotelRes.distance_to_cc_formatted || '',
                    //     price_per_night: hotelRes.composite_price_breakdown.gross_amount_per_night?.value || 0,
                    //     configuration: hotelRes.unit_configuration_label,
                    //     free_cancellable: hotelRes.is_free_cancellable,
                    //     class: hotelRes.class
                    // };

                //     return hotel;
                // });


            } catch (error) {
                throw error;
            }
        }))).flat();
    
    
        return res.status(200).json(responses);
    } catch (err: any) {
        console.log(err);
        return res.status(err.code).json(err);
    }
});



export { RapidAPIController };