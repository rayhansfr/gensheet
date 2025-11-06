import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function generateChecksheet(prompt: string, category?: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    })

    const systemPrompt = `You are an expert in creating comprehensive checksheets for various industries.
Generate a detailed checksheet based on the user's requirements.

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Checksheet Title",
  "description": "Brief description",
  "category": "manufacturing|construction|healthcare|IT|safety|etc",
  "industry": "specific industry",
  "checkpoints": [
    {
      "title": "Checkpoint title",
      "description": "Detailed description",
      "fieldType": "CHECKBOX|NUMBER|TEXT|TEXTAREA|PHOTO|FILE|DROPDOWN|GPS|etc",
      "section": "Section name for grouping",
      "isRequired": true|false,
      "config": {
        // For NUMBER: {"min": 0, "max": 100, "unit": "°C"}
        // For DROPDOWN: {"options": ["Option 1", "Option 2"]}
        // For RATING: {"max": 5}
      }
    }
  ],
  "tags": ["tag1", "tag2"]
}

Available field types:
- CHECKBOX: Simple yes/no
- NUMBER: Numeric input (temperature, pressure, count, etc.)
- TEXT: Short text input
- TEXTAREA: Long text
- PHOTO: Photo upload requirement
- FILE: Document upload
- DROPDOWN: Single selection
- MULTISELECT: Multiple selection
- GPS: Location tracking
- SIGNATURE: Digital signature
- DATE: Date picker
- TIME: Time picker
- DATETIME: Date and time
- RATING: Star rating

Guidelines:
1. Create 10-20 relevant checkpoints based on best practices
2. Group checkpoints into logical sections
3. Include appropriate field types for each checkpoint
4. Add validation rules where necessary
5. Make critical items required
6. Include photo requirements for visual verification
7. Add GPS for location-based checks if relevant`

    const fullPrompt = category 
      ? `${systemPrompt}\n\nUser request: ${prompt}\nCategory: ${category}`
      : `${systemPrompt}\n\nUser request: ${prompt}`

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from markdown code blocks if present
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }
    
    const checksheetData = JSON.parse(jsonText)
    
    return {
      success: true,
      data: checksheetData,
    }
  } catch (error: any) {
    console.error('Error generating checksheet:', error)
    
    // Handle rate limit specifically
    if (error.status === 429) {
      return {
        success: false,
        error: 'AI quota exceeded. Please wait a moment and try again, or create checksheet manually.',
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate checksheet',
    }
  }
}

export async function suggestImprovements(checksheetData: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `Analyze this checksheet and suggest improvements based on industry best practices.
    
Current checksheet:
${JSON.stringify(checksheetData, null, 2)}

Provide suggestions for:
1. Missing critical checkpoints
2. Better field types for specific checks
3. Additional validation rules
4. Grouping improvements
5. Industry-specific enhancements

Return as JSON array of suggestions:
[
  {
    "type": "add|modify|remove",
    "checkpoint": "checkpoint title or new checkpoint",
    "suggestion": "detailed suggestion",
    "priority": "high|medium|low"
  }
]`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text().trim()
    
    // Extract JSON
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '')
    }
    
    const suggestions = JSON.parse(text)
    
    return {
      success: true,
      suggestions,
    }
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate suggestions',
    }
  }
}
