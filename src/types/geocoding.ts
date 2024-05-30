/**
 * @openapi
 * components:
 *   schemas:
 *     ReverseGeocodingResponse:
 *       type: object
 *       properties:
 *         house_number:
 *           type: string
 *           description: House number
 *         road:
 *           type: string
 *           description: Road name
 *         city_block:
 *           type: string
 *           description: City block
 *         suburb:
 *           type: string
 *           description: Suburb name
 *         city_district:
 *           type: string
 *           description: City district
 *         city:
 *           type: string
 *           description: City name
 *         state:
 *           type: string
 *           description: State name
 *         region:
 *           type: string
 *           description: Region name
 *         postcode:
 *           type: string
 *           description: Postal code
 *         country:
 *           type: string
 *           description: Country name
 *         country_code:
 *           type: string
 *           description: Country code
 */

export interface ReverseGeocodingResponse {
  house_number: string
  road: string
  city_block: string
  suburb: string
  city_district: string
  city: string
  state: string
  region: string
  postcode: string
  country: string
  country_code: string
}
