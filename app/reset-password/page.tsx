"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(
        "No fue posible cambiar la contraseña. Solicita un nuevo enlace de recuperación."
      );
      setLoading(false);
      return;
    }

    setMessage("Contraseña actualizada correctamente.");

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f2ed",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#ffffff",
          border: "1px solid #e6ded5",
          borderRadius: "24px",
          padding: "38px 28px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img
            src="/logo.png"
            alt="Grand Jeté Academia de Danza"
            style={{
              width: "210px",
              maxWidth: "80%",
              height: "auto",
              marginBottom: "18px",
            }}
          />

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "25px",
              fontWeight: 700,
            }}
          >
            Nueva contraseña
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6f6a65",
              fontSize: "14px",
            }}
          >
            Elige una nueva contraseña para tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#6f6a65",
              fontSize: "14px",
            }}
          >
            Nueva contraseña
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            style={{
              boxSizing: "border-box",
              width: "100%",
              height: "44px",
              border: "1px solid #ded6ce",
              borderRadius: "11px",
              padding: "0 12px",
              fontSize: "16px",
              marginBottom: "16px",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#6f6a65",
              fontSize: "14px",
            }}
          >
            Confirmar contraseña
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            style={{
              boxSizing: "border-box",
              width: "100%",
              height: "44px",
              border: "1px solid #ded6ce",
              borderRadius: "11px",
              padding: "0 12px",
              fontSize: "16px",
              marginBottom: "14px",
            }}
          />

          {message && (
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.4,
                margin: "4px 0 14px",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "42px",
              border: 0,
              borderRadius: "11px",
              background: "#24211f",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}
