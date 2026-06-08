import Form from '@/components/form';
import Input from '@/components/input';
import { IconTrash } from '@tabler/icons-react';
import { Button } from 'tdesign-react';

export default function FormCreate({
  tambahJawaban,
  hapusJawaban,
  onSubmit,
  value,
}: any) {
  // Removed subcategory fetching for now as it might not be relevant or needs adaptation
  // If subcategories are needed, we can add them back later
  
  return (
    <div className="bg-white p-10 rounded-xl mb-5">
      <Form onSubmit={(data) => onSubmit(data)} defaultValues={value}>

        <Input
          name="tingkatkesulitansoal"
          containerClass="mb-4"
          placeholder="Pilih tingkat kesulitan"
          type="select"
          title="Tingkat Kesulitan: "
          labelStyle="block mb-2 !text-base text-black"
          options={[
            { label: 'Mudah', value: 'mudah' },
            { label: 'Sedang', value: 'sedang' },
            { label: 'Sulit', value: 'sulit' },
          ]}
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
                  containerClass="w-5/6 mr-4"
                  type="ckeditor"
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
