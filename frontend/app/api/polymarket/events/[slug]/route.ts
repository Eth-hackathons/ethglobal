import { NextRequest, NextResponse } from "next/server";

export async function GET(
  nextRequest: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // Proxy the request to Polymarket API
    const response = await fetch(
      `https://gamma-api.polymarket.com/events/slug/${slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch event: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: "Invalid event data received from Polymarket" },
        { status: 500 }
      );
    }

    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying Polymarket API:", error);
    return NextResponse.json(
      {
        error:
          "Unable to fetch event from Polymarket. Please check the URL and try again.",
      },
      { status: 500 }
    );
  }
}
