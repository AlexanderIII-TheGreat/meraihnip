import { Table } from 'tdesign-react';

export default function TableWrapper({ data, columns }: any) {
  const onFilterChange = (filters: any) => {
    Object.keys(filters)?.forEach((key) => {
      if (!filters?.[key]) {
        delete filters?.[key];
      } else if (key == "pembeli"){
	filters[key] = Number(filters?.[key])
	}
    });
    data.setParams((prev: any) => ({
      ...prev,
      filters,
    }));
  };

  const onSortChange = (sorter: any) => {
    if (!sorter) {
      data.setParams((prev: any) => ({
        ...prev,
        sortBy: 'createdAt',
        descending: true,
      }));
    } else {
      data.setParams((prev: any) => ({
        ...prev,
        descending: !sorter.descending,
        sortBy: sorter.sortBy,
      }));
    }
  };

  return (
    <div className="overflow-auto">
      <Table
        loading={data.isLoading}
        rowKey="key"
        data={data?.list}
        columns={columns}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        className="table"
        pagination={{
          defaultCurrent: 1,
          total: data.count,
          showJumper: false,
          pageSizeOptions: [5, 10, 20, 100],
          onPageSizeChange: (pageSize: number) => {
            data.setParams((prev: any) => ({ ...prev, take: pageSize }));
          },
          onChange(pageInfo) {
            data.setParams((prev: any) => ({
              ...prev,
              skip: (pageInfo.current - 1) * pageInfo.pageSize,
            }));
          },
        }}
        lazyLoad
      />
    </div>
  );
}
