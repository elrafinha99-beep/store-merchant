"use client"
import { useEffect, useState } from "react"
import { supabase } from "../supabase-client"
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import seed from "../seed/seedData";



export default function Page() {

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    return <>
        <div className="space-y-12">
            <div>
                <p className="text-4xl font-bold text-gray-900">Home Page</p>
            </div>

            <div>
                <p className="text-lg text-gray-600">Welcome, {user?.email}</p>
            </div>

            <div className="pt-8">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Click in the button to generate sample data</h1>
                <Button
                    onClick={() => seed()}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Generate Sample data
                </Button>
            </div>
        </div>
    </>
}