'use client'

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Event } from '@/types/event';
import { 
  Edit2, 
  Trash2, 
  Eye, 
  Users, 
  Calendar, 
  MapPin, 
  Clock,
  MoreHorizontal,
  Copy,
  Download,
  Share2,
  Settings
} from 'lucide-react';

interface AdminEventCardProps {
  event: Event;
  viewMode?: 'grid' | 'list';
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onView: (event: Event) => void;
  onDuplicate?: (event: Event) => void;
  delay?: number;
}

const AdminEventCard = ({ 
  event, 
  viewMode = 'grid', 
  onEdit, 
  onDelete, 
  onView,
  onDuplicate,
  delay = 0 
}: AdminEventCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Format location (handle both string and object locations)
  const formatLocation = (location: any) => {
    if (!location) return 'Location TBA';
    if (typeof location === 'string') return location;
    return location.name || `${location.city || ''}, ${location.state || ''}`.trim() || 'Location TBA';
  };
  
  // Calculate spots left and percentage
  const spotsLeft = event.maxAttendees - event.currentAttendees;
  const spotPercentage = (event.currentAttendees / event.maxAttendees) * 100;
  
  // Get event status
  const getEventStatus = () => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (eventDate < now) {
      return { status: 'Past', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
    }
    
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { status: 'Today', color: 'bg-orange-100 text-orange-600', dot: 'bg-orange-400' };
    } else if (diffDays <= 7) {
      return { status: `${diffDays}d left`, color: 'bg-yellow-100 text-yellow-600', dot: 'bg-yellow-400' };
    } else {
      return { status: `${diffDays}d left`, color: 'bg-green-100 text-green-600', dot: 'bg-green-400' };
    }
  };
  
  const eventStatus = getEventStatus();
  
  // Check if the image URL is valid
  const hasValidImage = event.imageUrl && event.imageUrl.trim() !== '';
  
  // Get registration status color
  const getRegistrationStatus = () => {
    const percentage = spotPercentage;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  // Handle dropdown actions
  const handleDropdownAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    
    switch (action) {
      case 'duplicate':
        onDuplicate?.(event);
        break;
      case 'share':
        // Handle share functionality
        navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
        break;
      case 'download':
        // Handle download/export functionality
        console.log('Download event data', event);
        break;
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div 
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative md:w-64 h-48">
            {hasValidImage ? (
              <Image 
                src={event.imageUrl} 
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <Calendar className="text-purple-400" size={48} />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${eventStatus.color}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${eventStatus.dot}`}></span>
                {eventStatus.status}
              </span>
            </div>
            
            {/* Category Badge */}
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {event.category}
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{event.title}</h3>
                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-3">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {formatLocation(event.location)}
                  </div>
                  <div className="flex items-center">
                    <Users size={14} className="mr-1" />
                    <span className={getRegistrationStatus()}>
                      {event.currentAttendees}/{event.maxAttendees}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 line-clamp-2 mb-4">{event.description}</p>
              </div>
              
              {/* Actions Dropdown */}
              <div className="relative ml-4">
                <motion.button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                >
                  <MoreHorizontal size={20} className="text-gray-600" />
                </motion.button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={(e) => { e.stopPropagation(); onView(event); setShowDropdown(false); }}
                      >
                        <Eye size={16} className="mr-2" />
                        View Details
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={(e) => { e.stopPropagation(); onEdit(event); setShowDropdown(false); }}
                      >
                        <Edit2 size={16} className="mr-2" />
                        Edit Event
                      </button>
                      {onDuplicate && (
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          onClick={(e) => handleDropdownAction('duplicate', e)}
                        >
                          <Copy size={16} className="mr-2" />
                          Duplicate
                        </button>
                      )}
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={(e) => handleDropdownAction('share', e)}
                      >
                        <Share2 size={16} className="mr-2" />
                        Copy Link
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        onClick={(e) => { e.stopPropagation(); onDelete(event.id); setShowDropdown(false); }}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Event
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Registration Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Registration Progress</span>
                <span className={`text-xs font-medium ${getRegistrationStatus()}`}>
                  {Math.round(spotPercentage)}% filled
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${spotPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-2">
              <motion.button
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); onEdit(event); }}
              >
                <Edit2 size={16} className="mr-2" />
                Edit
              </motion.button>
              <motion.button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); onView(event); }}
              >
                <Eye size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Grid View
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(event)}
    >
      {/* Image Section */}
      <div className="relative h-52">
        {hasValidImage ? (
          <Image 
            src={event.imageUrl} 
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <Calendar className="text-purple-400" size={48} />
          </div>
        )}
        
        {/* Status Badge */}
        <motion.div 
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${eventStatus.color} flex items-center`}
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            y: isHovered ? -2 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${eventStatus.dot}`}></span>
          {eventStatus.status}
        </motion.div>
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {event.category}
        </div>
        
        {/* Quick Actions Overlay */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="bg-white text-gray-800 p-3 rounded-full hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onView(event); }}
          >
            <Eye size={18} />
          </motion.button>
          <motion.button
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onEdit(event); }}
          >
            <Edit2 size={18} />
          </motion.button>
          <motion.button
            className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
          >
            <Trash2 size={18} />
          </motion.button>
        </motion.div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{event.title}</h3>
        
        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={14} className="mr-2" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={14} className="mr-2" />
            {formatLocation(event.location)}
          </div>
          <div className="flex items-center text-sm">
            <Users size={14} className="mr-2 text-gray-500" />
            <span className={`font-medium ${getRegistrationStatus()}`}>
              {event.currentAttendees}/{event.maxAttendees} registered
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        {/* Registration Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Registration</span>
            <span className={`text-xs font-medium ${getRegistrationStatus()}`}>
              {Math.round(spotPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${spotPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <motion.button
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => { e.stopPropagation(); onEdit(event); }}
          >
            Edit Event
          </motion.button>
          <motion.button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => { e.stopPropagation(); onView(event); }}
          >
            <Eye size={16} />
          </motion.button>
        </div>
      </div>
      
      {/* Dropdown Menu for Grid View */}
      <div className="absolute top-2 right-2">
        <motion.button
          className="p-2 rounded-lg bg-white bg-opacity-80 hover:bg-opacity-100 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
        >
          <MoreHorizontal size={16} className="text-gray-600" />
        </motion.button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              {onDuplicate && (
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  onClick={(e) => handleDropdownAction('duplicate', e)}
                >
                  <Copy size={16} className="mr-2" />
                  Duplicate
                </button>
              )}
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={(e) => handleDropdownAction('share', e)}
              >
                <Share2 size={16} className="mr-2" />
                Copy Link
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={(e) => handleDropdownAction('download', e)}
              >
                <Download size={16} className="mr-2" />
                Export Data
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminEventCard;