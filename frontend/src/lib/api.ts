/**
 * API service functions for backend communication
 */

export interface EventSuggestionData {
  communityId: string;
  title: string;
  description: string;
  polymarketMarketId: string;
  polymarketUrl: string;
}

export interface EventSuggestionResponse {
  id: string;
  communityId: string;
  title: string;
  description: string;
  polymarketMarketId: string;
  polymarketUrl: string;
  createdAt: string;
}

/**
 * Submit event suggestion to backend
 * @param data - Event suggestion data
 * @returns Created event data
 */
export async function submitEventSuggestion(
  data: EventSuggestionData
): Promise<EventSuggestionResponse> {
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to submit event: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to submit event suggestion. Please try again.");
  }
}
