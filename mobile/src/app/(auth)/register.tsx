import { useEffect, useState } from "react";
import { AuthFooterLink } from "@/components/AuthFooterLink";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { TextField } from "@/components/TextField";
import { useAuthStore } from "@/store/auth.store";
import { validateEmail, validateName, validatePassword } from "@/utils/validation";

interface FieldErrors {
  name: string | null;
  email: string | null;
  password: string | null;
}

const NO_ERRORS: FieldErrors = { name: null, email: null, password: null };

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(NO_ERRORS);

  // Limpia el error del servidor al salir de la pantalla.
  useEffect(() => clearError, [clearError]);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length > 0;

  function handleSubmit(): void {
    const errors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    if (errors.name || errors.email || errors.password) {
      return;
    }
    void register({ name: name.trim(), email: email.trim(), password });
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      footer={
        <AuthFooterLink
          prompt="¿Ya tienes cuenta?"
          linkLabel="Inicia sesión"
          href="/login"
        />
      }
    >
      <TextField
        label="Nombre completo"
        value={name}
        onChangeText={setName}
        error={fieldErrors.name}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
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
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={canSubmit ? handleSubmit : undefined}
      />
      <FormError message={error} />
      <Button
        title="Crear cuenta"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={isLoading}
      />
    </AuthLayout>
  );
}
