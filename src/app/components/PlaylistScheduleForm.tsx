'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import usePlaylist from '../hooks/usePlaylist';
import PlaylistView from './PlaylistView';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import 'react-datepicker/dist/react-datepicker.css';
import scheduleRoutes from '../endpoint/schedule';
import API from '../service/api';
import { set } from 'date-fns';
import Playlist from './Playlist';
import useScheduleToday from '../hooks/useScheduleToday';

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

const PlaylistScheduleForm = () => {
  const { playlistList } = usePlaylist();
  const { scheduleplaylist,start_time = null, end_time = null } = useScheduleToday();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const [timeError, setTimeError] = useState<string | null>(null);
  const[show, setShow] = useState<boolean>(false);
  const [formData, setFormData] = useState<PlaylistSchedule>({
    playlist_id: 0,
    schedule_date: null,
    start_time: null,
    end_time: null,
  });

  useEffect(() => {
    playlistList && setPlaylists(playlistList);
  }, [playlistList]);

  useEffect(() => {
  setSelectedPlaylist(null);
  }, [show]);


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

    if (!formData.schedule_date || !formData.start_time || !formData.end_time) {
      return toast.error('Please fill all schedule fields');
    }

    if (formData.end_time <= formData.start_time) {
      setTimeError('End time must be after start time');
      return toast.error('Invalid time range');
    }

    try {
  await API.post(scheduleRoutes.add, {
    playlist_id: formData.playlist_id,
    schedule_date: formData.schedule_date.toISOString().split('T')[0],
    start_time: formData.start_time.toISOString().slice(11, 19), // e.g., "09:30:00"
    end_time: formData.end_time.toISOString().slice(11, 19),     // e.g., "11:00:00"
  });

  toast.success('Playlist scheduled successfully');

  setFormData({
    playlist_id: 0,
    schedule_date: null,
    start_time: null,
    end_time: null,
  });
  setSelectedPlaylist(null);
} catch (error) {
  toast.error('Failed to schedule playlist');
}

  };

  const handleDateChange = (date: Date | null) => {
    const baseDate = date || new Date();
    setFormData(prev => ({
      ...prev,
      schedule_date: date,
      start_time: date ? new Date(baseDate.setHours(9, 0)) : null,
      end_time: date ? new Date(baseDate.setHours(10, 0)) : null
    }));
  };

  const playlistOptions = playlists.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.brand})`,
  }));

  const { minTime, maxTime } = getTimeConstraints();

  return (
    <div className="">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <header>
          <div className="flex justify-between">

          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
               {show ? "Today Schedule" : "Schedule Playlist"}
            </span>
          </h1>
          
         <button
            className="bg-red-500 hover:bg-black px-2 py-2 text-white rounded"
            onClick={() => setShow(!show)}
            >
            {show ? "Back" : "Today Schedule"}
          </button>
            </div>
        </header>

        {show ? (
         scheduleplaylist ? (

        <Playlist
          initialPlaylist={scheduleplaylist}
          start_time={start_time}
          end_time={end_time}
          onSaveSuccess={() => {
            console.log("Playlist updated successfully");
            // You can add redirect logic here if needed
        }}
                  />
   
  ) : (
    <div className="text-center text-red-500 font-medium">
      No scheduled playlist found.
    </div>
  )
        ): ( <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            {/* Playlist Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Playlist
              </label>
              <Select
                options={playlistOptions}
                onChange={(option) => {
                  setSelectedPlaylist(playlists.find(p => p.id === option?.value) || null);
                  setFormData(prev => ({ ...prev, playlist_id: option?.value || 0 }));
                }}
                placeholder="Search playlists..."
                isClearable
                className="react-select-container text-black"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '12px',
                    padding: '6px',
                    borderColor: '#e5e7eb',
                    '&:hover': { borderColor: '#9ca3af' },
                  }),
                }}
              />
            </div>

            {/* Schedule Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.schedule_date}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      placeholderText="Select date"
                      className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      dateFormat="MMMM d, yyyy"
                    />
                    <CalendarIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.start_time}
                      onChange={(time) => setFormData(prev => ({
                        ...prev,
                        start_time: time,
                        end_time: time && prev.end_time && time > prev.end_time ? time : prev.end_time
                      }))}
                      showTimeSelect
                      showTimeSelectOnly
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholderText="Select start time"
                      minTime={minTime}
                      maxTime={maxTime}
                    />
                    <ClockIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.end_time}
                      onChange={(time) => setFormData(prev => ({
                        ...prev,
                        end_time: time
                      }))}
                      showTimeSelect
                      showTimeSelectOnly
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="w-full pl-10 pr-4 text-black py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholderText="Select end time"
                      minTime={formData.start_time || minTime}
                      maxTime={maxTime}
                    />
                    <ClockIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              {timeError && (
                <div className="text-red-500 text-sm mt-2 animate-pulse">
                  ⚠️ {timeError}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-[1.02]"
          >
            Schedule Playlist
          </button>
        </form>)}
        {selectedPlaylist && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl shadow-inner">
              {/* <PlaylistView 
                playlist={selectedPlaylist}
                onBack={() => setSelectedPlaylist(null)}
              /> */}
               <Playlist
                    initialPlaylist={selectedPlaylist}
                    onSaveSuccess={() => {
                      console.log("Playlist updated successfully");
                      // You can add redirect logic here if needed
                    }}
                  />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistScheduleForm;