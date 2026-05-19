import { FormEvent, useEffect, useState } from "react";
import { LogIn } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext";
import { login } from "../services/authService";

interface LoginFormProps {
  onError: (error: string | null) => void;
}

export function LoginForm({ onError }: LoginFormProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { login: setAuthenticatedUser } = useAuth();

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
      const response = await login({ username, password });
      setAuthenticatedUser(response.user);
      setSuccessMessage(`${response.user.name} logged in successfully`);
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
