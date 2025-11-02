/**
 * Feynman Technique API Test Script
 *
 * Tests the /api/notes/generate endpoint with Feynman method
 */

const API_URL = 'http://localhost:3004/api/notes/generate';

// Sample test data
const testRequest = {
  videoId: 'test-video-123',
  title: '양자역학의 기초: 이중 슬릿 실험',
  duration: 600, // 10 minutes
  language: 'ko',
  transcript: `
    안녕하세요. 오늘은 양자역학의 가장 유명한 실험인 이중 슬릿 실험에 대해 알아보겠습니다.

    이 실험은 빛과 물질의 이중성을 보여주는 가장 중요한 실험입니다.

    먼저 실험 장치를 살펴보겠습니다. 광원이 있고, 두 개의 틈이 있는 판이 있으며,
    뒤쪽에는 스크린이 있습니다.

    광원에서 나온 빛이 두 개의 틈을 통과하면, 스크린에 간섭 무늬가 나타납니다.
    이것은 빛이 파동의 성질을 가지고 있다는 증거입니다.

    그런데 여기서 놀라운 일이 일어납니다. 빛을 한 번에 하나씩 보내도
    시간이 지나면 똑같은 간섭 무늬가 만들어집니다.

    더욱 놀라운 것은, 어느 틈을 통과했는지 관측하려고 하면
    간섭 무늬가 사라진다는 것입니다.

    이것이 바로 양자역학의 핵심입니다. 관측 행위 자체가 결과에 영향을 미칩니다.

    이 실험은 우리가 일상적으로 경험하는 세계와는 전혀 다른
    양자 세계의 신비로운 성질을 보여줍니다.

    결론적으로, 이중 슬릿 실험은 입자가 동시에 여러 경로를 취할 수 있다는
    양자 중첩의 개념을 증명합니다.
  `.trim(),
  method: 'Feynman Technique',
  ageGroup: 'adult'
};

async function testFeynmanAPI() {
  console.log('🧪 Testing Feynman Technique API...\n');
  console.log('📝 Request Data:');
  console.log(`- Video: ${testRequest.title}`);
  console.log(`- Duration: ${testRequest.duration}s (${testRequest.duration / 60} min)`);
  console.log(`- Method: ${testRequest.method}`);
  console.log(`- Age Group: ${testRequest.ageGroup}`);
  console.log(`- Transcript Length: ${testRequest.transcript.length} characters\n`);

  try {
    console.log('🚀 Sending request to API...\n');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:');
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    const result = await response.json();

    console.log('✅ API Response Received!\n');
    console.log('📊 Analysis Results:');
    console.log('─'.repeat(80));

    // Basic info
    console.log(`\n📌 Method: ${result.method}`);
    console.log(`📌 Age Group: ${result.ageGroup}`);
    console.log(`📌 Generated At: ${result.generatedAt}`);
    console.log(`📌 Quality Score: ${result.qualityScore}/100`);

    // Full summary
    console.log(`\n📝 Full Summary:`);
    console.log(`   ${result.fullSummary}`);

    // Segments overview
    console.log(`\n🎬 Segments Generated: ${result.segments.length}`);
    console.log('─'.repeat(80));

    result.segments.forEach((segment, index) => {
      console.log(`\n${index + 1}. ${segment.title}`);
      console.log(`   ⏱️  Time: ${formatTime(segment.start)} - ${formatTime(segment.end)}`);
      console.log(`   📍 Core Concept: ${segment.coreConcept.substring(0, 100)}...`);
      console.log(`   💡 Analogy: ${segment.everydayAnalogy.substring(0, 100)}...`);
      console.log(`   ❓ Knowledge Gaps: ${segment.knowledgeGaps.length} questions`);
    });

    // Overall reflection
    if (result.overallReflection) {
      console.log(`\n🧠 Overall Reflection:`);
      console.log('─'.repeat(80));

      if (result.overallReflection.fundamentalConcepts?.length > 0) {
        console.log(`\n🔑 Fundamental Concepts (${result.overallReflection.fundamentalConcepts.length}):`);
        result.overallReflection.fundamentalConcepts.forEach((concept, i) => {
          console.log(`   ${i + 1}. ${concept}`);
        });
      }

      if (result.overallReflection.majorGaps?.length > 0) {
        console.log(`\n⚠️  Major Knowledge Gaps (${result.overallReflection.majorGaps.length}):`);
        result.overallReflection.majorGaps.forEach((gap, i) => {
          console.log(`   ${i + 1}. ${gap}`);
        });
      }

      if (result.overallReflection.effectiveAnalogies?.length > 0) {
        console.log(`\n🎯 Effective Analogies (${result.overallReflection.effectiveAnalogies.length}):`);
        result.overallReflection.effectiveAnalogies.forEach((analogy, i) => {
          console.log(`   ${i + 1}. ${analogy}`);
        });
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ Test Completed Successfully!');
    console.log(`\n📄 Full response saved to: feynman-test-result.json`);

    // Save full result to file
    const fs = require('fs');
    fs.writeFileSync(
      'feynman-test-result.json',
      JSON.stringify(result, null, 2),
      'utf-8'
    );

  } catch (error) {
    console.error('\n❌ Test Failed:');
    console.error(error.message);
    console.error('\n📋 Error Details:');
    console.error(error);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Run the test
testFeynmanAPI();
