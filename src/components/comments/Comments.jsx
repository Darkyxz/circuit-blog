"use client";

import Link from "next/link";
import styles from "./comments.module.css";
import Image from "next/image";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { formatDate } from "@/utils/dateFormatter";

const fetcher = async (url) => {
  const res = await fetch(url);

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message);
    throw error;
  }

  return data;
};

const Comments = ({ postSlug }) => {
  const { status } = useSession();

  const { data, mutate, isLoading } = useSWR(
    `/api/comments/simple?postSlug=${postSlug}`,
    fetcher
  );

  const [desc, setDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!desc.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments/simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ desc: desc.trim(), postSlug }),
      });
      
      if (response.ok) {
        setDesc(""); // Clear the textarea
        mutate(); // Refresh comments
      } else {
        const error = await response.json();
        alert(error.error?.message || "Error posting comment");
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert("Error posting comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Comments</h1>
      {status === "authenticated" ? (
        <div className={styles.write}>
          <textarea
            placeholder="write a comment..."
            className={styles.input}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button 
            className={styles.button} 
            onClick={handleSubmit}
            disabled={isSubmitting || !desc.trim()}
          >
            {isSubmitting ? "Posting..." : "Send"}
          </button>
        </div>
      ) : (
        <Link href="/login">Login to write a comment</Link>
      )}
      <div className={styles.comments}>
        {isLoading ? (
          <div className={styles.loading}>Loading comments...</div>
        ) : data?.length > 0 ? (
          data.map((item) => (
            <div className={styles.comment} key={item.id}>
              <div className={styles.user}>
                {item?.user?.image && (
                  <Image
                    src={item.user.image}
                    alt=""
                    width={50}
                    height={50}
                    className={styles.image}
                    sizes="50px"
                  />
                )}
                <div className={styles.userInfo}>
                  <span className={styles.username}>{item.user.name}</span>
                  <span className={styles.date}>{formatDate(item.createdAt)}</span>
                </div>
              </div>
              <p className={styles.desc}>{item.desc}</p>
            </div>
          ))
        ) : (
          <div className={styles.noComments}>No comments yet. Be the first to comment!</div>
        )}
      </div>
    </div>
  );
};

export default Comments;
