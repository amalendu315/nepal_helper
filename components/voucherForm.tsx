"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import VoucherList from "./voucherList";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import toast from "react-hot-toast";
import { _Voucher } from "@/constants";
import VoucherContext from "@/context/VoucherContext";

const VoucherForm = () => {
  const [isMounted, setIsMounted] = useState(false)
  const { setLastUpdatedVoucherDate, setSubmissionDate } =
    React.useContext(VoucherContext);
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
        const nepalVouchers = data.data.filter(
          (voucher: _Voucher) => voucher.Country === "Nepal"
        ); // Filter vouchers
        console.log('nepalVouchers', nepalVouchers)
        if (nepalVouchers.length > 0) {
          setVouchers(nepalVouchers);
          toast.success("Fetched Data For Selected Range!");
        } else {
          toast.error(`No Nepal vouchers found from ${dateRange.start} to ${dateRange.end}!`);
        }
      }
      // console.log('data', data?.data)

      setIsSalesLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error Fetching The Data :(");
      setIsSalesLoading(false);
    }
  };

  const handleSubmitToCloud = async () => {
    try {
      setIsCloudLoading(true);
      const vouchersPerRequest = 50;
      const currentDate = new Date().toISOString().split("T")[0];
      setSubmissionDate(currentDate);
      for (let i = 0; i < selectedEntries.length; i += vouchersPerRequest) {
       const dataForCloud = selectedEntries
         .slice(i, i + vouchersPerRequest)
         .flatMap((index) => {
           // Use flatMap to create two entries per voucher
           const voucher = vouchers[index];
           return [
             {
               branchName: "AirIQ",
               vouchertype: "Purchase", // First entry with Purchase type
               voucherno: `${voucher.FinPrefix}/${voucher.InvoiceNo}`,
               voucherdate: voucher.SaleEntryDate.split("T")[0].replace(
                 /-/g,
                 "/"
               ),
               narration: `${voucher.Prefix}-${voucher.SaleID}, PNR :- ${voucher.Pnr}, PAX :- ${voucher.pax}`,
               ledgerAllocation: [
                 {
                   lineno: 1,
                   ledgerName: "Air IQ",
                   ledgerAddress: `Sevoke Road, Siliguri, West Bengal - 734001`,
                   amount: voucher.FinalRate.toFixed(2),
                   drCr: "dr",
                 },
                 {
                   lineno: 2,
                   ledgerName: "Domestic Base Fare",
                   amount: voucher.FinalRate.toFixed(2),
                   drCr: "cr",
                 },
               ],
             },
             {
               branchName: "AirIQ",
               vouchertype: "Sales", // Second entry with Sales type
               voucherno: `${voucher.FinPrefix}/${voucher.InvoiceNo}`,
               voucherdate: voucher.SaleEntryDate.split("T")[0].replace(
                 /-/g,
                 "/"
               ),
               narration: `${voucher.Prefix}-${voucher.SaleID}, PNR :- ${voucher.Pnr}, PAX :- ${voucher.pax}`,
               ledgerAllocation: [
                 {
                   lineno: 1,
                   ledgerName: voucher.AccountName,
                   ledgerAddress: `${voucher.Add1}, ${voucher.Add2}, ${voucher.CityName} - ${voucher.Pin}`,
                   amount: voucher.FinalRate.toFixed(2),
                   drCr: "dr",
                 },
                 {
                   lineno: 2,
                   ledgerName: "Domestic Base Fare",
                   amount: voucher.FinalRate.toFixed(2),
                   drCr: "cr",
                 },
               ],
             },
           ];
         });

        const response = await fetch("/api/cloud", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: dataForCloud }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Cloud server error:", response.status, errorText);
          throw new Error(
            `Cloud server responded with status ${response.status}`
          );
        } else {
          if (i !== 0) {
            toast.success(`${i} Vouchers Pushed!`);
          }
        }
      }


      const lastVoucher = vouchers[vouchers.length - 1];
      const lastVoucherDate = lastVoucher?.InvoiceEntryDate;
      if (lastVoucherDate) {
        const formattedDate = new Date(lastVoucherDate)
          .toISOString()
          .split("T")[0];
        setLastUpdatedVoucherDate(formattedDate); // Update the context value
      }

      toast.success("Vouchers Submitted Successfully!");
      setIsCloudLoading(false);
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error Submitting Data To Cloud!");
      setIsCloudLoading(false);
    }
  };

  useEffect(()=>{
    setIsMounted(true);
  },[])

  if(!isMounted){
    return;
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 pt-4 items-center ">
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
