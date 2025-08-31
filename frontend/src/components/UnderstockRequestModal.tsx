import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  X,
  Package,
  AlertTriangle,
  Clock,
  Loader2,
  CheckCircle,
  Store,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  smartActionsService,
  NetworkConnection,
} from "@/services/smartActionsService";
import { SurplusInventoryItem } from "@/types/surplusNetwork";

interface UnderstockRequestModalProps {
  category: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (matchFound: boolean, matches?: SurplusInventoryItem[]) => void;
}

const UnderstockRequestModal = ({
  category,
  isOpen,
  onClose,
  onSuccess,
}: UnderstockRequestModalProps) => {
  // State management for the modal's functionality
  const [quantity, setQuantity] = useState(5);
  const [urgency, setUrgency] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState<
    SurplusInventoryItem[]
  >([]);
  const [matchFound, setMatchFound] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionResults, setConnectionResults] = useState<
    NetworkConnection[]
  >([]);
  const [showConnectionResults, setShowConnectionResults] = useState(false);

  // FIX: Added useEffect to reset state when the modal is opened.
  // This ensures the modal doesn't show old data from a previous session.
  useEffect(() => {
    if (isOpen) {
      setQuantity(5);
      setUrgency("medium");
      setNotes("");
      setLoading(false);
      setPotentialMatches([]);
      setMatchFound(false);
      setShowMatches(false);
      setConnecting(false);
      setConnectionResults([]);
      setShowConnectionResults(false);
    }
  }, [isOpen]);

  // FIX: Simplified the logic in handleSubmit to avoid code repetition.
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await smartActionsService.createUnderstockRequest(
        category,
        quantity,
        urgency
      );

      // Handle found matches first, as this is the primary positive outcome.
      if (
        result.matchFound &&
        result.potentialMatches &&
        result.potentialMatches.length > 0
      ) {
        setPotentialMatches(result.potentialMatches);
        setMatchFound(true);
        setShowMatches(true);
        toast.success("Potential matches found! Review available items.");
      } else if (result.success) {
        // Handle success case where no matches were found.
        toast.success(result.message || "Request created successfully.");
        onSuccess?.(false);
        onClose();
      } else {
        // Handle failure case where no matches were found.
        toast.error(result.message || "Failed to create request.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWithMatch = async () => {
    setConnecting(true);
    const uniqueParticipants = Array.from(
      new Set(potentialMatches.map((item) => item.participantId))
    );
    const results: NetworkConnection[] = [];

    // Loop through unique participants to establish connections.
    for (const participantId of uniqueParticipants) {
      const participantMatches = potentialMatches.filter(
        (item) => item.participantId === participantId
      );
      const categoriesToConnect = Array.from(
        new Set(participantMatches.map((item) => item.category))
      );

      for (const cat of categoriesToConnect) {
        const itemsForCategory = participantMatches.filter(
          (item) => item.category === cat
        );
        const result = await smartActionsService.connectWithParticipant(
          participantId,
          cat,
          itemsForCategory
        );
        results.push(result);
      }
    }

    setConnectionResults(results);
    setConnecting(false);
    setShowConnectionResults(true);
  };

  const handleCloseConnectionResults = () => {
    setShowConnectionResults(false);
    onSuccess?.(true, potentialMatches);
    onClose();
  };

  // Utility function to get Tailwind CSS classes based on urgency level.
  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!isOpen) return null;

  // FIX: Removed the duplicate, unreachable return statement. The component now returns a single, logical JSX block.
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white overflow-hidden max-h-[90vh] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Request {category} Items
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto">
          {/* View for Connection Results */}
          {showConnectionResults ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Connection Results
              </h3>
              {connectionResults.length > 0 ? (
                <div className="space-y-3">
                  {connectionResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-md shadow-sm"
                    >
                      {result.success ? (
                        <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                      ) : (
                        <X className="text-red-500 w-5 h-5 flex-shrink-0" />
                      )}
                      <div className="flex-grow">
                        <p className="font-medium text-gray-700">
                          {result.success
                            ? `Successfully connected with ${result.participantName}`
                            : `Failed to connect with ${result.participantName}`}{" "}
                          for {result.category}
                        </p>
                        {!result.success && result.message && (
                          <p className="text-sm text-red-500">
                            Reason: {result.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No connection attempts were made.
                </p>
              )}
              <Button
                onClick={handleCloseConnectionResults}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Done
              </Button>
            </div>
          ) : (
            // View for Form and Matches
            <>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Understock Detected
                  </span>
                </div>
                <p className="text-sm text-orange-700">
                  Current demand for {category} items exceeds available supply.
                  Create a request to find items from network partners.
                </p>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Needed
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Urgency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["low", "medium", "high", "critical"] as const).map(
                    (level) => (
                      <button
                        key={level}
                        onClick={() => setUrgency(level)}
                        className={`p-2 text-sm rounded-md border-2 transition-colors ${
                          urgency === level
                            ? getUrgencyColor(level)
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-1 justify-center">
                          {level === "critical" && (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {level === "high" && <Clock className="w-3 h-3" />}
                          <span className="capitalize">{level}</span>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify any particular requirements or preferences..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Conditional Display for Potential Matches */}
              {showMatches && matchFound && (
                <div className="border border-green-200 rounded-lg overflow-hidden">
                  <div className="bg-green-50 p-3 flex items-center gap-2">
                    <CheckCircle className="text-green-600 w-5 h-5" />
                    <h3 className="font-medium text-green-800">
                      Potential Matches Found!
                    </h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {potentialMatches.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border-t border-green-100 hover:bg-green-50"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-900">
                            {item.productName}
                          </h4>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            {item.quantityAvailable} available
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          <span>{item.location}</span>
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-2">
                          {item.description}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-green-50 border-t border-green-200">
                    <Button
                      onClick={handleConnectWithMatch}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={connecting}
                    >
                      {connecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" /> Connect with
                          Matches
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Conditional Action Button */}
              {!showMatches && (
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                      Request...
                    </>
                  ) : (
                    "Create Request"
                  )}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnderstockRequestModal;
