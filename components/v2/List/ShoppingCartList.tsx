import * as React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

import { useCartStore } from 'store';
import { calcCartItemSum, calcCartItemTotalPrice } from 'lib/utils';
import ShoppingCartListItem from 'components/v2/List/ShoppingCartListItem';
import LoginWarning from 'components/v2/Auth/LoginWarning';
import { useCurrentUser } from 'hooks/useCurrentUser';

export default function ShoppingCartList() {
  const cart = useCartStore((s) => s.cart);
  const { isAuthenticated, isLoading } = useCurrentUser();

  return (
    <div className='flex flex-col gap-4 py-4'>
      {!isLoading && !isAuthenticated && !!cart.length && (
        <LoginWarning message='Anda harus masuk terlebih dahulu untuk melanjutkan checkout.' />
      )}

      {cart.map((cartItem) => (
        <ShoppingCartListItem key={cartItem.id} {...cartItem} />
      ))}

      {!!cart.length && (
        <SubTotal
          sum={calcCartItemSum(cart)}
          price={calcCartItemTotalPrice(cart)}
        />
      )}

      {!cart.length && <EmptyCartAlert />}
    </div>
  );
}

const EmptyCartAlert = () => (
  <div className='alert alert-info'>
    <InformationCircleIcon className='stroke-current shrink-0 w-6 h-6' />
    <span>Your shopping cart is empty.</span>
  </div>
);

const SubTotal = (props: { sum: number; price: number }) => {
  const { sum, price } = props;
  return (
    <div className='flex flex-col items-end gap-4'>
      <p className='font-bold'>
        <span className='pr-1'>
          {sum === 1 ? `Subtotal: (${sum} item) $` : `Subtotal: (${sum} items) $`}
        </span>
        {price}
      </p>
    </div>
  );
};
