"use server"

import { headers } from "next/headers"
import { signInWithDiscord } from "@/app/actions/auth"

export async function handleDiscordAuth(): Promise<void> {
  const headersList = await headers()
  const origin = headersList.get("origin") || headersList.get("host")
  const baseUrl = origin
    ? (origin.startsWith("http") ? origin : origin.includes("localhost") ? `http://${origin}` : `https://${origin}`)
    : "http://localhost:3000"

  await signInWithDiscord(baseUrl)
}
