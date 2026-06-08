import { useEffect, useState } from 'react';
import { Button, Switch, Table, MessagePlugin } from 'tdesign-react';
import { IconDeviceFloppy, IconReload } from '@tabler/icons-react';
import BreadCrumb from '@/components/breadcrumb';
import { motion } from 'framer-motion';
import { putData } from '@/utils/axios';
import useGetList from '@/hooks/use-get-list';
import { useHomeStore } from '@/stores/home-stores';

export default function SidebarMenuSetting() {
  const getList = useGetList({
    url: 'admin/sidebar-menu/get',
    initialParams: {
      sortBy: 'order',
      descending: false,
    }
  });

  const [localData, setLocalData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (getList.list) {
      setLocalData(getList.list);
    }
  }, [getList.list]);

  const handleToggleActive = (id: number) => {
    setLocalData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const handleToggleBadge = (id: number) => {
    setLocalData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, hasBadge: !item.hasBadge } : item
      )
    );
  };

  const { setData } = useHomeStore();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save each modified item
      const promises = localData.map(item => 
        putData(`admin/sidebar-menu/update/${item.id}`, {
          title: item.title,
          isActive: item.isActive,
          hasBadge: item.hasBadge,
          order: item.order
        })
      );
      
      await Promise.all(promises);
      MessagePlugin.success('Settings saved successfully!');
      // Clear cache to force refetch in SideMenu
      setData({ sidebarMenu: [] });
      getList.refresh();
    } catch (error) {
      console.error(error);
      MessagePlugin.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      colKey: 'id',
      title: 'ID',
      width: 50,
    },
    {
      colKey: 'title',
      title: 'Menu Title',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <span>{row.title}</span>
          {row.hasBadge && (
            <motion.span
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded font-bold leading-none"
            >
              NEW
            </motion.span>
          )}
        </div>
      ),
    },
    {
      colKey: 'link',
      title: 'Link',
    },
    {
      colKey: 'isActive',
      title: 'Active',
      align: 'center' as const,
      cell: ({ row }: any) => (
        <Switch
          value={row.isActive}
          onChange={() => handleToggleActive(row.id)}
        />
      ),
    },
    {
      colKey: 'hasBadge',
      title: 'Show "NEW" Badge',
      align: 'center' as const,
      cell: ({ row }: any) => (
        <Switch
          value={row.hasBadge}
          onChange={() => handleToggleBadge(row.id)}
        />
      ),
    },
  ];

  return (
    <section className="p-6">
      <BreadCrumb
        page={[
          { name: 'Admin', link: '/dashboard' },
          { name: 'Setting', link: '#' },
          { name: 'Sidebar Menu Setting', link: '#' },
        ]}
      />

      <div className="bg-white p-8 rounded-2xl shadow-sm mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-indigo-950">
              Sidebar Menu Setting
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage user sidebar menu items and visibility.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={<IconReload size={18} />}
              onClick={() => getList.refresh()}
            >
              Refresh
            </Button>
            <Button
              theme="primary"
              className="bg-indigo-600"
              icon={<IconDeviceFloppy size={18} />}
              loading={isSaving}
              onClick={handleSave}
            >
              Save Settings
            </Button>
          </div>
        </div>

        <div className="overflow-auto">
          <Table
            data={localData}
            columns={columns}
            rowKey="id"
            hover
            loading={getList.isLoading}
            className="border rounded-lg"
          />
        </div>

        <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-sm text-indigo-800">
          <strong>Note:</strong> Changes saved here will be reflected on the user's sidebar menu in real-time.
        </div>
      </div>
    </section>
  );
}
