'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface CMActualProps {
  cmId: string;
  onCompleteStatusChange?: (isComplete: boolean) => void;
}

export default function CMActual({ cmId, onCompleteStatusChange }: CMActualProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    failureDetails: '',
    repairMethod: '',
    isCompleted: false,
    downtimeHours: 0,
    downtimeMinutes: 0
  });
  const [expandedMedia, setExpandedMedia] = useState<Media | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  // Check completion status when form content changes
  useEffect(() => {
    const isComplete = formData.failureDetails.trim() !== '' && formData.repairMethod.trim() !== '';
    onCompleteStatusChange?.(isComplete);
    
    // Save to localStorage
    const dataToSave = {
      formData,
      media
    };
    localStorage.setItem(`cmActual_${cmId}`, JSON.stringify(dataToSave));
  }, [formData, media, cmId, onCompleteStatusChange]);

  // Load saved data
  useEffect(() => {
    const savedData = localStorage.getItem(`cmActual_${cmId}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData.formData || { 
          failureDetails: '', 
          repairMethod: '', 
          isCompleted: false,
          downtimeHours: 0,
          downtimeMinutes: 0
        });
        setMedia(parsedData.media || []);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, [cmId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const isNumber = type === 'number';
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox 
        ? (e.target as HTMLInputElement).checked 
        : isNumber 
          ? parseInt(value) || 0
          : value
    }));
  };

  const triggerFileInput = (type: 'image' | 'video') => {
    setMediaType(type);
    if (type === 'image') {
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    const newMedia: Media = {
      id: `media_${Date.now()}`,
      type: mediaType,
      url
    };
    
    setMedia([...media, newMedia]);
    
    // Clear input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeMedia = (mediaId: string) => {
    setMedia(media.filter(m => m.id !== mediaId));
    if (expandedMedia?.id === mediaId) {
      setExpandedMedia(null);
    }
  };

  const openCamera = (type: 'image' | 'video') => {
    setMediaType(type);
    if (type === 'image') {
      fileInputRef.current?.setAttribute('capture', 'environment');
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.setAttribute('capture', 'environment');
      videoInputRef.current?.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Hidden file inputs */}
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

        {/* Expanded media preview */}
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
                  alt="Expanded"
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

        <form>
          <div className="space-y-6">
            {/* Failure Description */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Failure Description
              </label>
              <textarea
                name="failureDetails"
                rows={4}
                value={formData.failureDetails}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe the equipment failure"
              ></textarea>
            </div>

            {/* Downtime Reporting */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Downtime Duration
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <input
                    type="number"
                    name="downtimeHours"
                    min="0"
                    value={formData.downtimeHours}
                    onChange={handleChange}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 mr-4">hours</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="downtimeMinutes"
                    min="0"
                    max="59"
                    value={formData.downtimeMinutes}
                    onChange={handleChange}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2">minutes</span>
                </div>
              </div>
            </div>

            {/* Repair Method */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Repair Method
              </label>
              <textarea
                name="repairMethod"
                rows={4}
                value={formData.repairMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe the repair method and solution"
              ></textarea>
            </div>

            {/* Photo/Video Upload */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-lg font-medium text-gray-700">
                  Photos/Videos
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => triggerFileInput('image')}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => openCamera('image')}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Take Photo
                  </button>
                </div>
              </div>

              {/* Media preview */}
              {media.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {media.map((item) => (
                    <div key={item.id} className="relative group">
                      <div
                        className="h-20 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                        onClick={() => setExpandedMedia(item)}
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
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
                        onClick={() => removeMedia(item.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completion Confirmation */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  id="is-completed"
                  name="isCompleted"
                  type="checkbox"
                  checked={formData.isCompleted}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="is-completed" className="ml-2 block text-sm text-gray-700">
                  I confirm that the issue has been fixed and the equipment is functioning normally
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 