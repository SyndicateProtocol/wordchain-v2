// Two very important environment variables to set that you MUST set in Vercel:
// - SYNDICATE_FRAME_API_KEY: The API key that you received for frame.syndicate.io.
// DM @Will on Farcaster/@WillPapper on Twitter to get an API key.
import { NextRequest } from "next/server";

const baseUrl = 'https://wordchain-rust.vercel.app/'

export async function GET(req: NextRequest) {
  // If the request is not a POST, we know that we're not dealing with a
  // Farcaster Frame button click. Therefore, we should send the Farcaster Frame
  // content
  return new Response(`<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <meta property="og:title" content="Build words with us" />
      <meta
        property="og:image"
        content="${baseUrl}/logo.png"
      />
      <meta property="fc:frame" content="vNext" />
      <meta
        property="fc:frame:image"
        content="${baseUrl}/logo.png"
      />
      <meta property="fc:frame:input:text" content="Choose wisely"/>
      <meta property="fc:frame:button:1" content="Write word" />
      <meta
        name="fc:frame:post_url"
        content="${baseUrl}/api"
      />
    </head>
    <div>
      <h1>✺🚧 ~w o r d c h a i n~ 🚧✺</h1>
    </div>
  </html>`, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  })
}

export async function POST(req: NextRequest) {
  try {
      const body = await req.json();
      console.log("Received POST request from Farcaster Frame button click");
      console.log("Farcaster Frame request body:", body);
      console.log("Farcaster Frame trusted data:", body.trustedData);
      console.log(
        "Farcaster Frame trusted data messageBytes:",
        body.trustedData.messageBytes
      );

      // Once your contract is registered, you can mint an NFT using the following code
      const syndicateRes = await fetch("https://staging-frame.syndicate.io/api/v2/sendTransaction", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + process.env.SYNDICATE_FRAME_API_KEY,
        },
        body: JSON.stringify({
          frameTrustedData: body.trustedData.messageBytes,
          contractAddress: '0xe20852fc222ef9b5896414c199fcb921144de3d8',
          functionSignature: 'mint(address to, string message)',
          args: {
            to: "{frame-user}",
            message: body.untrustedData.inputText
          },
        }),
      });

      console.log("Syndicate response:", syndicateRes);
      if (!syndicateRes.ok) {
        console.log("Syndicate response not ok");
        const reason = await syndicateRes.text();
        console.log("Syndicate error reason:", reason);
        throw new Error("Syndicate response not ok");
      }
      const json = await syndicateRes.json();
      console.log("Syndicate response JSON:", json);
      
      console.log("Sending confirmation as Farcaster Frame response");

      return new Response(`<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width" />
            <meta property="og:title" content="wordchain" />
            <meta
              property="og:image"
              content="${baseUrl}/goodjob.png"
            />
            <meta property="fc:frame" content="vNext" />
            <meta
              property="fc:frame:image"
              content="${baseUrl}/goodjob.png"
            />
            <meta
              property="fc:frame:button:1"
              content="You made some words"
            />
          </head>
        </html>`, {
        status: 200,
        headers: { "Content-Type": "text/html" },
      })
    } catch (error) {
      return new Response('🚫🚫🚫', {status: 500})
    }
}
