import axios, { AxiosError, AxiosResponse } from 'axios';
import { ReverseGeocodingResponse } from '../../types/geocoding';

const API_KEY = process.env.GEOCODING_API_KEY;
const GEOCODING_BASE_URL = 'https://geocode.maps.co';
export class GeocodingService {
  public async fetchReverseGeocoding(lon: any, lat: any): Promise<ReverseGeocodingResponse> {
    try {
      const url: string = `${GEOCODING_BASE_URL}/reverse?lon=${lon}&lat=${lat}&api_key=${API_KEY}`;
      console.log('FETCH LOCATION');
      console.log(url);
      const response: AxiosResponse<any> = await axios.get(url).catch((err: AxiosError) => {
        throw err.response;
      });
      return response.data.address;
    } catch (err) {
      throw err;
    }
  }
}
