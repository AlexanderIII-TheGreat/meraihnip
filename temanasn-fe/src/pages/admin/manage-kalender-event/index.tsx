import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import BreadCrumb from '@/components/breadcrumb';
import { IconPlus } from '@tabler/icons-react';
import { Button, Dialog, MessagePlugin, Popconfirm } from 'tdesign-react';
import Input from '@/components/input';
import useGetList from '@/hooks/use-get-list';
import FetchAPI from '@/utils/fetch-api';
import { deleteData, patchData, postData } from '@/utils/axios';
import { useForm } from 'react-hook-form';

// Setup localizer for reactivation big calendar
const localizer = momentLocalizer(moment);

export default function ManageKalenderEvent() {
  const [visible, setVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Use useGetList hook to fetch data
  const getList = useGetList({
    url: 'admin/manage-kalender-event/get', 
    initialParams: {
      skip: 0,
      take: 100, // Fetch many for calendar
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
    resource: item, // Keep full object
  }));

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const handleSelectSlot = ({ start, end }: any) => {
    reset();
    setSelectedEvent(null);
    setValue('startDate', moment(start).format('YYYY-MM-DDTHH:mm'));
    setValue('endDate', moment(end).format('YYYY-MM-DDTHH:mm'));
    setVisible(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setValue('nama', event.resource.nama);
    setValue('keterangan', event.resource.keterangan || '');
    setValue('startDate', moment(event.resource.startDate).format('YYYY-MM-DDTHH:mm'));
    setValue('endDate', moment(event.resource.endDate).format('YYYY-MM-DDTHH:mm'));
    // Handle image/gambar if needed, but simplified for now
    setVisible(true);
  };

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      gambar: 'default.jpg', // Placeholder as image upload is complex in simplified form
    };

    try {
      await FetchAPI(
        selectedEvent
          ? patchData(`admin/manage-kalender-event/update/${selectedEvent.id}`, payload)
          : postData('admin/manage-kalender-event/insert', payload)
      );
      setVisible(false);
      getList.refresh();
      MessagePlugin.success(selectedEvent ? 'Event updated' : 'Event created');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
        await FetchAPI(deleteData(`admin/manage-kalender-event/remove/${selectedEvent.id}`));
        setVisible(false);
        getList.refresh();
        MessagePlugin.success('Event deleted');
    } catch (err) {
        console.error(err);
    }
  }

  return (
    <section>
      <BreadCrumb
        page={[
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Kalender Event', link: '#' },
        ]}
      />
      
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-indigo-950">Manage Kalender Event</h1>
            <Button theme="primary" onClick={() => {
                reset();
                setSelectedEvent(null);
                setValue('startDate', moment().format('YYYY-MM-DDTHH:mm'));
                setValue('endDate', moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
                setVisible(true);
            }}>
                <IconPlus className="mr-2" /> Tambah Event
            </Button>
        </div>

        <div className="h-[600px]">
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day', 'agenda']}
          />
        </div>
      </div>

      <Dialog
        header={selectedEvent ? "Edit Event" : "Tambah Event"}
        visible={visible}
        onClose={() => setVisible(false)}
        footer={null}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                title="Nama Event"
                name="nama"
                register={register}
                required
                validation={{ required: 'Nama is required' }}
                error={errors.nama}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                    <input 
                        type="datetime-local" 
                        className="w-full px-3 py-2 border rounded-lg"
                        {...register('startDate', { required: true })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selesai</label>
                    <input 
                        type="datetime-local" 
                        className="w-full px-3 py-2 border rounded-lg"
                        {...register('endDate', { required: true })}
                    />
                </div>
            </div>

            <Input
                title="Keterangan"
                name="keterangan"
                register={register}
                type="textarea"
            />

            <div className="flex justify-end gap-2 pt-4">
                {selectedEvent && (
                    <Popconfirm content="Are you sure?" theme="danger" onConfirm={handleDelete}>
                        <Button theme="danger" type="button" variant="outline">Hapus</Button>
                    </Popconfirm>
                )}
                <Button theme="default" variant="text" onClick={() => setVisible(false)}>Batal</Button>
                <Button theme="primary" type="submit">Simpan</Button>
            </div>
        </form>
      </Dialog>
    </section>
  );
}
