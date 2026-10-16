"use client";

import { useState } from "react";
import styles from "./ContactRoom.module.css";

export function ContactRoom() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function startAnotherMessage() {
    setSubmitted(false);
  }

  return (
    <section
      className={styles["contact-room"]}
      id="contact"
      aria-labelledby="contact-title"
    >
      {submitted ? (
        <div className={styles["contact-success"]} role="status">
          <p className={styles["eyebrow"]}>Message ready</p>
          <h2 id="contact-title">Thanks for reaching out.</h2>
          <p>
            This is a UI preview, so your message hasn’t been sent. The contact
            form will be connected in a later phase.
          </p>
          <button type="button" onClick={startAnotherMessage}>
            Write another message
          </button>
        </div>
      ) : (
        <>
          <div className={styles["contact-intro"]}>
            <p className={styles["eyebrow"]}>The next good question</p>
            <h2 id="contact-title">What are you thinking about?</h2>
            <p>
              A project, a role, or just an interesting problem — I’d be glad
              to hear about it.
            </p>
          </div>
          <form className={styles["contact-form"]} onSubmit={handleSubmit}>
            <label>
              <span>Your name</span>
              <input autoComplete="name" name="name" required />
            </label>
            <label>
              <span>Email address</span>
              <input
                autoComplete="email"
                name="email"
                type="email"
                required
              />
            </label>
            <label className={styles["message-field"]}>
              <span>A little about it</span>
              <textarea name="message" rows={4} required />
            </label>
            <button type="submit">
              Prepare message <span aria-hidden="true">↗</span>
            </button>
            <p className={styles["form-note"]}>
              UI preview only — nothing is sent or stored.
            </p>
          </form>
        </>
      )}
    </section>
  );
}
