import ClickableImage from "@/components/ui/ClickableImage";
import LikeButton from "@/components/likes/LikeButton";
import styles from "./card.module.css";
import Link from "next/link";
import { formatDate } from "@/utils/dateFormatter";

const Card = ({ key, item }) => {
  return (
    <div className={styles.container} key={key}>
      {item.img && (
        <ClickableImage
          src={item.img}
          alt={item.title || "Blog post image"}
          containerClassName={styles.imageContainer}
          className={styles.image}
        />
      )}
      <div className={styles.textContainer}>
        <div className={styles.detail}>
          <span className={styles.date}>
            {formatDate(item.createdAt)} -{" "}
          </span>
          <span className={styles.category}>{item.catSlug}</span>
        </div>
        <Link href={`/posts/${item.slug}`}>
          <h1>{item.title}</h1>
        </Link>
        {/* <p className={styles.desc}>{item.desc.substring(0, 60)}</p> */}
        <div className={styles.desc} dangerouslySetInnerHTML={{ __html: item?.desc.substring(0,60) }}/>
        <div className={styles.actions}>
          <Link href={`/posts/${item.slug}`} className={styles.link}>
            Read More
          </Link>
          <LikeButton postSlug={item.slug} size="small" />
        </div>
      </div>
    </div>
  );
};

export default Card;
