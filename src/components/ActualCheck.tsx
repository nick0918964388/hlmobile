import React, { useState, useRef, useEffect } from 'react';
import { CheckItem as ApiCheckItem } from '@/services/api';

interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface CheckItem {
  id: string;
  sequence: number;
  title: string;
  standard: string;
  status: 'v' | 'x' | 'na' | '';
  note?: string;
  media: Media[];
  assetNum?: string;
  compositeId?: string;
}

interface AssetGroup {
  assetNum: string;
  assetName: string;
  checkItems: CheckItem[];
  isExpanded: boolean;
  sequence: number;
}

interface ActualCheckProps {
  workOrderId: string;
  onCompleteStatusChange?: (isComplete: boolean) => void;
  initialCheckItems?: ApiCheckItem[];
  assets?: string;
  route?: string;
}

const ActualCheck: React.FC<ActualCheckProps> = ({ 
  workOrderId, 
  onCompleteStatusChange, 
  initialCheckItems,
  assets,
  route
}) => {
  const mapApiCheckItemsToInternal = (apiItems?: ApiCheckItem[]): CheckItem[] => {
    if (!apiItems || apiItems.length === 0) {
      return [];
    }
    
    return apiItems.map((item, index) => {
      const assetNum = item.assetNum || 'Default';
      return {
        id: item.id,
        sequence: index,
        title: item.name,
        standard: item.standard,
        status: item.result as ('v' | 'x' | 'na' | ''),
        note: item.remarks,
        media: [],
        assetNum: assetNum,
        compositeId: `${item.id}_${assetNum}`
      };
    });
  };

  const [checkItems, setCheckItems] = useState<CheckItem[]>(() => 
    mapApiCheckItemsToInternal(initialCheckItems)
  );
  
  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>([]);
  const [isMultiAssetMode, setIsMultiAssetMode] = useState<boolean>(false);

  const [expandedMedia, setExpandedMedia] = useState<Media | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  useEffect(() => {
    if (checkItems.length > 0) {
      const assetNums = [...new Set(checkItems.map(item => item.assetNum || 'Default'))];
      
      const isMultiAsset = assetNums.length > 1 || !!route;
      setIsMultiAssetMode(isMultiAsset);
      
      if (isMultiAsset) {
        const groupedItems: { [key: string]: CheckItem[] } = {};
        checkItems.forEach(item => {
          const assetNum = item.assetNum || 'Unknown';
          if (!groupedItems[assetNum]) {
            groupedItems[assetNum] = [];
          }
          groupedItems[assetNum].push(item);
        });
        
        const expandedAssetNums = new Set(
          assetGroups
            .filter(group => group.isExpanded)
            .map(group => group.assetNum)
        );
        
        const groups: AssetGroup[] = Object.entries(groupedItems).map(([assetNum, items], index) => {
          const firstSequence = items.length > 0 ? Math.floor(items[0].sequence / 10) * 10 : 0;
          
          const sortedItems = [...items].sort((a, b) => a.sequence - b.sequence);
          
          const isExpanded = expandedAssetNums.has(assetNum) || 
                            (expandedAssetNums.size === 0 && index === 0);
          
          return {
            assetNum,
            assetName: assetNum === 'Unknown' || assetNum === 'Default' ? 'General Inspection Items' : `Equipment ${assetNum}`,
            checkItems: sortedItems,
            isExpanded: isExpanded,
            sequence: firstSequence
          };
        });
        
        groups.sort((a, b) => a.sequence - b.sequence);
        
        setAssetGroups(groups);
      } else {
        const sortedItems = [...checkItems].sort((a, b) => a.sequence - b.sequence);
        
        setAssetGroups([{
          assetNum: assets || 'Default',
          assetName: assets || 'Equipment Inspection',
          checkItems: sortedItems,
          isExpanded: true,
          sequence: 0
        }]);
      }
    }
  }, [checkItems, route, assets]);

  useEffect(() => {
    setCheckItems(mapApiCheckItemsToInternal(initialCheckItems));
  }, [initialCheckItems]);

  useEffect(() => {
    const isComplete = checkItems.every(item => item.status !== '');
    onCompleteStatusChange?.(isComplete);
  }, [checkItems, onCompleteStatusChange]);

  const handleStatusChange = (itemId: string, assetNum: string, newStatus: 'v' | 'x' | 'na') => {
    const compositeId = `${itemId}_${assetNum || 'Default'}`;
    
    const updatedItems = checkItems.map(item => {
      if (item.compositeId === compositeId) {
        const status = item.status === newStatus ? '' as const : newStatus;
        return { ...item, status };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    
    updateAssetGroupWithItems(updatedItems);
  };

  const handleNoteChange = (itemId: string, assetNum: string, note: string) => {
    const compositeId = `${itemId}_${assetNum || 'Default'}`;
    
    const updatedItems = checkItems.map(item => {
      if (item.compositeId === compositeId) {
        return { ...item, note };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    
    updateAssetGroupWithItems(updatedItems);
  };
  
  const updateAssetGroupWithItems = (updatedItems: CheckItem[]) => {
    setAssetGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        checkItems: updatedItems.filter(item => 
          (item.assetNum || 'Default') === group.assetNum
        )
      }))
    );
  };
  
  const toggleAssetGroup = (assetNum: string) => {
    setAssetGroups(groups =>
      groups.map(group =>
        group.assetNum === assetNum
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
  };

  const triggerFileInput = (itemId: string, assetNum: string, type: 'image' | 'video') => {
    const compositeId = `${itemId}_${assetNum || 'Default'}`;
    setActiveItemId(compositeId);
    setMediaType(type);
    
    if (type === 'image') {
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeItemId || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    const updatedItems = checkItems.map(item => {
      if (item.compositeId === activeItemId) {
        return {
          ...item,
          media: [...item.media, {
            id: `${item.id}_media_${Date.now()}`,
            type: mediaType,
            url
          }]
        };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    updateAssetGroupWithItems(updatedItems);
    
    e.target.value = '';
  };

  const removeMedia = (itemId: string, assetNum: string, mediaId: string) => {
    const compositeId = `${itemId}_${assetNum || 'Default'}`;
    
    const updatedItems = checkItems.map(item => {
      if (item.compositeId === compositeId) {
        return {
          ...item,
          media: item.media.filter(m => m.id !== mediaId)
        };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    updateAssetGroupWithItems(updatedItems);
    
    if (expandedMedia?.id === mediaId) {
      setExpandedMedia(null);
    }
  };

  const openCamera = (itemId: string, assetNum: string, type: 'image' | 'video') => {
    const compositeId = `${itemId}_${assetNum || 'Default'}`;
    setActiveItemId(compositeId);
    setMediaType(type);
    
    if (type === 'image') {
      fileInputRef.current?.setAttribute('capture', 'environment');
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.setAttribute('capture', 'environment');
      videoInputRef.current?.click();
    }
  };

  const hasStatus = (item: CheckItem) => item.status !== '';
  
  const handleMarkAllAsChecked = (assetNum?: string) => {
    const targetItems = checkItems.filter(item => !assetNum || item.assetNum === assetNum);
    
    const allMarkedAsV = targetItems.every(item => item.status === 'v');
    
    const updatedItems = checkItems.map(item => {
      if (!assetNum || item.assetNum === assetNum) {
        return { ...item, status: allMarkedAsV ? '' as const : 'v' as const };
      }
      return item;
    });
    
    setCheckItems(updatedItems);
    updateAssetGroupWithItems(updatedItems);
  };
  
  const getAssetGroupStatus = (group: AssetGroup) => {
    const total = group.checkItems.length;
    if (total === 0) return { completed: 0, total: 0, percentage: 0, statusCounts: { v: 0, x: 0, na: 0 } };
    
    const completed = group.checkItems.filter(item => item.status !== '').length;
    const percentage = Math.round((completed / total) * 100);
    
    const statusCounts = {
      v: group.checkItems.filter(item => item.status === 'v').length,
      x: group.checkItems.filter(item => item.status === 'x').length,
      na: group.checkItems.filter(item => item.status === 'na').length
    };
    
    return { completed, total, percentage, statusCounts };
  };

  const getAssetGroupStatusStyle = (status: ReturnType<typeof getAssetGroupStatus>) => {
    if (status.percentage === 100) {
      if (status.statusCounts?.x > 0) {
        return 'bg-red-50 border-l-4 border-l-red-500';
      } else if (status.statusCounts?.na === status.total) {
        return 'bg-green-50 border-l-4 border-l-green-500';
      } else {
        return 'bg-green-50 border-l-4 border-l-green-500';
      }
    }
    return '';
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        onChange={handleFileChange}
      />

      {expandedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setExpandedMedia(null)}
              className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-800 z-10"
            >
              ✕
            </button>
            {expandedMedia.type === 'image' ? (
              <img
                src={expandedMedia.url}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={expandedMedia.url}
                controls
                className="max-w-full max-h-[90vh]"
              />
            )}
          </div>
        </div>
      )}

      <div className="mx-auto p-4 max-w-4xl">
        {!isMultiAssetMode && checkItems.length > 0 && checkItems.some(item => item.assetNum) && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => handleMarkAllAsChecked()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {checkItems.every(item => item.status === 'v') ? 'Unmark All' : 'Mark All as Passed'}
            </button>
          </div>
        )}
        
        {assetGroups.map((group, groupIndex) => {
          const status = getAssetGroupStatus(group);
          const statusStyle = getAssetGroupStatusStyle(status);
          
          return (
            <div key={group.assetNum} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
              <div 
                className={`p-4 border-b border-gray-200 flex justify-between items-center ${statusStyle}`}
              >
                <div className="flex-1 cursor-pointer" onClick={() => toggleAssetGroup(group.assetNum)}>
                  <h2 className="text-lg font-medium text-gray-800">
                    {assetGroups.length > 1 ? `${(groupIndex + 1).toString().padStart(2, '0')}. ${group.assetName}` : group.assetName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {status.completed} / {status.total} items completed ({status.percentage}%)
                    {status.completed > 0 && status.statusCounts && (
                      <span className="ml-2">
                        {status.statusCounts.v > 0 && (
                          <span className="text-green-600 mr-2">V: {status.statusCounts.v}</span>
                        )}
                        {status.statusCounts.x > 0 && (
                          <span className="text-red-600 mr-2">X: {status.statusCounts.x}</span>
                        )}
                        {status.statusCounts.na > 0 && (
                          <span className="text-gray-500">N/A: {status.statusCounts.na}</span>
                        )}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {group.checkItems.length > 0 && group.assetNum && group.assetNum !== 'Default' && group.assetNum !== 'Unknown' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAllAsChecked(group.assetNum);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {group.checkItems.every(item => item.status === 'v') ? 'Unmark V' : 'All V'}
                    </button>
                  )}
                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                    <div 
                      className={`h-full rounded-full ${
                        status.statusCounts && status.statusCounts.x > 0 
                          ? 'bg-red-500' 
                          : status.statusCounts && status.statusCounts.na === status.total 
                            ? 'bg-gray-500' 
                            : 'bg-blue-500'
                      }`}
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${group.isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAssetGroup(group.assetNum);
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {group.isExpanded && (
                <div className="p-4">
                  <div className="space-y-6">
                    {group.checkItems.map((item) => (
                      <div key={item.compositeId || item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className={`p-4 ${hasStatus(item) ? (
                          item.status === 'v' 
                            ? 'bg-green-50 border-l-4 border-l-green-500' 
                            : item.status === 'x' 
                              ? 'bg-red-50 border-l-4 border-l-red-500' 
                              : 'bg-gray-50 border-l-4 border-l-gray-500'
                        ) : 'bg-white'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-base font-medium text-gray-800">
                                {item.id}. {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.standard}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusChange(item.id, item.assetNum || 'Default', 'v')}
                                className={`rounded-md px-3 py-1 text-sm font-medium ${
                                  item.status === 'v'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                V
                              </button>
                              <button
                                onClick={() => handleStatusChange(item.id, item.assetNum || 'Default', 'x')}
                                className={`rounded-md px-3 py-1 text-sm font-medium ${
                                  item.status === 'x'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                X
                              </button>
                              <button
                                onClick={() => handleStatusChange(item.id, item.assetNum || 'Default', 'na')}
                                className={`rounded-md px-3 py-1 text-sm font-medium ${
                                  item.status === 'na'
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                N/A
                              </button>
                            </div>
                          </div>

                          {item.status && (
                            <div className="mt-4">
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notes
                                </label>
                                <textarea
                                  rows={2}
                                  value={item.note || ''}
                                  onChange={(e) => handleNoteChange(item.id, item.assetNum || 'Default', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Add any relevant notes or observations"
                                ></textarea>
                              </div>

                              <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Media
                                </label>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => triggerFileInput(item.id, item.assetNum || 'Default', 'image')}
                                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 flex items-center"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Upload Image
                                  </button>
                                  <button
                                    onClick={() => openCamera(item.id, item.assetNum || 'Default', 'image')}
                                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 flex items-center"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Take Photo
                                  </button>
                                  <button
                                    onClick={() => triggerFileInput(item.id, item.assetNum || 'Default', 'video')}
                                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 flex items-center"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Upload Video
                                  </button>
                                </div>
                              </div>

                              {item.media.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                  {item.media.map((media) => (
                                    <div key={media.id} className="relative group">
                                      <div
                                        className="h-20 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                                        onClick={() => setExpandedMedia(media)}
                                      >
                                        {media.type === 'image' ? (
                                          <img
                                            src={media.url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center bg-gray-800">
                                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => removeMedia(item.id, item.assetNum || 'Default', media.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActualCheck; 