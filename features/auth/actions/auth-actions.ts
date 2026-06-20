"use server";

import { redirect } from "next/navigation";

import { getRoleLandingPath } from "@/lib/auth/routes";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/supabase/server";

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function authRedirect(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData): Promise<never> {
  const email = formValue(formData, "email");
  const password = formValue(formData, "password");

  if (!isValidEmail(email) || !password) {
    authRedirect("/login", "Enter a valid email and password.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    authRedirect("/login", "Invalid email or password.");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/access-denied?reason=profile");
  }

  redirect(getRoleLandingPath(profile.role));
}

export async function logoutAction(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login?message=You have been logged out.");
}

export async function forgotPasswordAction(formData: FormData): Promise<never> {
  const email = formValue(formData, "email");

  if (!isValidEmail(email)) {
    authRedirect("/forgot-password", "Enter a valid email address.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    authRedirect("/forgot-password", "Password reset could not be started. Try again.");
  }

  authRedirect("/login", "If the account exists, a password reset email has been sent.");
}

export async function resetPasswordAction(formData: FormData): Promise<never> {
  const password = formValue(formData, "password");
  const confirmPassword = formValue(formData, "confirmPassword");

  if (password !== confirmPassword) {
    authRedirect("/reset-password", "Passwords do not match.");
  }

  if (!isValidPassword(password)) {
    authRedirect("/reset-password", "Password must be at least 8 characters and include uppercase, lowercase, and a number.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/session-expired?reason=reset-token");
  }

  authRedirect("/login", "Password updated. You can now log in.");
}
