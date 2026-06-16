import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { SUPPORT_EMAIL, POLICY_LAST_UPDATED } from "../../utils/constants";
import { revealProps, enterProps } from "../../components/motion";
import styles from "./RefundPolicy.module.css";

const RefundPolicy = () => {
  const reduce = useReducedMotion();
  const rise = (delay = 0) => revealProps(reduce, delay);

  const eligibleItems = [
    "Products received damaged or defective",
    "Wrong product delivered",
    "Product significantly different from description",
    "Missing items from the order",
  ];

  const nonEligibleItems = [
    "Products used, altered, or with removed tags",
    "Intimate wear, swimwear, and personal care items",
    "Customized or personalized products",
    "Products returned after the 7-day window",
    "Digital products and gift cards",
  ];

  const steps = [
    { step: "1", title: "Initiate return", desc: "Go to My Orders, select the order, and click 'Return / Exchange' within 7 days of delivery." },
    { step: "2", title: "Pack & ship", desc: "Pack the product in its original packaging. Our pickup partner will collect it from your address." },
    { step: "3", title: "Quality check", desc: "Once we receive the product, our team will inspect it within 2 business days." },
    { step: "4", title: "Refund processed", desc: "Refund is initiated to your original payment method within 5–7 business days after approval." },
  ];

  const timeline = [
    { method: "Credit / Debit Card", time: "5–7 business days" },
    { method: "UPI", time: "3–5 business days" },
    { method: "Net Banking", time: "5–7 business days" },
    { method: "Wallet", time: "1–2 business days" },
    { method: "Cash on Delivery", time: "7–10 business days (bank transfer)" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.crumb}>
          <Breadcrumb items={[{ label: "Refund Policy" }]} />
        </div>

        <motion.header className={styles.head} {...enterProps(reduce)}>
          <p className={styles.eyebrow}>Returns</p>
          <h1 className={styles.title}>Returns &amp; Refunds</h1>
          <p className={styles.updated}>
            <Icon icon="mdi:calendar-blank-outline" aria-hidden="true" />
            Last updated {POLICY_LAST_UPDATED}
          </p>
          <div className={styles.highlight}>
            We offer a <strong>7-day hassle-free return policy</strong> on most
            pieces. Your satisfaction is at the heart of everything we do.
          </div>
        </motion.header>

        <div className={styles.sections}>
          <motion.section id="section-1" className={styles.section} {...rise()}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum} aria-hidden="true">01</span>
              <h2 className={styles.sectionTitle}>How returns work</h2>
            </div>
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li key={i} className={styles.stepCard}>
                  <span className={styles.stepNumber} aria-hidden="true">{s.step}</span>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </li>
              ))}
            </ol>
          </motion.section>

          <motion.section id="section-2" className={styles.section} {...rise()}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum} aria-hidden="true">02</span>
              <h2 className={styles.sectionTitle}>What's eligible</h2>
            </div>
            <div className={styles.twoCol}>
              <div className={styles.eligList}>
                <h3 className={styles.eligTitle}>Eligible for return</h3>
                <ul>
                  {eligibleItems.map((item, i) => (
                    <li key={i}>
                      <Icon icon="mdi:check-circle-outline" className={styles.checkIcon} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.eligList}>
                <h3 className={styles.eligTitle}>Not eligible</h3>
                <ul>
                  {nonEligibleItems.map((item, i) => (
                    <li key={i}>
                      <Icon icon="mdi:close-circle-outline" className={styles.crossIcon} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          <motion.section id="section-3" className={styles.section} {...rise()}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum} aria-hidden="true">03</span>
              <h2 className={styles.sectionTitle}>Refund timeline</h2>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Payment method</th>
                    <th scope="col">Time to refund</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((row, i) => (
                    <tr key={i}>
                      <td data-label="Payment method"><span className={styles.method}>{row.method}</span></td>
                      <td data-label="Time to refund">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>

        <div className={styles.contact}>
          <p>
            Need help with a return? <Link to="/support">Contact support</Link> or
            email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
