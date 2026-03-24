"use client";

import { useState, useEffect, useCallback } from "react";
import WebApp from "@twa-dev/sdk";
import { useI18n } from "@/lib/i18n";

type PaymentModalProps = {
  onClose: () => void;
};

type Tariff = "basic" | "plus" | "business";
type Step = "tariff" | "period" | "payment";

/* ─── Pricing tables ─── */

const BASIC_PRICES: { months: number; price: number }[] = [
  { months: 1, price: 149 },
  { months: 3, price: 399 },
  { months: 6, price: 749 },
  { months: 12, price: 1399 },
];

const PLUS_PRICES: { months: number; price: number }[] = [
  { months: 1, price: 299 },
  { months: 3, price: 699 },
  { months: 6, price: 1199 },
  { months: 12, price: 2299 },
];

const BUSINESS_PRICES: { clients: number; price: number }[] = [
  { clients: 25, price: 599 },
  { clients: 50, price: 1099 },
  { clients: 100, price: 1899 },
  { clients: 150, price: 2499 },
  { clients: 250, price: 3599 },
  { clients: 500, price: 5999 },
];

const STARS_MARKUP = 1.3;

function rubToStars(rub: number): number {
  return Math.ceil((rub / 2.3) * STARS_MARKUP); // ~2.3 RUB per star + 30%
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const { t } = useI18n();
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<Step>("tariff");
  const [selectedTariff, setSelectedTariff] = useState<Tariff>("basic");
  const [selectedPrice, setSelectedPrice] = useState(149);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [selectedClients, setSelectedClients] = useState(0);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  const goBack = useCallback(() => {
    if (step === "payment") setStep("period");
    else if (step === "period") setStep("tariff");
    else close();
  }, [step, close]);

  useEffect(() => {
    try {
      WebApp.BackButton.show();
      const handler = () => goBack();
      WebApp.BackButton.onClick(handler);
      return () => {
        WebApp.BackButton.offClick(handler);
        WebApp.BackButton.hide();
      };
    } catch {
      return;
    }
  }, [goBack]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  /* ─── Step 1: select tariff ─── */
  const handleSelectTariff = (tariff: Tariff) => {
    setSelectedTariff(tariff);
    setStep("period");
  };

  /* ─── Step 2: select period/plan ─── */
  const handleSelectPeriod = (price: number, months: number, clients: number) => {
    setSelectedPrice(price);
    setSelectedMonths(months);
    setSelectedClients(clients);
    setStep("payment");
  };

  /* ─── Step 3: payment handlers ─── */
  const handleStars = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const initData = WebApp.initData;
      const starsAmount = rubToStars(selectedPrice);
      const res = await fetch("/api/payment/stars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initData,
        },
        body: JSON.stringify({
          tariff: selectedTariff,
          months: selectedMonths,
          clients: selectedClients,
          amount_stars: starsAmount,
          amount_rub: selectedPrice,
        }),
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
        body: JSON.stringify({
          tariff: selectedTariff,
          months: selectedMonths,
          clients: selectedClients,
          amount_rub: selectedPrice,
        }),
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

  /* ─── Month label helper ─── */
  const monthLabel = (m: number) => {
    if (m === 1) return t.paymentMonths1;
    if (m === 3) return t.paymentMonths3;
    if (m === 6) return t.paymentMonths6;
    return t.paymentMonths12;
  };

  const starsPrice = rubToStars(selectedPrice);

  /* ─── Subtitle per step ─── */
  const subtitle = step === "tariff"
    ? t.paymentChooseTariff
    : step === "period"
      ? t.paymentChoosePeriod
      : t.paymentChooseMethod;

  return (
    <div
      className="payment-overlay"
      onClick={close}
    >
      <div
        className="payment-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="payment-handle" />

        {/* Back button (inline) */}
        {step !== "tariff" && (
          <button type="button" className="payment-back" onClick={goBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" />
            </svg>
            {t.back}
          </button>
        )}

        <h2 className="payment-title">{t.paymentTitle}</h2>
        <p className="payment-subtitle">{subtitle}</p>

        {/* ─── Step 1: Tariff ─── */}
        {step === "tariff" && (
          <div className="payment-methods">
            <button
              type="button"
              className="payment-method"
              onClick={() => handleSelectTariff("basic")}
            >
              <div className="payment-method__icon payment-method__icon--basic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="payment-method__info">
                <span className="payment-method__name">{t.paymentTariffBasic}</span>
                <span className="payment-method__desc">{t.paymentTariffBasicDesc}</span>
              </div>
              <div className="payment-method__price">
                <span className="payment-method__price-value">149 ₽</span>
                <span className="payment-method__price-period">{t.paymentPerMonth}</span>
              </div>
            </button>

            <button
              type="button"
              className="payment-method"
              onClick={() => handleSelectTariff("plus")}
            >
              <div className="payment-method__icon payment-method__icon--plus">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="payment-method__info">
                <span className="payment-method__name">{t.paymentTariffPlus}</span>
                <span className="payment-method__desc">{t.paymentTariffPlusDesc}</span>
              </div>
              <div className="payment-method__price">
                <span className="payment-method__price-value">299 ₽</span>
                <span className="payment-method__price-period">{t.paymentPerMonth}</span>
              </div>
            </button>

            <button
              type="button"
              className="payment-method"
              onClick={() => handleSelectTariff("business")}
            >
              <div className="payment-method__icon payment-method__icon--business">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="payment-method__info">
                <span className="payment-method__name">{t.paymentTariffBusiness}</span>
                <span className="payment-method__desc">{t.paymentTariffBusinessDesc}</span>
              </div>
              <div className="payment-method__price">
                <span className="payment-method__price-value">599 ₽</span>
                <span className="payment-method__price-period">{t.paymentPerMonth}</span>
              </div>
            </button>
          </div>
        )}

        {/* ─── Step 2: Period / Plan ─── */}
        {step === "period" && selectedTariff !== "business" && (
          <div className="payment-methods">
            {(selectedTariff === "basic" ? BASIC_PRICES : PLUS_PRICES).map((p) => (
              <button
                key={p.months}
                type="button"
                className="payment-method"
                onClick={() => handleSelectPeriod(p.price, p.months, 0)}
              >
                <div className="payment-method__info">
                  <span className="payment-method__name">{monthLabel(p.months)}</span>
                  {p.months > 1 && (
                    <span className="payment-method__desc">
                      {Math.round(p.price / p.months)} ₽ {t.paymentPerMonth}
                    </span>
                  )}
                </div>
                <span className="payment-method__price-value">{p.price} ₽</span>
              </button>
            ))}
          </div>
        )}

        {step === "period" && selectedTariff === "business" && (
          <div className="payment-methods">
            {BUSINESS_PRICES.map((p) => (
              <button
                key={p.clients}
                type="button"
                className="payment-method"
                onClick={() => handleSelectPeriod(p.price, 1, p.clients)}
              >
                <div className="payment-method__info">
                  <span className="payment-method__name">{t.paymentClientsPerDay(p.clients)}</span>
                </div>
                <div className="payment-method__price">
                  <span className="payment-method__price-value">{p.price} ₽</span>
                  <span className="payment-method__price-period">{t.paymentPerMonth}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ─── Step 3: Payment method ─── */}
        {step === "payment" && (
          <div className="payment-methods">
            {/* Selected plan summary */}
            <div className="payment-summary">
              <span className="payment-summary__tariff">
                {selectedTariff === "basic" ? t.paymentTariffBasic : selectedTariff === "plus" ? t.paymentTariffPlus : t.paymentTariffBusiness}
              </span>
              <span className="payment-summary__sep">&middot;</span>
              <span className="payment-summary__detail">
                {selectedTariff === "business"
                  ? t.paymentClientsPerDay(selectedClients)
                  : monthLabel(selectedMonths)}
              </span>
              <span className="payment-summary__sep">&middot;</span>
              <span className="payment-summary__price">{selectedPrice} ₽</span>
            </div>

            {/* Telegram Stars */}
            <button
              type="button"
              className="payment-method"
              onClick={handleStars}
              disabled={loading}
            >
              <div className="payment-method__icon payment-method__icon--stars">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="payment-method__info">
                <span className="payment-method__name">{t.paymentStars}</span>
                <span className="payment-method__desc">{t.paymentStarsDesc}</span>
              </div>
              <span className="payment-method__price-value">{starsPrice} ⭐</span>
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
                  <path d="M11.944 17.97L4.58 13.62 11.944 24l7.37-10.38-7.372 4.35h.002zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" fill="currentColor"/>
                </svg>
              </div>
              <div className="payment-method__info">
                <span className="payment-method__name">{t.paymentCrypto}</span>
                <span className="payment-method__desc">{t.paymentCryptoDesc}</span>
              </div>
              <span className="payment-method__price-value">{selectedPrice} ₽</span>
            </button>

            <div className="payment-divider" />

            {/* СБП — coming soon */}
            <button
              type="button"
              className="payment-method payment-method--disabled"
              onClick={handleComingSoon}
            >
              <div className="payment-method__icon payment-method__icon--sbp">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-2 0H3V6h14v8zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm13 0v11c0 1.1-.9 2-2 2H4v-2h17V7h2z" fill="currentColor"/>
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
                  <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="payment-method__info">
                <span className="payment-method__name">{t.paymentCard}</span>
                <span className="payment-method__desc">{t.paymentCardDesc}</span>
              </div>
              <span className="payment-method__badge">{t.paymentComingSoon}</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="payment-loading">
            <div className="payment-spinner" />
            <span>{t.paymentProcessing}</span>
          </div>
        )}
      </div>

      {toast && (
        <div className="payment-toast">{toast}</div>
      )}
    </div>
  );
}
