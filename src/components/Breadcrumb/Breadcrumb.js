import React from "react";
import { Link } from "react-router-dom";
import styles from "./Breadcrumb.module.css";

// Dark mode is handled by the --sf-* tokens (they flip under body.dark), so the
// breadcrumb no longer needs to read the theme in JS. The `items` prop contract
// is unchanged: [{ label, link? }].
const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <Link to="/" className={styles.link}>Home</Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className={styles.separator} aria-hidden="true">/</span>
          {item.link ? (
            <Link to={item.link} className={styles.link}>{item.label}</Link>
          ) : (
            <span className={styles.current} aria-current="page">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
