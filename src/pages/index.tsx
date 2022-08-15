import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';

import { FiCalendar, FiUser } from 'react-icons/fi';

import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const formatData = (posts): Post[] => {
  return posts.map(post => ({
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));
};

export default function Home({ postsPagination }: HomeProps) {
  const [next_page, setNextPage] = useState(postsPagination?.next_page);
  const [results, setResults] = useState(postsPagination.results);

  const handleNextPage = async () => {
    try {
      const response = await fetch(next_page, { method: 'get' });
      const data = await response.json();
      setNextPage(data.next_page);
      setResults(state => [...state, ...formatData(data.results)]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>Posts | Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {results.map(post => (
            <Link href={`/post/${post.uid}`} passHref>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <p>
                    <FiCalendar />
                    <time>{post.first_publication_date}</time>
                  </p>

                  <p>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </p>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {next_page && (
          <button
            type="button"
            className={styles.btnNextPosts}
            onClick={handleNextPage}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 1,
  });

  const postsPagination = {
    results: formatData(postsResponse.results),
    next_page: postsResponse.next_page,
  };

  return {
    props: { postsPagination },
  };
};
