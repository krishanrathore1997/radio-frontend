'use client';

import { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import usePlaylist from '../hooks/usePlaylist';
import useScheduleToday from '../hooks/useScheduleToday';
import Playlist from './Playlist';
import scheduleRoutes from '../endpoint/schedule';
import API from '../service/api';

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
  const { scheduleplaylist, start_time = null, end_time = null } = useScheduleToday();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [show, setShow] = useState<boolean>(false);

  const [formData, setFormData] = useState<PlaylistSchedule>({
    playlist_id: 0,
    schedule_date: null,
    start_time: null,
    end_time: null,
  });

  useEffect(() => {
    if (playlistList) setPlaylists(playlistList);
  }, [playlistList]);

  useEffect(() => {
    setSelectedPlaylist(null);
  }, [show]);

  const handleDateChange = (date: Date | null) => {
    const defaultStart = date ? new Date(date.setHours(9, 0, 0, 0)) : null;
    const defaultEnd = date ? new Date(date.setHours(10, 0, 0, 0)) : null;

    setFormData(prev => ({
      ...prev,
      schedule_date: date,
      start_time: defaultStart,
      end_time: defaultEnd,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTimeError(null);

    const { playlist_id, schedule_date, start_time, end_time } = formData;

    if (!schedule_date || !start_time || !end_time) {
      return toast.error('Please fill all schedule fields');
    }

    if (end_time <= start_time) {
      setTimeError('End time must be after start time');
      return toast.error('Invalid time range');
    }

    try {
      await API.post(scheduleRoutes.add, {
        playlist_id,
        schedule_date: schedule_date.toISOString().split('T')[0], // still valid
        start_time: start_time.toISOString(), // full ISO string
        end_time: end_time.toISOString(),     // full ISO string
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

  const playlistOptions = playlists.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.brand})`,
  }));

  return (
    <div className="">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <header>
          <div className="flex justify-between">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {show ? "Today's Schedule" : 'Schedule Playlist'}
              </span>
            </h1>
            <button
              className="bg-red-500 hover:bg-black px-2 py-2 text-white rounded"
              onClick={() => setShow(!show)}
            >
              {show ? 'Back' : 'Today Schedule'}
            </button>
          </div>
        </header>

        {show ? (
          scheduleplaylist ? (
            <Playlist
              initialPlaylist={scheduleplaylist}
              start_time={start_time}
              end_time={end_time}
              onSaveSuccess={() => console.log('Playlist updated successfully')}
            />
          ) : (
            <div className="text-center text-red-500 font-medium">
              No scheduled playlist found.
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
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
                />
              </div>

              {/* Schedule Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Schedule Date */}
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
                        className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl"
                        dateFormat="MMMM d, yyyy"
                      />
                      <CalendarIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>

                  {/* Start Date & Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.start_time}
                        onChange={(datetime) =>
                          setFormData(prev => ({
                            ...prev,
                            start_time: datetime,
                            end_time:
                              datetime && prev.end_time && datetime > prev.end_time
                                ? datetime
                                : prev.end_time,
                          }))
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={5}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText="Select start datetime"
                        className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-xl"
                      />
                      <ClockIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.end_time}
                        onChange={(datetime) =>
                          setFormData(prev => ({ ...prev, end_time: datetime }))
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={5}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText="Select end datetime"
                        className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-xl"
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
          </form>
        )}

        {selectedPlaylist && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl shadow-inner">
              <Playlist
                initialPlaylist={selectedPlaylist}
                onSaveSuccess={() => console.log('Playlist updated successfully')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistScheduleForm;
