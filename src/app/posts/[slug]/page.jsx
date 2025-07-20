import Menu from "@/components/Menu/Menu";
import styles from "./singlePage.module.css";
import Image from "next/image";
import ClickableImage from "@/components/ui/ClickableImage";
import NestedComments from "@/components/comments/NestedComments";
import PostSkeleton from "@/components/skeletons/PostSkeleton";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { formatDate } from "@/utils/dateFormatter";

const getData = async (slug) => {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/posts/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch post");
  }

  return res.json();
};

const SinglePage = async ({ params }) => {
  const { slug } = params;

  try {
    const data = await getData(slug);

    if (!data) {
      return (
        <div className={styles.container}>
          <div className={styles.error}>
            <h1>Post Not Found</h1>
            <p>The post you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      );
    }

    return (
    <div className={styles.container}>
      <ScrollToTop />
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{data?.title}</h1>
          <div className={styles.user}>
            {data?.user?.image && (
              <div className={styles.userImageContainer}>
                <Image 
                  src={data.user.image} 
                  alt="" 
                  fill 
                  className={styles.avatar}
                  sizes="50px"
                />
              </div>
            )}
            <div className={styles.userTextContainer}>
              <span className={styles.username}>{data?.user.name}</span>
              <span className={styles.date}>{formatDate(data?.createdAt)}</span>
            </div>
          </div>
        </div>
        {data?.img && (
          <ClickableImage
            src={data.img}
            alt={data.title || "Post image"}
            containerClassName={styles.imageContainer}
            className={styles.image}
            priority={true}
          />
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.post}>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: data?.desc }}
          />
          <div className={styles.comment}>
            <NestedComments postSlug={slug}/>
          </div>
        </div>
        <Menu />
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error loading post:', error);
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Something went wrong</h1>
          <p>There was an error loading the post. Please try again later.</p>
        </div>
      </div>
    );
  }
};

export default SinglePage;
