'use client';
import { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { FlipkartProductData } from '@/lib/FlipkartProduct.types';

const FlipkartChart = ({ data }: { data: FlipkartProductData[] }) => {
  const typeSet = new Set(data.map((links) => links.type));
  const [filterType, setFilterType] = useState('All');
  const onFilterChange = (event: React.FormEvent<EventTarget>) => {
    const { value } = event.target as HTMLInputElement;
    setFilterType(value);
  };
  return (
    <>
      <div className='join flex w-full mx-auto justify-start flex-wrap px-2'>
        <input
          className='join-item btn w-32 !bg-none'
          type='radio'
          name='options'
          aria-label='All'
          value='All'
          onChange={onFilterChange}
        />
        {Array.from(typeSet).map((type) => {
          return (
            <input
              className='join-item btn w-48 !bg-none'
              type='radio'
              name='options'
              aria-label={type}
              value={type}
              onChange={onFilterChange}
              key={type}
            />
          );
        })}
      </div>
      <div className='flex flex-wrap'>
        {data.map((product) => {
          if (filterType !== 'All' && filterType !== product.type) {
            return null;
          }
          return (
            <div className='w-1/2 h-96 pt-4 pb-28' key={product.url}>
              <span className='flex w-full pl-6'>
                URL:{' '}
                <a href={product.url} className='pl-1'>
                  {product.header}
                </a>
              </span>

              <span key={product.productId} className='flex w-full pl-6 pb-4'>
                Price Notify: {product.priceNotify}
                <span className='pl-2'>
                  Current Price: {product.currentPrice}
                </span>
                <span className='pl-2'>
                  Lowest Price: {product.lowestPrice}
                </span>
                {product.cardPrice !== 0 &&
                  <span className='pl-2'>
                    Card Price: {product.cardPrice}
                  </span>
                }
                <span className='pl-2 text-red-500'>{product.type}</span>
                {product.isSoldOut && (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='size-6 pl-2'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636'
                    />
                  </svg>
                )}
                {product.isSoldOut && (
                  <button className='inline-block relative'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-6 w-6 text-gray-700'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                      />
                    </svg>
                    <span className='animate-ping absolute top-1 right-0.5 block h-1 w-1 rounded-full ring-2 ring-green-400 bg-green-600'></span>
                  </button>
                )}
              </span>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  width={500}
                  height={300}
                  data={product.history}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis
                    domain={[product.lowestPrice - 200, 'dataMax + 200']}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='price'
                    stroke='#8884d8'
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FlipkartChart;
