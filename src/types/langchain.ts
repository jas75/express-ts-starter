/**
* @openapi
* components:
*   schemas:
*     LLMAdvice:
*       type: object
*       properties:
*         arrival_date:
*           type: string
*           description: Arrival date in the format YYYY-MM-DD
*         departure_date:
*           type: string
*           description: Departure date in the format YYYY-MM-DD
*         number_adults:
*           type: number
*           description: Number of adults
*         number_children:
*           type: number
*           description: Number of children
*         number_rooms:
*           type: number
*           description: Number of rooms
*         destinations:
*           type: array
*           items:
*             type: string
*           description: Array of destination strings
*         summary:
*           type: string
*           description: Summary message
*/
export interface LLMAdvice {
  arrival_date: string;
  departure_date: string;
  number_adults: number;
  number_children: number;
  number_rooms: number;
  cities: string[];
  sort: string;
  answer: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     LLMFilterSpecifities:
 *       type: object
 *       properties:
 *         budget:
 *           type: string
 *         room_facilities:
 *           type: array
 *           items:
 *             type: string
 *         property_type:
 *           type: string
 *         meals:
 *           type: string
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *         districts:
 *           type: array
 *           items:
 *             type: string
 *         bed_preference:
 *           type: string
 *         chains:
 *           type: array
 *           items:
 *             type: string
 *         review_score:
 *           type: string
 *         distance_to_city_center:
 *           type: string
 *         beach_access:
 *           type: string
 *         property_rating:
 *           type: string
 */
export interface LLMFilterSpecifities {
  budget: string | null,
  room_facilities: string[] | null,
  property_type: string | null,
  meals: string | null,
  facilities: string[] | null,
  districts: string[] | null,
  bed_preference: string | null,
  chains: string[] | null,
  review_score: string | null,
  distance_to_city_center: string | null,
  beach_access: string | null,
  property_rating: string | null,
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LLMAdviceResponse:
 *       type: object
 *       properties:
 *         llm_advice:
 *           $ref: '#/components/schemas/LLMAdvice'
 *         llm_filter_specificities:
 *           $ref: '#/components/schemas/LLMFilterSpecifities'
 */

export interface LLMAdviceResponse {
  llm_advice: LLMAdvice,
  llm_filter_specificities: LLMFilterSpecifities
}
/**
* @openapi
* components:
*   schemas:
*     LLMThink:
*       type: object
*       properties:
*         filters:
*           type: array
*           items: 
*              $ref: '#/components/schemas/AiFiltersChoice'
*/
export interface LLMThink {
  filters: AiFiltersChoice[],
  // summary: string;
}

/**
* @openapi
* components:
*   schemas:
*     AiFiltersChoice:
*       type: object
*       properties:
*         filter_id:
*           type: string
*         filter_name:
*           type: string
*         filter_section:
*           type: string
*/
export interface  AiFiltersChoice{
  filter_id: string;
  filter_name: string;
  filter_section: string;
}


/**
* @openapi
* components:
*   schemas:
*     LLMFilterResponse:
*       type: object
*       properties:
*         error:
*           type: boolean
*         status_translate_key:
*           type: string
*           description: Summary message
*         dest_id:
*           type: string
*         dest_name:
*           type: string
*         dest_type:
*           type: string
*         airesponse:
*           items: 
*              $ref: '#/components/schemas/LLMThink'
*/
export interface LLMFilterReponse {
  error: boolean;
  status_translate_key?: string;
  dest_id: string;
  dest_name: string;
  airesponse: LLMThink;
  dest_type: string;
}


// TEST FILTER
export interface  FilterChoice{
  filter_id: string;
  filter_name: string;
}

export interface LLMFiltersChoice {
  filters: FilterChoice[];
}
