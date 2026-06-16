import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import ProductCard from "./ProductCard";
import { revealProps } from "../motion";
import styles from "./RelatedProducts.module.css";

// =============================================================================
// RelatedProducts — data-driven AOV carousel ("You may also like" / "Similar")
// =============================================================================
// A horizontally scrollable row of real products. It is purely data-driven: if
// the caller has no real related products to pass, the whole section renders
// nothing (no filler, no fabricated "recommended" items). Helpful, not pushy.
//
// Props:
//   title            string
//   products         array   real products to recommend
//   onAddToCart      fn
//   onToggleWishlist fn
//   isInWishlist     fn (productId) => boolean
// =============================================================================
const RelatedProducts = ({
  title = "You may also like",
  products = [],
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const items = Array.isArray(products) ? products : [];
  if (items.length === 0) return null;

  return (
    <motion.section
      className={styles.section}
      aria-label={title}
      {...revealProps(prefersReducedMotion)}
    >
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.scroller}>
        {items.map((p) => (
          <div className={styles.cell} key={p.id}>
            <ProductCard
              product={p}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={isInWishlist ? isInWishlist(p.id) : false}
            />
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default RelatedProducts;
