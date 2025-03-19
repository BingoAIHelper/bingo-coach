"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ConversationsRedirectPage() {
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return null;
  }

  // Redirect to the appropriate conversations page based on role
  if (session?.user?.role === "coach") {
    redirect("/coach/conversations");
  } else {
    redirect("/seeker/conversations");
  }

  return null;
}