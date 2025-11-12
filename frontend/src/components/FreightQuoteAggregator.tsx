
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Star, Clock, Shield, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';
import { FreightQuote as PaymentFreightQuote, ShipmentDetails, BookingData } from '@/types/payment';

// Using FreightQuote from payment types for consistency
type FreightQuote = PaymentFreightQuote;

const FreightQuoteAggregator = () => {
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails>({
    origin: '',
    destination: '',
    weight: '',
    dimensions: '',
    type: 'general'
  });
  const [quotes, setQuotes] = useState<FreightQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<FreightQuote | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const mockQuotes: FreightQuote[] = [
    {
      id: '1',
      provider: 'GlobalShip Express',
      cost: 1250,
      transitTime: '5-7 days',
      reliability: 95,
      services: ['Insurance', 'Tracking', 'Express'],
      rating: 4.8
    },
    {
      id: '2',
      provider: 'EcoFreight Solutions',
      cost: 890,
      transitTime: '8-12 days',
      reliability: 88,
      services: ['Green Shipping', 'Tracking', 'Standard'],
      rating: 4.5
    },
    {
      id: '3',
      provider: 'BudgetCargo Ltd',
      cost: 650,
      transitTime: '10-15 days',
      reliability: 82,
      services: ['Basic Tracking', 'Economy'],
      rating: 4.2
    },
    {
      id: '4',
      provider: 'PremiumLogistics Pro',
      cost: 1580,
      transitTime: '3-5 days',
      reliability: 98,
      services: ['White Glove', 'Insurance', 'Premium Tracking', 'Express'],
      rating: 4.9
    }
  ];

  const fetchQuotes = () => {
    if (!shipmentDetails.origin || !shipmentDetails.destination || !shipmentDetails.weight) {
      toast.error('Please fill in all required shipment details');
      return;
    }

    setLoading(true);

    // Simulate API aggregation from multiple providers
    setTimeout(() => {
      const sortedQuotes = [...mockQuotes].sort((a, b) => {
        // Sort by cost primarily, then by reliability
        const scoreA = a.cost + (100 - a.reliability) * 10;
        const scoreB = b.cost + (100 - b.reliability) * 10;
        return scoreA - scoreB;
      });

      setQuotes(sortedQuotes);
      setLoading(false);
      toast.success(`Found ${sortedQuotes.length} freight quotes!`);
    }, 3000);
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 95) return 'text-green-600';
    if (reliability >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">BEST VALUE</Badge>;
    if (index === 1) return <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">GOOD</Badge>;
    return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">OPTION</Badge>;
  };

  const handleBookQuote = (quote: FreightQuote) => {
    if (!shipmentDetails.origin || !shipmentDetails.destination || !shipmentDetails.weight) {
      toast.error('Please fill in all shipment details before booking');
      return;
    }

    setSelectedQuote(quote);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (booking: BookingData) => {
    setBookingData(booking);
    setIsPaymentModalOpen(false);
    toast.success(`Booking confirmed! Reference: ${booking.bookingReference}`);
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setSelectedQuote(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-white/90 backdrop-blur-md border-2 border-purple-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-purple-600" />
            Freight Quote Aggregator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
              <input
                type="text"
                value={shipmentDetails.origin}
                onChange={(e) => setShipmentDetails({ ...shipmentDetails, origin: e.target.value })}
                placeholder="e.g., Los Angeles, CA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                value={shipmentDetails.destination}
                onChange={(e) => setShipmentDetails({ ...shipmentDetails, destination: e.target.value })}
                placeholder="e.g., Miami, FL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
              <input
                type="number"
                value={shipmentDetails.weight}
                onChange={(e) => setShipmentDetails({ ...shipmentDetails, weight: e.target.value })}
                placeholder="e.g., 1200"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
              <input
                type="text"
                value={shipmentDetails.dimensions}
                onChange={(e) => setShipmentDetails({ ...shipmentDetails, dimensions: e.target.value })}
                placeholder="L x W x H (in)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cargo Type</label>
              <select
                value={shipmentDetails.type}
                onChange={(e) => setShipmentDetails({ ...shipmentDetails, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="general">General Cargo</option>
                <option value="fragile">Fragile</option>
                <option value="hazmat">Hazardous</option>
                <option value="perishable">Perishable</option>
              </select>
            </div>
          </div>
          <Button
            onClick={fetchQuotes}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {loading ? 'Fetching Quotes from Providers...' : 'Get Freight Quotes'}
          </Button>
        </CardContent>
      </Card>

      {quotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotes.map((quote, index) => (
            <Card key={quote.id} className="bg-white/90 backdrop-blur-md border-2 border-pink-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-800">{quote.provider}</CardTitle>
                  {getRankBadge(index)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(quote.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({quote.rating})</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-gray-800">${quote.cost}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">{quote.transitTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Reliability:</span>
                    <span className={`font-semibold ${getReliabilityColor(quote.reliability)}`}>
                      {quote.reliability}%
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600 mb-2 block">Services Included:</span>
                    <div className="flex flex-wrap gap-1">
                      {quote.services.map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleBookQuote(quote)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    Book with {quote.provider}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Confirmation */}
      {bookingData && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Booking Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Booking Reference:</span>
                  <div className="font-bold text-lg text-green-700">{bookingData.bookingReference}</div>
                </div>
                <div>
                  <span className="text-gray-600">Payment ID:</span>
                  <div className="font-mono text-sm text-gray-800">{bookingData.paymentId}</div>
                </div>
                <div>
                  <span className="text-gray-600">Amount Paid:</span>
                  <div className="font-semibold text-green-700">₹{bookingData.amount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-green-100 text-green-800 ml-2">
                    {bookingData.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800">
                  Your freight booking has been confirmed. You will receive tracking details via email shortly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Modal */}
      {selectedQuote && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          quote={selectedQuote}
          shipmentDetails={shipmentDetails}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default FreightQuoteAggregator;
