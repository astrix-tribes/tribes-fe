import React, { useState } from 'react';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { updateDraft, selectPostDraft } from '../../store/slices/postsSlice';
import clsx from 'clsx';

// Define location type structure
interface EventLocation {
  type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  physical?: string;
  virtual?: string;
  address?: string;
  coordinates?: {
    latitude: string;
    longitude: string;
  };
}

const EventFields: React.FC = () => {
  const dispatch = useDispatch();
  const postDraft = useSelector(selectPostDraft);
  const [locationType, setLocationType] = useState<EventLocation['type']>(
    postDraft.eventDetails?.location?.type || 'PHYSICAL'
  );

  const buttonClass = "flex items-center justify-center px-3 py-2 border border-gray-700 rounded-md text-sm font-medium";
  const selectedBtnClass = "bg-blue-600/25 text-blue-400 border-blue-500/50";
  const inputClass = "mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500";

  const handleUpdateDraft = (data: Partial<any>) => {
    dispatch(updateDraft(data));
  };

  const getLocationObject = (): EventLocation => {
    if (!postDraft.eventDetails?.location) {
      return {
        type: locationType,
        physical: locationType !== 'VIRTUAL' ? '' : undefined,
        virtual: locationType !== 'PHYSICAL' ? '' : undefined
      };
    }
    
    if (typeof postDraft.eventDetails.location === 'string') {
      return {
        type: locationType,
        physical: locationType !== 'VIRTUAL' ? postDraft.eventDetails.location : undefined,
        virtual: locationType !== 'PHYSICAL' ? postDraft.eventDetails.location : undefined
      };
    }
    
    return postDraft.eventDetails.location as EventLocation;
  };

  const handleLocationTypeChange = (type: EventLocation['type']) => {
    setLocationType(type);
    const currentLocation = getLocationObject();
    
    const newLocation: EventLocation = {
      type,
      physical: type !== 'VIRTUAL' ? currentLocation.physical || '' : undefined,
      virtual: type !== 'PHYSICAL' ? currentLocation.virtual || '' : undefined,
      address: type !== 'VIRTUAL' ? currentLocation.address || '' : undefined,
      coordinates: type !== 'VIRTUAL' ? currentLocation.coordinates : undefined
    };
    
    updateEventDetails({ location: newLocation });
  };

  const updateEventDetails = (updates: Partial<any>) => {
    handleUpdateDraft({
      eventDetails: {
        ...postDraft.eventDetails,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">Event Title</label>
        <input
          type="text"
          value={postDraft.eventDetails?.title || ''}
          onChange={(e) => updateEventDetails({ title: e.target.value })}
          placeholder="Enter event title"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Event Description</label>
        <textarea
          value={postDraft.eventDetails?.description || ''}
          onChange={(e) => updateEventDetails({ description: e.target.value })}
          placeholder="Describe your event"
          className={`${inputClass} min-h-[100px]`}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Event Start Date & Time</label>
        <input
          type="datetime-local"
          value={postDraft.eventDetails?.startDate ? 
            format(new Date(postDraft.eventDetails.startDate), "yyyy-MM-dd'T'HH:mm") :
            format(new Date(), "yyyy-MM-dd'T'HH:mm")
          }
          onChange={(e) => updateEventDetails({ startDate: new Date(e.target.value).toISOString() })}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Event End Date & Time</label>
        <input
          type="datetime-local"
          value={postDraft.eventDetails?.endDate ? 
            format(new Date(postDraft.eventDetails.endDate), "yyyy-MM-dd'T'HH:mm") :
            format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm")
          }
          onChange={(e) => updateEventDetails({ endDate: new Date(e.target.value).toISOString() })}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Location Type</label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleLocationTypeChange('PHYSICAL')}
            className={clsx(
              buttonClass,
              locationType === 'PHYSICAL' ? selectedBtnClass : 'text-gray-400 hover:bg-gray-700/30'
            )}
          >
            Physical
          </button>
          <button
            type="button"
            onClick={() => handleLocationTypeChange('VIRTUAL')}
            className={clsx(
              buttonClass,
              locationType === 'VIRTUAL' ? selectedBtnClass : 'text-gray-400 hover:bg-gray-700/30'
            )}
          >
            Virtual
          </button>
          <button
            type="button"
            onClick={() => handleLocationTypeChange('HYBRID')}
            className={clsx(
              buttonClass,
              locationType === 'HYBRID' ? selectedBtnClass : 'text-gray-400 hover:bg-gray-700/30'
            )}
          >
            Hybrid
          </button>
        </div>
      </div>

      {(locationType === 'PHYSICAL' || locationType === 'HYBRID') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300">Venue Name</label>
            <input
              type="text"
              value={getLocationObject().physical || ''}
              onChange={(e) => {
                const location = getLocationObject();
                updateEventDetails({ 
                  location: { 
                    ...location, 
                    physical: e.target.value 
                  } 
                });
              }}
              placeholder="Enter venue name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Address</label>
            <input
              type="text"
              value={getLocationObject().address || ''}
              onChange={(e) => {
                const location = getLocationObject();
                updateEventDetails({ 
                  location: { 
                    ...location, 
                    address: e.target.value 
                  } 
                });
              }}
              placeholder="Enter full address"
              className={inputClass}
            />
          </div>
        </>
      )}

      {(locationType === 'VIRTUAL' || locationType === 'HYBRID') && (
        <div>
          <label className="block text-sm font-medium text-gray-300">Virtual Meeting Link</label>
          <input
            type="text"
            value={getLocationObject().virtual || ''}
            onChange={(e) => {
              const location = getLocationObject();
              updateEventDetails({ 
                location: { 
                  ...location, 
                  virtual: e.target.value 
                } 
              });
            }}
            placeholder="Enter meeting link"
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300">Maximum Attendees</label>
        <input
          type="number"
          value={Number(postDraft.eventDetails?.capacity || 0)}
          onChange={(e) => updateEventDetails({ capacity: parseInt(e.target.value) || 0 })}
          placeholder="0 for unlimited"
          min="0"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Ticket Price (ETH)</label>
        <input
          type="number"
          value={Number(postDraft.eventDetails?.price || 0)}
          onChange={(e) => updateEventDetails({ price: parseFloat(e.target.value) || 0 })}
          placeholder="0 for free"
          min="0"
          step="0.01"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">Leave as 0 for free events</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Tickets Per Wallet</label>
        <input
          type="number"
          value={Number(postDraft.eventDetails?.perWalletLimit || 1)}
          onChange={(e) => updateEventDetails({ perWalletLimit: parseInt(e.target.value) || 1 })}
          placeholder="Maximum tickets per wallet"
          min="1"
          className={inputClass}
        />
      </div>
    </div>
  );
};

export default EventFields; 