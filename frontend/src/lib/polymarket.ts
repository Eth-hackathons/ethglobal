/**
 * Polymarket API utility functions
 */

export interface PolymarketEvent {
  title: string;
  description: string;
  slug: string;
  marketId?: string;
}

/**
 * Extract event slug from Polymarket URL
 * @param url - Polymarket event URL (e.g., "https://polymarket.com/event/event-slug" or "https://polymarket.com/sports/nba/games/week/3/nba-mem-dal-2025-11-22")
 * @returns Event slug or null if URL is invalid
 */
export function extractSlugFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Check if it's a polymarket.com URL
    if (!urlObj.hostname.includes("polymarket.com")) {
      return null;
    }

    // Extract the last segment of the path as the slug
    // This works for any Polymarket URL format
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const lastSegment = pathParts[pathParts.length - 1];
      // Check if it looks like a valid slug (contains alphanumeric characters and hyphens)
      if (lastSegment && /^[a-zA-Z0-9-]+$/.test(lastSegment)) {
        return lastSegment;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validate if URL is a valid Polymarket event URL
 * @param url - URL to validate
 * @returns true if URL is valid Polymarket event URL
 */
export function isValidPolymarketUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check if it's a polymarket.com URL
    if (!urlObj.hostname.includes("polymarket.com")) {
      return false;
    }

    // Check if we can extract a valid slug
    const slug = extractSlugFromUrl(url);
    if (!slug) {
      return false;
    }

    // Accept URLs with /event/ or /sports/ paths (or any valid polymarket.com path)
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch event data from Polymarket API by slug (via Next.js API proxy)
 * @param slug - Event slug from Polymarket URL
 * @returns Event data or throws error
 */
export async function fetchEventBySlug(slug: string): Promise<PolymarketEvent> {
  try {
    // Use Next.js API route as proxy to avoid CORS issues
    const response = await fetch(`/api/polymarket/events/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to fetch event: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data.title || !data.description) {
      throw new Error("Invalid event data received from Polymarket");
    }

    return {
      title: data.title,
      description: data.description,
      slug: slug,
      marketId: data.marketId || data.id || slug,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Unable to fetch event from Polymarket. Please check the URL and try again."
    );
  }
}
