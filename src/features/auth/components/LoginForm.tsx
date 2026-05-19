import { FormEvent, useState, useEffect } from "react";
import { LogIn } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { apiClient } from "../../../lib/axios";

interface LoginFormProps {
  onError: (error: string | null) => void;
}

export function LoginForm({ onError }: LoginFormProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
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
      const formData = new URLSearchParams();
      formData.set("username", username);
      formData.set("password", password);

      await apiClient.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const role = username === "admin" ? "Admin" : "User";
      setSuccessMessage(`${role} logged in successfully`);
      localStorage.setItem(
        "user_role",
        username === "admin" ? "admin" : "user",
      );
    } catch (error: any) {
      onError(error.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="panel form-stack" onSubmit={handleSubmit}>
      <div className="panel__header">
        <div>
          <h2>Login</h2>
        </div>
      </div>

      {successMessage ? (
        <div className="success" role="status">
          ✓ {successMessage}
        </div>
      ) : null}

      <Input
        label="Username"
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
      />
      <Button
        type="submit"
        icon={isLoading ? <LoadingSpinner /> : <LogIn size={16} />}
        disabled={isLoading}
      >
        Login
      </Button>
    </form>
  );
}
