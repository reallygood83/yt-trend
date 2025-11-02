import { NextRequest, NextResponse } from 'next/server';
import type {
  EnhancedNote,
  FeynmanNote,
  ELI5Note,
  CornellNote,
  MindMapNote,
  SocraticNote,
  AnalogyNote,
  StorytellingNote,
  ExpertAnalysisNote,
  CustomNote,
  ExplanationMethod,
  AgeGroup,
  TimeSegment
} from '@/types/enhanced-note';

/**
 * Call Gemini API directly
 * Using the same pattern as existing ai-client.ts
 */
async function callGemini(prompt: string, apiKey?: string): Promise<string> {
  // Use provided API key or fallback to environment variable
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY가 제공되지 않았거나 서버 환경변수에 설정되지 않았습니다.');
  }

  console.log('[Gemini] API 호출 시작');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192, // Maximum for complete Feynman notes with 6-10 segments
        },
      }),
    });

    console.log(`[Gemini] HTTP 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gemini] API 오류 응답:`, errorText);
      throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const result = data.candidates[0]?.content?.parts[0]?.text || '';

    console.log(`[Gemini] 응답 성공, 길이: ${result.length}자`);
    return result;

  } catch (error) {
    console.error('[Gemini] API 호출 중 오류:', error);
    throw error;
  }
}

/**
 * POST /api/notes/generate
 *
 * Enhanced note generation endpoint supporting all 9 explanation methods
 * Phase 2 Implementation - Starting with Feynman Technique
 */

interface GenerateNoteRequest {
  videoId: string;
  title: string;
  duration: number;
  language: 'ko' | 'en' | 'other';
  transcript: string;
  method: ExplanationMethod;
  ageGroup: AgeGroup;
  customPrompt?: string;
  expertDomain?: string;
  apiKey?: string; // Firebase에서 로드된 사용자의 암호화된 API 키
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateNoteRequest = await request.json();

    // Validate required fields
    if (!body.videoId || !body.transcript || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields: videoId, transcript, method' },
        { status: 400 }
      );
    }

    // Route to appropriate method implementation
    let result: EnhancedNote;

    switch (body.method) {
      case 'Feynman Technique':
        result = await generateFeynmanNote(body);
        break;

      // TODO: Implement other methods
      case "ELI5 (Explain Like I'm 5)":
        result = await generateELI5Note(body);
        break;

      case 'Cornell Method':
        result = await generateCornellNote(body);
        break;

      case 'Analogy':
        result = await generateAnalogyNote(body);
        break;

      case 'Storytelling':
        result = await generateStorytellingNote(body);
        break;

      case 'Socratic Method':
        result = await generateSocraticNote(body);
        break;

      case 'Expert Analysis':
        result = await generateExpertAnalysisNote(body);
        break;

      case 'Mind Map':
        result = await generateMindMapNote(body);
        break;

      case 'Custom':
        return NextResponse.json(
          { error: `Method "${body.method}" not yet implemented` },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          { error: `Unknown method: ${body.method}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Note generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate Feynman Technique Note
 *
 * Core pedagogical principles:
 * 1. Simplification to fundamental concepts
 * 2. Plain language explanations
 * 3. Analogy usage for complex ideas
 * 4. Gap identification in understanding
 * 5. Self-explanation validation
 */
async function generateFeynmanNote(request: GenerateNoteRequest): Promise<FeynmanNote> {
  // Build Feynman-specific prompt
  const prompt = buildFeynmanPrompt(request);

  // Generate content using Gemini API
  const responseText = await callGemini(prompt, request.apiKey);

  // Parse and validate response
  const parsedNote = parseFeynmanResponse(responseText, request);

  return parsedNote;
}

/**
 * Build ELI5 (Explain Like I'm 5) prompt
 * Core principles: Extreme simplification, familiar analogies, short sentences, visual imagery
 */
function buildELI5Prompt(request: GenerateNoteRequest): string {
  const { title, transcript, ageGroup, duration } = request;

  return `You are an expert educator who explains complex topics to 5-year-old children.

**ELI5 (Explain Like I'm 5) Core Principles:**
1. Use VERY simple words (no big words or jargon)
2. Make comparisons to familiar things (toys, snacks, playgrounds, animals)
3. Keep sentences SHORT (maximum 10 words per sentence)
4. Use visual, colorful language (help them imagine pictures)
5. Make it fun and exciting (like telling a story)

**Video Information:**
- Title: ${title}
- Duration: ${Math.floor(duration / 60)} minutes
- Age Level: Explaining to a 5-year-old child

**Video Transcript:**
${transcript}

**Your Task:**
Create an ELI5 learning note with this structure:

1. **Full Summary** (2-3 sentences): What is this video about? (Use simple words!)

2. **Time Segments** (4-6 segments, each 2-3 minutes):
   For each segment, provide:

   a) **Child-Friendly Analogy** (2-3 sentences):
      - Compare to something a 5-year-old knows (toys, food, cartoons, animals)
      - Make it concrete and visual
      - Example: "It's like when you blow bubbles..."

   b) **Visual Description** (2-3 sentences):
      - Help them see it in their mind
      - Use colors, shapes, movements
      - Example: "Imagine a big red balloon..."

   c) **Emotional Connection** (1-2 sentences):
      - Connect to their feelings or experiences
      - Example: "Remember how happy you feel when..."

   d) **Simple Explanation** (3-4 SHORT sentences):
      - Explain the main idea
      - Each sentence: MAXIMUM 10 words
      - Use only simple words

   e) **Fun Questions** (2-3 questions):
      - Questions that make them curious
      - Questions they can think about
      - Example: "What do you think happens next?"

**Output Format (JSON):**
\`\`\`json
{
  "method": "ELI5 (Explain Like I'm 5)",
  "ageGroup": "${ageGroup}",
  "fullSummary": "Simple 2-3 sentence summary using very easy words...",
  "videoMetadata": {
    "videoId": "${request.videoId}",
    "title": "${title}",
    "duration": ${duration},
    "language": "${request.language}"
  },
  "segments": [
    {
      "start": 0,
      "end": 180,
      "title": "Simple segment title",
      "summary": "What this part is about (simple words)",
      "childFriendlyAnalogy": "It's like when you play with blocks. You put one block on top. Then you put another block. The tower gets taller!",
      "visualDescription": "Imagine a tall, colorful tower. It has red blocks. It has blue blocks. It goes up, up, up to the sky!",
      "emotionalConnection": "You feel proud when your tower is tall. You feel happy when it doesn't fall down!",
      "simpleExplanation": "Things can stack up. One goes on top. They make a tower. The tower can be very tall.",
      "maxWordsPerSentence": 10,
      "emojiUsage": ["🧱", "🌈", "😊"],
      "readabilityScore": 1,
      "analogyQuality": "excellent",
      "funQuestions": [
        "What happens if you put too many blocks?",
        "Can you make a tower with your toys?",
        "What's the tallest thing you've ever seen?"
      ]
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}
\`\`\`

**Critical Requirements:**
- Segments must cover entire video (0 to ${duration} seconds)
- Each segment: 2-3 minutes (120-180 seconds)
- Use ONLY words a 5-year-old knows
- Maximum 10 words per sentence
- Compare to familiar things (toys, food, animals, playground)
- Make it fun and exciting like a story
- Use emojis to make it more visual

Generate the JSON now:`;
}

function buildFeynmanPrompt(request: GenerateNoteRequest): string {
  const { title, transcript, ageGroup, duration } = request;

  return `You are an expert educator using the Feynman Technique to create exceptional learning notes.

**Feynman Technique Core Principles:**
1. Break down concepts into simplest form
2. Explain using plain, everyday language (no jargon unless necessary and explained)
3. Use analogies to make abstract concepts concrete
4. Identify knowledge gaps clearly
5. Test understanding through self-explanation

**Video Information:**
- Title: ${title}
- Duration: ${Math.floor(duration / 60)} minutes
- Target Age Group: ${ageGroup}

**Video Transcript:**
${transcript}

**Your Task:**
Generate a Feynman Technique learning note with the following structure:

1. **Full Summary** (2-3 sentences): Overall takeaway in simple terms

2. **Time Segments** (6-10 segments, each 2-5 minutes):
   For each segment, provide:

   a) **Core Concept** (1 sentence): The fundamental idea in simplest form

   b) **Simple Explanation** (2-3 paragraphs):
      - Explain as if teaching a ${ageGroup === 'elementary' ? 'elementary school student' : ageGroup === 'middle' ? 'middle school student' : ageGroup === 'high' ? 'high school student' : 'intelligent adult with no background'}
      - Use everyday language and avoid jargon
      - Break complex ideas into bite-sized pieces

   c) **Everyday Analogy** (1 paragraph):
      - Concrete comparison to familiar concepts/experiences
      - Make the abstract tangible and relatable

   d) **Knowledge Gap Check** (2-3 questions):
      - Questions that reveal if you truly understand
      - Focus on "why" and "how" rather than "what"
      - Test the limits of current understanding

   e) **Self-Explanation Test** (1 paragraph):
      - Challenge: "Explain this to someone with no background"
      - What key points must you cover?
      - Where might you struggle to explain?

3. **Overall Reflection**:
   - What are the 3 most fundamental concepts?
   - Where are the biggest knowledge gaps?
   - What analogies work best overall?

**Output Format (JSON):**
\`\`\`json
{
  "method": "Feynman Technique",
  "ageGroup": "${ageGroup}",
  "fullSummary": "2-3 sentence overall summary in simple language...",
  "videoMetadata": {
    "videoId": "${request.videoId}",
    "title": "${title}",
    "duration": ${duration},
    "language": "${request.language}"
  },
  "segments": [
    {
      "start": 0,
      "end": 180,
      "title": "Segment title in simple terms",
      "summary": "What this segment covers",
      "coreConcept": "The fundamental idea in one sentence",
      "simpleExplanation": "Detailed explanation in plain language...",
      "everydayAnalogy": "Concrete comparison to familiar concepts...",
      "knowledgeGaps": [
        "Question 1 that tests understanding",
        "Question 2 that reveals gaps",
        "Question 3 that challenges assumptions"
      ],
      "selfExplanationTest": "What you need to be able to explain to truly understand this..."
    }
  ],
  "overallReflection": {
    "fundamentalConcepts": ["Concept 1", "Concept 2", "Concept 3"],
    "majorGaps": ["Gap area 1", "Gap area 2"],
    "effectiveAnalogies": ["Analogy 1", "Analogy 2"]
  },
  "generatedAt": "${new Date().toISOString()}"
}
\`\`\`

**Critical Requirements:**
- Segments should cover the entire video duration (0 to ${duration} seconds)
- Each segment should be 2-5 minutes (120-300 seconds)
- Use ONLY simple, everyday language
- Every analogy must be concrete and relatable
- Knowledge gap questions must test true understanding, not memorization
- Self-explanation tests should identify where understanding breaks down

Generate the JSON now:`;
}
/**
 * Build Cornell Method prompt
 * Core principles: Cue questions (5W1H), Detailed notes, Bottom summary, Q&A pairs, Key terms
 */
function buildCornellPrompt(request: GenerateNoteRequest): string {
  const { title, transcript, ageGroup, duration } = request;

  return `You are an expert educator using the Cornell Method for effective note-taking and learning.

**Cornell Method Core Principles:**
1. **Cue Column (왼쪽)**: Key questions using 5W1H (Who, What, When, Where, Why, How)
   - 3-5 questions per segment
   - Questions that trigger recall of main ideas

2. **Notes Column (오른쪽)**: Detailed lecture notes
   - Main ideas and supporting details
   - Facts, definitions, examples
   - Clear and organized

3. **Summary Row (하단)**: One-sentence summary
   - Synthesize the main point
   - Use your own words

4. **Question-Answer Pairs**: Active recall practice
   - Questions with concrete answers
   - Mark importance level (high/medium/low)

5. **Key Terms Glossary**: Important vocabulary
   - Term and clear definition
   - Essential concepts to remember

**Video Information:**
- Title: ${title}
- Duration: ${Math.floor(duration / 60)} minutes
- Age Group: ${ageGroup}

**Video Transcript:**
${transcript}

**Your Task:**
Create a Cornell Method learning note with this structure:

1. **Full Summary** (2-3 sentences): Overall synthesis of the video content

2. **Time Segments** (4-6 segments, each 2-3 minutes):
   For each segment, provide:

   a) **Cue Questions** (3-5 questions):
      - Use 5W1H format (Who, What, When, Where, Why, How)
      - Questions that prompt recall of key information
      - Example: "What is the main purpose of...?"

   b) **Detailed Notes** (comprehensive):
      - Main ideas and supporting details
      - Important facts, definitions, examples
      - Organized and clear structure

   c) **Bottom Summary** (1 sentence):
      - Synthesize the segment's main point
      - Use your own words

   d) **Question-Answer Pairs** (2-4 pairs):
      - Question: Clear, specific question
      - Answer: Concrete, informative answer
      - Importance: high | medium | low

   e) **Key Terms** (2-3 terms):
      - Term: Important vocabulary or concept
      - Definition: Clear explanation

**Output Format (JSON):**
\`\`\`json
{
  "method": "Cornell Method",
  "ageGroup": "${ageGroup}",
  "fullSummary": "Overall synthesis of video content in 2-3 sentences...",
  "videoMetadata": {
    "videoId": "${request.videoId}",
    "title": "${title}",
    "duration": ${duration},
    "language": "${request.language}"
  },
  "segments": [
    {
      "start": 0,
      "end": 180,
      "title": "Segment title",
      "summary": "Brief segment overview",
      "cueQuestions": [
        "What is the main concept introduced?",
        "Why is this topic important?",
        "How does this relate to the overall theme?"
      ],
      "detailedNotes": "Main idea: The video introduces the concept of X, which is important because Y. Key supporting details include: 1) First detail with example, 2) Second detail showing application, 3) Third detail explaining implications. The presenter emphasizes that this forms the foundation for understanding subsequent concepts.",
      "bottomSummary": "This segment establishes the foundational concept that enables deeper understanding.",
      "questionAnswerPairs": [
        {
          "question": "What is the primary benefit of this approach?",
          "answer": "The primary benefit is improved efficiency through systematic organization and clear structure.",
          "importance": "high"
        },
        {
          "question": "How does this differ from traditional methods?",
          "answer": "Unlike traditional methods, this approach emphasizes active recall and self-testing.",
          "importance": "medium"
        }
      ],
      "keyTerms": [
        {
          "term": "Active Recall",
          "definition": "A learning technique where you actively retrieve information from memory rather than passively reviewing notes."
        },
        {
          "term": "Spaced Repetition",
          "definition": "A learning method that involves reviewing material at increasing intervals to strengthen long-term retention."
        }
      ]
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}
\`\`\`

**Critical Requirements:**
- Segments must cover entire video (0 to ${duration} seconds)
- Each segment: 2-3 minutes (120-180 seconds)
- Cue questions: 3-5 per segment using 5W1H
- Detailed notes: Comprehensive and well-organized
- Bottom summary: One clear sentence synthesizing the segment
- Question-Answer pairs: 2-4 per segment with importance levels
- Key terms: 2-3 essential concepts per segment
- All content must be accurate to the transcript
- Use age-appropriate language for ${ageGroup} level

Generate the JSON now:`;
}


function parseFeynmanResponse(
  responseText: string,
  request: GenerateNoteRequest
): FeynmanNote {
  try {
    // Extract JSON from response
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
      responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('[Parse Error] No JSON found in response. Full text:', responseText.substring(0, 500));
      throw new Error('No JSON found in AI response');
    }

    let jsonText = jsonMatch[1] || jsonMatch[0];
    console.log('[Parse Debug] Extracted JSON length:', jsonText.length);

    // Attempt to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (firstError) {
      console.warn('[Parse Warning] Initial parse failed, attempting JSON repair...');

      // Try adding missing closing braces if JSON is incomplete
      if (!jsonText.trim().endsWith('}')) {
        jsonText = jsonText.trim() + '\n  ]\n}';
        console.log('[Parse Debug] Added missing closing braces');
      }

      // Fix common AI JSON issues
      jsonText = jsonText
        .replace(/"\s*}\s*\n\s*{/g, '"},\n    {')  // Missing commas between objects
        .replace(/"\s*}\s*\]/g, '"}\n  ]');         // Missing closing array

      try {
        parsed = JSON.parse(jsonText);
        console.log('[Parse Success] JSON repaired and parsed successfully');
      } catch (secondError) {
        console.error('[Parse Error] JSON repair failed:', secondError);
        throw new Error(`Failed to parse AI response: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
      }
    }

    // Validate and structure the response
    const note: FeynmanNote = {
      method: 'Feynman Technique',
      ageGroup: parsed.ageGroup || request.ageGroup,
      fullSummary: parsed.fullSummary || 'Summary not generated',
      videoMetadata: {
        videoId: request.videoId,
        title: request.title,
        duration: request.duration,
        language: request.language
      },
      segments: parsed.segments?.map((seg: any) => ({
        start: seg.start || 0,
        end: seg.end || 0,
        title: seg.title || 'Untitled Segment',
        summary: seg.summary || '',
        coreConcept: seg.coreConcept || '',
        simpleExplanation: seg.simpleExplanation || '',
        everydayAnalogy: seg.everydayAnalogy || '',
        knowledgeGaps: seg.knowledgeGaps || [],
        selfExplanationTest: seg.selfExplanationTest || ''
      })) || [],
      generatedAt: new Date(),
      qualityScore: calculateQualityScore(parsed)
    };

    // Validate segment coverage
    validateSegmentCoverage(note.segments, request.duration);

    return note;

  } catch (error) {
    console.error('Error parsing Feynman response:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate quality score based on Feynman principles adherence
 */
function calculateQualityScore(parsed: any): number {
  let score = 0;
  const maxScore = 100;

  // Check summary quality (10 points)
  if (parsed.fullSummary && parsed.fullSummary.length >= 50) {
    score += 10;
  }

  // Check segment count (20 points)
  const segmentCount = parsed.segments?.length || 0;
  if (segmentCount >= 6 && segmentCount <= 10) {
    score += 20;
  } else if (segmentCount >= 4) {
    score += 10;
  }

  // Check Feynman-specific fields (70 points total)
  const segments = parsed.segments || [];
  let feynmanScore = 0;
  let validSegments = 0;

  segments.forEach((seg: any) => {
    let segScore = 0;

    // Core concept exists (10 points)
    if (seg.coreConcept && seg.coreConcept.length >= 20) {
      segScore += 10;
    }

    // Simple explanation exists and is detailed (20 points)
    if (seg.simpleExplanation && seg.simpleExplanation.length >= 100) {
      segScore += 20;
    }

    // Everyday analogy exists (15 points)
    if (seg.everydayAnalogy && seg.everydayAnalogy.length >= 50) {
      segScore += 15;
    }

    // Knowledge gaps (15 points)
    if (seg.knowledgeGaps && seg.knowledgeGaps.length >= 2) {
      segScore += 15;
    }

    // Self-explanation test (10 points)
    if (seg.selfExplanationTest && seg.selfExplanationTest.length >= 50) {
      segScore += 10;
    }

    feynmanScore += segScore;
    validSegments++;
  });

  // Average Feynman score across segments
  if (validSegments > 0) {
    score += (feynmanScore / validSegments);
  }

  return Math.min(Math.round(score), maxScore);
}

/**
 * Generate ELI5 (Explain Like I'm 5) Note
 *
 * Core pedagogical principles for 5-year-olds:
 * 1. Use VERY simple words (no jargon)
 * 2. Familiar comparisons (toys, food, animals)
 * 3. Short sentences (10 words max)
 * 4. Visual, colorful language
 * 5. Fun and exciting tone
 */
async function generateELI5Note(request: GenerateNoteRequest): Promise<ELI5Note> {
  const prompt = buildELI5Prompt(request);
  const responseText = await callGemini(prompt, request.apiKey);
  return parseELI5Response(responseText, request);
}

/**
 * Parse ELI5 response from Gemini API
 */
function parseELI5Response(responseText: string, request: GenerateNoteRequest): ELI5Note {
  try {
    // Extract JSON from markdown code block
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    let jsonText = jsonMatch[1].trim();

    // Smart JSON parsing with repair logic (same as Feynman)
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (firstError) {
      console.warn('[ELI5 Parse Warning] Initial parse failed, attempting JSON repair...');

      // Try adding missing closing braces if JSON is incomplete
      if (!jsonText.trim().endsWith('}')) {
        jsonText = jsonText.trim() + '\n  ]\n}';
        console.log('[ELI5 Parse Debug] Added missing closing braces');
      }

      // Fix common AI JSON issues
      jsonText = jsonText
        .replace(/"\s*}\s*\n\s*{/g, '"},\n    {')  // Missing commas between objects
        .replace(/"\s*}\s*\]/g, '"}\n  ]');         // Missing closing array

      try {
        parsed = JSON.parse(jsonText);
        console.log('[ELI5 Parse Success] JSON repaired and parsed successfully');
      } catch (secondError) {
        console.error('[ELI5 Parse Error] JSON repair failed:', secondError);
        throw new Error(`Failed to parse AI response: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
      }
    }

    // Build ELI5Note with type safety
    const note: ELI5Note = {
      method: "ELI5 (Explain Like I'm 5)",
      ageGroup: request.ageGroup,
      fullSummary: parsed.fullSummary || '',
      videoMetadata: parsed.videoMetadata || {
        videoId: request.videoId,
        title: request.title,
        duration: request.duration,
        language: request.language
      },
      segments: (parsed.segments || []).map((seg: any) => ({
        start: seg.start || 0,
        end: seg.end || 0,
        title: seg.title || '',
        summary: seg.summary || '',
        childFriendlyAnalogy: seg.childFriendlyAnalogy || '',
        visualDescription: seg.visualDescription || '',
        emotionalConnection: seg.emotionalConnection || '',
        simpleExplanation: seg.simpleExplanation || '',
        maxWordsPerSentence: seg.maxWordsPerSentence || 10,
        emojiUsage: seg.emojiUsage || [],
        funQuestions: seg.funQuestions || [],
        readabilityScore: seg.readabilityScore || 1,
        analogyQuality: seg.analogyQuality || 'good'
      })) || [],
      generatedAt: new Date(),
      qualityScore: calculateELI5QualityScore(parsed)
    };

    // Validate segment coverage
    validateSegmentCoverage(note.segments, request.duration);

    return note;

  } catch (error) {
    console.error('Error parsing ELI5 response:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate quality score for ELI5 notes
 */
function calculateELI5QualityScore(parsed: any): number {
  let score = 0;
  const maxScore = 100;

  // Check summary quality (10 points)
  if (parsed.fullSummary && parsed.fullSummary.length >= 30) {
    score += 10;
  }

  // Check segment count (20 points)
  const segmentCount = parsed.segments?.length || 0;
  if (segmentCount >= 4 && segmentCount <= 6) {
    score += 20;
  } else if (segmentCount >= 3) {
    score += 10;
  }

  // Check ELI5-specific fields (70 points total)
  const segments = parsed.segments || [];
  let eli5Score = 0;
  let validSegments = 0;

  segments.forEach((seg: any) => {
    let segScore = 0;

    // Child-friendly analogy exists (20 points)
    if (seg.childFriendlyAnalogy && seg.childFriendlyAnalogy.length >= 30) {
      segScore += 20;
    }

    // Visual description exists (15 points)
    if (seg.visualDescription && seg.visualDescription.length >= 30) {
      segScore += 15;
    }

    // Emotional connection exists (10 points)
    if (seg.emotionalConnection && seg.emotionalConnection.length >= 20) {
      segScore += 10;
    }

    // Simple explanation exists (15 points)
    if (seg.simpleExplanation && seg.simpleExplanation.length >= 30) {
      segScore += 15;
    }

    // Fun questions (10 points)
    if (seg.funQuestions && seg.funQuestions.length >= 2) {
      segScore += 10;
    }

    eli5Score += segScore;
    validSegments++;
  });

  // Average ELI5 score across segments
  if (validSegments > 0) {
    score += (eli5Score / validSegments);
  }

  return Math.min(Math.round(score), maxScore);
}

/**
 * Validate that segments cover the entire video duration
 */
function validateSegmentCoverage(segments: TimeSegment[], totalDuration: number): void {
  if (segments.length === 0) {
    throw new Error('No segments generated');
  }

  // Check first segment starts at 0
  if (segments[0].start !== 0) {
    console.warn(`First segment starts at ${segments[0].start} instead of 0`);
  }

  // Check last segment ends at total duration
  const lastSegment = segments[segments.length - 1];
  const coveragePercentage = (lastSegment.end / totalDuration) * 100;

  if (coveragePercentage < 80) {
    console.warn(`Segments only cover ${coveragePercentage.toFixed(1)}% of video duration`);
  }

  // Check for gaps between segments
  for (let i = 0; i < segments.length - 1; i++) {
    const currentEnd = segments[i].end;
    const nextStart = segments[i + 1].start;

    if (nextStart > currentEnd + 5) {
      console.warn(`Gap detected between segments ${i} and ${i + 1}: ${nextStart - currentEnd} seconds`);
    }
  }
}
// ============================================================================
// CORNELL METHOD IMPLEMENTATION
// ============================================================================

/**
 * Generate Cornell Method Note
 *
 * Core Cornell Method principles:
 * 1. Cue Column (왼쪽): 5W1H questions (3-5 per segment)
 * 2. Notes Column (오른쪽): Detailed lecture notes
 * 3. Summary Row (하단): One-sentence summary
 * 4. Question-Answer pairs for active recall
 * 5. Key terms glossary
 */
async function generateCornellNote(request: GenerateNoteRequest): Promise<CornellNote> {
  const prompt = buildCornellPrompt(request);
  const responseText = await callGemini(prompt, request.apiKey);
  return parseCornellResponse(responseText, request);
}

/**
 * Parse Cornell response from Gemini API
 */
function parseCornellResponse(responseText: string, request: GenerateNoteRequest): CornellNote {
  try {
    // Extract JSON from markdown code block
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    let jsonText = jsonMatch[1].trim();

    // Smart JSON parsing with repair logic (same as Feynman/ELI5)
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (firstError) {
      console.warn('[Cornell Parse Warning] Initial parse failed, attempting JSON repair...');

      // Try adding missing closing braces if JSON is incomplete
      if (!jsonText.trim().endsWith('}')) {
        jsonText = jsonText.trim() + '\n  ]\n}';
        console.log('[Cornell Parse Debug] Added missing closing braces');
      }

      // Fix common AI JSON issues
      jsonText = jsonText
        .replace(/"\s*}\s*\n\s*{/g, '"},\n    {')  // Missing commas between objects
        .replace(/"\s*}\s*\]/g, '"}\n  ]');         // Missing closing array

      try {
        parsed = JSON.parse(jsonText);
        console.log('[Cornell Parse Success] JSON repaired and parsed successfully');
      } catch (secondError) {
        console.error('[Cornell Parse Error] JSON repair failed:', secondError);
        throw new Error(`Failed to parse AI response: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
      }
    }

    // Build CornellNote with type safety
    const note: CornellNote = {
      method: "Cornell Method",
      ageGroup: request.ageGroup,
      fullSummary: parsed.fullSummary || '',
      videoMetadata: parsed.videoMetadata || {
        videoId: request.videoId,
        title: request.title,
        duration: request.duration,
        language: request.language
      },
      segments: (parsed.segments || []).map((seg: any) => ({
        start: seg.start || 0,
        end: seg.end || 0,
        title: seg.title || '',
        summary: seg.summary || '',
        cueQuestions: seg.cueQuestions || [],
        detailedNotes: seg.detailedNotes || '',
        bottomSummary: seg.bottomSummary || '',
        questionAnswerPairs: (seg.questionAnswerPairs || []).map((qa: any) => ({
          question: qa.question || '',
          answer: qa.answer || '',
          importance: qa.importance || 'medium'
        })),
        keyTerms: (seg.keyTerms || []).map((term: any) => ({
          term: term.term || '',
          definition: term.definition || ''
        }))
      })) || [],
      generatedAt: new Date(),
      qualityScore: calculateCornellQualityScore(parsed)
    };

    // Validate segment coverage
    validateSegmentCoverage(note.segments, request.duration);

    return note;

  } catch (error) {
    console.error('Error parsing Cornell response:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate quality score for Cornell notes
 */
function calculateCornellQualityScore(parsed: any): number {
  let score = 0;
  const maxScore = 100;

  // Check summary quality (10 points)
  if (parsed.fullSummary && parsed.fullSummary.length >= 30) {
    score += 10;
  }

  // Check segment count (20 points)
  const segmentCount = parsed.segments?.length || 0;
  if (segmentCount >= 4 && segmentCount <= 6) {
    score += 20;
  } else if (segmentCount >= 3) {
    score += 10;
  }

  // Check Cornell-specific fields (70 points total)
  const segments = parsed.segments || [];
  let cornellScore = 0;
  let validSegments = 0;

  segments.forEach((seg: any) => {
    let segScore = 0;

    // Cue questions (3-5 questions) (20 points)
    const cueCount = seg.cueQuestions?.length || 0;
    if (cueCount >= 3 && cueCount <= 5) {
      segScore += 20;
    } else if (cueCount >= 2) {
      segScore += 10;
    }

    // Detailed notes quality (20 points)
    if (seg.detailedNotes && seg.detailedNotes.length >= 100) {
      segScore += 20;
    } else if (seg.detailedNotes && seg.detailedNotes.length >= 50) {
      segScore += 10;
    }

    // Bottom summary (10 points)
    if (seg.bottomSummary && seg.bottomSummary.length >= 20) {
      segScore += 10;
    }

    // Question-Answer pairs (15 points)
    const qaCount = seg.questionAnswerPairs?.length || 0;
    if (qaCount >= 3) {
      segScore += 15;
    } else if (qaCount >= 2) {
      segScore += 10;
    } else if (qaCount >= 1) {
      segScore += 5;
    }

    // Key terms glossary (5 points)
    const termCount = seg.keyTerms?.length || 0;
    if (termCount >= 2) {
      segScore += 5;
    } else if (termCount >= 1) {
      segScore += 3;
    }

    cornellScore += segScore;
    validSegments++;
  });

  // Average Cornell score across segments
  if (validSegments > 0) {
    score += (cornellScore / validSegments);
  }

  return Math.min(Math.round(score), maxScore);
}
// ============================================================================
// ANALOGY METHOD IMPLEMENTATION
// ============================================================================

/**
 * Generate Analogy Method Note
 *
 * Core Analogy principles:
 * 1. Target Concept (targetConcept): 설명할 개념
 * 2. Source Analogy (sourceAnalogy): 친숙한 비유 대상
 * 3. Mapping Explanation (mappingExplanation): 대응 관계 설명
 * 4. Analogy Chain (analogyChain): 추상-구체 연결 구조
 * 5. Analogy Types (analogyTypes): 비유 유형 분류
 * 6. Quality Metrics: familiarityScore, correspondenceAccuracy
 */
async function generateAnalogyNote(request: GenerateNoteRequest): Promise<AnalogyNote> {
  const prompt = buildAnalogyPrompt(request);
  const responseText = await callGemini(prompt, request.apiKey);
  return parseAnalogyResponse(responseText, request);
}

/**
 * Build Analogy prompt with clear JSON structure for frontend visualization
 */
function buildAnalogyPrompt(request: GenerateNoteRequest): string {
  const { title, transcript, ageGroup, duration } = request;

  return `You are an expert educator using the Analogy Method to make complex concepts understandable through familiar comparisons.

**Analogy Method Core Principles:**
1. **Target Concept**: The unfamiliar concept to be explained
2. **Source Analogy**: A familiar, everyday thing to compare it to
3. **Mapping Explanation**: How the two correspond point-by-point
4. **Analogy Chain**: Series of abstract→concrete connections
5. **Analogy Types**: Classify by object, process, relationship, or system

**Video Information:**
- Title: ${title}
- Duration: ${Math.floor(duration / 60)} minutes
- Age Group: ${ageGroup}

**Video Transcript:**
${transcript}

**Your Task:**
Create an Analogy Method learning note with this structure:

1. **Full Summary** (2-3 sentences): Overall synthesis of the video content

2. **Time Segments** (4-6 segments, each 2-3 minutes):
   For each segment, provide:

   a) **Target Concept** (핵심 개념):
      - The main concept being explained
      - Why it's difficult to understand
      - Age-appropriate description

   b) **Source Analogy** (친숙한 비유):
      - Familiar thing to compare to (from everyday life)
      - Why this analogy works well
      - Familiarity score (1-10, how familiar to ${ageGroup})

   c) **Mapping Explanation** (대응 관계):
      - How targetConcept and sourceAnalogy correspond
      - Point-by-point comparison
      - What each part represents

   d) **Analogy Chain** (3-4 chains):
      - Abstract concept (from video)
      - Concrete analogy (familiar equivalent)
      - Correspondence points (array of 2-3 matching aspects)

   e) **Analogy Types** (2-3 types):
      - Type: object | process | relationship | system
      - Example from this segment

   f) **Quality Metrics**:
      - Familiarity Score (1-10): How familiar is the analogy?
      - Correspondence Accuracy (1-10): How well does it match?

**Output Format (JSON):**
\`\`\`json
{
  "method": "Analogy",
  "ageGroup": "${ageGroup}",
  "fullSummary": "Overall synthesis of video content in 2-3 sentences...",
  "videoMetadata": {
    "videoId": "${request.videoId}",
    "title": "${title}",
    "duration": ${duration},
    "language": "${request.language}"
  },
  "segments": [
    {
      "start": 0,
      "end": 180,
      "title": "Segment title",
      "summary": "Brief segment overview",
      "targetConcept": "The unfamiliar concept being explained",
      "sourceAnalogy": "The familiar everyday thing used for comparison",
      "mappingExplanation": "Detailed explanation of how the target concept and source analogy correspond. For example, if explaining cloud storage using a library analogy: 'Just as a library stores books in organized sections, cloud storage stores your files in organized folders. The librarian is like the cloud service managing access, and borrowing a book is like downloading a file.'",
      "analogyChain": [
        {
          "abstract": "Abstract concept from the video",
          "concrete": "Familiar concrete equivalent",
          "correspondence": [
            "First matching aspect",
            "Second matching aspect",
            "Third matching aspect"
          ]
        },
        {
          "abstract": "Another abstract concept",
          "concrete": "Another familiar equivalent",
          "correspondence": [
            "Matching point 1",
            "Matching point 2"
          ]
        }
      ],
      "analogyTypes": [
        {
          "type": "object",
          "example": "Comparing a computer to a brain (both are processing units)"
        },
        {
          "type": "process",
          "example": "Comparing data encryption to locking a safe (both secure information)"
        }
      ],
      "familiarityScore": 8,
      "correspondenceAccuracy": 9
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}
\`\`\`

**Critical Requirements for Frontend Visualization:**
- Segments must cover entire video (0 to ${duration} seconds)
- Each segment: 2-3 minutes (120-180 seconds)
- targetConcept: Clear, concise concept name (under 100 characters)
- sourceAnalogy: Familiar everyday object/process (under 100 characters)
- mappingExplanation: Detailed but structured (2-4 sentences)
- analogyChain: 3-4 chains per segment for variety
- analogyTypes: Classify each analogy (object/process/relationship/system)
- familiarityScore: 1-10 scale (how familiar to ${ageGroup})
- correspondenceAccuracy: 1-10 scale (how accurate the mapping)
- All content must be accurate to the transcript
- Use age-appropriate language for ${ageGroup} level
- **Clean JSON structure** for easy frontend parsing and visualization

Generate the JSON now:`;
}

/**
 * Parse Analogy response from Gemini API with thorough validation
 */
function parseAnalogyResponse(responseText: string, request: GenerateNoteRequest): AnalogyNote {
  try {
    // Extract JSON from markdown code block
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    let jsonText = jsonMatch[1].trim();

    // Smart JSON parsing with repair logic (same proven pattern)
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (firstError) {
      console.warn('[Analogy Parse Warning] Initial parse failed, attempting JSON repair...');

      // Try adding missing closing braces if JSON is incomplete
      if (!jsonText.trim().endsWith('}')) {
        jsonText = jsonText.trim() + '\n  ]\n}';
        console.log('[Analogy Parse Debug] Added missing closing braces');
      }

      // Fix common AI JSON issues
      jsonText = jsonText
        .replace(/"\s*}\s*\n\s*{/g, '"},\n    {')  // Missing commas between objects
        .replace(/"\s*}\s*\]/g, '"}\n  ]');         // Missing closing array

      try {
        parsed = JSON.parse(jsonText);
        console.log('[Analogy Parse Success] JSON repaired and parsed successfully');
      } catch (secondError) {
        console.error('[Analogy Parse Error] JSON repair failed:', secondError);
        throw new Error(`Failed to parse AI response: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
      }
    }

    // Build AnalogyNote with type safety and frontend-optimized structure
    const note: AnalogyNote = {
      method: "Analogy",
      ageGroup: request.ageGroup,
      fullSummary: parsed.fullSummary || '',
      videoMetadata: parsed.videoMetadata || {
        videoId: request.videoId,
        title: request.title,
        duration: request.duration,
        language: request.language
      },
      segments: (parsed.segments || []).map((seg: any) => ({
        start: seg.start || 0,
        end: seg.end || 0,
        title: seg.title || '',
        summary: seg.summary || '',
        targetConcept: seg.targetConcept || '',
        sourceAnalogy: seg.sourceAnalogy || '',
        mappingExplanation: seg.mappingExplanation || '',
        analogyChain: (seg.analogyChain || []).map((chain: any) => ({
          abstract: chain.abstract || '',
          concrete: chain.concrete || '',
          correspondence: Array.isArray(chain.correspondence) ? chain.correspondence : []
        })),
        analogyTypes: (seg.analogyTypes || []).map((type: any) => ({
          type: type.type || 'object',
          example: type.example || ''
        })),
        familiarityScore: typeof seg.familiarityScore === 'number' ? seg.familiarityScore : 5,
        correspondenceAccuracy: typeof seg.correspondenceAccuracy === 'number' ? seg.correspondenceAccuracy : 5
      })) || [],
      generatedAt: new Date(),
      qualityScore: calculateAnalogyQualityScore(parsed)
    };

    // Validate segment coverage
    validateSegmentCoverage(note.segments, request.duration);

    return note;

  } catch (error) {
    console.error('Error parsing Analogy response:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate quality score for Analogy notes
 */
function calculateAnalogyQualityScore(parsed: any): number {
  let score = 0;
  const maxScore = 100;

  // Check summary quality (10 points)
  if (parsed.fullSummary && parsed.fullSummary.length >= 30) {
    score += 10;
  }

  // Check segment count (20 points)
  const segmentCount = parsed.segments?.length || 0;
  if (segmentCount >= 4 && segmentCount <= 6) {
    score += 20;
  } else if (segmentCount >= 3) {
    score += 10;
  }

  // Check Analogy-specific fields (70 points total)
  const segments = parsed.segments || [];
  let analogyScore = 0;
  let validSegments = 0;

  segments.forEach((seg: any) => {
    let segScore = 0;

    // Target concept quality (15 points)
    if (seg.targetConcept && seg.targetConcept.length >= 10 && seg.targetConcept.length <= 100) {
      segScore += 15;
    } else if (seg.targetConcept && seg.targetConcept.length >= 5) {
      segScore += 8;
    }

    // Source analogy quality (15 points)
    if (seg.sourceAnalogy && seg.sourceAnalogy.length >= 10 && seg.sourceAnalogy.length <= 100) {
      segScore += 15;
    } else if (seg.sourceAnalogy && seg.sourceAnalogy.length >= 5) {
      segScore += 8;
    }

    // Mapping explanation quality (15 points)
    if (seg.mappingExplanation && seg.mappingExplanation.length >= 50) {
      segScore += 15;
    } else if (seg.mappingExplanation && seg.mappingExplanation.length >= 20) {
      segScore += 8;
    }

    // Analogy chain count (15 points)
    const chainCount = seg.analogyChain?.length || 0;
    if (chainCount >= 3 && chainCount <= 4) {
      segScore += 15;
    } else if (chainCount >= 2) {
      segScore += 10;
    } else if (chainCount >= 1) {
      segScore += 5;
    }

    // Analogy types variety (10 points)
    const typeCount = seg.analogyTypes?.length || 0;
    if (typeCount >= 2) {
      segScore += 10;
    } else if (typeCount >= 1) {
      segScore += 5;
    }

    analogyScore += segScore;
    validSegments++;
  });

  // Average analogy score across segments
  if (validSegments > 0) {
    score += (analogyScore / validSegments);
  }

  return Math.min(Math.round(score), maxScore);
}
// ============================================================================
// STORYTELLING METHOD IMPLEMENTATION
// ============================================================================

/**
 * Generate Storytelling Method Note
 *
 * Core Storytelling principles:
 * 1. Narrative (setting, protagonist, obstacles, resolution)
 * 2. Characters (roles, motivations)
 * 3. Plot (problem → conflict → solution)
 * 4. Story Arc (exposition → rising → climax → falling → resolution)
 * 5. Emotional Journey (timestamps with emotion and intensity)
 * 6. Moral (lessons and real-world application)
 */
async function generateStorytellingNote(request: GenerateNoteRequest): Promise<StorytellingNote> {
  const prompt = buildStorytellingPrompt(request);
  const responseText = await callGemini(prompt, request.apiKey);
  return parseStorytellingResponse(responseText, request);
}

/**
 * Build Storytelling prompt with clear JSON structure for frontend visualization
 */
function buildStorytellingPrompt(request: GenerateNoteRequest): string {
  const { title, transcript, ageGroup, duration } = request;

  return `You are an expert educator using the Storytelling Method to make complex concepts memorable through narrative structure.

**Storytelling Method Core Principles:**
1. **Narrative**: Setting, protagonist's goal, obstacles, and resolution
2. **Characters**: Clear roles (protagonist, antagonist, mentor, helper) with motivations
3. **Plot Structure**: Problem → Conflict → Solution
4. **Story Arc**: Five-act structure (Exposition → Rising Action → Climax → Falling Action → Resolution)
5. **Emotional Journey**: Track emotional intensity throughout the story
6. **Moral & Application**: Extract lessons and real-world applications

**Video Information:**
- Title: ${title}
- Duration: ${Math.floor(duration / 60)} minutes
- Age Group: ${ageGroup}

**Video Transcript:**
${transcript}

**Your Task:**
Create a Storytelling Method learning note with this structure:

1. **Full Summary** (2-3 sentences): Overall synthesis of the video content

2. **Time Segments** (4-6 segments, each 2-3 minutes):
   For each segment, provide:

   a) **Narrative** (story structure):
      - Setting: Where and when does this take place?
      - Protagonist Goal: What does the main character/concept want to achieve?
      - Obstacles: What challenges are faced? (array of 2-3 obstacles)
      - Resolution: How does the story resolve?

   b) **Characters** (2-3 characters):
      - Name: Character/concept name
      - Role: protagonist | antagonist | mentor | helper
      - Motivation: What drives this character?

   c) **Plot Structure**:
      - Problem: Initial problem situation
      - Conflict: Central conflict or challenge
      - Solution: How the problem is solved

   d) **Story Arc** (5-act structure):
      - Exposition: Introduction and setup
      - Rising Action: Events building tension (array of 2-3 events)
      - Climax: Peak moment or turning point
      - Falling Action: Consequences after climax
      - Resolution: Final outcome

   e) **Emotional Journey** (3-4 emotion points):
      - Timestamp: Second mark in the video
      - Emotion: Specific emotion (e.g., "curious", "frustrated", "excited", "relieved")
      - Intensity: 1-10 scale

   f) **Moral & Application**:
      - Moral: The story's lesson or takeaway
      - Real World Application: How to apply this in real life

**Output Format (JSON):**
\`\`\`json
{
  "method": "Storytelling",
  "ageGroup": "${ageGroup}",
  "fullSummary": "Overall synthesis of video content in 2-3 sentences...",
  "videoMetadata": {
    "videoId": "${request.videoId}",
    "title": "${title}",
    "duration": ${duration},
    "language": "${request.language}"
  },
  "segments": [
    {
      "start": 0,
      "end": 180,
      "title": "Segment title as story chapter",
      "summary": "Brief segment overview",
      "narrative": {
        "setting": "Time and place where this story unfolds",
        "protagonistGoal": "What the main character/concept wants to achieve",
        "obstacles": [
          "First obstacle or challenge",
          "Second obstacle",
          "Third obstacle"
        ],
        "resolution": "How the obstacles are overcome"
      },
      "characters": [
        {
          "name": "Character name (e.g., 'The Learner', 'Confusion', 'Insight')",
          "role": "protagonist",
          "motivation": "What drives this character"
        },
        {
          "name": "Second character",
          "role": "antagonist",
          "motivation": "Opposing force motivation"
        }
      ],
      "plot": {
        "problem": "Initial problem situation",
        "conflict": "Central conflict or tension",
        "solution": "How the problem is resolved"
      },
      "storyArc": {
        "exposition": "Introduction and setup of the situation",
        "risingAction": [
          "First event building tension",
          "Second event increasing stakes",
          "Third event approaching climax"
        ],
        "climax": "Peak moment or turning point",
        "fallingAction": "Consequences after the climax",
        "resolution": "Final outcome and closure"
      },
      "emotionalJourney": [
        {
          "timestamp": 30,
          "emotion": "curious",
          "intensity": 6
        },
        {
          "timestamp": 90,
          "emotion": "frustrated",
          "intensity": 7
        },
        {
          "timestamp": 150,
          "emotion": "excited",
          "intensity": 9
        }
      ],
      "moral": "The lesson or takeaway from this story",
      "realWorldApplication": "How to apply this learning in real-world situations"
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}
\`\`\`

**Critical Requirements for Frontend Visualization:**
- Segments must cover entire video (0 to ${duration} seconds)
- Each segment: 2-3 minutes (120-180 seconds)
- Characters: 2-3 per segment with clear roles
- Obstacles: 2-3 concrete challenges per narrative
- Rising Action: 2-3 events building toward climax
- Emotional Journey: 3-4 emotion points per segment
- Timestamp values must be within segment range
- All content must be accurate to the transcript
- Use age-appropriate language for ${ageGroup} level
- **Clean JSON structure** for easy frontend parsing and visualization

Generate the JSON now:`;
}

/**
 * Parse Storytelling response from Gemini API with thorough validation
 */
function parseStorytellingResponse(responseText: string, request: GenerateNoteRequest): StorytellingNote {
  try {
    // Extract JSON from markdown code block
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    let jsonText = jsonMatch[1].trim();

    // Smart JSON parsing with repair logic (same proven pattern)
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (firstError) {
      console.warn('[Storytelling Parse Warning] Initial parse failed, attempting JSON repair...');

      // Try adding missing closing braces if JSON is incomplete
      if (!jsonText.trim().endsWith('}')) {
        jsonText = jsonText.trim() + '\n  ]\n}';
        console.log('[Storytelling Parse Debug] Added missing closing braces');
      }

      // Fix common AI JSON issues
      jsonText = jsonText
        .replace(/"\s*}\s*\n\s*{/g, '"},\n    {')  // Missing commas between objects
        .replace(/"\s*}\s*\]/g, '"}\n  ]');         // Missing closing array

      try {
        parsed = JSON.parse(jsonText);
        console.log('[Storytelling Parse Success] JSON repaired and parsed successfully');
      } catch (secondError) {
        console.error('[Storytelling Parse Error] JSON repair failed:', secondError);
        throw new Error(`Failed to parse AI response: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
      }
    }

    // Build StorytellingNote with type safety and frontend-optimized structure
    const note: StorytellingNote = {
      method: "Storytelling",
      ageGroup: request.ageGroup,
      fullSummary: parsed.fullSummary || '',
      videoMetadata: parsed.videoMetadata || {
        videoId: request.videoId,
        title: request.title,
        duration: request.duration,
        language: request.language
      },
      segments: (parsed.segments || []).map((seg: any) => ({
        start: seg.start || 0,
        end: seg.end || 0,
        title: seg.title || '',
        summary: seg.summary || '',
        narrative: {
          setting: seg.narrative?.setting || '',
          protagonistGoal: seg.narrative?.protagonistGoal || '',
          obstacles: Array.isArray(seg.narrative?.obstacles) ? seg.narrative.obstacles : [],
          resolution: seg.narrative?.resolution || ''
        },
        characters: (seg.characters || []).map((char: any) => ({
          name: char.name || '',
          role: char.role || 'protagonist',
          motivation: char.motivation || ''
        })),
        plot: {
          problem: seg.plot?.problem || '',
          conflict: seg.plot?.conflict || '',
          solution: seg.plot?.solution || ''
        },
        storyArc: {
          exposition: seg.storyArc?.exposition || '',
          risingAction: Array.isArray(seg.storyArc?.risingAction) ? seg.storyArc.risingAction : [],
          climax: seg.storyArc?.climax || '',
          fallingAction: seg.storyArc?.fallingAction || '',
          resolution: seg.storyArc?.resolution || ''
        },
        emotionalJourney: (seg.emotionalJourney || []).map((ej: any) => ({
          timestamp: typeof ej.timestamp === 'number' ? ej.timestamp : 0,
          emotion: ej.emotion || '',
          intensity: typeof ej.intensity === 'number' ? ej.intensity : 5
        })),
        moral: seg.moral || '',
        realWorldApplication: seg.realWorldApplication || ''
      })) || [],
      generatedAt: new Date(),
      qualityScore: calculateStorytellingQualityScore(parsed)
    };

    // Validate segment coverage
    validateSegmentCoverage(note.segments, request.duration);

    return note;

  } catch (error) {
    console.error('Error parsing Storytelling response:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate quality score for Storytelling notes
 */
function calculateStorytellingQualityScore(parsed: any): number {
  let score = 0;
  const maxScore = 100;

  // Check summary quality (10 points)
  if (parsed.fullSummary && parsed.fullSummary.length >= 30) {
    score += 10;
  }

  // Check segment count (20 points)
  const segmentCount = parsed.segments?.length || 0;
  if (segmentCount >= 4 && segmentCount <= 6) {
    score += 20;
  } else if (segmentCount >= 3) {
    score += 10;
  }

  // Check Storytelling-specific fields (70 points total)
  const segments = parsed.segments || [];
  let storyScore = 0;
  let validSegments = 0;

  segments.forEach((seg: any) => {
    let segScore = 0;

    // Narrative quality (15 points)
    if (seg.narrative?.setting && seg.narrative?.protagonistGoal &&
        Array.isArray(seg.narrative?.obstacles) && seg.narrative.obstacles.length >= 2 &&
        seg.narrative?.resolution) {
      segScore += 15;
    } else if (seg.narrative?.setting || seg.narrative?.protagonistGoal) {
      segScore += 8;
    }

    // Characters quality (15 points)
    const charCount = seg.characters?.length || 0;
    if (charCount >= 2 && charCount <= 3) {
      const validChars = seg.characters.filter((c: any) => c.name && c.role && c.motivation);
      if (validChars.length === charCount) {
        segScore += 15;
      } else {
        segScore += 10;
      }
    } else if (charCount >= 1) {
      segScore += 5;
    }

    // Plot structure quality (10 points)
    if (seg.plot?.problem && seg.plot?.conflict && seg.plot?.solution) {
      segScore += 10;
    } else if (seg.plot?.problem || seg.plot?.conflict) {
      segScore += 5;
    }

    // Story arc quality (15 points)
    if (seg.storyArc?.exposition && Array.isArray(seg.storyArc?.risingAction) &&
        seg.storyArc.risingAction.length >= 2 && seg.storyArc?.climax &&
        seg.storyArc?.fallingAction && seg.storyArc?.resolution) {
      segScore += 15;
    } else if (seg.storyArc?.climax || seg.storyArc?.resolution) {
      segScore += 8;
    }

    // Emotional journey quality (10 points)
    const ejCount = seg.emotionalJourney?.length || 0;
    if (ejCount >= 3 && ejCount <= 4) {
      const validEj = seg.emotionalJourney.filter((ej: any) =>
        typeof ej.timestamp === 'number' && ej.emotion && typeof ej.intensity === 'number'
      );
      if (validEj.length === ejCount) {
        segScore += 10;
      } else {
        segScore += 5;
      }
    } else if (ejCount >= 2) {
      segScore += 5;
    }

    // Moral and application quality (5 points)
    if (seg.moral && seg.realWorldApplication) {
      segScore += 5;
    } else if (seg.moral || seg.realWorldApplication) {
      segScore += 3;
    }

    storyScore += segScore;
    validSegments++;
  });

  // Average story score across segments
  if (validSegments > 0) {
    score += (storyScore / validSegments);
  }

  return Math.min(Math.round(score), maxScore);
}
// ============================================================================
// SOCRATIC METHOD IMPLEMENTATION
// ============================================================================

/**
 * Generate Socratic Method Note
 *
 * Core Socratic principles:
 * 1. Guided Inquiry (guiding questions to lead thinking)
 * 2. Question Types (clarification, assumption, evidence, perspective, implication)
 * 3. Question Depth (1-5 levels from surface to deep)
 * 4. Thought Process (reasoning steps)
 * 5. Counter-Arguments (critical thinking)
 * 6. Question Ladder (progressive questioning with expected thought and follow-up)
 */
async function generateSocraticNote(request: GenerateNoteRequest): Promise<SocraticNote> {
  const prompt = buildSocraticPrompt(request);
  const responseText = await callGemini(prompt, request.apiKey);
  return parseSocraticResponse(responseText, request);
}

/**
 * Build Socratic prompt with clear JSON structure for frontend visualization
 */
function buildSocraticPrompt(request: GenerateNoteRequest): string {
  const { title, transcript, ageGroup, duration } = request;

  return `You are an expert educator using the Socratic Method to guide learners through critical thinking and self-discovery.

**Socratic Method Core Principles:**
1. **Guided Inquiry**: Use questions to guide learners to discover insights themselves
2. **Question Types**:
   - clarification: Questions that clarify understanding
   - assumption: Questions that examine underlying assumptions
   - evidence: Questions about proof and data
   - perspective: Questions exploring different viewpoints
   - implication: Questions about consequences and applications
3. **Question Depth**: Progressive levels from surface (1) to deep (5)
4. **Thought Process**: Step-by-step reasoning journey
5. **Counter-Arguments**: Critical examination of ideas
6. **Question Ladder**: Scaffolded questions building on each other

**Video Information:**
- Title: ${title}
- Duration: ${Math.floor(duration / 60)} minutes
- Age Group: ${ageGroup}

**Video Transcript:**
${transcript}

**Your Task:**
Create a Socratic Method learning note with this structure:

1. **Full Summary** (2-3 sentences): Overall synthesis of the video content

2. **Time Segments** (4-6 segments, each 2-3 minutes):
   For each segment, provide:

   a) **Guiding Questions** (3-5 questions):
      - question: The Socratic question
      - type: clarification | assumption | evidence | perspective | implication
      - depth: 1 (surface) ~ 5 (deep)

   b) **Thought Process** (3-5 reasoning steps):
      - Array of thinking steps that emerge from the questions

   c) **Counter-Arguments** (2-3 counter-arguments):
      - Critical examination and alternative perspectives

   d) **Final Insight**:
      - The insight reached through the questioning process

   e) **Question Ladder** (3-4 progressive questions):
      - level: Question depth level (1-5)
      - question: The progressive question
      - expectedThought: Expected thinking direction
      - followUp: Follow-up question to deepen inquiry

**Output Format (JSON):**
\`\`\`json
{
  "method": "Socratic Method",
  "ageGroup": "${ageGroup}",
  "fullSummary": "Overall synthesis of video content in 2-3 sentences...",
  "videoMetadata": {
    "videoId": "${request.videoId}",
    "title": "${title}",
    "duration": ${duration},
    "language": "${request.language}"
  },
  "segments": [
    {
      "start": 0,
      "end": 180,
      "title": "Segment title as inquiry topic",
      "summary": "Brief segment overview",
      "guidingQuestions": [
        {
          "question": "What is the core concept being presented here?",
          "type": "clarification",
          "depth": 1
        },
        {
          "question": "What assumptions underlie this approach?",
          "type": "assumption",
          "depth": 3
        },
        {
          "question": "What evidence supports this claim?",
          "type": "evidence",
          "depth": 2
        }
      ],
      "thoughtProcess": [
        "First step: Identify the main claim",
        "Second step: Examine the reasoning",
        "Third step: Consider the implications"
      ],
      "counterArguments": [
        "Alternative perspective: What if we consider...",
        "Potential objection: However, one might argue..."
      ],
      "finalInsight": "The key insight reached through this inquiry",
      "questionLadder": [
        {
          "level": 1,
          "question": "Surface level question",
          "expectedThought": "Initial understanding",
          "followUp": "What does this tell us?"
        },
        {
          "level": 3,
          "question": "Deeper question",
          "expectedThought": "Critical examination",
          "followUp": "How does this connect to broader ideas?"
        },
        {
          "level": 5,
          "question": "Deep philosophical question",
          "expectedThought": "Fundamental understanding",
          "followUp": "What are the ultimate implications?"
        }
      ]
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}
\`\`\`

**Critical Requirements for Frontend Visualization:**
- Segments must cover entire video (0 to ${duration} seconds)
- Each segment: 2-3 minutes (120-180 seconds)
- Guiding Questions: 3-5 questions with varied types and depths
- Thought Process: 3-5 clear reasoning steps
- Counter-Arguments: 2-3 alternative perspectives
- Question Ladder: 3-4 progressive questions (increasing depth levels)
- All content must be accurate to the transcript
- Use age-appropriate language for ${ageGroup} level
- **Clean JSON structure** for easy frontend parsing and visualization

Generate the JSON now:`;
}

/**
 * Parse Socratic response from Gemini API with thorough validation
 */
function parseSocraticResponse(responseText: string, request: GenerateNoteRequest): SocraticNote {
  try {
    // Extract JSON from markdown code block
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    let jsonText = jsonMatch[1].trim();

    // Smart JSON parsing with repair logic (same proven pattern)
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (firstError) {
      console.warn('[Socratic Parse Warning] Initial parse failed, attempting JSON repair...');

      // Try adding missing closing braces if JSON is incomplete
      if (!jsonText.trim().endsWith('}')) {
        jsonText = jsonText.trim() + '\n  ]\n}';
        console.log('[Socratic Parse Debug] Added missing closing braces');
      }

      // Fix common AI JSON issues
      jsonText = jsonText
        .replace(/"\s*}\s*\n\s*{/g, '"},\n    {')  // Missing commas between objects
        .replace(/"\s*}\s*\]/g, '"}\n  ]');         // Missing closing array

      try {
        parsed = JSON.parse(jsonText);
        console.log('[Socratic Parse Success] JSON repaired and parsed successfully');
      } catch (secondError) {
        console.error('[Socratic Parse Error] JSON repair failed:', secondError);
        throw new Error(`Failed to parse AI response: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
      }
    }

    // Build SocraticNote with type safety and frontend-optimized structure
    const note: SocraticNote = {
      method: "Socratic Method",
      ageGroup: request.ageGroup,
      fullSummary: parsed.fullSummary || '',
      videoMetadata: parsed.videoMetadata || {
        videoId: request.videoId,
        title: request.title,
        duration: request.duration,
        language: request.language
      },
      segments: (parsed.segments || []).map((seg: any) => ({
        start: seg.start || 0,
        end: seg.end || 0,
        title: seg.title || '',
        summary: seg.summary || '',
        guidingQuestions: (seg.guidingQuestions || []).map((gq: any) => ({
          question: gq.question || '',
          type: gq.type || 'clarification',
          depth: typeof gq.depth === 'number' ? gq.depth : 1
        })),
        thoughtProcess: Array.isArray(seg.thoughtProcess) ? seg.thoughtProcess : [],
        counterArguments: Array.isArray(seg.counterArguments) ? seg.counterArguments : [],
        finalInsight: seg.finalInsight || '',
        questionLadder: (seg.questionLadder || []).map((ql: any) => ({
          level: typeof ql.level === 'number' ? ql.level : 1,
          question: ql.question || '',
          expectedThought: ql.expectedThought || '',
          followUp: ql.followUp || ''
        }))
      })) || [],
      generatedAt: new Date(),
      qualityScore: calculateSocraticQualityScore(parsed)
    };

    // Validate segment coverage
    validateSegmentCoverage(note.segments, request.duration);

    return note;

  } catch (error) {
    console.error('Error parsing Socratic response:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate quality score for Socratic notes
 */
function calculateSocraticQualityScore(parsed: any): number {
  let score = 0;
  const maxScore = 100;

  // Check summary quality (10 points)
  if (parsed.fullSummary && parsed.fullSummary.length >= 30) {
    score += 10;
  }

  // Check segment count (20 points)
  const segmentCount = parsed.segments?.length || 0;
  if (segmentCount >= 4 && segmentCount <= 6) {
    score += 20;
  } else if (segmentCount >= 3) {
    score += 10;
  }

  // Check Socratic-specific fields (70 points total)
  const segments = parsed.segments || [];
  let socraticScore = 0;
  let validSegments = 0;

  segments.forEach((seg: any) => {
    let segScore = 0;

    // Guiding questions quality (20 points)
    const gqCount = seg.guidingQuestions?.length || 0;
    if (gqCount >= 3 && gqCount <= 5) {
      const validGq = seg.guidingQuestions.filter((gq: any) =>
        gq.question && gq.type && typeof gq.depth === 'number'
      );
      if (validGq.length === gqCount) {
        segScore += 20;

        // Bonus for question type variety (5 points)
        const types = new Set(validGq.map((gq: any) => gq.type));
        if (types.size >= 3) {
          segScore += 5;
        }
      } else {
        segScore += 10;
      }
    } else if (gqCount >= 2) {
      segScore += 10;
    }

    // Thought process quality (15 points)
    const tpCount = seg.thoughtProcess?.length || 0;
    if (tpCount >= 3 && tpCount <= 5) {
      segScore += 15;
    } else if (tpCount >= 2) {
      segScore += 8;
    }

    // Counter-arguments quality (10 points)
    const caCount = seg.counterArguments?.length || 0;
    if (caCount >= 2 && caCount <= 3) {
      segScore += 10;
    } else if (caCount >= 1) {
      segScore += 5;
    }

    // Final insight quality (10 points)
    if (seg.finalInsight && seg.finalInsight.length >= 20) {
      segScore += 10;
    } else if (seg.finalInsight && seg.finalInsight.length >= 10) {
      segScore += 5;
    }

    // Question ladder quality (15 points)
    const qlCount = seg.questionLadder?.length || 0;
    if (qlCount >= 3 && qlCount <= 4) {
      const validQl = seg.questionLadder.filter((ql: any) =>
        typeof ql.level === 'number' && ql.question && ql.expectedThought && ql.followUp
      );
      if (validQl.length === qlCount) {
        segScore += 15;

        // Bonus for progressive depth (5 points)
        const levels = validQl.map((ql: any) => ql.level).sort((a: number, b: number) => a - b);
        const isProgressive = levels.every((level: number, i: number) =>
          i === 0 || level >= levels[i - 1]
        );
        if (isProgressive) {
          segScore += 5;
        }
      } else {
        segScore += 8;
      }
    } else if (qlCount >= 2) {
      segScore += 8;
    }

    socraticScore += segScore;
    validSegments++;
  });

  // Average socratic score across segments
  if (validSegments > 0) {
    score += (socraticScore / validSegments);
  }

  return Math.min(Math.round(score), maxScore);
}
// ============================================================================
// EXPERT ANALYSIS IMPLEMENTATION
// ============================================================================

/**
 * Generate Expert Analysis Note
 *
 * Expert Analysis applies professional domain expertise to educational content,
 * providing specialized insights, technical analysis, and professional recommendations.
 *
 * 10 Expert Domains:
 * - economy: Economic/financial analysis
 * - technology: Technical/IT expertise
 * - science: Scientific principles and research
 * - business: Business strategy and management
 * - education: Pedagogical approaches and learning theory
 * - law: Legal frameworks and compliance
 * - medicine: Clinical and health implications
 * - politics: Geopolitical context and policy analysis
 * - psychology: Behavioral insights and cognitive processes
 * - history: Historical context and comparative analysis
 */
async function generateExpertAnalysisNote(request: GenerateNoteRequest): Promise<ExpertAnalysisNote> {
  const prompt = buildExpertAnalysisPrompt(request);
  const responseText = await callGemini(prompt, request.apiKey);
  return parseExpertAnalysisResponse(responseText, request);
}

/**
 * Build Expert Analysis prompt with domain-specific guidance
 */
function buildExpertAnalysisPrompt(request: GenerateNoteRequest): string {
  const { title, transcript, ageGroup, duration } = request;

  return `You are a recognized expert providing professional analysis of educational content.

**Expert Analysis Core Principles:**
1. **Professional Expertise**: Apply specialized domain knowledge and professional standards
2. **Technical Rigor**: Use precise terminology and evidence-based analysis
3. **Contextual Understanding**: Consider broader implications and background
4. **Practical Applications**: Provide actionable recommendations and insights
5. **Credibility Assessment**: Evaluate source reliability and evidence quality

**Content to Analyze:**
- Title: ${title}
- Duration: ${Math.floor(duration / 60)} minutes
- Target Audience: ${ageGroup}

**Transcript:**
${transcript}

**Your Task:**
Analyze this content as a domain expert and create an Expert Analysis note.

**Step 1: Identify the Primary Expert Domain**
Choose the MOST relevant domain for this content:
- economy: Economic/financial topics, market analysis, investment
- technology: Technical concepts, IT systems, software/hardware
- science: Scientific principles, research, natural phenomena
- business: Business strategy, management, entrepreneurship
- education: Teaching methods, learning theory, curriculum
- law: Legal frameworks, regulations, compliance
- medicine: Health, clinical practice, medical research
- politics: Governance, policy, international relations
- psychology: Mental processes, behavior, therapy
- history: Historical events, comparative analysis, cultural context

**Step 2: Create Structured Analysis**
For each time segment (4-6 segments, 2-3 minutes each):

1. **Professional Insight**: Expert perspective on the content
2. **Technical Analysis**: Detailed examination using professional knowledge
3. **Contextual Background**: Relevant context and background information

4. **Domain-Specific Analysis** (based on chosen domain):
   - For economy: marketImplication, economicIndicators, investmentPerspective
   - For technology: technicalArchitecture, implementationChallenges, futureImplications
   - For science: scientificPrinciples, researchImplications, experimentalEvidence
   - For business: strategicAnalysis, marketPosition, competitiveAdvantage
   - For education: pedagogicalApproach, learningObjectives, assessmentStrategy
   - For law: legalFramework, precedentAnalysis, complianceRequirements
   - For medicine: clinicalSignificance, healthImplications, evidenceQuality
   - For politics: geopoliticalContext, policyImplications, stakeholderAnalysis
   - For psychology: behavioralInsights, cognitiveProcesses, therapeuticApplications
   - For history: historicalContext, comparativeAnalysis, longTermSignificance

5. **Professional Terminology** (2-4 key terms):
   - term: The professional term
   - definition: Clear definition
   - context: How it applies to this content

6. **Expert Recommendations**:
   - actionItems: 2-3 practical steps (array of strings)
   - furtherStudy: 2-3 recommended resources (array of strings)
   - criticalQuestions: 2-3 questions for deeper understanding (array of strings)

7. **Credibility Assessment**:
   - sourceReliability: "high" | "medium" | "low"
   - evidenceQuality: "strong" | "moderate" | "weak"
   - expertConsensus: true | false

**Output Format (JSON):**
\`\`\`json
{
  "method": "Expert Analysis",
  "ageGroup": "${ageGroup}",
  "expertDomain": "[chosen domain from the 10 options]",
  "fullSummary": "Professional overview of content in 2-3 sentences",
  "videoMetadata": {
    "videoId": "${request.videoId}",
    "title": "${title}",
    "duration": ${duration},
    "language": "${request.language}"
  },
  "segments": [
    {
      "start": 0,
      "end": 180,
      "title": "Professional segment title",
      "summary": "Brief professional overview",
      "professionalInsight": "Expert perspective on this segment",
      "technicalAnalysis": "Detailed technical/professional analysis",
      "contextualBackground": "Relevant context and background",
      "domainSpecificFields": {
        "[domain-specific field 1]": "Analysis specific to the chosen domain",
        "[domain-specific field 2]": ["Array if applicable"],
        "[domain-specific field 3]": "Additional domain analysis"
      },
      "keyTerminology": [
        {
          "term": "Professional term 1",
          "definition": "Clear definition",
          "context": "How it applies here"
        },
        {
          "term": "Professional term 2",
          "definition": "Clear definition",
          "context": "How it applies here"
        }
      ],
      "expertRecommendations": {
        "actionItems": [
          "Practical step 1",
          "Practical step 2",
          "Practical step 3"
        ],
        "furtherStudy": [
          "Resource or topic 1",
          "Resource or topic 2"
        ],
        "criticalQuestions": [
          "Deep question 1",
          "Deep question 2"
        ]
      },
      "credibility": {
        "sourceReliability": "high",
        "evidenceQuality": "strong",
        "expertConsensus": true
      }
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}
\`\`\`

**Domain-Specific Field Examples:**

For **economy** domain:
\`\`\`json
"domainSpecificFields": {
  "marketImplication": "How this affects markets",
  "economicIndicators": ["GDP impact", "inflation effects"],
  "investmentPerspective": "Investment implications"
}
\`\`\`

For **technology** domain:
\`\`\`json
"domainSpecificFields": {
  "technicalArchitecture": "System architecture analysis",
  "implementationChallenges": ["Challenge 1", "Challenge 2"],
  "futureImplications": "Technology trajectory"
}
\`\`\`

For **science** domain:
\`\`\`json
"domainSpecificFields": {
  "scientificPrinciples": ["Principle 1", "Principle 2"],
  "researchImplications": "Research significance",
  "experimentalEvidence": "Evidence quality"
}
\`\`\`

For **business** domain:
\`\`\`json
"domainSpecificFields": {
  "strategicAnalysis": "Strategic positioning",
  "marketPosition": "Market dynamics",
  "competitiveAdvantage": "Competitive strengths"
}
\`\`\`

For **education** domain:
\`\`\`json
"domainSpecificFields": {
  "pedagogicalApproach": "Teaching methodology",
  "learningObjectives": ["Objective 1", "Objective 2"],
  "assessmentStrategy": "Evaluation methods"
}
\`\`\`

For **law** domain:
\`\`\`json
"domainSpecificFields": {
  "legalFramework": "Legal structure",
  "precedentAnalysis": "Case law relevance",
  "complianceRequirements": ["Requirement 1", "Requirement 2"]
}
\`\`\`

For **medicine** domain:
\`\`\`json
"domainSpecificFields": {
  "clinicalSignificance": "Clinical importance",
  "healthImplications": ["Implication 1", "Implication 2"],
  "evidenceQuality": "Evidence strength"
}
\`\`\`

For **politics** domain:
\`\`\`json
"domainSpecificFields": {
  "geopoliticalContext": "Global political context",
  "policyImplications": ["Policy impact 1", "Policy impact 2"],
  "stakeholderAnalysis": "Key stakeholders"
}
\`\`\`

For **psychology** domain:
\`\`\`json
"domainSpecificFields": {
  "behavioralInsights": ["Insight 1", "Insight 2"],
  "cognitiveProcesses": "Mental mechanisms",
  "therapeuticApplications": "Therapeutic use"
}
\`\`\`

For **history** domain:
\`\`\`json
"domainSpecificFields": {
  "historicalContext": "Historical background",
  "comparativeAnalysis": "Historical comparisons",
  "longTermSignificance": "Historical importance"
}
\`\`\`

**Critical Requirements:**
- Segments must cover entire video (0 to ${duration} seconds)
- Each segment: 2-3 minutes (120-180 seconds)
- Choose ONE primary expertDomain that best fits the content
- Include 3-5 domain-specific fields appropriate to chosen domain
- Professional Insight: 2-3 sentences of expert perspective
- Technical Analysis: Detailed analysis using professional knowledge
- Key Terminology: 2-4 professional terms with definitions
- Expert Recommendations: actionItems (2-3), furtherStudy (2-3), criticalQuestions (2-3)
- Credibility Assessment: Evaluate source and evidence quality
- Use age-appropriate language for ${ageGroup} level
- **Clean JSON structure** for easy frontend parsing

Generate the Expert Analysis JSON now:`;
}

/**
 * Parse Expert Analysis response from Gemini API
 */
function parseExpertAnalysisResponse(responseText: string, request: GenerateNoteRequest): ExpertAnalysisNote {
  try {
    // Extract JSON from markdown code block
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    let jsonText = jsonMatch[1].trim();

    // Smart JSON parsing with repair logic
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (firstError) {
      console.warn('[Expert Analysis Parse Warning] Initial parse failed, attempting JSON repair...');

      // Try adding missing closing braces if JSON is incomplete
      if (!jsonText.trim().endsWith('}')) {
        jsonText = jsonText.trim() + '\n  ]\n}';
        console.log('[Expert Analysis Parse Debug] Added missing closing braces');
      }

      // Fix common AI JSON issues
      jsonText = jsonText
        .replace(/"\s*}\s*\n\s*{/g, '"},\n    {')  // Missing commas between objects
        .replace(/"\s*}\s*\]/g, '"}\n  ]');         // Missing closing array

      try {
        parsed = JSON.parse(jsonText);
        console.log('[Expert Analysis Parse Success] JSON repaired and parsed successfully');
      } catch (secondError) {
        console.error('[Expert Analysis Parse Error] JSON repair failed:', secondError);
        throw new Error(`Failed to parse AI response: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
      }
    }

    // Build ExpertAnalysisNote with type safety
    const note: ExpertAnalysisNote = {
      method: "Expert Analysis",
      ageGroup: request.ageGroup,
      expertDomain: parsed.expertDomain || 'technology',
      fullSummary: parsed.fullSummary || '',
      videoMetadata: parsed.videoMetadata || {
        videoId: request.videoId,
        title: request.title,
        duration: request.duration,
        language: request.language
      },
      segments: (parsed.segments || []).map((seg: any) => ({
        start: seg.start || 0,
        end: seg.end || 0,
        title: seg.title || '',
        summary: seg.summary || '',
        professionalInsight: seg.professionalInsight || '',
        technicalAnalysis: seg.technicalAnalysis || '',
        contextualBackground: seg.contextualBackground || '',
        domainSpecificFields: seg.domainSpecificFields || {},
        keyTerminology: (seg.keyTerminology || []).map((kt: any) => ({
          term: kt.term || '',
          definition: kt.definition || '',
          context: kt.context || ''
        })),
        expertRecommendations: {
          actionItems: Array.isArray(seg.expertRecommendations?.actionItems)
            ? seg.expertRecommendations.actionItems
            : [],
          furtherStudy: Array.isArray(seg.expertRecommendations?.furtherStudy)
            ? seg.expertRecommendations.furtherStudy
            : [],
          criticalQuestions: Array.isArray(seg.expertRecommendations?.criticalQuestions)
            ? seg.expertRecommendations.criticalQuestions
            : []
        },
        credibility: {
          sourceReliability: seg.credibility?.sourceReliability || 'medium',
          evidenceQuality: seg.credibility?.evidenceQuality || 'moderate',
          expertConsensus: seg.credibility?.expertConsensus || false
        }
      })) || [],
      generatedAt: new Date(),
      qualityScore: calculateExpertAnalysisQualityScore(parsed)
    };

    // Validate segment coverage
    validateSegmentCoverage(note.segments, request.duration);

    return note;

  } catch (error) {
    console.error('Error parsing Expert Analysis response:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate quality score for Expert Analysis notes
 */
function calculateExpertAnalysisQualityScore(parsed: any): number {
  let score = 0;
  const maxScore = 100;

  // Check summary quality (10 points)
  if (parsed.fullSummary && parsed.fullSummary.length >= 30) {
    score += 10;
  }

  // Check expert domain validity (10 points)
  const validDomains = ['economy', 'technology', 'science', 'business', 'education',
                        'law', 'medicine', 'politics', 'psychology', 'history'];
  if (validDomains.includes(parsed.expertDomain)) {
    score += 10;
  }

  // Check segment count (20 points)
  const segmentCount = parsed.segments?.length || 0;
  if (segmentCount >= 4 && segmentCount <= 6) {
    score += 20;
  } else if (segmentCount >= 3) {
    score += 10;
  }

  // Check Expert Analysis-specific fields (60 points total)
  const segments = parsed.segments || [];
  let expertScore = 0;
  let validSegments = 0;

  segments.forEach((seg: any) => {
    let segScore = 0;

    // Professional insight quality (10 points)
    if (seg.professionalInsight && seg.professionalInsight.length >= 50) {
      segScore += 10;
    } else if (seg.professionalInsight && seg.professionalInsight.length >= 20) {
      segScore += 5;
    }

    // Technical analysis quality (10 points)
    if (seg.technicalAnalysis && seg.technicalAnalysis.length >= 50) {
      segScore += 10;
    } else if (seg.technicalAnalysis && seg.technicalAnalysis.length >= 20) {
      segScore += 5;
    }

    // Contextual background quality (5 points)
    if (seg.contextualBackground && seg.contextualBackground.length >= 30) {
      segScore += 5;
    } else if (seg.contextualBackground && seg.contextualBackground.length >= 10) {
      segScore += 3;
    }

    // Domain-specific fields quality (10 points)
    if (seg.domainSpecificFields && Object.keys(seg.domainSpecificFields).length >= 3) {
      segScore += 10;
    } else if (seg.domainSpecificFields && Object.keys(seg.domainSpecificFields).length >= 2) {
      segScore += 5;
    }

    // Key terminology quality (10 points)
    const ktCount = seg.keyTerminology?.length || 0;
    if (ktCount >= 2 && ktCount <= 4) {
      const validKt = seg.keyTerminology.filter((kt: any) =>
        kt.term && kt.definition && kt.context
      );
      if (validKt.length === ktCount) {
        segScore += 10;
      } else {
        segScore += 5;
      }
    } else if (ktCount >= 1) {
      segScore += 3;
    }

    // Expert recommendations quality (10 points)
    const recommendations = seg.expertRecommendations || {};
    const actionCount = recommendations.actionItems?.length || 0;
    const studyCount = recommendations.furtherStudy?.length || 0;
    const questionCount = recommendations.criticalQuestions?.length || 0;

    if (actionCount >= 2 && studyCount >= 2 && questionCount >= 2) {
      segScore += 10;
    } else if (actionCount >= 1 && studyCount >= 1 && questionCount >= 1) {
      segScore += 5;
    }

    // Credibility assessment quality (5 points)
    if (seg.credibility &&
        seg.credibility.sourceReliability &&
        seg.credibility.evidenceQuality &&
        typeof seg.credibility.expertConsensus === 'boolean') {
      segScore += 5;
    } else if (seg.credibility) {
      segScore += 3;
    }

    expertScore += segScore;
    validSegments++;
  });

  // Average expert score across segments
  if (validSegments > 0) {
    score += (expertScore / validSegments);
  }

  return Math.min(Math.round(score), maxScore);
}
// ============================================================================
// MIND MAP IMPLEMENTATION
// ============================================================================

/**
 * Generate Mind Map Note
 *
 * Mind Map creates a hierarchical visual structure of concepts and their relationships,
 * optimizing for visual learning and memory retention through spatial organization.
 *
 * Core Mind Map Principles:
 * - Central Concept: Main topic at the center
 * - Hierarchical Branches: Main branches → sub-branches → details
 * - Visual Elements: Colors, icons, spatial relationships
 * - Connection Types: Hierarchical, associative, causal
 * - Memory Optimization: Chunking, visual cues, spatial memory
 */
async function generateMindMapNote(request: GenerateNoteRequest): Promise<MindMapNote> {
  const prompt = buildMindMapPrompt(request);
  const responseText = await callGemini(prompt, request.apiKey);
  return parseMindMapResponse(responseText, request);
}

/**
 * Build Mind Map prompt with hierarchical structure guidance
 */
function buildMindMapPrompt(request: GenerateNoteRequest): string {
  const { title, transcript, ageGroup, duration } = request;

  return `You are an expert in visual learning and mind mapping, creating hierarchical knowledge structures that optimize memory and understanding.

**Mind Map Core Principles:**
1. **Central Concept**: Single main topic at the center of the map
2. **Hierarchical Organization**: Main branches (3-7) → sub-branches → details
3. **Visual Clarity**: Each node has clear label, color code, and icon
4. **Meaningful Connections**: Relationships between concepts (hierarchical, associative, causal)
5. **Memory Optimization**: Chunking information, visual cues, spatial organization

**Content to Map:**
- Title: ${title}
- Duration: ${Math.floor(duration / 60)} minutes
- Target Audience: ${ageGroup}

**Transcript:**
${transcript}

**Your Task:**
Create a comprehensive Mind Map structure from this content.

**Step 1: Identify the Central Concept**
What is the single main topic that encompasses all content?
- Should be concise (1-5 words)
- Captures the essence of the entire content

**Step 2: Create Main Branches (3-7 branches)**
What are the major themes or categories in the content?
Each main branch should:
- Represent a distinct major theme
- Have a clear, descriptive label (2-4 words)
- Have an assigned color (for visual distinction)
- Have an icon/emoji (for visual memory)
- Include a brief description (1-2 sentences)

**Step 3: Develop Sub-Branches**
For each main branch, create 2-5 sub-branches:
- More specific concepts under each main branch
- Clear hierarchical relationship to parent
- Assigned color (can inherit or vary from parent)
- Icon/emoji for visual cue
- Brief description

**Step 4: Add Detail Nodes**
For important sub-branches, add specific details:
- Examples, facts, statistics, quotes
- Keep concise (1-2 sentences each)
- Support the parent concept

**Step 5: Define Connections**
Identify non-hierarchical relationships:
- **associative**: Related concepts across different branches
- **causal**: Cause-and-effect relationships
- **sequential**: Temporal or process flow relationships
- Each connection needs: fromNode, toNode, type, label

**Step 6: Provide Learning Insights**
- **Key Concepts**: 3-5 most important concepts to remember
- **Memory Hooks**: Visual or mnemonic cues for retention
- **Practical Application**: How to use this knowledge
- **Review Suggestions**: How to review this mind map effectively

**Output Format (JSON):**
\`\`\`json
{
  "method": "Mind Map",
  "ageGroup": "${ageGroup}",
  "centralConcept": {
    "label": "Main Topic",
    "color": "#4A90E2",
    "icon": "🎯",
    "description": "Brief description of central concept"
  },
  "mainBranches": [
    {
      "id": "branch-1",
      "label": "Main Branch Label",
      "color": "#E94B3C",
      "icon": "🔥",
      "description": "What this branch covers",
      "subBranches": [
        {
          "id": "branch-1-sub-1",
          "label": "Sub-branch Label",
          "color": "#E94B3C",
          "icon": "📌",
          "description": "Sub-branch description",
          "details": [
            "Specific detail or example 1",
            "Specific detail or example 2"
          ]
        },
        {
          "id": "branch-1-sub-2",
          "label": "Another Sub-branch",
          "color": "#E94B3C",
          "icon": "💡",
          "description": "Sub-branch description",
          "details": [
            "Detail 1",
            "Detail 2"
          ]
        }
      ]
    },
    {
      "id": "branch-2",
      "label": "Second Main Branch",
      "color": "#50C878",
      "icon": "🌱",
      "description": "What this branch covers",
      "subBranches": [
        {
          "id": "branch-2-sub-1",
          "label": "Sub-branch",
          "color": "#50C878",
          "icon": "🔬",
          "description": "Description",
          "details": ["Detail 1", "Detail 2"]
        }
      ]
    }
  ],
  "connections": [
    {
      "fromNode": "branch-1-sub-1",
      "toNode": "branch-2-sub-1",
      "type": "associative",
      "label": "Related because..."
    },
    {
      "fromNode": "branch-1-sub-2",
      "toNode": "branch-2-sub-1",
      "type": "causal",
      "label": "Leads to..."
    }
  ],
  "learningInsights": {
    "keyConcepts": [
      "Most important concept 1",
      "Most important concept 2",
      "Most important concept 3"
    ],
    "memoryHooks": [
      "Visual cue: Use the color red to remember...",
      "Mnemonic: First letters spell...",
      "Spatial cue: Items on the left side represent..."
    ],
    "practicalApplication": "How to apply this knowledge in real situations...",
    "reviewSuggestion": "Best way to review this mind map for retention..."
  },
  "videoMetadata": {
    "videoId": "${request.videoId}",
    "title": "${title}",
    "duration": ${duration},
    "language": "${request.language}"
  },
  "fullSummary": "Overall synthesis of the mind map in 2-3 sentences",
  "generatedAt": "${new Date().toISOString()}"
}
\`\`\`

**Visual Design Guidelines:**
- **Color Palette**: Use distinct colors for each main branch
  - Red (#E94B3C): Important, urgent, warning
  - Blue (#4A90E2): Information, calm, trust
  - Green (#50C878): Growth, nature, health
  - Yellow (#FFD700): Energy, attention, optimism
  - Purple (#9B59B6): Creativity, wisdom, luxury
  - Orange (#FF8C42): Enthusiasm, action, warmth
  - Teal (#20B2AA): Balance, clarity, refresh

- **Icon Selection**: Choose emojis that represent the concept
  - 🎯 Goals, targets, focus
  - 🔥 Important, trending, hot topic
  - 💡 Ideas, insights, innovation
  - 📚 Knowledge, learning, education
  - 🔬 Science, research, analysis
  - 🌱 Growth, development, beginning
  - ⚡ Energy, speed, power
  - 🎨 Creativity, design, art

**Critical Requirements:**
- Central concept must be clear and concise (1-5 words)
- 3-7 main branches (not too few, not too many)
- Each main branch has 2-5 sub-branches
- Details are concise but informative
- Connections show meaningful relationships beyond hierarchy
- Learning insights provide practical memory and review guidance
- Use age-appropriate language for ${ageGroup} level
- **Clean JSON structure** for easy frontend visualization

Generate the Mind Map JSON now:`;
}

/**
 * Parse Mind Map response from Gemini API
 */
function parseMindMapResponse(responseText: string, request: GenerateNoteRequest): MindMapNote {
  try {
    // Extract JSON from markdown code block
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    let jsonText = jsonMatch[1].trim();

    // Smart JSON parsing with repair logic
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (firstError) {
      console.warn('[Mind Map Parse Warning] Initial parse failed, attempting JSON repair...');

      // Try adding missing closing braces if JSON is incomplete
      if (!jsonText.trim().endsWith('}')) {
        jsonText = jsonText.trim() + '\n  ]\n}';
        console.log('[Mind Map Parse Debug] Added missing closing braces');
      }

      // Fix common AI JSON issues
      jsonText = jsonText
        .replace(/"\s*}\s*\n\s*{/g, '"},\n    {')  // Missing commas between objects
        .replace(/"\s*}\s*\]/g, '"}\n  ]');         // Missing closing array

      try {
        parsed = JSON.parse(jsonText);
        console.log('[Mind Map Parse Success] JSON repaired and parsed successfully');
      } catch (secondError) {
        console.error('[Mind Map Parse Error] JSON repair failed:', secondError);
        throw new Error(`Failed to parse AI response: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
      }
    }

    // Build MindMapNote with type safety
    const note: MindMapNote = {
      method: "Mind Map",
      ageGroup: request.ageGroup,
      centralConcept: {
        label: parsed.centralConcept?.label || 'Main Topic',
        color: parsed.centralConcept?.color || '#4A90E2',
        icon: parsed.centralConcept?.icon || '🎯',
        description: parsed.centralConcept?.description || ''
      },
      mainBranches: (parsed.mainBranches || []).map((branch: any) => ({
        id: branch.id || `branch-${Math.random().toString(36).substr(2, 9)}`,
        label: branch.label || '',
        color: branch.color || '#4A90E2',
        icon: branch.icon || '📌',
        description: branch.description || '',
        subBranches: (branch.subBranches || []).map((sub: any) => ({
          id: sub.id || `sub-${Math.random().toString(36).substr(2, 9)}`,
          label: sub.label || '',
          color: sub.color || branch.color || '#4A90E2',
          icon: sub.icon || '💡',
          description: sub.description || '',
          details: Array.isArray(sub.details) ? sub.details : []
        }))
      })),
      connections: (parsed.connections || []).map((conn: any) => ({
        fromNode: conn.fromNode || '',
        toNode: conn.toNode || '',
        type: conn.type || 'associative',
        label: conn.label || ''
      })),
      learningInsights: {
        keyConcepts: Array.isArray(parsed.learningInsights?.keyConcepts)
          ? parsed.learningInsights.keyConcepts
          : [],
        memoryHooks: Array.isArray(parsed.learningInsights?.memoryHooks)
          ? parsed.learningInsights.memoryHooks
          : [],
        practicalApplication: parsed.learningInsights?.practicalApplication || '',
        reviewSuggestion: parsed.learningInsights?.reviewSuggestion || ''
      },
      videoMetadata: parsed.videoMetadata || {
        videoId: request.videoId,
        title: request.title,
        duration: request.duration,
        language: request.language
      },
      fullSummary: parsed.fullSummary || '',
      generatedAt: new Date(),
      qualityScore: calculateMindMapQualityScore(parsed)
    };

    return note;

  } catch (error) {
    console.error('Error parsing Mind Map response:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate quality score for Mind Map notes
 */
function calculateMindMapQualityScore(parsed: any): number {
  let score = 0;
  const maxScore = 100;

  // Check central concept quality (10 points)
  if (parsed.centralConcept?.label && parsed.centralConcept?.description) {
    score += 10;
  } else if (parsed.centralConcept?.label) {
    score += 5;
  }

  // Check main branches count (20 points)
  const branchCount = parsed.mainBranches?.length || 0;
  if (branchCount >= 3 && branchCount <= 7) {
    score += 20;
  } else if (branchCount >= 2) {
    score += 10;
  }

  // Check Mind Map-specific structure (70 points total)
  const branches = parsed.mainBranches || [];
  let structureScore = 0;
  let validBranches = 0;

  branches.forEach((branch: any) => {
    let branchScore = 0;

    // Main branch quality (15 points)
    if (branch.label && branch.description && branch.color && branch.icon) {
      branchScore += 15;
    } else if (branch.label && branch.description) {
      branchScore += 10;
    } else if (branch.label) {
      branchScore += 5;
    }

    // Sub-branches quality (15 points)
    const subCount = branch.subBranches?.length || 0;
    if (subCount >= 2 && subCount <= 5) {
      branchScore += 15;
    } else if (subCount >= 1) {
      branchScore += 8;
    }

    // Sub-branch completeness (10 points)
    const completeSubs = branch.subBranches?.filter((sub: any) =>
      sub.label && sub.description && sub.color && sub.icon
    ).length || 0;
    if (completeSubs === subCount && subCount > 0) {
      branchScore += 10;
    } else if (completeSubs > 0) {
      branchScore += 5;
    }

    // Details quality (10 points)
    const hasDetails = branch.subBranches?.some((sub: any) =>
      Array.isArray(sub.details) && sub.details.length > 0
    );
    if (hasDetails) {
      branchScore += 10;
    }

    structureScore += branchScore;
    validBranches++;
  });

  // Average structure score across branches
  if (validBranches > 0) {
    score += (structureScore / validBranches);
  }

  // Check connections quality (10 points)
  const connCount = parsed.connections?.length || 0;
  if (connCount >= 2) {
    const validConns = parsed.connections?.filter((conn: any) =>
      conn.fromNode && conn.toNode && conn.type && conn.label
    ).length || 0;
    if (validConns === connCount) {
      score += 10;
    } else if (validConns > 0) {
      score += 5;
    }
  }

  // Check learning insights quality (10 points)
  const insights = parsed.learningInsights || {};
  let insightScore = 0;

  if (Array.isArray(insights.keyConcepts) && insights.keyConcepts.length >= 3) {
    insightScore += 3;
  }
  if (Array.isArray(insights.memoryHooks) && insights.memoryHooks.length >= 2) {
    insightScore += 3;
  }
  if (insights.practicalApplication && insights.practicalApplication.length >= 20) {
    insightScore += 2;
  }
  if (insights.reviewSuggestion && insights.reviewSuggestion.length >= 20) {
    insightScore += 2;
  }

  score += insightScore;

  return Math.min(Math.round(score), maxScore);
}
