/**
 * Cornell Method API Test Script
 *
 * Tests the /api/notes/generate endpoint with Cornell Method
 */

const API_URL = 'http://localhost:3004/api/notes/generate';

// Sample test data - Using learning strategies topic
const testRequest = {
  videoId: 'test-cornell-789',
  title: '효과적인 학습 전략: Cornell Method 노트 필기법',
  duration: 420, // 7 minutes
  language: 'ko',
  transcript: `
    안녕하세요! 오늘은 효과적인 노트 필기법인 Cornell Method에 대해 배워보겠습니다.

    Cornell Method는 1950년대 코넬 대학교의 Walter Pauk 교수가 개발한 노트 필기 시스템입니다.

    이 방법의 핵심은 페이지를 세 부분으로 나누는 것입니다.

    첫 번째는 왼쪽의 '단서 영역'입니다. 여기에는 주요 질문이나 키워드를 적습니다.

    두 번째는 오른쪽의 '노트 영역'입니다. 강의 내용이나 핵심 정보를 상세히 기록합니다.

    세 번째는 하단의 '요약 영역'입니다. 한 문장으로 전체 내용을 정리합니다.

    Cornell Method의 장점은 능동적 학습을 촉진한다는 것입니다.

    단서 영역의 질문들은 나중에 복습할 때 스스로를 테스트하는 도구가 됩니다.

    연구에 따르면 이 방법을 사용하면 정보 회상률이 30% 이상 증가한다고 합니다.

    노트 필기 후에는 반드시 24시간 내에 복습하는 것이 중요합니다.

    복습 시에는 노트 영역을 가리고 단서 영역의 질문만 보고 답을 떠올려 보세요.

    이렇게 하면 장기 기억으로 전환되는 효과가 있습니다.

    Cornell Method는 모든 과목에 활용할 수 있는 범용적인 학습 도구입니다.
  `.trim(),
  method: 'Cornell Method',
  ageGroup: 'adult'
};

async function testCornellAPI() {
  console.log('🧪 Testing Cornell Method API...\n');
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

      // Cue Questions (Cornell left column)
      console.log(`   \n   📌 Cue Questions (${segment.cueQuestions.length} questions):`);
      segment.cueQuestions.forEach((q, i) => {
        console.log(`      ${i + 1}. ${q}`);
      });

      // Detailed Notes (Cornell right column)
      console.log(`   \n   📝 Detailed Notes:`);
      console.log(`      ${segment.detailedNotes.substring(0, 150)}...`);

      // Bottom Summary (Cornell bottom row)
      console.log(`   \n   📄 Bottom Summary:`);
      console.log(`      ${segment.bottomSummary}`);

      // Question-Answer Pairs
      console.log(`   \n   💡 Question-Answer Pairs (${segment.questionAnswerPairs.length} pairs):`);
      segment.questionAnswerPairs.forEach((qa, i) => {
        console.log(`      ${i + 1}. Q: ${qa.question}`);
        console.log(`         A: ${qa.answer.substring(0, 100)}...`);
        console.log(`         Importance: ${qa.importance}`);
      });

      // Key Terms
      console.log(`   \n   🔑 Key Terms (${segment.keyTerms.length} terms):`);
      segment.keyTerms.forEach((term, i) => {
        console.log(`      ${i + 1}. ${term.term}: ${term.definition.substring(0, 80)}...`);
      });
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ Test Completed Successfully!');
    console.log(`\n📄 Full response saved to: cornell-test-result.json`);

    // Save full result to file
    const fs = require('fs');
    fs.writeFileSync(
      'cornell-test-result.json',
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
testCornellAPI();
