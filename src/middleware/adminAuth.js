import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";

export const checkAdminPermission = async () => {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return { 
        authorized: false, 
        error: "No authenticated" 
      };
    }

    // Obtener el usuario de la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, isActive: true }
    });

    if (!user) {
      return { 
        authorized: false, 
        error: "User not found" 
      };
    }

    if (!user.isActive) {
      return { 
        authorized: false, 
        error: "User account is inactive" 
      };
    }

    // Verificar si el usuario tiene permisos de admin o editor
    const hasPermission = user.role === 'ADMIN' || user.role === 'EDITOR';

    if (!hasPermission) {
      return { 
        authorized: false, 
        error: "Insufficient permissions" 
      };
    }

    return { 
      authorized: true, 
      user: { 
        email: session.user.email, 
        role: user.role 
      } 
    };

  } catch (error) {
    console.error("Error checking admin permission:", error);
    return { 
      authorized: false, 
      error: "Internal server error" 
    };
  }
};

export const requireAdmin = async () => {
  const authResult = await checkAdminPermission();
  
  if (!authResult.authorized) {
    throw new Error(authResult.error);
  }

  return authResult.user;
};
