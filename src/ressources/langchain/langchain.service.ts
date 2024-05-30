import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { LLMAdvice, LLMAdviceResponse, LLMFilterSpecifities, LLMFiltersChoice, LLMThink } from "../../types/langchain";
import { CategoryFilterResponse, FiltersRapidResponse, LocationRapidResponse } from "../../types/rapidapi";
import {  enFilterPrompt, enFilterSpecificities, enParametersPrompt, testFilterPrompt } from "../../helpers/prompts/prompts.en";
import { DynamicStructuredTool, DynamicTool, SerpAPI, WikipediaQueryRun } from "langchain/tools";
import {
    MessagesPlaceholder,
  } from "@langchain/core/prompts";
import { Calculator } from "langchain/tools/calculator";
import { ChatOpenAI,OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, ChatMessage } from "@langchain/core/messages";
import { AgentExecutor, createOpenAIFunctionsAgent, createOpenAIToolsAgent, createStructuredChatAgent } from "langchain/agents";
import { SerpAPILoader } from "langchain/document_loaders/web/serpapi";
import { WebBrowser } from "langchain/tools/webbrowser";
import { RapidAPIService } from "../rapidapi/rapidapi.service";

  export class LangchainService {

    // gpt-4-0613
    public modelName: string = "gpt-3.5-turbo-1106";
    // public modelName: string = "gpt-4-0613";
    public temperature: number = 1;
    public rapidService: RapidAPIService = new RapidAPIService();
    public async llmParameters(promptRequest: string, country: string, city: string): Promise<LLMAdvice> {
        try {
            console.log('prompt:')
            console.log(promptRequest)

            const today: Date = new Date(); 
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                  arrival_date: z.string().describe(`Arrival date, Format: YYYY-MM-DD, cannot be before 2024`),
                  departure_date: z.string().describe("Departure date, Format: YYYY-MM-DD, cannot be before 2024"),
                  number_adults: z.number().describe("Number of adults"),
                  number_children: z.number().describe("Number of children"),
                  number_rooms: z.number().describe("number of rooms"),
                  cities: z.array(z.string()).describe("An array of city(ies) in en-gb format"),
                  sort: z.string().describe("'popularity', 'price' or 'review_score'"),
                  answer: z.string().describe('Your answer to the client'),
                })
            );
    
            const formatInstructions = parser.getFormatInstructions();
    
            const prompt = new PromptTemplate({
                template: enParametersPrompt,
                inputVariables: ["input","comingFrom", "tomorrow"],
                partialVariables: { format_instructions: formatInstructions },
            });
    
            const model = new OpenAI({ temperature: this.temperature, modelName: this.modelName, openAIApiKey: process.env.OPENAI_API_KEY });
            
            // console.log('tomorrow:')
            // console.log(tomorrow)
            const input = await prompt.format({
                input: promptRequest,
                tomorrow: tomorrow.toISOString().slice(0, 10),
                comingFrom: city + ', ' + country
            });

            const response = await model.call(input);
            const startIndex = response.indexOf('{');
            const endIndex = response.indexOf('}');
            const formattedJson = response.substring(startIndex, endIndex + 1)
            const json: LLMAdvice = await parser.parse(formattedJson);
            console.log(json)
            json.departure_date = this.dateAdjust(new Date(json.departure_date)).toISOString().slice(0, 10);
            json.arrival_date = this.dateAdjust(new Date(json.arrival_date)).toISOString().slice(0, 10);
            return json;
        } catch(error) {
            throw error;
        }
    }

    public async llmDiscussion(userRequest: string, checkin_date: string, checkout_date: string, rooms_number: string, children_number: string, adults_number: string, destinations: string[]) {
      try {

        const model = new OpenAI({
          // maxTokens: 25,
          modelName: "gpt-3.5-turbo-1106",
          streaming: true
        });
        
        const prompt = 
        `
          Act as a travel agent
          I've sent you this request :

          '''
          ${userRequest}
          '''
  
          And you have determined those informations:
          Checkin date:
          ${checkin_date}
          Checkout date:
          ${checkout_date}
          Rooms number:
          ${rooms_number}
          Children number:
          ${children_number}
          Adults number:
          ${adults_number}
          Destinations:
          ${destinations}
   
          Using my language, 'sell me' those destinations.
          Always finish by saying that you will now search for hotels. Don't say hello, goodbye or thank you.
          Don't talk too much. Use my language.
        `
        const stream = await model.stream(prompt);
        return stream;
      } catch (err) {
        throw err;
      }
    }

    public async testLLMFilter(userRequest: string, dest_name: string, filters: FiltersRapidResponse[]): Promise<any> {
      try {
          const parser = StructuredOutputParser.fromZodSchema(
            z.object({
              items: z.array(
                z.object({
                  name: z.string().describe('name'),
                  // filter_id: z.string().describe('filter_id')
                })
              ).describe('Can be empty')
            })                
          );
    
          const formatInstructions = parser.getFormatInstructions();
        
          const prompt = new PromptTemplate({
              template: testFilterPrompt,
              inputVariables: ["userRequest", "dest_name", "filters_category"],
              partialVariables: { format_instructions: formatInstructions },
          });
    
          const model = new OpenAI({ temperature: this.temperature, modelName: this.modelName, openAIApiKey: process.env.OPENAI_API_KEY });

          const filterPromises: Promise<string>[] = [];

          // Boucler sur le tableau de filtres
          for (const filter of filters) {
              // Boucler sur la propriété categories de chaque filtre
              const input = await prompt.format({
                userRequest: userRequest,
                dest_name: dest_name,
                filters_category: this.stringifyAndFormatFilterCategory(filter)  // Passer chaque catégorie individuellement
              });
              // for (const category of filter.categories) {

              //   console.log(category)

                  console.log(input)

              //     // Ajouter la promesse à notre tableau de promesses
              //   }
                const promise = model.call(input);
                filterPromises.push(promise);
                // break;
          }
          const filterResults: string[] = await Promise.all(filterPromises);
          const test = filterResults.map((value: string) => this.extractJsonFromString(value));
          console.log('test')
          console.log(test)
          return test;

          // const input = await prompt.format({
          //     userRequest: userRequest,
          //     dest_name: dest_name,
          //     filters_category: filters
          // });
          // let response = await model.call(input).then(err => err);
          // const json: LLMFiltersChoice = this.extractJsonFromString(response);
                
          // return json;
      } catch(err) {
        throw err;
      }
    }

    public async llmFilter(filter_specificities: LLMFilterSpecifities, dest_name: string,filters: FiltersRapidResponse[]): Promise<LLMThink> {
        try {
            const parser = StructuredOutputParser.fromZodSchema(
              z.object({
                filters: z.array(
                    z.object({
                        filter_name: z.string(),
                        filter_id: z.string(),
                        filter_section: z.string()
                    }),    
                )
              })                
            );
    

            console.log('filter_specificities')
            console.log(filter_specificities)
            const formatInstructions = parser.getFormatInstructions();
    
            const prompt = new PromptTemplate({
                template: enFilterPrompt,
                inputVariables: ["specificities", "dest_name", "filters"],
                partialVariables: { format_instructions: formatInstructions },
            });
    
            const model = new OpenAI({ temperature: this.temperature, modelName: 'gpt-4', openAIApiKey: process.env.OPENAI_API_KEY });
            const input = await prompt.format({
                specificities: this.formatLLMFilterSpecifities(filter_specificities),
                dest_name: dest_name,
                filters: this.stringifyAndFormatFilterArray(filters)
            });

            let response = await model.call(input).then(err => err);
            console.log('--------------------------')
            console.log('prompt')
            console.log('--------------------------')
            console.log(input)
            console.log('--------------------------')
            console.log('--------------------------')


            const json : LLMThink = this.extractJsonFromString(response);
            
            return json;

        } catch(error) {
            throw error;
        }
    }
    
    public async llmBuildFilterSpecificities(userInput: string): Promise<LLMFilterSpecifities> {
      try {
        const parser = StructuredOutputParser.fromZodSchema(
          z.object({
            budget: z.string().describe('Budget, nullable'),
            room_facilities: z.array(z.string().describe('Room Facility')).describe('nullable'),
            property_type: z.string().describe('Property Type, nullable'),
            meals: z.string().describe('Meals, nullable'),
            facilities: z.array(z.string().describe('Hotel Facility')).describe('nullable'),
            // landmarks: z.array(z.string().describe('Landmark, nullable')).describe('nullable'),
            districts: z.array(z.string().describe('District')).describe('nullable'),
            bed_preference: z.string().describe('Bed Preference, nullable'),
            chains: z.array(z.string().describe('Chain of hotel')).describe('nullable'),
            review_score: z.string().describe('Review Score, nullable'),
            distance_to_city_center: z.string().describe('Must be a numeric value, nullable'),
            beach_access: z.string().describe('Must be a numeric value, nullable'),
            property_rating: z.string().describe('Property rating, nullable'),
          })                
        );
  
        const formatInstructions = parser.getFormatInstructions();
      
        const prompt = new PromptTemplate({
            template: enFilterSpecificities,
            inputVariables: ["input"],
            partialVariables: { format_instructions: formatInstructions },
        });
  
        const model = new OpenAI({ temperature: this.temperature, modelName: this.modelName, openAIApiKey: process.env.OPENAI_API_KEY });
        const input = await prompt.format({
            input: userInput
        });

        let response = await model.call(input).then(err => err);

        console.log('filter specificities:')
        console.log(response)
        
        const json: LLMFilterSpecifities = this.extractJsonFromString(response);

        return json;
      } catch (error) {
        throw error
      }
    }
    

    private formatLLMFilterSpecifities(filters: LLMFilterSpecifities): string {
      const formattedFilters: string[] = [];
    
      if (filters.budget) {
        formattedFilters.push(`Budget: ${filters.budget}`);
      }
    
      if (filters.room_facilities && filters.room_facilities.length > 0) {
        formattedFilters.push(`Room facilities: ${filters.room_facilities.join(', ')}`);
      }
    
      if (filters.property_type) {
        formattedFilters.push(`Property type: ${filters.property_type}`);
      }
    
      if (filters.meals) {
        formattedFilters.push(`Meals: ${filters.meals}`);
      }
    
      if (filters.facilities && filters.facilities.length > 0) {
        formattedFilters.push(`Facilities: ${filters.facilities.join(', ')}`);
      }
    
      if (filters.districts && filters.districts.length > 0) {
        formattedFilters.push(`Districts: ${filters.districts.join(', ')}`);
      }

      // if (filters.landmarks && filters.landmarks.length > 0) {
      //   formattedFilters.push(`Landmarks: ${filters.landmarks.join(', ')}`);
      // }
    
      if (filters.bed_preference) {
        formattedFilters.push(`Bed preference: ${filters.bed_preference}`);
      }
    
      if (filters.chains && filters.chains.length > 0) {
        formattedFilters.push(`Chains: ${filters.chains.join(', ')}`);
      }
    
      if (filters.review_score) {
        formattedFilters.push(`Review score: ${filters.review_score}`);
      }
    
      if (filters.distance_to_city_center) {
        formattedFilters.push(`Distance to city center: ${filters.distance_to_city_center}`);
      }
    
      if (filters.beach_access) {
        formattedFilters.push(`Beach access: ${filters.beach_access}`);
      }
    
      if (filters.property_rating) {
        formattedFilters.push(`Property rating: ${filters.property_rating}`);
      }
    
      // if (filters.number_bedrooms) {
      //   formattedFilters.push(`Number of bedrooms: ${filters.number_bedrooms}`);
      // }
    
      return formattedFilters.join('\n');
    }

    private stringifyAndFormatFilterCategory(filters: FiltersRapidResponse) {
      let result = "";
      const title = filters.title;
      const type = filters.type;

      result += "Section: " + title + "\n";
      // if (title === 'Chain') {
      //   result += "select only if an hotel is mentionned \n"
      // }
      const categories = filters.categories;
      for (let category of categories) {
        result += "  - " + category.name + "\n";
      }
      // result += "\n";
      return result;
    }

    private stringifyAndFormatFilterArray(tableau: FiltersRapidResponse[]) {
        let result = ""
        for (var i = 0; i < tableau.length; i++) {
            var titre = tableau[i].title;
            var type = tableau[i].type;
            
            result += "Section: " + titre + "\n";
            result += "Type: " + type + "\n";

            var categories = tableau[i].categories;
            for (var j = 0; j < categories.length; j++) {
                var categorie = categories[j];
                result += "   filter_name: " + categorie.name + ", filter_id: " + categorie.id +"\n";
            }
            // , count: " + categorie.count
            result += "\n";
        }

        return result;
    }

    private extractJsonFromString(inputString: string) {
        console.log(inputString);
        const regex = /\{(?:[^{}]|(?:\{(?:[^{}]|)*\})+)*\}/g;
      
        const matches = inputString.match(regex);
      
        try {
          if (matches && matches.length > 0) {
              const jsonObject = JSON.parse(matches[0]);
              return jsonObject;
            } else {
              console.error('Aucun JSON trouvé dans la chaîne.');
              throw null;
            }
        } catch (error) {
          console.error('Erreur lors de l\'analyse JSON :', error);
          throw error;
        }
    }

    private dateAdjust(date: Date) {
      const now = new Date();

      console.log('dateadjust')
      console.log('input date')
      console.log(date)
      // Vérifier si la date en entrée est inférieure à la date actuelle
      if (date < now) {
          // Ajouter un an à la date en entrée
          date.setFullYear(date.getFullYear() + 1);
          this.dateAdjust(date);
      }

      console.log('output date')
      console.log(date)
      // Renvoyer la date ajustée
      return date;
    }


    public async agent(messages: {role: string; content: string}[]): Promise<ReadableStream | any> {

      const convertToLangChainMessage = (message: any) => {
        if (message.role === "user") {
          return new HumanMessage(message.content);
        } else if (message.role === "assistant") {
          return new AIMessage(message.content);
        } else {
          return new ChatMessage(message.content, message.role);
        }
      };

      // console.log('messages from front')
      // console.log(messages)
      const previousMessages: any = messages
      .slice(0, -1)
      .map(convertToLangChainMessage);

      // const previousMessages2: any = messages
      // .slice(0, -1)
      // console.log('previousMessages2')
      // console.log(previousMessages2)
      // take first message since it is user message
      const currentMessageContent = messages[messages.length - 1].content;
      console.log('currentMessageContent')
      console.log(currentMessageContent)
      const model = new ChatOpenAI({
        modelName: "gpt-3.5-turbo-1106",
        temperature: 0,
        // maxTokens: 25,
        // IMPORTANT: Must "streaming: true" on OpenAI to enable final output streaming below.
        streaming: true,
        // verbose: true
      });
      const embeddings = new OpenAIEmbeddings();

      // let un = true;
      // let deux = false;
      // let trois = false;

      let flag = false;
      let checkinDateChosen: any;
      let location: LocationRapidResponse;

      let userParams: any;
      const tools = [
        // new WikipediaQueryRun({

        // }),
        // new Calculator(), 
        // new SerpAPI(process.env.SERPAPI_API_KEY, {
        //   location: 'San Francisco, California, USA',
        //   hl: 'en',
        //   gl: 'us',
          
        // }),
        // new SerpAPI(),
        // new DynamicStructuredTool({
        //   // returnDirect: false,

        //   verbose:true,
        //   name: 'parameters',
        //   description:
        //     "use this tool to define client paramters, dont ask the client any question",
        //   schema: z.object({

            // checkin_date: z.string().describe('checkin date, not null'),
            // checkout_date: z.string().describe('checkout date, not null'),
            // adults_number: z.string().describe('number of adults not null'),
            // children_number: z.string().describe('number of children, not null'),
            // children_ages: z.string().describe('children ages, not null'),
            // room_number: z.string().describe('number of rooms, not null'),
            // destination: z.string().describe("destination for user, must be a real place and can't be null")
        //   }),  
        //   func: async ({ children_ages, checkin_date, checkout_date, adults_number, children_number, room_number, destination }) => {
          
        //     console.log('PARAMETERS TOOL')
        //     // console.log(checkin_date)
            //  userParams = {
            //   checkin_date: this.dateAdjust(new Date(checkin_date)).toISOString().slice(0, 10), 
            //   checkout_date:  this.dateAdjust(new Date(checkout_date)).toISOString().slice(0, 10),
            //   adults_number: adults_number,
            //   children_number: children_number,
            //   room_number: room_number,
            //   destination: destination,
            //   children_ages: children_ages
            // }

        //     // checkinDateChosen = this.dateAdjust(new Date(checkin_date)).toISOString().slice(0, 10);

        //     console.log('parameters chosen by the AI')
        //     console.log(userParams)
         
        //     return JSON.stringify(userParams);
        //   },
        // }),
        // new DynamicStructuredTool({
        //   // returnDirect: false,
        //   verbose:true,
        //   name: 'filters',
        //   description:
        //     "When you've defined parameters, you need to use this tool to get a list of filters for a given destination",
        //   schema: z.object({
        //     checkin_date: z.string().describe('checkin date, not null'),
        //     checkout_date: z.string().describe('checkout date, not null'),
        //     adults_number: z.string().describe('number of adults not null'),
        //     children_number: z.string().describe('number of children, not null'),
        //     children_ages: z.string().describe('children ages, not null'),
        //     room_number: z.string().describe('number of rooms, not null'),
        //     destination: z.string().describe("destination for user, must be a real place and can't be null")
        //   }),  
        //   func: async ({ children_ages, checkin_date, checkout_date, adults_number, children_number, room_number, destination }) => {
          

        //     console.log('FILTERS TOOL')
        //     userParams = {
        //       checkout_date:  checkout_date,
        //       checkin_date: checkin_date, 
        //       adults_number: adults_number,
        //       children_number: children_number,
        //       room_number: room_number,
        //       destination: destination,
        //       children_ages: children_ages
        //     }

        //     console.log('userParams')
        //     console.log(userParams)

            
        //     // console.log('variable from last tool')
        //     // console.log(checkinDateChosen)
        //      location = await this.rapidService.fetchDestination(destination);
        //     const filters = await this.rapidService.fetchFilters(
        //       'popularity',
        //       location.dest_id,
        //       checkin_date,
        //       checkout_date,
        //       parseInt(adults_number),
        //       parseInt(room_number),
        //       children_ages,
        //       parseInt(children_number),
        //       location.dest_type,
        //       'EUR'
        //     )

        //     const filtersResponse: FiltersRapidResponse[] = [];

        //     const processFilter = (rapidFilter: FiltersRapidResponse) => {
        //       if (!['previous', 'popular', 'free_cancellation'].includes(rapidFilter.id)) {                    
        //           const categories: CategoryFilterResponse[] = rapidFilter.categories.map((categorie: any) => {
        //               const { style_for_count, popular, selected, popular_rank,experiment_tracking_data, ...nouvelleCategorie } = categorie;
        //               return nouvelleCategorie;
        //           });
        //           const filters: FiltersRapidResponse = {
        //               categories,
        //               title: rapidFilter.title,
        //               type: rapidFilter.type,
        //               id: rapidFilter.id
        //           };
        //           filtersResponse.push(filters);
        //       }
        //     };
  
        //     filters.forEach(processFilter);


        //     console.log('stringified filters')
        //     console.log(this.stringifyAndFormatFilterArray(filtersResponse))
            
         
        //     return JSON.stringify(this.stringifyAndFormatFilterArray(filtersResponse));
        //   },
        // }),

        // new DynamicStructuredTool({
        //   verbose:true,
        //   name: 'hotels_search',
        //   description:
        //     "After you have chosen correct filters for the client, use this to get a list of hotels",
        //   schema: z.object({
        //     filters_chosen: z.array(z.string().describe('filter chosen')),
        //   }),  
        //   func: async ({ filters_chosen }) => {


        //     console.log('HOTELS TOOLS')
        //     // console.log('parameters chosen by the AI in the filter tool')
        //     // console.log(userParams)
        //     // console.log('location')
        //     // console.log(location)
        //     // console.log('filters_chosen')
        //     // console.log(filters_chosen)
        //     const hotels = await this.rapidService.fetchHotels(
        //       'popularity',
        //       location.dest_id,
        //       location.dest_type,
        //       userParams.checkin_date,
        //       userParams.checkout_date,
        //       userParams.adults_number,
        //       userParams.room_number,
        //       userParams.children_ages,
        //       filters_chosen.join(','),
        //       true,
        //       userParams.children_number,
        //       'EUR',
        //       'fr'
        //     )

        //     // console.log(hotels.slice(0,3))
        //     // const test = {
        //     //   checkout_date:  checkout_date,
        //     //   checkin_date: checkin_date, 
        //     //   adults_number: adults_number,
        //     //   children_number: children_number,
        //     //   room_number: room_number,
        //     //   destination: destination,
        //     //   children_ages: children_ages
        //     // }

        //     // console.log('parameters chosen by the AI in the filter tool')
        //     // console.log(test)
        //     // console.log('variable from last tool')
        //     // console.log(checkinDateChosen)
        //     // const location: LocationRapidResponse = await this.rapidService.fetchDestination(destination);
        //     // const filters = await this.rapidService.fetchFilters(
        //     //   'popularity',
        //     //   location.dest_id,
        //     //   checkin_date,
        //     //   checkout_date,
        //     //   parseInt(adults_number),
        //     //   parseInt(room_number),
        //     //   children_ages,
        //     //   parseInt(children_number),
        //     //   location.dest_type,
        //     //   'EUR'
        //     // )

        //     // console.log('filters returnned by RAPID')
        //     // console.log(filters)
            
        //     return JSON.stringify(hotels.slice(0,3));
        //   },
        // })
        // new DynamicStructuredTool({
        //   verbose: true,
        //   name: "destinations",
        //   description: "Extract destination from client message, suggest if exxtraction is not possible",
        //   schema: z.object({
        //     destinations: z.array(
        //       z.string().describe('destination')
        //     )
        //   }),
        //   func: async({ destinations }) => {

        //     console.log('DESTINATIONS CHOICE')
        //     console.log(destinations)
        //     return JSON.stringify(destinations)
        //   }
        // }),
        // new DynamicStructuredTool({
        //     verbose: true,
        //     name: "language",
        //     description: "use this tool to know in which language respond to the client",
        //     schema: z.object({
        //       language: z.string().describe('User language')
        //     }),
        //     func: async ({ language }) => {
        //       console.log('IL PASSE DANS L OUTIL POUR LA LANGUE')
        //       console.log(language)
        //       return language
        //     }
        // }),
      //   new DynamicStructuredTool({
      //     verbose: true,
      //     name: "informations_reminder_tool",
      //     description: `this tool is useful for you to remember what the user wants`,
      //     schema: z.object({
      //       destinations: z.array(z.string().describe('Format: City, Country')),
      //       arrival_date: z.string().describe('Format: YYYY-MM-DD'),
      //       departure_date: z.string().describe('Format: YYYY-MM-DD'),
      //       adults_number: z.string(),
      //       children_number: z.string(),
      //       room_number: z.string()
      //     }),
      //     func: async ({ arrival_date, departure_date, adults_number, children_number, room_number }) => {
      //       console.log('IL PASSE DANS L OUTIL LES PARAMETRES DE BASE')
      //        userParams = {
      //         checkin_date: this.dateAdjust(new Date(arrival_date)).toISOString().slice(0, 10), 
      //         checkout_date:  this.dateAdjust(new Date(departure_date)).toISOString().slice(0, 10),
      //         adults_number: adults_number,
      //         children_number: children_number,
      //         room_number: room_number,
      //       }

      //       console.log('EXTRACTED BY AI')
      //       console.log(userParams)
      //       console.log('EXTRACTED BY AI')
      //      return JSON.stringify(userParams);

      //     }
      // }),
      // new DynamicStructuredTool({
      //   verbose: true,
      //   name: 'specific_preferences_tool',
      //   description: `

      //   Please extract the following information from the client's messages:
        
      //   - Budget 
      //   - Room Facilities
      //   - Property Type
      //   - Meals
      //   - Hotel Facilities
      //   - Districts:
      //     Avoid using city names; use real district names or famous landmarks.
      //   - Bed preference
      //   - Chain 
      //   - Review score
      //   - Distance from city center
      //   - Beach Access
      //   - Property Rating
        
      //   Return null if extraction is not possible.
      //   `,
      //   schema: z.object({
      //     budget: z.string().nullable(),
      //     room_facilities: z.array(z.string()).nullable(),
      //     property_type: z.string().nullable(),
      //     meals: z.string().nullable(),
      //     hotel_facilities: z.array(z.string()).nullable(),
      //     districts: z.array(z.string()).nullable(),
      //     bed_preference: z.string().nullable(),
      //     chain: z.string().nullable(),
      //     review_score: z.string().nullable(),
      //     distance_from_city_center: z.string().nullable(),
      //     beach_access: z.string().nullable(),
      //     property_rating: z.string().nullable()
      //   }),
      //   func: async ({budget, room_facilities, property_type, meals, hotel_facilities, districts, bed_preference, chain, review_score, distance_from_city_center, beach_access, property_rating}) => {
      //     console.log('IL PASSE DANS L OUTIL POUR LES SPECIFICITES')
      //     let preference = {
      //       budget: budget,
      //       room_facilities: room_facilities,
      //       property_type: property_type,
      //       meals: meals,
      //       hotel_facilities: hotel_facilities,
      //       districts: districts,
      //       bed_preference: bed_preference,
      //       chain: chain,
      //       review_score: review_score,
      //       distance_from_city_center: distance_from_city_center,
      //       beach_access: beach_access,
      //       property_rating: property_rating
      //     }
      //     console.log(preference)
      //     return JSON.stringify(preference);
      //   }
      // }),
      // new DynamicStructuredTool({
      //   verbose: true,
      //   name: 'dates_extractor_tool',
      //   description: "extract dates in user's messages",
      //   schema: z.object({
      //     arrival_date: z.string(),
      //     departure_date: z.string(),
      //   }),
      //   func: async({arrival_date, departure_date}) => {
      //     console.log('IL PASSE DANS DATE EXTRACTOR')
      //     console.log(arrival_date + departure_date)
      //     return 'Arrival date:' + arrival_date + ', Departure Date:' + departure_date;
      //   }
      // }),
      // new DynamicStructuredTool({
      //   verbose: true,
      //   name: 'number_person_tool',
      //   description: "extract number of persons in user's messages",
      //   schema: z.object({
      //     adults_number: z.string(),
      //     children_number: z.string(),
      //   }),
      //   func: async({adults_number, children_number}) => {
      //     console.log('IL PASSE DANS numberperson Tool')
      //     console.log(adults_number + children_number)
      //     return 'Adults number:' + adults_number + ', Children number:' + children_number;
      //   }
      // }),
      new DynamicStructuredTool({
        // returnDirect: true,
        verbose: true,
        name: "json_return_tool",
        description:"this tool create a json object",
        schema: z.object({
          parameters: z.object({
            destinations: z.array(z.string().describe('Format: City, Country')),
            arrival_date: z.string().describe('Format: YYYY-MM-DD'),
            departure_date: z.string().describe('Format: YYYY-MM-DD'),
            adults_number: z.string(),
            children_number: z.string(),
            room_number: z.string(),
            sort: z.string().describe("Which sorting would you choose between 'popularity', 'price' or 'review_score'.")
          }),
          specific_preferences: z.object({
            budget: z.string().optional(),
            room_facilities: z.array(z.string()).optional(),
            property_type: z.string().optional(),
            meals: z.string().optional(),
            facilities: z.array(z.string()).optional(),
            districts: z.array(z.string()).optional(),
            bed_preference: z.string().optional(),
            chain: z.string().optional(),
            review_score: z.string().optional(),
            distance_to_city_center: z.string().optional(),
            beach_access: z.string().optional(),
            property_rating: z.string().optional()
          })
        }),
        func: async({ parameters, specific_preferences}) => {
          console.log('IL PASSE DANS JSON RETURN')
          const test = {
            parameters: parameters,
            specific_preferences: specific_preferences
          }

          test.parameters.arrival_date =  this.dateAdjust(new Date(test.parameters.arrival_date)).toISOString().slice(0, 10);
          test.parameters.departure_date =  this.dateAdjust(new Date(test.parameters.departure_date)).toISOString().slice(0, 10); 

          // userParams = test;
          console.log(test)

          // return JSON.stringify(test)
          return 'Only write this JSON object to the user with no additional text: ' + JSON.stringify(test);
        }
      })
      ];

      
      // - Always start by asking where does the user wants to go, make suggestions.
      // const template = `
      // Your role is to have a discussion with the user in order to prepare their trip and gather the following information:

      // Arrival date
      // Departure date
      // Number of adults
      // Number of children
      // Number of rooms
      // Destinations
      
      // In addition to that, try to collect information about this:

      // Budget
      // Room Facilities
      // Property Type
      // Meals
      // Hotel Facilities
      // Districts:
      // Don't use city names; use real district names or famous landmarks.
      // Bed preference
      // Chain
      // Review score
      // Distance from the city center
      // Beach Access
      // Property Rating

      // These pieces of information are optional. You don't have to list all the above to the user. Let him talk and do the rest.
      // `
      const template = `
      Context:
        - Your name is Planner, a travel agent bot, 
        - You must ask the user questions to create the final JSON Response.
        - User is from Paris, France.

        Mission:
        You need to gather the following informations by asking questions to the user or by deducing it yourself:
        
        Arrival date
        Departure date
        Number of adults
          Count the client as one adult and detect any accompanying adults.
        Number of children
          Detect if any children are mentioned, else write 0.
        Number of rooms
          You can deduce it by yourself.
        Destinations
          Use city names. Make suggestions.
        Sort
          Never ask the user about this and deduce it by yourself. Should always be 'popularity' unless the user talks about price.

        Additionally, you can also collect optional informations related to the following:
        - Budget:
          Use < and > for price ranges, ~ for approximations.
        - Room Facilities
        - Property Type
        - Meals
        - Hotel Facilities
        - Districts:
          Don't use city names; use real district names or famous landmarks.
        - Bed preference
        - Chain 
        - Review score
        - Distance to city center
        - Beach Access
        - Property Rating

        Once you have gathered enough information, write a json object using the json_return_tool.
      `

      const prompt = ChatPromptTemplate.fromMessages([
        ["system", template],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"], 
        new MessagesPlaceholder("agent_scratchpad"),
      ]);

      const agent = await createOpenAIFunctionsAgent({
        llm: model,
        tools,
        prompt,
      });

      const agentExecutor = new AgentExecutor({
        agent,
        tools,
        returnIntermediateSteps: false
      });

      console.log('flag')
      console.log(flag)
      console.log("userParams")
      console.log(userParams)
      if (flag) {
        console.log('il va retourner du json');
        const result = await agentExecutor.invoke({
          input: currentMessageContent,
          chat_history: previousMessages,
        });
        return result;
      } else {
        console.log('il va retourner un stream')
        const logStream = await agentExecutor.streamLog({
          input: currentMessageContent,
          chat_history: previousMessages,
        });
  
        const textEncoder = new TextEncoder();
        const transformStream = new ReadableStream({
          async start(controller) {
            for await (const chunk of logStream) {
              if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
                const addOp = chunk.ops[0];
                if (
                  addOp.path.startsWith("/logs/ChatOpenAI") &&
                  typeof addOp.value === "string" &&
                  addOp.value.length
                ) {
                  controller.enqueue(textEncoder.encode(addOp.value));
                }
              }
            }
            controller.close();
          },
        });
  
        return transformStream;
      }
      // return new StreamingTextResponse(transformStream);

    }
 
}

    // new DynamicStructuredTool({
        //   name: "filters" ,
        //   description:
        //     "You need this tool to get filters a given destination",
        //   schema: z.object({
        //     // checkin_date: z.string().describe('checkin date, not null'),
        //     // checkout_date: z.string().describe('checkout date, not null'),
        //     // adults_number: z.string().describe('number of adults not null'),
        //     // children_number: z.string().describe('number of children, not null'),
        //     // children_ages: z.string().describe('children ages, not null'),
        //     // room_number: z.string().describe('number of rooms, not null'),
        //     // destination: z.string().describe("destination for user, must be a real place and can't be null")
        //   }),  
        //   func: async () => {
       
        //     console.log('SECOND TOOL')
        //     console.log('filters');
        //     console.log('locationId FROM FIRST TOOL:')
        //     console.log(locationId)
        //     return '[Free Wifi, Free Cancellation, Swimming pool]'
        //   },
        // }),
        // new DynamicTool({
        //   name: "hotel",
        //   description:
        //     "use this to get an hotel",
        //   func: async () => {
        //     console.log('THIRD TOOL');
    
        //     console.log('locationId FROM FIRST TOOL:')
        //     console.log(locationId)
        //     return 'Hotel bastides saint paul de vence'
        //   }
        // }),
        //  new WebBrowser({model, embeddings}),
        // new DynamicStructuredTool({
        //   name: "web_search",
        //   description: "use this to search the web",
        //   schema: z.object({
        //     destination: z.string().describe("destination for user, must be a real place and can't be null")
        //   }),
        //   func: async ({ destination }: any) => {
        //     console.log('IL RENTRE DANS LE TOOL  POUR CHERCHER SUR BOOKING')
        //     console.log('destination')
        //     console.log(destination)
        //     const embeddings = new OpenAIEmbeddings();
        //     const browser = new WebBrowser({ model, embeddings });
        //     const result = await browser.call(
        //       `"https://www.booking.com","${destination}"`
        //     );
        //     console.log('RESULTAT DE LA RECHERCHE')
        //     console.log(result)
        //     return `I found a funny place`;
        //   }
        // }),
        // new DynamicStructuredTool({
        //   name: "create_rapid_api_parameters",
        //   description: "Use this to create travel parameters",
        //   schema: z.object({
            // checkin_date: z.string().describe('checkin date, not nullable'),
            // checkout_date: z.string().describe('checkout date, not nullable'),
            // adults_number: z.string().describe('number of adults not nullable'),
            // children_number: z.string().describe('number of children, not nullable'),
            // children_ages: z.string().describe('children ages, optionnel'),
            // room_number: z.string().describe('number of rooms, not nullable'),
            // destination: z.string().describe("destination for user, must be a real place and can't be null")
        //   }),
        //   func: async ({children_ages, checkin_date, checkout_date, adults_number, children_number, room_number, destination  }: any) => {
        //     // return Promise.resolve({
        //     //   test: 'tamere'
        //     // })

        //     console.log("IL PASSE DANS LA SUGGESTION DE DESTINATION")
            // const test = {
            //   checkout_date:  checkout_date,
            //   checkin_date: checkin_date, 
            //   adults_number: adults_number,
            //   children_number: children_number,
            //   room_number: room_number,
            //   destination: destination,
            //   children_ages: children_ages
            // }
        //     return JSON.stringify(test)
        //   }
        // }),

        //  new DynamicStructuredTool({
        //   name: "error_handling",
        //   description: "use this if there is any error",
        //   // ici je luji donne les dates le nombre de personne etc
        //   schema: z.object({
        //     error: z.string().describe("the error you've detected")
        //   }),
        //   // la j appelle rapid api
        //   func: async ({ error }: any) =>
        //   {
        //     console.log('il passe dans l erreur')
        //     console.log(error)
        //     return `Error detected: ${error} `

        //   }
        //     // (Math.random() * (high - low) + low).toString(), // Outputs still must be strings 
        // }),
        // new DynamicStructuredTool({
        //   name: 'Booking_website',
        //   description: 'bookin homepage',
        //   func: async (tamere) => {
        //     const loader = new SerpAPILoader
        //   }
          
        // }),
        // new DynamicStructuredTool({
        //   name: "moderation",
        //   description: "use this if you detect any insult",
        //   // ici je luji donne les dates le nombre de personne etc
        //   schema: z.object({
        //     insult: z.string().describe("The insult you've detected")
        //   }),
        //   // la j appelle rapid api
        //   func: async ({ insult }: any) =>
        //   {
        //     console.log('il passe dans la MODERATION')
        //     return `Insult detected: ${insult} `

        //   }
        //     // (Math.random() * (high - low) + low).toString(), // Outputs still must be strings 
        // }),
        // new DynamicStructuredTool({
        //   name: "booking_api",
        //   description: "call this to get booking.com api hotels",
        //   // ici je luji donne les dates le nombre de personne etc
        //   schema: z.object({
        //     checkout_date: z.number().describe("The checkout date"),
        //     checkin_date: z.number().describe("The checkin date"),
        //     children_number: z.number().describe('number of children'),
        //     adult_number: z.number().describe('number of children'),
        //     room_number: z.number().describe('the number of rooms')
        //   }),
        //   // la j appelle rapid api
        //   func: async ({ checkout_date, checkin_date, children_number, adult_number, room_number }: any) =>
        //   {
        //     return `Hotel Bastides Saint Paul a saint paul de Vence est un hotel 3 étoiles pouvant accueillir ${children_number} enfants, ${adult_number} adultes, du ${checkin_date} au ${checkout_date} `

        //   }
        //     // (Math.random() * (high - low) + low).toString(), // Outputs still must be strings 
        // }),


        
