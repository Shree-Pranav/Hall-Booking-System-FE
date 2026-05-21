import { FormEvent, useState, useEffect } from "react";
import axios from "axios";
import { UserPlus } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { createUser } from "../services/authService";

interface RegisterFormProps {
  onError: (error: string | null) => void;
  onShowLogin?: () => void;
}

export function RegisterForm({ onError, onShowLogin }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    onError(null);

    try {
      await createUser({ name, password });
      setSuccessMessage("User registered successfully");
      setPassword("");
      setName("");
    } catch (error: unknown) {
      const detail = axios.isAxiosError<{ detail?: string }>(error)
        ? error.response?.data?.detail
        : null;
      onError(detail || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="panel form-stack" onSubmit={handleSubmit}>
      <div className="panel__header">
        <div>
          <h2>Register</h2>
        </div>
      </div>

      {successMessage ? (
        <div className="success" role="status">
          Success: {successMessage}
        </div>
      ) : null}

      <Input
        label="Name"
        name="register-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        minLength={2}
        maxLength={100}
        required
      />
      <Input
        label="Password"
        name="register-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        maxLength={72}
        required
      />
      <Button
        type="submit"
        icon={isLoading ? <LoadingSpinner /> : <UserPlus size={16} />}
        disabled={isLoading}
      >
        Create account
      </Button>
      {onShowLogin ? (
        <div className="auth-switch">
          <span>Already have an account?</span>
          <Button type="button" variant="secondary" onClick={onShowLogin}>
            Back to login
          </Button>
        </div>
      ) : null}
    </form>
  );
}
