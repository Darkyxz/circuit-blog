"use client";
import Link from "next/link";
import styles from "./authLinks.module.css";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAdminStatus } from "@/hooks/useAdminStatus";

const AuthLinks = () => {
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  const { isAdmin, isLoading } = useAdminStatus();

  const closeMenu = () => setOpen(false);

  const handleSignOut = () => {
    closeMenu();
    signOut();
  };

  return (
    <>
      {status === "unauthenticated" ? (
        <Link href="/login" className={styles.link}>
          Login
        </Link>
      ) : (
        <>
          <Link href="/write" className={styles.link}>
            Write
          </Link>
          {isAdmin && (
            <Link href="/admin" className={styles.link}>
              Admin
            </Link>
          )}
          <span className={styles.link} onClick={signOut}>
            Logout
          </span>
        </>
      )}
      <div className={styles.burger} onClick={() => setOpen(!open)}>
        <div className={`${styles.line} ${open ? styles.line1 : ''}`}></div>
        <div className={`${styles.line} ${open ? styles.line2 : ''}`}></div>
        <div className={`${styles.line} ${open ? styles.line3 : ''}`}></div>
      </div>
      {open && (
        <>
          <div className={styles.overlay} onClick={closeMenu}></div>
          <div className={styles.responsiveMenu}>
            <Link href="/" onClick={closeMenu}>Homepage</Link>
            <Link href="/about" onClick={closeMenu}>About</Link>
            <Link href="/contact" onClick={closeMenu}>Contact</Link>
            {status === "unauthenticated" ? (
              <Link href="/login" onClick={closeMenu}>Login</Link>
            ) : (
              <>
                <Link href="/write" onClick={closeMenu}>Write</Link>
                {isAdmin && (
                  <Link href="/admin" onClick={closeMenu}>Admin</Link>
                )}
                <span className={styles.link} onClick={handleSignOut}>Logout</span>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AuthLinks;
