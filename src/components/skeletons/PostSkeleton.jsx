'use client';

import styles from './postSkeleton.module.css';

const PostSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <div className={styles.titleSkeleton}></div>
          <div className={styles.userContainer}>
            <div className={styles.avatarSkeleton}></div>
            <div className={styles.userInfo}>
              <div className={styles.nameSkeleton}></div>
              <div className={styles.dateSkeleton}></div>
            </div>
          </div>
        </div>
        <div className={styles.imageSkeleton}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.post}>
          <div className={styles.descriptionSkeleton}>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
            <div className={styles.textLine}></div>
          </div>
          <div className={styles.commentSkeleton}>
            <div className={styles.commentTitleSkeleton}></div>
            <div className={styles.commentItem}>
              <div className={styles.commentAvatarSkeleton}></div>
              <div className={styles.commentTextSkeleton}></div>
            </div>
            <div className={styles.commentItem}>
              <div className={styles.commentAvatarSkeleton}></div>
              <div className={styles.commentTextSkeleton}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;
