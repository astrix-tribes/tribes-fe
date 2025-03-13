import React, { useState, useEffect } from 'react';
import { getEvent, purchaseTickets, cancelEvent, getTicketBalance } from '../../utils/eventHelpers';
import { format } from 'date-fns';
import { ethers } from 'ethers';

interface EventDetailsProps {
  eventId: number;
  isOrganizer?: boolean;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventId, isOrganizer = false }) => {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketAmount, setTicketAmount] = useState(1);
  const [ticketBalance, setTicketBalance] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEvent(eventId);
        setEvent(eventData);
        
        // Get user's ticket balance
        const balance = await getTicketBalance(eventId);
        setTicketBalance(balance);
      } catch (err: any) {
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handlePurchase = async () => {
    try {
      setProcessing(true);
      await purchaseTickets(eventId, ticketAmount);
      
      // Refresh event data and ticket balance
      const eventData = await getEvent(eventId);
      setEvent(eventData);
      
      const balance = await getTicketBalance(eventId);
      setTicketBalance(balance);
      
      alert(`Successfully purchased ${ticketAmount} ticket(s)!`);
    } catch (err: any) {
      setError(err.message || 'Failed to purchase tickets');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this event?')) {
      return;
    }
    
    try {
      setProcessing(true);
      await cancelEvent(eventId);
      
      // Refresh event data
      const eventData = await getEvent(eventId);
      setEvent(eventData);
      
      alert('Event successfully canceled');
    } catch (err: any) {
      setError(err.message || 'Failed to cancel event');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading event details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!event) {
    return <div className="p-4 text-center">Event not found</div>;
  }

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'PPP p');
  };

  const formatPrice = (priceWei: string) => {
    return `${ethers.formatEther(priceWei)} ETH`;
  };

  const ticketsRemaining = Number(event.maxTickets) - Number(event.ticketsSold);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">{event.title}</h2>
      
      <div className="mb-6">
        <p className="text-gray-300 mb-4">{event.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Event Details</h3>
            <p className="text-gray-300">
              <span className="font-medium">Start:</span> {formatDate(event.startDate)}
            </p>
            <p className="text-gray-300">
              <span className="font-medium">End:</span> {formatDate(event.endDate)}
            </p>
            <p className="text-gray-300">
              <span className="font-medium">Organizer:</span> {event.organizer}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
            {event.location?.type === 'PHYSICAL' && (
              <>
                <p className="text-gray-300">{event.location.physical}</p>
                <p className="text-gray-300">{event.location.address}</p>
              </>
            )}
            {event.location?.type === 'VIRTUAL' && (
              <p className="text-gray-300">
                <a href={event.location.virtual} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-400 hover:underline">
                  Virtual Meeting Link
                </a>
              </p>
            )}
            {event.location?.type === 'HYBRID' && (
              <>
                <p className="text-gray-300">{event.location.physical}</p>
                <p className="text-gray-300">{event.location.address}</p>
                <p className="text-gray-300 mt-2">
                  <a href={event.location.virtual} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-400 hover:underline">
                    Virtual Meeting Link
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Ticket Information</h3>
          <p className="text-gray-300">
            <span className="font-medium">Price:</span> {formatPrice(event.price)}
          </p>
          <p className="text-gray-300">
            <span className="font-medium">Available:</span> {ticketsRemaining} of {event.maxTickets}
          </p>
          <p className="text-gray-300">
            <span className="font-medium">Your tickets:</span> {ticketBalance}
          </p>
        </div>
      </div>
      
      {event.active ? (
        <div className="flex flex-col md:flex-row gap-4">
          {!isOrganizer && (
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-white">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={ticketsRemaining}
                  value={ticketAmount}
                  onChange={(e) => setTicketAmount(Math.min(Number(e.target.value), ticketsRemaining))}
                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                  disabled={processing || ticketsRemaining === 0}
                />
              </div>
              <button
                onClick={handlePurchase}
                disabled={processing || ticketsRemaining === 0}
                className={`w-full py-2 px-4 rounded font-medium ${
                  processing || ticketsRemaining === 0
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {processing ? 'Processing...' : ticketsRemaining === 0 ? 'Sold Out' : `Purchase Tickets (${formatPrice(ethers.parseEther(String(event.price)).mul(ticketAmount).toString())})`}
              </button>
            </div>
          )}
          
          {isOrganizer && (
            <button
              onClick={handleCancel}
              disabled={processing || !event.active}
              className={`w-full md:w-auto py-2 px-4 rounded font-medium ${
                processing || !event.active
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {processing ? 'Processing...' : 'Cancel Event'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg">
          This event has been canceled.
        </div>
      )}
    </div>
  );
};

export default EventDetails; 