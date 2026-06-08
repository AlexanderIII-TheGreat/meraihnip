import Form from "@/components/form";
import Input from "@/components/input";
import { patchData, postData } from "@/utils/axios";
import FetchAPI from "@/utils/fetch-api";
import { useState } from "react";
import { Button, Dialog } from "tdesign-react";

export default function ManageAffiliate({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    // Auto-generate password = email jika create
    if (!detail.id && data.email) {
      data.password = data.email; // Akan di-hash di backend
    }

    FetchAPI(
      detail.id
        ? patchData(`api/affiliate/${detail.id}/update`, data)
        : postData("api/affiliate/create", data)
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

  const defaultValues = {
    ...detail,
    affiliateStatus: detail.affiliateStatus || "active",
    jenisKelamin: detail.jenisKelamin || "L",
  };

  return (
    <Dialog
      header={detail.id ? "Edit Affiliate" : "Tambah Affiliate"}
      visible
      onClose={handleClose}
      className="w-[800px]"
      footer={null}
    >
      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        defaultValues={defaultValues}
      >
        <div className="flex gap-5">
          <Input
            title="Nama Lengkap"
            name="name"
            type="text"
            validation={{
              required: "Nama lengkap harus di isi",
            }}
          />
          <Input
            title="Email address"
            name="email"
            type="email"
            validation={{
              required: "Email harus di isi",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Format email tidak sesuai",
              },
            }}
          />
        </div>

        <div className="flex gap-5">
          <Input
            type="password"
            name="password"
            title="Password"
            validation={
              detail?.id
                ? {}
                : {
                    required: "Password harus di isi",
                    minLength: {
                      value: 8,
                      message: "Password minimal 8 karakter",
                    },
                  }
            }
          />
          <Input
            title="Nomor Whatsapp"
            startAdornment="+62"
            placeholder="81234567890"
            name="noWA"
            type="text"
            validation={{
              required: "Nomor telepon harus di isi",
              pattern: {
                value: /^8[0-9]{9,11}$/,
                message: "Format nomor telepon tidak sesuai",
              },
            }}
          />
        </div>

        <div className="flex gap-5">
          <Input
            title="Jenis Kelamin"
            name="jenisKelamin"
            type="select"
            validation={{ required: "Jenis kelamin harus dipilih" }}
            options={[
              { label: "Laki-laki", value: "L" },
              { label: "Perempuan", value: "P" },
            ]}
          />
          <Input
            title="Kode Affiliate"
            name="affiliateCode"
            type="text"
            validation={{
              required: "Kode affiliate harus di isi",
            }}
          />
        </div>

        <Input
          title="Link Affiliate"
          name="affiliateLink"
          type="url"
          validation={{
            required: "Link affiliate harus di isi",
            pattern: {
              value: /https?:\/\/.+/,
              message: "Format URL tidak sesuai",
            },
          }}
        />

        <Input
          title="Status Affiliate"
          name="affiliateStatus"
          type="select"
          validation={{ required: "Status harus dipilih" }}
          options={[
            { label: "Aktif", value: "active" },
            { label: "Tidak Aktif", value: "inactive" },
          ]}
        />

        <Input title="Alamat" name="alamat" type="multiple" />

        <div className="flex gap-5">
          <Input name="provinsi" title="Provinsi" type="text" />
          <Input name="kabupaten" title="Kabupaten" type="text" />
          <Input name="kecamatan" title="Kecamatan" type="text" />
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
