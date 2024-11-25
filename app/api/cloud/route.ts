import axios from "axios";
import { NextResponse } from "next/server";

import { cloudURL, cloudAuthToken } from "@/constants/index";


interface ResponseType {
  data: [
    {
      statusmessage:string;
      statuscode:string;
      voucherno:string;
    }
  ];
}

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    // Submit the data to the cloud server using Axios
    const response:ResponseType = await axios.post(
      cloudURL,
      { data: data },
      {
        headers: {
          "Content-Type": "application/json",
          Authtoken: cloudAuthToken,
        },
      }
    );

    return NextResponse.json(response?.data);
  } catch (error) {
    console.error("Error submitting data:", error);
    return NextResponse.json(
      { error: "Failed to submit vouchers" },
      { status: 500 }
    );
  }
}
