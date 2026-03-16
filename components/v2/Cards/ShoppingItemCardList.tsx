import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import ShoopingItemCard from 'components/v2/Cards/ShoppingItemCard';
import { useHomePageQueryStore } from 'store';
import { fetchBooks } from 'lib/http';

export interface BookListProps {
  page: number;
  pageSize: number;
  onTotalChange?: (total: number) => void;
}

export default function BookList({ page, pageSize, onTotalChange }: BookListProps) {
  const { query } = useHomePageQueryStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['books', query.page, query.size, query.type, query.sort],
    queryFn: () => fetchBooks({ page: query.page, size: query.size, type: query.type, sort: query.sort }),
  });

  React.useEffect(() => {
    if (data?.total !== undefined) {
      onTotalChange?.(data.total);
    }
  }, [data?.total, onTotalChange]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center'>
        <span className='loading loading-bars loading-lg' />
      </div>
    );
  }

  if (isError) {
    return <div className='text-error text-center py-8'>Failed to load books. Please try again.</div>;
  }

  return (
    <>
      {!!data?.total && (
        <div className='text-sm text-gray-500 pb-4'>
          {`${pageSize * (page - 1) + 1} ~ ${
            pageSize * page > data.total ? data.total : pageSize * page
          } of over ${data.total} results`}
        </div>
      )}
      <div className='grid grid-cols-1 gap-x-2 gap-y-10 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 xl:gap-x-8'>
        {data?.content?.map((book) => (
          <ShoopingItemCard key={book.id} {...book} />
        ))}
      </div>
    </>
  );
}
