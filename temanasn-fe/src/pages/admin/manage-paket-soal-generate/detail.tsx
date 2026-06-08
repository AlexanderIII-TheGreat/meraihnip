import { useEffect, useState, useRef } from 'react';
import Input from '@/components/input';
import {
  IconPencil,
  IconPlus,
  IconTrash,
  IconSearch,
  IconFileImport,
} from '@tabler/icons-react';
import { Button, Pagination, Input as TInput } from 'tdesign-react';
import { useParams } from 'react-router-dom';
import FetchAPI from '@/utils/fetch-api';
import {
  deleteData,
  getData,
  patchData,
  postData,
} from '@/utils/axios';
import FormCreate from './FormCreate';
import BreadCrumb from '@/components/breadcrumb';
import { toast } from 'react-hot-toast';

const DEFAULT_FORM = {
  soal: '',
  pembahasan: '',
  tingkatkesulitansoal: 'mudah',
  jawaban: [
    {
      jawaban: '',
      id: 0,
    },
    {
      jawaban: '',
      id: 1,
    },
    {
      jawaban: '',
      id: 2,
    },
    {
      jawaban: '',
      id: 3,
    },
  ],
};

interface JawabanItem {
  jawaban: string;
  id: number;
  isDeleted?: boolean;
}

interface ValueState {
  soal: string;
  pembahasan: string;
  tingkatkesulitansoal: string;
  jawaban: JawabanItem[];
}
interface OutputObject {
  isChecked: string;
  [key: string]: string | boolean | undefined;
}

export default function ManageSoalGenerateDetail() {
  const { id } = useParams();
  const [idRender, setIdRender] = useState(0);
  const [detail, setDetail] = useState<any>({});
  const [soalList, setSoalList] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | boolean>(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Search State
  const [search, setSearch] = useState('');

  const [value, setValue] = useState<ValueState>(DEFAULT_FORM);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryId', id || '');

    FetchAPI(postData('admin/soal-generate-soal/import', formData)).then((res: any) => {
      toast.success(res.msg || 'Import Berhasil');
      getDetail();
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const getDetail = async () => {
    // Get Category Detail
    getData(`admin/generate-soal-category/find/${id}`).then((res) => {
      setDetail(res);
    });

    // Get Soal List
    const skip = (page - 1) * pageSize;
    console.log(`Fetching Soal: page=${page}, pageSize=${pageSize}, skip=${skip}, search=${search}`);
    getData(`admin/soal-generate-soal/get?categoryId=${id}&skip=${skip}&take=${pageSize}&search=${search}`).then((res: any) => {
      console.log('Soal List Response:', res);
      // Check if response has pagination structure (new backend)
      if (res?.list && Array.isArray(res.list)) {
        setSoalList(res.list);
        setTotal(parseInt(res.pagination?.total || '0'));
        setIdRender((prev) => prev + 1);
      } 
      // Fallback for old structure (just in case)
      else if (Array.isArray(res)) {
        setSoalList(res);
        setTotal(res.length); // Assuming all data returned if no pagination
        setIdRender((prev) => prev + 1);
      } else {
        console.error('Soal List is not an array:', res);
        setSoalList([]);
        setTotal(0);
      }
    }).catch(err => {
      console.error('Error Fetching Soal List:', err);
      setSoalList([]);
      setTotal(0);
    });
  };

  useEffect(() => {
    getDetail();
  }, [id, page, pageSize, search]);

  const hapusSoal = async (idSoal: number) => {
    FetchAPI(deleteData(`admin/soal-generate-soal/remove/${idSoal}`)).then(() => {
      getDetail();
    });
  };

  const hapusJawaban = (index: number) => {
    setValue((prev: any) => ({
      ...prev,
      jawaban: prev.jawaban.map((item: any) => {
        if (item.id === index) {
          return {
            ...item,
            isDeleted: true,
          };
        }
        return item;
      }),
    }));
  };

  const tambahJawaban = () => {
    setValue((prev: any) => ({
      ...prev,
      jawaban: [
        ...prev.jawaban,
        {
          jawaban: '',
          id: prev.jawaban.length + 1,
        },
      ],
    }));
  };

  function convertObjToAnswer(obj: any) {
    const jawabanArray = [];

    for (const key in obj) {
      if (key.startsWith('value-')) {
        const id = key.split('-')[1];
        const status = value.jawaban.find((item: any) => item.id == id);
        const jawabanObj = {
          id: parseInt(id),
          value: obj[key],
          isCorrect: obj[`isChecked`] == id,
          isUpdate: obj[`isUpdated-${id}`] || false,
          isDeleted: status?.isDeleted || false,
        };
        jawabanArray.push(jawabanObj);
      }
    }

    return jawabanArray;
  }

  function convertArrayToObject(jawabanArray: any, isUpdated: boolean) {
    const outputObject: OutputObject = {
      isChecked: '',
    };

    jawabanArray.forEach((jawaban: any) => {
      const jawabanKey = `value-${jawaban.id}`;
      const idKey = `id-${jawaban.id}`;
      const isUpdateKey = `isUpdated-${jawaban.id}`;

      outputObject[jawabanKey] = jawaban.value; // Note: using .value from backend
      outputObject[idKey] = jawaban.id;

      if (isUpdated) outputObject[isUpdateKey] = true;

      if (jawaban.isCorrect) {
        outputObject.isChecked = jawaban.id?.toString();
      }
    });

    return outputObject;
  }

  const onSubmit = async (data: any) => {
    const payload = {
      categoryId: id,
      soal: data.soal,
      pembahasan: data.pembahasan,
      jawaban: convertObjToAnswer(data),
      tingkatkesulitansoal: data.tingkatkesulitansoal, // Added field
      // subCategory: data.subcategory, // Optional
    };

    FetchAPI(
      editId === true
        ? postData(`admin/soal-generate-soal/insert`, payload)
        : patchData(`admin/soal-generate-soal/update/${editId}`, payload)
    ).then(() => {
      getDetail();
      setEditId(false);
      setValue(DEFAULT_FORM);
    });
  };

  return (
    <>
      <div className="flex justify-center">
        <div className="p-8 pt-2 rounded-2xl max-w-5xl w-full ">
          <BreadCrumb
            page={[
              { name: 'Category', link: '/manage-soal-generate' },
              {
                name: detail?.name || 'Manage Soal',
                link: '#',
              },
            ]}
          />
          <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mb-5">
            <div className="title border-b border-[#ddd] w-full flex justify-between items-center pb-4 mb-5">
              <h1 className="text-xl text-indigo-950 font-bold">
                Manage Soal: {detail?.name}
              </h1>
              <div className="flex gap-2">
                 <TInput
                    placeholder="Cari Soal..."
                    onEnter={(val: string) => {
                       setSearch(val);
                       setPage(1); // Reset to first page
                    }}
                    onChange={(val: any) => {
                       if (val === '') {
                          setSearch('');
                          setPage(1);
                       }
                    }}
                    suffixIcon={<IconSearch size={20} />}
                    clearable
                    onClear={() => {
                       setSearch('');
                       setPage(1);
                    }}
                    style={{ width: '300px' }}
                 />
                  <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleImport}
                     className="hidden"
                     accept=".csv, .xlsx"
                  />
                  <Button
                     theme="primary"
                     variant="outline"
                     disabled={editId !== false}
                     onClick={() => fileInputRef.current?.click()}
                  >
                     <IconFileImport size={20} />
                     Import CSV/Excel
                  </Button>
                  <Button
                     theme="success"
                     variant="outline"
                     disabled={editId !== false}
                     onClick={() => {
                        setEditId(true);
                        setValue(DEFAULT_FORM);
                     }}
                  >
                     <IconPlus size={20} />
                     Tambah Soal
                  </Button>
               </div>
            </div>
          </div>
          {editId === true && (
            <div className="mb-8">
              <FormCreate
                value={value}
                setValue={setValue}
                onSubmit={onSubmit}
                tambahJawaban={tambahJawaban}
                hapusJawaban={hapusJawaban}
              />
            </div>
          )}
          <div className="" key={idRender}>
            {soalList.map((item: any, index: number) => {
              if (editId == item.id) {
                return (
                  <FormCreate
                    value={value}
                    setValue={setValue}
                    onSubmit={onSubmit}
                    editId={editId}
                    tambahJawaban={tambahJawaban}
                    hapusJawaban={hapusJawaban}
                  />
                );
              }
              return (
                <div key={index} className=" p-10 rounded-xl mb-5 bg-white ">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-600">
                      Pertanyaan No. {index + 1}{' '}
                    </div>
                    <div className="">
                      <button
                        type="button"
                        className="px-3 text-sm text-blue-600 font-semibold h-fit "
                        onClick={() => {
                          setValue(() => ({
                            ...convertArrayToObject(item.jawaban, true),
                            soal: item.soal,
                            pembahasan: item.pembahasan,
                            jawaban: Array.from(item.jawaban),
                            tingkatkesulitansoal: item.tingkatkesulitansoal || 'mudah', // Added field
                            // subcategory: item.subCategory, // Optional
                          }));
                          setEditId(item.id);
                        }}
                      >
                        <IconPencil />
                      </button>
                      <button
                        type="button"
                        className="px-3 text-sm text-red-600 font-semibold h-fit "
                        onClick={() => hapusSoal(item.id)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div
                      className="prose max-w-none w-full"
                      dangerouslySetInnerHTML={{ __html: item.soal }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-4 mb-4">
                    Jawaban:{' '}
                  </div>
                  {item.jawaban.map((jawaban: any, index: number) => (
                    <div key={index} className="flex  mb-2">
                      <Input
                        name={`isChecked-${item.id}`}
                        value={index}
                        containerClass=" mr-1 w-6 mt-1"
                        type="radio"
                        disabled
                        defaultChecked={jawaban.isCorrect}
                      />

                      <p className="mr-2 w-[10px] ">
                        {String.fromCharCode(65 + index)}.{' '}
                      </p>
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: jawaban.value }}
                        />
                    </div>
                  ))}

                  <div className="text-sm text-gray-600 mt-4">Pembahasan: </div>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.pembahasan }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
             <Pagination
                total={total}
                current={page}
                pageSize={pageSize}
                onChange={(pageInfo: any) => {
                   console.log('Pagination onChange Payload:', pageInfo);
                   if (typeof pageInfo === 'object' && pageInfo !== null) {
                      setPage(pageInfo.current);
                      setPageSize(pageInfo.pageSize);
                   } else {
                      setPage(pageInfo);
                   }
                }}
                showJumper
                pageSizeOptions={[20, 50, 100]}
            />
          </div>


        </div>
      </div>
    </>
  );
}
