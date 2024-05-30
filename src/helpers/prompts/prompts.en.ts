export const enParametersPrompt: string = `
    You are a travel agent. A client coming from {comingFrom} has sent you the following request for travel advice:
    
    '''
    {input}
    '''
    
    Please extract and adjust the following information from the client's message:

    Arrival Date: suggest reasonable dates if extraction is not possible.
    Departure Date: suggest reasonable dates if extraction is not possible.
    Number of Adults: Count the client as one adult and detect any accompanying adults.
    Number of Children: Detect if any children are mentioned.
    Number of Rooms: Calculate this number based on the count of adults and children.
    City: If a destination is mentioned, use it. Otherwise, suggest 3 cities max, in the format 'City'.
    Sort: select between 'popularity', 'price' or 'review_score'
    Answer: Using the client language, shortly summarize the informations.

    Your response should adhere to these guidelines to ensure accurate and client-desired travel planning.
    {format_instructions}
`
// export const enAdvisePrompt: string = `
//    "  
//     You are a travel agent bot, analyze the following message:

//     '{input}'
    
//     Your task is to extract and adjust the following information from the message:

//     Dates: Provide the arrival and departure dates, or suggest reasonable dates if extraction is not possible.
//     Number of Adults: Count the client as one adult and detect any accompanying adults.
//     Number of Children: Detect if any children are mentioned.
//     Number of Rooms: Calculate this number based on the count of adults and children.
//     Destination: If a destination is mentioned, use it. Otherwise, suggest 3 destinations, in the format 'City'.
//     Summary of Selection: Provide a summary explaining the choice of destinations. You must answer in the message language.

//     The person who wrote the message is from {comingFrom}.
//     "
//     {format_instructions}

// `
export const enFilterSpecificities: string = `
    You are a travel agent bot, analyze this text:

    '''
    {input}
    '''

    Please extract the following information from the client's message:
    
    - Budget 
    - Room Facilities
    - Property Type
    - Meals
    - Hotel Facilities
    - Districts:
        You cannot use city name, and it must be real districts names or famous landmarks.
    - Bed preference
    - Chain 
    - Review score
    - Distance from city center
    - Beach Access
    - Property Rating

    Return null if extraction is not possible.

    {format_instructions}
`

// export  const enFilterPrompt: string = `
// "As an experienced travel agent, you have received a client's inquiry for travel advice. The client's request is outlined below:

// '{input}'

// Based on this request, assess and apply the relevant filters for accommodations in {dest_name}. The available filters for this destination are:

// {filters}

// Your task is to carefully review the client's request and identify the top five most relevant filters, considering various and specific aspects of the request.
   
// {format_instructions}
// `


export const enFilterPrompt: string = `

Given the customer's preferences and specificities for a trip to {dest_name}:

{specificities}

Select only the filters that directly match the provided specificities. Do not invent new filters.

{filters}

Your response must only contain filters present in this list of filters. Do not fabricate filters not present in the list.

{format_instructions}

`


export const testFilterPrompt: string = 
`
User request:
{userRequest}


Items:
{filters_category}

Select related items from the list.
If no relation return items: []

{format_instructions}
`