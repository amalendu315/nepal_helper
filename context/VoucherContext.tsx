"use client";
import { createContext, useState, useEffect } from "react";

export type PushedVoucherRanges = {
  [key: string]: {
    startDate: string;
    endDate: string;
    startVoucher: number;
    endVoucher: number;
  };
};

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
  pushedInvoiceNos: number[];
  setPushedInvoiceNos: (ids: number[]) => void;
}

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
  pushedInvoiceNos: [],
  setPushedInvoiceNos: () => {},
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
  const [lastVoucherNumber, setLastVoucherNumberState] = useState<number>(0);
  const [pushedInvoiceNos, setPushedInvoiceNosState] = useState<number[]>([]);

  // Load from localStorage
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
        setLastVoucherNumberState(parseInt(storedVoucherNumber, 10));
      }

      const storedPushedNos = localStorage.getItem("pushedInvoiceNos");
      if (storedPushedNos) {
        setPushedInvoiceNosState(JSON.parse(storedPushedNos));
      }
    } catch (error) {
      console.error("Error loading localStorage data:", error);
    }
  }, []);

  // Save to localStorage
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
      localStorage.setItem("lastVoucherNumber", lastVoucherNumber.toString());
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [
    lastUpdatedVoucher,
    lastUpdatedVoucherDate,
    submissionDate,
    pushedVoucherRanges,
    lastVoucherNumber,
  ]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "pushedInvoiceNos",
        JSON.stringify(pushedInvoiceNos)
      );
    } catch (error) {
      console.error("Error saving pushedInvoiceNos:", error);
    }
  }, [pushedInvoiceNos]);

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
          setLastVoucherNumberState(newNumber);
          localStorage.setItem("lastVoucherNumber", newNumber.toString());
        },
        pushedInvoiceNos,
        setPushedInvoiceNos: (ids: number[]) => {
          setPushedInvoiceNosState(ids);
          localStorage.setItem("pushedInvoiceNos", JSON.stringify(ids));
        },
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
};

export default VoucherContext;
