/**
 * Enhanced YouTube Note Generation Types
 * Specification v2.0 - Method-Specific Structures
 *
 * Each explanation method has a custom interface that reflects
 * its pedagogical principles and learning objectives.
 */

// ============================================================================
// BASE TYPES - Common across all methods
// ============================================================================

/**
 * Base time segment interface with YouTube embed support
 */
export interface TimeSegment {
  start: number;                  // Start time in seconds
  end: number;                    // End time in seconds
  title: string;                  // Segment title
  summary: string;                // Segment summary
}

/**
 * Base note interface - common structure for all methods
 */
export interface BaseNote {
  fullSummary: string;            // Overall 2-3 sentence summary
  method: ExplanationMethod;      // Which method was used
  ageGroup: AgeGroup;             // Target age group
  videoMetadata: {
    videoId: string;
    title: string;
    duration: number;             // Total video length in seconds
    language: 'ko' | 'en' | 'other';
  };
  generatedAt: Date;
  qualityScore?: number;          // Overall quality score (0-100)
}

/**
 * Supported explanation methods
 */
export type ExplanationMethod =
  | 'Feynman Technique'
  | "ELI5 (Explain Like I'm 5)"
  | 'Cornell Method'
  | 'Mind Map'
  | 'Socratic Method'
  | 'Analogy'
  | 'Storytelling'
  | 'Expert Analysis'        // 🆕 전문가 분석 노트
  | 'Custom';

/**
 * Expert analysis domains for specialized professional notes
 */
export type ExpertDomain =
  | 'economy'                // 경제/금융 전문가
  | 'technology'             // 기술/IT 전문가
  | 'science'                // 과학 전문가
  | 'business'               // 비즈니스 전략 전문가
  | 'education'              // 교육학 전문가
  | 'law'                    // 법률 전문가
  | 'medicine'               // 의료/건강 전문가
  | 'politics'               // 정치/국제 관계 전문가
  | 'psychology'             // 심리학 전문가
  | 'history';               // 역사 전문가

/**
 * Target age groups for vocabulary adjustment
 */
export type AgeGroup = 'elementary' | 'middle' | 'high' | 'adult';

// ============================================================================
// METHOD-SPECIFIC INTERFACES
// ============================================================================

/**
 * 1. FEYNMAN TECHNIQUE
 * Principle: Simplify → Identify Gaps → Explain → Compress
 */
export interface FeynmanNote extends BaseNote {
  method: 'Feynman Technique';
  segments: FeynmanSegment[];
}

export interface FeynmanSegment extends TimeSegment {
  // Feynman-specific fields
  simplifiedExplanation: string;      // Step 1: Simplest possible explanation
  difficultParts: string[];           // Step 2: Identify difficult concepts
  analogies: string[];                // Step 3: Use analogies to explain
  oneLineSummary: string;             // Step 4: One-sentence core summary

  // Feynman validation metrics
  vocabularyLevel: 'elementary' | 'middle' | 'high';
  simplificationScore: number;        // 1-10, how well simplified
}

/**
 * 2. ELI5 (Explain Like I'm 5)
 * Principle: Familiar analogies + Short sentences + Visual imagery
 */
export interface ELI5Note extends BaseNote {
  method: "ELI5 (Explain Like I'm 5)";
  segments: ELI5Segment[];
}

export interface ELI5Segment extends TimeSegment {
  // ELI5-specific fields
  childFriendlyAnalogy: string;       // "It's like..." comparison
  visualDescription: string;          // Describe visual imagery
  emotionalConnection: string;        // Connect to emotions/experiences
  simpleExplanation: string;          // Simple explanation with short sentences

  // Sentence structure constraints
  maxWordsPerSentence: 10;            // Maximum 10 words per sentence
  emojiUsage: string[];               // List of emojis used for visual aid

  // Fun questions for curiosity
  funQuestions: string[];             // Questions to spark curiosity (2-3)

  // ELI5 validation metrics
  readabilityScore: number;           // Flesch-Kincaid Grade Level
  analogyQuality: 'excellent' | 'good' | 'needs_improvement';
}

/**
 * 3. CORNELL METHOD
 * Principle: Questions → Notes → Summary (3-column structure)
 */
export interface CornellNote extends BaseNote {
  method: 'Cornell Method';
  segments: CornellSegment[];
}

export interface CornellSegment extends TimeSegment {
  // Cornell-specific fields
  cueQuestions: string[];             // Left column: Key questions (3-5)
  detailedNotes: string;              // Right column: Detailed notes
  bottomSummary: string;              // Bottom: One-sentence summary

  // Cornell structure
  questionAnswerPairs: Array<{
    question: string;                 // Question using 5W1H
    answer: string;                   // Concrete answer
    importance: 'high' | 'medium' | 'low';
  }>;

  // Term glossary
  keyTerms: Array<{
    term: string;
    definition: string;
  }>;
}

/**
 * 4. MIND MAP
 * Principle: Center → Branches → Sub-branches (hierarchical structure)
 */
export interface MindMapNote extends BaseNote {
  method: 'Mind Map';
  segments: MindMapSegment[];
  globalMindMap?: MermaidDiagram;     // Integrated mind map for entire video
}

export interface MindMapSegment extends TimeSegment {
  // Mind Map-specific fields
  centralConcept: string;             // Central idea (1)
  mainBranches: MainBranch[];         // Main branches (3-5)
  mermaidCode: string;                // Mermaid diagram code

  // Visual structure
  visualHierarchy: {
    level1: string;                   // Center
    level2: string[];                 // Core concepts
    level3: Record<string, string[]>; // Details
  };

  // Concept relationships
  conceptRelations: Array<{
    from: string;
    to: string;
    relationship: string;             // "causes", "explains", "supports"
  }>;
}

export interface MainBranch {
  concept: string;
  subConcepts: string[];
  colorCode: string;                  // Visual distinction
}

export interface MermaidDiagram {
  code: string;                       // Mermaid syntax
  nodes: number;                      // Number of nodes
  depth: number;                      // Hierarchy depth
}

/**
 * 5. SOCRATIC METHOD
 * Principle: Question → Think → Insight (guided inquiry)
 */
export interface SocraticNote extends BaseNote {
  method: 'Socratic Method';
  segments: SocraticSegment[];
}

export interface SocraticSegment extends TimeSegment {
  // Socratic-specific fields
  guidingQuestions: SocraticQuestion[];  // Sequence of guiding questions
  thoughtProcess: string[];              // Steps in reasoning
  counterArguments: string[];            // Counter-arguments (critical thinking)
  finalInsight: string;                  // Reached insight

  // Question structure
  questionLadder: Array<{
    level: number;                       // Question depth (1-5)
    question: string;
    expectedThought: string;             // Expected thinking direction
    followUp: string;                    // Follow-up question
  }>;
}

export interface SocraticQuestion {
  question: string;
  type: 'clarification' | 'assumption' | 'evidence' | 'perspective' | 'implication';
  depth: number;                         // 1 (surface) ~ 5 (deep)
}

/**
 * 6. ANALOGY
 * Principle: Unfamiliar → Familiar connection
 */
export interface AnalogyNote extends BaseNote {
  method: 'Analogy';
  segments: AnalogySegment[];
}

export interface AnalogySegment extends TimeSegment {
  // Analogy-specific fields
  targetConcept: string;              // Concept to explain
  sourceAnalogy: string;              // Familiar thing to compare to
  mappingExplanation: string;         // How they correspond

  // Analogy structure
  analogyChain: Array<{
    abstract: string;                 // Abstract concept
    concrete: string;                 // Concrete analogy
    correspondence: string[];         // Correspondence points
  }>;

  // Analogy types
  analogyTypes: Array<{
    type: 'object' | 'process' | 'relationship' | 'system';
    example: string;
  }>;

  // Analogy quality metrics
  familiarityScore: number;           // Familiarity (1-10)
  correspondenceAccuracy: number;     // Accuracy (1-10)
}

/**
 * 7. STORYTELLING
 * Principle: Intro → Development → Climax → Resolution
 */
export interface StorytellingNote extends BaseNote {
  method: 'Storytelling';
  segments: StorySegment[];
}

export interface StorySegment extends TimeSegment {
  // Storytelling-specific fields
  narrative: StoryNarrative;
  characters: Character[];
  plot: PlotStructure;

  // Story arc structure (5-act)
  storyArc: {
    exposition: string;              // Introduction
    risingAction: string[];          // Rising action
    climax: string;                  // Climax
    fallingAction: string;           // Falling action
    resolution: string;              // Resolution
  };

  // Emotional journey
  emotionalJourney: Array<{
    timestamp: number;
    emotion: string;
    intensity: number;               // 1-10
  }>;

  // Moral extraction
  moral: string;                     // Story's moral
  realWorldApplication: string;      // Real-world application
}

export interface Character {
  name: string;
  role: 'protagonist' | 'antagonist' | 'mentor' | 'helper';
  motivation: string;
}

export interface PlotStructure {
  problem: string;                   // Problem situation
  conflict: string;                  // Conflict
  solution: string;                  // Solution
}

export interface StoryNarrative {
  setting: string;                   // Setting
  protagonistGoal: string;           // Protagonist's goal
  obstacles: string[];               // Obstacles
  resolution: string;                // How it resolves
}

/**
 * 8. EXPERT ANALYSIS (전문가 분석 노트)
 * Principle: Professional domain expertise applied to content analysis
 */
export interface ExpertAnalysisNote extends BaseNote {
  method: 'Expert Analysis';
  expertDomain: ExpertDomain;       // 전문 분야
  segments: ExpertSegment[];
}

export interface ExpertSegment extends TimeSegment {
  // Expert analysis-specific fields
  professionalInsight: string;      // 전문가 관점의 핵심 인사이트
  technicalAnalysis: string;        // 기술적/전문적 분석
  contextualBackground: string;     // 맥락 및 배경 정보

  // Domain-specific analysis
  domainSpecificFields: {
    // Economy/Finance
    marketImplication?: string;     // 시장 영향 분석
    economicIndicators?: string[];  // 경제 지표 해석
    investmentPerspective?: string; // 투자 관점

    // Technology/IT
    technicalArchitecture?: string; // 기술 아키텍처 분석
    implementationChallenges?: string[]; // 구현 과제
    futureImplications?: string;    // 미래 전망

    // Science
    scientificPrinciples?: string[]; // 과학적 원리
    researchImplications?: string;   // 연구 함의
    experimentalEvidence?: string;   // 실험적 증거

    // Business
    strategicAnalysis?: string;      // 전략적 분석
    marketPosition?: string;         // 시장 포지셔닝
    competitiveAdvantage?: string;   // 경쟁 우위

    // Education
    pedagogicalApproach?: string;    // 교육학적 접근
    learningObjectives?: string[];   // 학습 목표
    assessmentStrategy?: string;     // 평가 전략

    // Law
    legalFramework?: string;         // 법적 프레임워크
    precedentAnalysis?: string;      // 판례 분석
    complianceRequirements?: string[]; // 준수 요건

    // Medicine/Health
    clinicalSignificance?: string;   // 임상적 의의
    healthImplications?: string[];   // 건강 영향
    evidenceQuality?: string;        // 근거 수준

    // Politics/International Relations
    geopoliticalContext?: string;    // 지정학적 맥락
    policyImplications?: string[];   // 정책 함의
    stakeholderAnalysis?: string;    // 이해관계자 분석

    // Psychology
    behavioralInsights?: string[];   // 행동 인사이트
    cognitiveProcesses?: string;     // 인지 과정
    therapeuticApplications?: string; // 치료적 응용

    // History
    historicalContext?: string;      // 역사적 맥락
    comparativeAnalysis?: string;    // 비교 분석
    longTermSignificance?: string;   // 장기적 의의
  };

  // Professional terminology
  keyTerminology: Array<{
    term: string;                    // 전문 용어
    definition: string;              // 정의
    context: string;                 // 사용 맥락
  }>;

  // Expert recommendations
  expertRecommendations: {
    actionItems: string[];           // 실행 항목
    furtherStudy: string[];          // 추가 학습 자료
    criticalQuestions: string[];     // 비판적 질문
  };

  // Credibility indicators
  credibility: {
    sourceReliability: 'high' | 'medium' | 'low';
    evidenceQuality: 'strong' | 'moderate' | 'weak';
    expertConsensus: boolean;        // 전문가 합의 여부
  };
}

/**
 * 9. CUSTOM (프롬프트 직접입력)
 * Principle: User requirements accurately reflected
 */
export interface CustomNote extends BaseNote {
  method: 'Custom';
  segments: CustomSegment[];
  customStructure: Record<string, unknown>; // User-defined structure
  enhancedPrompt?: string;          // 🆕 AI-enhanced prompt
  originalPrompt?: string;          // 🆕 Original user input
}

export interface CustomSegment extends TimeSegment {
  // User-defined fields
  customFields: Record<string, string | string[]>;

  // Prompt interpretation results
  interpretedRequirements: string[];
  appliedStrategy: string;
}

// ============================================================================
// PROMPT ENHANCEMENT SYSTEM (마술봉 기능)
// ============================================================================

/**
 * Prompt enhancement request
 */
export interface PromptEnhancementRequest {
  originalPrompt: string;           // 사용자가 입력한 원본 프롬프트
  videoContext?: {                  // 비디오 컨텍스트 (선택)
    videoId: string;
    title: string;
    duration: number;
    transcript?: string;            // 자막 샘플 (처음 500자)
  };
  enhancementGoal?: EnhancementGoal; // 향상 목표
  targetAudience?: AgeGroup;        // 대상 연령대
}

/**
 * Enhancement goals
 */
export type EnhancementGoal =
  | 'clarity'                       // 명확성 향상
  | 'detail'                        // 상세도 증가
  | 'structure'                     // 구조화 개선
  | 'examples'                      // 예시 추가
  | 'professional'                  // 전문성 강화
  | 'simplified'                    // 단순화
  | 'comprehensive';                // 종합적 분석

/**
 * Prompt enhancement result (마술봉 결과)
 */
export interface PromptEnhancementResult {
  originalPrompt: string;           // 원본 프롬프트
  enhancedPrompt: string;           // 향상된 프롬프트

  // Enhancement analysis
  improvements: {
    addedClarifications: string[];  // 추가된 명확화 요소
    structuralChanges: string[];    // 구조적 변경 사항
    addedRequirements: string[];    // 추가된 요구사항
  };

  // Quality prediction
  qualityPrediction: {
    expectedClarity: number;        // 예상 명확도 (0-100)
    expectedDetail: number;         // 예상 상세도 (0-100)
    expectedUsefulness: number;     // 예상 유용성 (0-100)
  };

  // Suggested method
  suggestedMethod?: ExplanationMethod; // AI가 추천하는 설명 방법
  suggestedReason?: string;         // 추천 이유
}

/**
 * Prompt enhancement strategy
 */
export interface PromptEnhancementStrategy {
  // Analysis of user intent
  userIntent: {
    primaryGoal: string;            // 주요 목표
    secondaryGoals: string[];       // 부차적 목표
    implicitNeeds: string[];        // 암묵적 니즈
  };

  // Enhancement techniques applied
  techniquesApplied: Array<{
    technique: string;              // 적용된 기법
    reason: string;                 // 적용 이유
    example: string;                // 예시
  }>;

  // Before/After comparison
  comparison: {
    originalWordCount: number;
    enhancedWordCount: number;
    addedSpecificity: string[];     // 추가된 구체성
    removedAmbiguity: string[];     // 제거된 모호함
  };
}

// ============================================================================
// QUALITY VALIDATION TYPES
// ============================================================================

/**
 * Pre-generation validation
 */
export interface PreGenerationCheck {
  // Input validation
  transcriptQuality: {
    completeness: number;            // Completeness (0-100%)
    timestampAccuracy: boolean;      // Timestamp accuracy
    languageDetection: 'ko' | 'en' | 'other';
  };

  // Method compatibility
  methodCompatibility: {
    videoLength: number;             // Video length in seconds
    recommendedSegments: number;     // Recommended segment count
    complexityLevel: 'low' | 'medium' | 'high';
  };

  // Resource estimation
  estimatedTokens: number;           // Estimated token usage
  estimatedTime: number;             // Estimated generation time (seconds)
}

/**
 * During-generation monitoring
 */
export interface GenerationMonitoring {
  // Progress
  progress: {
    currentSegment: number;
    totalSegments: number;
    completionPercentage: number;
  };

  // Intermediate quality checks
  intermediateChecks: Array<{
    checkpoint: number;              // Segment number
    methodAdherence: number;         // Method adherence (0-100%)
    outputQuality: number;           // Output quality (0-100%)
  }>;
}

/**
 * Post-generation validation
 */
export interface PostGenerationValidation {
  // Structure validation
  structureValidation: {
    hasAllSegments: boolean;         // All segments present
    timestampCoverage: number;       // Timestamp coverage (%)
    segmentBalance: boolean;         // Segment balance (no too long/short)
  };

  // Content validation
  contentValidation: {
    methodSpecificChecks: MethodCheck[];  // Method-specific validation
    vocabularyLevel: 'appropriate' | 'too_easy' | 'too_hard';
    exampleQuality: number;          // Example quality (0-100%)
  };

  // Learning effectiveness prediction
  learningEffectiveness: {
    comprehensionScore: number;      // Expected comprehension (0-100%)
    retentionScore: number;          // Expected retention (0-100%)
    engagementScore: number;         // Expected engagement (0-100%)
  };
}

export interface MethodCheck {
  method: string;
  criteria: string;                  // Validation criteria
  passed: boolean;
  score: number;                     // Compliance score (0-100%)
  feedback: string;                  // Improvement suggestions
}

// ============================================================================
// SEGMENTATION STRATEGY TYPES
// ============================================================================

/**
 * Segmentation strategy configuration
 */
export interface SegmentationStrategy {
  // Segmentation algorithm
  algorithm: 'semantic' | 'time-based' | 'hybrid';

  // Semantic segmentation (default)
  semanticSegmentation: {
    topicShifts: number[];           // Topic shift points (timestamps)
    coherenceThreshold: number;      // Coherence threshold (0-1)
    minSegmentLength: number;        // Minimum segment length (seconds)
    maxSegmentLength: number;        // Maximum segment length (seconds)
  };

  // Time-based segmentation (auxiliary)
  timeBasedSegmentation: {
    targetDuration: number;          // Target segment length (seconds)
    tolerance: number;               // Tolerance (±seconds)
  };

  // Hybrid segmentation (advanced)
  hybridSegmentation: {
    primaryStrategy: 'semantic' | 'time-based';
    fallbackStrategy: 'semantic' | 'time-based';
    maxSegments: 10;                 // Maximum segment count
  };
}

// ============================================================================
// USER EXPERIENCE TYPES
// ============================================================================

/**
 * Note preview before generation
 */
export interface NotePreview {
  // Pre-generation preview
  estimatedOutput: {
    method: string;
    segmentCount: number;
    approximateLength: string;       // "About 5,000 characters"
    readingTime: string;             // "About 15 minutes"
  };

  // Sample segment (first segment only)
  sampleSegment: TimeSegment;

  // User options
  userOptions: {
    adjustSegmentCount?: number;     // Adjust segment count request
    emphasizeTopics?: string[];      // Topics to emphasize
    skipTopics?: string[];           // Topics to skip
  };
}

/**
 * Interactive feedback loop
 */
export interface InteractiveFeedback {
  // User rating after generation
  userRating: {
    overallQuality: number;          // 1-5 star rating
    methodAdherence: number;         // Method adherence evaluation
    usefulness: number;              // Usefulness evaluation
  };

  // Specific feedback
  segmentFeedback: Array<{
    segmentIndex: number;
    feedback: 'too_easy' | 'too_hard' | 'just_right' | 'needs_examples' | 'too_verbose';
    suggestion?: string;
  }>;

  // Regeneration options
  regenerateOptions: {
    wholeNote: boolean;              // Regenerate entire note
    specificSegments: number[];      // Regenerate specific segments only
    adjustments: string[];           // Adjustment requests
  };
}

/**
 * Learning progress tracking
 */
export interface LearningProgress {
  // Per-note progress
  noteId: string;
  completedSegments: number[];       // Completed segments
  totalSegments: number;

  // Time tracking
  timeSpent: {
    perSegment: Record<number, number>; // Per-segment learning time (seconds)
    total: number;
  };

  // Self-assessment of comprehension
  comprehensionCheck: Array<{
    segmentIndex: number;
    understood: boolean;
    needsReview: boolean;
  }>;

  // Review schedule
  reviewSchedule: {
    nextReview: Date;
    interval: number;                // In days
  };
}

// ============================================================================
// TYPE UNION FOR ALL NOTE TYPES
// ============================================================================

/**
 * Union type for all note methods
 */
export type EnhancedNote =
  | FeynmanNote
  | ELI5Note
  | CornellNote
  | MindMapNote
  | SocraticNote
  | AnalogyNote
  | StorytellingNote
  | ExpertAnalysisNote
  | CustomNote;

/**
 * Union type for all segment types
 */
export type EnhancedSegment =
  | FeynmanSegment
  | ELI5Segment
  | CornellSegment
  | MindMapSegment
  | SocraticSegment
  | AnalogySegment
  | StorySegment
  | ExpertSegment
  | CustomSegment;
