import { useState } from "react";
import styles from "../styles/Connect.module.css";
import slackLogo from "../assets/slack.svg";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Connect() {
  const [connecting, setConnecting] = useState(false);

  const startOAuth = async () => {
    try {
      setConnecting(true);
      const res = await fetch(`${API_BASE}/auth/slack/authorize`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to get URL");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("OAuth failed: " + err);
      setConnecting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Background Effects */}
      <div className={styles.gridBg}></div>
      <div className={`${styles.glowCircle} ${styles.purpleGlow}`}></div>
      <div className={`${styles.glowCircle} ${styles.cyanGlow}`}></div>

      <div className={styles.contentWrapper}>
        {/* Logo */}
        <div className={styles.logoWrapper}>
          <img src={slackLogo} alt="Slack Logo" className={styles.slackLogo} />
        </div>

        {/* Heading */}
        <h1 className={styles.title}>
          Slack Message <span className={styles.gradientText}>Connect</span>
        </h1>
        <p className={styles.subtitle}>
          Connect your Slack workspace to the future of messaging. Send instant
          messages and schedule them with{" "}
          <span className={styles.highlight}>quantum precision</span>.
        </p>

        {/* Button */}
        <button
          onClick={startOAuth}
          disabled={connecting}
          className={styles.connectButton}
        >
          {connecting
            ? "Establishing Connection..."
            : "Connect Slack Workspace"}
        </button>

        {/* Features */}
        <div className={styles.features}>
          <span className={styles.featureItem}>Quantum Encrypted</span>
          <span className={styles.featureItem}>Zero Data Storage</span>
          <span className={styles.featureItem}>Instant Setup</span>
        </div>
      </div>
    </div>
  );
}
