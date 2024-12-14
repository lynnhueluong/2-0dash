// src/components/framer/AuthFlow.tsx
'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import type { ReactNode } from 'react';

interface AuthFlowProps {
    buttonText?: string;
    buttonColor?: string;
}

export default function AuthFlow(props: AuthFlowProps): ReactNode {
    const { user, isLoading } = useUser();
    
    if (isLoading) return <div>Loading...</div>;

    return (
        <div style={{ padding: "20px" }}>
            {!user ? (
                <button
                    onClick={() => window.location.href = '/api/auth/login'}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "6px",
                        border: "none",
                        background: props.buttonColor || "#0099ff",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    {props.buttonText || "Sign In"}
                </button>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    {user.picture && (
                        <img
                            src={user.picture}
                            alt={user.name || "User"}
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                            }}
                        />
                    )}
                    <h2 style={{ margin: 0 }}>{user.name}</h2>
                    <button
                        onClick={() => window.location.href = '/api/auth/logout'}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            background: "white",
                            cursor: "pointer",
                        }}
                    >
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}