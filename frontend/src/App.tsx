import { Toaster } from "@/components/ui/toaster";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import QuestionsPage from "./pages/QuestionsPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InventorySpotterPage from "./pages/InventorySpotterPage";
import ParcelComplianceCheckerPage from "./pages/ParcelComplianceCheckerPage";
import DriverViewPage from "./pages/DriverViewPage";
import FreightQuoteAggregatorPage from "./pages/FreightQuoteAggregatorPage";
import RiskDashboardPage from "./pages/RiskDashboardPage";
import DemandForecastingPage from "./pages/DemandForecastingPage";
import TeamCollaborationPage from "./pages/TeamCollaborationPage";
import BlockchainProvenancePage from "./pages/BlockchainProvenancePage";
import LogisticsPage from "./pages/LogisticsPage";
import SurplusRescueNetworkDashboardDemo from "./pages/SurplusRescueNetworkDashboardDemo";
import SurplusRescueNetworkPage from "./pages/SurplusRescueNetworkPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />

      <BrowserRouter
        future={{
          v7_startTransition: true,
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/dashboard" element={<Index />} /> {/* Renamed root to dashboard */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/inventory-spotter" element={<InventorySpotterPage />} />
          <Route path="/compliance-checker" element={<ParcelComplianceCheckerPage />} />
          <Route path="/driver-view" element={<DriverViewPage />} />
          <Route path="/freight-quotes" element={<FreightQuoteAggregatorPage />} />
          <Route path="/risk-dashboard" element={<RiskDashboardPage />} />
          <Route path="/demand-forecasting" element={<DemandForecastingPage />} />
          <Route path="/team-collaboration" element={<TeamCollaborationPage />} />
          <Route path="/blockchain-provenance" element={<BlockchainProvenancePage />} />
          <Route path="/logistics" element={<LogisticsPage />} />
          <Route path="/surplus-rescue" element={<SurplusRescueNetworkPage />} />
          <Route path="/surplus-rescue-dashboard-demo" element={<SurplusRescueNetworkDashboardDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
