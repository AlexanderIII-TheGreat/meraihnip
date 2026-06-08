import Form from "@/components/form";
import Input from "@/components/input";
import { patchData, postData } from "@/utils/axios";
import FetchAPI from "@/utils/fetch-api";
import { useEffect, useState } from "react";
import { Button, Dialog } from "tdesign-react";

type RegionOption = {
  label: string;
  value: string;
  code: string;
};

export default function ManageUser({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [selectedProvId, setSelectedProvId] = useState<string>("");
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>("");

  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProvinces(
            data.map((p: any) => ({ label: p.name, value: p.name, code: p.id }))
          );
        }
      })
      .catch(() => {
        setProvinces([]);
      });
  }, []);

  useEffect(() => {
    if (!detail?.provinsi || provinces.length === 0 || selectedProvId) return;
    const selected = provinces.find((p) => p.value === detail.provinsi || p.label === detail.provinsi);
    if (selected) setSelectedProvId(selected.code);
  }, [detail?.provinsi, provinces, selectedProvId]);

  useEffect(() => {
    if (!selectedProvId) {
      setRegencies([]);
      return;
    }

    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvId}.json`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRegencies(
            data.map((r: any) => ({ label: r.name, value: r.name, code: r.id }))
          );
        }
      })
      .catch(() => {
        setRegencies([]);
      });
  }, [selectedProvId]);

  useEffect(() => {
    if (!detail?.kabupaten || regencies.length === 0 || selectedRegencyId) return;
    const selected = regencies.find((r) => r.value === detail.kabupaten || r.label === detail.kabupaten);
    if (selected) setSelectedRegencyId(selected.code);
  }, [detail?.kabupaten, regencies, selectedRegencyId]);

  useEffect(() => {
    if (!selectedRegencyId) {
      setDistricts([]);
      return;
    }

    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedRegencyId}.json`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDistricts(
            data.map((d: any) => ({ label: d.name, value: d.name, code: d.id }))
          );
        }
      })
      .catch(() => {
        setDistricts([]);
      });
  }, [selectedRegencyId]);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    FetchAPI(
      detail.id
        ? patchData(`admin/users/update/${detail.id}`, data)
        : postData("admin/users/insert", data)
    )
      .then(() => {
        params.refresh();
        setVisible(false);
        setLoading(false);
      })
      .catch(() => {
        // Error toast is handled by FetchAPI; keep form open for correction.
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = () => {
    setVisible(false);
    setDetail({});
  };

  return (
    <Dialog
      header={detail.id ? "Edit User" : "Tambah User"}
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
                ? {
                    validate: (value: string) =>
                      !value || value.length >= 8 || "Password minimal 8 karakter",
                  }
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
            title="Nomor Telepon"
            startAdornment="+62"
            placeholder="81234567890"
            name="noWA"
            type="text"
            validation={{
              required: "Nomor telepon harus di isi",
              pattern: {
                value: /^8[0-9]{9,11}$/,
                message: "Format nomor telphone tidak sesuai",
              },
            }}
          />
        </div>
        <Input title="Alamat" name="alamat" type="multiple" />

        <Input
          name="provinsi"
          title="Provinsi"
          type="select"
          options={provinces}
          onChange={(val: string) => {
            const selected = provinces.find((p) => p.value === val);
            setSelectedProvId(selected?.code || "");
            setSelectedRegencyId("");
            setRegencies([]);
            setDistricts([]);
          }}
        />

        <Input
          name="kabupaten"
          title="Kabupaten/Kota"
          type="select"
          options={regencies}
          disabled={!selectedProvId}
          onChange={(val: string) => {
            const selected = regencies.find((r) => r.value === val);
            setSelectedRegencyId(selected?.code || "");
            setDistricts([]);
          }}
        />

        <Input
          name="kecamatan"
          title="Kecamatan"
          type="select"
          options={districts}
          disabled={!selectedRegencyId}
        />
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
