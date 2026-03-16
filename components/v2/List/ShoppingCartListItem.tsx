import * as React from 'react';
import Image from 'next/image';
import { useSnackbar } from 'notistack';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

import { useCartStore } from 'store';
import { shoppingCartItemProps } from 'const';
import { currencyFormat, calcCartItemTotalPrice } from 'lib/utils';
import { buyBook } from 'lib/http';
import { useAuthGuard } from 'hooks/useAuthGuard';
import { useCurrentUser } from 'hooks/useCurrentUser';

export default function ShoppingCartListItem(props: shoppingCartItemProps) {
  const { id, title, authors, type, price, quantity, stock, publishedAt } = props;
  const [loading, setLoading] = React.useState(false);

  const { updateQuantity, removeItem } = useCartStore();
  const { requireAuth } = useAuthGuard();
  const { userId } = useCurrentUser();
  const { enqueueSnackbar } = useSnackbar();

  function handleAddQty() {
    if (quantity >= stock) return;
    updateQuantity(String(id), quantity + 1);
  }

  function handleRemoveQty() {
    if (quantity <= 1) return;
    updateQuantity(String(id), quantity - 1);
  }

  function deleteItem() {
    removeItem(String(id));
  }

  const handleBuyClick = async () => {
    setLoading(true);
    const response = await buyBook(id, {
      userID: userId ?? '1',
      quality: quantity,
    });
    if (response.error) {
      enqueueSnackbar(`Error: ${response.error}.`, { variant: 'error' });
      setLoading(false);
      return;
    }
    enqueueSnackbar(`${response.content?.message}`, { variant: 'success' });
    setLoading(false);
    removeItem(String(id));
  };

  return (
    <>
      <div className='card card-side bg-base-100 shadow-xl'>
        <figure>
          <Image
            src={`https://picsum.photos/seed/${id}/200/300`}
            alt={title}
            width={150}
            height={225}
          />
        </figure>
        <div className='card-body'>
          <div className='flex flex-col gap-1'>
            <p><span className='text-lg font-bold pr-4'>Title:</span>{title}</p>
            <p>
              <span className='text-lg font-bold pr-4'>Type:</span>
              {type.replaceAll(`_nbsp_`, ` `).replaceAll(`_amp_`, `&`)}
            </p>
            <p>
              <span className='text-lg font-bold pr-4'>Publication date:</span>
              {new Date(publishedAt).toLocaleDateString()}
            </p>
            <p><span className='text-lg font-bold pr-4'>Price:</span>{`$ ${currencyFormat(price)}`}</p>
            <p><span className='text-lg font-bold pr-4'>In stock:</span>{stock}</p>
            <div className='flex justify-between'>
              <div className='join'>
                <button
                  className='btn btn-sm join-item'
                  disabled={quantity >= stock}
                  onClick={handleAddQty}
                >
                  <PlusIcon className='stroke-current shrink-0 w-6 h-6' />
                </button>
                <input className='input input-sm input-bordered join-item w-12' value={quantity} disabled />
                <button
                  className='btn btn-sm join-item'
                  disabled={quantity <= 1}
                  onClick={handleRemoveQty}
                >
                  <MinusIcon className='stroke-current shrink-0 w-6 h-6' />
                </button>
              </div>
              <div className='flex justify-end gap-4'>
                <div className='font-bold'>
                  <span className='pr-1'>
                    {quantity === 1 ? `(${quantity} item) $` : `(${quantity} items) $`}
                  </span>
                  {calcCartItemTotalPrice([props])}
                </div>
              </div>
            </div>
            <div className='flex justify-end gap-4'>
              <button className='btn btn-sm btn-error' onClick={deleteItem}>
                <TrashIcon className='stroke-current shrink-0 w-6 h-6' />
                Delete
              </button>
              <button
                id={`checkout-btn-${id}`}
                className='btn btn-sm btn-info'
                onClick={() => requireAuth(handleBuyClick, 'checkout')}
                disabled={loading}
              >
                {loading && <span className='loading loading-spinner' />}
                Proceed to Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
