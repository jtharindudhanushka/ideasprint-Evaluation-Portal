import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    // Verify the caller is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the ID of the user to delete from the search params
    const { searchParams } = new URL(request.url);
    const userIdToDelete = searchParams.get("id");

    if (!userIdToDelete) {
      return NextResponse.json(
        { error: "User ID to delete is required" },
        { status: 400 }
      );
    }

    // Admins cannot delete themselves through this API
    if (user.id === userIdToDelete) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Use admin client to delete the user
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userIdToDelete);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "User account deleted successfully",
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
