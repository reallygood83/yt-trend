/**
 * Expert Analysis Method API Test Script
 *
 * Tests the /api/notes/generate endpoint with Expert Analysis method
 */

const API_URL = 'http://localhost:3004/api/notes/generate';

// Sample test data - Using a business/technology topic for expert analysis
const testRequest = {
  videoId: 'test-expert-analysis-101',
  title: 'AI 기반 비즈니스 혁신: 기업의 디지털 전환 전략',
  duration: 540, // 9 minutes
  language: 'ko',
  transcript: `
    안녕하세요! 오늘은 AI 기반 비즈니스 혁신과 디지털 전환에 대해 이야기하겠습니다.

    최근 글로벌 기업들의 가장 큰 화두는 AI를 활용한 비즈니스 혁신입니다.

    맥킨지 보고서에 따르면, AI 도입으로 기업 생산성이 평균 40% 향상되었습니다.

    첫 번째 핵심은 데이터 중심 의사결정 체계 구축입니다. 전통적인 직관 기반 의사결정에서 데이터 기반 의사결정으로의 전환이 필수적입니다.

    기업들은 고객 데이터, 운영 데이터, 시장 데이터를 통합 분석하여 실시간 인사이트를 도출하고 있습니다.

    두 번째는 프로세스 자동화와 최적화입니다. RPA(로봇 프로세스 자동화)와 AI를 결합하여 반복적인 업무를 자동화합니다.

    삼성전자의 경우, 제조 공정에 AI를 도입하여 불량률을 50% 감소시켰습니다.

    고객 서비스 부문에서도 챗봇과 AI 상담원을 통해 24시간 즉각적인 고객 응대가 가능해졌습니다.

    세 번째는 개인화된 고객 경험 제공입니다. Netflix와 Amazon은 AI 추천 알고리즘으로 각 고객에게 맞춤형 콘텐츠와 상품을 제공합니다.

    이를 통해 고객 만족도와 재구매율이 크게 향상되었습니다.

    네 번째는 예측 분석과 리스크 관리입니다. 금융 기업들은 AI로 신용 위험을 평가하고 사기 거래를 실시간으로 탐지합니다.

    제조업에서는 설비 고장을 사전에 예측하여 다운타임을 최소화합니다.

    그러나 AI 도입에는 여러 과제가 있습니다. 첫째, 높은 초기 투자 비용입니다. AI 인프라 구축과 전문 인력 확보에 상당한 자본이 필요합니다.

    둘째, 데이터 품질과 보안 문제입니다. AI는 양질의 데이터가 필수이며, 개인정보 보호와 데이터 보안도 중요한 이슈입니다.

    셋째, 조직 문화의 변화 저항입니다. 기존 업무 방식에 익숙한 직원들의 반발과 새로운 기술 습득에 대한 부담이 있습니다.

    성공적인 디지털 전환을 위해서는 경영진의 강력한 리더십과 조직 전체의 변화 의지가 필요합니다.

    단계적 접근이 중요합니다. 작은 파일럿 프로젝트로 시작하여 성공 사례를 만들고 점진적으로 확대하는 것이 효과적입니다.

    또한 직원 교육과 리스킬링 프로그램을 통해 AI 시대에 맞는 역량을 키워야 합니다.

    결론적으로, AI 기반 비즈니스 혁신은 선택이 아닌 필수입니다. 하지만 기술 도입만으로는 불충분하며, 전략적 접근과 조직 문화 변화가 동반되어야 합니다.

    기업들은 자신의 산업과 비즈니스 특성에 맞는 AI 전략을 수립하고, 지속적인 혁신을 추구해야 합니다.
  `.trim(),
  method: 'Expert Analysis',
  ageGroup: 'adult'
};

async function testExpertAnalysisAPI() {
  console.log('🧪 Testing Expert Analysis Method API...\n');
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
    console.log(`📌 Expert Domain: ${result.expertDomain}`);
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

      // Professional Insight
      console.log(`   \n   💼 Professional Insight:`);
      console.log(`      ${segment.professionalInsight}`);

      // Technical Analysis
      console.log(`   \n   🔬 Technical Analysis:`);
      console.log(`      ${segment.technicalAnalysis}`);

      // Contextual Background
      console.log(`   \n   📚 Contextual Background:`);
      console.log(`      ${segment.contextualBackground}`);

      // Domain-Specific Fields
      console.log(`   \n   🎯 Domain-Specific Analysis:`);
      Object.entries(segment.domainSpecificFields).forEach(([key, value]) => {
        console.log(`      ${key}:`);
        if (Array.isArray(value)) {
          value.forEach((item, i) => {
            console.log(`        ${i + 1}. ${item}`);
          });
        } else {
          console.log(`        ${value}`);
        }
      });

      // Key Terminology
      console.log(`   \n   📖 Key Terminology (${segment.keyTerminology.length} terms):`);
      segment.keyTerminology.forEach((kt, i) => {
        console.log(`      ${i + 1}. ${kt.term}`);
        console.log(`         Definition: ${kt.definition}`);
        console.log(`         Context: ${kt.context}`);
      });

      // Expert Recommendations
      console.log(`   \n   💡 Expert Recommendations:`);
      console.log(`      Action Items:`);
      segment.expertRecommendations.actionItems.forEach((item, i) => {
        console.log(`        ${i + 1}. ${item}`);
      });
      console.log(`      Further Study:`);
      segment.expertRecommendations.furtherStudy.forEach((item, i) => {
        console.log(`        ${i + 1}. ${item}`);
      });
      console.log(`      Critical Questions:`);
      segment.expertRecommendations.criticalQuestions.forEach((item, i) => {
        console.log(`        ${i + 1}. ${item}`);
      });

      // Credibility Assessment
      console.log(`   \n   🔍 Credibility Assessment:`);
      console.log(`      Source Reliability: ${segment.credibility.sourceReliability}`);
      console.log(`      Evidence Quality: ${segment.credibility.evidenceQuality}`);
      console.log(`      Expert Consensus: ${segment.credibility.expertConsensus ? 'Yes' : 'No'}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n✅ Test Completed Successfully!');
    console.log(`\n📄 Full response saved to: expert-analysis-test-result.json`);

    // Save full result to file
    const fs = require('fs');
    fs.writeFileSync(
      'expert-analysis-test-result.json',
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
testExpertAnalysisAPI();
