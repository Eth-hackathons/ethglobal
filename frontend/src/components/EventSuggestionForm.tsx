"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import {
  extractSlugFromUrl,
  isValidPolymarketUrl,
  fetchEventBySlug,
} from "@/lib/polymarket";
import { submitEventSuggestion } from "@/lib/api";
import { toast } from "sonner";

interface EventSuggestionFormProps {
  communityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

export const EventSuggestionForm = ({
  communityId,
  onSuccess,
  onCancel,
}: EventSuggestionFormProps) => {
  const [polymarketUrl, setPolymarketUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [polymarketMarketId, setPolymarketMarketId] = useState("");

  const [isFetchingEvent, setIsFetchingEvent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventFetched, setEventFetched] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [urlError, setUrlError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // Auto-fetch event data when URL is pasted and valid
  useEffect(() => {
    const fetchEventData = async () => {
      if (!polymarketUrl.trim()) {
        setEventFetched(false);
        setFetchError(null);
        setPolymarketMarketId("");
        return;
      }

      // Validate URL format
      if (!isValidPolymarketUrl(polymarketUrl)) {
        setEventFetched(false);
        setFetchError(null);
        setPolymarketMarketId("");
        return;
      }

      const slug = extractSlugFromUrl(polymarketUrl);
      if (!slug) {
        setEventFetched(false);
        setFetchError(null);
        return;
      }

      setIsFetchingEvent(true);
      setFetchError(null);
      setEventFetched(false);

      try {
        const eventData = await fetchEventBySlug(slug);
        setTitle(eventData.title);
        setDescription(eventData.description);
        setPolymarketMarketId(eventData.marketId || slug);
        setEventFetched(true);
        setFetchError(null);
      } catch (error) {
        setFetchError(
          error instanceof Error
            ? error.message
            : "Unable to fetch event from Polymarket. Please check the URL and try again."
        );
        setEventFetched(false);
        setTitle("");
        setDescription("");
        setPolymarketMarketId("");
      } finally {
        setIsFetchingEvent(false);
      }
    };

    // Debounce the fetch
    const timeoutId = setTimeout(() => {
      fetchEventData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [polymarketUrl]);

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate URL
    if (!polymarketUrl.trim()) {
      setUrlError("Polymarket URL is required");
      isValid = false;
    } else if (!isValidPolymarketUrl(polymarketUrl)) {
      setUrlError("Please enter a valid Polymarket event URL");
      isValid = false;
    } else if (fetchError) {
      setUrlError(
        "Unable to fetch event data. Please check the URL and try again."
      );
      isValid = false;
    } else if (!eventFetched) {
      setUrlError("Please wait for event data to be fetched");
      isValid = false;
    } else {
      setUrlError(null);
    }

    // Validate title
    if (!title.trim()) {
      setTitleError("Event title is required");
      isValid = false;
    } else if (title.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
      isValid = false;
    } else {
      setTitleError(null);
    }

    // Validate description
    if (!description.trim()) {
      setDescriptionError("Event description is required");
      isValid = false;
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError(
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`
      );
      isValid = false;
    } else {
      setDescriptionError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Change to smart contract call
      // await submitEventSuggestion({
      //   communityId,
      //   title: title.trim(),
      //   description: description.trim(),
      //   polymarketMarketId,
      //   polymarketUrl: polymarketUrl.trim(),
      // });

      toast.success("Event suggestion submitted successfully!");

      // Reset form
      setPolymarketUrl("");
      setTitle("");
      setDescription("");
      setPolymarketMarketId("");
      setEventFetched(false);
      setFetchError(null);
      setUrlError(null);
      setTitleError(null);
      setDescriptionError(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit event suggestion. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isFormValid =
    polymarketUrl.trim() &&
    isValidPolymarketUrl(polymarketUrl) &&
    eventFetched &&
    !fetchError &&
    title.trim() &&
    title.length <= MAX_TITLE_LENGTH &&
    description.trim() &&
    description.length <= MAX_DESCRIPTION_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Polymarket URL Field */}
      <div className="space-y-2">
        <Label htmlFor="polymarket-url">
          Polymarket URL <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="polymarket-url"
            type="url"
            placeholder="Paste Polymarket event URL here (e.g., https://polymarket.com/sports/nba/games/week/3/nba-mem-dal-2025-11-22)"
            value={polymarketUrl}
            onChange={(e) => {
              setPolymarketUrl(e.target.value);
              setUrlError(null);
            }}
            className={urlError ? "border-destructive" : ""}
            disabled={isSubmitting}
          />
          {isFetchingEvent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {eventFetched && !isFetchingEvent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
        {isFetchingEvent && (
          <p className="text-sm text-muted-foreground">
            Fetching event data...
          </p>
        )}
        {eventFetched && !isFetchingEvent && !fetchError && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Event found!
          </p>
        )}
        {fetchError && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {fetchError}
          </p>
        )}
        {urlError && <p className="text-sm text-destructive">{urlError}</p>}
      </div>

      {/* Event Title Field */}
      <div className="space-y-2">
        <Label htmlFor="event-title">
          Event Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="event-title"
          type="text"
          placeholder="Event title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleError(null);
          }}
          maxLength={MAX_TITLE_LENGTH}
          className={titleError ? "border-destructive" : ""}
          disabled={isSubmitting || isFetchingEvent}
        />
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {titleError && (
              <p className="text-sm text-destructive">{titleError}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {title.length}/{MAX_TITLE_LENGTH}
          </p>
        </div>
      </div>

      {/* Event Description Field */}
      <div className="space-y-2">
        <Label htmlFor="event-description">
          Event Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="event-description"
          placeholder="Event description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setDescriptionError(null);
          }}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={4}
          className={descriptionError ? "border-destructive" : ""}
          disabled={isSubmitting || isFetchingEvent}
        />
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {descriptionError && (
              <p className="text-sm text-destructive">{descriptionError}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting || isFetchingEvent}
          className="gradient-primary shadow-glow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting event suggestion...
            </>
          ) : (
            "Submit Event Suggestion"
          )}
        </Button>
      </div>
    </form>
  );
};
