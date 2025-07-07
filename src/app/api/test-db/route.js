import prisma from "@/utils/connect";

export const GET = async () => {
  try {
    // Intentar conectar y contar usuarios
    const userCount = await prisma.user.count();
    
    return new Response(
      JSON.stringify({ 
        status: "success", 
        message: "Database connection successful",
        userCount: userCount,
        timestamp: new Date().toISOString()
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Database connection error:", error);
    
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: error.message,
        code: error.code,
        name: error.name
      }),
      { status: 500 }
    );
  }
};
