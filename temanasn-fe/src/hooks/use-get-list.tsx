import { getData } from '@/utils/axios';
import { useState, useEffect } from 'react';

interface ListInfo {
  list: any[];
  count: number;
  isLoading: boolean;
  hasMore: boolean;
}

interface GetListProps {
  url: string;
  initialParams: any;
  useMore?: boolean;
  handleSuccess?: (res: any) => any;
}

export default function useGetList({
  url,
  initialParams,
  useMore = false,
  handleSuccess = (res: any) => res,
}: GetListProps) {
  const [params, setParams] = useState<any>({
    skip: 0,
    take: 10,
    sortBy: 'createdAt',
    descending: true,
    ...initialParams,
  });

  const [listInfo, setListInfo] = useState<ListInfo>({
    list: [],
    count: 0,
    isLoading: false,
    hasMore: true,
  });

  const { list, count, isLoading, hasMore } = listInfo;

  const getList = async (_params: any) => {
    if (!url) return;

    if (_params.disabled) return;

    setListInfo((_info) => ({ ..._info, isLoading: true }));

    const result: any = await getData(url, _params);

    if (result && result.list) {
      setListInfo((_info) => ({
        list:
          useMore && _params.skip > 0
            ? [..._info.list, ...result.list]
            : result.list,
        isLoading: false,
        count: result.pagination.total,
        hasMore: result.list.length === _params.take,
      }));
      handleSuccess(result);
    } else {
      setListInfo((): any => ({
        isLoading: false,
        list: [],
        error: result,
        data: result,
      }));
    }
  };

  useEffect(() => {
    getList(params);
  }, [params]);

  const goPage = (page: number) => {
    setParams((_params: any) => ({
      ..._params,
      page,
      skip: page * _params.take,
    }));
  };

  const clear = () => {
    setListInfo((_info) => ({
      ..._info,
      list: [],
      isLoading: false,
      hasMore: true,
    }));
  };

  const showMore = () => {
    setParams((_params: any) => ({
      ..._params,
      skip: _params.skip + _params.take,
    }));
  };

  const refresh = () => {
    setParams((_params: any) => ({
      ..._params,
      skip: 0,
    }));
  };

  return {
    listInfo,
    setListInfo,
    list,
    count,
    isLoading,
    params,
    setParams,
    goPage,
    hasMore,
    clear,
    showMore,
    refresh,
  };
}
