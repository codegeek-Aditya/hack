interface RequestBody {
  phone: string;
  gateway_key: string;
  params: { tag: string; value: string }[];
}

interface VerifyOtpBody {
  otp_id: string;
  otp: string;
}

const getOtp = (len: number, chars: string = "0123456789") =>
  [...Array(len)]
    .map((i) => chars[Math.floor(Math.random() * chars.length)])
    .join("");

async function sendOtp(phone: string): Promise<string | null> {
  try {
    const FAZ_WA_GATEWAY_KEY = process.env.FAZ_WA_GATEWAY_KEY || "";
    const FAZ_BEARER_TOKEN = process.env.FAZ_BEARER_TOKEN || "";
    const data: RequestBody = {
      phone: "91" + phone,
      gateway_key: FAZ_WA_GATEWAY_KEY,
      params: [{ tag: "brand", value: "MedLink" }],
    };
    const response = await fetch("https://api.fazpass.com/v1/otp/request", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FAZ_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Error:", errorData);
      return null;
    }
    const responseData = await response.json();
    console.log(responseData);
    return responseData.data.id;
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}

async function verifyOtp(otpId: string, otp: number): Promise<boolean | null> {
  try {
    const FAZ_WA_GATEWAY_KEY = process.env.FAZ_WA_GATEWAY_KEY || "";
    const FAZ_BEARER_TOKEN = process.env.FAZ_BEARER_TOKEN || "";
    const data: VerifyOtpBody = {
      otp_id: otpId,
      otp: otp.toString(),
    };
    const response = await fetch("https://api.fazpass.com/v1/otp/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FAZ_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log(response);

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Error:", errorData);
      return null;
    }
    const responseData = await response.json();
    return responseData.status;
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}

export { getOtp, sendOtp, verifyOtp };
