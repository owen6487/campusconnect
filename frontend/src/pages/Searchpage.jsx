import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../apis';
import useListings from '../Hooks/uselisting';
import usePageMeta from '../Hooks/usePageMeta';
import ProductGrid from '../components/ProductGrid';

const SORTS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
];

const field = "mt-1 w-full text-sm border rounded-lg px-3 py-2 bg-white";

function Searchpage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, loading, hasMore, loadMore } = useListings();

    // ── filter state, seeded from the URL ──
    const [campus, setCampus] = useState(searchParams.get('campus') || '');
    const [branch, setBranch] = useState(searchParams.get('branch') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    const [query] = useState(searchParams.get('query') || '');

    const [sheetOpen, setSheetOpen] = useState(false);

    usePageMeta({
        title: category ? `${category} for sale on campus` : 'Search listings on campus',
        description: category
            ? `Browse ${category} listings for sale on campus. Compare prices and contact sellers directly.`
            : 'Search listings by campus, branch, category and price to find students selling items near you.',
        keepParams: ['category'],
    });

    // ── dropdown data ──
    const [campuses, setCampuses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [categories, setCategories] = useState([]);

    // ── keep local state and URL in sync ──
    // ── keep local filter state in sync with the URL ──
   useEffect(() => {
    setCampus(searchParams.get('campus') || '');
    setBranch(searchParams.get('branch') || '');
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'newest');
}, [searchParams]);
    const setParams = (updates) => {
        const p = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
        setSearchParams(p);
    };

    const handleCampusChange = (value) => {
        setCampus(value);
        setBranch(''); // changing campus always resets branch
        setParams({ campus: value, branch: '' });
    };

    const handleBranchChange = (value) => {
        setBranch(value);
        setParams({ branch: value });
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        setParams({ category: value });
    };

    const handleSortChange = (value) => {
        setSort(value);
        setParams({ sort: value });
    };

    const priceInvalid = minPrice && maxPrice && Number(minPrice) > Number(maxPrice);

    const applyPrice = (e) => {
        e.preventDefault();
        if (priceInvalid) return;
        setParams({ minPrice, maxPrice });
    };

    const activeCount = [campus, branch, category, minPrice, maxPrice].filter(Boolean).length;

    const clearAll = () => {
        setCampus('');
        setBranch('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        setParams({ campus: '', branch: '', category: '', minPrice: '', maxPrice: '', query: '' });
    };

    // ── load dropdown data ──
    useEffect(() => {
        api.get('/api/campuses/all').then((r) => setCampuses(r.data)).catch(console.error);
    }, []);

    useEffect(() => {
        api.get(`/api/products/categories${campus ? `?campus=${campus}` : ''}`)
            .then((r) => setCategories(r.data))
            .catch(console.error);
    }, [campus]);

    useEffect(() => {
        if (!campus) {
            setBranches([]);
            return;
        }
        api.get(`/api/branches/all/${campus}`).then((r) => setBranches(r.data)).catch(console.error);
    }, [campus]);

    // ── lock page scroll while the mobile sheet is open ──
    useEffect(() => {
        document.body.style.overflow = sheetOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [sheetOpen]);

 
  // ── filter fields, shared by the desktop bar and the mobile sheet ──
  const filterFields = (
    <>
      <label className="text-xs text-gray-500">Campus
        <select value={campus} onChange={(e) => handleCampusChange(e.target.value)} className={field}>
          <option value="">All campuses</option>
          {campuses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </label>
 
      <label className="text-xs text-gray-500">Branch
        <select value={branch} onChange={(e) => handleBranchChange(e.target.value)}
          disabled={!campus || branches.length === 0} className={`${field} disabled:bg-gray-100 disabled:text-gray-400`}>
          <option value="">
            {!campus ? 'Pick a campus first' : branches.length ? 'All branches' : 'No branches'}
          </option>
          {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
      </label>
 
      <label className="text-xs text-gray-500">Category
        <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className={field}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
        </select>
      </label>
 
      <form onSubmit={applyPrice} className="md:col-span-2">
        <div className="flex gap-2 items-end">
          <label className="text-xs text-gray-500 flex-1 min-w-0">Min (KSh)
            <input type="number" min="0" inputMode="numeric" value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)} className={field} />
          </label>
          <label className="text-xs text-gray-500 flex-1 min-w-0">Max (KSh)
            <input type="number" min="0" inputMode="numeric" value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)} className={field} />
          </label>
          <button type="submit" disabled={priceInvalid}
            className="bg-blue-700 text-white text-sm rounded-lg px-4 py-2 hover:bg-blue-800 disabled:opacity-50">
            Apply
          </button>
        </div>
        {priceInvalid && <p className="text-xs text-red-600 mt-1">Min price can't be higher than max price.</p>}
      </form>
    </>
  );
 
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Heading */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg md:text-xl font-bold truncate">
          {query ? `Results for "${query}"` : 'Browse listings'}
        </h2>
        {activeCount > 0 && (
          <button onClick={clearAll} className="shrink-0 text-sm text-blue-700 hover:underline">
            Clear filters
          </button>
        )}
      </div>
 
      {/* Desktop: inline filter bar */}
      <div className="hidden md:grid grid-cols-5 gap-3 items-start bg-gray-50 border rounded-lg p-3 mb-4">
        {filterFields}
      </div>
 
      {/* Toolbar: Filters button (phones) + sort (always) */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button onClick={() => setSheetOpen(true)}
          className="md:hidden flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm text-gray-700">
          Filters
          {activeCount > 0 && (
            <span className="bg-blue-700 text-white text-xs rounded-full px-1.5 min-w-[1.25rem] text-center">
              {activeCount}
            </span>
          )}
        </button>
 
        <label className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <span className="hidden sm:inline">Sort by</span>
          <select value={sort} onChange={(e) => handleSortChange(e.target.value )}
            className="border rounded-lg px-3 py-1.5 text-sm text-gray-700">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>
 
      {/* Results */}
      <ProductGrid
      
        products={products}
      
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        emptyMessage="No items match your search. Try changing the filters or searching with different words."
      />
 
      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setSheetOpen(false)} aria-label="Close filters"
                className="text-gray-500 text-xl leading-none px-2">✕</button>
            </div>
 
            <div className="grid grid-cols-1 gap-3 p-4 overflow-y-auto">{filterFields}</div>
 
            <div className="flex gap-3 p-4 border-t">
              <button onClick={() => { clearAll(); setSheetOpen(false); }}
                className="flex-1 border rounded-lg py-2 text-sm text-gray-700">Clear filters</button>
              <button onClick={() => setSheetOpen(false)}
                className="flex-1 bg-blue-700 text-white rounded-lg py-2 text-sm font-medium">Show results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Searchpage;