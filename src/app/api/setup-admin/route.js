import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";

export const POST = async () => {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: "No authenticated" }),
        { status: 401 }
      );
    }

    // Verificar si ya hay administradores
    const adminCount = await prisma.user.count({
      where: { 
        role: { in: ['ADMIN', 'EDITOR'] }
      }
    });

    if (adminCount > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Admin already exists. Contact existing admin for permissions." 
        }),
        { status: 403 }
      );
    }

    // Si no hay admins, convertir este usuario en admin
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { role: 'ADMIN' }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "You are now an administrator!",
        user: {
          email: updatedUser.email,
          role: updatedUser.role
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error setting up admin:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};
