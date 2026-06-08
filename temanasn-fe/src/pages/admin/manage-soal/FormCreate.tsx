import Form from '@/components/form';
import Input from '@/components/input';
import useGetList from '@/hooks/use-get-list';
import { IconTrash } from '@tabler/icons-react';
import { Button } from 'tdesign-react';

export default function FormCreate({
  tambahJawaban,
  hapusJawaban,
  onSubmit,
  value,
  setValue,
}: any) {
  const getData = useGetList({
    url: 'admin/bank-soal/get-subcategory',
    initialParams: {
      take: 5,
      id: 0,
      skip: 0,
    },
  });
  return (
    <div className="bg-white p-10 rounded-xl mb-5">
      <Form onSubmit={(data) => onSubmit(data)} defaultValues={value}>
        <Input
          name="subcategory"
          containerClass="mb-4"
          placeholder=" "
          type="selectCreatable"
          title="Sub Category: "
          labelStyle="block mb-2 !text-base text-black"
          options={getData?.list?.map((item: any) => ({
            label: item.value,
            value: item.value,
          }))}
          value={value?.subcategory}
        />
        <Input
          name="soal"
          className="mb-4"
          type="ckeditor"
          title="Soal: "
          labelStyle="block mb-2 !text-base text-black"
        />

        <Input
          name="pembahasan"
          className="mb-4"
          type="ckeditor"
          title="Pembahasan:"
          labelStyle="block mb-2 !text-base text-black"
        />
        <div className=" text-base mb-4">Jawaban:</div>
        {value?.jawaban?.length > 0 ? (
          value.jawaban?.map((item: any) => {
            if (item.isDeleted) return <div></div>;
            const visibleIndex = value.jawaban
              .filter((item: any) => !item.isDeleted)
              .indexOf(item);

            return (
              <div className="flex  mb-2">
                <Input
                  name={`isChecked`}
                  value={item.id}
                  containerClass=" mr-2 mt-4 w-6"
                  type="radio"
                />
                <p className="mr-4 mt-3  w-[10px]">
                  {String.fromCharCode(65 + visibleIndex)}.
                </p>
                <Input
                  name={`value-${item.id}`}
                  containerClass="w-4/6 mr-4"
                  type="ckeditor"
                />
                <Input
                  name={`point-${item.id}`}
                  containerClass="w-1/6 h-full"
                  type="number"
                  placeholder="Point"
                  defaultValue={0}
                  onChange={(e) => {
                    setValue((prev: any) => ({
                      ...prev,
                      jawaban: prev.jawaban?.map((item: any, i: number) => {
                        if (i === item.id) {
                          return {
                            ...item,
                            point: e.target.value,
                          };
                        }
                        return item;
                      }),
                    }));
                  }}
                />
                <button
                  type="button"
                  className="px-3 text-sm text-red-600 font-semibold h-fit "
                  onClick={() => hapusJawaban(item.id)}
                >
                  <IconTrash />
                </button>
              </div>
            );
          })
        ) : (
          <div></div>
        )}

        <div className="flex justify-between mt-5">
          <Button theme="success" onClick={tambahJawaban}>
            Tambah Jawaban
          </Button>
          <div className="flex gap-3">
            <Button type="submit">Simpan</Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
