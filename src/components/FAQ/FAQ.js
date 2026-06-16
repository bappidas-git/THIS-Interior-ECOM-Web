import React, { useState } from "react";
import { FAQ_ITEMS } from "../../utils/constants";
import styles from "./FAQ.module.css";

// Shared, editorial FAQ accordion. Dark mode is inherited from the --sf-* tokens
// (they flip under body.dark), so this no longer reads the theme in JS. The
// FAQ_ITEMS source and the accordion behaviour are unchanged.
const FAQ = () => {
  const [openId, setOpenId] = useState(null);

  return (
    <section className={styles.faq}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>Answers</p>
        <h2 className={styles.heading}>Frequently asked questions</h2>
        <div className={styles.list}>
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className={`${styles.item} ${isOpen ? styles.open : ""}`}>
                <button
                  className={styles.question}
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  id={`faq-question-${faq.id}`}
                >
                  <span>{faq.question}</span>
                  <span className={styles.toggle} aria-hidden="true" />
                </button>
                <div
                  className={styles.answer}
                  id={`faq-answer-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-question-${faq.id}`}
                  aria-hidden={!isOpen}
                >
                  <div className={styles.answerInner}><p>{faq.answer}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
