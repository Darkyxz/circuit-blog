import { checkAdminPermission } from "@/middleware/adminAuth";

export const GET = async () => {
  try {
    const authResult = await checkAdminPermission();
    
    return new Response(
      JSON.stringify({ 
        isAdmin: authResult.authorized,
        role: authResult.user?.role || null
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking admin status:", error);
    return new Response(
      JSON.stringify({ 
        isAdmin: false,
        error: "Internal server error" 
      }),
      { status: 500 }
    );
  }
};
