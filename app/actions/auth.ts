"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function signInWithDiscord(baseUrl: string) {
  const supabase = await createClient()

  const redirectUrl = baseUrl.includes('localhost')
    ? `http://localhost:3000/auth/callback?next=/dashboard`
    : `${baseUrl}/auth/callback?next=/dashboard`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: redirectUrl
    }
  })

  if (error) {
    redirect('/?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/?error=' + encodeURIComponent(error.message))
  }

  redirect('/dashboard')
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect('/?error=' + encodeURIComponent(error.message))
  }

  redirect('/?message=' + encodeURIComponent('Check your email to confirm your account'))
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/?error=' + encodeURIComponent('Sign out failed. Please close your browser to clear your session.'))
  }

  redirect('/')
}
