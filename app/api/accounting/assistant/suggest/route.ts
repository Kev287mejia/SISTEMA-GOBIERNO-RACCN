import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AccountAssistant } from "@/lib/ai/account-assistant";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (false && !session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const description = searchParams.get("q");

        if (!description) {
            return NextResponse.json({ suggestion: null });
        }

        const suggestion = await AccountAssistant.suggestAccount(description);

        return NextResponse.json({ suggestion });
    } catch (error) {
        console.error("[ASSISTANT_ERROR]", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
