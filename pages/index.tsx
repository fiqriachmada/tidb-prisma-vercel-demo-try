import * as React from 'react';

import CommonLayout from 'components/v2/Layout';
import { FilteredChips } from 'components/v2/Chips/FilteredChips';
import Head from 'next/head';
import type { NextPage, GetServerSideProps } from 'next';
import Pagination from 'components/v2/Pagination';
import dynamic from 'next/dynamic';
import { useHomePageQueryStore } from 'store';

const BookList = dynamic(import('components/v2/Cards/ShoppingItemCardList'), { ssr: false });

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const Home: NextPage = () => {
  const { query, setQuery } = useHomePageQueryStore();
  const [totalBooks, setTotalBooks] = React.useState(0);

  const totalPages = Math.max(1, Math.ceil(totalBooks / query.size));

  return (
    <>
      <Head>
        <title>Bookstore Home</title>
        <meta name='description' content='Bookstore Home Page' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <CommonLayout>
        {/* Active filters */}
        {(query.sort || query.type) && (
          <FilteredChips data={query} onChange={setQuery} />
        )}

        {/* Book list */}
        <BookList
          page={query.page}
          pageSize={query.size}
          onTotalChange={setTotalBooks}
        />

        {/* ── Footer: page-size selector + pagination ──────────────── */}
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-6'>
          {/* Page size selector */}
          <div className='flex items-center gap-2 text-sm'>
            <span className='text-base-content/50'>Tampilkan</span>
            <select
              className='select select-bordered select-sm w-20'
              value={query.size}
              onChange={(e) => setQuery({ size: Number(e.target.value), page: 1 })}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className='text-base-content/50'>
              per halaman · {totalBooks} buku
            </span>
          </div>

          {/* Page navigation */}
          <Pagination
            currentPage={query.page}
            pages={totalPages}
            onClick={(page) => setQuery({ page })}
          />
        </div>
      </CommonLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default Home;
