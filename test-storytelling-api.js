/**
 * Storytelling Method API Test Script
 *
 * Tests the /api/notes/generate endpoint with Storytelling method
 */

const API_URL = 'http://localhost:3004/api/notes/generate';

// Sample test data - Using a narrative-focused topic
const testRequest = {
  videoId: 'test-storytelling-101',
  title: '기업가의 여정: 실패에서 성공까지',
  duration: 480, // 8 minutes
  language: 'ko',
  transcript: `
    안녕하세요! 오늘은 한 기업가의 여정을 통해 창업과 성장에 대해 이야기해보겠습니다.

    처음 시작은 아주 작은 아이디어였습니다. 대학생이었던 주인공은 일상에서 불편함을 발견했습니다.

    "왜 온라인 강의는 항상 이렇게 복잡할까?" 이 질문이 모든 것의 시작이었습니다.

    첫 번째 장애물은 자금 부족이었습니다. 은행 대출도 거절당했고, 투자자들도 관심이 없었습니다.

    하지만 포기하지 않았습니다. 작은 아르바이트로 돈을 모으고, 밤새 코딩을 했습니다.

    6개월 후, 첫 번째 프로토타입이 완성되었습니다. 그러나 새로운 문제가 생겼습니다.

    사용자들의 반응이 냉담했습니다. "이건 우리가 원하는 게 아니야"라는 피드백만 받았습니다.

    좌절했지만, 이것이 전환점이 되었습니다. 멘토를 만났고, 사용자 중심 디자인을 배웠습니다.

    완전히 새로운 접근법으로 제품을 재설계했습니다. 사용자들과 직접 대화하고 그들의 니즈를 이해했습니다.

    1년이 지난 후, 드디어 전환점이 왔습니다. 첫 1000명의 사용자를 확보했고, 입소문이 퍼지기 시작했습니다.

    투자자들이 먼저 연락을 해왔습니다. 시리즈 A 투자를 받았고, 팀을 확장할 수 있었습니다.

    하지만 성공과 함께 새로운 도전이 왔습니다. 빠른 성장으로 인한 기술적 문제와 조직 문화 충돌이었습니다.

    위기의 순간, 창업 초기의 원칙을 떠올렸습니다. "사용자를 최우선으로"라는 핵심 가치였습니다.

    결국 문제를 해결했고, 더 강한 팀으로 거듭났습니다. 3년 후, 수익성을 달성하고 지속 가능한 비즈니스가 되었습니다.

    이 여정에서 배운 가장 중요한 교훈은 무엇일까요?

    실패는 끝이 아니라 배움의 기회입니다. 사용자를 이해하고, 끊임없이 개선하며, 핵심 가치를 지키는 것이 성공의 열쇠였습니다.
  `.trim(),
  method: 'Storytelling',
  ageGroup: 'adult'
};

async function testStorytellingAPI() {
  console.log('🧪 Testing Storytelling Method API...\n');
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

      // Narrative
      console.log(`   \n   📖 Narrative:`);
      console.log(`      Setting: ${segment.narrative.setting}`);
      console.log(`      Protagonist Goal: ${segment.narrative.protagonistGoal}`);
      console.log(`      Obstacles (${segment.narrative.obstacles.length}):`);
      segment.narrative.obstacles.forEach((obstacle, i) => {
        console.log(`        ${i + 1}. ${obstacle}`);
      });
      console.log(`      Resolution: ${segment.narrative.resolution}`);

      // Characters
      console.log(`   \n   👥 Characters (${segment.characters.length}):`);
      segment.characters.forEach((char, i) => {
        console.log(`      ${i + 1}. ${char.name} (${char.role})`);
        console.log(`         Motivation: ${char.motivation}`);
      });

      // Plot
      console.log(`   \n   🎭 Plot Structure:`);
      console.log(`      Problem: ${segment.plot.problem}`);
      console.log(`      Conflict: ${segment.plot.conflict}`);
      console.log(`      Solution: ${segment.plot.solution}`);

      // Story Arc
      console.log(`   \n   📈 Story Arc:`);
      console.log(`      Exposition: ${segment.storyArc.exposition}`);
      console.log(`      Rising Action (${segment.storyArc.risingAction.length} events):`);
      segment.storyArc.risingAction.forEach((event, i) => {
        console.log(`        ${i + 1}. ${event}`);
      });
      console.log(`      Climax: ${segment.storyArc.climax}`);
      console.log(`      Falling Action: ${segment.storyArc.fallingAction}`);
      console.log(`      Resolution: ${segment.storyArc.resolution}`);

      // Emotional Journey
      console.log(`   \n   💓 Emotional Journey (${segment.emotionalJourney.length} points):`);
      segment.emotionalJourney.forEach((ej, i) => {
        console.log(`      ${i + 1}. @${formatTime(ej.timestamp)}: ${ej.emotion} (intensity: ${ej.intensity}/10)`);
      });

      // Moral & Application
      console.log(`   \n   💡 Moral: ${segment.moral}`);
      console.log(`   🎯 Real World Application: ${segment.realWorldApplication}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ Test Completed Successfully!');
    console.log(`\n📄 Full response saved to: storytelling-test-result.json`);

    // Save full result to file
    const fs = require('fs');
    fs.writeFileSync(
      'storytelling-test-result.json',
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
testStorytellingAPI();
