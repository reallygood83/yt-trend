import { NextRequest, NextResponse } from 'next/server';
import { getAIModel } from '@/lib/gemini';
import type {
  PromptEnhancementRequest,
  PromptEnhancementResult,
  PromptEnhancementStrategy,
  EnhancementGoal,
  ExplanationMethod
} from '@/types/enhanced-note';

/**
 * POST /api/prompt/enhance
 *
 * Enhances user's simple prompt into a sophisticated, detailed prompt
 * for high-quality note generation.
 */
export async function POST(request: NextRequest) {
  try {
    const body: PromptEnhancementRequest = await request.json();
    const { originalPrompt, videoContext, enhancementGoal, targetAudience } = body;

    // Validate input
    if (!originalPrompt || originalPrompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Original prompt is required' },
        { status: 400 }
      );
    }

    // Get AI model
    const model = getAIModel();

    // Build context-aware enhancement prompt
    const enhancementPrompt = buildEnhancementPrompt(
      originalPrompt,
      videoContext,
      enhancementGoal,
      targetAudience
    );

    // Generate enhanced prompt and analysis
    const result = await model.generateContent(enhancementPrompt);
    const responseText = result.response.text();

    // Parse AI response (expecting JSON)
    const parsedResponse = parseEnhancementResponse(responseText, originalPrompt);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Prompt enhancement error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
}

/**
 * Build the enhancement prompt for AI
 */
function buildEnhancementPrompt(
  originalPrompt: string,
  videoContext?: PromptEnhancementRequest['videoContext'],
  goal?: EnhancementGoal,
  targetAudience?: string
): string {
  const contextInfo = videoContext
    ? `\n\n**Video Context:**
- Title: ${videoContext.title}
- Duration: ${Math.floor(videoContext.duration / 60)} minutes
- Language: ${videoContext.language}
${videoContext.transcript ? `- Sample Content: "${videoContext.transcript.substring(0, 200)}..."` : ''}`
    : '';

  const goalInfo = goal
    ? `\n\n**Enhancement Goal:** ${getGoalDescription(goal)}`
    : '';

  const audienceInfo = targetAudience
    ? `\n\n**Target Audience:** ${targetAudience}`
    : '';

  return `You are a prompt engineering expert specializing in educational content generation.

**User's Original Prompt:**
"${originalPrompt}"
${contextInfo}${goalInfo}${audienceInfo}

**Your Task:**
Enhance this prompt to create a detailed, sophisticated instruction for generating high-quality educational notes. The enhanced prompt should:

1. **Add Clarity**: Remove ambiguity and specify exactly what is needed
2. **Add Structure**: Define clear sections, format, and organization
3. **Add Requirements**: Specify quality standards, depth, and detail level
4. **Add Examples**: Where appropriate, suggest what good output looks like
5. **Optimize for AI**: Make it clear, specific, and actionable for AI generation

**Available Note Generation Methods** (suggest the most appropriate one):
- Feynman Technique: Simplification-based learning
- ELI5 (Explain Like I'm 5): Child-friendly explanations
- Cornell Method: Question-Notes-Summary structure
- Mind Map: Hierarchical visual structure
- Socratic Method: Question-driven inquiry
- Analogy: Familiar comparisons
- Storytelling: Narrative structure
- Expert Analysis: Professional domain analysis
- Custom: User-defined structure

**Output Format (JSON):**
\`\`\`json
{
  "enhancedPrompt": "The fully enhanced and detailed prompt here...",
  "improvements": {
    "addedClarifications": ["List of clarifications added"],
    "structuralChanges": ["List of structural improvements"],
    "addedRequirements": ["List of new requirements added"]
  },
  "qualityPrediction": {
    "expectedClarity": 85,
    "expectedDetail": 90,
    "expectedUsefulness": 88
  },
  "suggestedMethod": "Expert Analysis",
  "suggestedReason": "Why this method is recommended for this content",
  "strategy": {
    "userIntent": {
      "primaryGoal": "What the user wants to achieve",
      "secondaryGoals": ["Additional objectives"],
      "implicitNeeds": ["Unspoken needs detected"]
    },
    "techniquesApplied": [
      {
        "technique": "Technique name",
        "reason": "Why it was applied",
        "example": "How it improved the prompt"
      }
    ],
    "comparison": {
      "originalWordCount": ${originalPrompt.split(/\s+/).length},
      "enhancedWordCount": 0,
      "addedSpecificity": ["Specific additions"],
      "removedAmbiguity": ["Ambiguities removed"]
    }
  }
}
\`\`\`

**Important Guidelines:**
- The enhanced prompt should be 3-5x more detailed than the original
- Add specific instructions about structure, format, depth
- Include quality criteria and success metrics
- Make it actionable and unambiguous
- Preserve the user's core intent while expanding on it
- If the original prompt is already good, still enhance with professional polish

Generate the JSON response now:`;
}

/**
 * Get description for enhancement goal
 */
function getGoalDescription(goal: EnhancementGoal): string {
  const descriptions: Record<EnhancementGoal, string> = {
    clarity: 'Make the prompt clearer and more explicit',
    detail: 'Add more specific details and requirements',
    structure: 'Improve organization and structure',
    examples: 'Add examples and concrete illustrations',
    professional: 'Enhance with professional terminology and depth',
    simplified: 'Simplify for easier understanding',
    comprehensive: 'Create a comprehensive, all-encompassing prompt'
  };
  return descriptions[goal];
}

/**
 * Parse AI response into PromptEnhancementResult
 */
function parseEnhancementResponse(
  responseText: string,
  originalPrompt: string
): PromptEnhancementResult {
  try {
    // Extract JSON from response (might be wrapped in markdown code blocks)
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
      responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    // Validate and structure the response
    const result: PromptEnhancementResult = {
      originalPrompt,
      enhancedPrompt: parsed.enhancedPrompt || originalPrompt,
      improvements: {
        addedClarifications: parsed.improvements?.addedClarifications || [],
        structuralChanges: parsed.improvements?.structuralChanges || [],
        addedRequirements: parsed.improvements?.addedRequirements || []
      },
      qualityPrediction: {
        expectedClarity: parsed.qualityPrediction?.expectedClarity || 70,
        expectedDetail: parsed.qualityPrediction?.expectedDetail || 70,
        expectedUsefulness: parsed.qualityPrediction?.expectedUsefulness || 70
      },
      suggestedMethod: parsed.suggestedMethod as ExplanationMethod,
      suggestedReason: parsed.suggestedReason
    };

    return result;
  } catch (error) {
    console.error('Error parsing enhancement response:', error);

    // Fallback: return original prompt with basic enhancement
    return {
      originalPrompt,
      enhancedPrompt: `Create detailed educational notes with the following focus: ${originalPrompt}\n\nPlease ensure comprehensive coverage, clear structure, and appropriate examples.`,
      improvements: {
        addedClarifications: ['Added basic structure requirements'],
        structuralChanges: ['Organized into clear sections'],
        addedRequirements: ['Added quality standards']
      },
      qualityPrediction: {
        expectedClarity: 60,
        expectedDetail: 60,
        expectedUsefulness: 60
      }
    };
  }
}
