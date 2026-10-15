import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../apis';

const LIMIT = 10;

export default function useListings() {
  const [searchParams] = useSearchParams();
  const baseQuery = searchParams.toString();

  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(1);
  const reqRef = useRef(0);

  const fetchPage = useCallback(async (pageNum, replace) => {
    const reqId = ++reqRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams(baseQuery);
      params.set('page', pageNum);
      params.set('limit', LIMIT);
      const { data } = await api.get(`/api/products/listings?${params}`);
      if (reqId !== reqRef.current) return; // stale response, ignore
      pageRef.current = pageNum;
      setHasMore(data.length === LIMIT);
      setProducts((prev) => (replace ? data : [...prev, ...data]));
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      if (reqId === reqRef.current) setLoading(false);
    }
  }, [baseQuery]);

  // any param change (sort, campus, price, query...) restarts at page 1
  useEffect(() => { fetchPage(1, true); }, [fetchPage]);

  const loadMore = () => {
    if (hasMore && !loading) fetchPage(pageRef.current + 1, false);
  };

  return { products, loading, hasMore, loadMore };
}
