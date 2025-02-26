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
        .sort((a:_Voucher, b:_Voucher) => {
          const invoiceA = Number(a.InvoiceNo) || 0;
          const invoiceB = Number(b.InvoiceNo) || 0;

          if (invoiceA !== invoiceB) {
            return invoiceA - invoiceB;
          }

          const dateA = new Date(a.SaleEntryDate).getTime() || 0;
          const dateB = new Date(b.SaleEntryDate).getTime() || 0;

          return dateB - dateA;
        });


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
         `${type.toUpperCase()} server responded with status ${response.status}`
       );
     }
     toast.success(`${type.toUpperCase()} vouchers submitted successfully!`);
   } catch (error) {
     console.error(`Error submitting ${type} data:`, error);
     toast.error(`Error Submitting ${type.toUpperCase()} Data To Cloud!`);
   }
 };

 const handleSubmitToCloud = async () => {
   try {
     setIsCloudLoading(true);
     const vouchersPerRequest = 50;
     const currentDate = new Date().toISOString().split("T")[0];
     setSubmissionDate(currentDate);

    const firstSelectedVoucher =
      vouchers.find((v) => v.InvoiceNo === selectedEntries[0]) ?? null;
    const lastSelectedVoucher =
      vouchers.find(
        (v) => v.InvoiceNo === selectedEntries[selectedEntries.length - 1]
      ) ?? null;

    // Validate voucher existence
    if (!firstSelectedVoucher || !lastSelectedVoucher) {
      toast.error("Selected vouchers not found!");
      setIsCloudLoading(false);
      return;
    }

     const rangeKey = `${dateRange.start}-${dateRange.end}`;

     for (let i = 0; i < selectedEntries.length; i += vouchersPerRequest) {
       const dataForPurchase:DataForPurchase = [];
       const dataForSales:DataForSales = [];

       selectedEntries.slice(i, i + vouchersPerRequest).forEach((invoiceNo) => {
         const voucher = vouchers?.find((v) => v.InvoiceNo === invoiceNo);
          if (!voucher) {
            console.warn(`⚠️ Voucher with InvoiceNo ${invoiceNo} not found!`);
            return;
          }
         if (
           pushedVoucherRanges[rangeKey] &&
           (voucher.InvoiceNo === pushedVoucherRanges[rangeKey].startVoucher ||
             voucher.InvoiceNo === pushedVoucherRanges[rangeKey].endVoucher)
         ) {
           toast.error(`Voucher ${voucher.InvoiceNo} already pushed!`);
           return undefined;
         }

         dataForPurchase.push({
           branchName: "AirIQ Nepal",
           vouchertype: "Purchase",
           voucherno: `AQNP/${voucher.InvoiceNo}`,
           voucherdate: voucher.SaleEntryDate.split("T")[0].replace(/-/g, "/"),
           narration: `${voucher.Prefix}-${voucher.SaleID}, PNR :- ${voucher.Pnr}, PAX :- ${voucher.pax}`,
           ledgerAllocation: [
             {
               lineno: 1,
               ledgerName: "Air IQ",
               ledgerAddress: `Sevoke Road, Siliguri, West Bengal - 734001`,
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

         dataForSales.push({
           branchName: "AirIQ Nepal",
           vouchertype: "Sales",
           voucherno: `AQNS/${voucher.InvoiceNo}`,
           voucherdate: voucher.SaleEntryDate.split("T")[0].replace(/-/g, "/"),
           narration: `${voucher.Prefix}-${voucher.SaleID}, PNR :- ${voucher.Pnr}, PAX :- ${voucher.pax}, AIRLINE_CODE :- ${voucher.AirlineCode}, SECTOR :- ${voucher.FromSector} ${voucher.ToSectors}`,
           ledgerAllocation: [
             {
               lineno: 1,
               ledgerName: voucher.AccountName,
               ledgerAddress: `${voucher.Add1}, ${voucher.Add2}, ${voucher.CityName} - ${voucher.Pin}`,
               amount: (voucher.FinalRate * voucher.pax).toFixed(2),
               drCr: "dr",
               description: [],
             },
             {
               lineno: 2,
               ledgerName: "Domestic Base Fare",
               amount: (voucher.FinalRate * voucher.pax).toFixed(2),
               drCr: "cr",
               description: [
                 `${voucher.AirlineCode}`,
                 "Sector",
                 `${voucher.FromSector} ${voucher.ToSectors}`,
               ],
             },
           ],
         });
       });

        if (dataForPurchase.some((voucher) => voucher === undefined)) {
          toast.error(`Some selected vouchers are already pushed!`);
          throw new Error(`DataForCloud contains undefined vouchers!`);
        }
        if (dataForSales.some((voucher) => voucher === undefined)) {
          toast.error(`Some selected vouchers are already pushed!`);
          throw new Error(`DataForCloud contains undefined vouchers!`);
        }
        console.log("dataForPurchase", dataForPurchase);
        console.log("dataForSales", dataForSales);
       await submitVouchers(dataForPurchase, "purchase");
       await submitVouchers(dataForSales, "sale");
     }
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
            <Button
              className="mt-5"
              onClick={handleSubmitToCloud}
              disabled={isCloudLoading}
            >
              Submit to Cloud
            </Button>
            <Button className="mt-5" onClick={handleExportToExcel}>
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
    </>
  );
};

export default VoucherForm;
