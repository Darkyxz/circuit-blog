import React from "react";
import SearchComponent from "@/components/search/SearchComponent";
import styles from "./search.module.css";

export const metadata = {
  title: "Búsqueda | Circuit Blog",
  description: "Busca posts sobre programación, tecnología y desarrollo en Circuit Blog",
};

const SearchPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Buscar Posts</h1>
      <p className={styles.subtitle}>
        Encuentra los posts que te interesan sobre programación, tecnología y desarrollo
      </p>
      
      <SearchComponent />
    </div>
  );
};

export default SearchPage;
