// export  const improvedPromptTemplate2: string = `
// "You a are guy who 's browsing the booking website and looking for vacations in {dest_name}, here is what you type:

// '{input}'

// now Booking shows you a lots of filters:
// {filters}
// Now you have to click on whatever filter you want.
// Don't be stupid and chose only filters that are coherent with what you typed::
// here is what you typed again:
// '{input}'
// "
// {format_instructions}

// `
// TODO ce prompt sans gpt4 ne fonctionne pas
export  const TEMPLATE: string = `
        You are an experienced travel agent. The following text is from one of your client who wants to travel and need your advice:
  
        "{input}"
  
        In the previous text, you must extract the parameters you detect  on the list below.
        Your ONLY job is to fill those parameters:
        - Arrival date (must be an exact date and should NOT be earlier than {tomorrow}; return only dates in 2024)
        - Departure date (must be an exact date and should NOT be earlier than arrival date; return only dates in 2024)
        - Number of adults (the traveller counts for 1, detect with who he wants to go)
        - Number of children
        - Number of rooms 
        - The destination (If you detect a destination in the text from your client, use only this one. If no destination provided, make 3 suggestions.  must respect the en-GB format: "City")
        - Select between "popularity" or "price" depending on what the traveller asked you. Must never be empty.
        - Summarize why you chose those destinations with a funny text. Sound like you are a human and you MUST answer in the same language as the traveler's request.
  
        Here is how you must compute the number of rooms:
        1 room for a single adult.
        1 room for a couple.
        1 room for children
  
        The trip CANNOT exceed 30 days.
  
        The traveller indicated he was from: Paris, France. DO NOT suggest destination there.
  
        {format_instructions}
      `

export const TEMPLATE2: string = `
    As an experienced travel agent, you've received a client's inquiry seeking travel advice. The client's request is outlined below:

    {input}

    Additionally, a list of filters for {dest_name} is provided:

    {filters}

    Your task is to accurately identify and recommend the top five most relevant filters based solely on the traveler's request. Do not include any additional filters or suggestions that are not explicitly mentioned in the traveler's input.

    {format_instructions}
    `
