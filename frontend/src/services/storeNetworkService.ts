import {
  StoreInventory,
  StoreNeed,
  InventoryMatch,
  StoreConnection,
  RealTimeNotification,
  SurplusInventoryItem,
  NetworkParticipant,
} from "../types/surplusNetwork";
import { surplusNetworkService } from "./surplusNetworkService";

export interface StoreMatchOpportunity {
  storeId: string;
  storeName: string;
  location: string;
  canProvide: {
    category: string;
    items: SurplusInventoryItem[];
    totalValue: number;
  }[];
  needsItems: {
    category: string;
    needs: StoreNeed[];
    urgency: "low" | "medium" | "high" | "critical";
  }[];
  matchScore: number;
  estimatedSavings: number;
  distance: number;
  trustScore: number;
}

export interface SmartStoreAction {
  id: string;
  type:
    | "surplus_match"
    | "need_fulfillment"
    | "store_connection"
    | "inventory_alert"
    | "network_optimization"
    | "surplus_opportunity"
    | "market_insight";
  title: string;
  description: string;
  icon: string;
  priority: "low" | "medium" | "high" | "critical";
  data?: any;
  actionUrl?: string;
  estimatedImpact: {
    costSavings: number;
    timeSavings: number;
    efficiencyGain: number;
  };
}

class StoreNetworkService {
  private storeInventories: StoreInventory[] = [];
  private storeNeeds: StoreNeed[] = [];
  private inventoryMatches: InventoryMatch[] = [];
  private storeConnections: StoreConnection[] = [];
  private notifications: RealTimeNotification[] = [];

  constructor() {
    this.initializeMockStoreData();
  }

  private initializeMockStoreData() {
    // Mock store inventories with realistic supply chain scenarios
    this.storeInventories = [
      {
        storeId: "store-1",
        storeName: "TechCorp Downtown",
        location: "San Francisco, CA",
        categories: {
          Electronics: {
            currentStock: 150,
            minThreshold: 50,
            maxThreshold: 200,
            lastUpdated: new Date(),
          },
          "Office Supplies": {
            currentStock: 25,
            minThreshold: 100,
            maxThreshold: 300,
            lastUpdated: new Date(),
          },
        },
        surplusItems: [],
        needsItems: [],
      },
      {
        storeId: "store-2",
        storeName: "Global Office Midtown",
        location: "New York, NY",
        categories: {
          Electronics: {
            currentStock: 30,
            minThreshold: 75,
            maxThreshold: 150,
            lastUpdated: new Date(),
          },
          "Office Supplies": {
            currentStock: 400,
            minThreshold: 200,
            maxThreshold: 500,
            lastUpdated: new Date(),
          },
        },
        surplusItems: [],
        needsItems: [],
      },
      {
        storeId: "store-3",
        storeName: "Seasonal Retail West",
        location: "Chicago, IL",
        categories: {
          Seasonal: {
            currentStock: 800,
            minThreshold: 200,
            maxThreshold: 600,
            lastUpdated: new Date(),
          },
          "Office Supplies": {
            currentStock: 80,
            minThreshold: 150,
            maxThreshold: 400,
            lastUpdated: new Date(),
          },
        },
        surplusItems: [],
        needsItems: [],
      },
    ];

    // Mock store needs
    this.storeNeeds = [
      {
        id: "need-1",
        storeId: "store-2",
        category: "Electronics",
        productName: "Business Laptops",
        quantityNeeded: 50,
        urgencyLevel: "high",
        maxPrice: 700,
        deliveryDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "need-2",
        storeId: "store-1",
        category: "Office Supplies",
        productName: "Printer Paper",
        quantityNeeded: 200,
        urgencyLevel: "critical",
        maxPrice: 50,
        deliveryDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "need-3",
        storeId: "store-3",
        category: "Electronics",
        productName: "Monitors",
        quantityNeeded: 25,
        urgencyLevel: "medium",
        maxPrice: 150,
        deliveryDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Initialize with surplus items from the main service
    this.updateStoreInventories();
  }

  private async updateStoreInventories() {
    const surplusItems = await surplusNetworkService.getSurplusInventory();

    // Distribute surplus items to stores based on participant ID
    this.storeInventories.forEach((store) => {
      store.surplusItems = surplusItems.filter(
        (item) =>
          item.participantId === store.storeId && item.status === "available"
      );
    });

    // Add store needs to each store
    this.storeInventories.forEach((store) => {
      store.needsItems = this.storeNeeds.filter(
        (need) => need.storeId === store.storeId
      );
    });
  }

  /**
   * Find real-time matches between store surpluses and needs
   */
  async findStoreMatches(): Promise<InventoryMatch[]> {
    await this.updateStoreInventories();

    // Clear existing matches and create new ones
    this.inventoryMatches = [];
    const matches: InventoryMatch[] = [];

    // Find matches between stores
    for (const store of this.storeInventories) {
      for (const need of store.needsItems.filter(
        (n) => n.status === "active"
      )) {
        for (const otherStore of this.storeInventories) {
          if (otherStore.storeId === store.storeId) continue;

          const matchingSurplus = otherStore.surplusItems.filter(
            (item) =>
              item.category === need.category &&
              item.quantityAvailable >= need.quantityNeeded &&
              (!need.maxPrice || item.unitPrice <= need.maxPrice) &&
              item.status === "available"
          );

          for (const surplusItem of matchingSurplus) {
            const matchScore = this.calculateMatchScore(
              surplusItem,
              need,
              store,
              otherStore
            );
            const estimatedSavings = this.calculateSavings(surplusItem, need);
            const distance = this.calculateDistance(
              store.location,
              otherStore.location
            );

            if (matchScore > 0.6) {
              // Only high-quality matches
              const match = {
                id: `match-${Date.now()}-${Math.random()}`,
                surplusItem,
                storeNeed: need,
                matchScore,
                estimatedSavings,
                distance,
                status: "pending" as const,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              matches.push(match);
              this.inventoryMatches.push(match); // Store in the service's array
            }
          }
        }
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateMatchScore(
    surplusItem: SurplusInventoryItem,
    need: StoreNeed,
    needStore: StoreInventory,
    surplusStore: StoreInventory
  ): number {
    let score = 0;

    // Quantity match (perfect match gets higher score)
    const quantityRatio =
      Math.min(surplusItem.quantityAvailable, need.quantityNeeded) /
      need.quantityNeeded;
    score += quantityRatio * 0.3;

    // Price match (within budget gets higher score)
    if (need.maxPrice && surplusItem.unitPrice <= need.maxPrice) {
      const priceRatio = 1 - surplusItem.unitPrice / need.maxPrice;
      score += priceRatio * 0.2;
    }

    // Urgency bonus
    const urgencyBonus = { low: 0.1, medium: 0.2, high: 0.3, critical: 0.4 };
    score += urgencyBonus[need.urgencyLevel];

    // Distance factor (closer is better)
    const distance = this.calculateDistance(
      needStore.location,
      surplusStore.location
    );
    const distanceScore = Math.max(0, 1 - distance / 1000); // Normalize to 1000 miles
    score += distanceScore * 0.2;

    // Trust score (if connection exists)
    const connection = this.storeConnections.find(
      (c) =>
        (c.storeId === needStore.storeId &&
          c.connectedStoreId === surplusStore.storeId) ||
        (c.storeId === surplusStore.storeId &&
          c.connectedStoreId === needStore.storeId)
    );
    if (connection) {
      score += (connection.trustScore / 5) * 0.1;
    }

    return Math.min(score, 1.0);
  }

  private calculateSavings(
    surplusItem: SurplusInventoryItem,
    need: StoreNeed
  ): number {
    // Calculate cost savings compared to retail price
    const retailPrice = surplusItem.unitPrice * 1.3; // Assume 30% markup
    const savingsPerUnit = retailPrice - surplusItem.unitPrice;
    const quantity = Math.min(
      surplusItem.quantityAvailable,
      need.quantityNeeded
    );
    return savingsPerUnit * quantity;
  }

  private calculateDistance(location1: string, location2: string): number {
    // Simplified distance calculation (in real implementation, use geocoding)
    const cities = ["San Francisco, CA", "New York, NY", "Chicago, IL"];
    const distances = [
      [0, 2900, 2100], // SF to others
      [2900, 0, 800], // NY to others
      [2100, 800, 0], // Chicago to others
    ];

    const idx1 = cities.findIndex((city) =>
      location1.includes(city.split(",")[0])
    );
    const idx2 = cities.findIndex((city) =>
      location2.includes(city.split(",")[0])
    );

    if (idx1 >= 0 && idx2 >= 0) {
      return distances[idx1][idx2];
    }
    return 500; // Default distance
  }

  /**
   * Generate smart actions for store optimization
   */
  async generateSmartStoreActions(): Promise<SmartStoreAction[]> {
    await this.updateStoreInventories(); // Ensure fresh data
    const matches = await this.findStoreMatches();
    const actions: SmartStoreAction[] = [];

    // Real-time surplus matches with actual data
    const highPriorityMatches = matches.filter((m) => m.matchScore > 0.7);
    if (highPriorityMatches.length > 0) {
      const topMatch = highPriorityMatches[0];
      const actualSavings = this.calculateRealSavings(topMatch);
      const timeToFulfill = this.calculateTimeToFulfill(topMatch);

      actions.push({
        id: `match-${topMatch.id}`,
        type: "surplus_match",
        title: `🔥 Hot Match: ${topMatch.surplusItem.productName}`,
        description: `${topMatch.storeNeed.storeId} urgently needs ${
          topMatch.storeNeed.quantityNeeded
        } units. ${Math.round(
          topMatch.matchScore * 100
        )}% match score with ${this.formatCurrency(
          actualSavings
        )} potential savings.`,
        icon: "Package",
        priority: topMatch.storeNeed.urgencyLevel,
        data: topMatch,
        actionUrl: `/matches/${topMatch.id}`,
        estimatedImpact: {
          costSavings: actualSavings,
          timeSavings: timeToFulfill,
          efficiencyGain: topMatch.matchScore,
        },
      });
    }

    // Real-time critical needs with actual fulfillment potential
    const criticalNeeds = this.storeNeeds.filter(
      (n) => n.urgencyLevel === "critical" && n.status === "active"
    );

    for (const need of criticalNeeds.slice(0, 2)) {
      // Limit to top 2 critical needs
      const canFulfill = matches.filter((m) => m.storeNeed.id === need.id);
      const totalPotentialSavings = canFulfill.reduce(
        (sum, m) => sum + this.calculateRealSavings(m),
        0
      );

      if (canFulfill.length > 0) {
        actions.push({
          id: `critical-${need.id}`,
          type: "need_fulfillment",
          title: `🚨 Critical: ${need.productName}`,
          description: `${need.quantityNeeded} units needed by ${
            need.storeId
          }. ${canFulfill.length} suppliers available. ${this.formatCurrency(
            totalPotentialSavings
          )} total savings potential.`,
          icon: "AlertTriangle",
          priority: "critical",
          data: { need, matches: canFulfill },
          actionUrl: `/needs/${need.id}`,
          estimatedImpact: {
            costSavings: totalPotentialSavings,
            timeSavings: 48, // 2 days for critical needs
            efficiencyGain: 0.95,
          },
        });
      }
    }

    // Real-time network optimization with actual partnership potential
    const networkOpportunities =
      await this.findNetworkOptimizationOpportunities();
    if (networkOpportunities.length > 0) {
      const topOpportunity = networkOpportunities[0];
      const partnershipValue = this.calculatePartnershipValue(topOpportunity);

      actions.push({
        id: `network-${topOpportunity.storeId}`,
        type: "network_optimization",
        title: `🤝 Strategic Partnership: ${topOpportunity.storeName}`,
        description: `Potential ${Math.round(
          topOpportunity.matchScore * 100
        )}% synergy score. ${this.formatCurrency(
          partnershipValue
        )} annual partnership value. ${topOpportunity.distance}km distance.`,
        icon: "TrendingUp",
        priority: "high",
        data: topOpportunity,
        actionUrl: `/network/optimize/${topOpportunity.storeId}`,
        estimatedImpact: {
          costSavings: partnershipValue,
          timeSavings: 168, // 1 week setup
          efficiencyGain: topOpportunity.matchScore,
        },
      });
    }

    // Real-time inventory alerts with actual stock levels
    const inventoryAlerts = this.generateRealTimeInventoryAlerts();
    actions.push(...inventoryAlerts);

    // Real-time surplus opportunities
    const surplusOpportunities = this.generateSurplusOpportunities();
    actions.push(...surplusOpportunities);

    // Real-time market insights
    const marketInsights = this.generateMarketInsights();
    actions.push(...marketInsights);

    return actions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async findNetworkOptimizationOpportunities(): Promise<
    StoreMatchOpportunity[]
  > {
    const opportunities: StoreMatchOpportunity[] = [];

    for (const store of this.storeInventories) {
      for (const otherStore of this.storeInventories) {
        if (store.storeId === otherStore.storeId) continue;

        const canProvide = store.surplusItems.map((item) => ({
          category: item.category,
          items: [item],
          totalValue: item.quantityAvailable * item.unitPrice,
        }));

        const needsItems = otherStore.needsItems.map((need) => ({
          category: need.category,
          needs: [need],
          urgency: need.urgencyLevel,
        }));

        if (canProvide.length > 0 || needsItems.length > 0) {
          const matchScore = this.calculateStoreMatchScore(store, otherStore);
          const estimatedSavings = this.calculateStoreSavings(
            store,
            otherStore
          );
          const distance = this.calculateDistance(
            store.location,
            otherStore.location
          );

          opportunities.push({
            storeId: otherStore.storeId,
            storeName: otherStore.storeName,
            location: otherStore.location,
            canProvide,
            needsItems,
            matchScore,
            estimatedSavings,
            distance,
            trustScore: 4.5, // Mock trust score
          });
        }
      }
    }

    return opportunities.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateStoreMatchScore(
    store1: StoreInventory,
    store2: StoreInventory
  ): number {
    let score = 0;

    // Check if stores can help each other
    const store1CanHelp = store1.surplusItems.some((item) =>
      store2.needsItems.some((need) => need.category === item.category)
    );
    const store2CanHelp = store2.surplusItems.some((item) =>
      store1.needsItems.some((need) => need.category === item.category)
    );

    if (store1CanHelp) score += 0.4;
    if (store2CanHelp) score += 0.4;

    // Geographic proximity bonus
    const distance = this.calculateDistance(store1.location, store2.location);
    const proximityScore = Math.max(0, 1 - distance / 1000);
    score += proximityScore * 0.2;

    return Math.min(score, 1.0);
  }

  private calculateStoreSavings(
    store1: StoreInventory,
    store2: StoreInventory
  ): number {
    let totalSavings = 0;

    // Calculate potential savings from store1 helping store2
    store1.surplusItems.forEach((item) => {
      const matchingNeed = store2.needsItems.find(
        (need) => need.category === item.category
      );
      if (matchingNeed) {
        const quantity = Math.min(
          item.quantityAvailable,
          matchingNeed.quantityNeeded
        );
        const retailPrice = item.unitPrice * 1.3;
        totalSavings += (retailPrice - item.unitPrice) * quantity;
      }
    });

    // Calculate potential savings from store2 helping store1
    store2.surplusItems.forEach((item) => {
      const matchingNeed = store1.needsItems.find(
        (need) => need.category === item.category
      );
      if (matchingNeed) {
        const quantity = Math.min(
          item.quantityAvailable,
          matchingNeed.quantityNeeded
        );
        const retailPrice = item.unitPrice * 1.3;
        totalSavings += (retailPrice - item.unitPrice) * quantity;
      }
    });

    return totalSavings;
  }

  private generateInventoryAlerts(): SmartStoreAction[] {
    const alerts: SmartStoreAction[] = [];

    this.storeInventories.forEach((store) => {
      Object.entries(store.categories).forEach(([category, data]) => {
        if (data.currentStock < data.minThreshold) {
          alerts.push({
            id: `alert-${store.storeId}-${category}`,
            type: "inventory_alert",
            title: `Low Stock Alert: ${category}`,
            description: `${store.storeName} has ${data.currentStock} ${category} items (min: ${data.minThreshold})`,
            icon: "AlertTriangle",
            priority:
              data.currentStock < data.minThreshold * 0.5 ? "critical" : "high",
            data: {
              store,
              category,
              currentStock: data.currentStock,
              minThreshold: data.minThreshold,
            },
            actionUrl: `/stores/${store.storeId}/inventory`,
            estimatedImpact: {
              costSavings: 0,
              timeSavings: 0,
              efficiencyGain: 0.1,
            },
          });
        }
      });
    });

    return alerts;
  }

  /**
   * Propose a match between stores
   */
  async proposeMatch(
    matchId: string,
    proposedBy: string,
    notes?: string
  ): Promise<boolean> {
    const match = this.inventoryMatches.find((m) => m.id === matchId);
    if (!match) return false;

    match.status = "proposed";
    match.proposedBy = proposedBy;
    match.proposedAt = new Date();
    match.notes = notes;
    match.updatedAt = new Date();

    // Create notification for the receiving store
    this.notifications.push({
      id: `notification-${Date.now()}`,
      storeId: match.storeNeed.storeId,
      type: "surplus_match",
      title: "New Surplus Match Proposal",
      message: `${
        match.surplusItem.productName
      } available from another store. Match score: ${Math.round(
        match.matchScore * 100
      )}%`,
      data: match,
      read: false,
      priority: match.storeNeed.urgencyLevel,
      createdAt: new Date(),
    });

    return true;
  }

  /**
   * Accept or reject a proposed match
   */
  async respondToMatch(
    matchId: string,
    accepted: boolean,
    notes?: string
  ): Promise<boolean> {
    const match = this.inventoryMatches.find((m) => m.id === matchId);
    if (!match || match.status !== "proposed") return false;

    match.status = accepted ? "accepted" : "rejected";
    match.notes = notes;
    match.updatedAt = new Date();

    if (accepted) {
      // Update inventory
      match.surplusItem.quantityAvailable -= match.storeNeed.quantityNeeded;
      if (match.surplusItem.quantityAvailable <= 0) {
        match.surplusItem.status = "transferred";
      }

      // Mark need as fulfilled
      match.storeNeed.status = "fulfilled";
      match.storeNeed.updatedAt = new Date();

      // Create or update store connection
      this.updateStoreConnection(
        match.surplusItem.participantId,
        match.storeNeed.storeId,
        match.estimatedSavings
      );
    }

    return true;
  }

  private updateStoreConnection(
    store1Id: string,
    store2Id: string,
    value: number
  ) {
    let connection = this.storeConnections.find(
      (c) =>
        (c.storeId === store1Id && c.connectedStoreId === store2Id) ||
        (c.storeId === store2Id && c.connectedStoreId === store1Id)
    );

    if (connection) {
      connection.totalTransfers += 1;
      connection.totalValue += value;
      connection.lastInteraction = new Date();
      connection.trustScore = Math.min(5, connection.trustScore + 0.1);
      connection.updatedAt = new Date();
    } else {
      connection = {
        id: `connection-${Date.now()}`,
        storeId: store1Id,
        connectedStoreId: store2Id,
        connectionType: "bidirectional",
        totalTransfers: 1,
        totalValue: value,
        lastInteraction: new Date(),
        trustScore: 4.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.storeConnections.push(connection);
    }
  }

  /**
   * Get notifications for a store
   */
  async getStoreNotifications(
    storeId: string
  ): Promise<RealTimeNotification[]> {
    return this.notifications
      .filter((n) => n.storeId === storeId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  /**
   * Calculate real savings based on current market conditions
   */
  private calculateRealSavings(match: InventoryMatch): number {
    const basePrice = match.surplusItem.unitPrice;
    const marketPrice = this.getMarketPrice(match.surplusItem.productName);
    const quantity = Math.min(
      match.surplusItem.quantityAvailable,
      match.storeNeed.quantityNeeded
    );

    // Calculate savings from avoiding market purchase
    const marketCost = marketPrice * quantity;
    const networkCost = basePrice * quantity;
    const transportCost = this.calculateTransportCost(
      match.surplusItem.location,
      match.surplusItem.location,
      quantity
    );

    return Math.max(0, marketCost - networkCost - transportCost);
  }

  /**
   * Calculate time to fulfill a match
   */
  private calculateTimeToFulfill(match: InventoryMatch): number {
    const distance = this.calculateDistance(
      match.surplusItem.location,
      match.surplusItem.location
    );
    const baseTime = 2; // 2 hours base processing
    const transportTime = distance / 50; // 50 km/h average speed
    const urgencyBonus = match.storeNeed.urgencyLevel === "critical" ? 0.5 : 1; // Critical needs get priority

    return Math.round((baseTime + transportTime) * urgencyBonus);
  }

  /**
   * Calculate partnership value between stores
   */
  private calculatePartnershipValue(
    opportunity: StoreMatchOpportunity
  ): number {
    const monthlyValue = opportunity.estimatedSavings * 12; // Annual projection
    const trustMultiplier = opportunity.trustScore / 5; // Trust score impact
    const distancePenalty = Math.max(0.5, 1 - opportunity.distance / 1000); // Distance impact

    return Math.round(monthlyValue * trustMultiplier * distancePenalty);
  }

  /**
   * Generate real-time inventory alerts
   */
  private generateRealTimeInventoryAlerts(): SmartStoreAction[] {
    const alerts: SmartStoreAction[] = [];

    // Check for low stock situations
    for (const store of this.storeInventories) {
      for (const [category, inventory] of Object.entries(store.categories)) {
        const stockLevel = inventory.currentStock / inventory.maxThreshold;

        if (stockLevel < 0.2) {
          // Below 20% stock
          const urgency = stockLevel < 0.1 ? "critical" : "high";
          const potentialSuppliers = this.findPotentialSuppliers(
            category,
            store.storeId
          );

          alerts.push({
            id: `alert-${store.storeId}-${category}`,
            type: "inventory_alert",
            title: `⚠️ Low Stock Alert: ${category}`,
            description: `${store.storeName} has ${inventory.currentStock}/${inventory.maxThreshold} ${category} units. ${potentialSuppliers.length} potential suppliers found.`,
            icon: "AlertTriangle",
            priority: urgency,
            data: { store, category, inventory, suppliers: potentialSuppliers },
            estimatedImpact: {
              costSavings: this.calculateStockoutCost(store, category),
              timeSavings: 24,
              efficiencyGain: 0.8,
            },
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Generate surplus opportunities
   */
  private generateSurplusOpportunities(): SmartStoreAction[] {
    const opportunities: SmartStoreAction[] = [];

    for (const store of this.storeInventories) {
      for (const item of store.surplusItems) {
        if (item.quantityAvailable > 50) {
          // Significant surplus
          const marketDemand = this.getMarketDemand(item.productName);
          const potentialRevenue = item.quantityAvailable * item.unitPrice;

          opportunities.push({
            id: `surplus-${item.id}`,
            type: "surplus_opportunity",
            title: `💰 Surplus Opportunity: ${item.productName}`,
            description: `${
              item.quantityAvailable
            } units available. Market demand: ${marketDemand}/10. Potential revenue: ${this.formatCurrency(
              potentialRevenue
            )}.`,
            icon: "TrendingUp",
            priority: "medium",
            data: { item, store, marketDemand, potentialRevenue },
            estimatedImpact: {
              costSavings: potentialRevenue * 0.3, // 30% of revenue as savings
              timeSavings: 72,
              efficiencyGain: 0.7,
            },
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Generate market insights
   */
  private generateMarketInsights(): SmartStoreAction[] {
    const insights: SmartStoreAction[] = [];

    // Analyze trending categories
    const trendingCategories = this.analyzeTrendingCategories();
    for (const category of trendingCategories.slice(0, 2)) {
      insights.push({
        id: `trend-${category.name}`,
        type: "market_insight",
        title: `📈 Trending: ${category.name}`,
        description: `${category.growth}% growth this month. ${category.demand} demand score. Consider stocking up.`,
        icon: "BarChart3",
        priority: "medium",
        data: { category },
        estimatedImpact: {
          costSavings: category.potentialSavings,
          timeSavings: 168,
          efficiencyGain: 0.6,
        },
      });
    }

    return insights;
  }

  /**
   * Find potential suppliers for a category
   */
  private findPotentialSuppliers(
    category: string,
    excludeStoreId: string
  ): any[] {
    return this.storeInventories
      .filter((store) => store.storeId !== excludeStoreId)
      .filter((store) =>
        store.surplusItems.some((item) => item.category === category)
      )
      .map((store) => ({
        storeId: store.storeId,
        storeName: store.storeName,
        location: store.location,
        items: store.surplusItems.filter((item) => item.category === category),
      }));
  }

  /**
   * Calculate cost of stockout
   */
  private calculateStockoutCost(
    store: StoreInventory,
    category: string
  ): number {
    const inventory = store.categories[category];
    const dailyRevenue = inventory.maxThreshold * 10; // Assume $10 per unit daily revenue
    const stockoutDays = Math.ceil(
      (inventory.maxThreshold - inventory.currentStock) / 10
    ); // Assume 10 units per day usage

    return dailyRevenue * stockoutDays * 0.5; // 50% of potential revenue lost
  }

  /**
   * Get market price for a product
   */
  private getMarketPrice(productName: string): number {
    // Simulate market price fluctuations
    const basePrices: { [key: string]: number } = {
      Laptop: 800,
      Monitor: 200,
      Keyboard: 50,
      Mouse: 25,
      Desk: 150,
      Chair: 100,
      Printer: 300,
      Scanner: 150,
    };

    const basePrice = basePrices[productName] || 100;
    const marketVariation = 0.8 + Math.random() * 0.4; // ±20% variation

    return Math.round(basePrice * marketVariation);
  }

  /**
   * Get market demand for a product
   */
  private getMarketDemand(productName: string): number {
    // Simulate market demand (1-10 scale)
    const baseDemand: { [key: string]: number } = {
      Laptop: 8,
      Monitor: 7,
      Keyboard: 6,
      Mouse: 5,
      Desk: 4,
      Chair: 6,
      Printer: 3,
      Scanner: 2,
    };

    const base = baseDemand[productName] || 5;
    const variation = Math.random() * 2 - 1; // ±1 variation

    return Math.max(1, Math.min(10, Math.round(base + variation)));
  }

  /**
   * Analyze trending categories
   */
  private analyzeTrendingCategories(): any[] {
    const categories = [
      "Electronics",
      "Furniture",
      "Office Supplies",
      "IT Equipment",
    ];

    return categories.map((category) => ({
      name: category,
      growth: Math.round(Math.random() * 50 + 10), // 10-60% growth
      demand: Math.round(Math.random() * 5 + 5), // 5-10 demand score
      potentialSavings: Math.round(Math.random() * 5000 + 1000), // $1K-$6K potential
    }));
  }

  /**
   * Calculate transport cost between locations
   */
  private calculateTransportCost(
    fromLocation: string,
    toLocation: string,
    quantity: number
  ): number {
    const distance = this.calculateDistance(fromLocation, toLocation);
    const baseRate = 0.5; // $0.50 per km
    const quantityMultiplier = Math.ceil(quantity / 10); // Every 10 units adds cost

    return Math.round(distance * baseRate * quantityMultiplier);
  }

  /**
   * Mark a match as viewed by user
   */
  async markMatchAsViewed(matchId: string): Promise<boolean> {
    const match = this.inventoryMatches.find((m) => m.id === matchId);
    if (match) {
      match.status = "proposed";
      match.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Track need fulfillment attempt
   */
  async trackNeedFulfillmentAttempt(needId: string): Promise<boolean> {
    const need = this.storeNeeds.find((n) => n.id === needId);
    if (need) {
      need.status = "active";
      need.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Mark inventory alert as addressed
   */
  async markInventoryAlertAsAddressed(
    storeId: string,
    category: string
  ): Promise<boolean> {
    // Simulate marking alert as addressed
    console.log(`Inventory alert addressed for ${storeId} - ${category}`);
    return true;
  }

  /**
   * Mark surplus opportunity as explored
   */
  async markSurplusOpportunityAsExplored(itemId: string): Promise<boolean> {
    // Simulate marking opportunity as explored
    console.log(`Surplus opportunity explored for item ${itemId}`);
    return true;
  }

  /**
   * Track market insight usage
   */
  async trackMarketInsightUsage(categoryName: string): Promise<boolean> {
    // Simulate tracking insight usage
    console.log(`Market insight used for category ${categoryName}`);
    return true;
  }

  /**
   * Create store connection
   */
  async createStoreConnection(
    store1Id: string,
    store2Id: string,
    matchScore: number
  ): Promise<boolean> {
    const connection: StoreConnection = {
      id: `connection-${Date.now()}`,
      storeId: store1Id,
      connectedStoreId: store2Id,
      connectionType: "bidirectional",
      trustScore: 4.5,
      totalTransfers: 0,
      totalValue: 0,
      lastInteraction: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.storeConnections.push(connection);
    return true;
  }

  /**
   * Apply network optimization
   */
  async applyNetworkOptimization(
    store1Id: string,
    store2Id: string,
    matchScore: number
  ): Promise<boolean> {
    // Simulate applying network optimization
    console.log(
      `Network optimization applied between ${store1Id} and ${store2Id} with ${matchScore} match score`
    );
    return true;
  }
}

export const storeNetworkService = new StoreNetworkService();
