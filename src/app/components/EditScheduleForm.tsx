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
  const[show, setShow] = useState<boolean>(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState<PlaylistSchedule>({
    playlist_id: 0,
    schedule_date: null,
    start_time: null,
    end_time: null,
  });
  const [timeError, setTimeError] = useState<string | null>(null);

  const safeDate = (value: any) => {
    const date = new Date(value);
    return isValid(date) ? date : null;
  };

  useEffect(() => {
    if (playlist) {
      setFormData({
        playlist_id: playlist.id,
        schedule_date: safeDate(schedule_date),
        start_time: safeDate(start_time),
        end_time: safeDate(end_time),
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

    if (!formData.schedule_date || !formData.start_time || !formData.end_time) {
      return toast.error('Please fill all schedule fields');
    }

    if (formData.end_time <= formData.start_time) {
      setTimeError('End time must be after start time');
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
      }else{
        toast.success('Schedule updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  const playlistOptions = playlists.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.brand})`,
  }));

  const { minTime, maxTime } = getTimeConstraints();

  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>;
  if (isError) return <p className="text-center text-red-500">Error loading schedule</p>;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
      <header className='flex items-center justify-between mb-3'>
        <h1 className="text-xl font-bold text-gray-900">Edit Schedule</h1>
         <button onClick={() => setShow(!show)}>{show ?  <MinusCircle/>:<PlusCircle/>}</button>
      </header>

      {show && ( <form onSubmit={handleSubmit} className="space-y-8">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
            <div className="relative">
              <DatePicker
                selected={formData.schedule_date}
                onChange={(date) => setFormData((prev) => ({ ...prev, schedule_date: date }))}
                minDate={new Date()}
                className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl"
                dateFormat="MMMM d, yyyy"
              />
              <CalendarIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <div className="relative">
              <DatePicker
                selected={formData.start_time}
                onChange={(time) => setFormData((prev) => ({ ...prev, start_time: time }))}
                showTimeSelect
                showTimeSelectOnly
                timeCaption="Time"
                dateFormat="h:mm aa"
                className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-xl"
                minTime={minTime}
                maxTime={maxTime}
              />
              <ClockIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <div className="relative">
              <DatePicker
                selected={formData.end_time}
                onChange={(time) => setFormData((prev) => ({ ...prev, end_time: time }))}
                showTimeSelect
                showTimeSelectOnly
                timeCaption="Time"
                dateFormat="h:mm aa"
                className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-xl"
                minTime={formData.start_time || minTime}
                maxTime={maxTime}
              />
              <ClockIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {timeError && (
          <div className="text-red-500 text-sm mt-2 animate-pulse">⚠️ {timeError}</div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
        >
          Update Schedule
        </button>
      </form>
    )}
     

      {selectedPlaylist && (
        <div className="mt-10 pt-8 border-t border-gray-100">
          <Playlist initialPlaylist={selectedPlaylist} onSaveSuccess={() => {}} />
        </div>
      )}
    </div>
  );
};

export default EditScheduleForm;
