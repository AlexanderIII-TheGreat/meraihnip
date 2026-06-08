import BreadCrumb from '@/components/breadcrumb';
import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { deleteData, getData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import ManageSoalModal from './manage-soal-modal';
import { useParams } from 'react-router-dom';
import { Button, Popconfirm } from 'tdesign-react';

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function ManageSoalKecermatanList() {
    const { id, kiasanId } = useParams();
    const [visible, setVisible] = useState(false);
    const [detail, setDetail] = useState({});

    const [kiasanDetail, setKiasanDetail] = useState<any>({});

    useEffect(() => {
        if (kiasanId) {
            getKiasanDetail();
        }
    }, [kiasanId]);

    const getKiasanDetail = async () => {
        try {
             const result = await getData(`admin/kiasan/find/${kiasanId}`);
             if (result?.error) {
                 console.error(result.message);
                 return;
             }
             setKiasanDetail(result);
        } catch (e) {
            console.error(e);
        }
    }

    const getDataList = useGetList({
        url: 'admin/soal-kecermatan/get',
        initialParams: {
            skip: 0,
            take: 10,
            sortBy: 'createdAt',
            descending: true,
            kiasanId: Number(kiasanId),
        }
    });

    const handleDeleted = async (id: number) => {
        FetchAPI(deleteData(`admin/soal-kecermatan/remove/${id}`)).then(() => {
            getDataList.refresh();
        });
    };

    const columns = [
        {
            colKey: 'applicant',
            title: '#',
            width: 60,
            cell: (row: any) => {
                return <span>{row.rowIndex + 1 * getDataList.params.skip + 1}</span>;
            },
        },
        {
            title: 'Soal',
            colKey: 'soal',
            cell: ({ row }: any) => {
                return (
                    <div className="flex gap-2">
                        {Array.isArray(row.soal) && row.soal.map((item: string, index: number) => (
                             <div key={index} className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-white font-bold text-gray-700 shadow-sm">
                                {item}
                             </div>
                        ))}
                    </div>
                );
            },
        },
        {
            title: 'Jawaban',
            colKey: 'jawaban',
            width: 100,
            align: AlignType.Center,
        },
        {
            title: 'Waktu (s)',
            colKey: 'waktu',
            width: 100,
            align: AlignType.Center,
        },
        {
            title: 'Action',
            colKey: 'action',
            width: 120,
            align: AlignType.Center,
             cell: ({ row }: any) => {
                return (
                    <div className="flex justify-center gap-2">
                        <Button
                            shape="circle"
                            theme="default"
                            onClick={() => {
                                setVisible(true);
                                setDetail(row);
                            }}
                        >
                            <IconPencil size={14} />
                        </Button>
                        <Popconfirm
                            content="Apakah kamu yakin ?"
                            theme="danger"
                            onConfirm={() => handleDeleted(row.id)}
                        >
                            <Button shape="circle" theme="danger">
                                <IconTrash size={14} />
                            </Button>
                        </Popconfirm>
                    </div>
                );
            },
        }
    ];

    return (
        <section>
            <BreadCrumb
                page={[
                    { name: 'Bank Soal Kecermatan', link: '/manage-soal-kecermatan' },
                    { name: 'Manage Kiasan', link: `/manage-soal-kecermatan/${id}` },
                    { name: 'Manage Soal', link: '#' },
                ]}
            />
            <div className="bg-white p-8 rounded-2xl">
                 <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mb-4">
                    <div className="title border-b border-[#ddd] w-full flex justify-between">
                        <div>
                             <div className="flex gap-0 mb-2">
                                {(kiasanDetail?.karakter || []).map((item: string, index: number) => (
                                    <div key={index} className="flex flex-col">
                                        <div className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white font-bold text-lg text-gray-700">
                                            {item}
                                        </div>
                                         <div className="w-10 h-10 flex items-center justify-center border-b border-x border-gray-300 bg-gray-50 font-bold text-lg text-indigo-700">
                                            {kiasanDetail?.kiasan?.[index]}
                                        </div>
                                    </div>
                                ))}
                             </div>
                             <h1 className="text-2xl text-indigo-950 font-bold">
                                Manage Soal
                            </h1>
                            <p className="text-gray-500 text-sm mb-4">Kiasan ID: {kiasanId}</p>
                        </div>
                       
                        <Button
                            theme="default"
                            size="large"
                            className="border-success hover:bg-success hover:text-white group"
                            onClick={() => {
                                setDetail({})
                                setVisible(true)
                            }}
                        >
                            <IconPlus
                                size={20}
                                className="text-success group-hover:text-white"
                            />
                        </Button>
                    </div>
                </div>
                
                <TableWrapper data={getDataList} columns={columns} />

                {visible && (
                    <ManageSoalModal
                        setVisible={setVisible}
                        params={getDataList}
                        detail={detail}
                        setDetail={setDetail}
                        kiasanId={kiasanId}
                        kiasanDetail={kiasanDetail}
                    />
                )}
            </div>
        </section>
    )
}
