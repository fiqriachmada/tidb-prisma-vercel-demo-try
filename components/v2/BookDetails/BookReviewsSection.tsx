import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { useBookDetailsStore } from 'store';
import { BookRatingsProps, starLabels } from 'const';
import { roundHalf } from 'lib/utils';
import HalfRating from 'components/v2/Rating/HalfRating';
import BookRatingDeleteDialog from 'components/v2/BookDetails/BookRatingDeleteDialog';
import BookAddRatingDialog from 'components/v2/BookDetails/BookAddRatingDialog';
import { fetchBookRatingsById } from 'lib/http';

export default function BookReviewsSection() {
  const { bookId } = useBookDetailsStore();
  const addRatingDialogRef = React.useRef<HTMLDialogElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['book-ratings', bookId],
    queryFn: () => fetchBookRatingsById(bookId),
    enabled: !!bookId,
  });

  if (!bookId || isLoading) {
    return (
      <div className='flex items-center justify-center mt-6'>
        <span className='loading loading-bars loading-lg' />
      </div>
    );
  }

  // fetchBookRatingsById returns { content: { content: BookRatingsProps[], total: number } }
  const reviews: BookRatingsProps[] = data?.content?.content ?? [];

  return (
    <>
      <div className='hero h-auto justify-start mt-6'>
        <div className='hero-content items-start'>
          <div className='max-w-md'>
            <h2 className='text-3xl font-bold'>Customer Reviews</h2>
            <p className='py-6'>
              <ReviewOverview content={reviews} />
            </p>
            <button
              className='btn btn-info'
              onClick={() => addRatingDialogRef?.current?.showModal()}
            >
              Add Review
            </button>
          </div>
          <div className='overflow-x-auto mt-16'>
            {reviews.length > 0 && (
              <ReviewsTable content={reviews} bookId={bookId} />
            )}
          </div>
        </div>
      </div>
      <BookAddRatingDialog bookId={bookId} ref={addRatingDialogRef} />
    </>
  );
}

const ReviewOverview = ({ content }: { content: BookRatingsProps[] }) => {
  const num = content.length;
  const sum = content.reduce((prev, item) => prev + item.score, 0);
  const avg = num > 0 ? sum / num : 0;
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center py-2'>
        <HalfRating disabled rating={avg} />
        <div className='ml-2'>{starLabels[roundHalf(avg)]}</div>
      </div>
      <div className='text-sm text-gray-500'>{`${num} global ratings`}</div>
      {[5, 4, 3, 2, 1, 0].map((star) => (
        <StarPercentageBar
          key={star}
          leftText={`${star} Star`}
          value={num > 0 ? (content.filter((i) => i.score === star).length / num) * 100 : 0}
        />
      ))}
    </div>
  );
};

const StarPercentageBar = ({ leftText, value = 0 }: { leftText?: string; value: number }) => {
  const valueRound = Math.round(value);
  return (
    <div className='flex items-center justify-between gap-2'>
      {leftText && <span className='text-sm text-gray-500 w-32'>{leftText}</span>}
      <progress className='progress progress-info' value={valueRound} max='100' />
      <span className='text-sm text-gray-500 w-32'>{`${valueRound}%`}</span>
    </div>
  );
};

const ReviewsTable = ({ content, bookId }: { content: BookRatingsProps[]; bookId: string }) => {
  const [targetUserId, setTargetUserId] = React.useState<string | null>(null);
  const deleteDialogRef = React.useRef<HTMLDialogElement>(null);

  const handleDelete = (userId: string) => () => {
    setTargetUserId(userId);
    deleteDialogRef.current?.showModal();
  };

  return (
    <>
      <table className='table'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Rating</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {content.map((item) => (
            <tr key={item.userId}>
              <td>
                <div className='flex items-center space-x-3'>
                  <div className='avatar placeholder'>
                    <div className='bg-neutral-focus text-neutral-content mask mask-squircle w-12 h-12'>
                      <span className='text-3xl'>{item.user.nickname.substring(0, 1)}</span>
                    </div>
                  </div>
                  <div>
                    <div className='font-bold'>{item.user.nickname}</div>
                    <div className='text-sm opacity-50'>User ID: {item.user.id}</div>
                  </div>
                </div>
              </td>
              <td><HalfRating disabled rating={item.score} /></td>
              <td>{new Date(item.ratedAt).toLocaleDateString()}</td>
              <th>
                <button className='btn btn-error btn-xs' onClick={handleDelete(item.userId)}>
                  delete
                </button>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
      {targetUserId && (
        <BookRatingDeleteDialog bookId={bookId} userId={targetUserId} ref={deleteDialogRef} />
      )}
    </>
  );
};
