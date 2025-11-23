import {
  cre,
  ok,
  consensusIdenticalAggregation,
  type Runtime,
  type HTTPSendRequester,
  Runner,
} from "@chainlink/cre-sdk";
import { z } from "zod";

// Config schema
const configSchema = z.object({
  apiUrl: z.string().url(),
  schedule: z.string(),
  marketAddress: z.string(),
  outcome: z.number().int().min(0).max(2), // 0=A, 1=B, 2=Draw
});

type Config = z.infer<typeof configSchema>;

// Data to be sent to the API
type LockMarketRequest = {
  marketAddress: string;
  outcome: number;
};

// Response from the API
type LockMarketResponse = {
  success: boolean;
  txHash: string;
  blockNumber: string;
  status: string;
};

// Response for consensus
type PostResponse = {
  statusCode: number;
  response: LockMarketResponse;
};

const postData = (
  sendRequester: HTTPSendRequester,
  config: Config
): PostResponse => {
  // 1. Prepare the data to be sent
  const dataToSend: LockMarketRequest = {
    marketAddress: config.marketAddress,
    outcome: config.outcome,
  };

  // 2. Serialize the data to JSON and encode as bytes
  const bodyBytes = new TextEncoder().encode(JSON.stringify(dataToSend));

  // 3. Convert to base64 for the request
  const body = Buffer.from(bodyBytes).toString("base64");

  // 4. Construct the POST request with cacheSettings
  const req = {
    url: config.apiUrl,
    method: "POST" as const,
    body,
    headers: {
      "Content-Type": "application/json",
    },
    cacheSettings: {
      readFromCache: true, // Enable reading from cache
      maxAgeMs: 60000, // Accept cached responses up to 60 seconds old
    },
  };

  // 5. Send the request and wait for the response
  const resp = sendRequester.sendRequest(req).result();

  if (!ok(resp)) {
    throw new Error(`HTTP request failed with status: ${resp.statusCode}`);
  }

  // 6. Decode the response body
  let responseData: LockMarketResponse;
  try {
    // Response body is Uint8Array, convert to string
    const bodyBytes = resp.body instanceof Uint8Array 
      ? resp.body 
      : new Uint8Array(Object.values(resp.body));
    const responseBody = new TextDecoder().decode(bodyBytes);
    responseData = JSON.parse(responseBody) as LockMarketResponse;
  } catch (error) {
    // If parsing fails, try to get error details from response
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse response: ${errorMsg}`);
  }

  return {
    statusCode: resp.statusCode,
    response: responseData,
  };
};

const onCronTrigger = (runtime: Runtime<Config>): string => {
  const httpClient = new cre.capabilities.HTTPClient();

  const result = httpClient
    .sendRequest(
      runtime,
      postData,
      consensusIdenticalAggregation<PostResponse>()
    )(runtime.config) // Call with config
    .result();

  if (result.response.success) {
    runtime.log(
      `Successfully locked market. TX: ${result.response.txHash}, Block: ${result.response.blockNumber}`
    );
    return `Market locked successfully. TX: ${result.response.txHash}`;
  } else {
    throw new Error(`Failed to lock market: ${JSON.stringify(result.response)}`);
  }
};

const initWorkflow = (config: Config) => {
  return [
    cre.handler(
      new cre.capabilities.CronCapability().trigger({
        schedule: config.schedule,
      }),
      onCronTrigger
    ),
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>({
    configSchema,
  });
  await runner.run(initWorkflow);
}

main();
