'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import Link from 'next/link'

interface AuthFlowProps {
    buttonText?: string
    buttonColor?: string
    redirectUrl?: string
    showUserProfile?: boolean
    theme?: "light" | "dark"
}

export default function AuthFlow(props: AuthFlowProps): ReactNode {
    const {
        buttonText = "Sign In",
        buttonColor = "#0099ff",
        redirectUrl = "/dashboard",
        showUserProfile = true,
        theme = "light",
    } = props

    const { user, error, isLoading } = useUser()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center h-full w-full ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
            }`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"/>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center h-full w-full p-4 ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
            }`}>
                <p className="text-red-500">Error: {error.message}</p>
            </div>
        )
    }

    if (user && showUserProfile) {
        return (
            <div className={`flex flex-col space-y-4 p-4 rounded-lg ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
            }`}>
                <div className="flex items-center space-x-4">
                    {user.picture && (
                        <Image 
                            src={user.picture}
                            alt={user.name || "User"}
                            width={48}
                            height={48}
                            className="rounded-full"
                        />
                    )}
                    <div>
                        <h2 className="font-semibold">{user.name}</h2>
                        <p className="text-sm opacity-70">{user.email}</p>
                    </div>
                </div>
                <Link 
                    href="/api/auth/logout"
                    className="w-full"
                >
                    <Button 
                        className="w-full"
                        style={{ backgroundColor: buttonColor }}
                    >
                        Sign Out
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className={`flex items-center justify-center p-4 ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-50"
        }`}>
            <Link 
                href={`/api/auth/login?returnTo=${redirectUrl}`}
                className="w-full"
            >
                <Button 
                    className="w-full"
                    style={{ backgroundColor: buttonColor }}
                >
                    {buttonText}
                </Button>
            </Link>
        </div>
    )
}