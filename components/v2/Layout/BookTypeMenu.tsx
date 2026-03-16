import * as React from 'react';
import { useSnackbar } from 'notistack';
import clsx from 'clsx';

import { useHomePageQueryStore } from 'store';
import { SORT_VALUE } from 'const';
import { upperCaseEachWord } from 'lib/utils';
import { fetchBookTypes } from 'lib/http';

export default function BookTypeMenu() {
  const [loadingBookType, setLoadingBookType] = React.useState(false);
  const [bookTypeList, setBookTypeList] = React.useState<string[]>([]);

  const { query, setQuery } = useHomePageQueryStore();
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (bookTypeList.length) return;
    const func = async () => {
      setLoadingBookType(true);
      const res = await fetchBookTypes();
      const { error, content } = res;
      if (error) {
        enqueueSnackbar(`Error: Fetch Book Types`, { variant: 'error' });
        setLoadingBookType(false);
        return;
      }
      setBookTypeList(content);
      setLoadingBookType(false);
    };
    func();
  }, [bookTypeList.length, enqueueSnackbar]);

  return (
    <>
      <ul
        tabIndex={0}
        className='menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52'
      >
        <li>
          <div className='menu-title'>Book Type</div>
          <ul>
            {bookTypeList.map((bookType) => (
              <li
                key={bookType}
                onClick={() => setQuery({ page: 1, type: bookType })}
              >
                <span className={clsx({ active: query.type === bookType })}>
                  {bookType.replaceAll(`_nbsp_`, ` `).replaceAll(`_amp_`, `&`)}
                </span>
              </li>
            ))}
          </ul>
        </li>

        <li>
          <div className='menu-title'>Order by</div>
          <ul>
            {SORT_VALUE.map((sortType) => (
              <li
                key={sortType}
                onClick={() => setQuery({ page: 1, sort: sortType })}
              >
                <span className={clsx({ active: query.sort === sortType })}>
                  {upperCaseEachWord(sortType.replaceAll(`_`, ` `))}
                </span>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </>
  );
}
