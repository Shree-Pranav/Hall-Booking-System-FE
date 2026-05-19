import axios from "axios";

export type ApiErrorBody = {
  detail?: string;
  error_type?: string;
  errors?: Array<{
    field: string;
    message: string;
    type: string;
  }>;
};

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return "Something went wrong. Please try again.";
  }

  const body = error.response?.data;
  const validationMessage = body?.errors
    ?.map((item) => `${item.field}: ${item.message}`)
    .join("; ");

  return (
    validationMessage ||
    body?.detail ||
    error.message ||
    "The auth service returned an error."
  );
}
