/**
 * Analogy Method API Test Script
 *
 * Tests the /api/notes/generate endpoint with Analogy method
 */

const API_URL = 'http://localhost:3004/api/notes/generate';

// Sample test data - Using learning strategies topic
const testRequest = {
  videoId: 'test-analogy-101',
  title: 'AI와 인간 지능 비교: 쉬운 비유로 이해하기',
  duration: 420, // 7 minutes
  language: 'ko',
  transcript: `
    안녕하세요! 오늘은 AI와 인간 지능을 비교해서 이해해 보겠습니다.

    AI는 종종 인간의 두뇌와 비교됩니다. 하지만 정확히 어떻게 비슷하고 다를까요?

    먼저 AI의 학습 과정을 생각해봅시다. AI가 학습하는 것은 마치 아이가 언어를 배우는 것과 비슷합니다.

    아이는 수많은 대화를 들으면서 패턴을 발견합니다. "안녕하세요"는 아침에 하는 인사구나.

    AI도 마찬가지로 수백만 개의 예시를 보면서 패턴을 학습합니다.

    하지만 차이점도 있습니다. 인간의 뇌는 약 860억 개의 뉴런으로 이루어져 있습니다.

    이를 도시의 전기망에 비유할 수 있습니다. 각 뉴런은 전구처럼 켜지고 꺼집니다.

    AI의 신경망도 비슷한 구조입니다. 하지만 AI는 전기를 사용하고, 인간 뇌는 화학 신호를 사용합니다.

    기억력을 비교해봅시다. 인간의 기억은 도서관 같습니다. 정보가 다양한 섹션에 나뉘어 저장됩니다.

    반면 AI의 메모리는 하드 디스크 같습니다. 정확한 위치에 완벽하게 저장되고 검색됩니다.

    창의성 측면에서도 차이가 있습니다. 인간의 창의성은 요리사가 새로운 레시피를 만드는 것과 같습니다.

    기존 재료를 새로운 방식으로 조합하여 전혀 새로운 것을 창조합니다.

    AI의 창의성은 오히려 믹서기에 가깝습니다. 기존 데이터를 섞어서 새로운 조합을 만듭니다.

    결론적으로 AI와 인간 지능은 서로 다른 강점을 가지고 있습니다.

    AI는 빠르고 정확한 계산에 강하고, 인간은 창의성과 직관에 강합니다.
  `.trim(),
  method: 'Analogy',
  ageGroup: 'adult'
};

async function testAnalogyAPI() {
  console.log('🧪 Testing Analogy Method API...\n');
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

      // Target Concept
      console.log(`   \n   🎯 Target Concept (설명할 개념):`);
      console.log(`      ${segment.targetConcept}`);

      // Source Analogy
      console.log(`   \n   🔗 Source Analogy (친숙한 비유):`);
      console.log(`      ${segment.sourceAnalogy}`);

      // Mapping Explanation
      console.log(`   \n   📋 Mapping Explanation (대응 관계):`);
      console.log(`      ${segment.mappingExplanation.substring(0, 150)}...`);

      // Analogy Chain
      console.log(`   \n   ⛓️  Analogy Chain (${segment.analogyChain.length} chains):`);
      segment.analogyChain.forEach((chain, i) => {
        console.log(`      ${i + 1}. Abstract: ${chain.abstract}`);
        console.log(`         Concrete: ${chain.concrete}`);
        console.log(`         Correspondence:`);
        chain.correspondence.forEach((point, j) => {
          console.log(`           - ${point}`);
        });
      });

      // Analogy Types
      console.log(`   \n   🏷️  Analogy Types (${segment.analogyTypes.length} types):`);
      segment.analogyTypes.forEach((type, i) => {
        console.log(`      ${i + 1}. Type: ${type.type}`);
        console.log(`         Example: ${type.example}`);
      });

      // Quality Metrics
      console.log(`   \n   📊 Quality Metrics:`);
      console.log(`      Familiarity Score: ${segment.familiarityScore}/10`);
      console.log(`      Correspondence Accuracy: ${segment.correspondenceAccuracy}/10`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ Test Completed Successfully!');
    console.log(`\n📄 Full response saved to: analogy-test-result.json`);

    // Save full result to file
    const fs = require('fs');
    fs.writeFileSync(
      'analogy-test-result.json',
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
testAnalogyAPI();
