import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import apiService from "../../services/api";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BottomDrawer from "../../components/BottomDrawer/BottomDrawer";
import { ProductCard, StarRating, PriceBlock } from "../../components/storefront";
import {
  categoryParam,
  resolveCategory,
  getCategoryScopeIds,
  orderCategoriesHierarchically,
} from "../../utils/categories";
import {
  getProductMinPrice,
  truncateText,
  buildCartItem,
  productPath,
  getDeviceType,
  onImageError,
  PLACEHOLDER_IMG,
} from "../../utils/helpers";
import { Reveal } from "../../components/motion";
import styles from "./Products.module.css";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Avg. Customer Rating" },
  { value: "popularity", label: "Popularity" },
];

// Accept common sort aliases from deep links (e.g. ?sort=price_asc) and map them
// to canonical option values; anything unrecognised falls back to "relevance".
const SORT_ALIASES = {
  price_asc: "price-low",
  "price-asc": "price-low",
  price_low: "price-low",
  lowtohigh: "price-low",
  price_desc: "price-high",
  "price-desc": "price-high",
  price_high: "price-high",
  hightolow: "price-high",
  latest: "newest",
  new: "newest",
  popular: "popularity",
  "best-rated": "rating",
};

const normalizeSort = (raw) => {
  if (!raw) return "relevance";
  const v = String(raw).toLowerCase();
  if (SORT_OPTIONS.some((o) => o.value === v)) return v;
  return SORT_ALIASES[v] || "relevance";
};

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Infinity },
];

const RATING_OPTIONS = [4, 3, 2, 1];
const DISCOUNT_OPTIONS = [50, 30, 20, 10];
const PER_PAGE_OPTIONS = [12, 24, 48];

// Compact rupee figure for chips/labels (no paise) — calmer than formatCurrency.
const inr = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

// ---------------------------------------------------------------------------
// Small inline icons (no icon-library dependency); colour via currentColor so
// they inherit the tokenized text/brass colours — no hardcoded hex.
// ---------------------------------------------------------------------------
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <rect x="3" y="10" width="18" height="4" rx="1" />
    <rect x="3" y="16" width="18" height="4" rx="1" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
);

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><polyline points="9 6 15 12 9 18" /></svg>
);

// Disclosure chevron for the collapsible filter groups (rotates when open).
const GroupChevron = () => (
  <svg className={styles.groupChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
);

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Brand skeletons — calm shimmer (sf-skeleton primitive) in the card silhouette
// ---------------------------------------------------------------------------
const GridCardSkeleton = () => (
  <div className={styles.skeletonCard} aria-hidden="true">
    <div className={`sf-skeleton ${styles.skeletonMedia}`} />
    <div className={styles.skeletonBody}>
      <span className={`sf-skeleton sf-skeleton--text ${styles.skBrand}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skName}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skPrice}`} />
    </div>
  </div>
);

const ListRowSkeleton = () => (
  <div className={styles.skeletonRow} aria-hidden="true">
    <div className={`sf-skeleton ${styles.skeletonRowMedia}`} />
    <div className={styles.skeletonRowBody}>
      <span className={`sf-skeleton sf-skeleton--text ${styles.skName}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skLine}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skPrice}`} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Empty state illustration (simple inline SVG; tokenized via the page aliases)
// ---------------------------------------------------------------------------
const EmptyIllustration = () => (
  <svg className={styles.emptyIllustration} width="180" height="150" viewBox="0 0 200 160" fill="none" aria-hidden="true">
    <rect x="40" y="30" width="120" height="90" rx="8" fill="var(--empty-box)" />
    <rect x="55" y="50" width="90" height="10" rx="4" fill="var(--empty-line)" />
    <rect x="55" y="70" width="60" height="10" rx="4" fill="var(--empty-line)" />
    <rect x="55" y="90" width="75" height="10" rx="4" fill="var(--empty-line)" />
    <circle cx="100" cy="135" r="18" fill="var(--empty-circle)" opacity="0.3" />
    <text x="100" y="141" textAnchor="middle" fontSize="20" fill="var(--empty-circle)">?</text>
  </svg>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // ---- Data state ---
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // ---- UI state ----
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ---- Refs ----
  const mainRef = useRef(null); // top of results region, for page-change scroll
  const pendingScrollRef = useRef(false); // set by pagination, consumed post-commit

  // ---- Read URL params ----
  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlSort = normalizeSort(searchParams.get("sort"));
  const urlPage = parseInt(searchParams.get("page"), 10) || 1;
  const urlPerPage = parseInt(searchParams.get("per_page"), 10);
  const urlMinPrice = searchParams.get("min_price") || "";
  const urlMaxPrice = searchParams.get("max_price") || "";

  // ---- Filter state (local, synced to URL) ----
  const [selectedCategories, setSelectedCategories] = useState(() => (urlCategory ? urlCategory.split(",") : []));
  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState(urlSort);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [perPage, setPerPage] = useState(() =>
    PER_PAGE_OPTIONS.includes(urlPerPage) ? urlPerPage : 12
  );

  // ---- Fetch data on mount (retryable from the error state) ----
  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiService.products.getAll(),
        apiService.categories.getAll(),
      ]);
      setAllProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllProducts([]);
      setCategories([]);
      // Distinguish "couldn't load" from "no matches" — the grid renders a
      // retryable error panel instead of the misleading empty state.
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // ---- Keep filter state in sync with the URL (the URL is the source of truth) ----
  // Re-derive every URL-backed filter whenever the query string (or the loaded
  // categories) changes. This fires not only on first mount / a deep link, but
  // ALSO when a header, main-menu, sidebar, homepage or breadcrumb link is
  // clicked while we are already on this page: React Router keeps <Products>
  // mounted on a query-only change, so without this the listing would never
  // react to the new category (the long-standing "URL changes but nothing
  // re-renders / the checkbox stays stuck" bug). Category tokens are normalized
  // to their canonical slug, and a legacy numeric-id deep link (?category=3) is
  // rewritten to the slug form in place. Every setter is guarded against its
  // current value, so re-applying a value we just pushed to the URL can't loop.
  useEffect(() => {
    const tokens = urlCategory ? urlCategory.split(",").filter(Boolean) : [];
    const normalized = categories.length
      ? tokens.map((t) => {
          const cat = resolveCategory(t, categories);
          return cat ? cat.slug : t;
        })
      : tokens;

    setSelectedCategories((prev) =>
      prev.join(",") === normalized.join(",") ? prev : normalized
    );
    // Canonicalize a legacy ?category=<id> link to its slug form in the URL.
    if (categories.length && normalized.join(",") !== tokens.join(",")) {
      syncUrlParams({
        category: normalized,
        search: urlSearch,
        sort: urlSort,
        page: urlPage,
        per_page: PER_PAGE_OPTIONS.includes(urlPerPage) ? urlPerPage : 12,
        min_price: urlMinPrice,
        max_price: urlMaxPrice,
      });
    }

    setMinPrice((prev) => (prev === urlMinPrice ? prev : urlMinPrice));
    setMaxPrice((prev) => (prev === urlMaxPrice ? prev : urlMaxPrice));
    setSortBy((prev) => (prev === urlSort ? prev : urlSort));
    setCurrentPage((prev) => (prev === urlPage ? prev : urlPage));
    setPerPage((prev) => {
      const next = PER_PAGE_OPTIONS.includes(urlPerPage) ? urlPerPage : 12;
      return prev === next ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlSearch, urlSort, urlPage, urlPerPage, urlMinPrice, urlMaxPrice, categories]);

  // ---- Sync URL params when filters change ----
  // NOTE: any param mutated in the same handler MUST be passed as an override —
  // the closure below still holds this render's (pre-update) state values.
  const syncUrlParams = useCallback(
    (overrides = {}) => {
      const merged = {
        category: overrides.category !== undefined ? overrides.category : selectedCategories,
        search: overrides.search !== undefined ? overrides.search : urlSearch,
        sort: overrides.sort !== undefined ? overrides.sort : sortBy,
        page: overrides.page !== undefined ? overrides.page : currentPage,
        per_page: overrides.per_page !== undefined ? overrides.per_page : perPage,
        min_price: overrides.min_price !== undefined ? overrides.min_price : minPrice,
        max_price: overrides.max_price !== undefined ? overrides.max_price : maxPrice,
      };
      const params = new URLSearchParams();
      if (merged.category && merged.category.length) params.set("category", Array.isArray(merged.category) ? merged.category.join(",") : merged.category);
      if (merged.search) params.set("search", merged.search);
      if (merged.sort && merged.sort !== "relevance") params.set("sort", merged.sort);
      if (merged.page > 1) params.set("page", String(merged.page));
      if (merged.per_page && Number(merged.per_page) !== 12) params.set("per_page", String(merged.per_page));
      if (merged.min_price) params.set("min_price", merged.min_price);
      if (merged.max_price) params.set("max_price", merged.max_price);
      setSearchParams(params, { replace: true });
    },
    [selectedCategories, urlSearch, sortBy, currentPage, perPage, minPrice, maxPrice, setSearchParams]
  );

  // Reset to page 1 and drop the stale page param from the URL. Use this for the
  // session-only filters (rating/discount/in-stock/brand) that are not URL params
  // themselves — they only need the page reset reflected in the URL.
  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
    syncUrlParams({ page: 1 });
  }, [syncUrlParams]);

  // ---- Derived: brands extracted from loaded products ----
  const availableBrands = useMemo(() => {
    const brands = new Set();
    allProducts.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [allProducts]);

  // ---- Derived: product count per category id ----
  // Counts honour the parent-includes-children rule: a category's count is the
  // number of products in that category PLUS all of its descendants — i.e. the
  // exact result set you get by selecting it. (A parent therefore shows an
  // aggregate that overlaps its children's counts, which is the standard,
  // expected behaviour.)
  const categoryCounts = useMemo(() => {
    const direct = new Map();
    allProducts.forEach((p) => {
      const key = String(p.categoryId);
      direct.set(key, (direct.get(key) || 0) + 1);
    });
    const counts = new Map();
    categories.forEach((cat) => {
      let total = 0;
      getCategoryScopeIds(cat.id, categories).forEach((id) => {
        total += direct.get(String(id)) || 0;
      });
      counts.set(String(cat.id), total);
    });
    return counts;
  }, [allProducts, categories]);

  // ---- Derived: categories ordered for the filter list (parents → children) ----
  const orderedCategories = useMemo(
    () => orderCategoriesHierarchically(categories),
    [categories]
  );

  // ---- Filtering + Sorting (client-side) ----
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search
    if (urlSearch) {
      const q = urlSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Categories — products carry a numeric `categoryId`; the selected tokens
    // are canonical slugs (legacy ids still resolve). Each selected category is
    // expanded to its own id PLUS all descendant ids, so selecting a PARENT
    // includes its children's products (parent-includes-children rule): picking
    // "Electronics" returns Laptops/Audio/Smartphones items too, and picking
    // "Women's Ethnic Wear" — which has no products of its own — returns its
    // Sarees/Kurtas items. Picking a leaf category returns just that category.
    if (selectedCategories.length > 0) {
      const wantedIds = new Set();
      selectedCategories.forEach((token) => {
        const cat = resolveCategory(token, categories);
        if (!cat) return;
        getCategoryScopeIds(cat.id, categories).forEach((id) => wantedIds.add(id));
      });
      if (wantedIds.size > 0) {
        result = result.filter((p) => wantedIds.has(String(p.categoryId)));
      }
    }

    // Price range
    const pMin = parseFloat(minPrice);
    const pMax = parseFloat(maxPrice);
    if (!isNaN(pMin) && pMin > 0) {
      result = result.filter((p) => getProductMinPrice(p).sellingPrice >= pMin);
    }
    if (!isNaN(pMax) && pMax > 0) {
      result = result.filter((p) => getProductMinPrice(p).sellingPrice <= pMax);
    }

    // Rating
    if (minRating > 0) {
      result = result.filter((p) => (p.rating || 0) >= minRating);
    }

    // Discount
    if (minDiscount > 0) {
      result = result.filter((p) => getProductMinPrice(p).discount >= minDiscount);
    }

    // In stock
    if (inStockOnly) {
      result = result.filter((p) => (p.stock === undefined ? true : p.stock > 0));
    }

    // Brands
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => getProductMinPrice(a).sellingPrice - getProductMinPrice(b).sellingPrice);
        break;
      case "price-high":
        result.sort((a, b) => getProductMinPrice(b).sellingPrice - getProductMinPrice(a).sellingPrice);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popularity":
        result.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, categories, urlSearch, selectedCategories, minPrice, maxPrice, minRating, minDiscount, inStockOnly, selectedBrands, sortBy]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((safePage - 1) * perPage, safePage * perPage),
    [filteredProducts, safePage, perPage]
  );

  // Keep currentPage within range whenever the result set shrinks (e.g. filters
  // applied, or a deep-linked page that no longer exists). The value guard
  // (currentPage !== safePage) terminates after one correction, so adding
  // syncUrlParams to the deps cannot loop.
  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
      syncUrlParams({ page: safePage });
    }
  }, [safePage, currentPage, syncUrlParams]);

  // Scroll the results back to the top after a pagination/per-page change. Runs
  // post-commit (so the new page's layout is settled and the smooth scroll isn't
  // cancelled by the re-render), and only when a pager action requested it — not
  // on every filter change. Offset clears the fixed header (varies by device).
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    const offsetByDevice = { mobile: 70, tablet: 114, desktop: 150 };
    const offset = offsetByDevice[getDeviceType()] || 0;
    const el = mainRef.current;
    const y = el ? el.getBoundingClientRect().top + window.scrollY - offset : 0;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, [safePage, perPage]);

  // ---- Helpers ----
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    minRating > 0 ||
    minDiscount > 0 ||
    inStockOnly ||
    selectedBrands.length > 0;

  // Whether anything is constraining the result set — includes the search query
  // (set from the header), so the empty state always offers a way out.
  const hasAnyConstraint = hasActiveFilters || Boolean(urlSearch);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setMinDiscount(0);
    setInStockOnly(false);
    setSelectedBrands([]);
    setSortBy("relevance");
    setCurrentPage(1);
    // Pass every reset value as an explicit override so no stale param survives.
    // per_page is intentionally preserved (it's a view preference, not a filter).
    syncUrlParams({
      category: [],
      search: "",
      sort: "relevance",
      min_price: "",
      max_price: "",
      page: 1,
    });
  }, [syncUrlParams]);

  const handleCategoryToggle = useCallback(
    (slug) => {
      setSelectedCategories((prev) => {
        const next = prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug];
        setCurrentPage(1);
        syncUrlParams({ category: next, page: 1 });
        return next;
      });
    },
    [syncUrlParams]
  );

  const handlePriceRangeClick = useCallback(
    (range) => {
      const newMin = String(range.min);
      const newMax = range.max === Infinity ? "" : String(range.max);
      setMinPrice(newMin);
      setMaxPrice(newMax);
      setCurrentPage(1);
      syncUrlParams({ min_price: newMin, max_price: newMax, page: 1 });
    },
    [syncUrlParams]
  );

  const handlePriceApply = useCallback(() => {
    // Sanitize: ignore NaN / non-positive values, and swap only when BOTH bounds
    // are valid finite numbers and inverted. An empty max means "no upper bound"
    // and must not be coerced to 0.
    const lo = parseFloat(minPrice);
    const hi = parseFloat(maxPrice);
    const loValid = !isNaN(lo) && lo > 0;
    const hiValid = !isNaN(hi) && hi > 0;
    let nextMin = loValid ? lo : "";
    let nextMax = hiValid ? hi : "";
    if (loValid && hiValid && lo > hi) {
      nextMin = hi;
      nextMax = lo;
    }
    const minStr = nextMin === "" ? "" : String(nextMin);
    const maxStr = nextMax === "" ? "" : String(nextMax);
    setMinPrice(minStr);
    setMaxPrice(maxStr);
    setCurrentPage(1);
    syncUrlParams({ min_price: minStr, max_price: maxStr, page: 1 });
  }, [minPrice, maxPrice, syncUrlParams]);

  // Clear just the price bounds (used by the active-filter chip). Reuses the same
  // URL params the page already manages.
  const clearPriceFilter = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
    syncUrlParams({ min_price: "", max_price: "", page: 1 });
  }, [syncUrlParams]);

  // Clear the header-driven search query via its URL param (the sync effect then
  // re-derives the listing).
  const clearSearch = useCallback(() => {
    setCurrentPage(1);
    syncUrlParams({ search: "", page: 1 });
  }, [syncUrlParams]);

  const handleSortChange = useCallback(
    (value) => {
      setSortBy(value);
      setCurrentPage(1);
      syncUrlParams({ sort: value, page: 1 });
    },
    [syncUrlParams]
  );

  const handlePageChange = useCallback(
    (page) => {
      const p = Math.max(1, Math.min(page, totalPages));
      pendingScrollRef.current = true; // scroll handled post-commit (see effect)
      setCurrentPage(p);
      syncUrlParams({ page: p });
    },
    [totalPages, syncUrlParams]
  );

  const handlePerPageChange = useCallback(
    (value) => {
      pendingScrollRef.current = true;
      setPerPage(value);
      setCurrentPage(1);
      syncUrlParams({ per_page: value, page: 1 });
    },
    [syncUrlParams]
  );

  const handleAddToCart = useCallback(
    (e, product) => {
      e.stopPropagation();
      // buildCartItem produces the same id scheme the product page uses, so a
      // quick-add merges with a detail-page add instead of creating a duplicate.
      addToCart(buildCartItem(product));
    },
    [addToCart]
  );

  const handleWishlistToggle = useCallback(
    (e, product) => {
      e.stopPropagation();
      toggleWishlist(product);
    },
    [toggleWishlist]
  );

  // Select semantics (value, or 0 to clear). onChange handles keyboard + click;
  // a paired onClick clears when the already-selected radio is re-clicked.
  const handleRatingChange = useCallback(
    (value) => {
      setMinRating(value);
      resetToFirstPage();
    },
    [resetToFirstPage]
  );

  const handleDiscountChange = useCallback(
    (value) => {
      setMinDiscount(value);
      resetToFirstPage();
    },
    [resetToFirstPage]
  );

  const handleInStockToggle = useCallback(() => {
    setInStockOnly((v) => !v);
    resetToFirstPage();
  }, [resetToFirstPage]);

  const handleBrandToggle = useCallback(
    (brand) => {
      setSelectedBrands((prev) =>
        prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
      );
      resetToFirstPage();
    },
    [resetToFirstPage]
  );

  // ---- Category name helper ----
  const getCategoryName = useCallback(
    (slug) => {
      const cat = categories.find(
        (c) => c.slug === slug || String(c.id) === String(slug)
      );
      return cat ? cat.name : slug;
    },
    [categories]
  );

  // ---- Breadcrumb (shared component prepends "Home"; contract is {label, link}) ----
  const breadcrumbItems = useMemo(() => {
    const hasCategory = selectedCategories.length === 1;
    const items = [{ label: "Products", link: hasCategory ? "/products" : undefined }];
    if (hasCategory) {
      items.push({ label: getCategoryName(selectedCategories[0]) });
    }
    return items;
  }, [selectedCategories, getCategoryName]);

  // ---- Active-filter chips — derived from current state; each "remove" updates
  // the very same URL params / setters the page already manages. ----
  const activeFilterChips = useMemo(() => {
    const chips = [];
    selectedCategories.forEach((slug) => {
      chips.push({
        key: `cat-${slug}`,
        label: getCategoryName(slug),
        onRemove: () => handleCategoryToggle(slug),
      });
    });
    if (minPrice !== "" || maxPrice !== "") {
      let label;
      if (minPrice !== "" && maxPrice !== "") label = `${inr(minPrice)} – ${inr(maxPrice)}`;
      else if (minPrice !== "") label = `${inr(minPrice)}+`;
      else label = `Under ${inr(maxPrice)}`;
      chips.push({ key: "price", label, onRemove: clearPriceFilter });
    }
    if (minRating > 0) {
      chips.push({ key: "rating", label: `${minRating}★ & up`, onRemove: () => handleRatingChange(0) });
    }
    if (minDiscount > 0) {
      chips.push({ key: "discount", label: `${minDiscount}% off or more`, onRemove: () => handleDiscountChange(0) });
    }
    if (inStockOnly) {
      chips.push({ key: "stock", label: "In stock", onRemove: handleInStockToggle });
    }
    selectedBrands.forEach((brand) => {
      chips.push({ key: `brand-${brand}`, label: brand, onRemove: () => handleBrandToggle(brand) });
    });
    if (urlSearch) {
      chips.push({ key: "search", label: `“${urlSearch}”`, onRemove: clearSearch });
    }
    return chips;
  }, [
    selectedCategories, minPrice, maxPrice, minRating, minDiscount, inStockOnly,
    selectedBrands, urlSearch, getCategoryName, handleCategoryToggle, clearPriceFilter,
    handleRatingChange, handleDiscountChange, handleInStockToggle, handleBrandToggle, clearSearch,
  ]);

  // ---- Pagination range ----
  const paginationRange = useMemo(() => {
    const range = [];
    const delta = 2;
    const left = Math.max(2, safePage - delta);
    const right = Math.min(totalPages - 1, safePage + delta);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  }, [safePage, totalPages]);

  // ---- Filter groups JSX (reused for the desktop sidebar + the mobile drawer).
  // Collapsible <details> groups with serif summaries; controls are tokenized. --
  const renderFilters = () => (
    <div className={styles.filterGroups}>
      {/* Categories */}
      <details className={styles.group} open>
        <summary className={styles.groupSummary}>
          <span className={styles.groupTitle}>Categories</span>
          <GroupChevron />
        </summary>
        <div className={styles.groupBody}>
          <div className={styles.optionList}>
            {orderedCategories.ordered.map((cat) => (
              <label
                key={cat.id || cat.slug}
                className={styles.option}
                style={orderedCategories.depthOf(cat.id) ? { paddingLeft: orderedCategories.depthOf(cat.id) * 16 } : undefined}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.some(
                    (t) => t === cat.slug || String(t) === String(cat.id)
                  )}
                  onChange={() => handleCategoryToggle(categoryParam(cat))}
                  className={styles.checkbox}
                />
                <span className={styles.optionText}>{cat.name}</span>
                <span className={styles.optionCount}>
                  {categoryCounts.get(String(cat.id)) || 0}
                </span>
              </label>
            ))}
          </div>
        </div>
      </details>

      {/* Price Range */}
      <details className={styles.group} open>
        <summary className={styles.groupSummary}>
          <span className={styles.groupTitle}>Price</span>
          <GroupChevron />
        </summary>
        <div className={styles.groupBody}>
          <div className={styles.priceFields}>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={styles.priceInput}
              aria-label="Minimum price"
            />
            <span className={styles.priceSep}>to</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={styles.priceInput}
              aria-label="Maximum price"
            />
            <button className={styles.priceApply} onClick={handlePriceApply} type="button">
              Go
            </button>
          </div>
          <div className={styles.quickRanges}>
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                className={styles.quickRange}
                onClick={() => handlePriceRangeClick(range)}
                type="button"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </details>

      {/* Rating */}
      <details className={styles.group} open>
        <summary className={styles.groupSummary}>
          <span className={styles.groupTitle}>Customer Rating</span>
          <GroupChevron />
        </summary>
        <div className={styles.groupBody}>
          <div className={styles.optionList}>
            {RATING_OPTIONS.map((r) => (
              <label key={r} className={styles.option}>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === r}
                  onChange={() => handleRatingChange(r)}
                  onClick={() => { if (minRating === r) handleRatingChange(0); }}
                  className={styles.radio}
                />
                <span className={styles.ratingOption}>
                  <StarRating rating={r} size={14} />
                  <span className={styles.ratingText}>{r} & up</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </details>

      {/* Discount */}
      <details className={styles.group} open>
        <summary className={styles.groupSummary}>
          <span className={styles.groupTitle}>Discount</span>
          <GroupChevron />
        </summary>
        <div className={styles.groupBody}>
          <div className={styles.optionList}>
            {DISCOUNT_OPTIONS.map((d) => (
              <label key={d} className={styles.option}>
                <input
                  type="radio"
                  name="discount"
                  checked={minDiscount === d}
                  onChange={() => handleDiscountChange(d)}
                  onClick={() => { if (minDiscount === d) handleDiscountChange(0); }}
                  className={styles.radio}
                />
                <span className={styles.optionText}>{d}% or more</span>
              </label>
            ))}
          </div>
        </div>
      </details>

      {/* Availability */}
      <details className={styles.group} open>
        <summary className={styles.groupSummary}>
          <span className={styles.groupTitle}>Availability</span>
          <GroupChevron />
        </summary>
        <div className={styles.groupBody}>
          <label className={styles.toggleRow}>
            <span className={styles.optionText}>In stock only</span>
            <button
              className={`${styles.toggle} ${inStockOnly ? styles.toggleOn : ""}`}
              onClick={handleInStockToggle}
              type="button"
              role="switch"
              aria-checked={inStockOnly}
            >
              <span className={styles.toggleThumb} />
            </button>
          </label>
        </div>
      </details>

      {/* Brand */}
      {availableBrands.length > 0 && (
        <details className={styles.group} open>
          <summary className={styles.groupSummary}>
            <span className={styles.groupTitle}>Brand</span>
            <GroupChevron />
          </summary>
          <div className={styles.groupBody}>
            <div className={styles.optionList}>
              {availableBrands.map((brand) => (
                <label key={brand} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionText}>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );

  // ---- List-mode row (calm horizontal layout; reuses StarRating + PriceBlock) ----
  const renderListRow = (product) => {
    const priceInfo = getProductMinPrice(product);
    const discount = priceInfo.discount;
    const wishlisted = isInWishlist(product.id);
    const ratingCount = Number(product.totalReviews) || 0;
    const outOfStock = product.stock === 0;

    return (
      <article key={product.id} className={styles.listRow}>
        <Link to={productPath(product)} className={styles.listMedia} aria-label={product.name}>
          <img
            className={styles.listImage}
            src={product.images?.[0] || product.image || PLACEHOLDER_IMG}
            alt={product.name}
            loading="lazy"
            onError={onImageError}
          />
          {discount > 0 && <span className={styles.listBadge}>{discount}% off</span>}
        </Link>

        <div className={styles.listBody}>
          <div className={styles.listInfo}>
            {product.brand && <span className={styles.listBrand}>{product.brand}</span>}
            <h3 className={styles.listName}>
              <Link to={productPath(product)} className={styles.listNameLink}>
                {product.name}
              </Link>
            </h3>
            {ratingCount > 0 && (
              <span className={styles.listRating}>
                <StarRating rating={product.rating || 0} size={14} />
                <span className={styles.listRatingCount}>({ratingCount.toLocaleString()})</span>
              </span>
            )}
            {product.shortDescription && (
              <p className={styles.listDesc}>{truncateText(product.shortDescription, 160)}</p>
            )}
          </div>

          <div className={styles.listAside}>
            <PriceBlock
              price={priceInfo.sellingPrice}
              comparePrice={priceInfo.originalPrice}
              size="md"
              showSavings={false}
            />
            {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
              <span className={styles.listStockLow}>Only {product.stock} left</span>
            )}
            {outOfStock && <span className={styles.listStockOut}>Out of stock</span>}
            <div className={styles.listActions}>
              <button
                type="button"
                className={styles.listAddBtn}
                onClick={(e) => handleAddToCart(e, product)}
                disabled={outOfStock}
              >
                {outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                type="button"
                className={`${styles.listWishBtn} ${wishlisted ? styles.listWishActive : ""}`}
                onClick={(e) => handleWishlistToggle(e, product)}
                aria-pressed={wishlisted}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <HeartIcon filled={wishlisted} />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  // ---- Results region (skeleton / error / grid|list / empty) ----
  const renderResults = () => {
    if (loading) {
      return viewMode === "grid" ? (
        <div className={styles.grid}>
          {Array.from({ length: Math.min(perPage, 12) }).map((_, i) => (
            <GridCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className={styles.listView}>
          {Array.from({ length: Math.min(perPage, 6) }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (fetchError) {
      // Fetch failed — never masquerade as "No products found".
      return (
        <Reveal className={styles.stateBox}>
          <div className={styles.errorIcon}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className={styles.stateTitle}>Couldn't load products</h3>
          <p className={styles.stateText}>
            Something went wrong while fetching the catalogue. Please check your
            connection and try again.
          </p>
          <button className={styles.stateBtn} onClick={fetchCatalog} type="button">
            Try Again
          </button>
        </Reveal>
      );
    }

    if (paginatedProducts.length > 0) {
      return viewMode === "grid" ? (
        <div className={styles.grid}>
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              isWishlisted={isInWishlist(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.listView}>
          {paginatedProducts.map((product) => renderListRow(product))}
        </div>
      );
    }

    return (
      <Reveal className={styles.stateBox}>
        <EmptyIllustration />
        <h3 className={styles.stateTitle}>No products match</h3>
        <p className={styles.stateText}>
          {urlSearch ? (
            <>
              We could not find anything for{" "}
              <strong>&ldquo;{urlSearch}&rdquo;</strong>. Try a different search
              or adjust your filters.
            </>
          ) : (
            "We could not find any products matching your criteria. Try adjusting your filters."
          )}
        </p>
        {hasAnyConstraint && (
          <button className={styles.stateBtn} onClick={clearAllFilters} type="button">
            Clear all filters
          </button>
        )}
      </Reveal>
    );
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.crumbWrap}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <h1 id="products-heading" className="sf-sr-only">
        {selectedCategories.length === 1
          ? getCategoryName(selectedCategories[0])
          : "All products"}
      </h1>

      <div className={styles.layout}>
        {/* ===== Desktop filter sidebar ===== */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Filters</h2>
            {hasActiveFilters && (
              <button className={styles.clearLink} onClick={clearAllFilters} type="button">
                Clear all
              </button>
            )}
          </div>
          {renderFilters()}
        </aside>

        {/* ===== Main content ===== */}
        <section className={styles.main} ref={mainRef} aria-labelledby="products-heading">
          {/* Sort + view bar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              {/* Mobile filter trigger */}
              <button
                className={styles.mobileFilterBtn}
                onClick={() => setMobileFiltersOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={mobileFiltersOpen}
                type="button"
              >
                <FilterIcon />
                <span>Filters</span>
                {hasActiveFilters && <span className={styles.filterBadge} />}
              </button>

              <span className={styles.resultsCount}>
                {loading ? (
                  "Loading…"
                ) : fetchError ? (
                  "Couldn't load products"
                ) : filteredProducts.length === 0 ? (
                  "No products"
                ) : filteredProducts.length > perPage ? (
                  <>
                    <strong>
                      {(safePage - 1) * perPage + 1}&ndash;
                      {Math.min(safePage * perPage, filteredProducts.length)}
                    </strong>{" "}
                    of <strong>{filteredProducts.length}</strong>
                  </>
                ) : (
                  <>
                    <strong>{filteredProducts.length}</strong>{" "}
                    {filteredProducts.length === 1 ? "product" : "products"}
                  </>
                )}
              </span>
            </div>

            <div className={styles.toolbarRight}>
              <label className={styles.sortField}>
                <span className={styles.sortLabel}>Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className={styles.sortSelect}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.viewToggle} role="group" aria-label="View mode">
                <button
                  className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  type="button"
                >
                  <GridIcon />
                </button>
                <button
                  className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  type="button"
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Active-filter chips (removable) */}
          {activeFilterChips.length > 0 && (
            <div className={styles.chipsRow}>
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className={styles.chip}
                  onClick={chip.onRemove}
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  <span className={styles.chipText}>{chip.label}</span>
                  <span className={styles.chipX} aria-hidden="true">&times;</span>
                </button>
              ))}
              <button
                type="button"
                className={styles.chipsClear}
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results */}
          {renderResults()}

          {/* Pagination */}
          {!loading && !fetchError && filteredProducts.length > perPage && (
            <div className={styles.pagination}>
              <label className={styles.perPageLabel}>
                <span>Per page</span>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className={styles.perPageSelect}
                >
                  {PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>

              <div className={styles.pager}>
                <button
                  className={styles.pageBtn}
                  disabled={safePage <= 1}
                  onClick={() => handlePageChange(safePage - 1)}
                  aria-label="Previous page"
                  type="button"
                >
                  <ChevronLeft />
                  <span className={styles.pageBtnText}>Prev</span>
                </button>

                {paginationRange.map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={item}
                      className={`${styles.pageBtn} ${safePage === item ? styles.pageBtnActive : ""}`}
                      onClick={() => handlePageChange(item)}
                      aria-current={safePage === item ? "page" : undefined}
                      type="button"
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  className={styles.pageBtn}
                  disabled={safePage >= totalPages}
                  onClick={() => handlePageChange(safePage + 1)}
                  aria-label="Next page"
                  type="button"
                >
                  <span className={styles.pageBtnText}>Next</span>
                  <ChevronRight />
                </button>
              </div>

              <span className={styles.pageStatus}>
                Page {safePage} of {totalPages}
              </span>
            </div>
          )}
        </section>
      </div>

      {/* ===== Mobile filter sheet (tokenized BottomDrawer) ===== */}
      <BottomDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filters"
      >
        {renderFilters()}
        <div className={styles.drawerActions}>
          <button
            className={styles.drawerClear}
            onClick={clearAllFilters}
            disabled={!hasAnyConstraint}
            type="button"
          >
            Clear all
          </button>
          <button
            className={styles.drawerApply}
            onClick={() => setMobileFiltersOpen(false)}
            type="button"
          >
            Show {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "result" : "results"}
          </button>
        </div>
      </BottomDrawer>
    </div>
  );
};

export default Products;
