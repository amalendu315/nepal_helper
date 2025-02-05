"use client";
import { createContext, useState, useEffect } from "react";

// Define a type for the pushed voucher ranges
type PushedVoucherRanges = {
  [key: string]: {
    startDate: string;
    endDate: string;
    startVoucher: number;
    endVoucher: number;
  };
};

const VoucherContext = createContext({
  lastUpdatedVoucher: null as any,
  setLastUpdatedVoucher: (voucher: any) => {},
  lastUpdatedVoucherDate: "",
  setLastUpdatedVoucherDate: (date: string) => {},
  submissionDate: "",
  setSubmissionDate: (date: string) => {},
  pushedVoucherRanges: {} as PushedVoucherRanges,
  setPushedVoucherRanges: (ranges: PushedVoucherRanges) => {},
});

export const VoucherProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lastUpdatedVoucher, setLastUpdatedVoucher] = useState(null);
  const [lastUpdatedVoucherDate, setLastUpdatedVoucherDate] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [pushedVoucherRanges, setPushedVoucherRanges] =
    useState<PushedVoucherRanges>({});

  useEffect(() => {
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
  }, []);

  return (
    <VoucherContext.Provider
      value={{
        lastUpdatedVoucher,
        setLastUpdatedVoucher: (voucher: any) => {
          setLastUpdatedVoucher(voucher);
          localStorage.setItem("lastUpdatedVoucher", JSON.stringify(voucher));
        },
        lastUpdatedVoucherDate,
        setLastUpdatedVoucherDate: (date: string) => {
          setLastUpdatedVoucherDate(date);
          localStorage.setItem("lastUpdatedVoucherDate", date);
        },
        submissionDate,
        setSubmissionDate: (date: string) => {
          setSubmissionDate(date);
          localStorage.setItem("submissionDate", date);
        },
        pushedVoucherRanges,
        setPushedVoucherRanges: (ranges: PushedVoucherRanges) => {
          setPushedVoucherRanges(ranges);
          localStorage.setItem("pushedVoucherRanges", JSON.stringify(ranges));
        },
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
};

export default VoucherContext;
