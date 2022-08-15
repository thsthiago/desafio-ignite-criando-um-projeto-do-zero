import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const countWords = post.data.content.reduce((total, contentItem) => {
    return (
      total +
      contentItem.body.reduce(
        (acc, item) => acc + item.text.split(' ').length,
        0
      ) +
      contentItem.heading.split(' ').length
    );
  }, 0);

  const timeToRead = Math.ceil(countWords / 200);

  return (
    <>
      <Head>
        <title>{post.data.title} | Spacetraveling</title>
      </Head>

      <main>
        <img
          src={post.data.banner.url}
          alt="banner"
          className={styles.banner}
        />

        <article
          className={`${styles.post} ${commonStyles.commonMaxContainerArticle}`}
        >
          <h1>{post.data.title}</h1>
          <div className={styles.heading}>
            <p>
              <FiCalendar size={20} />
              <time>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
            </p>

            <p>
              <FiUser size={20} />
              <span>{post.data.author}</span>
            </p>

            <p>
              <FiClock size={20} />
              <span>{timeToRead} min</span>
            </p>
          </div>
          {post.data.content.map(content => (
            <section key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const post = await prismic.getByUID('post', String(slug));

  return {
    props: { post },
    revalidate: 60 * 60 * 24,
  };
};
