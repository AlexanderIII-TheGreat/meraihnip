import useGetList from '@/hooks/use-get-list';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment);

export default function Event() {
  const navigate = useNavigate();
  const getList = useGetList({
    url: 'user/event/get',
    initialParams: {
      skip: 0,
      take: 200, // Fetch more for calendar view
      sortBy: 'startDate',
      descending: false,
    },
  });

  // Transform data for Calendar
  const events = getList.list.map((item: any) => ({
    id: item.id,
    title: item.nama,
    start: new Date(item.startDate),
    end: new Date(item.endDate),
    resource: item,
  }));

  const handleSelectEvent = (event: any) => {
    navigate(`/event/detail/${event.id}`);
  };

  return (
    <div className="min-h-screen">
      <BreadCrumb
        page={[
          { name: 'Home', link: '/' },
          { name: 'Event', link: '#' },
        ]}
      />
      
      <div className="bg-white p-6 rounded-2xl shadow-sm mt-6">
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-indigo-950">Event Terbaru</h1>
          <p className="text-gray-500 text-sm mt-1">
            Lihat jadwal event dan kegiatan mendatang di kalender.
          </p>
        </div>

        <div className="h-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day', 'agenda']}
          />
        </div>
      </div>
    </div>
  );
}
