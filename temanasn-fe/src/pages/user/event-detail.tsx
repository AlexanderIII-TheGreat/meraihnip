import BreadCrumb from '@/components/breadcrumb';
import { getData } from '@/utils/axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function EventDetail() {
  const [data, setData] = useState<any>({});
  const { id } = useParams();

  const getDetailClass = async () => {
    getData(`user/event/find/${id}`).then((res) => {
      if (res.error) window.location.href = '/event';
      setData(res);
    });
  };

  useEffect(() => {
    getDetailClass();
  }, []);

  return (
    <div>
      <BreadCrumb
        page={[
          { name: 'Event', link: '/event' },
          {
            name: data?.nama || 'Event',
            link: '#',
          },
        ]}
      />
      <div className="bg-white px-4 md:px-10 py-10 rounded-2xl ">
        <div className="flex">
          <div className="w-12/12 pr-10">
            <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
              <div className="title">
                <h1 className="text-2xl text-indigo-950 font-bold mb-5">
                  {data?.nama || 'Event'}
                </h1>
              </div>
            </div>
            <div
              className="ckeditor ck ck-content ck-editor__editable ck-rounded-corners ck-editor__editable_inline ck-blurred min-h-[600px]"
              dangerouslySetInnerHTML={{
                __html: data?.keterangan,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
