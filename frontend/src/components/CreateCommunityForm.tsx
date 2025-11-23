"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

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

    setIsSubmitting(true);

    try {
      // Mock API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Community created successfully!");

      // Reset form
      setName("");
      setDescription("");
      setNameError(null);
      setDescriptionError(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create community. Please try again."
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={!isFormValid || isSubmitting}
          className="gradient-primary shadow-glow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating community...
            </>
          ) : (
            "Create Community"
          )}
        </Button>
      </div>
    </form>
  );
};

