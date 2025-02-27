"use client";
import { createContext, useState, useEffect } from "react";

// Define a type for the pushed voucher ranges
export type PushedVoucherRanges = {
  [key: string]: {
    startDate: string;
    endDate: string;
    startVoucher: number;
    endVoucher: number;
  };
};

// Define a type for the voucher context
interface VoucherContextType {
  lastUpdatedVoucher: any | null;
  setLastUpdatedVoucher: (voucher: any | null) => void;
  lastUpdatedVoucherDate: string;
  setLastUpdatedVoucherDate: (date: string) => void;
  submissionDate: string;
  setSubmissionDate: (date: string) => void;
  pushedVoucherRanges: PushedVoucherRanges;
  setPushedVoucherRanges: (ranges: PushedVoucherRanges) => void;
  lastVoucherNumber: number;
  setLastVoucherNumber: (newNumber: number) => void;
}

// Create context with default values
const VoucherContext = createContext<VoucherContextType>({
  lastUpdatedVoucher: null,
  setLastUpdatedVoucher: () => {},
  lastUpdatedVoucherDate: "",
  setLastUpdatedVoucherDate: () => {},
  submissionDate: "",
  setSubmissionDate: () => {},
  pushedVoucherRanges: {},
  setPushedVoucherRanges: () => {},
  lastVoucherNumber: 0,
  setLastVoucherNumber: () => {},
});

export const VoucherProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lastUpdatedVoucher, setLastUpdatedVoucher] = useState<any | null>(
    null
  );
  const [lastUpdatedVoucherDate, setLastUpdatedVoucherDate] =
    useState<string>("");
  const [submissionDate, setSubmissionDate] = useState<string>("");
  const [pushedVoucherRanges, setPushedVoucherRanges] =
    useState<PushedVoucherRanges>({});
      const [lastVoucherNumber, setLastVoucherNumber] = useState<number>(0);


  // Load values from localStorage on mount
  useEffect(() => {
    try {
      const storedVoucher = localStorage.getItem("lastUpdatedVoucher");
      if (storedVoucher) {
        setLastUpdatedVoucher(JSON.parse(storedVoucher));
      }

      const storedDate = localStorage.getItem("lastUpdatedVoucherDate");
      if (storedDate) {
        setLastUpdatedVoucherDate(storedDate);
      }

      const storedSubmissionDate = localStorage.getItem("submissionDate");
      if (storedSubmissionDate) {
        setSubmissionDate(storedSubmissionDate);
      }

      const storedPushedRanges = localStorage.getItem("pushedVoucherRanges");
      if (storedPushedRanges) {
        setPushedVoucherRanges(JSON.parse(storedPushedRanges));
      }
      const storedVoucherNumber = localStorage.getItem("lastVoucherNumber");
      if (storedVoucherNumber) {
        setLastVoucherNumber(parseInt(storedVoucherNumber, 10));
      }
    } catch (error) {
      console.error("Error loading localStorage data:", error);
    }
  }, []);

  // Save values to localStorage when updated
  useEffect(() => {
    try {
      if (lastUpdatedVoucher) {
        localStorage.setItem(
          "lastUpdatedVoucher",
          JSON.stringify(lastUpdatedVoucher)
        );
      }
      if (lastUpdatedVoucherDate) {
        localStorage.setItem("lastUpdatedVoucherDate", lastUpdatedVoucherDate);
      }
      if (submissionDate) {
        localStorage.setItem("submissionDate", submissionDate);
      }
      if (Object.keys(pushedVoucherRanges).length > 0) {
        localStorage.setItem(
          "pushedVoucherRanges",
          JSON.stringify(pushedVoucherRanges)
        );
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [
    lastUpdatedVoucher,
    lastUpdatedVoucherDate,
    submissionDate,
    pushedVoucherRanges,
  ]);

  return (
    <VoucherContext.Provider
      value={{
        lastUpdatedVoucher,
        setLastUpdatedVoucher,
        lastUpdatedVoucherDate,
        setLastUpdatedVoucherDate,
        submissionDate,
        setSubmissionDate,
        pushedVoucherRanges,
        setPushedVoucherRanges,
        lastVoucherNumber,
        setLastVoucherNumber: (newNumber: number) => {
          setLastVoucherNumber(newNumber);
          localStorage.setItem("lastVoucherNumber", newNumber.toString());
        },
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
};

export default VoucherContext;
