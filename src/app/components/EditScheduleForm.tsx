'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { toast } from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import usePlaylist from '../hooks/usePlaylist';
import useScheduleDetails from '../hooks/useScheduleDetails';
import API from '../service/api';
import scheduleRoutes from '../endpoint/schedule';
import Playlist from './Playlist';
import { isValid } from 'date-fns';
import { MinusCircle, PlusCircle } from 'lucide-react';

type Playlist = {
  id: number;
  name: string;
  brand: string;
  songs: any[];
};

type PlaylistSchedule = {
  playlist_id: number;
  schedule_date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
};

const isValidDate = (date: any): date is Date =>
  date instanceof Date && !isNaN(date.getTime());

const EditScheduleForm = () => {
  const { id } = useParams();
  const { playlistList } = usePlaylist();
  const {
    playlist,
    start_time,
    end_time,
    schedule_date,
    message,
    isLoading,
    isError,
  } = useScheduleDetails(id as string);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showForm, setShowForm] = useState<boolean>(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState<PlaylistSchedule>({
    playlist_id: 0,
    schedule_date: null,
    start_time: null,
    end_time: null,
  });
  const [timeError, setTimeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
function safeDate(dateStr: string | Date, timeStr?: string): Date | null {
  try {
    if (timeStr && typeof dateStr === 'string') {
      const combined = `${dateStr} ${timeStr}`;
      const date = new Date(combined);
      if (isNaN(date.getTime())) {
        console.warn("Invalid combined datetime:", combined);
        return null;
      }
      return date;
    }

    if (typeof dateStr === 'string') {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    }

    if (dateStr instanceof Date) return dateStr;

    return null;
  } catch (e) {
    console.error("safeDate error:", e);
    return null;
  }
}


useEffect(() => {
  if (playlist && schedule_date && start_time && end_time) {
    const parsedScheduleDate = safeDate(schedule_date);
    const parsedStartTime = safeDate(schedule_date, start_time);
    const parsedEndTime = safeDate(schedule_date, end_time);

    console.log('Setting form data from playlist:', parsedScheduleDate, parsedStartTime, parsedEndTime);

    setFormData({
      playlist_id: playlist.id,
      schedule_date: parsedScheduleDate,
      start_time: parsedStartTime,
      end_time: parsedEndTime,
    });
  }
}, [playlist, schedule_date, start_time, end_time]);


  useEffect(() => {
    if (playlistList && formData.playlist_id) {
      setPlaylists(playlistList);
      const matched = playlistList.find((p: Playlist) => p.id === formData.playlist_id) || null;
      setSelectedPlaylist(matched);
    }
  }, [playlistList, formData.playlist_id]);

  const getTimeConstraints = () => {
    const baseDate = formData.schedule_date || new Date();
    const minTime = new Date(baseDate);
    minTime.setHours(0, 0, 0, 0);
    const maxTime = new Date(baseDate);
    maxTime.setHours(23, 59, 59, 999);
    return { minTime, maxTime };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTimeError(null);
    setIsSubmitting(true);

    if (!formData.schedule_date || !formData.start_time || !formData.end_time) {
      setIsSubmitting(false);
      return toast.error('Please fill all schedule fields');
    }

    if (formData.end_time <= formData.start_time) {
      setTimeError('End time must be after start time');
      setIsSubmitting(false);
      return toast.error('Invalid time range');
    }
    
    const playload = {
      id: Number(id),
      playlist_id: formData.playlist_id,
      schedule_date: formData.schedule_date.toISOString().split('T')[0],
      start_time: formData.start_time.toISOString().slice(11, 19),
      end_time: formData.end_time.toISOString().slice(11, 19),
    };

    try {
      const response = await API.post(`${scheduleRoutes.update}/${id}`, playload);
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to update schedule');
      } else {
        toast.success('Schedule updated successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const playlistOptions = playlists.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.brand})`,
  }));

  const { minTime, maxTime } = getTimeConstraints();

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (isError) return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="text-red-500 bg-red-50 rounded-xl py-4 px-6">
        <h3 className="font-bold text-lg mb-2">Error loading schedule</h3>
        <p>{message || 'Please try again later'}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Schedule</h1>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition-colors"
          aria-label={showForm ? "Collapse form" : "Expand form"}
        >
          {showForm ? <MinusCircle size={20} /> : <PlusCircle size={20} />}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Playlist
              </label>
              <Select
                value={playlistOptions.find((p) => p.value === formData.playlist_id)}
                options={playlistOptions}
                onChange={(option) => {
                  const playlistId = option?.value || 0;
                  setFormData((prev) => ({ ...prev, playlist_id: playlistId }));
                  const selected = playlists.find((p) => p.id === playlistId) || null;
                  setSelectedPlaylist(selected);
                }}
                placeholder="Search playlists..."
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '12px',
                    padding: '6px',
                    borderColor: '#e5e7eb',
                    '&:hover': { borderColor: '#9ca3af' },
                  }),
                  option: (base, { isFocused, isSelected }) => ({
                    ...base,
                    backgroundColor: isSelected 
                      ? '#4f46e5' 
                      : isFocused 
                        ? '#eef2ff' 
                        : 'white',
                    color: isSelected ? 'white' : 'black',
                    ':active': {
                      backgroundColor: '#e0e7ff',
                    },
                  }),
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Schedule Date
                  </span>
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.schedule_date}
                    onChange={(date) => setFormData((prev) => ({ ...prev, schedule_date: date }))}
                    minDate={new Date()}
                    className="w-full pl-10 pr-4 py-2.5 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select date"
                  />
                  <CalendarIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Start Time
                  </span>
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.start_time}
                    onChange={(time) => setFormData((prev) => ({ ...prev, start_time: time }))}
                    showTimeSelect
                    showTimeSelectOnly
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full pl-10 pr-4 py-2.5 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholderText="Select start time"
                    minTime={minTime}
                    maxTime={maxTime}
                  />
                  <ClockIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    End Time
                  </span>
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.end_time}
                    onChange={(time) => setFormData((prev) => ({ ...prev, end_time: time }))}
                    showTimeSelect
                    showTimeSelectOnly
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full pl-10 pr-4 py-2.5 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholderText="Select end time"
                    minTime={formData.start_time || minTime}
                    maxTime={maxTime}
                  />
                  <ClockIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>
            </div>

            {timeError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r text-red-700 animate-pulse">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{timeError}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all ${
              isSubmitting 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : 'Update Schedule'}
          </button>
        </form>
      )}

      {selectedPlaylist && (
        <div className={`mt-8 pt-6 border-t border-gray-100 ${showForm ? '' : 'mt-0 pt-0 border-t-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Playlist Preview</h2>
          </div>
          <div>
            <Playlist 
              initialPlaylist={selectedPlaylist} 
              start_time={start_time}
              end_time={end_time}
              onSaveSuccess={() => {}} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditScheduleForm;