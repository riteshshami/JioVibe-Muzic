"use client";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
//@ts-ignore
import { Users, Radio, Headphones } from "lucide-react"
import { Appbar } from "./components/Appbar"
import useRedirect from "./hooks/useRedirect"

export default function LandingPage() {
  useRedirect();

  return (
<div className="flex flex-col min-h-screen bg-background dark">
      <Appbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-primary-foreground text-white">
                  JioVibe Music: Let Your Fans Choose the Beat
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Empower your audience to curate your music stream. Connect with fans like never before.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-center mb-8 text-secondary-foreground">Key Features</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold text-secondary-foreground">Fan Interaction</h3>
                <p className="text-secondary-foreground/80">Let fans choose the music.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Radio className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold text-secondary-foreground">Live Streaming</h3>
                <p className="text-secondary-foreground/80">Stream with real-time input.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Headphones className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold text-secondary-foreground">High-Quality Audio</h3>
                <p className="text-secondary-foreground/80">Crystal clear sound quality.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border bg-background">
        <p className="text-xs text-muted-foreground">© 2023 JioVibe Music. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
