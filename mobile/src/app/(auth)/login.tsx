import { useEffect, useState } from "react";
import { AuthFooterLink } from "@/components/AuthFooterLink";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { TextField } from "@/components/TextField";
import { useAuthStore } from "@/store/auth.store";
import { validateEmail, validatePassword } from "@/utils/validation";

interface FieldErrors {
  email: string | null;
  password: string | null;
}

const NO_ERRORS: FieldErrors = { email: null, password: null };

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(NO_ERRORS);

  // Limpia el error del servidor al salir de la pantalla.
  useEffect(() => clearError, [clearError]);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  function handleSubmit(): void {
    const errors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      return;
    }
    void login({ email: email.trim(), password });
  }

  return (
    <AuthLayout
      title="Inicia sesión en GrappleNode"
      footer={
        <AuthFooterLink
          prompt="¿No tienes cuenta?"
          linkLabel="Regístrate"
          href="/register"
        />
      }
    >
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={canSubmit ? handleSubmit : undefined}
      />
      <FormError message={error} />
      <Button
        title="Iniciar Sesión"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={isLoading}
      />
    </AuthLayout>
  );
}
