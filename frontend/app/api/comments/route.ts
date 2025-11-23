import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MAX_CONTENT_LENGTH = 500;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");
    const communityId = searchParams.get("communityId");

    if (!eventId || !communityId) {
      return NextResponse.json(
        { error: "Both eventId and communityId are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("event_id", eventId)
      .eq("community_id", communityId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const comments = data.map((comment) => ({
      id: comment.id,
      userId: comment.user_id,
      content: comment.content,
      timestamp: new Date(comment.created_at),
    }));

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error in GET /api/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, communityId, userId, content } = body;

    // Validation
    if (!eventId || !communityId || !userId || !content) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: eventId, communityId, userId, and content are required",
        },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content must be a non-empty string" },
        { status: 400 }
      );
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content must be ${MAX_CONTENT_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        event_id: eventId,
        community_id: communityId,
        user_id: userId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    // Transform the response to match the expected format
    const comment = {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      timestamp: new Date(data.created_at),
    };

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
