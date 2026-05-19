import { FormEvent, useState, useEffect } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { apiClient } from "../../../lib/axios";

interface RegisterFormProps {
  onError: (error: string | null) => void;
}

export function RegisterForm({ onError }: RegisterFormProps) {
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
      await apiClient.post("/users", { name, password });
      setSuccessMessage("User registered successfully");
      setPassword("");
      setName("");
    } catch (error: any) {
      onError(error.response?.data?.detail || "Registration failed");
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
          ✓ {successMessage}
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
    </form>
  );
}
