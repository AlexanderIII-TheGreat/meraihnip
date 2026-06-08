import { useEffect, useState, useRef } from 'react';
import Input from '@/components/input';
import {
  IconFileSpreadsheet,
  IconPencil,
  IconPlus,
  IconTableImport,
  IconTrash,
  IconList,
  IconDeviceFloppy,
  IconX,
} from '@tabler/icons-react';
import { Alert, Button, Dialog, Upload, MessagePlugin } from 'tdesign-react';
import { useParams } from 'react-router-dom';
import FetchAPI from '@/utils/fetch-api';
import {
  deleteData,
  getData,
  getExcel,
  patchData,
  postData,
} from '@/utils/axios';
import FormCreate from './FormCreate';
import BreadCrumb from '@/components/breadcrumb';
import { imageLink } from '@/utils/image-link';
import { useAuthStore } from '@/stores/auth-store';
import CKeditor from '@/components/ckeditor';

const DEFAULT_FORM = {
  soal: '',
  pembahasan: '',
  jawaban: [
    {
      jawaban: '',
      point: 0,
      id: 0,
    },
    {
      jawaban: '',
      point: 0,
      id: 1,
    },
    {
      jawaban: '',
      point: 0,
      id: 2,
    },
    {
      jawaban: '',
      point: 0,
      id: 3,
    },
  ],
};

interface JawabanItem {
  jawaban: string;
  point: number;
  id: number;
  isDeleted?: boolean; // Add this line to define the property
}

interface ValueState {
  soal: string;
  pembahasan: string;
  jawaban: JawabanItem[];
}
interface OutputObject {
  isChecked: string;
  [key: string]: string | boolean | undefined; // Add an index signature
}

export default function ManageSoal() {
  const { id } = useParams();
  const [idRender, setIdRender] = useState(0);
  const [detail, setDetail] = useState({
    nama: '',

    parentCategoryId: 0,
    BankSoal: [],
  });
  const [editId, setEditId] = useState(false);

  const [value, setValue] = useState<ValueState>(DEFAULT_FORM);

  const getDetail = async () => {
    getData(`admin/bank-soal-kategori/find/${id}`).then((res) => {
      setDetail(res);
      setIdRender(idRender + 1);
    });
  };

  useEffect(() => {
    getDetail();
  }, []);

  const [parent, setParent] = useState<any>({});

  const getParent = async () => {
    getData(
      `admin/bank-soal-parent-kategori/find/${detail?.parentCategoryId}`
    ).then((res) => {
      setParent(res);
    });
  };

  useEffect(() => {
    if (detail.parentCategoryId) {
      getParent();
    }
  }, [detail]);
  const hapusSoal = async (idSoal: number) => {
    FetchAPI(deleteData(`admin/bank-soal/remove/${idSoal}`)).then(() => {
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
          point: 0,
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
          point: parseInt(obj[`point-${id}`]) || 0,
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
      const pointKey = `point-${jawaban.id}`;
      const idKey = `id-${jawaban.id}`;
      const isUpdateKey = `isUpdated-${jawaban.id}`;

      outputObject[jawabanKey] = jawaban.jawaban;
      outputObject[pointKey] = jawaban.point?.toString();
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
      subCategory: data.subcategory,
    };

    FetchAPI(
      editId === true
        ? postData(`admin/bank-soal/insert`, payload)
        : patchData(`admin/bank-soal/update/${editId}`, payload)
    ).then(() => {
      getDetail();
      setEditId(false);
      setValue(DEFAULT_FORM);
    });
  };

  const handleExportExcel = async () => {
    await getExcel(
      `admin/bank-soal/export/${id}`,
      `Bank Soal - ${detail?.nama}`
    );
  };

  const handleDownloadTemplateExcel = async () => {
    await getExcel('admin/bank-soal/template', 'Template Bank Soal');
  };

  const [showModal, setShowModal] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const token = useAuthStore.getState().token
    ? useAuthStore.getState().token
    : '';

  const [uploadStatus, setUploadStatus] = useState({
    status: '',
    erorrList: [],
  });


  // - Bulk Edit -
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.size === bulkData.length
        ? new Set()
        : new Set(bulkData.map(s => s.id))
    );
  };
  const enterBulkMode = () => {
    const mapped = detail.BankSoal.map((soal: any) => {
      const correctIdx = soal.BankSoalJawaban.findIndex((j: any) => j.isCorrect);
      return {
        id: soal.id,
        soal: soal.soal,
        pembahasan: soal.pembahasan,
        subCategory: soal.subCategory || '',
        jawabanBenar: correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : 'A',
        jawaban: soal.BankSoalJawaban.map((j: any, idx: number) => ({
          id: j.id,
          jawaban: j.jawaban,
          isCorrect: j.isCorrect,
          point: j.point ?? 0,
          label: String.fromCharCode(65 + idx),
        })),
      };
    });
    setBulkData(mapped);
    setBulkMode(true);
    setSelectedIds(new Set(mapped.map((s: any) => s.id)));
  };

  const updateBulkField = (soalId: number, field: string, value: any) => {
    setBulkData(prev => prev.map(s => {
      if (s.id !== soalId) return s;
      if (field === 'jawabanBenar') {
        return {
          ...s,
          jawabanBenar: value,
          jawaban: s.jawaban.map((j: any) => ({ ...j, isCorrect: j.label === value })),
        };
      }
      if (field.startsWith('point-')) {
        const label = field.replace('point-', '');
        return {
          ...s,
          jawaban: s.jawaban.map((j: any) =>
            j.label === label ? { ...j, point: Number(value) } : j
          ),
        };
      }
      return { ...s, [field]: value };
    }));
  };

  const saveBulkEdit = async () => {
    setBulkSaving(true);
    let successCount = 0;
    let errorCount = 0;
    const toSave = bulkData.filter((s: any) => selectedIds.has(s.id));
    for (const soal of toSave) {
      try {
        const payload = {
          categoryId: Number(id),
          soal: soal.soal,
          pembahasan: soal.pembahasan,
          subCategory: soal.subCategory,
          jawaban: soal.jawaban.map((j: any) => ({
            id: j.id,
            value: j.jawaban,
            isCorrect: j.isCorrect,
            point: j.point,
            isUpdate: true,
            isDeleted: false,
          })),
        };
        await patchData(`admin/bank-soal/update/${soal.id}`, payload);
        successCount++;
      } catch (e) {
        errorCount++;
      }
    }
    setBulkSaving(false);
    setBulkMode(false);
    getDetail();
    if (errorCount === 0) {
      MessagePlugin.success(`${successCount} soal berhasil disimpan`);
    } else {
      MessagePlugin.warning(`${successCount} berhasil, ${errorCount} gagal`);
    }
  };

  return (
    <>
      <div className=" flex justify-center">
        <Dialog
          visible={showModal}
          header="Import Soal"
          onClose={() => setShowModal(false)}
          className="w-[800px]"
          footer={null}
        >
          <ol className="list-decimal list-inside">
            <li>
              <button
                type="button"
                className="text-blue-500"
                onClick={handleDownloadTemplateExcel}
              >
                Download template
              </button>{' '}
              excel
            </li>
            <li>Isi data sesuai dengan template</li>
            <li>Upload Kembali file excel</li>
          </ol>

          <Upload
            showUploadProgress
            className="mt-4 mb-2"
            theme="file"
            headers={{
              Authorization: `Bearer ${token}`,
            }}
            useMockProgress
            action={imageLink(`api/admin/bank-soal/import/${id}`)}
            method="POST"
            files={[]}
            onSuccess={() => {
              getDetail();
              setUploadStatus({
                status: 'SUCCESS',
                erorrList: [],
              });
            }}
            onFail={(res: any) => {
              setUploadStatus({
                status: 'ERROR',
                erorrList: JSON.parse(res.XMLHttpRequest?.responseText)?.error,
              });
            }}
          />
          {uploadStatus.status === 'ERROR' && (
            <Alert
              theme="error"
              message={
                <ol className=" list-disc list-inside">
                  {uploadStatus.erorrList.map((item: any) => (
                    <li>{item}</li>
                  ))}
                </ol>
              }
            />
          )}

          {uploadStatus.status === 'SUCCESS' && (
            <Alert theme="success" message="Berhasil Melakukan Import" />
          )}
        </Dialog>
        <div className="p-8 pt-2 rounded-2xl max-w-5xl w-full ">
          <BreadCrumb
            page={[
              { name: 'Bank Soal', link: '/manage-soal-category' },
              {
                name: parent?.nama || 'Category',
                link: `/manage-soal-subcategory/${detail?.parentCategoryId}`,
              },
              {
                name: detail?.nama || 'Manage Soal',
                link: '#',
              },
            ]}
          />
          <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mb-5">
            <div className="title border-b border-[#ddd] w-full flex justify-between">
              <h1 className="text-xl text-indigo-950 font-bold mb-5 ">
                Manage Soal
              </h1>
              <div className="flex gap-3">
                <Button
                  theme="success"
                  size="medium"
                  variant="dashed"
                  onClick={handleExportExcel}
                  className="hover:shadow-xl"
                >
                  <IconTableImport size={20} className="" />
                </Button>
                <Button
                  theme="primary"
                  size="medium"
                  variant="dashed"
                  onClick={() => setShowModal(true)}
                  className="hover:shadow-xl"
                >
                  <IconFileSpreadsheet size={20} className="" />
                </Button>
                <Button
                  theme="warning"
                  size="medium"
                  variant="dashed"
                  onClick={enterBulkMode}
                  disabled={bulkMode || detail.BankSoal?.length === 0}
                  className="hover:shadow-xl"
                >
                  <IconList size={20} />
                </Button>
              </div>
            </div>
          </div>
          {/* - BULK EDIT MODE - */}
          {bulkMode && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IconList size={20} className="text-yellow-600" />
                  <span className="font-bold text-indigo-950">Mode Edit Massal</span>
                  <span className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
                    {bulkData.length} soal
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    theme="default"
                    variant="outline"
                    size="small"
                    onClick={() => { setBulkMode(false); setBulkData([]); }}
                    disabled={bulkSaving}
                  >
                    <IconX size={16} />
                    Batal
                  </Button>
                  <Button
                    theme="success"
                    size="small"
                    onClick={saveBulkEdit}
                    loading={bulkSaving}
                  >
                    <IconDeviceFloppy size={16} />
                    {bulkSaving ? 'Menyimpan...' : `Simpan (${selectedIds.size} dipilih)`}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-sm border-collapse bg-white">
                  <thead>
                    <tr className="bg-indigo-50 text-indigo-950">
                      <th className="px-3 py-3 text-center font-bold text-xs w-10 border-b border-gray-200">
                        <input type="checkbox"
                          className="w-4 h-4 cursor-pointer accent-indigo-600"
                          checked={selectedIds.size === bulkData.length && bulkData.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-3 py-3 text-left font-bold text-xs w-10 border-b border-gray-200">No</th>
                      <th className="px-3 py-3 text-left font-bold text-xs w-28 border-b border-gray-200">SubCategory</th>
                      <th className="px-3 py-3 text-left font-bold text-xs border-b border-gray-200">Soal (preview)</th>
                      <th className="px-3 py-3 text-center font-bold text-xs w-24 border-b border-gray-200">Jwb Benar</th>
                      {['A','B','C','D','E'].map(l => (
                        <th key={l} className="px-2 py-3 text-center font-bold text-xs w-20 border-b border-gray-200">
                          Point {l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bulkData.map((soal: any, idx: number) => (
                      <tr key={soal.id} className={`transition-opacity ${!selectedIds.has(soal.id) ? 'opacity-40' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}>
                        <td className="px-3 py-2 text-center border-b border-gray-100">
                          <input type="checkbox"
                            className="w-4 h-4 cursor-pointer accent-indigo-600"
                            checked={selectedIds.has(soal.id)}
                            onChange={() => toggleSelect(soal.id)}
                          />
                        </td>
                        <td className="px-3 py-2 text-center text-gray-500 font-medium text-xs border-b border-gray-100">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-2 border-b border-gray-100">
                          <input
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400 bg-white"
                            value={soal.subCategory}
                            onChange={e => updateBulkField(soal.id, 'subCategory', e.target.value)}
                            placeholder="Sub kategori"
                          />
                        </td>
                        <td className="px-3 py-2 border-b border-gray-100 max-w-xs">
                          <p className="text-xs text-gray-700 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: soal.soal?.replace(/<[^>]*>/g, ' ').substring(0, 120) + '...' }}
                          />
                        </td>
                        <td className="px-2 py-2 text-center border-b border-gray-100">
                          <select
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400 bg-white w-full"
                            value={soal.jawabanBenar}
                            onChange={e => updateBulkField(soal.id, 'jawabanBenar', e.target.value)}
                          >
                            {soal.jawaban.map((j: any) => (
                              <option key={j.label} value={j.label}>{j.label}</option>
                            ))}
                          </select>
                        </td>
                        {['A','B','C','D','E'].map(label => {
                          const jItem = soal.jawaban.find((j: any) => j.label === label);
                          return (
                            <td key={label} className="px-2 py-2 text-center border-b border-gray-100">
                              {jItem ? (
                                <input
                                  type="number"
                                  className={`w-16 border rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none bg-white ${
                                    jItem.isCorrect
                                      ? 'border-green-400 bg-green-50 font-bold text-green-700'
                                      : 'border-gray-200 focus:border-indigo-400'
                                  }`}
                                  value={jItem.point}
                                  onChange={e => updateBulkField(soal.id, `point-${label}`, e.target.value)}
                                />
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  theme="success"
                  onClick={saveBulkEdit}
                  loading={bulkSaving}
                >
                  <IconDeviceFloppy size={18} />
                  {bulkSaving ? 'Menyimpan...' : `Simpan (${selectedIds.size} dipilih)`}
                </Button>
              </div>
            </div>
          )}

          <div className="" key={idRender}>
            {detail?.BankSoal?.map((item: any, index: number) => {
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
                      {item.subCategory ? ` | ${item.subCategory}` : ''}
                    </div>
                    <div className="">
                      <button
                        type="button"
                        className="px-3 text-sm text-blue-600 font-semibold h-fit "
                        onClick={() => {
                          setValue(() => ({
                            ...convertArrayToObject(item.BankSoalJawaban, true),
                            soal: item.soal,
                            pembahasan: item.pembahasan,
                            jawaban: Array.from(item.BankSoalJawaban),
                            subcategory: item.subCategory,
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
                  <CKeditor content={item.soal} readOnly />
                  <div className="text-sm text-gray-600 mt-4 mb-4">
                    Jawaban:{' '}
                  </div>
                  {item.BankSoalJawaban.map((jawaban: any, index: number) => (
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
                      <div className="w-10/12 mr-4 self-start">
                        <CKeditor content={jawaban.jawaban} readOnly />
                      </div>

                      <div className="w-1/12 h-full text-right">
                        {jawaban.point}
                      </div>
                    </div>
                  ))}

                  <div className="text-sm text-gray-600 mt-4">Pembahasan: </div>
                  <CKeditor content={item.pembahasan} readOnly />
                </div>
              );
            })}
          </div>

          {editId === true && (
            <FormCreate
              value={value}
              setValue={setValue}
              onSubmit={onSubmit}
              tambahJawaban={tambahJawaban}
              hapusJawaban={hapusJawaban}
            />
          )}

          <div className="flex justify-center mt-10">
            <Button
              theme="success"
              variant="outline"
              disabled={editId !== false}
              onClick={() => setEditId(true)}
            >
              <IconPlus size={20} />
              Tambah Soal
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
