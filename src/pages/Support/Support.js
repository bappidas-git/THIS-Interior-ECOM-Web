import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_ADDRESS,
  SUPPORT_HOURS,
} from "../../utils/constants";
import { isEmailValid, isValidPhone } from "../../utils/helpers";
import styles from "./Support.module.css";

const Support = () => {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", orderNumber: "",
    category: "general", subject: "", message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill the email for logged-in users once the auth context resolves,
  // without clobbering anything they may have already typed.
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => (prev.email ? prev : { ...prev, email: user.email }));
    }
  }, [user]);

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "order", label: "Order Related" },
    { value: "shipping", label: "Shipping & Delivery" },
    { value: "returns", label: "Returns & Refunds" },
    { value: "product", label: "Product Information" },
    { value: "payment", label: "Payment Issues" },
    { value: "account", label: "Account & Login" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!isEmailValid(formData.email)) newErrors.email = "Invalid email";
    if (formData.phone.trim() && !isValidPhone(formData.phone))
      newErrors.phone = "Enter a valid 10-digit mobile number";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 20) newErrors.message = "At least 20 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await apiService.leads.createContact(formData);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", orderNumber: "", category: "general", subject: "", message: "" });
    } catch {
      setErrors({ submit: "Failed to send. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldProps = (name) => ({
    id: name,
    name,
    value: formData[name],
    onChange: handleChange,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  if (isSubmitted) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <motion.div
            className={styles.successCard}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.successMedallion} aria-hidden="true">
              <Icon icon="mdi:check" />
            </span>
            <p className={styles.eyebrow}>Thank you</p>
            <h2 className={styles.successTitle}>Your message is on its way</h2>
            <p className={styles.successText}>
              We've received your note and will reply within 24 hours. We look
              forward to helping.
            </p>
            <div className={styles.successActions}>
              <button className={styles.btnSecondary} onClick={() => setIsSubmitted(false)}>
                Send another
              </button>
              <Link to="/" className={styles.btnGhost}>Back to home</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.crumb}>
          <Breadcrumb items={[{ label: "Support" }]} />
        </div>

        <motion.header
          className={styles.header}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.eyebrow}>We're here to help</p>
          <h1 className={styles.title}>Contact support</h1>
          <p className={styles.lede}>
            Questions about an order, a piece, or your account? Send us a note and
            we'll get back to you with care.
          </p>
        </motion.header>

        <div className={styles.content}>
          <motion.aside
            className={styles.sidebar}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.infoCard}>
              <span className={styles.infoIcon} aria-hidden="true"><Icon icon="mdi:email-outline" /></span>
              <div className={styles.infoText}>
                <h3>Email us</h3>
                <a href={`mailto:${SUPPORT_EMAIL}`} className={styles.infoLink}>{SUPPORT_EMAIL}</a>
                <span className={styles.infoMeta}>We reply within 24 hours</span>
              </div>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon} aria-hidden="true"><Icon icon="mdi:phone-outline" /></span>
              <div className={styles.infoText}>
                <h3>Call us</h3>
                <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} className={styles.infoLink}>{SUPPORT_PHONE}</a>
                <span className={styles.infoMeta}>{SUPPORT_HOURS}</span>
              </div>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon} aria-hidden="true"><Icon icon="mdi:map-marker-outline" /></span>
              <div className={styles.infoText}>
                <h3>Visit us</h3>
                <span className={styles.infoMeta}>{SUPPORT_ADDRESS}</span>
              </div>
            </div>
            <div className={styles.quickLinks}>
              <h3>Quick links</h3>
              <Link to="/help">Help Center &amp; FAQs</Link>
              <Link to="/orders">Track an order</Link>
              <Link to="/refund">Return &amp; refund policy</Link>
            </div>
          </motion.aside>

          <motion.form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <h2 className={styles.formTitle}>Send a message</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className="sf-label" htmlFor="name">Full name *</label>
                <input type="text" className="sf-input" placeholder="Your name" {...fieldProps("name")} />
                {errors.name && <span className={styles.error} id="name-error">{errors.name}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className="sf-label" htmlFor="email">Email *</label>
                <input type="email" className="sf-input" placeholder="you@email.com" {...fieldProps("email")} />
                {errors.email && <span className={styles.error} id="email-error">{errors.email}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className="sf-label" htmlFor="phone">Phone</label>
                <input type="tel" className="sf-input" placeholder="+91 98765 43210" {...fieldProps("phone")} />
                {errors.phone && <span className={styles.error} id="phone-error">{errors.phone}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className="sf-label" htmlFor="orderNumber">Order number</label>
                <input type="text" className="sf-input" placeholder="ORD-XXXXXX" {...fieldProps("orderNumber")} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className="sf-label" htmlFor="category">Category</label>
              <select className="sf-select" {...fieldProps("category")}>
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className="sf-label" htmlFor="subject">Subject *</label>
              <input type="text" className="sf-input" placeholder="Brief description" {...fieldProps("subject")} />
              {errors.subject && <span className={styles.error} id="subject-error">{errors.subject}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className="sf-label" htmlFor="message">Message *</label>
              <textarea className="sf-textarea" rows={6} placeholder="Tell us how we can help…" {...fieldProps("message")} />
              {errors.message && <span className={styles.error} id="message-error">{errors.message}</span>}
            </div>

            {errors.submit && <div className={styles.submitError} role="alert">{errors.submit}</div>}

            <button type="submit" className="sf-btn sf-btn--primary sf-btn--block sf-btn--uppercase" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send message"}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Support;
