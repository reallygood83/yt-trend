/**
 * Mind Map Method API Test Script
 *
 * Tests the /api/notes/generate endpoint with Mind Map method
 */

const API_URL = 'http://localhost:3004/api/notes/generate';

// Sample test data - Using systematic knowledge topic ideal for mind mapping
const testRequest = {
  videoId: 'test-mind-map-101',
  title: '학습 방법론의 이해: 효과적인 학습 전략과 기법',
  duration: 480, // 8 minutes
  language: 'ko',
  transcript: `
    안녕하세요! 오늘은 효과적인 학습 방법론에 대해 이야기하겠습니다.

    학습은 단순히 정보를 기억하는 것이 아니라, 지식을 구조화하고 연결하는 과정입니다.

    첫 번째 핵심은 능동적 학습입니다. 수동적으로 읽기만 하는 것이 아니라, 질문하고, 요약하고, 설명하는 과정이 필요합니다.

    파인만 기법은 복잡한 개념을 간단한 언어로 설명함으로써 이해도를 높입니다. 다른 사람에게 가르치듯 설명하면 자신의 이해 수준을 확인할 수 있습니다.

    두 번째는 분산 학습입니다. 한 번에 몰아서 공부하는 것보다 시간을 분산해서 반복하는 것이 장기 기억에 효과적입니다.

    간격 반복 시스템은 망각 곡선을 고려하여 최적의 복습 시점을 제시합니다. 처음에는 자주, 시간이 지날수록 간격을 늘려가는 방식입니다.

    세 번째는 정교화 학습입니다. 새로운 정보를 기존 지식과 연결하고, 구체적인 예시를 만들어보는 것입니다.

    비유와 연결을 통해 추상적인 개념을 구체화할 수 있습니다. 예를 들어, 신경망을 나무의 뿌리에 비유하여 이해할 수 있습니다.

    네 번째는 시각화입니다. 마인드맵, 다이어그램, 플로우차트 등을 활용하여 정보를 시각적으로 구조화합니다.

    시각적 학습은 좌뇌와 우뇌를 모두 활용하여 기억 효과를 높입니다. 색상과 이미지를 사용하면 더욱 효과적입니다.

    다섯 번째는 회상 연습입니다. 단순히 재읽기보다 스스로 떠올려보는 것이 학습 효과가 훨씬 높습니다.

    플래시카드나 자기 테스트를 통해 능동적으로 기억을 인출하는 연습을 합니다.

    여섯 번째는 교차 학습입니다. 한 주제만 집중하는 것이 아니라, 여러 관련 주제를 번갈아가며 학습합니다.

    이를 통해 개념 간의 차이와 연결을 더 잘 이해할 수 일곱 번째는 메타인지입니다. 자신의 학습 과정을 모니터링하고 조절하는 능력입니다.

    무엇을 알고 무엇을 모르는지 정확히 파악하고, 학습 전략을 조정해야 합니다.

    실제 적용을 위해서는 학습 환경도 중요합니다. 집중할 수 있는 조용한 공간, 적절한 조명, 규칙적인 휴식이 필요합니다.

    또한 개인의 학습 스타일을 파악하는 것도 중요합니다. 시각형, 청각형, 운동감각형 등 자신에게 맞는 방법을 찾아야 합니다.

    결론적으로, 효과적인 학습은 다양한 전략을 조합하여 사용하는 것입니다. 자신에게 맞는 방법을 찾아 지속적으로 실천하는 것이 중요합니다.
  `.trim(),
  method: 'Mind Map',
  ageGroup: 'adult'
};

async function testMindMapAPI() {
  console.log('🧪 Testing Mind Map Method API...\n');
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

    // Central Concept
    console.log(`\n🎯 Central Concept:`);
    console.log(`   ${result.centralConcept.icon} ${result.centralConcept.label}`);
    console.log(`   Color: ${result.centralConcept.color}`);
    console.log(`   ${result.centralConcept.description}`);

    // Main Branches
    console.log(`\n🌳 Main Branches: ${result.mainBranches.length}`);
    console.log('─'.repeat(80));

    result.mainBranches.forEach((branch, index) => {
      console.log(`\n${index + 1}. ${branch.icon} ${branch.label}`);
      console.log(`   Color: ${branch.color}`);
      console.log(`   ${branch.description}`);

      // Sub-branches
      if (branch.subBranches && branch.subBranches.length > 0) {
        console.log(`   \n   📍 Sub-branches (${branch.subBranches.length}):`);
        branch.subBranches.forEach((sub, subIndex) => {
          console.log(`      ${subIndex + 1}. ${sub.icon} ${sub.label}`);
          console.log(`         ${sub.description}`);

          if (sub.details && sub.details.length > 0) {
            console.log(`         Details:`);
            sub.details.forEach((detail, detailIndex) => {
              console.log(`           • ${detail}`);
            });
          }
        });
      }
    });

    // Connections
    if (result.connections && result.connections.length > 0) {
      console.log(`\n🔗 Connections: ${result.connections.length}`);
      console.log('─'.repeat(80));
      result.connections.forEach((conn, index) => {
        console.log(`\n${index + 1}. [${conn.type}] ${conn.fromNode} → ${conn.toNode}`);
        console.log(`   ${conn.label}`);
      });
    }

    // Learning Insights
    console.log(`\n💡 Learning Insights:`);
    console.log('─'.repeat(80));

    console.log(`\n   🔑 Key Concepts (${result.learningInsights.keyConcepts.length}):`);
    result.learningInsights.keyConcepts.forEach((concept, index) => {
      console.log(`      ${index + 1}. ${concept}`);
    });

    console.log(`\n   🧠 Memory Hooks (${result.learningInsights.memoryHooks.length}):`);
    result.learningInsights.memoryHooks.forEach((hook, index) => {
      console.log(`      ${index + 1}. ${hook}`);
    });

    console.log(`\n   🎯 Practical Application:`);
    console.log(`      ${result.learningInsights.practicalApplication}`);

    console.log(`\n   📚 Review Suggestion:`);
    console.log(`      ${result.learningInsights.reviewSuggestion}`);

    // Full Summary
    console.log(`\n📝 Full Summary:`);
    console.log(`   ${result.fullSummary}`);

    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ Test Completed Successfully!');
    console.log(`\n📄 Full response saved to: mind-map-test-result.json`);

    // Save full result to file
    const fs = require('fs');
    fs.writeFileSync(
      'mind-map-test-result.json',
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
testMindMapAPI();
