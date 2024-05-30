/**
   * @openapi
  * components:
 *   schemas:
 *     LocationRapidResponse:
 *       type: object
 *       properties:
 *         dest_id:
 *           type: string
 *         name:
 *           type: string
 *         dest_type:
 *           type: string
 */
export interface LocationRapidResponse{
    dest_id: string;
    name: string;
    dest_type: string;
}

/**
* @openapi
* components:
*   schemas:
*     HotelRapidResponse:
*       type: object
*       properties:
*         address:
*           type: string
*           description: Hotel address
*         url:
*           type: string
*           description: Hotel URL
*         city:
*           type: string
*           description: City where the hotel is located
*         imageUrl:
*           type: string
*           description: URL of the hotel image
*         name:
*           type: string
*           description: Hotel name
*         price:
*           type: number
*           description: Hotel price
*         price_per_night:
*           type: number
*           description: Price per night
*         review_score:
*           type: number
*           description: Review score
*         review_score_word:
*           type: string
*           description: Review score word (e.g., "Excellent")
*         review_nb:
*           type: number
*           description: Number of reviews
*         currencycode:
*           type: string
*           description: Currency code (e.g., USD)
*         distance_to_cc:
*           type: string
*           description: Distance to city center
*         alt_city_name:
*           type: string
*           description: Alternative city name
*         configuration:
*           type: string
*           description: Hotel configuration
*         free_cancellable:
*           type: number
*           description: Free cancellation period in days
*         class:
*           type: string
*           description: Hotel class
*         dest_id:
*           type: string
*           description: location id
*         is_beach_front:
*           type: boolean
*           description: is beach front
*/

export interface HotelRapidResponse {
    hotel_id: number;
    address: string,
    url: string,
    city: string,
    imageUrl: string, 
    name: string, 
    price: number, 
    price_per_night: number,
    review_score: number, 
    review_score_word: string, 
    review_nb: number, 
    currencycode: string,
    distance_to_cc: string,
    alt_city_name: string,
    configuration: string;
    free_cancellable: number;
    class: string;
    dest_id: string;
    is_beach_front: boolean;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     MultiFilterRapidResponse:
 *       type: object
 *       properties:
 *         dest_name:
 *           type: string
 *           description: Destination name
 *         dest_id:
 *           type: string
 *           description: Destination ID
 *         dest_type:
 *           type: string
 *           description: Destination type
 *         filters:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FiltersRapidResponse'
 */
export interface MultiFilterRapidResponse {
    dest_name: string;
    dest_id: string;
    dest_type: string;
    filters: FiltersRapidResponse[]
}


/**
 * @openapi
 * components:
 *   schemas:
 *     FiltersRapidResponse:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: type
 *         title:
 *           type: string
 *           description: title
 *         id:
 *           type: string
 *           description: Destination type
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CategoryFilterResponse'
 */
export interface FiltersRapidResponse {
    type: string;
    title: string;
    id: string;
    categories: CategoryFilterResponse[];
}


/**
 * @openapi
 * components:
 *   schemas:
 *     CategoryFilterResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: id
 *         count:
 *           type: number
 *           description: count
 *         name:
 *           type: string
 *           description: name
 */
export interface CategoryFilterResponse {
    id: string;
    count: number;
    name: string;
}