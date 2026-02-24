import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HomepageHeader() {
	const { siteConfig } = useDocusaurusContext();
	return (
		<header className={clsx('hero', styles.heroBanner)}>
			<div className="container">
				<div className={styles.heroContainer}>
					<div className={styles.heroContent}>
						<h1 className={clsx('hero__title', styles.heroTitle)}>
							{siteConfig.title}
						</h1>
						<p className={clsx('hero__subtitle', styles.heroSubtitle)}>
							{siteConfig.tagline}
						</p>
						<p className="margin-bottom--lg">
							Experience local news and community updates directly on your
							device. Try out the interactive demo right here!
						</p>
						<div className={styles.buttons}>
							<Link
								className="button button--primary button--lg"
								to="/docs/intro"
							>
								Get Started
							</Link>
							<Link
								className="button button--secondary button--lg"
								to="https://github.com/patchwork-hub/findout-app.git"
							>
								View on GitHub
							</Link>
							<Link
								className="button button--secondary button--lg"
								to="https://appetize.io/embed/b_unilmrfby3yzc3dl4zqtx6jcbi"
							>
								Test Live App
							</Link>
						</div>
					</div>
					<div className={styles.heroImage}>
						<div className={styles.appetizeContainer}>
							<div className={styles.iphoneWrapper}>
								<div className={styles.iphoneNotch} />
								<div className={styles.iphoneScreen}>
									<img
										src={useBaseUrl('img/login.PNG')}
										alt="App Screenshot"
										className={styles.appScreenshot}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}

export default function Home() {
	const { siteConfig } = useDocusaurusContext();
	return (
		<Layout
			title={`Hello from ${siteConfig.title}`}
			description="Description will go into a meta tag in <head />"
		>
			<HomepageHeader />
			<main></main>
		</Layout>
	);
}
