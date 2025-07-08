import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export const useAdminStatus = () => {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (status === "loading") return;
      
      if (!session?.user?.email) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/check-admin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [session, status]);

  return { isAdmin, isLoading };
};
