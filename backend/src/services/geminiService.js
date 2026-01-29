/**
 * Gemini AI Service
 * 
 * WHY THIS SERVICE EXISTS:
 * - Centralizes all AI-related logic
 * - Handles errors gracefully (app never crashes if AI fails)
 * - Provides fallback responses when AI is unavailable
 * 
 * HOW IT WORKS:
 * 1. Takes incident description as input
 * 2. Sends to Google Gemini with a structured prompt
 * 3. Parses the response to extract category, severity, suggestions
 * 4. Returns structured data for storage
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env.js';

// Initialize Gemini client (may be null if no API key)
let genAI = null;
let model = null;

if (config.geminiApiKey) {
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  console.log('✅ Gemini AI service initialized');
} else {
  console.log('⚠️ Gemini API key not set - will use fallback responses');
}

/**
 * THE PROMPT - This is the heart of the AI analysis
 * 
 * WHY THIS PROMPT WORKS:
 * 1. Clear role definition (safety analyst)
 * 2. Explicit output format (JSON for easy parsing)
 * 3. Constrained categories (prevents unexpected values)
 * 4. Specific instructions for suggestions
 * 5. Emphasis on being helpful and non-judgmental
 */
const ANALYSIS_PROMPT = `You are a compassionate safety analyst helping anonymous reporters.
Analyze the following incident report and provide structured guidance.

IMPORTANT RULES:
- Be supportive and non-judgmental
- Focus on actionable next steps
- Suggest relevant resources (NGOs, legal aid, hotlines)
- Keep suggestions practical and accessible

Respond ONLY with valid JSON in this exact format:
{
  "category": "harassment" | "corruption" | "abuse" | "discrimination" | "other",
  "severity": "low" | "medium" | "high" | "critical",
  "summary": "Brief 1-2 sentence summary of the incident",
  "suggestions": [
    {
      "type": "ngo" | "legal" | "hotline" | "journalist" | "government",
      "name": "Organization or resource name",
      "description": "Brief description of how they can help",
      "contact": "Website, phone, or email"
    }
  ]
}

CATEGORY GUIDELINES:
- harassment: Workplace bullying, sexual harassment, intimidation
- corruption: Bribery, fraud, misuse of power, financial crimes
- abuse: Physical, emotional, or psychological harm
- discrimination: Bias based on race, gender, religion, disability, etc.
- other: Doesn't fit above categories

SEVERITY GUIDELINES:
- low: Minor issues, no immediate danger
- medium: Significant concern, should be addressed soon
- high: Serious situation, needs prompt attention
- critical: Immediate danger or ongoing harm

INCIDENT REPORT:
`;

/**
 * Analyze an incident report using Gemini AI
 * 
 * @param {string} description - The incident description from the reporter
 * @returns {Object} Analysis results with category, severity, and suggestions
 */
export async function analyzeReport(description) {
  // If AI is not configured, return fallback immediately
  if (!model) {
    console.log('ℹ️ AI not configured, using fallback response');
    return getFallbackResponse();
  }
  
  try {
    console.log('🤖 Sending report to Gemini for analysis...');
    
    // Set a timeout to prevent hanging
    const timeoutMs = 30000; // 30 seconds
    
    // Create the full prompt
    const fullPrompt = ANALYSIS_PROMPT + description;
    
    // Call Gemini API with timeout
    const resultPromise = model.generateContent(fullPrompt);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI request timed out')), timeoutMs)
    );
    
    const result = await Promise.race([resultPromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    // WHY try/catch: AI might return malformed JSON
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!analysis.category || !analysis.severity || !analysis.suggestions) {
        throw new Error('Missing required fields in AI response');
      }
      
      console.log('✅ AI analysis completed successfully');
      
      return {
        aiAnalyzed: true,
        aiCategory: analysis.category,
        aiSeverity: analysis.severity,
        aiSummary: analysis.summary || 'Analysis completed',
        aiSuggestions: analysis.suggestions.map(s => ({
          type: s.type || 'other',
          name: s.name || 'Resource',
          description: s.description || '',
          contact: s.contact || '',
        })),
      };
      
    } catch (parseError) {
      console.error('⚠️ Failed to parse AI response:', parseError.message);
      console.log('   Raw response:', text.substring(0, 200) + '...');
      return getFallbackResponse();
    }
    
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    // Don't crash - return fallback instead
    return getFallbackResponse();
  }
}

/**
 * Fallback response when AI is unavailable
 * 
 * WHY THIS EXISTS:
 * - App must work even if AI fails
 * - Users should still get helpful information
 * - Generic but useful resources are provided
 */
function getFallbackResponse() {
  return {
    aiAnalyzed: false,
    aiCategory: 'unknown',
    aiSeverity: 'unknown',
    aiSummary: 'Your report has been received. Our automated analysis is temporarily unavailable, but your report will be reviewed by our team.',
    aiSuggestions: [
      {
        type: 'hotline',
        name: 'National Human Rights Helpline',
        description: 'General support for human rights issues',
        contact: '1800-XXX-XXXX (toll-free)',
      },
      {
        type: 'ngo',
        name: 'Local Support Services',
        description: 'Connect with local NGOs that can provide guidance',
        contact: 'Visit your local community center',
      },
      {
        type: 'legal',
        name: 'Free Legal Aid',
        description: 'Many areas offer free legal consultation',
        contact: 'Search "free legal aid" + your location',
      },
    ],
  };
}

/**
 * Health check for AI service
 * @returns {Object} Status of the AI service
 */
export function getAIStatus() {
  return {
    configured: !!model,
    provider: 'Google Gemini',
    model: 'gemini-2.5-flash',
  };
}