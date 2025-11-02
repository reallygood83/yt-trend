/**
 * Socratic Method API Test Script
 *
 * Tests the /api/notes/generate endpoint with Socratic Method
 */

const API_URL = 'http://localhost:3004/api/notes/generate';

// Sample test data - Using a philosophical/thought-provoking topic
const testRequest = {
  videoId: 'test-socratic-101',
  title: '비판적 사고의 힘: 질문을 통한 깊은 이해',
  duration: 420, // 7 minutes
  language: 'ko',
  transcript: `
    안녕하세요! 오늘은 비판적 사고와 질문의 힘에 대해 이야기해보겠습니다.

    우리는 종종 정보를 받아들일 때 깊이 생각하지 않고 그대로 수용합니다.

    하지만 진정한 이해는 질문에서 시작됩니다. "왜 그럴까?", "어떤 근거가 있을까?", "다른 관점은 없을까?"

    비판적 사고의 첫 단계는 표면적인 정보를 받아들이지 않고 의문을 제기하는 것입니다.

    예를 들어, "AI가 모든 직업을 대체할 것이다"라는 주장을 들었을 때, 우리는 무엇을 질문해야 할까요?

    먼저, 이 주장의 근거는 무엇일까요? 어떤 데이터나 연구에 기반한 것일까요?

    둘째, "모든 직업"이라는 말은 정말 모든 직업을 의미할까요? 예외는 없을까요?

    셋째, 이러한 변화가 일어난다면 어떤 새로운 기회가 생길까요?

    질문을 통해 우리는 단순한 사실 너머의 깊은 의미를 발견할 수 있습니다.

    소크라테스는 질문을 통해 제자들이 스스로 답을 찾도록 도왔습니다.

    그의 방법론은 오늘날에도 여전히 유효합니다. 질문은 사고를 자극하고, 가정을 드러내며, 새로운 관점을 열어줍니다.

    비판적 사고를 키우려면 다섯 가지 유형의 질문을 연습해야 합니다.

    명확화 질문: "정확히 무엇을 의미하나요?"
    가정 질문: "어떤 전제에 기반하고 있나요?"
    증거 질문: "어떤 근거가 있나요?"
    관점 질문: "다른 시각은 무엇이 있을까요?"
    함의 질문: "이것이 의미하는 바는 무엇일까요?"

    이러한 질문들을 연습함으로써 우리는 더 깊이 생각하고, 더 현명한 결정을 내릴 수 있습니다.

    결론적으로, 질문은 단순히 답을 구하는 도구가 아니라, 진정한 이해로 가는 여정입니다.
  `.trim(),
  method: 'Socratic Method',
  ageGroup: 'adult'
};

async function testSocraticAPI() {
  console.log('🧪 Testing Socratic Method API...\n');
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

      // Guiding Questions
      console.log(`   \n   ❓ Guiding Questions (${segment.guidingQuestions.length}):`);
      segment.guidingQuestions.forEach((gq, i) => {
        console.log(`      ${i + 1}. [${gq.type}] (depth: ${gq.depth})`);
        console.log(`         Q: ${gq.question}`);
      });

      // Thought Process
      console.log(`   \n   🧠 Thought Process (${segment.thoughtProcess.length} steps):`);
      segment.thoughtProcess.forEach((tp, i) => {
        console.log(`      ${i + 1}. ${tp}`);
      });

      // Counter-Arguments
      console.log(`   \n   ⚖️  Counter-Arguments (${segment.counterArguments.length}):`);
      segment.counterArguments.forEach((ca, i) => {
        console.log(`      ${i + 1}. ${ca}`);
      });

      // Final Insight
      console.log(`   \n   💡 Final Insight:`);
      console.log(`      ${segment.finalInsight}`);

      // Question Ladder
      console.log(`   \n   🪜 Question Ladder (${segment.questionLadder.length} levels):`);
      segment.questionLadder.forEach((ql, i) => {
        console.log(`      Level ${ql.level}:`);
        console.log(`         Q: ${ql.question}`);
        console.log(`         Expected Thought: ${ql.expectedThought}`);
        console.log(`         Follow-up: ${ql.followUp}`);
      });
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ Test Completed Successfully!');
    console.log(`\n📄 Full response saved to: socratic-test-result.json`);

    // Save full result to file
    const fs = require('fs');
    fs.writeFileSync(
      'socratic-test-result.json',
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
testSocraticAPI();
