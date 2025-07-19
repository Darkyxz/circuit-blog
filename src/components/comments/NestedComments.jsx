"use client";

import Link from "next/link";
import styles from "./comments.module.css";
import Image from "next/image";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { formatDate } from "@/utils/dateFormatter";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.bubble.css";

// Importar ReactQuill dinámicamente para evitar errores de SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const fetcher = async (url) => {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message);
    throw error;
  }

  return data;
};

// Componente individual de comentario
const Comment = ({ comment, postSlug, onReply, onEdit, onDelete, depth = 0 }) => {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.desc);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = session?.user?.email === comment.userEmail;
  const canEdit = isOwner || (session?.user?.role && ['ADMIN', 'EDITOR'].includes(session.user.role));
  
  // Función para obtener el badge del rol
  const getRoleBadge = (role) => {
    const badges = {
      'ADMIN': { text: 'Admin', color: '#ef4444', emoji: '👑' },
      'EDITOR': { text: 'Editor', color: '#3b82f6', emoji: '✏️' },
      'AUTHOR': { text: 'Autor', color: '#10b981', emoji: '📝' },
      'USER': null
    };
    return badges[role] || null;
  };

  const roleBadge = getRoleBadge(comment.user.role);

  const handleEdit = async () => {
    if (!editText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onEdit(comment.id, editText.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Error al editar comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText("");
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error replying to comment:', error);
      alert('Error al responder comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;
    
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar comentario');
    }
  };

  return (
    <div 
      id={`comment-${comment.id}`}
      className={`${styles.comment} ${depth > 0 ? styles.reply : ''}`} 
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className={styles.user}>
        {comment?.user?.image && (
          <Image
            src={comment.user.image}
            alt=""
            width={40}
            height={40}
            className={styles.image}
            sizes="40px"
          />
        )}
        <div className={styles.userInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link 
              href={`/profile/${comment.user.id || comment.userEmail}`}
              className={styles.username}
              style={{ textDecoration: 'none', color: 'var(--textColor)' }}
            >
              {comment.user.name}
            </Link>
            {roleBadge && (
              <span 
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  backgroundColor: roleBadge.color,
                  color: 'white',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span>{roleBadge.emoji}</span>
                {roleBadge.text}
              </span>
            )}
          </div>
          <span className={styles.date}>{formatDate(comment.createdAt)}</span>
          {comment.updatedAt !== comment.createdAt && (
            <span className={styles.edited}>(editado)</span>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className={styles.editForm}>
          <ReactQuill
            value={editText}
            onChange={setEditText}
            theme="bubble"
            placeholder="Edita tu comentario..."
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                ['blockquote', 'code-block'],
                ['link'],
                ['clean']
              ]
            }}
            style={{
              minHeight: '80px',
              backgroundColor: 'var(--bg)',
              borderRadius: '6px',
              border: '1px solid var(--border)'
            }}
          />
          <div className={styles.editActions}>
            <button 
              onClick={handleEdit}
              disabled={isSubmitting || !editText.trim()}
              className={styles.saveBtn}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.desc);
              }}
              className={styles.cancelBtn}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={styles.desc}
          dangerouslySetInnerHTML={{ __html: comment.desc }}
        />
      )}

      {/* Acciones del comentario */}
      <div className={styles.commentActions}>
        {session && depth < 3 && (
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)}
            className={styles.replyBtn}
          >
            💬 Responder
          </button>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <span style={{ 
            fontSize: '12px', 
            color: 'var(--softTextColor)',
            padding: '4px 8px',
            background: 'var(--softBg)',
            borderRadius: '12px'
          }}>
            {comment.replies.length} respuesta{comment.replies.length !== 1 ? 's' : ''}
          </span>
        )}
        {canEdit && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className={styles.editBtn}
          >
            ✏️ Editar
          </button>
        )}
        {canEdit && (
          <button 
            onClick={handleDelete}
            className={styles.deleteBtn}
          >
            🗑️ Eliminar
          </button>
        )}
        <button 
          onClick={() => {
            const url = `${window.location.origin}${window.location.pathname}#comment-${comment.id}`;
            navigator.clipboard.writeText(url);
            alert('Enlace copiado al portapapeles');
          }}
          className={styles.linkBtn}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--softTextColor)',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '4px 8px'
          }}
        >
          🔗 Enlace
        </button>
      </div>

      {/* Formulario de respuesta */}
      {showReplyForm && session && (
        <div className={styles.replyForm}>
          <ReactQuill
            value={replyText}
            onChange={setReplyText}
            theme="bubble"
            placeholder="Escribe tu respuesta... Puedes usar formato rico y colores"
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                ['blockquote', 'code-block'],
                ['link'],
                ['clean']
              ]
            }}
            style={{
              minHeight: '60px',
              backgroundColor: 'var(--bg)',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              marginBottom: '10px'
            }}
          />
          <div className={styles.replyActions}>
            <button 
              onClick={handleReply}
              disabled={isSubmitting || !replyText.trim()}
              className={styles.replySubmitBtn}
            >
              {isSubmitting ? 'Enviando...' : 'Responder'}
            </button>
            <button 
              onClick={() => {
                setShowReplyForm(false);
                setReplyText("");
              }}
              className={styles.replyCancelBtn}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Respuestas anidadas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postSlug={postSlug}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente principal de comentarios
const NestedComments = ({ postSlug }) => {
  const { data: session, status } = useSession();
  const [desc, setDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comments, mutate, isLoading } = useSWR(
    `/api/comments/simple?postSlug=${postSlug}`,
    fetcher
  );

  // Scroll automático a comentario específico cuando se carga la página
  useEffect(() => {
    if (comments && window.location.hash) {
      const commentId = window.location.hash.substring(1); // Remove #
      const element = document.getElementById(commentId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Highlight del comentario
          element.style.backgroundColor = 'var(--softTextColor)';
          element.style.transition = 'background-color 2s ease';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 2000);
        }, 500);
      }
    }
  }, [comments]);

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
        setDesc("");
        mutate();
      } else {
        const error = await response.json();
        alert(error.error || "Error posting comment");
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert("Error posting comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId, replyText) => {
    const response = await fetch("/api/comments/simple", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        desc: replyText, 
        postSlug, 
        parentId 
      }),
    });
    
    if (response.ok) {
      mutate();
    } else {
      const error = await response.json();
      throw new Error(error.error || "Error replying to comment");
    }
  };

  const handleEdit = async (commentId, newText) => {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ desc: newText }),
    });
    
    if (response.ok) {
      mutate();
    } else {
      const error = await response.json();
      console.error('Error response:', error);
      throw new Error(error.message || error.error || "Error editing comment");
    }
  };

  const handleDelete = async (commentId) => {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    });
    
    if (response.ok) {
      mutate();
    } else {
      const error = await response.json();
      throw new Error(error.message || "Error deleting comment");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Comentarios</h1>
      
      {status === "authenticated" ? (
        <div className={styles.write}>
          <ReactQuill
            value={desc}
            onChange={setDesc}
            theme="bubble"
            placeholder="Escribe un comentario... Puedes usar formato rico y colores"
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                ['blockquote', 'code-block'],
                ['link'],
                ['clean']
              ]
            }}
            style={{
              minHeight: '100px',
              backgroundColor: 'var(--bg)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              marginBottom: '15px'
            }}
          />
          <button 
            className={styles.button} 
            onClick={handleSubmit}
            disabled={isSubmitting || !desc.trim()}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      ) : (
        <div className={styles.loginPrompt}>
          <Link href="/login">Inicia sesión para escribir un comentario</Link>
        </div>
      )}

      <div className={styles.comments}>
        {isLoading ? (
          <div className={styles.loading}>Cargando comentarios...</div>
        ) : comments?.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              depth={0}
            />
          ))
        ) : (
          <div className={styles.noComments}>
            ¡Sé el primero en comentar!
          </div>
        )}
      </div>
    </div>
  );
};

export default NestedComments;
