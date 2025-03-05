import React, { useState, useEffect } from 'react';
import { PostType } from '../../types/post';
import { Upload, Plus, Trash, MapPin, Video } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDraft, selectPostDraft } from '../../store/slices/postsSlice';
import clsx from 'clsx';
import { format } from 'date-fns';
import { EventDetails } from '../../types/event';

// Define all necessary interfaces
interface PollOption {
  id: string;
  text: string;
  votes?: number;
}

interface EventLocation {
  type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  physical?: string;
  virtual?: string;
}

interface MediaContent {
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
}

interface Milestone {
  title: string;
  dueDate: string;
  completed?: boolean;
}

interface Attachment {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface PostCreateParams {
  title?: string;
  content: string;
  type: string;
  tribeId?: string;
  description?: string;
  tags?: string[];
  eventDetails?: {
    title?: string;
    organizer?: string;
    startDate: string;
    endDate: string;
    location: EventLocation | string;
    maxTickets: number;
    price: number;
  };
  pollDetails?: {
    options: PollOption[];
    endDate: string;
    allowMultipleChoices: boolean;
    requireVerification: boolean;
  };
  projectDetails?: {
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
    budget?: string;
    team?: string[];
    milestones?: Milestone[];
  };
  resourceDetails?: {
    type: 'DOCUMENT' | 'LINK' | 'CODE' | 'OTHER';
    category?: string;
    version?: string;
    attachments?: Attachment[];
  };
  mediaContent?: MediaContent[];
}

// Use the same mapping as PostTypeMapper for consistency
const POST_TYPE_MAPPING = {
  [PostType.TEXT]: 'text',
  [PostType.IMAGE]: 'image',
  [PostType.VIDEO]: 'video',
  [PostType.LINK]: 'link',
  [PostType.EVENT]: 'event',
  [PostType.POLL]: 'poll',
  PROJECT: 'project',
  RESOURCE: 'resource',
  RICH_MEDIA: 'rich_media'
} as const;

type PostTypeString = typeof POST_TYPE_MAPPING[keyof typeof POST_TYPE_MAPPING];

interface PostTypeFieldsProps {
  type: PostTypeString;
}

// Style constants
const inputClass = "mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500";
const buttonClass = "flex items-center justify-center px-3 py-2 border border-gray-700 rounded-md text-sm font-medium";
const selectedBtnClass = "bg-blue-600/25 text-blue-400 border-blue-500/50";
const actionBtnClass = "p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors";

// Extended media type to handle audio
type ExtendedMediaType = 'image' | 'video' | 'audio';

const PostTypeFields: React.FC<PostTypeFieldsProps> = ({ type }) => {
  const dispatch = useDispatch();
  const postDraft = useSelector(selectPostDraft);

  const handleUpdateDraft = (data: Partial<PostCreateParams>) => {
    // Create a compatible object for the Redux dispatch
    // If eventDetails exists, ensure it's compatible with what Redux expects
    const compatibleData: any = { ...data };
    
    if (compatibleData.eventDetails) {
      // Make sure title and organizer are not undefined
      compatibleData.eventDetails = {
        ...compatibleData.eventDetails,
        title: compatibleData.eventDetails.title || postDraft.title || '',
        organizer: compatibleData.eventDetails.organizer || ''
      };
    }
    
    dispatch(updateDraft(compatibleData));
  };

  const renderEventFields = () => {
    const [locationType, setLocationType] = useState<EventLocation['type']>('PHYSICAL');

    const defaultLocation: EventLocation = {
      type: locationType,
      physical: locationType !== 'VIRTUAL' ? '' : undefined,
      virtual: locationType !== 'PHYSICAL' ? '' : undefined
    };

    const getLocationObject = (): EventLocation => {
      if (!postDraft.eventDetails?.location) return defaultLocation;
      
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
        virtual: type !== 'PHYSICAL' ? currentLocation.virtual || '' : undefined
      };
      
      handleUpdateDraft({
        eventDetails: {
          title: postDraft.eventDetails?.title || postDraft.title || '',
          organizer: postDraft.eventDetails?.organizer || '',
          startDate: postDraft.eventDetails?.startDate || new Date().toISOString(),
          endDate: postDraft.eventDetails?.endDate || new Date().toISOString(),
          location: newLocation,
          maxTickets: Number(postDraft.eventDetails?.maxTickets || 0),
          price: Number(postDraft.eventDetails?.price || 0)
        }
      });
    };

    const fixPhysicalLocation = (e: React.ChangeEvent<HTMLInputElement>) => {
      const currentLocation = getLocationObject();
      
      const newLocation: EventLocation = {
        ...currentLocation,
        physical: e.target.value
      };
      
      handleUpdateDraft({
        eventDetails: {
          title: postDraft.eventDetails?.title || postDraft.title || '',
          organizer: postDraft.eventDetails?.organizer || '',
          startDate: postDraft.eventDetails?.startDate || new Date().toISOString(),
          endDate: postDraft.eventDetails?.endDate || new Date().toISOString(),
          location: newLocation,
          maxTickets: Number(postDraft.eventDetails?.maxTickets || 0),
          price: Number(postDraft.eventDetails?.price || 0)
        }
      });
    };

    const fixVirtualLocation = (e: React.ChangeEvent<HTMLInputElement>) => {
      const currentLocation = getLocationObject();
      
      const newLocation: EventLocation = {
        ...currentLocation,
        virtual: e.target.value
      };
      
      handleUpdateDraft({
        eventDetails: {
          title: postDraft.eventDetails?.title || postDraft.title || '',
          organizer: postDraft.eventDetails?.organizer || '',
          startDate: postDraft.eventDetails?.startDate || new Date().toISOString(),
          endDate: postDraft.eventDetails?.endDate || new Date().toISOString(),
          location: newLocation,
          maxTickets: Number(postDraft.eventDetails?.maxTickets || 0),
          price: Number(postDraft.eventDetails?.price || 0)
        }
      });
    };

    const fixMaxTickets = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleUpdateDraft({
        eventDetails: {
          title: postDraft.eventDetails?.title || postDraft.title || '',
          organizer: postDraft.eventDetails?.organizer || '',
          startDate: postDraft.eventDetails?.startDate || new Date().toISOString(),
          endDate: postDraft.eventDetails?.endDate || new Date().toISOString(),
          location: getLocationObject(),
          maxTickets: parseInt(e.target.value) || 0,
          price: Number(postDraft.eventDetails?.price || 0)
        }
      });
    };

    const fixPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleUpdateDraft({
        eventDetails: {
          title: postDraft.eventDetails?.title || postDraft.title || '',
          organizer: postDraft.eventDetails?.organizer || '',
          startDate: postDraft.eventDetails?.startDate || new Date().toISOString(),
          endDate: postDraft.eventDetails?.endDate || new Date().toISOString(),
          location: getLocationObject(),
          maxTickets: Number(postDraft.eventDetails?.maxTickets || 0),
          price: parseFloat(e.target.value) || 0
        }
      });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Event Start Date & Time</label>
          <input
            type="datetime-local"
            value={postDraft.eventDetails?.startDate ? 
              format(new Date(postDraft.eventDetails.startDate), "yyyy-MM-dd'T'HH:mm") :
              format(new Date(), "yyyy-MM-dd'T'HH:mm")
            }
            onChange={(e) => {
              const eventDetails = {
                title: postDraft.eventDetails?.title || postDraft.title || '',
                organizer: postDraft.eventDetails?.organizer || '',
                startDate: new Date(e.target.value).toISOString(),
                endDate: postDraft.eventDetails?.endDate || new Date().toISOString(),
                location: getLocationObject(),
                maxTickets: Number(postDraft.eventDetails?.maxTickets || 0),
                price: Number(postDraft.eventDetails?.price || 0)
              };
              handleUpdateDraft({ eventDetails });
            }}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            onChange={(e) => {
              const eventDetails = {
                title: postDraft.eventDetails?.title || postDraft.title || '',
                organizer: postDraft.eventDetails?.organizer || '',
                startDate: postDraft.eventDetails?.startDate || new Date().toISOString(),
                endDate: new Date(e.target.value).toISOString(),
                location: getLocationObject(),
                maxTickets: Number(postDraft.eventDetails?.maxTickets || 0),
                price: Number(postDraft.eventDetails?.price || 0)
              };
              handleUpdateDraft({ eventDetails });
            }}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-300">Physical Location</label>
            <input
              type="text"
              value={getLocationObject().physical || ''}
              onChange={fixPhysicalLocation}
              placeholder="Enter physical address"
              className={inputClass}
            />
          </div>
        )}

        {(locationType === 'VIRTUAL' || locationType === 'HYBRID') && (
          <div>
            <label className="block text-sm font-medium text-gray-300">Virtual Meeting Link</label>
            <input
              type="text"
              value={getLocationObject().virtual || ''}
              onChange={fixVirtualLocation}
              placeholder="Enter meeting link"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300">Maximum Attendees</label>
          <input
            type="number"
            value={Number(postDraft.eventDetails?.maxTickets || 0)}
            onChange={fixMaxTickets}
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
            onChange={fixPrice}
            placeholder="0 for free"
            min="0"
            step="0.01"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">Leave as 0 for free events</p>
        </div>
      </div>
    );
  };

  const renderPollFields = () => {
    const [newOption, setNewOption] = useState('');
    const currentOptions = postDraft.pollDetails?.options || [];
    
    const handleAddOption = () => {
      if (!newOption.trim()) return;
      
      const newPollOption: PollOption = {
        id: Date.now().toString(),
        text: newOption.trim(),
        votes: 0
      };
      
      handleUpdateDraft({
        pollDetails: {
          options: [...currentOptions, newPollOption],
          endDate: postDraft.pollDetails?.endDate || new Date().toISOString(),
          allowMultipleChoices: postDraft.pollDetails?.allowMultipleChoices ?? false,
          requireVerification: postDraft.pollDetails?.requireVerification ?? false
        }
      });
      setNewOption('');
    };

    const handleRemoveOption = (index: number) => {
      const newOptions = currentOptions.filter(filterByIndex(index));
      handleUpdateDraft({
        pollDetails: {
          options: newOptions,
          endDate: postDraft.pollDetails?.endDate || new Date().toISOString(),
          allowMultipleChoices: postDraft.pollDetails?.allowMultipleChoices ?? false,
          requireVerification: postDraft.pollDetails?.requireVerification ?? false
        }
      });
    };

    const fixPollEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleUpdateDraft({
        pollDetails: {
          options: postDraft.pollDetails?.options || [],
          ...postDraft.pollDetails,
          endDate: e.target.value
        }
      });
    };

    const fixPollMultipleChoices = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleUpdateDraft({
        pollDetails: {
          options: postDraft.pollDetails?.options || [],
          ...postDraft.pollDetails,
          allowMultipleChoices: e.target.checked
        }
      });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Poll Options</label>
          <div className="space-y-2 mt-2">
            {currentOptions.map((option: PollOption, index: number) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...currentOptions];
                    newOptions[index] = {
                      ...option,
                      text: e.target.value
                    };
                    handleUpdateDraft({
                      pollDetails: {
                        options: newOptions,
                        endDate: postDraft.pollDetails?.endDate || new Date().toISOString(),
                        allowMultipleChoices: postDraft.pollDetails?.allowMultipleChoices ?? false,
                        requireVerification: postDraft.pollDetails?.requireVerification ?? false
                      }
                    });
                  }}
                  className={inputClass}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className={clsx(actionBtnClass, "text-red-500")}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex mt-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="flex-1 rounded-l-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add new option"
            />
            <button
              type="button"
              onClick={handleAddOption}
              disabled={currentOptions.length >= 10 || !newOption.trim()}
              className={clsx(
                "px-3 py-2 bg-blue-600 text-white rounded-r-md disabled:opacity-50",
                currentOptions.length < 10 && newOption.trim() && "hover:bg-blue-700"
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {currentOptions.length >= 10 && (
            <p className="text-xs text-red-400 mt-1">Maximum 10 options allowed</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300">End Date</label>
          <input
            type="datetime-local"
            value={postDraft.pollDetails?.endDate || ''}
            onChange={fixPollEndDate}
            className={inputClass}
            required
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowMultipleChoices"
            checked={postDraft.pollDetails?.allowMultipleChoices || false}
            onChange={fixPollMultipleChoices}
            className="h-4 w-4 bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500 rounded"
          />
          <label htmlFor="allowMultipleChoices" className="ml-2 block text-sm text-gray-300">
            Allow users to select multiple options
          </label>
        </div>
      </div>
    );
  };

  const renderProjectFields = () => {
    const handleRemoveMilestone = (index: number) => {
      const newMilestones = (postDraft.projectDetails?.milestones || []).filter(filterByIndex(index));
      handleUpdateDraft({
        projectDetails: {
          ...postDraft.projectDetails,
          milestones: newMilestones
        }
      });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Project Status</label>
          <select
            value={postDraft.projectDetails?.status || 'PLANNING'}
            onChange={(e) => handleUpdateDraft({
              projectDetails: {
                ...postDraft.projectDetails,
                status: e.target.value as 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED'
              }
            })}
            className={inputClass}
          >
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300">Budget (Optional)</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">ETH</span>
            </div>
            <input
              type="text"
              value={postDraft.projectDetails?.budget || ''}
              onChange={(e) => handleUpdateDraft({
                projectDetails: {
                  ...postDraft.projectDetails,
                  budget: e.target.value
                }
              })}
              className="pl-14 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300">Team Members (Optional)</label>
          <input
            type="text"
            value={postDraft.projectDetails?.team?.join(', ') || ''}
            onChange={(e) => handleUpdateDraft({
              projectDetails: {
                ...postDraft.projectDetails,
                team: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
              }
            })}
            className={inputClass}
            placeholder="Enter comma-separated addresses"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Milestones</label>
          <div className="space-y-4">
            {(postDraft.projectDetails?.milestones || []).map((milestone: Milestone, index: number) => (
              <div key={index} className="p-3 border border-gray-700 bg-gray-800/50 rounded-md">
                <div className="flex justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-300">Milestone {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(index)}
                    className={clsx(actionBtnClass, "text-red-500")}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-400">Title</label>
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => {
                        const newMilestones = [...(postDraft.projectDetails?.milestones || [])];
                        newMilestones[index] = {
                          ...milestone,
                          title: e.target.value
                        };
                        handleUpdateDraft({
                          projectDetails: {
                            ...postDraft.projectDetails,
                            milestones: newMilestones
                          }
                        });
                      }}
                      className={inputClass}
                      placeholder="Milestone title"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400">Due Date</label>
                      <input
                        type="date"
                        value={milestone.dueDate || ''}
                        onChange={(e) => {
                          const newMilestones = [...(postDraft.projectDetails?.milestones || [])];
                          newMilestones[index] = {
                            ...milestone,
                            dueDate: e.target.value
                          };
                          handleUpdateDraft({
                            projectDetails: {
                              ...postDraft.projectDetails,
                              milestones: newMilestones
                            }
                          });
                        }}
                        className={inputClass}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400">Status</label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="checkbox"
                          id={`milestone-${index}-completed`}
                          checked={milestone.completed || false}
                          onChange={(e) => {
                            const newMilestones = [...(postDraft.projectDetails?.milestones || [])];
                            newMilestones[index] = {
                              ...milestone,
                              completed: e.target.checked
                            };
                            handleUpdateDraft({
                              projectDetails: {
                                ...postDraft.projectDetails,
                                milestones: newMilestones
                              }
                            });
                          }}
                          className="h-4 w-4 bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <label htmlFor={`milestone-${index}-completed`} className="ml-2 block text-sm text-gray-300">
                          Completed
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => handleUpdateDraft({
                projectDetails: {
                  ...postDraft.projectDetails,
                  milestones: [
                    ...(postDraft.projectDetails?.milestones || []),
                    { title: '', dueDate: '' }
                  ]
                }
              })}
              className="w-full py-2 border-2 border-dashed border-gray-700 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-300 hover:border-gray-600 bg-gray-800/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add Milestone</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResourceFields = () => {
    const handleRemoveAttachment = (index: number) => {
      const newAttachments = (postDraft.resourceDetails?.attachments || []).filter(filterByIndex(index));
      handleUpdateDraft({
        resourceDetails: {
          ...postDraft.resourceDetails,
          attachments: newAttachments
        }
      });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Resource Type</label>
          <select
            value={postDraft.resourceDetails?.type || 'DOCUMENT'}
            onChange={(e) => handleUpdateDraft({
              resourceDetails: {
                ...postDraft.resourceDetails,
                type: e.target.value as 'DOCUMENT' | 'LINK' | 'CODE' | 'OTHER'
              }
            })}
            className={inputClass}
          >
            <option value="DOCUMENT">Document</option>
            <option value="LINK">Link</option>
            <option value="CODE">Code</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300">Category (Optional)</label>
          <input
            type="text"
            value={postDraft.resourceDetails?.category || ''}
            onChange={(e) => handleUpdateDraft({
              resourceDetails: {
                ...postDraft.resourceDetails,
                category: e.target.value
              }
            })}
            className={inputClass}
            placeholder="E.g. Tutorial, Reference, Guide"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300">Version (Optional)</label>
          <input
            type="text"
            value={postDraft.resourceDetails?.version || ''}
            onChange={(e) => handleUpdateDraft({
              resourceDetails: {
                ...postDraft.resourceDetails,
                version: e.target.value
              }
            })}
            className={inputClass}
            placeholder="E.g. v1.0.0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Attachments</label>
          
          {(postDraft.resourceDetails?.attachments || []).length > 0 && (
            <div className="mb-3 space-y-2">
              {(postDraft.resourceDetails?.attachments || []).map((attachment: Attachment, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{attachment.name}</p>
                      <p className="text-xs text-gray-400">{Math.round(attachment.size / 1024)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className={clsx(actionBtnClass, "text-red-500")}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-700 rounded-md bg-gray-800/50">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-400 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 focus-within:ring-offset-gray-800"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: Implement file upload to IPFS or other storage
                        handleUpdateDraft({
                          resourceDetails: {
                            ...postDraft.resourceDetails,
                            attachments: [
                              ...(postDraft.resourceDetails?.attachments || []),
                              {
                                name: file.name,
                                size: file.size,
                                type: file.type,
                                url: URL.createObjectURL(file)
                              }
                            ]
                          }
                        });
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC, or any other file up to 10MB</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMediaFields = () => {
    const handleRemoveMedia = (index: number) => {
      const newMedia = postDraft.mediaContent?.filter(filterByIndex(index));
      handleUpdateDraft({ mediaContent: newMedia });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Media Files</label>
          
          {postDraft.mediaContent && postDraft.mediaContent.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {postDraft.mediaContent.map((media: MediaContent, index: number) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  {media.type === 'image' && (
                    <img src={media.url} alt={media.name} className="w-full h-32 object-cover rounded-lg" />
                  )}
                  {media.type === 'video' && (
                    <video src={media.url} className="w-full h-32 object-cover rounded-lg" />
                  )}
                  {(media.type as ExtendedMediaType) === 'audio' && (
                    <div className="w-full h-32 bg-gray-800 flex items-center justify-center rounded-lg">
                      <audio src={media.url} controls className="w-full max-w-[180px]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate">
                    {media.name}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-700 rounded-md bg-gray-800/50">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-400 justify-center">
                <label
                  htmlFor="media-upload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 focus-within:ring-offset-gray-800"
                >
                  <span>Upload media</span>
                  <input
                    id="media-upload"
                    name="media-upload"
                    type="file"
                    accept="image/*,video/*,audio/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      
                      // TODO: Implement proper file upload to IPFS or other storage
                      const mediaFiles = files.map(file => {
                        let mediaType: 'image' | 'video' = 'image';
                        if (file.type.startsWith('image/')) {
                          mediaType = 'image';
                        } else if (file.type.startsWith('video/')) {
                          mediaType = 'video';
                        }
                        
                        return {
                          type: mediaType,
                          url: URL.createObjectURL(file),
                          name: file.name,
                          size: file.size
                        } as MediaContent;
                      });
                      
                      handleUpdateDraft({
                        mediaContent: [
                          ...(postDraft.mediaContent || []),
                          ...mediaFiles
                        ]
                      });
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">Images, videos, or audio files up to 50MB</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleMediaUpload = (file: File) => {
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' as const : 
                    file.type.startsWith('video/') ? 'video' as const : null;
                    
    if (!fileType) {
      console.error('Unsupported file type');
      return;
    }

    const newMedia: MediaContent = {
      type: fileType,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    };

    const currentMedia = postDraft.mediaContent || [];
    handleUpdateDraft({
      mediaContent: [...currentMedia, newMedia]
    });
  };

  // Add this helper function for filtering arrays
  const filterByIndex = (index: number) => (_: unknown, i: number) => i !== index;

  // Update the switch statement to use the correct types
  switch (type) {
    case POST_TYPE_MAPPING[PostType.EVENT]:
      return renderEventFields();
    case POST_TYPE_MAPPING[PostType.POLL]:
      return renderPollFields();
    case 'project':
      return renderProjectFields();
    case 'resource':
      return renderResourceFields();
    case 'rich_media':
      return renderMediaFields();
    default:
      return null;
  }
};

export default PostTypeFields; 