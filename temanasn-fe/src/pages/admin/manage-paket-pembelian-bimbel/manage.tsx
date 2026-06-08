import Form from "@/components/form";
import Input from "@/components/input";
import useGetList from "@/hooks/use-get-list";
import { patchData, postData } from "@/utils/axios";
import FetchAPI from "@/utils/fetch-api";
import moment from "moment";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Dialog } from "tdesign-react";

export default function ManagePaketPembelian({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmit = async (data: any) => {
    setLoading(true);

    const payload = {
      ...data,
      paketPembelianId: id,
      date: moment(data.date, "DD/MM/YYYY HH:mm"),
    };

    FetchAPI(
      detail.id
        ? patchData(`admin/paket-pembelian-bimbel/update/${detail.id}`, payload)
        : postData("admin/paket-pembelian-bimbel/insert", payload)
    )
      .then(() => {
        params.refresh();
        setVisible(false);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = () => {
    setVisible(false);
    setDetail({});
  };

  const listLatihan = useGetList({
    url: "admin/paket-latihan/get",
    initialParams: {
      skip: 0,
      take: 0,
      sortBy: "createdAt",
      descending: true,
    },
  });

  return (
    <Dialog
      header={detail.id ? "Edit Bimbel" : "Tambah Bimbel"}
      visible
      onClose={handleClose}
      className="w-[800px]"
      footer={null}
    >
      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        defaultValues={detail}
      >
        <Input
          title="Judul"
          name="nama"
          type="text"
          validation={{
            required: "Judul tidak boleh kosong",
          }}
        />
        <Input title="Nama Mentor" name="mentor" type="text" />

        <Input
          title="Tanggal & Waktu"
          name="date"
          type="date"
          validation={{
            required: "Tanggal harus di isi",
          }}
          enableTimePicker
        />
        <Input
          title="Status"
          name="status"
          type="select"
          validation={{
            required: "Status tidak boleh kosong",
          }}
          options={[
            { label: "Belum Dimulai", value: "BELUM" },
            { label: "Berlangsung", value: "SEDANG" },
            { label: "Selesai", value: "SELESAI" },
          ]}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            title="Mini Test"
            name="paketLatihanId"
            type="select"
            options={listLatihan?.list?.map((item: any) => ({
              label: item.nama,
              value: item.id,
            }))}
          />
          <Input title="Link Materi" name="materiLink" type="text" />
          <Input title="Link Rekaman" name="rekamanLink" type="text" />
          <Input title="Link Video" name="videoLink" type="text" />
          
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            size="large"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="submit" size="large" loading={loading}>
            Submit
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}