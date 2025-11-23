"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useContractWrite, useContractRead } from "@/hooks";
import { CONTRACT_ADDRESSES } from "@/lib";
import PredictionHubABI from "@/lib/abis/PredictionHub.json";
import { useAccount } from "wagmi";
import type { Abi } from "viem";

interface CreateCommunityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;

export const CreateCommunityForm = ({
  onSuccess,
  onCancel,
}: CreateCommunityFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const { address } = useAccount();

  // Check if user is registered creator
  const { data: isCreator } = useContractRead({
    address: CONTRACT_ADDRESSES.PredictionHub,
    abi: PredictionHubABI as Abi,
    functionName: "isCreator",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Register creator hook
  const {
    write: registerCreator,
    isLoading: isRegisteringLoading,
    isConfirmed: isRegistered,
    error: registerError,
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.PredictionHub,
    abi: PredictionHubABI as Abi,
    functionName: "registerCreator",
  });

  // Create community hook
  const { write, isLoading, isConfirmed, error, canWrite, reset } =
    useContractWrite({
      address: CONTRACT_ADDRESSES.PredictionHub,
      abi: PredictionHubABI as Abi,
      functionName: "createCommunity",
    });

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError("Community name is required");
      isValid = false;
    } else if (name.length > MAX_NAME_LENGTH) {
      setNameError(`Name must be ${MAX_NAME_LENGTH} characters or less`);
      isValid = false;
    } else {
      setNameError(null);
    }

    // Validate description (optional)
    if (description.length > MAX_DESCRIPTION_LENGTH) {
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

    if (!canWrite) {
      toast.error("Please connect your wallet");
      return;
    }

    setHasShownSuccess(false);
    setHasShownError(false);

    // If not registered, register first
    if (!isCreator) {
      setIsRegistering(true);
      registerCreator?.({
        args: ["Creator", ""],
      });
      return;
    }

    // Create community directly
    write?.({
      args: [name.trim(), description.trim() || "", ""],
    });
  };

  // Auto-create community after successful registration
  if (isRegistered && isRegistering && !isRegisteringLoading && name) {
    setIsRegistering(false);
    setTimeout(() => {
      write?.({
        args: [name.trim(), description.trim() || "", ""],
      });
    }, 100);
  }

  // Handle registration errors
  if (registerError && !isRegisteringLoading && !hasShownError) {
    setHasShownError(true);
    setIsRegistering(false);
    toast.error(registerError.message || "Failed to register as creator");
  }

  // Handle community creation success
  if (isConfirmed && !hasShownSuccess && name && !isRegistering) {
    setHasShownSuccess(true);
    toast.success("Community created successfully!");
    setName("");
    setDescription("");
    setNameError(null);
    setDescriptionError(null);
    reset();
    if (onSuccess) {
      onSuccess();
    }
  }

  // Handle community creation errors
  if (error && !isLoading && !hasShownError && !isRegistering) {
    setHasShownError(true);
    const errorMessage = error.message || "Failed to create community";
    if (errorMessage.includes("not a registered creator")) {
      // Retry with registration
      setIsRegistering(true);
      registerCreator?.({
        args: ["Creator", ""],
      });
    } else {
      toast.error(errorMessage);
      reset();
    }
  }

  const isLoadingAny = isLoading || isRegisteringLoading || isRegistering;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isFormValid =
    name.trim() &&
    name.length <= MAX_NAME_LENGTH &&
    description.length <= MAX_DESCRIPTION_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="community-name">
          Community Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="community-name"
          type="text"
          placeholder="Enter community name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(null);
          }}
          maxLength={MAX_NAME_LENGTH}
          className={nameError ? "border-destructive" : ""}
          disabled={isLoadingAny}
        />
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {nameError && (
              <p className="text-sm text-destructive">{nameError}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {name.length}/{MAX_NAME_LENGTH}
          </p>
        </div>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="community-description">Description</Label>
        <Textarea
          id="community-description"
          placeholder="Enter a brief description (optional)"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setDescriptionError(null);
          }}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={4}
          className={descriptionError ? "border-destructive" : ""}
          disabled={isLoadingAny}
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
          disabled={isLoadingAny}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isLoadingAny || !canWrite}
          className="gradient-primary shadow-glow"
        >
          {isLoadingAny ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isRegistering ? "Registering..." : "Creating community..."}
            </>
          ) : (
            "Create Community"
          )}
        </Button>
      </div>
    </form>
  );
};
