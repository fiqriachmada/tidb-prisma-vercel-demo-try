import * as React from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { HomeIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';

import { useBookDetailsStore } from 'store';
import { BookDetailProps } from 'const';
import { currencyFormat } from 'lib/utils';
import BookInfoDialog from 'components/v2/BookDetails/BookInfoDialog';
import { fetchBookDetailsById } from 'lib/http';

export default function BookInfoSection() {
  const { bookId } = useBookDetailsStore();
  const [bookDetailsState, setBookDetailsState] = React.useState<BookDetailProps | undefined>();
  const editBookDetailDialogRef = React.useRef<HTMLDialogElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['book-detail', bookId],
    queryFn: () => fetchBookDetailsById(bookId),
    enabled: !!bookId,
  });

  if (!bookId || isLoading) {
    return (
      <div className='flex items-center justify-center'>
        <span className='loading loading-bars loading-lg' />
      </div>
    );
  }

  if (isError || !data?.content) {
    return <div className='text-error text-center py-8'>Failed to load book details.</div>;
  }

  const bookData = bookDetailsState ?? data.content;

  return (
    <>
      <div className='text-sm breadcrumbs'>
        <ul>
          <li>
            <NextLink href='/'>
              <HomeIcon className='w-4 h-4' />
              Book
            </NextLink>
          </li>
          <li>
            <BookmarkIcon className='w-4 h-4' />
            {bookData.title}
          </li>
        </ul>
      </div>

      <div className='hero h-auto justify-start shadow-xl rounded-box'>
        <div className='hero-content flex-col lg:flex-row'>
          <Image
            src={`https://picsum.photos/seed/${bookData.id}/200/280`}
            alt={`book image`}
            width={200}
            height={280}
          />
          <div className='flex flex-col gap-2'>
            <h1 className='text-5xl font-bold'>{bookData.title}</h1>
            <p className='pt-6'>
              <span className='text-lg font-bold pr-4'>Type:</span>
              {bookData.type.replaceAll(`_nbsp_`, ` `).replaceAll(`_amp_`, `&`)}
            </p>
            <p>
              <span className='text-lg font-bold pr-4'>Publication date:</span>
              {new Date(bookData.publishedAt).toLocaleDateString()}
            </p>
            <p>
              <span className='text-lg font-bold pr-4'>Price:</span>
              {`$ ${currencyFormat(bookData.price)}`}
            </p>
            <p>
              <span className='text-lg font-bold pr-4'>In stock:</span>
              {bookDetailsState?.stock || bookData.stock}
            </p>
            <button
              className='btn btn-info w-32'
              onClick={() => editBookDetailDialogRef.current?.showModal()}
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>

      {bookData && (
        <BookInfoDialog
          key={`${bookData.id}-${bookData.stock}`}
          id='edit_book_detail'
          ref={editBookDetailDialogRef}
          data={bookData}
          onSuccess={setBookDetailsState}
        />
      )}
    </>
  );
}
