import OpenAI from 'openai';

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Get BBQ recommendations based on user preferences
 */
export async function getBBQRecommendations(
  preferences: {
    location?: string;
    groupSize?: number;
    occasion?: string;
    dietary?: string[];
    budget?: string;
  }
): Promise<any> {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a BBQ expert assistant for Barby & Ken, a premium BBQ delivery service in Malta. 
        Provide personalized BBQ package recommendations based on user preferences.
        Format your response as JSON with the following structure:
        {
          "recommendations": [
            {
              "package": "Package name",
              "description": "Brief description",
              "price": "Price in EUR",
              "ideal_for": "Best suited for",
              "highlights": ["feature 1", "feature 2", "..."]
            }
          ],
          "suggested_location": "Recommended beach location",
          "time_suggestion": "Recommended time slot",
          "additional_tips": "Any helpful tips"
        }`
      },
      {
        role: "user", 
        content: `Help me plan a BBQ experience in Malta with these preferences: 
          ${preferences.location ? `Location preference: ${preferences.location}` : ''}
          ${preferences.groupSize ? `Group size: ${preferences.groupSize} people` : ''}
          ${preferences.occasion ? `Occasion: ${preferences.occasion}` : ''}
          ${preferences.dietary && preferences.dietary.length > 0 ? `Dietary requirements: ${preferences.dietary.join(', ')}` : ''}
          ${preferences.budget ? `Budget: ${preferences.budget}` : ''}
        `
      }
    ];

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    // Parse and return the JSON response
    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error getting BBQ recommendations:', error);
    throw error;
  }
}

/**
 * Generate a customized BBQ menu based on preferences
 */
export async function generateCustomMenu(preferences: any): Promise<any> {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a culinary expert specializing in BBQ meals. 
        Create a customized BBQ menu based on the user's preferences.
        Format your response as JSON with the following structure:
        {
          "menu": [
            {
              "category": "category name",
              "items": [
                {
                  "name": "Item name",
                  "description": "Brief description",
                  "dietaryInfo": ["info1", "info2"]
                }
              ]
            }
          ],
          "estimated_cost_per_person": "Cost in EUR",
          "preparation_tips": "Brief tips for preparation"
        }`
      },
      {
        role: "user", 
        content: `Create a BBQ menu for my event with these preferences: ${JSON.stringify(preferences)}`
      }
    ];

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    // Parse and return the JSON response
    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error generating custom menu:', error);
    throw error;
  }
}

/**
 * AI shopping assistant to help with booking process
 */
export async function getShoppingAssistance(question: string, bookingContext?: any): Promise<string> {
  try {
    let context = "You are helping with a BBQ booking on a beach in Malta.";
    if (bookingContext) {
      context += ` Current booking information: ${JSON.stringify(bookingContext)}`;
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: context },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0].message.content || "I'm not sure how to help with that.";
  } catch (error) {
    console.error('Error getting shopping assistance:', error);
    throw error;
  }
}

/**
 * Analyze booking choices and suggest improvements or additions
 */
export async function analyzeBookingChoices(bookingDetails: any): Promise<any> {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a BBQ planning assistant for Barby & Ken, a premium BBQ service in Malta.
        Analyze the user's current booking choices and provide suggestions to enhance their experience.
        Format your response as JSON with the following structure:
        {
          "suggestions": [
            {
              "type": "suggestion type",
              "title": "Suggestion title",
              "description": "Details about why this would enhance their experience",
              "additional_cost": "Estimated additional cost if applicable"
            }
          ],
          "overall_assessment": "Brief assessment of current choices"
        }`
      },
      {
        role: "user", 
        content: `Analyze my current BBQ booking choices and suggest improvements: ${JSON.stringify(bookingDetails)}`
      }
    ];

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    // Parse and return the JSON response
    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error analyzing booking choices:', error);
    throw error;
  }
}