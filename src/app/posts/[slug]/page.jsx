import Menu from "@/components/Menu/Menu";
import styles from "./singlePage.module.css";
import Image from "next/image";
import ClickableImage from "@/components/ui/ClickableImage";
import Comments from "@/components/comments/Comments";
import { formatDate } from "@/utils/dateFormatter";

const getData = async (slug) => {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/posts/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed");
  }

  return res.json();
};

const SinglePage = async ({ params }) => {
  const { slug } = params;

  const data = await getData(slug);

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{data?.title}</h1>
          <div className={styles.user}>
            {data?.user?.image && (
              <div className={styles.userImageContainer}>
                <Image src={data.user.image} alt="" fill className={styles.avatar} />
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
            <Comments postSlug={slug}/>
          </div>
        </div>
        <Menu />
      </div>
    </div>
  );
};

export default SinglePage;
