import { Link } from 'react-router-dom';
import { getImageUrl, FALLBACK_IMAGE } from '../utils/imageUrl';

const ProductGrid = ({
  products,
  loading,
  hasMore,
  onLoadMore,
  emptyMessage = 'No items here yet. Be the first to sell something!',
}) => {

  // first load: show skeletons instead of the empty message
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded shadow animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
            <div className="h-3 bg-gray-200 rounded mt-2 w-full" />
            <div className="h-4 bg-gray-200 rounded mt-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">Nothing found</p>
        <p className="text-sm mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((p) => {
          const location = [p.campus?.name, p.branch?.name].filter(Boolean).join(' · ');

          return (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="bg-white p-3 sm:p-4 rounded shadow hover:shadow-lg transition-shadow"
            >
              <img
                src={getImageUrl(p.images?.[0])}
                alt={p.name}
                loading="lazy"
                width={500}
                height={320}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGE;
                }}
                className="w-full h-40 sm:h-48 object-cover rounded"
              />
              {location && (
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 truncate">
                  {location}
                </p>
              )}
              <h2 className="text-base sm:text-lg font-semibold truncate">{p.name}</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
              <p className="text-gray-800 font-bold mt-1">
                KSh {Number(p.price).toLocaleString()}
              </p>
            </Link>
          );
        })}
      </div>

      {hasMore && products.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </>
  );
};
export default ProductGrid;

