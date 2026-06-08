import Form from "@/components/form";
import Input from "@/components/input";
import { patchData, postData } from "@/utils/axios";
import FetchAPI from "@/utils/fetch-api";
import { useState } from "react";
import { Button, Dialog } from "tdesign-react";

export default function ManageTicket({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    // 🔑 langsung kirim JSON, tanpa FormData
    const payload = {
      userId: data.userId,
      title: data.title,
      description: data.description,
      category: data.category || "",
      status: data.status,
      adminResponse: data.adminResponse || "",
      image: data.image || "", // sekarang berupa link URL
    };

    FetchAPI(
      detail.id
        ? patchData(`admin/ticket/${detail.id}`, payload)
        : postData("admin/ticket", payload)
    )
      .then(() => {
        params.refresh();
        setVisible(false);
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
      header={detail.id ? "Edit Ticket" : "Tambah Ticket"}
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
            title="User ID"
            name="userId"
            type="text"
            validation={{
              required: "User ID harus di isi",
              pattern: {
                value: /^[0-9]+$/,
                message: "User ID harus berupa angka",
              },
            }}
          />
          <Input
            title="Title"
            name="title"
            type="text"
            validation={{
              required: "Title harus di isi",
            }}
          />
        </div>
        <div className="flex gap-5">
          <Input
            title="Description"
            name="description"
            type="multiple"
            validation={{
              required: "Description harus di isi",
            }}
          />
          <Input
            title="Category"
            name="category"
            type="text"
          />
        </div>
        <div className="flex gap-5">
          <Input
            title="Status"
            name="status"
            type="select"
            validation={{
              required: "Status harus di isi",
            }}
            options={[
              { label: "Open", value: "open" },
              { label: "In Progress", value: "in_progress" },
              { label: "Resolved", value: "resolved" },
              { label: "Closed", value: "closed" },
            ]}
            defaultValue="open"
          />
          <Input
            title="Admin Response"
            name="adminResponse"
            type="multiple"
          />
        </div>
        <Input
          title="Image URL"
          name="image"
          type="text"
          placeholder="https://example.com/image.jpg"
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
