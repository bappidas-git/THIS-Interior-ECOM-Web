import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { APP_NAME, SUPPORT_EMAIL, POLICY_LAST_UPDATED } from "../../utils/constants";
import { revealProps, enterProps } from "../../components/motion";
import styles from "./TermsOfService.module.css";

const TermsOfService = () => {
  const reduce = useReducedMotion();
  const rise = (delay = 0) => revealProps(reduce, delay);

  const sections = [
    { title: "Acceptance of Terms", content: `By accessing or using ${APP_NAME}, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.` },
    { title: "Account Registration", content: "You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to use our services." },
    { title: "Orders & Pricing", content: "All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We reserve the right to modify prices without prior notice. Orders are subject to acceptance and availability." },
    { title: "Payment Terms", content: "We accept various payment methods including credit/debit cards, UPI, net banking, wallets, and Cash on Delivery. All payments are processed through secure, PCI-compliant payment gateways." },
    { title: "Shipping & Delivery", content: "Delivery timelines are estimates and may vary based on location and availability. We are not responsible for delays caused by carriers, natural disasters, or circumstances beyond our control." },
    { title: "Returns & Refunds", content: "Products may be returned within 7 days of delivery subject to our Return Policy. Refunds are processed within 5-7 business days after the returned product is received and inspected." },
    { title: "Intellectual Property", content: `All content on ${APP_NAME}, including text, images, logos, and software, is our property or licensed to us. You may not reproduce, distribute, or create derivative works without written permission.` },
    { title: "Limitation of Liability", content: `${APP_NAME} is provided "as is" without warranties. We are not liable for indirect, incidental, or consequential damages arising from your use of our platform.` },
    { title: "Governing Law", content: "These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Mumbai, Maharashtra." },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.crumb}>
          <Breadcrumb items={[{ label: "Terms of Service" }]} />
        </div>

        <motion.header className={styles.head} {...enterProps(reduce)}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.updated}>
            <Icon icon="mdi:calendar-blank-outline" aria-hidden="true" />
            Last updated {POLICY_LAST_UPDATED}
          </p>
          <p className={styles.intro}>
            Please read these terms carefully before using {APP_NAME}.
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
            Questions about these terms? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
