import * as React from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { VariantType, useSnackbar } from 'notistack';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCartStore } from 'store';
import { BookProps } from 'const';
import { currencyFormat } from 'lib/utils';
import HalfRating from 'components/v2/Rating/HalfRating';

export default function ShoopingItemCard(props: BookProps) {
  const { id, title, type, price, averageRating = 0, authors, ratings, stock } = props;
  const addItem = useCartStore((s) => s.addItem);
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    const result = addItem({ ...props, quantity: 1 });
    if (result === 'maxstock') {
      enqueueSnackbar(`Out of stock!`, { variant: 'error' });
    } else {
      enqueueSnackbar(`"${title}" was successfully added.`, { variant: 'success' });
    }
  };

  return (
    <div className='card card-compact w-96 bg-base-100 shadow-xl'>
      <figure>
        <Image
          src={`https://picsum.photos/seed/${id}/384/140`}
          alt={title}
          width={384}
          height={140}
        />
      </figure>
      <div className='card-body'>
        <div className='text-sm text-slate-500'>
          {type.replaceAll(`_nbsp_`, ` `).replaceAll(`_amp_`, `&`)}
        </div>
        <h2 className='card-title'>{title}</h2>
        <p className='font-medium text-slate-500'>
          {authors.map((author) => author.author.name).join(`, `)}
        </p>
        <HalfRating rating={averageRating} disabled />
        <div className='card-actions justify-end'>
          <button className='btn' onClick={handleAdd}>
            ${currencyFormat(price)}
            <ShoppingCartIcon className='h-6 w-6' />
          </button>
          <NextLink href={`/book/${id}`} className='btn btn-info'>
            View Details
          </NextLink>
        </div>
      </div>
    </div>
  );
}
