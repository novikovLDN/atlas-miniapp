"use client";

import { useState, useEffect, useCallback } from "react";
import WebApp from "@twa-dev/sdk";
import { useI18n } from "@/lib/i18n";

type PaymentModalProps = {
  onClose: () => void;
};

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const { t } = useI18n();
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    try {
      WebApp.BackButton.show();
      const handler = () => close();
      WebApp.BackButton.onClick(handler);
      return () => {
        WebApp.BackButton.offClick(handler);
        WebApp.BackButton.hide();
      };
    } catch {
      return;
    }
  }, [close]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleStars = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const initData = WebApp.initData;
      const res = await fetch("/api/payment/stars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initData,
        },
        body: JSON.stringify({ plan: "basic" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      WebApp.openInvoice(data.invoice_url, (status) => {
        if (status === "paid") {
          onClose();
          window.location.reload();
        }
      });
    } catch {
      showToast(t.paymentError);
    } finally {
      setLoading(false);
    }
  };

  const handleCrypto = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const initData = WebApp.initData;
      const res = await fetch("/api/payment/crypto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initData,
        },
        body: JSON.stringify({ plan: "basic" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      WebApp.openLink(data.pay_url);
    } catch {
      showToast(t.paymentError);
    } finally {
      setLoading(false);
    }
  };

  const handleComingSoon = () => {
    showToast(t.paymentComingSoonToast);
  };

  return (
    <div
      className={`payment-overlay ${closing ? "payment-overlay--closing" : ""}`}
      onClick={close}
    >
      <div
        className={`payment-sheet ${closing ? "payment-sheet--closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="payment-handle" />

        <h2 className="payment-title">{t.paymentTitle}</h2>
        <p className="payment-subtitle">{t.paymentChooseMethod}</p>

        <div className="payment-methods">
          {/* Telegram Stars */}
          <button
            type="button"
            className="payment-method"
            onClick={handleStars}
            disabled={loading}
          >
            <div className="payment-method__icon payment-method__icon--stars">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="payment-method__info">
              <span className="payment-method__name">{t.paymentStars}</span>
              <span className="payment-method__desc">{t.paymentStarsDesc}</span>
            </div>
            <div className="payment-method__price">
              <span className="payment-method__price-value">{t.paymentStarsPrice}</span>
              <span className="payment-method__price-period">{t.paymentPerMonth}</span>
            </div>
          </button>

          {/* CryptoBot */}
          <button
            type="button"
            className="payment-method"
            onClick={handleCrypto}
            disabled={loading}
          >
            <div className="payment-method__icon payment-method__icon--crypto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11.944 17.97L4.58 13.62 11.944 24l7.37-10.38-7.372 4.35h.002zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="payment-method__info">
              <span className="payment-method__name">{t.paymentCrypto}</span>
              <span className="payment-method__desc">{t.paymentCryptoDesc}</span>
            </div>
            <div className="payment-method__price">
              <span className="payment-method__price-value">{t.paymentCryptoPrice}</span>
              <span className="payment-method__price-period">{t.paymentPerMonth}</span>
            </div>
          </button>

          {/* Divider */}
          <div className="payment-divider" />

          {/* СБП — coming soon */}
          <button
            type="button"
            className="payment-method payment-method--disabled"
            onClick={handleComingSoon}
          >
            <div className="payment-method__icon payment-method__icon--sbp">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-2 0H3V6h14v8zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm13 0v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="payment-method__info">
              <span className="payment-method__name">{t.paymentSBP}</span>
              <span className="payment-method__desc">{t.paymentSBPDesc}</span>
            </div>
            <span className="payment-method__badge">{t.paymentComingSoon}</span>
          </button>

          {/* Card — coming soon */}
          <button
            type="button"
            className="payment-method payment-method--disabled"
            onClick={handleComingSoon}
          >
            <div className="payment-method__icon payment-method__icon--card">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="payment-method__info">
              <span className="payment-method__name">{t.paymentCard}</span>
              <span className="payment-method__desc">{t.paymentCardDesc}</span>
            </div>
            <span className="payment-method__badge">{t.paymentComingSoon}</span>
          </button>
        </div>

        {loading && (
          <div className="payment-loading">
            <div className="payment-spinner" />
            <span>{t.paymentProcessing}</span>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="payment-toast">{toast}</div>
      )}
    </div>
  );
}
