"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
//@ts-ignore
import { Music } from "lucide-react"

export function Appbar() {
    const session = useSession();

    return     <div className="bg-slate-600 text-primary-foreground text-white">
    <div className="container mx-auto flex justify-between items-center py-4">
      <div className="text-2xl font-bold">JioVibe</div>
      <div>
        {session.data?.user ? (
          <Button
            variant="default"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => signIn()}
          >
            Sign In
          </Button>
        )}
      </div>
    </div>
  </div>
}
