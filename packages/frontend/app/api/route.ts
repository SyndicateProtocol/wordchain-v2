import { NextRequest } from "next/server";

const baseUrl = 'https://wordchain-v2.vercel.app/'

export async function GET(req: NextRequest) {
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

interface SyndicateSendTransactionResponse {
  success: boolean
  data: {
    transactionId: string
    userAddress: string
  }
}

const contractAddress = '0xe20852fc222ef9b5896414c199fcb921144de3d8'
const functionSignature = 'mint(address to, string message)'

export async function POST(req: NextRequest) {
  try {
      const body = await req.json();
      // https://frame.syndicate.io/#sendTransaction
      const syndicateRes = await fetch("https://frame.syndicate.io/api/v2/sendTransaction", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // View the docs to get your own API key
          // https://frame.syndicate.io/#createApiKey
          Authorization: "Bearer " + process.env.SYNDICATE_API_KEY,
        },
        body: JSON.stringify({
          contractAddress,
          functionSignature,
          frameTrustedData: body.trustedData.messageBytes,
          args: {
            // {frame-user} will be mapped to the user's address who interacted with the frame
            to: "{frame-user}",
            message: body.untrustedData.inputText
          },
        }),
      });

      if (!syndicateRes.ok) {
        const reason = await syndicateRes.text();
        console.error("Syndicate response not ok:", reason);
        throw new Error("Syndicate response not ok");
      }
      const { data: { transactionId } } = (await syndicateRes.json()) as SyndicateSendTransactionResponse;
      console.log("Syndicate transaction ID:", transactionId);
      
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
