import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { APP_NAME, SUPPORT_EMAIL, POLICY_LAST_UPDATED } from "../../utils/constants";
import { revealProps, enterProps } from "../../components/motion";
import styles from "./PrivacyPolicy.module.css";

const PrivacyPolicy = () => {
  const reduce = useReducedMotion();
  const rise = (delay = 0) => revealProps(reduce, delay);

  const sections = [
    { title: "Information We Collect", content: `When you use ${APP_NAME}, we may collect personal information such as your name, email address, phone number, shipping address, and payment details. We also collect browsing data, device information, and cookies to improve your shopping experience.` },
    { title: "How We Use Your Information", content: "We use your information to process orders, provide customer support, send order updates, personalize your experience, improve our services, and comply with legal obligations. We may also use your data for marketing with your consent." },
    { title: "Data Sharing", content: "We share your data with payment processors, shipping partners, and service providers necessary to fulfill your orders. We do not sell your personal information to third parties. Data may be shared with law enforcement if legally required." },
    { title: "Data Security", content: "We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits. Your payment information is never stored on our servers." },
    { title: "Cookies & Tracking", content: "We use cookies and similar technologies to remember your preferences, analyze site traffic, and deliver personalized content. You can manage cookie preferences through your browser settings." },
    { title: "Your Rights", content: "You have the right to access, correct, delete, or export your personal data. You can also opt out of marketing communications at any time. Contact us to exercise these rights." },
    { title: "Data Retention", content: "We retain your data for as long as your account is active or as needed to provide services. Order data is retained for legal and tax compliance purposes." },
    { title: "Changes to This Policy", content: "We may update this privacy policy from time to time. We will notify you of significant changes via email or through our platform." },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.crumb}>
          <Breadcrumb items={[{ label: "Privacy Policy" }]} />
        </div>

        <motion.header className={styles.head} {...enterProps(reduce)}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.updated}>
            <Icon icon="mdi:calendar-blank-outline" aria-hidden="true" />
            Last updated {POLICY_LAST_UPDATED}
          </p>
          <p className={styles.intro}>
            At {APP_NAME}, we take your privacy seriously. This policy describes how
            we collect, use, and protect your personal information.
          </p>
        </motion.header>

        <div className={styles.sections}>
          {sections.map((section, i) => (
            <motion.section
              key={i}
              id={`section-${i + 1}`}
              className={styles.section}
              {...rise()}
            >
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              </div>
              <p className={styles.sectionBody}>{section.content}</p>
            </motion.section>
          ))}
        </div>

        <div className={styles.contact}>
          <p>
            Questions about this policy? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
