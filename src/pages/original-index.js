import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './original-index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)} style={{minHeight: '80vh', display: 'flex', alignItems: 'center'}}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={clsx(styles.buttons)}>
          <Link
            style={{margin:5}}
            className="button button--secondary button--lg"
            to="/docs/Welcome">
            Getting Started 🚀
          </Link>
          <Link
            style={{margin:5}}
            className="button button--secondary button--lg"
            to="https://github.com/camthink-ai">
            GitHub 
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title} Developer Wiki Center`}
      description="CamThink provides open, high-quality hardware and edge AI development solutions for AI developers.">
      <HomepageHeader />
    </Layout>
  );
}