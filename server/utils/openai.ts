import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set in environment variables");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Get BBQ recommendations based on user preferences
 */
export async function getBBQRecommendations(preferences: any): Promise<any> {
  try {
    const prompt = `
      You are an AI assistant for a beach BBQ rental service in Malta called "Barby and Ken". 
      Based on the following preferences, create personalized BBQ package recommendations.
      
      Customer Preferences:
      - Location preference: ${preferences.location || "Not specified"}
      - Group size: ${preferences.groupSize || "Not specified"}
      - Occasion: ${preferences.occasion || "Not specified"}
      - Dietary requirements: ${preferences.dietary?.join(", ") || "None"}
      - Budget range: ${preferences.budget || "Not specified"}
      
      Please provide 2-3 detailed recommendations in JSON format with the following structure:
      {
        "recommendations": [
          {
            "package": "Package name",
            "description": "Brief description",
            "price": "Price range in Euros",
            "ideal_for": "What type of group/occasion",
            "highlights": ["Feature 1", "Feature 2", "Feature 3"]
          }
        ],
        "suggested_location": "Best beach location in Malta based on preferences",
        "time_suggestion": "Recommended time of day for the BBQ",
        "additional_tips": "Any extra tips for enhancing the BBQ experience"
      }
      
      Ensure the packages are realistic for a beach BBQ service, considering equipment transport, setup, and beach environment.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error getting BBQ recommendations:", error);
    throw new Error("Failed to generate BBQ recommendations");
  }
}

/**
 * Generate a customized BBQ menu based on preferences
 */
export async function generateCustomMenu(preferences: any): Promise<any> {
  try {
    const prompt = `
      You are a professional BBQ chef for a beach BBQ service in Malta called "Barby and Ken".
      Create a customized BBQ menu based on the following preferences:
      
      - Number of guests: ${preferences.guests || "Not specified"}
      - Dietary restrictions: ${preferences.dietary_restrictions || "None"}
      - Cuisine style preference: ${preferences.cuisine_style || "Traditional BBQ"}
      - Favorite foods: ${preferences.favorite_foods || "Not specified"}
      - BBQ type: ${preferences.bbq_type || "Standard"}
      - Special requests: ${preferences.special_requests || "None"}
      
      Generate a detailed menu in JSON format with the following structure:
      {
        "menu": [
          {
            "category": "Starters/Appetizers",
            "items": [
              {
                "name": "Item name",
                "description": "Brief description",
                "dietaryInfo": ["Vegetarian", "Gluten-free", etc.]
              }
            ]
          },
          {
            "category": "Main Course",
            "items": [...]
          },
          {
            "category": "Sides",
            "items": [...]
          },
          {
            "category": "Desserts",
            "items": [...]
          }
        ],
        "estimated_cost_per_person": "€XX - €XX",
        "preparation_tips": "Detailed preparation and cooking tips specific to this menu"
      }
      
      Ensure the menu is realistic for a beach setting, considering cooking equipment limitations and beach environment. Include locally-sourced Maltese ingredients where appropriate.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating custom menu:", error);
    throw new Error("Failed to generate custom BBQ menu");
  }
}

/**
 * AI shopping assistant to help with booking process
 */
export async function getShoppingAssistance(question: string, bookingContext?: any): Promise<string> {
  try {
    let systemPrompt = `
      You are a helpful assistant for a beach BBQ rental service in Malta called "Barby and Ken".
      Your job is to answer questions about the BBQ booking service, provide recommendations,
      and assist customers throughout their booking journey.
      
      Some key information about Barby and Ken BBQ service:
      - We offer various BBQ packages for beaches across Malta
      - Packages range from basic BBQ-only to premium packages with food and drinks
      - We handle delivery, setup, and collection
      - Bookings are made for 3-hour time slots between 12pm-10pm
      - We have a beach cleanup contribution option (€5) that supports local beach cleanup initiatives
      - Payment can be made in both fiat currency and cryptocurrency
      
      Keep your answers helpful, friendly, and concise. Encourage the customer to complete their booking.
    `;

    if (bookingContext) {
      systemPrompt += `
        The customer is currently in the process of making a booking with the following details:
        - Location: ${bookingContext.location || "Not yet selected"}
        - Package: ${bookingContext.package || "Not yet selected"}
        - Date: ${bookingContext.date ? new Date(bookingContext.date).toLocaleDateString() : "Not yet selected"}
        - Time slot: ${bookingContext.timeSlot || "Not yet selected"}
        - Beach cleanup contribution: ${bookingContext.cleanupContribution ? "Added" : "Not added"}
        
        Tailor your response based on where they are in the booking process.
      `;
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error getting shopping assistance:", error);
    throw new Error("Failed to get assistant response");
  }
}

/**
 * Analyze booking choices and suggest improvements or additions
 */
export async function analyzeBookingChoices(bookingDetails: any): Promise<any> {
  try {
    const prompt = `
      You are an AI advisor for a beach BBQ rental service in Malta called "Barby and Ken".
      Analyze the following booking details and suggest improvements or additions that would enhance the customer's experience.
      
      Current booking details:
      - Location: ${bookingDetails.location || "Not selected"}
      - Package: ${bookingDetails.package || "Not selected"}
      - Date: ${bookingDetails.date ? new Date(bookingDetails.date).toLocaleDateString() : "Not selected"}
      - Time slot: ${bookingDetails.timeSlot || "Not selected"}
      - Beach cleanup contribution: ${bookingDetails.cleanupContribution ? "Added" : "Not added"}
      
      Provide an analysis in JSON format with the following structure:
      {
        "suggestions": [
          {
            "type": "upgrade/essential/experience/budget",
            "title": "Brief title of suggestion",
            "description": "Detailed explanation of why this would improve their experience",
            "additional_cost": "Approximate additional cost in Euros, if any"
          }
        ],
        "overall_assessment": "Overall assessment of the current booking choices and any general recommendations"
      }
      
      Focus on realistic and valuable enhancements, considering the beach location, group dynamics, and overall experience. 
      If they haven't selected the beach cleanup contribution, that should be one of your suggestions.
      Include at least 3-4 suggestions of different types.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing booking:", error);
    throw new Error("Failed to analyze booking choices");
  }
}