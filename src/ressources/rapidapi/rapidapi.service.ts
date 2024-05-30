import axios, { AxiosError, AxiosResponse } from 'axios';
import { LocationRapidResponse } from '../../types/rapidapi';
import { Exception } from '../../utils/exceptions';

const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';
const RAPIDAPI_BASE_URL: string = `https://${RAPIDAPI_HOST}/v1/hotels`;
const RAPIDAPI_HEADERS: Record<string, string> = {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
    'X-RapidAPI-Host': RAPIDAPI_HOST
};
export class RapidAPIService {

    public async fetchDestination(destination: string): Promise<LocationRapidResponse> {
        try {            
            const url: string = `${RAPIDAPI_BASE_URL}/locations?locale=en-gb&name=${destination}`;
            console.log('LOCATION URL')
            console.log(url)
            const response: AxiosResponse<any> = await axios.get(url, { headers: RAPIDAPI_HEADERS })
            .catch((err) => {
                if (err.response.status === 422) {
                    console.log(422)
                    console.log(err.response)
                    throw new Exception(err.response.statusText, err.response.status);    
                }
                if (err.response.status === 429) {
                    console.log(429)
                    console.log('Too many requests')
                    throw new Exception(err.response.statusText, 429);    
                }

                if (err.reponse.status === 401) {
                    console.log(401)
                    console.log('Forbidden')
                    throw new Exception(err.response.statusText, 401);    
                }
                // console.log(err)
                throw new Exception('Rapid API Error', 400);
            });
            let res: LocationRapidResponse = {
                dest_id: "",
                name: "",
                dest_type: ""
            };

            for (const dest_category of response.data) {
                if (dest_category.dest_type === 'city') {
                    res.dest_id = dest_category.dest_id;
                    res.name = dest_category.name;
                    res.dest_type = dest_category.dest_type;
                    break;   
                }
            }

            if (res.dest_id === "") {
                for (const dest_category of response.data) {
                    if (dest_category.dest_type === 'region') {
                        res.dest_id = dest_category.dest_id
                        res.name = dest_category.name;
                        res.dest_type = dest_category.dest_type;
                        break;
                    }
                }   
            }

            if (res.dest_id === "") {
                for (const dest_category of response.data) {
                    if (dest_category.dest_type === 'country') {
                        res.dest_id = dest_category.dest_id
                        res.name = dest_category.name;
                        res.dest_type = dest_category.dest_type;
                        break;
                    }
                }   
            }
             
            return res;
        } catch(error) {
            throw error;
        }
    }

    public async fetchHotels(
        order_by: string,
        dest_id: any,
        dest_type: string,
        checkin_date: string, 
        checkout_date: string, 
        adults_number: number, 
        room_number: number, 
        children_ages: string, 
        categories_filter_ids: string, 
        include_adjacency: boolean, 
        children_number: number,
        currency: string,
        locale: string
        ): Promise<any> {
        try {
            let url = `${RAPIDAPI_BASE_URL}/search?checkin_date=${checkin_date}&dest_type=${dest_type}&units=metric&checkout_date=${checkout_date}&adults_number=${adults_number}&order_by=${order_by}&dest_id=${dest_id}&filter_by_currency=${currency}&locale=${locale}&room_number=${room_number}&page_number=0&include_adjacency=${include_adjacency}`;
            if (children_number > 0) {
            url += `&children_number=${children_number}&children_ages=${children_ages}`;
            }
            if (categories_filter_ids.length > 0) {
                url += `&categories_filter_ids=${categories_filter_ids}`;
            }
            
            console.log('HOTEL URL')
            console.log(url)
            const response: AxiosResponse<any> = await axios.get(url, { headers: RAPIDAPI_HEADERS })
            .catch((err: any) => {
                if (err.response.status === 422) {
                    throw new Exception(err.response, err.response.status);    
                }
                if (err.response.status === 429) {
                    console.log(err.response.status)
                    console.log(err.response.status)

                    throw new Exception(err.response.statusText, 429);    
                }
                console.log(err)
                throw new Exception('Rapid API Error', 400);
            });
            return response.data.result;
        } catch(error) {
            throw error;
        }
    }

    public async fetchFilters(
        order_by: string, 
        dest_id: string, 
        arrival_date: string, 
        departure_date: string,
        adults_number: number, 
        room_number: number, 
        children_ages: string,  
        children_number: number, 
        dest_type: string, 
        currency?: string
        ): Promise<any> {
        try {
            // &categories_filter_ids=${categories_filter_ids}
            // const include_adjacency = 'True'
            let url = `${RAPIDAPI_BASE_URL}/search-filters?checkin_date=${arrival_date}&dest_type=${dest_type}&units=metric&checkout_date=${departure_date}&adults_number=${adults_number}&order_by=${order_by}&dest_id=${dest_id}&filter_by_currency=${currency}&locale=en-gb&room_number=${room_number}&page_number=0`;
            if (children_number > 0) {
                url += `&children_number=${children_number}&children_ages=${children_ages}`;
            }
            console.log('FILTER URL')
            console.log(url)
            const response: AxiosResponse<any> = await axios.get(url, { headers: RAPIDAPI_HEADERS })
            .catch((err: any) => {
                // console.log(err.response.status)
                // console.log(err.response)

                if (err.response.status === 429) {
                    console.log(err.response.status)
                    console.log(err.response.statusText)
                    throw new Exception(err.response.statusText, 429);    
                }

                if (err.response.status === 422) {
                    throw new Exception(err.response?.data?.detail[0].msg, err.response.status);
                }

                if (err.response.status === 504) {
                    console.log(504)
                    console.log(err.response)
                    throw new Exception(err.response.data.message, 504);
                }

                throw new Exception('Rapid API Error:' + err, 400);
            });
            return response.data.filter;
        } catch(error) {
            throw error;
        }
    }
}

