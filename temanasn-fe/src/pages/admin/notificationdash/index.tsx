import { useState, useEffect } from "react";
import { Button, Input, Select, Switch, Textarea, MessagePlugin, Table } from "tdesign-react";
import BreadCrumb from "@/components/breadcrumb";
import { postData, getData, deleteData } from "@/utils/axios"; // Removed putData, added deleteData

export default function DashboardNotificationForm() {
  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    link: "",
    type: "info",
    priority: 0,
    status: "active",
  });

  const [notifications, setNotifications] = useState([]); // State for notification table
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const load = async () => {
    try {
      const res = await getData("dashboard-notification");
      console.log("API response:", res);

      // FIX: akses langsung ke res.list
      const list = res?.list || [];
      console.log("List untuk table:", list);

      setNotifications(list);

      if (list.length > 0) {
        const activeNotification =
          list.find((item) => item.status === "active") || list[0];

        setForm({
          id: activeNotification.id,
          title: activeNotification.title || "",
          description: activeNotification.description || "",
          link: activeNotification.link || "",
          type: activeNotification.type || "info",
          priority: activeNotification.priority || 0,
          status: activeNotification.status || "active",
        });
      } else {
        setForm({
          id: null,
          title: "",
          description: "",
          link: "",
          type: "info",
          priority: 0,
          status: "active",
        });
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };
  load();
}, []);


  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        status: form.status === "active" ? "active" : "archived",
      };

      console.log("Submitting payload:", payload);

      // Delete existing notification if it exists
      if (form.id) {
        await deleteData(`dashboard-notification/${form.id}`);
        console.log("Existing notification deleted:", form.id);
      }

      // Create new notification
      const response = await postData("dashboard-notification", payload);
      MessagePlugin.success("Notification created!");

      // Update form with new notification ID
      setForm((prev) => ({
        ...prev,
        id: response.data.id,
        title: "",
        description: "",
        link: "",
        type: "info",
        priority: 0,
        status: "active",
      }));

      // Refresh notification list (should only contain the new notification)
      const res = await getData("dashboard-notification");
      setNotifications(res?.data?.list || []);
    } catch (err) {
      console.error("Error in handleSubmit:", err.message, err.response?.data);
      MessagePlugin.error(`Failed: ${err.response?.data?.msg || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Table columns for notification display
  const columns = [
    { colKey: "id", title: "ID", width: 100 },
    { colKey: "title", title: "Title", width: 200 },
    { colKey: "description", title: "Description", width: 300 },
    { colKey: "link", title: "Link", width: 200 },
    { colKey: "type", title: "Type", width: 100 },
    { colKey: "priority", title: "Priority", width: 100 },
    { colKey: "status", title: "Status", width: 100 },
  ];

  return (
    <section>
      <BreadCrumb page={[{ name: "Dashboard Notification", link: "/dashboard-notification" }]} />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <h1 className="text-2xl text-indigo-950 font-bold mb-5">Dashboard Notification</h1>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1">Title</label>
            <Input
              value={form.title}
              onChange={(v) => handleChange("title", v)}
              placeholder="Notification title"
            />
          </div>

          <div>
            <label className="block mb-1">Description</label>
            <Textarea
              value={form.description}
              onChange={(v) => handleChange("description", v)}
              placeholder="Notification description"
            />
          </div>

          <div>
            <label className="block mb-1">Link</label>
            <Input
              value={form.link}
              onChange={(v) => handleChange("link", v)}
              placeholder="https://example.com"
            />
          </div>

          <Select
            label="Type"
            value={form.type}
            onChange={(v) => handleChange("type", v)}
            options={[
              { label: "Info", value: "info" },
              { label: "Warning", value: "warning" },
              { label: "Error", value: "error" },
              { label: "Success", value: "success" },
            ]}
          />

          <Input
            label="Priority"
            type="number"
            value={form.priority}
            onChange={(v) => handleChange("priority", Number(v))}
          />

          <div className="flex items-center gap-3">
            <span>Status:</span>
            <Switch
              value={form.status === "active"}
              onChange={(v) => handleChange("status", v ? "active" : "archived")}
            />
            <span>{form.status}</span>
          </div>

          <Button
            theme="primary"
            onClick={handleSubmit}
            loading={loading}
            className="w-fit mt-3"
          >
            Create Notification
          </Button>
        </div>

        <div className="mt-8">
          <h2 className="text-xl text-indigo-950 font-bold mb-3">Current Notification</h2>
          <Table
            data={notifications}
            columns={columns}
            rowKey="id"
            pagination={false}
            empty="No notifications available"
          />
        </div>
      </div>
    </section>
  );
}