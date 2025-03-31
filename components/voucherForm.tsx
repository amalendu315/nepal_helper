"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "./ui/card";
import VoucherList from "./voucherList";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import toast from "react-hot-toast";
// import { _Voucher } from "@/constants";
import VoucherContext from "@/context/VoucherContext";
import SumContext from "@/context/SumContext";
import * as XLSX from "xlsx"; // Import xlsx library

interface VoucherEntry {
  branchName: string;
  vouchertype: "Sales" | "Purchase";
  voucherno: string;
  voucherdate: string;
  narration: string;
  ledgerAllocation: {
    lineno: number;
    ledgerName: string;
    ledgerAddress?: string;
    amount: string;
    drCr: "dr" | "cr";
    description: string[] | [];
  }[];
}
export interface _Voucher {
  InvoiceID: number;
  InvoiceNo: number;
  SaleID: number;
  FinYID: number;
  InvoiceEntryDate: string;
  Prefix: string;
  Pnr: string;
  AccountName: string;
  DisplayRate: number;
  FinalRate: number;
  SaleEntryDate: string;
  FinFromDate: string;
  FinToDate: string;
  FinPrefix: string;
  pax: number;
  Add1: string;
  Add2: string;
  Pin: string;
  Country: string;
  CityName: string;
  Phone: string;
  Email: string;
  Types: string;
  AirlineCode: string;
  FromSector: string;
  ToSectors: string;
  CountryID: number;
  CountryMain: string;
  CityEntryMainID: number;
  State: string;
}

type DataForSales = VoucherEntry[];
type DataForPurchase = VoucherEntry[];

const VoucherForm = () => {
  const [isMounted, setIsMounted] = useState(false);
  const {
    setLastUpdatedVoucherDate,
    setSubmissionDate,
    setLastUpdatedVoucher,
    setPushedVoucherRanges,
    pushedVoucherRanges,
    lastVoucherNumber,
    setLastVoucherNumber,
    pushedInvoiceNos,
    setPushedInvoiceNos,
  } = React.useContext(VoucherContext);

  const { setTotalSum } = React.useContext(SumContext);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [vouchers, setVouchers] = useState<_Voucher[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);

  const handleFetchSalesEntries = async () => {
    try {
      setIsSalesLoading(true);
      const response = await fetch(
        `/api/sales?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );

      const data = await response?.json();
      if (!response?.ok) {
        toast.error("No Data Found");
      } else {
        const testKeywords = ["test", "dummy", "demo", "xyz", "airline test"];

        const nepalVouchers: _Voucher[] = data.data
          .filter((voucher: _Voucher) => {
            const countryLower = voucher.Country?.toLowerCase() || "";
            const countryMainLower = voucher.CountryMain?.toLowerCase() || "";
            const stateLower = voucher.State?.toLowerCase() || "";

            return (
              voucher.Types === "Invoice" && // Ensure only Invoice type vouchers
              !testKeywords.some((keyword) =>
                voucher.AccountName?.toLowerCase().includes(keyword)
              ) && // Exclude test accounts
              (countryLower === "nepal" ||
                countryMainLower === "nepal" ||
                voucher.CountryID === 4 ||
                stateLower.includes("province"))
            );
          })
          .sort(
            (a:_Voucher, b:_Voucher) =>
              new Date(a.SaleEntryDate).getTime() -
              new Date(b.SaleEntryDate).getTime()
          );

        if (nepalVouchers.length > 0) {
          setVouchers(nepalVouchers);

          const totalFinalRate = nepalVouchers.reduce((acc, voucher) => {
            const voucherFinalRate =
              typeof voucher.FinalRate === "number"
                ? voucher.FinalRate * voucher.pax
                : 0;
            return acc + voucherFinalRate;
          }, 0);

          setTotalSum(totalFinalRate);
          toast.success(
            `Fetched ${nepalVouchers.length} Nepal Vouchers For Selected Range!`
          );
        } else {
          toast.error(
            `No Nepal vouchers found from ${dateRange.start} to ${dateRange.end}!`
          );
        }
      }
      setIsSalesLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error Fetching The Data :(");
      setIsSalesLoading(false);
    }
  };


  const handleExportToExcel = () => {
    if (vouchers.length === 0) {
      toast.error("No data available to export!");
      return;
    }

    const formattedData = vouchers.map((voucher) => ({
      InvoiceNo: voucher.InvoiceNo,
      SaleEntryDate: voucher.SaleEntryDate,
      Pnr: voucher.Pnr,
      Pax: voucher.pax,
      AccountName: voucher.AccountName,
      Country: voucher.Country,
      FinalRate: voucher.FinalRate,
      TotalAmount: voucher.FinalRate * voucher.pax,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vouchers");
    XLSX.writeFile(workbook, "Vouchers.xlsx");

    toast.success("Excel file has been downloaded successfully!");
  };

  const submitVouchers = async (
    dataForCloud: VoucherEntry[],
    type: "sale" | "purchase"
  ) => {
    try {
      const response = await fetch(`/api/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: dataForCloud }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `${type.toUpperCase()} server error:`,
          response.status,
          errorText
        );
        throw new Error(
          `${type.toUpperCase()} server responded with status ${
            response.status
          }`
        );
      }
      toast.success(`${type.toUpperCase()} vouchers submitted successfully!`);
    } catch (error) {
      console.error(`Error submitting ${type} data:`, error);
      toast.error(`Error Submitting ${type.toUpperCase()} Data To Cloud!`);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      const data = await response.json();
      return data.rates["NPR"] || 1.6; // Default to 1.6 if not found
      // return 1.6; // Fallback rate
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      return 1.6; // Fallback rate
    }
  };


  const handleSubmitToCloud = async () => {
    try {
      setIsCloudLoading(true);
      const vouchersPerRequest = 50;
      const currentDate = new Date().toISOString().split("T")[0];
      setSubmissionDate(currentDate);

      const sortedVouchers = [...selectedEntries]
        .map((invoiceNo) => vouchers.find((v) => v.InvoiceNo === invoiceNo))
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(a!.SaleEntryDate).getTime() -
            new Date(b!.SaleEntryDate).getTime()
        );

      const alreadyPushed = sortedVouchers.filter((v) =>
        pushedInvoiceNos.includes(v!.InvoiceNo)
      );

      if (alreadyPushed.length > 0) {
        const alreadyNos = alreadyPushed.map((v) => v!.InvoiceNo).join(", ");
        toast.error(`These vouchers are already submitted: ${alreadyNos}`);
        setIsCloudLoading(false);
        return;
      }

      if (sortedVouchers.length === 0) {
        toast.error("No valid vouchers found!");
        setIsCloudLoading(false);
        return;
      }

      const firstSelectedVoucher =
        sortedVouchers.find((v) => v?.InvoiceNo === selectedEntries[0]) ?? null;
      const lastSelectedVoucher =
        sortedVouchers.find(
          (v) => v?.InvoiceNo === selectedEntries[selectedEntries.length - 1]
        ) ?? null;

      if (!firstSelectedVoucher || !lastSelectedVoucher) {
        toast.error("Selected vouchers not found!");
        setIsCloudLoading(false);
        return;
      }

      const rangeKey = `${dateRange.start}-${dateRange.end}`;
      let lastUsedVoucherNumber = lastVoucherNumber || 0;

      for (let i = 0; i < selectedEntries.length; i += vouchersPerRequest) {
        const dataForPurchase: DataForPurchase = [];
        const dataForSales: DataForSales = [];
        const batch = selectedEntries.slice(i, i + vouchersPerRequest);

        const exchangeRate = await fetchExchangeRate(); // fetch once per batch

        await Promise.all(
          batch.map(async (invoiceNo) => {
            const voucher = sortedVouchers.find(
              (v) => v?.InvoiceNo === invoiceNo
            );
            if (!voucher) return;

            // PURCHASE
            dataForPurchase.push({
              branchName: "AirIQ Nepal",
              vouchertype: "Purchase",
              voucherno: `AQNP/${voucher.InvoiceNo}`,
              voucherdate: voucher.SaleEntryDate.split("T")[0].replace(
                /-/g,
                "/"
              ),
              narration: `${voucher.Prefix}-${voucher.SaleID}, PNR :- ${voucher.Pnr}, PAX :- ${voucher.pax}`,
              ledgerAllocation: [
                {
                  lineno: 1,
                  ledgerName: "Air IQ",
                  ledgerAddress: "Sevoke Road, Siliguri, West Bengal - 734001",
                  amount: (voucher.FinalRate * voucher.pax).toFixed(2),
                  drCr: "cr",
                  description: [],
                },
                {
                  lineno: 2,
                  ledgerName: "Domestic Base Fare Purchase",
                  amount: (voucher.FinalRate * voucher.pax).toFixed(2),
                  drCr: "dr",
                  description: [],
                },
              ],
            });

            // SALES
            lastUsedVoucherNumber += 1;
            const formattedVoucherNumber = `AQNS/${lastUsedVoucherNumber
              .toString()
              .padStart(lastUsedVoucherNumber >= 1000 ? 4 : 3, "0")}`;

            const convertedAmountNPR = (
              voucher.FinalRate *
              voucher.pax *
              exchangeRate
            ).toFixed(2);

            dataForSales.push({
              branchName: "AirIQ Nepal",
              vouchertype: "Sales",
              voucherno: formattedVoucherNumber,
              voucherdate: voucher.SaleEntryDate.split("T")[0].replace(
                /-/g,
                "/"
              ),
              narration: `${voucher.Prefix}-${voucher.SaleID}, PNR :- ${voucher.Pnr}, PAX :- ${voucher.pax}, AIRLINE_CODE :- ${voucher.AirlineCode}, SECTOR :- ${voucher.FromSector} ${voucher.ToSectors}`,
              ledgerAllocation: [
                {
                  lineno: 1,
                  ledgerName: voucher.AccountName,
                  ledgerAddress: `${voucher.Add1}, ${voucher.Add2}, ${voucher.CityName} - ${voucher.Pin}`,
                  amount: convertedAmountNPR,
                  drCr: "dr",
                  description: [],
                },
                {
                  lineno: 2,
                  ledgerName: "Domestic Base Fare",
                  amount: convertedAmountNPR,
                  drCr: "cr",
                  description: [
                    `${voucher.AirlineCode}`,
                    "Sector",
                    `${voucher.FromSector} ${voucher.ToSectors}`,
                  ],
                },
              ],
            });
          })
        );

        // Submit batch
        await submitVouchers(dataForPurchase, "purchase");
        await submitVouchers(dataForSales, "sale");

        // Save pushed invoice numbers
        setPushedInvoiceNos([...new Set([...pushedInvoiceNos, ...batch])]);
      }

      setLastVoucherNumber(lastUsedVoucherNumber);
      toast.success("All vouchers submitted successfully!");

      setPushedVoucherRanges({
        ...pushedVoucherRanges,
        [rangeKey]: {
          startDate: format(
            new Date(firstSelectedVoucher.SaleEntryDate),
            "dd/MM/yyyy"
          ),
          endDate: format(
            new Date(lastSelectedVoucher.SaleEntryDate),
            "dd/MM/yyyy"
          ),
          startVoucher: firstSelectedVoucher.InvoiceNo,
          endVoucher: lastSelectedVoucher.InvoiceNo,
        },
      });

      setLastUpdatedVoucher(lastSelectedVoucher);
      const lastVoucherDate = lastSelectedVoucher.InvoiceEntryDate;
      if (lastVoucherDate) {
        const formattedDate = new Date(lastVoucherDate)
          .toISOString()
          .split("T")[0];
        setLastUpdatedVoucherDate(formattedDate);
      }

      toast.success("Vouchers Submitted Successfully!");
      setIsCloudLoading(false);
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error Submitting Data To Cloud!");
      setIsCloudLoading(false);
    }
  };


  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return;
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 pt-4 items-center ">
            <div>
              <label htmlFor="startDate">Start Date:</label>
              <Input
                type="date"
                id="startDate"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="endDate">End Date:</label>
              <Input
                type="date"
                id="endDate"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
            <Button
              className="mt-5"
              onClick={handleFetchSalesEntries}
              disabled={isSalesLoading}
            >
              Fetch Sales Entries
            </Button>
            {/* <Button
              className="mt-5"
              onClick={handleFetchPurchaseEntries}
              disabled={isSalesLoading}
            >
              Fetch Purchase Entries
            </Button> */}
            <div className="flex items-center gap-2 mt-5">
              <Button
                onClick={handleSubmitToCloud}
                disabled={isCloudLoading || selectedEntries.length === 0}
              >
                Submit to Cloud
              </Button>
              {selectedEntries.length > 0 && (
                <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                  🧾 {selectedEntries.length} selected
                </span>
              )}
            </div>
            <Button
              className="mt-5"
              onClick={handleExportToExcel}
              disabled={selectedEntries.length === 0}
            >
              Export to Excel
            </Button>
          </div>
        </CardContent>
      </Card>
      {vouchers?.length > 0 && (
        <VoucherList
          vouchers={vouchers}
          onSelect={setSelectedEntries}
          selectedEntries={selectedEntries}
        />
      )}
      {selectedEntries.length > 0 && (
        <div className="text-center mt-4">
          <span className="inline-block text-sm text-muted-foreground bg-green-100 text-green-800 px-3 py-1 rounded-full">
            🧾 {selectedEntries.length} voucher
            {selectedEntries.length > 1 ? "s" : ""} selected
          </span>
        </div>
      )}
    </>
  );
};

export default VoucherForm;
