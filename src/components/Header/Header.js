import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../context/WishlistContext";
import { useDealsConfig } from "../../context/DealsConfigContext";
import apiService from "../../services/api";
import { categoryParam, getMainMenuCategories } from "../../utils/categories";
import { SUPPORT_PHONE, FREE_SHIPPING_THRESHOLD } from "../../utils/constants";
import { formatCurrency, onImageError } from "../../utils/helpers";
import { LOGO_LIGHT, LOGO_WHITE, BRAND } from "../../theme/brand";
import CartDrawer from "../CartDrawer/CartDrawer";
import SidebarMenu from "../SidebarMenu/SidebarMenu";
import AuthModal from "../AuthModal/AuthModal";
import SearchModal from "../SearchModal/SearchModal";
import {
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  PersonOutline,
  FavoriteBorder,
  Search as SearchIcon,
  ShoppingBagOutlined,
  CallOutlined,
  LocalShippingOutlined,
  KeyboardArrowDown,
  Person,
  ListAlt,
  Favorite,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd,
  LocalOfferOutlined,
  DarkModeOutlined,
  LightModeOutlined,
} from "@mui/icons-material";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    user,
    isAuthenticated,
    logout,
    authModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
  } = useAuth();
  const { getCartItemCount, isCartOpen, setIsCartOpen } = useCart();
  const { getWishlistCount } = useWishlist();
  // "Today's Deals" is hidden when the admin turns the deals page off.
  const { enabled: dealsEnabled } = useDealsConfig();
  const isMobile = useMediaQuery("(max-width:768px)");
  const reduceMotion = useReducedMotion();

  // Live badge counts (context exposes getters, not raw values).
  const cartCount = getCartItemCount();
  const wishlistCount = getWishlistCount();

  const [categories, setCategories] = useState([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  // Which top-level collection's mega-menu flyout is open (null = none).
  const [activeMenuId, setActiveMenuId] = useState(null);
  // Calm condense-on-scroll: drop the utility strip + tighten once the page moves.
  const [scrolled, setScrolled] = useState(false);
  // The header is fixed, so a spacer holds its place; we measure the real height
  // (across breakpoints + the condense change) instead of guessing pixels.
  const [headerHeight, setHeaderHeight] = useState(0);

  const headerRef = useRef(null);
  const closeTimer = useRef(null);
  const triggerRefs = useRef({});

  // Fetch categories on mount, and refetch when the tab regains focus so any
  // change the admin makes (toggling a category into the main menu, reordering,
  // activating/deactivating) shows up on the storefront without a hard reload —
  // the menu is fully API-driven from the same categories source the admin edits.
  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        const data = await apiService.categories.getAll();
        if (active) setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
    const onFocus = () => fetchCategories();
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Close the flyout + account menu on every route change.
  useEffect(() => {
    setActiveMenuId(null);
    setUserMenuAnchor(null);
  }, [location.pathname, location.search]);

  // Keep the spacer exactly the fixed header's height (no magic numbers).
  // useLayoutEffect so the measurement lands before paint — no content jump.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;
    const measure = () => setHeaderHeight(el.offsetHeight);
    measure();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isMobile]);

  // rAF-throttled scroll flag for the condense behaviour (no bounce).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Esc closes the open flyout and returns focus to its trigger.
  useEffect(() => {
    if (!activeMenuId) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        const id = activeMenuId;
        setActiveMenuId(null);
        triggerRefs.current[id]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeMenuId]);

  // Pointer-down outside the header closes the flyout (covers touch + click).
  useEffect(() => {
    if (!activeMenuId) return undefined;
    const onPointer = (e) => {
      if (!headerRef.current?.contains(e.target)) setActiveMenuId(null);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [activeMenuId]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // ---- Account menu / actions (wiring unchanged) ----------------------------
  const handleUserMenuOpen = (e) => {
    if (isAuthenticated) setUserMenuAnchor(e.currentTarget);
    else openAuthModal("login");
  };
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleMenuNavigate = (path) => {
    handleUserMenuClose();
    navigate(path);
  };
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate("/");
  };
  const handleCartClick = () => setIsCartOpen(true);
  const handleSearchClick = () => setSearchModalOpen(true);
  const handleMobileMenuClick = () => setSidebarOpen(true);

  // ---- Flyout open/close (hover intent + keyboard) --------------------------
  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);
  const openFlyout = useCallback(
    (id) => {
      cancelClose();
      setActiveMenuId(id);
    },
    [cancelClose]
  );
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setActiveMenuId(null), 120);
  }, [cancelClose]);
  const toggleFlyout = useCallback((id) => {
    cancelClose();
    setActiveMenuId((prev) => (String(prev) === String(id) ? null : id));
  }, [cancelClose]);
  // Close when keyboard focus leaves the whole nav subtree.
  const handleNavBlur = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setActiveMenuId(null);
  }, []);

  // ---- Category model -------------------------------------------------------
  // Top-level menu items = the admin-curated set (active + showInMainMenu,
  // ordered by menuOrder) via getMainMenuCategories. Flyout links come from a
  // children lookup over the SAME live tree (active children, by sortOrder) — we
  // reuse the canonical helpers and never hand-roll a parallel category tree.
  const menuCategories = useMemo(
    () => (isMobile ? [] : getMainMenuCategories(categories)),
    [isMobile, categories]
  );

  const childrenByParent = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => {
      if (c.parentId == null || c.isActive === false) return;
      const key = String(c.parentId);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    map.forEach((list) =>
      list.sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          String(a.name).localeCompare(String(b.name))
      )
    );
    return map;
  }, [categories]);

  const childrenOf = useCallback(
    (id) => childrenByParent.get(String(id)) || [],
    [childrenByParent]
  );

  // Group a collection's descendants into flyout sections:
  //   • a child that has its own children → a section heading + those links
  //   • leaf children → collected under one section headed by the collection
  // Returns [] when a collection has no descendants (rendered as a plain link).
  const buildSections = useCallback(
    (parent) => {
      const kids = childrenOf(parent.id);
      const sections = [];
      const loose = [];
      kids.forEach((kid) => {
        const grandkids = childrenOf(kid.id);
        if (grandkids.length) {
          sections.push({ key: String(kid.id), heading: kid, links: grandkids });
        } else {
          loose.push(kid);
        }
      });
      if (loose.length) {
        sections.unshift({ key: `g-${parent.id}`, heading: parent, links: loose });
      }
      return sections;
    },
    [childrenOf]
  );

  const sectionsById = useMemo(() => {
    const map = {};
    menuCategories.forEach((c) => {
      map[c.id] = buildSections(c);
    });
    return map;
  }, [menuCategories, buildSections]);

  // Canonical, slug-based category URL — the same scheme the Products page reads.
  const hrefFor = (cat) => `/products?category=${categoryParam(cat)}`;

  // Soft, slow fade/slide for the flyout; collapses to a plain fade when the
  // user prefers reduced motion.
  const flyoutMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 4 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
      };

  // The structured flyout for one collection: grouped section columns (serif
  // headings + sans links) plus a reserved editorial feature panel. Rendered
  // inside its own <li> so keyboard Tab flows trigger → links → next item; it
  // still spans the full nav width because it anchors to the relative navInner.
  const renderMega = (cat, sections) => (
    <motion.div
      key={cat.id}
      id={`mega-${cat.id}`}
      role="region"
      aria-label={`${cat.name} collection`}
      className={styles.mega}
      onMouseEnter={cancelClose}
      {...flyoutMotion}
    >
      <div className={styles.megaColumns}>
        <Link to={hrefFor(cat)} className={styles.megaShopAll} onClick={() => setActiveMenuId(null)}>
          Shop all {cat.name}
        </Link>
        <div className={styles.megaGrid}>
          {sections.map((section) => (
            <div key={section.key} className={styles.megaCol}>
              <Link
                to={hrefFor(section.heading)}
                className={styles.megaHeading}
                onClick={() => setActiveMenuId(null)}
              >
                {section.heading.name}
              </Link>
              <ul className={styles.megaLinks}>
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      to={hrefFor(link)}
                      className={styles.megaLink}
                      onClick={() => setActiveMenuId(null)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial feature panel — image + short caption + CTA. Imagery is
          admin-managed (with a graceful fallback); real curated art can be
          seeded later. No fabricated "bestseller" claims. */}
      <Link to={hrefFor(cat)} className={styles.megaFeature} onClick={() => setActiveMenuId(null)}>
        <span className={styles.megaFeatureMedia}>
          {cat.image && (
            <img
              src={cat.image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className={styles.megaFeatureImg}
              onError={onImageError}
            />
          )}
        </span>
        <span className={styles.megaFeatureBody}>
          <span className={styles.megaFeatureEyebrow}>The Edit</span>
          <span className={styles.megaFeatureTitle}>{cat.name}</span>
          <span className={styles.megaFeatureCaption}>
            {cat.description || `A considered edit of our ${cat.name.toLowerCase()}.`}
          </span>
          <span className={styles.megaFeatureCta}>Shop the edit →</span>
        </span>
      </Link>
    </motion.div>
  );

  return (
    <>
      <header
        ref={headerRef}
        className={styles.header}
        data-scrolled={scrolled ? "true" : "false"}
      >
        {/* ===== UTILITY STRIP (understated; hidden on mobile, collapses on scroll) ===== */}
        {!isMobile && (
          <div className={styles.utilityBar}>
            <div className={styles.utilityInner}>
              <p className={styles.utilityNote}>
                <LocalShippingOutlined className={styles.utilityIcon} aria-hidden="true" />
                <span>
                  Complimentary delivery on orders over{" "}
                  {formatCurrency(FREE_SHIPPING_THRESHOLD)}
                </span>
              </p>
              <div className={styles.utilityActions}>
                <a href={`tel:${SUPPORT_PHONE}`} className={styles.utilityLink}>
                  <CallOutlined className={styles.utilityIcon} aria-hidden="true" />
                  <span>{SUPPORT_PHONE}</span>
                </a>
                <span className={styles.utilityDivider} aria-hidden="true" />
                <Link to="/support" className={styles.utilityLink}>
                  Help
                </Link>
                <span className={styles.utilityDivider} aria-hidden="true" />
                <Link to="/orders" className={styles.utilityLink}>
                  Track Order
                </Link>
                <span className={styles.utilityDivider} aria-hidden="true" />
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={styles.utilityToggle}
                  aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? <LightModeOutlined /> : <DarkModeOutlined />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MAIN ROW (centred logo with quiet affordances either side) ===== */}
        <div className={styles.mainRow}>
          <div className={styles.mainInner}>
            <div className={styles.clusterLeft}>
              {isMobile ? (
                <IconButton
                  onClick={handleMobileMenuClick}
                  className={styles.iconBtn}
                  aria-label="Open menu"
                >
                  <MenuIcon />
                </IconButton>
              ) : (
                <button type="button" className={styles.searchTrigger} onClick={handleSearchClick}>
                  <SearchIcon className={styles.searchTriggerIcon} />
                  <span className={styles.searchTriggerLabel}>Search</span>
                </button>
              )}
            </div>

            <div className={styles.clusterCenter}>
              <Link to="/" className={styles.logoLink} aria-label={`${BRAND.name} — home`}>
                <img
                  src={isDarkMode ? LOGO_WHITE : LOGO_LIGHT}
                  alt={BRAND.name}
                  className={styles.logoImg}
                  width="300"
                  height="148"
                  onError={onImageError}
                />
              </Link>
            </div>

            <div className={styles.clusterRight}>
              {isMobile && (
                <IconButton
                  onClick={handleSearchClick}
                  className={styles.iconBtn}
                  aria-label="Search"
                >
                  <SearchIcon />
                </IconButton>
              )}

              <IconButton
                onClick={handleUserMenuOpen}
                className={styles.iconBtn}
                aria-label="Account"
              >
                {isAuthenticated && user ? (
                  <Avatar className={styles.avatar} sx={{ width: 30, height: 30 }}>
                    {(user.firstName || user.name || "U").charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <PersonOutline />
                )}
              </IconButton>

              {!isMobile && (
                <IconButton
                  onClick={() => navigate("/wishlist")}
                  className={styles.iconBtn}
                  aria-label="Wishlist"
                >
                  <Badge
                    badgeContent={wishlistCount}
                    max={99}
                    classes={{ badge: styles.countBadge }}
                  >
                    <FavoriteBorder />
                  </Badge>
                </IconButton>
              )}

              <IconButton onClick={handleCartClick} className={styles.iconBtn} aria-label="Cart">
                <Badge
                  badgeContent={cartCount}
                  max={99}
                  classes={{ badge: styles.countBadge }}
                >
                  <ShoppingBagOutlined />
                </Badge>
              </IconButton>
            </div>
          </div>
        </div>

        {/* ===== NAV ROW (centred collections + mega-menu) — desktop/tablet ===== */}
        {!isMobile && (
          <nav
            className={styles.navRow}
            aria-label="Collections"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onBlur={handleNavBlur}
          >
            <div className={styles.navInner}>
              <ul className={styles.navList}>
                <li className={styles.navItem}>
                  <Link
                    to="/products"
                    className={styles.navLink}
                    onFocus={() => setActiveMenuId(null)}
                  >
                    Shop All
                  </Link>
                </li>

                {menuCategories.map((cat) => {
                  const sections = sectionsById[cat.id] || [];
                  const hasFlyout = sections.length > 0;
                  const isOpen = String(activeMenuId) === String(cat.id);

                  if (!hasFlyout) {
                    return (
                      <li key={cat.id} className={styles.navItem}>
                        <Link
                          to={hrefFor(cat)}
                          className={styles.navLink}
                          onFocus={() => setActiveMenuId(null)}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={cat.id}
                      className={styles.navItem}
                      onMouseEnter={() => openFlyout(cat.id)}
                    >
                      <button
                        type="button"
                        ref={(el) => {
                          triggerRefs.current[cat.id] = el;
                        }}
                        className={`${styles.navLink} ${styles.navTrigger} ${
                          isOpen ? styles.navTriggerOpen : ""
                        }`}
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        aria-controls={`mega-${cat.id}`}
                        onFocus={() => openFlyout(cat.id)}
                        onClick={() => toggleFlyout(cat.id)}
                      >
                        {cat.name}
                        <KeyboardArrowDown className={styles.navChevron} aria-hidden="true" />
                      </button>
                      <AnimatePresence>{isOpen && renderMega(cat, sections)}</AnimatePresence>
                    </li>
                  );
                })}

                {dealsEnabled && (
                  <li className={styles.navItem}>
                    <Link
                      to="/special-offers"
                      className={`${styles.navLink} ${styles.dealsLink}`}
                      onFocus={() => setActiveMenuId(null)}
                    >
                      <LocalOfferOutlined className={styles.dealsIcon} aria-hidden="true" />
                      Today's Deals
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        )}
      </header>

      {/* Spacer matches the fixed header's measured height. */}
      <div className={styles.headerSpacer} style={{ height: headerHeight }} aria-hidden="true" />

      {/* ===== ACCOUNT DROPDOWN (behaviour unchanged) ===== */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        className={styles.userMenu}
        PaperProps={{ className: styles.userMenuPaper, elevation: 0 }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {isAuthenticated
          ? [
              <div key="greeting" className={styles.menuGreeting}>
                <Avatar className={styles.menuAvatar} sx={{ width: 40, height: 40 }}>
                  {(user?.firstName || user?.name || "U").charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Typography variant="subtitle2" className={styles.menuUserName}>
                    {user?.firstName || user?.name || "User"}
                  </Typography>
                  <Typography variant="caption" className={styles.menuUserEmail}>
                    {user?.email || ""}
                  </Typography>
                </div>
              </div>,
              <Divider key="div1" className={styles.menuDivider} />,
              <MenuItem key="profile" onClick={() => handleMenuNavigate("/profile")} className={styles.menuItem}>
                <Person fontSize="small" className={styles.menuItemIcon} />
                My Profile
              </MenuItem>,
              <MenuItem key="orders" onClick={() => handleMenuNavigate("/orders")} className={styles.menuItem}>
                <ListAlt fontSize="small" className={styles.menuItemIcon} />
                My Orders
              </MenuItem>,
              <MenuItem key="wishlist" onClick={() => handleMenuNavigate("/wishlist")} className={styles.menuItem}>
                <Favorite fontSize="small" className={styles.menuItemIcon} />
                My Wishlist
              </MenuItem>,
              <Divider key="div2" className={styles.menuDivider} />,
              <MenuItem key="logout" onClick={handleLogout} className={`${styles.menuItem} ${styles.logoutItem}`}>
                <LogoutIcon fontSize="small" className={styles.menuItemIcon} />
                Logout
              </MenuItem>,
            ]
          : [
              <MenuItem
                key="login"
                onClick={() => {
                  handleUserMenuClose();
                  openAuthModal("login");
                }}
                className={styles.menuItem}
              >
                <LoginIcon fontSize="small" className={styles.menuItemIcon} />
                Login
              </MenuItem>,
              <MenuItem
                key="register"
                onClick={() => {
                  handleUserMenuClose();
                  openAuthModal("signup");
                }}
                className={styles.menuItem}
              >
                <PersonAdd fontSize="small" className={styles.menuItemIcon} />
                Register
              </MenuItem>,
            ]}
      </Menu>

      {/* ===== MODALS & DRAWERS — open/close wiring preserved ===== */}
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SidebarMenu
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAuth={() => openAuthModal("login")}
      />
      <AuthModal open={authModalOpen} onClose={closeAuthModal} defaultTab={authModalTab} />
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
};

export default Header;
