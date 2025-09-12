// Test script to verify the conditional rendering logic

// Test scenarios
const scenarios = [
  {
    name: "Has child jobs and AI snapshot",
    childJobs: [{ id: 1, title: "Test Job", source: "LinkedIn" }],
    aiSnapshot: { requirements: ["Experience"], nice_to_have: ["Degree"] },
    expected: { showChildJobs: true, showAISnapshot: false },
  },
  {
    name: "No child jobs but has AI snapshot",
    childJobs: [],
    aiSnapshot: { requirements: ["Experience"], nice_to_have: ["Degree"] },
    expected: { showChildJobs: false, showAISnapshot: true },
  },
  {
    name: "No child jobs and no AI snapshot",
    childJobs: [],
    aiSnapshot: null,
    expected: { showChildJobs: false, showAISnapshot: false },
  },
  {
    name: "No child jobs and empty AI snapshot",
    childJobs: [],
    aiSnapshot: {},
    expected: { showChildJobs: false, showAISnapshot: false },
  },
];

// Test the logic
function testConditionalLogic(childJobs, aiSnapshot) {
  const hasChildJobs = childJobs.length > 0;
  const hasAISnapshot = aiSnapshot && Object.keys(aiSnapshot).length > 0;
  const shouldShowChildJobs = hasChildJobs;
  const shouldShowAISnapshot = !hasChildJobs && hasAISnapshot;

  return {
    showChildJobs: shouldShowChildJobs,
    showAISnapshot: shouldShowAISnapshot,
  };
}

// Run tests
console.log("Testing conditional rendering logic:\n");

scenarios.forEach((scenario, index) => {
  const result = testConditionalLogic(scenario.childJobs, scenario.aiSnapshot);
  const passed =
    result.showChildJobs === scenario.expected.showChildJobs &&
    result.showAISnapshot === scenario.expected.showAISnapshot;

  console.log(`Test ${index + 1}: ${scenario.name}`);
  console.log(
    `  Expected: Child Jobs = ${scenario.expected.showChildJobs}, AI Snapshot = ${scenario.expected.showAISnapshot}`,
  );
  console.log(
    `  Got:      Child Jobs = ${result.showChildJobs}, AI Snapshot = ${result.showAISnapshot}`,
  );
  console.log(`  Result:   ${passed ? "✅ PASS" : "❌ FAIL"}\n`);
});
