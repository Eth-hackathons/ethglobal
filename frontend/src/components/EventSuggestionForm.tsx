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
import { toast } from "sonner";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useContractWrite } from "@/hooks";
import { CONTRACT_ADDRESSES } from "@/lib";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";
import type { Abi } from "viem";

interface EventSuggestionFormProps {
  communityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const DEFAULT_STAKING_DAYS = 7;
const MIN_STAKING_DAYS = 1;
const MAX_STAKING_DAYS = 90;

export const EventSuggestionForm = ({
  communityId,
  onSuccess,
  onCancel,
}: EventSuggestionFormProps) => {
  const { address, isConnected } = useAccount();
  const [polymarketUrl, setPolymarketUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [polymarketMarketId, setPolymarketMarketId] = useState("");
  const [stakingDays, setStakingDays] = useState(
    DEFAULT_STAKING_DAYS.toString()
  );

  const [isFetchingEvent, setIsFetchingEvent] = useState(false);
  const [eventFetched, setEventFetched] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);

  const [urlError, setUrlError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [stakingDaysError, setStakingDaysError] = useState<string | null>(null);

  // Contract write hook
  const {
    write,
    hash: txHash,
    isLoading: isPending,
    error: writeError,
    canWrite,
    reset,
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.PredictionHub,
    abi: PredictionHubABI as Abi,
    functionName: "createMarket",
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

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

    // Validate staking days
    const days = parseInt(stakingDays, 10);
    if (!stakingDays.trim() || isNaN(days)) {
      setStakingDaysError("Staking deadline days is required");
      isValid = false;
    } else if (days < MIN_STAKING_DAYS) {
      setStakingDaysError(`Must be at least ${MIN_STAKING_DAYS} day`);
      isValid = false;
    } else if (days > MAX_STAKING_DAYS) {
      setStakingDaysError(`Must be at most ${MAX_STAKING_DAYS} days`);
      isValid = false;
    } else {
      setStakingDaysError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!canWrite) {
      toast.error("Wallet client not available");
      return;
    }

    setHasShownSuccess(false);
    setHasShownError(false);

    try {
      // Convert communityId to number
      const communityIdNum = parseInt(communityId, 10);
      if (isNaN(communityIdNum)) {
        toast.error("Invalid community ID");
        return;
      }

      // Calculate staking deadline (current timestamp + days in seconds)
      const days = parseInt(stakingDays, 10);
      const stakingDeadline = BigInt(
        Math.floor(Date.now() / 1000) + days * 24 * 60 * 60
      );

      // Create metadata JSON string (only title and polymarketUrl)
      const metadata = JSON.stringify({
        title: title.trim(),
        polymarketUrl: polymarketUrl.trim(),
      });

      toast.loading("Creating market...", { id: "create-market" });

      // Call createMarket contract function
      write?.({
        args: [
          BigInt(communityIdNum),
          polymarketMarketId || extractSlugFromUrl(polymarketUrl) || "",
          metadata,
          stakingDeadline,
        ],
      });
    } catch (error: any) {
      console.error("Create market error:", error);
      const errorMsg = error?.message || "Failed to create market";
      toast.error(errorMsg, { id: "create-market" });
      setHasShownError(true);
    }
  };

  // Handle success
  useEffect(() => {
    if (isConfirmed && txHash && !hasShownSuccess) {
      setHasShownSuccess(true);
      toast.success("Market created successfully!", {
        id: "create-market",
      });

      // Reset form
      setPolymarketUrl("");
      setTitle("");
      setDescription("");
      setPolymarketMarketId("");
      setStakingDays(DEFAULT_STAKING_DAYS.toString());
      setEventFetched(false);
      setFetchError(null);
      setUrlError(null);
      setTitleError(null);
      setDescriptionError(null);
      setStakingDaysError(null);
      reset();

      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isConfirmed, txHash, hasShownSuccess, onSuccess, reset]);

  // Handle transaction error
  useEffect(() => {
    if (txError && txHash && !hasShownError) {
      setHasShownError(true);
      toast.error(txError.message || "Transaction failed", {
        id: "create-market",
      });
      reset();
    }
  }, [txError, txHash, hasShownError, reset]);

  // Handle write error
  useEffect(() => {
    if (writeError && !txHash && !hasShownError) {
      setHasShownError(true);
      toast.error(writeError.message || "Failed to create market", {
        id: "create-market",
      });
      reset();
    }
  }, [writeError, txHash, hasShownError, reset]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isLoading = isPending || (!!txHash && (isConfirming || !isConfirmed));

  const isFormValid =
    polymarketUrl.trim() &&
    isValidPolymarketUrl(polymarketUrl) &&
    eventFetched &&
    !fetchError &&
    title.trim() &&
    title.length <= MAX_TITLE_LENGTH &&
    description.trim() &&
    description.length <= MAX_DESCRIPTION_LENGTH &&
    stakingDays.trim() &&
    !isNaN(parseInt(stakingDays, 10)) &&
    parseInt(stakingDays, 10) >= MIN_STAKING_DAYS &&
    parseInt(stakingDays, 10) <= MAX_STAKING_DAYS;

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
            disabled={isLoading}
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
          disabled={isLoading || isFetchingEvent}
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
          disabled={isLoading || isFetchingEvent}
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

      {/* Staking Deadline Field */}
      <div className="space-y-2">
        <Label htmlFor="staking-days">
          Staking Deadline (Days) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="staking-days"
          type="number"
          placeholder={`${DEFAULT_STAKING_DAYS} days`}
          value={stakingDays}
          onChange={(e) => {
            setStakingDays(e.target.value);
            setStakingDaysError(null);
          }}
          min={MIN_STAKING_DAYS}
          max={MAX_STAKING_DAYS}
          className={stakingDaysError ? "border-destructive" : ""}
          disabled={isLoading || isFetchingEvent}
        />
        {stakingDaysError && (
          <p className="text-sm text-destructive">{stakingDaysError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Number of days until the staking deadline (between {MIN_STAKING_DAYS}{" "}
          and {MAX_STAKING_DAYS} days)
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isLoading || isFetchingEvent || !canWrite}
          className="gradient-primary shadow-glow"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isConfirming ? "Confirming..." : "Creating market..."}
            </>
          ) : (
            "Create Market"
          )}
        </Button>
      </div>
    </form>
  );
};
