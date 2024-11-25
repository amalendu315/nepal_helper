"use client";
import { createContext, useState, useEffect } from "react";

const VoucherContext = createContext({
  lastUpdatedVoucherDate: "",
  setLastUpdatedVoucherDate: (date: string) => {},
  submissionDate: "",
  setSubmissionDate: (date: string) => {},
});

export const VoucherProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lastUpdatedVoucherDate, setLastUpdatedVoucherDate] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");

  useEffect(() => {
    const storedDate = localStorage.getItem("lastUpdatedVoucherDate");
    if (storedDate) {
      setLastUpdatedVoucherDate(storedDate);
    }
    const storedSubmissionDate = localStorage.getItem("submissionDate");
    if (storedSubmissionDate) {
      setSubmissionDate(storedSubmissionDate);
    }
  }, []);

  return (
    <VoucherContext.Provider
      value={{
        lastUpdatedVoucherDate,
        setLastUpdatedVoucherDate: (date: string) => {
          setLastUpdatedVoucherDate(date);
          localStorage.setItem("lastUpdatedVoucherDate", date);
        },
        submissionDate,
        setSubmissionDate: (date: string) => {
          setSubmissionDate(date);
          localStorage.setItem("submissionDate", date); // Save to localStorage
        },
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
};

export default VoucherContext;
