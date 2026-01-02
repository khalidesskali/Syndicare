import { useState } from "react";
import { FormModal, type FormField } from "../ui/form-modal";
import { SuccessMessage } from "../ui/success-message";
import { ErrorMessage } from "../ui/error-message";
import type {
  Resident,
  CreateResidentRequest,
  UpdateResidentRequest,
} from "../../types/resident";

interface ResidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateResidentRequest | UpdateResidentRequest
  ) => Promise<void>;
  editingResident?: Resident | null;
  loading?: boolean;
}

export function ResidentsModal({
  isOpen,
  onClose,
  onSubmit,
  editingResident,
  loading = false,
}: ResidentsModalProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formFields: FormField[] = [
    {
      name: "first_name",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "Enter resident's first name",
      validation: (value: string) => {
        if (!value || value.trim() === "") {
          return "First name is required";
        }
        if (value.trim().length < 2) {
          return "First name must be at least 2 characters long";
        }
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          return "First name can only contain letters and spaces";
        }
        return null;
      },
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Enter resident's last name",
      validation: (value: string) => {
        if (!value || value.trim() === "") {
          return "Last name is required";
        }
        if (value.trim().length < 2) {
          return "Last name must be at least 2 characters long";
        }
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          return "Last name can only contain letters and spaces";
        }
        return null;
      },
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "resident@example.com",
      validation: (value: string) => {
        if (!value || value.trim() === "") {
          return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return "Please enter a valid email address";
        }
        return null;
      },
    },
    ...(editingResident
      ? []
      : [
          {
            name: "password",
            label: "Password",
            type: "password" as const,
            required: true,
            placeholder: "Enter password",
            validation: (value: string) => {
              if (!value || value.trim() === "") {
                return "Password is required";
              }
              if (value.length < 8) {
                return "Password must be at least 8 characters long";
              }
              return null;
            },
          },
          {
            name: "password2",
            label: "Confirm Password",
            type: "password" as const,
            required: true,
            placeholder: "Confirm password",
            validation: (value: string, formData?: Record<string, any>) => {
              if (!value || value.trim() === "") {
                return "Please confirm your password";
              }
              if (value !== formData?.password) {
                return "Passwords do not match";
              }
              return null;
            },
          },
        ]),
  ];

  const getInitialData = () => {
    if (editingResident) {
      return {
        first_name: editingResident.first_name || "",
        last_name: editingResident.last_name || "",
        email: editingResident.email,
      };
    }
    return {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password2: "",
    };
  };

  const handleSubmit = async (data: Record<string, any>): Promise<boolean> => {
    try {
      // Clear any existing messages
      setSuccessMessage(null);
      setErrorMessage(null);

      // Validate password confirmation for new residents
      if (!editingResident && data.password !== data.password2) {
        setErrorMessage("Passwords do not match");
        return false;
      }

      // Prepare submission data
      const submissionData: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      };

      // Only include password for new residents (required for creation)
      if (!editingResident) {
        submissionData.password = data.password;
        submissionData.password2 = data.password2;
      }

      if (editingResident) {
        await onSubmit({ id: editingResident.id, ...submissionData });
        setSuccessMessage("Resident updated successfully");
      } else {
        await onSubmit(
          submissionData as CreateResidentRequest | UpdateResidentRequest
        );
        setSuccessMessage("Resident created successfully");
      }
      return true;
    } catch (error: any) {
      console.error("Submit error:", error);

      // Handle different types of errors
      if (error?.response?.data?.message) {
        // Backend error with message
        setErrorMessage(error.response.data.message);
      } else if (error?.response?.data?.errors) {
        // Backend validation errors
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        setErrorMessage(errorMessages);
      } else if (error?.message) {
        // Client-side error
        setErrorMessage(error.message);
      } else {
        // Generic error
        setErrorMessage("An error occurred. Please try again.");
      }
      return false;
    }
  };

  return (
    <>
      {successMessage && (
        <SuccessMessage message={successMessage} duration={5000} />
      )}
      {errorMessage && <ErrorMessage message={errorMessage} duration={5000} />}
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title={editingResident ? "Edit Resident" : "Add New Resident"}
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        loading={loading}
        submitText={editingResident ? "Update" : "Create"}
        size="md"
      />
    </>
  );
}
