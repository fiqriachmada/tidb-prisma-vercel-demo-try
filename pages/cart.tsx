import * as React from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';

import CommonLayout from 'components/v2/Layout';
import ShoppingCartList from 'components/v2/List/ShoppingCartList';

const Cart: NextPage = () => {
  return (
    <>
      <Head>
        <title>Shopping Cart</title>
        <meta name='description' content='shopping cart' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <CommonLayout
        headerProps={{
          hideMenu: true,
        }}
      >
        <h1 className='font-bold text-5xl'>Shopping Cart</h1>
        <ShoppingCartList />
      </CommonLayout>
    </>
  );
};

// Force SSR — prevents React 19 + Recoil static prerender crash on Vercel
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default Cart;
