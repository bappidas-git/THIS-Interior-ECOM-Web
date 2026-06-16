import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { FAQ_ITEMS, SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_HOURS } from "../../utils/constants";
import styles from "./HelpCenter.module.css";

const HelpCenter = () => {
  const reduce = useReducedMotion();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
        };

  const helpTopics = [
    { icon: "mdi:truck-outline", title: "Orders & Shipping", desc: "Track orders, delivery times, shipping info", link: "/orders" },
    { icon: "mdi:backup-restore", title: "Returns & Refunds", desc: "Return policy, refund process, exchanges", link: "/refund" },
    { icon: "mdi:credit-card-outline", title: "Payments", desc: "Payment methods, billing, invoices", link: "/support" },
    { icon: "mdi:account-outline", title: "Account & Settings", desc: "Profile, password, login issues", link: "/profile" },
    { icon: "mdi:gift-outline", title: "Deals & Offers", desc: "Coupons, special offers, rewards", link: "/special-offers" },
    { icon: "mdi:shield-lock-outline", title: "Privacy & Security", desc: "Data protection, account security", link: "/privacy" },
  ];

  const filteredFaqs = searchQuery
    ? FAQ_ITEMS.filter(
        (f) =>
          f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FAQ_ITEMS;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.crumb}>
          <Breadcrumb items={[{ label: "Help Center" }]} />
        </div>

        <motion.header
          className={styles.header}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.eyebrow}>How can we help?</p>
          <h1 className={styles.title}>Help Center</h1>
          <p className={styles.lede}>
            Find answers to common questions, or reach out to our team — we're
            always glad to help.
          </p>
          <div className={styles.searchBox}>
            <Icon icon="mdi:magnify" className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search for help…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search help articles"
            />
          </div>
        </motion.header>

        <motion.section className={styles.topics} {...rise()}>
          <h2 className={styles.sectionTitle}>Browse help topics</h2>
          <div className={styles.topicGrid}>
            {helpTopics.map((topic, i) => (
              <Link to={topic.link} key={i} className={styles.topicCard}>
                <span className={styles.topicIcon} aria-hidden="true">
                  <Icon icon={topic.icon} />
                </span>
                <span className={styles.topicText}>
                  <span className={styles.topicTitle}>{topic.title}</span>
                  <span className={styles.topicDesc}>{topic.desc}</span>
                </span>
                <Icon icon="mdi:arrow-right" className={styles.topicArrow} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section className={styles.faqSection} {...rise()}>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          <div className={styles.faqList}>
            {filteredFaqs.length === 0 ? (
              <p className={styles.noResults}>
                No answers match “{searchQuery}”. <Link to="/support">Contact us</Link> and we'll help directly.
              </p>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} className={`${styles.faqItem} ${isOpen ? styles.open : ""}`}>
                    <button
                      className={styles.faqQuestion}
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`help-faq-answer-${faq.id}`}
                      id={`help-faq-question-${faq.id}`}
                    >
                      <span>{faq.question}</span>
                      <span className={styles.faqToggle} aria-hidden="true" />
                    </button>
                    <div
                      className={styles.faqAnswer}
                      id={`help-faq-answer-${faq.id}`}
                      role="region"
                      aria-labelledby={`help-faq-question-${faq.id}`}
                      aria-hidden={!isOpen}
                    >
                      <div className={styles.faqAnswerInner}><p>{faq.answer}</p></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.section>
      </div>

      <motion.section className={styles.contact} {...rise()}>
        <div className={styles.contactInner}>
          <p className={styles.contactEyebrow}>Still need help?</p>
          <h2 className={styles.contactTitle}>We're here for you</h2>
          <p className={styles.contactHours}>{SUPPORT_HOURS}</p>
          <div className={styles.contactMeta}>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <span aria-hidden="true">·</span>
            <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}>{SUPPORT_PHONE}</a>
          </div>
          <div className={styles.contactActions}>
            <Link to="/support" className={styles.contactPrimary}>Contact support</Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className={styles.contactSecondary}>Email us</a>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HelpCenter;
