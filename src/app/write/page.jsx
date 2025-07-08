"use client";

import Image from "next/image";
import styles from "./writePage.module.css";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.bubble.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamicImport from "next/dynamic";
import Loading from "@/components/loading/Loading";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

// Importar ReactQuill dinámicamente para evitar errores de SSR
const ReactQuill = dynamicImport(() => import("react-quill"), { ssr: false });

const WritePage = () => {
  const { status } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [media, setMedia] = useState("");
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [catSlug, setCatSlug] = useState("programming");
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const uploadToCloudinary = async () => {
      if (!file) return;
      
      setUploading(true);
      console.log("Starting upload to Cloudinary...");
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          setMedia(data.url);
          console.log("Upload successful:", data.url);
        } else {
          const error = await response.json();
          console.error("Upload failed:", error);
          alert("Image upload failed: " + error.error);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Image upload failed: " + error.message);
      } finally {
        setUploading(false);
      }
    };

    uploadToCloudinary();
  }, [file]);

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async () => {
    // Validación básica
    if (!title.trim()) {
      alert('Por favor ingresa un título');
      return;
    }
    
    if (!value.trim()) {
      alert('Por favor ingresa contenido para el post');
      return;
    }

    setPublishing(true);
    console.log('Submitting post with data:', {
      title,
      desc: value,
      img: media,
      slug: slugify(title),
      catSlug: catSlug || "programming"
    });

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          desc: value,
          img: media,
          slug: slugify(title),
          catSlug: catSlug || "programming",
        }),
      });

      console.log('Response status:', res.status);

      if (res.status === 200) {
        const data = await res.json();
        console.log('Post created successfully:', data);
        router.push(`/posts/${data.slug}`);
      } else {
        console.error('Error creating post:', res.status, res.statusText);
        const errorData = await res.text();
        console.error('Error details:', errorData);
        alert(`Error creando el post: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Error de red: No se pudo crear el post');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>📝 Crear Nuevo Post</h1>
        <p className={styles.headerDesc}>Comparte tus conocimientos con la comunidad tech</p>
      </div>

      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Título del Post</label>
          <input
            type="text"
            placeholder="Escribe un título llamativo..."
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Categoría</label>
          <select 
            className={styles.select} 
            value={catSlug}
            onChange={(e) => setCatSlug(e.target.value)}
          >
            <option value="programming">💻 Programación</option>
            <option value="artificial-intelligence">🤖 Inteligencia Artificial</option>
            <option value="gaming">🎮 Gaming</option>
            <option value="docker">🐳 Docker</option>
            <option value="mcps">🔗 MCPs (Model Context Protocol)</option>
            <option value="web-development">🌐 Desarrollo Web</option>
            <option value="mobile-development">📱 Desarrollo Móvil</option>
            <option value="devops">⚙️ DevOps</option>
            <option value="machine-learning">🧠 Machine Learning</option>
            <option value="cybersecurity">🔐 Ciberseguridad</option>
            <option value="blockchain">⛓️ Blockchain</option>
            <option value="cloud-computing">☁️ Cloud Computing</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Contenido</label>
          <div className={styles.editor}>
            <div className={styles.toolbar}>
              <button 
                className={styles.toolButton} 
                onClick={() => setOpen(!open)}
                title="Agregar multimedia"
              >
                <Image src="/plus.png" alt="Agregar" width={16} height={16} />
                <span>Multimedia</span>
              </button>
              {open && (
                <div className={styles.mediaOptions}>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                  <button className={styles.mediaButton} disabled={uploading}>
                    <label htmlFor="image" className={styles.mediaLabel}>
                      {uploading ? (
                        <span>📤 Subiendo...</span>
                      ) : (
                        <>
                          <Image src="/image.png" alt="Imagen" width={16} height={16} />
                          <span>Imagen</span>
                        </>
                      )}
                    </label>
                  </button>
                  <button className={styles.mediaButton}>
                    <Image src="/external.png" alt="Enlace" width={16} height={16} />
                    <span>Enlace</span>
                  </button>
                  <button className={styles.mediaButton}>
                    <Image src="/video.png" alt="Video" width={16} height={16} />
                    <span>Video</span>
                  </button>
                </div>
              )}
            </div>
            
            {media && (
              <div className={styles.imagePreview}>
                <div className={styles.previewHeader}>
                  <span>🖼️ Imagen seleccionada</span>
                  <button 
                    className={styles.removeImage}
                    onClick={() => setMedia("")}
                  >
                    ✕
                  </button>
                </div>
                <Image 
                  src={media} 
                  alt="Preview" 
                  width={300} 
                  height={200} 
                  style={{objectFit: 'cover'}} 
                />
              </div>
            )}
            
            <div className={styles.textEditor}>
              <ReactQuill
                className={styles.textArea}
                theme="bubble"
                value={value}
                onChange={setValue}
                placeholder="Escribe tu post aquí... Puedes usar formato rico como **negrita**, *cursiva*, y más."
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.saveDraft}
            onClick={() => alert('Función de guardar borrador próximamente')}
          >
            💾 Guardar Borrador
          </button>
          <button 
            className={styles.publish} 
            onClick={handleSubmit}
            disabled={publishing || !title.trim() || !value.trim()}
          >
            {publishing ? (
              <span>🚀 Publicando...</span>
            ) : (
              <span>📢 Publicar Post</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritePage;
