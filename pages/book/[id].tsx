import * as React from 'react';

import BookReviewsSection from 'components/v2/BookDetails/BookReviewsSection';
import CommonLayout from 'components/v2/Layout';
import Head from 'next/head';
import type { NextPage, GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useBookDetailsStore } from 'store';

const BookInfoSection = dynamic(import('components/v2/BookDetails/BookInfoSection'), { ssr: false });

const Book: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { setBookId } = useBookDetailsStore();

  React.useEffect(() => {
    if (id) setBookId(id as string);
  }, [id, setBookId]);

  return (
    <>
      <Head>
        <title>Book Details</title>
        <meta name='description' content='Book Details' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <CommonLayout headerProps={{ hideMenu: true }}>
        <BookInfoSection />
        <BookReviewsSection />
      </CommonLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default Book;
