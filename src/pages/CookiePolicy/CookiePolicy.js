import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { APP_NAME, SUPPORT_EMAIL, POLICY_LAST_UPDATED } from "../../utils/constants";
import { revealProps, enterProps } from "../../components/motion";
import styles from "./CookiePolicy.module.css";

const CookiePolicy = () => {
  const reduce = useReducedMotion();
  const rise = (delay = 0) => revealProps(reduce, delay);

  const cookieTypes = [
    { type: "Essential", purpose: "Required for basic site functionality (cart, login, security)", duration: "Session / 1 year", required: true },
    { type: "Functional", purpose: "Remember your preferences (language, theme, region)", duration: "1 year", required: false },
    { type: "Analytics", purpose: "Help us understand how visitors interact with our site", duration: "2 years", required: false },
    { type: "Marketing", purpose: "Used for targeted advertising and retargeting", duration: "90 days", required: false },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.crumb}>
          <Breadcrumb items={[{ label: "Cookie Policy" }]} />
        </div>

        <motion.header className={styles.head} {...enterProps(reduce)}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.title}>Cookie Policy</h1>
          <p className={styles.updated}>
            <Icon icon="mdi:calendar-blank-outline" aria-hidden="true" />
            Last updated {POLICY_LAST_UPDATED}
          </p>
          <p className={styles.intro}>
            {APP_NAME} uses cookies and similar technologies to improve your
            browsing experience, analyze site traffic, and personalize content.
          </p>
        </motion.header>

        <div className={styles.sections}>
          <motion.section id="section-1" className={styles.section} {...rise()}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum} aria-hidden="true">01</span>
              <h2 className={styles.sectionTitle}>What are cookies?</h2>
            </div>
            <p className={styles.sectionBody}>
              Cookies are small text files stored on your device when you visit a
              website. They help the site remember your preferences and improve
              your experience.
            </p>
          </motion.section>

          <motion.section id="section-2" className={styles.section} {...rise()}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum} aria-hidden="true">02</span>
              <h2 className={styles.sectionTitle}>Types of cookies we use</h2>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Type</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieTypes.map((cookie, i) => (
                    <tr key={i}>
                      <td data-label="Type"><span className={styles.cookieType}>{cookie.type}</span></td>
                      <td data-label="Purpose">{cookie.purpose}</td>
                      <td data-label="Duration">{cookie.duration}</td>
                      <td data-label="Status">
                        {cookie.required ? (
                          <span className={styles.required}>
                            <Icon icon="mdi:check" aria-hidden="true" /> Required
                          </span>
                        ) : (
                          <span className={styles.optional}>Optional</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          <motion.section id="section-3" className={styles.section} {...rise()}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNum} aria-hidden="true">03</span>
              <h2 className={styles.sectionTitle}>Managing cookies</h2>
            </div>
            <p className={styles.sectionBody}>
              You can control cookies through your browser settings. Most browsers
              allow you to block or delete cookies. Note that disabling essential
              cookies may affect site functionality.
            </p>
          </motion.section>
        </div>

        <div className={styles.contact}>
          <p>
            Questions about cookies? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
