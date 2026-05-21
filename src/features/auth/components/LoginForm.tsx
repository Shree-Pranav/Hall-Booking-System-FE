import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext";
import { login } from "../services/authService";

interface LoginFormProps {
  onError: (error: string | null) => void;
  onShowRegister?: () => void;
}

export function LoginForm({ onError, onShowRegister }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { login: setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();

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
      // navigate to root which will redirect based on role
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const detail = axios.isAxiosError<{ detail?: string }>(error)
        ? error.response?.data?.detail
        : null;
      onError(detail || "Login failed");
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
          Success: {successMessage}
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
      {onShowRegister ? (
        <div className="auth-switch">
          <span>New to hall booking?</span>
          <Button type="button" variant="secondary" onClick={onShowRegister}>
            Sign up
          </Button>
        </div>
      ) : null}
    </form>
  );
}
