/**
 * ELI5 (Explain Like I'm 5) API Test Script
 *
 * Tests the /api/notes/generate endpoint with ELI5 method
 */

const API_URL = 'http://localhost:3004/api/notes/generate';

// Sample test data - Using a simple science concept
const testRequest = {
  videoId: 'test-eli5-456',
  title: '무지개는 어떻게 만들어질까?',
  duration: 360, // 6 minutes
  language: 'ko',
  transcript: `
    안녕! 오늘은 무지개에 대해 알아볼 거야.

    무지개를 본 적 있니? 비가 오고 난 다음에 하늘에 나타나는 예쁜 색깔들이야.

    무지개는 빨강, 주황, 노랑, 초록, 파랑, 남색, 보라색 이렇게 일곱 가지 색깔이 있어.

    무지개가 어떻게 만들어질까? 햇빛이 빗방울을 지나가면서 생기는 거야.

    햇빛은 사실 여러 가지 색이 섞여 있어. 우리 눈에는 하얀색으로 보이지만 말이야.

    빗방울은 작은 유리공처럼 햇빛을 꺾어주는 역할을 해.

    햇빛이 빗방울에 들어가면, 각각의 색깔들이 다른 방향으로 꺾여.

    빨간색은 조금 덜 꺾이고, 보라색은 많이 꺾여.

    그래서 우리는 하늘에서 예쁜 색깔들이 순서대로 늘어선 무지개를 볼 수 있어.

    비가 온 후에 해가 나면, 무지개를 찾아봐! 정말 신기하고 아름다운 자연의 선물이야.
  `.trim(),
  method: 'ELI5 (Explain Like I\'m 5)',
  ageGroup: 'child'
};

async function testELI5API() {
  console.log('🧪 Testing ELI5 (Explain Like I\'m 5) API...\n');
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
      console.log(`   🎈 Child-Friendly Analogy: ${segment.childFriendlyAnalogy.substring(0, 100)}...`);
      console.log(`   🖼️  Visual Description: ${segment.visualDescription.substring(0, 100)}...`);
      console.log(`   💝 Emotional Connection: ${segment.emotionalConnection.substring(0, 100)}...`);
      const explanation = typeof segment.simpleExplanation === 'string'
        ? segment.simpleExplanation
        : (Array.isArray(segment.simpleExplanation) ? segment.simpleExplanation.join(' ') : '');
      console.log(`   📖 Simple Explanation: ${explanation.substring(0, 100)}...`);
      console.log(`   🎨 Emojis Used: ${Array.isArray(segment.emojiUsage) ? segment.emojiUsage.join(', ') : segment.emojiUsage}`);
      console.log(`   ❓ Fun Questions: ${segment.funQuestions.length} questions`);
      segment.funQuestions.forEach((q, i) => {
        console.log(`      ${i + 1}. ${q}`);
      });
      console.log(`   📊 Readability Score: ${segment.readabilityScore} (Grade Level)`);
      console.log(`   ⭐ Analogy Quality: ${segment.analogyQuality}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ Test Completed Successfully!');
    console.log(`\n📄 Full response saved to: eli5-test-result.json`);

    // Save full result to file
    const fs = require('fs');
    fs.writeFileSync(
      'eli5-test-result.json',
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
testELI5API();
