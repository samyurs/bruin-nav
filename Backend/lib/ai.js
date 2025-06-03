/**
 * AI Module - Google Gemini Integration
 * ------------------------------------
 * Handles all AI-related functionality including natural language
 * generation for navigation instructions.
 */

import { GoogleGenAI, Type } from "@google/genai";

// Initialize Google Gemini AI
console.log("Initializing Google Gemini AI with API key:", process.env.GEMINI_API_KEY);
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate natural language instructions using Gemini AI
 * @param {Array} steps - Array of step names
 * @param {string} fromLandmark - Starting landmark name
 * @param {string} toLandmark - Destination landmark name
 * @returns {Promise<string>} Natural language walking directions
 */
export async function generateNaturalLanguageInstructions(steps, fromLandmark, toLandmark) {
  try {

    const prompt = `
You are a navigation assistant for indoor building navigation.
Convert the following raw navigation steps into an array of clear, natural language walking directions.

Context:
- Nodes represent walkable points like hallways, stairs, elevators, or doors
- "Stair" nodes represent staircases between floors
- "Hall" or similar nodes represent hallway segments
- Depth indicates the step number in the shortest path

Please provide:
1. A brief overview of the route
2. Step-by-step walking directions in natural language, with directionality if possible
3. Highlight any floor changes or important landmarks

Keep the instructions concise but clear, suitable for someone walking through the building.

Example:

Route: From "Boelter Entrance" to "Room 3420"
Path: ["5-Entrance", "5-Hall", "5-Stair-DownTo4", "4-Hall", "4-Stair-DownTo3", "3-Hall", "3-Room-3420"]
Generated instructions:
[
    "Start at the Boelter Entrance on the 5th floor.",
    "Walk down the hallway towards the stairwell.",
    "Take the stairs down to the 4th floor.",
    "Continue down the 4th floor hallway until you reach the next stairwell.",
    "Take the stairs down to the 3rd floor.",
    "Walk down the 3rd floor hallway until you reach Room 3420."
]

Route: From "${fromLandmark}" to "${toLandmark}"
Path: ${JSON.stringify(steps)}
Generated instructions:
`;

    const result = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING
                }
            }
        }
    });

    return JSON.parse(result.text);
  } catch (error) {
    console.error("Error generating natural language instructions:", error);
    return "Unable to generate natural language instructions at this time.";
  }
}