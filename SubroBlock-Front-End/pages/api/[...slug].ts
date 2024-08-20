import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

const doesntRequireAccessToken = ["auth", "forgot-password"];

// all client requests are proxied through this endpoint to avoid CORS issues
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  const slug = req.query.slug as string[];
  const needsToken = !doesntRequireAccessToken.includes(slug[0]);

  if (needsToken && !token)
    return res.status(401).json({ error: "Unauthorized" });

  const params = new URLSearchParams(req.url?.split("?")[1]);
  const backendUrl = [
    process.env.API_URL,
    "/",
    slug.join("/"),
    params.toString() && `?${params}`
  ]
    .filter(Boolean)
    .join("");

  // console.log(`Proxying request from ${req.url} to ${backendUrl}`);
  // console.log("access_token", token?.access_token);

  const response = await fetch(backendUrl, {
    method: req.method,
    // @ts-expect-error // TODO find a better way to handle this
    headers: {
      "Content-Type": "application/json",
      Authorization: needsToken ? `Bearer ${token?.access_token}` : undefined
    },
    body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
  });
  // test auth errors, uncomment to force trigger token expired error
  // {
  //   res.status(401).json({
  //     "detail": "Given token not valid for any token type",
  //     "code": "token_not_valid",
  //     "messages": [
  //       {
  //         "token_class": "AccessToken",
  //         "token_type": "access",
  //         "message": "Token is invalid or expired"
  //       }
  //     ]
  //   });
  // }

  try {
    const hasContent = Boolean(parseInt(response.headers.get("content-length") || "0"));
    const isJson = response.headers.get("content-type")?.includes("application/json");
    if (hasContent && isJson) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      res.status(response.status).end();
    }
  } catch (error) {
    if (error instanceof Error)
      res.status(500).json({ error: error.message });
    else
      res.status(500).json({ error: "Unknown server error" });
  }
}
