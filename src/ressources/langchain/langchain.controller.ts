import { Router, response } from "express";
import { LangchainService } from "./langchain.service";
import {  LLMAdvice, LLMAdviceResponse, LLMFilterReponse, LLMFilterSpecifities, LLMThink } from "../../types/langchain";
import { pipeline } from "node:stream/promises";
import { StreamingTextResponse } from "ai";

const LangchainController = Router();
const service: LangchainService = new LangchainService();


/**
 * @openapi
 * /llm/parameters:
 *   post:
 *     summary: Suggest hotels dates and destinations
 *     tags:
 *       - LLM
 *     description: Suggest hotels dates and destinations based on client input.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Client input
 *               country:
 *                 type: string
 *                 description: Client country
 *               city:
 *                 type: string
 *                 description: Client city
 *     responses:
 *       200:
 *         description: Successfully processed the destinations.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/LLMAdviceResponse'
 *       400:
 *         description: Bad request. This can happen due to invalid input format or other client errors.
*/
LangchainController.post('/extract', async (req, res) => {
    try {
        const [filter_specificities, advice] = await Promise.all([
            service.llmBuildFilterSpecificities(req.body.prompt),
            service.llmParameters(req.body.prompt, req.body.country, req.body.city)
        ]);


        for (let prop in filter_specificities) {
            if (filter_specificities.hasOwnProperty(prop)) {
                if (filter_specificities[prop as keyof LLMFilterSpecifities] === 'null') {
                    filter_specificities[prop as keyof LLMFilterSpecifities] = null;
                }
                // console.log(prop + ': ' + filter_specificities[prop as keyof LLMFilterSpecifities]);
            }
        }

        const response: LLMAdviceResponse = {
            llm_advice: advice,
            llm_filter_specificities: filter_specificities
        }
        return res.status(200).json(response);
    } catch(err) {
        console.log(err)
        return res.status(400).json(err);
    }
})


/**
 * @openapi
 * /llm/filter:
 *   post:
 *     summary: Suggest filters for given reservations
 *     tags:
 *       - LLM
 *     description: get filters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *              type: object
 *              properties:
 *               llm_filter_specificities:
 *                  $ref: '#/components/schemas/LLMFilterSpecifities'
 *               dest_name:
 *                 type: string
 *                 description: Destination
 *               dest_id:
 *                 type: string
 *                 description: Destination id
 *               filters:
 *                  type: array
 *     responses:
 *       200:
 *         description: Successfully processed the destinations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LLMThinkResponse'
 *       400:
 *         description: Bad request. This can happen due to invalid input format or other client errors.
*/
LangchainController.post('/filter', async (req, res) => {
    try {
        const destAndFiltersResponse: LLMFilterReponse[] = await Promise.all(
            req.body.map(async (destRequest: any) => {
                try {
                    if (destRequest.filters.length > 0) {
                        const airesponse: LLMThink = await service.llmFilter(destRequest.filter_specificities, destRequest.dest_name, destRequest.filters);
                        return {
                            error: false,
                            dest_name: destRequest.dest_name,
                            dest_id: destRequest.dest_id,
                            airesponse: airesponse, 
                            dest_type: destRequest.dest_type
                        };
                    } else {
                        return {
                            error: true,
                            airesponse: null,
                            dest_name: destRequest.dest_name,
                            dest_id: destRequest.dest_id,
                            status_translate_key: 'results.ai.iCouldntFindAnything',
                            dest_type: ""
                        };
                    }
                } catch (error) {
                    throw error;
                }
            })
        );
    
        return res.status(200).json(destAndFiltersResponse);
    } catch (err) {
        console.error(err);
        return res.status(400).json(err);
    }
})

LangchainController.post('/test-filter', async (req, res) => {
    try {

        

        // req.body.filters est un FiltersRapidResponse[]
        // et en fait pour construire chaque AiFiltersChoice, je dois faire un appel chatgpt
        //
        // Pour construire le LLMThink je dois construire des AiFilterCHoice
        // export interface  AiFiltersChoice{
        //     filter_id: string;
        //     filter_name: string;
        //     filter_section: string;
        //   }
        // je dois juste constuire un LLMThink et le mettre dans un LLMFIlterResponse
        // je dois retourner un tableau de LLMFilterResponse qui correspond aux filtres choisis pour chaque destination
        const response = await service.testLLMFilter(req.body.userRequest, req.body.dest_name, req.body.filters);
        return res.status(200).json(response)
    } catch (err) {
        console.error(err);
        return res.status(400).json(err);
    }
})
LangchainController.post('/agent', async (req,res) => {
    try {
        console.log('tu passe la ')
        const response: ReadableStream | any = await service.agent(req.body.messages);
        console.log('response:')
        console.log(response)

        if (response instanceof ReadableStream) {
            response.pipeTo(new WritableStream({
                write(value) {
                    // console.log(value)
                    res.write(value);
                },
                close() {
                    res.status(200).end()
                }
            }))
            .catch((err: any) => {
                console.log('erreur dans pipeto')
                console.log(err)
                return res.status(500).json(err);
            })
        } else {
            return res.status(200).json(response);
        }
   
    } catch(err) {
        console.log('ERR')
        console.log(err)
        return res.status(400).json(err);
    }
})


/**
 * @openapi
 * components:
 *   schemas:
 *     DiscussionRequest:
 *       type: object
 *       properties:
 *         userRequest:
 *           type: string
 *           description: User's discussion request
 *         checkin_date:
 *           type: string
 *           format: date
 *           description: Check-in date
 *         checkout_date:
 *           type: string
 *           format: date
 *           description: Check-out date
 *         room_number:
 *           type: integer
 *           description: Number of rooms
 *         children_number:
 *           type: integer
 *           description: Number of children
 *         adults_number:
 *           type: integer
 *           description: Number of adults
 *         destinations:
 *           type: array
 *           items:
 *             type: string
 *           description: List of destinations
 */

/**
 * @openapi
 * /discuss:
 *   post:
 *     summary: Start a discussion
 *     description: Initiates a discussion based on user information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiscussionRequest'
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Description of the error
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Description of the error
 */

LangchainController.post('/discuss', async (req, res) => {
    try {
        const response: ReadableStream = await service.llmDiscussion(req.body.userRequest, req.body.checkin_date, req.body.checkout_date, req.body.room_number, req.body.children_number, req.body.adults_number, req.body.destinations);
        response.pipeTo(new WritableStream({
            write(value) {
                res.write(value);
            },
            close() {
                res.status(200).end();
            }
        }))
        .catch((err: any) => {
            console.log('erreur dans pipeto')
            console.log(err)
            return res.status(500).json(err);
        })

    } catch (err) {
        return res.status(400).json(err)
    }
})

export { LangchainController };