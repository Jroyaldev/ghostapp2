import { OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_DEFAULT_MODEL } from '../config/env';

/**
 * Generate high-quality, contextual text message suggestions based on conversation history
 * Uses OpenRouter API to access models like Mistral to generate suggestions
 * @param {Array} messages - Array of previous messages in the conversation
 * @returns {Promise<Array>} - Array of contextual suggestion strings
 */
export const generateSuggestions = async (messages) => {
  try {
    // Don't generate suggestions if there's no conversation context
    if (!messages || messages.length === 0) {
      return [];
    }
    
    // Get recent conversation history for context (up to 5 messages)
    const recentMessages = [];
    let aiMessageFound = false;
    
    // Get the most recent messages, including at least one AI response
    for (let i = messages.length - 1; i >= 0 && recentMessages.length < 5; i--) {
      const msg = messages[i];
      
      if (!msg.isUser) {
        aiMessageFound = true;
      }
      
      recentMessages.unshift({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text || ""
      });
    }
    
    // If there's no AI message to respond to, we can't generate contextual suggestions
    if (!aiMessageFound) {
      return [];
    }
    
    // Get the last AI message for context
    const lastAIMessage = recentMessages.filter(msg => msg.role === "assistant").pop()?.content || "";
    
    // Create a precise system prompt for generating contextual suggestions
    const systemPrompt = `You are Ghost, the AI assistant in the GhostMode app. Given the last few messages in a conversation, suggest 2-3 likely, natural replies a user might send next. Each suggestion should:
    - Be contextually relevant to the conversation
    - Sound like a real, distinct text message (not generic)
    - Vary in style or intent (e.g., agreement, question, reaction)

Respond ONLY with a JSON array of suggestions (no explanation, no extra text). Example: ["Yes, that makes sense.", "Can you explain more?", "😂"]`;
    
    // Set up the messages array for the API call
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...recentMessages
    ];
    
    console.log('Sending conversation context to OpenRouter for suggestions');
    
    // Call OpenRouter API to access models like Mistral
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://ghostmode.app'
      },
      body: JSON.stringify({
        model: OPENROUTER_DEFAULT_MODEL,
        messages: formattedMessages,
        temperature: 0.8,     // Slightly more creative
        max_tokens: 200,
        top_p: 0.92,          // Slightly more diverse options
        frequency_penalty: 0.7 // Stronger penalty to reduce repetitive suggestions
      })
    });
    
    // Return empty suggestions if API call fails
    if (!response.ok) {
      console.error('OpenRouter API error', await response.text());
      return [];
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    // Debug raw content
    console.log('Raw suggestions content:', content);
    // Strip markdown fences if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```(?:\w*\n)?([\s\S]*?)```/, '$1').trim();
    }
    console.log('Cleaned suggestions content:', cleanedContent);
    
    if (!cleanedContent) {
      console.error('No content after cleaning OpenRouter response');
      return [];
    }

    // Extract and clean up suggestions from response
    try {
      // Try parsing cleaned content as JSON first
      const parsed = JSON.parse(cleanedContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Clean up and filter suggestions
        const filteredSuggestions = parsed
          .filter(item => 
            typeof item === 'string' && 
            item.length > 0 &&
            item.length <= 100 &&
            !item.includes('*') && 
            !item.includes('```')
          )
          .map(item => item.trim())
          .filter(item => item.length > 0)
          .slice(0, 3);  // Limit to 3 suggestions max
          
        if (filteredSuggestions.length > 0) {
          console.log('Generated contextual suggestions:', filteredSuggestions);
          return filteredSuggestions;
        }
      }
    } catch (e) {
      console.log('Direct JSON parsing failed, trying regex extraction');
      
      // Try regex extraction as fallback
      const jsonMatch = cleanedContent.match(/(\[(?:.|\n)*?\])/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[1]);
          if (Array.isArray(extractedJson) && extractedJson.length > 0) {
            const filteredSuggestions = extractedJson
              .filter(item => 
                typeof item === 'string' && 
                item.length > 0 &&
                item.length <= 100 &&
                !item.includes('*') &&
                !item.includes('```')
              )
              .map(item => item.trim())
              .filter(item => item.length > 0)
              .slice(0, 3);
              
            if (filteredSuggestions.length > 0) {
              console.log('Extracted contextual suggestions via regex:', filteredSuggestions);
              return filteredSuggestions;
            }
          }
        } catch (e) {
          console.log('JSON regex extraction failed');
        }
      }
    }
    
    // Fallback extraction: ask model to extract JSON array
    try {
      const extractionMessages = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content },
        { role: "user", content: "Extract the JSON array from the above text and respond ONLY with the array." }
      ];
      const extractionResponse = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://ghostmode.app'
        },
        body: JSON.stringify({
          model: OPENROUTER_DEFAULT_MODEL,
          messages: extractionMessages,
          temperature: 0.0,
          max_tokens: 100
        })
      });
      if (extractionResponse.ok) {
        const extractionData = await extractionResponse.json();
        const extractContent = extractionData.choices?.[0]?.message?.content || "";
        const parsedExtract = JSON.parse(extractContent);
        if (Array.isArray(parsedExtract) && parsedExtract.length > 0) {
          return parsedExtract.map(item => item.trim()).slice(0, 3);
        }
      }
    } catch (extractionError) {
      console.error('Extraction fallback failed', extractionError);
    }
    
    // If we couldn't extract valid suggestions, return empty
    return [];
    
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};

/**
 * Return empty fallback suggestions
 */
export const getDefaultSuggestions = () => {
  // No fallback; return empty
  return [];
};
