import { analyzeEnvironmentalImage, computeImageHash, computePerceptualHash } from '../lib/ai/vision-analyzer';

async function testAIScenarios() {
  console.log('--- Testing Advanced AI Vision Scenarios ---');

  const ruleConfigs = [
    {
      slug: 'tree-plantation',
      name: 'Tree Plantation & Urban Gardening',
      minConfidence: 0.80,
      autoApproveEnabled: true,
      baseCoins: 100,
      co2OffsetKg: 15,
    },
    {
      slug: 'waste-recycling',
      name: 'Waste Segregation & Recycling',
      minConfidence: 0.75,
      autoApproveEnabled: true,
      baseCoins: 40,
      co2OffsetKg: 2,
    },
    {
      slug: 'composting',
      name: 'Composting & Organic Waste',
      minConfidence: 0.80,
      autoApproveEnabled: true,
      baseCoins: 60,
      co2OffsetKg: 4,
    },
  ];

  // Scenario 1: Authentic botanical scene (high entropy, high green & soil chromaticity)
  // Create a 64KB synthetic buffer with green foliage and earth soil patterns
  const botanicalBuffer = Buffer.alloc(65536);
  for (let i = 0; i < botanicalBuffer.length; i += 3) {
    // Generate realistic foliage RGB: R ~ 35, G ~ 160, B ~ 45 with random texture noise
    const noise = Math.floor(Math.sin(i) * 20);
    botanicalBuffer[i] = Math.max(10, Math.min(255, 35 + noise));     // Red
    botanicalBuffer[i + 1] = Math.max(10, Math.min(255, 160 + noise)); // High Green
    botanicalBuffer[i + 2] = Math.max(10, Math.min(255, 45 + noise));  // Blue
  }

  const result1 = await analyzeEnvironmentalImage(
    botanicalBuffer,
    'image/jpeg',
    'tree-plantation',
    ruleConfigs
  );

  console.log('\n[Scenario 1: Botanical Foliage Evidence]');
  console.log(`Detected Activity: ${result1.detectedActivity}`);
  console.log(`Category: ${result1.categoryName}`);
  console.log(`Confidence: ${(result1.confidenceScore * 100).toFixed(1)}%`);
  console.log(`Is Suspicious: ${result1.isSuspicious}`);
  console.log(`Auto-Approve Eligible: ${result1.autoApproveEligible}`);
  console.log(`Markers: ${result1.detectedObjects.join(', ')}`);

  // Scenario 2: Flat solid color / blank capture (low entropy fraud attempt)
  const solidBuffer = Buffer.alloc(32768, 255); // Pure white solid image

  const result2 = await analyzeEnvironmentalImage(
    solidBuffer,
    'image/jpeg',
    'tree-plantation',
    ruleConfigs
  );

  console.log('\n[Scenario 2: Blank Solid Frame (Fraud Attempt)]');
  console.log(`Detected Activity: ${result2.detectedActivity}`);
  console.log(`Confidence: ${(result2.confidenceScore * 100).toFixed(1)}%`);
  console.log(`Is Suspicious: ${result2.isSuspicious}`);
  console.log(`Suspicion Reason: ${result2.suspicionReason}`);
  console.log(`Auto-Approve Eligible: ${result2.autoApproveEligible}`);

  // Scenario 3: Recyclable dry plastics (realistic photo with sensor variance and packaging colors)
  const recyclingBuffer = Buffer.alloc(65536);
  for (let i = 0; i < recyclingBuffer.length; i += 3) {
    const cycle = i % 18;
    // Base packaging colors + pseudo-random camera sensor noise across full spectrum
    const noise = (i * 7 + 13) % 45;
    recyclingBuffer[i] = Math.max(10, Math.min(250, (cycle < 6 ? 200 : cycle < 12 ? 30 : 180) + noise));
    recyclingBuffer[i + 1] = Math.max(10, Math.min(250, (cycle < 6 ? 190 : cycle < 12 ? 140 : 170) + noise));
    recyclingBuffer[i + 2] = Math.max(10, Math.min(250, (cycle < 6 ? 210 : cycle < 12 ? 220 : 35) + noise));
  }

  const result3 = await analyzeEnvironmentalImage(
    recyclingBuffer,
    'image/jpeg',
    'waste-recycling',
    ruleConfigs
  );

  console.log('\n[Scenario 3: Dry Recyclables Sorting Evidence]');
  console.log(`Detected Activity: ${result3.detectedActivity}`);
  console.log(`Confidence: ${(result3.confidenceScore * 100).toFixed(1)}%`);
  console.log(`Is Suspicious: ${result3.isSuspicious}`);
  console.log(`Suspicion Reason: ${result3.suspicionReason}`);
  console.log(`Auto-Approve Eligible: ${result3.autoApproveEligible}`);
  console.log(`Markers: ${result3.detectedObjects.join(', ')}`);

  console.log('\n--- AI Vision Scenarios Verification Complete ---');
}

testAIScenarios().catch(console.error);
