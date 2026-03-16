import { useQuery } from '@tanstack/react-query';
import { fetchBooks } from 'lib/http';

export const BOOKS_QUERY_KEY = 'books';

interface UseBooksParams {
  page?: number;
  size?: number;
  type?: string;
  sort?: string;
}

/**
 * Fetches a paginated list of books using TanStack Query.
 */
export function useBooks(params: UseBooksParams = {}) {
  return useQuery({
    queryKey: [BOOKS_QUERY_KEY, params],
    queryFn: () => fetchBooks(params),
    staleTime: 1000 * 60, // 1 minute
  });
}
