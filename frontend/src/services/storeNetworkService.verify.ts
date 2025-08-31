// Verification script for store network service
import { storeNetworkService } from "./storeNetworkService";

async function verifyStoreNetworkService() {
  console.log("Verifying Store Network Service...");

  try {
    // Test finding store matches
    console.log("\n1. Testing store matches...");
    const matches = await storeNetworkService.findStoreMatches();
    console.log(`✓ Found ${matches.length} store matches`);

    if (matches.length > 0) {
      const topMatch = matches[0];
      console.log(
        `  Top match: ${topMatch.surplusItem.productName} -> ${topMatch.storeNeed.storeId}`
      );
      console.log(`  Match score: ${Math.round(topMatch.matchScore * 100)}%`);
      console.log(
        `  Estimated savings: $${topMatch.estimatedSavings.toFixed(2)}`
      );
    }

    // Test generating smart store actions
    console.log("\n2. Testing smart store actions...");
    const actions = await storeNetworkService.generateSmartStoreActions();
    console.log(`✓ Generated ${actions.length} smart actions`);

    actions.forEach((action, index) => {
      console.log(
        `  ${index + 1}. ${action.title} (${action.priority} priority)`
      );
      console.log(
        `     Impact: $${action.estimatedImpact.costSavings.toFixed(
          2
        )} savings, ${action.estimatedImpact.timeSavings}h time`
      );
    });

    // Test network optimization opportunities
    console.log("\n3. Testing network optimization opportunities...");
    const opportunities =
      await storeNetworkService.findNetworkOptimizationOpportunities();
    console.log(`✓ Found ${opportunities.length} optimization opportunities`);

    if (opportunities.length > 0) {
      const topOpportunity = opportunities[0];
      console.log(`  Top opportunity: ${topOpportunity.storeName}`);
      console.log(
        `  Match score: ${Math.round(topOpportunity.matchScore * 100)}%`
      );
      console.log(
        `  Potential savings: $${topOpportunity.estimatedSavings.toFixed(2)}`
      );
    }

    // Test notifications
    console.log("\n4. Testing notifications...");
    const notifications = await storeNetworkService.getStoreNotifications(
      "store-1"
    );
    console.log(`✓ Found ${notifications.length} notifications for store-1`);

    console.log("\n✅ All store network service tests passed!");
  } catch (error) {
    console.error("❌ Store network service verification failed:", error);
  }
}

// Run verification if this file is executed directly
if (typeof window === "undefined") {
  verifyStoreNetworkService();
}

export { verifyStoreNetworkService };

