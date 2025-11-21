# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.21.1](https://github.com/JNZader/portfolio-2025/compare/v0.21.0...v0.21.1) (2025-11-21)

### [0.20.1](https://github.com/JNZader/portfolio-2025/compare/v0.20.0...v0.20.1) (2025-11-21)

## [0.21.0](https://github.com/JNZader/portfolio-2025/compare/v0.20.0...v0.21.0) (2025-11-21)


### Features

* **monitoring:** add error boundary pages with Sentry integration ([13fee91](https://github.com/JNZader/portfolio-2025/commits/13fee918f13a3f0a7c26b75e304e86e3379134ca))
* **monitoring:** add health check endpoint for uptime monitoring ([135bfc9](https://github.com/JNZader/portfolio-2025/commits/135bfc938e74f5c5bcf178b0035acd88e6b75734))
* **monitoring:** add performance tracking for critical operations ([1d82ad5](https://github.com/JNZader/portfolio-2025/commits/1d82ad51a6f157b73be6c89f54feef4526ea862d))
* **monitoring:** add user error feedback widget ([70e6bcf](https://github.com/JNZader/portfolio-2025/commits/70e6bcf55304f25717e81bba42e61ddbaaa05c49))
* **monitoring:** configure Sentry error tracking ([35e776f](https://github.com/JNZader/portfolio-2025/commits/35e776feac70df79e28f57298ea5c7dca6847947))
* **monitoring:** implement structured logging across the application ([22121c7](https://github.com/JNZader/portfolio-2025/commits/22121c7466d7917f17409a5c0b5b69cdcdd968f7))


### Bug Fixes

* **api:** use shared Resend client to prevent build failures ([4ddab48](https://github.com/JNZader/portfolio-2025/commits/4ddab4854beb2e1f62449d10be62a858e43161b1))

## [0.20.0](https://github.com/JNZader/portfolio-2025/compare/v0.18.1...v0.20.0) (2025-11-21)


### Bug Fixes

* **ci:** add fallbacks for missing env vars in build ([bed6389](https://github.com/JNZader/portfolio-2025/commits/bed6389e378b5d169ae13431c4528e828504e588))
* **ci:** add Prisma Client generation to all workflows and hooks ([0dcad9f](https://github.com/JNZader/portfolio-2025/commits/0dcad9fee1215678f06034c9f762a0510c7b875b))
* **deps:** restore Prisma 7 for CI compatibility ([6b8329d](https://github.com/JNZader/portfolio-2025/commits/6b8329de9a686bc40f8cfe47608243c8a94f87d7))
* **husky:** show Prisma generation errors in pre-push hook ([78ab493](https://github.com/JNZader/portfolio-2025/commits/78ab49339b910e88692a27f4ea01435b6e04dd68))
* **prisma:** downgrade to v6 for SQLite compatibility ([4f4e67c](https://github.com/JNZader/portfolio-2025/commits/4f4e67c383d5a367941990eaedfaeacc237a8ecd))
* **prisma:** remove engine property for Prisma 7 compatibility ([48d04ed](https://github.com/JNZader/portfolio-2025/commits/48d04edadc535898813d2f0e7cb65e4453c05c8f))
* **prisma:** remove url from schema for Prisma 7 compatibility ([a62393c](https://github.com/JNZader/portfolio-2025/commits/a62393c4f2ce65df75cf87aafb9e18e13e8f7981))


### Performance Improvements

* **ci:** optimize workflows with advanced caching ([453dc74](https://github.com/JNZader/portfolio-2025/commits/453dc7493fcb52f45538b1aa3eb78a2b707760e9))


### Documentation

* **ci:** add comprehensive CI/CD documentation ([4fbd8ff](https://github.com/JNZader/portfolio-2025/commits/4fbd8ffda35dfd651a42dc692113c2c094a7574c))
* **readme:** add status badges and update documentation ([7c3a5e3](https://github.com/JNZader/portfolio-2025/commits/7c3a5e37e7cf3ba8090a30f368bc6c3847eea726))

## [0.18.0](https://github.com/JNZader/portfolio-2025/compare/v0.17.0...v0.18.0) (2025-11-21)


### Features

* **git:** add commit message template ([4c805fb](https://github.com/JNZader/portfolio-2025/commits/4c805fb557fd73e33654274043f5341c040cf0f8))
* **git:** add pre-push hook for automated testing ([ed9dfaf](https://github.com/JNZader/portfolio-2025/commits/ed9dfaffc8ba5a6cb690c62034ff36a1b567015c))
* **git:** add pull request template ([4442a94](https://github.com/JNZader/portfolio-2025/commits/4442a94eda130b83cfb6af0b49e72b032bb3fb88))

## [0.17.0](https://github.com/JNZader/portfolio-2025/compare/v0.16.0...v0.17.0) (2025-11-21)


### Features

* **analytics:** add comprehensive Web Vitals tracking ([0b9ce38](https://github.com/JNZader/portfolio-2025/commits/0b9ce3898c19ee95138bbae55b7c4baa12b5df9c))
* **analytics:** add custom event tracking helpers ([0572faf](https://github.com/JNZader/portfolio-2025/commits/0572faf73c2469e771a01e88a75577e66ac7d329))
* **analytics:** add custom Web Vitals API endpoint ([4236667](https://github.com/JNZader/portfolio-2025/commits/4236667d9a6eac72095e8d44435dc4b27805aed5))
* **analytics:** add development debug panel and fix API endpoint ([d471c48](https://github.com/JNZader/portfolio-2025/commits/d471c48861b6bead577c9f2e35a86ae8c7cfd662))
* **analytics:** add error tracking and global error boundary ([04f14be](https://github.com/JNZader/portfolio-2025/commits/04f14be7f5f38ff630bb77e429a7e2e6bf8194fe))
* **analytics:** add GDPR-compliant consent management and fix hydration error ([dd8cdcb](https://github.com/JNZader/portfolio-2025/commits/dd8cdcb7cb72f83ce5f20ecd645cf534ec21233e))
* **analytics:** add Google Analytics 4 with automatic pageview tracking ([ab02b92](https://github.com/JNZader/portfolio-2025/commits/ab02b92162d8aa1769ff0a99b0afd3d4ddfaf5d2))
* **analytics:** add search query tracking ([8ae0e15](https://github.com/JNZader/portfolio-2025/commits/8ae0e15f46a908546f2d7561762140a0b201fa09))
* **analytics:** integrate event tracking in components ([0202331](https://github.com/JNZader/portfolio-2025/commits/02023316152761001362d49e79981dc495f61da0))
* **analytics:** integrate Vercel Analytics and Speed Insights ([4f2fd5e](https://github.com/JNZader/portfolio-2025/commits/4f2fd5e15f787befc9a565845382352774f04a9e))

## [0.16.0](https://github.com/JNZader/portfolio-2025/compare/v0.15.0...v0.16.0) (2025-11-20)


### Features

* **seo:** complete blog post SEO with schemas and OG images ([3985c1b](https://github.com/JNZader/portfolio-2025/commits/3985c1bbfd97caedfb1ab8e396f2d3f3db6f1c87))
* **seo:** implement advanced SEO with structured data ([7062931](https://github.com/JNZader/portfolio-2025/commits/7062931ab857b7ca80fcb0017de6efd7ce21e519))

## [0.15.0](https://github.com/JNZader/portfolio-2025/compare/v0.14.0...v0.15.0) (2025-11-20)


### Features

* **components:** add premium variants and micro-interactions ([0ebe2d5](https://github.com/JNZader/portfolio-2025/commits/0ebe2d5784507b407c92f5cfafa42135b1e975d6))
* **design-system:** enrich color palette and improve accessibility ([65edc5c](https://github.com/JNZader/portfolio-2025/commits/65edc5ca8b848d45e351fad30940a7b91ace010a))
* **ui:** add premium visual effects across all pages ([5fd68b9](https://github.com/JNZader/portfolio-2025/commits/5fd68b9272086c4167b6cc7a944a783a3d07d54d))
* **ui:** enhance visual design with premium components and effects ([3d8cd5a](https://github.com/JNZader/portfolio-2025/commits/3d8cd5a61f5acff5a41cba96084ad2eacc0c5af9))


### Bug Fixes

* **a11y:** improve accessibility and ARIA compliance for e2e tests ([63141d6](https://github.com/JNZader/portfolio-2025/commits/63141d6cbf63736d1d8bcc50cb48133d4048cafd))
* **a11y:** improve accessibility and E2E test reliability ([ec06d84](https://github.com/JNZader/portfolio-2025/commits/ec06d840fc9ee9872ba753f9a852b556e12ebd8e))
* **ci:** downgrade to Node.js 22 LTS for dependency compatibility ([eb614b1](https://github.com/JNZader/portfolio-2025/commits/eb614b14bf8cb564398b11315a29ce5fc3a3d1ae))
* **deps:** resolve magicast dependency conflict for CI ([878fb38](https://github.com/JNZader/portfolio-2025/commits/878fb389385dec71b8b702bb291413fbc1e3bb0c))
* **prisma:** correct generator provider and import path ([7610f4f](https://github.com/JNZader/portfolio-2025/commits/7610f4fba1b345c990f3d5d3199a7baa677ead37))
* **prisma:** correct generator provider to prisma-client-js ([dc97944](https://github.com/JNZader/portfolio-2025/commits/dc97944c8c2459c3678503db12a2fa0c0d58b3a2))
* **tests:** correct Button test expectations and exclude e2e from vitest ([19cd15f](https://github.com/JNZader/portfolio-2025/commits/19cd15f356628dc43611111187aeb852c03e6db4))


### Performance Improvements

* **analytics:** implement Web Vitals tracking ([ba555c7](https://github.com/JNZader/portfolio-2025/commits/ba555c75e6ecab4a94b295dff7d2263a25c79b23))
* **bundle:** implement code splitting and bundle analysis ([2a04f32](https://github.com/JNZader/portfolio-2025/commits/2a04f32adac68280ed53c15800c2a8f85960cb0b))
* **cache:** implement multi-layer caching strategy ([60a8826](https://github.com/JNZader/portfolio-2025/commits/60a882633849855e48a207770cba6d4a1a462d5c))
* **database:** optimize database queries and add indexes ([2078dcf](https://github.com/JNZader/portfolio-2025/commits/2078dcfdfc26cf833e9ea2f1d96293e758545e80))
* **images:** optimize image and font loading ([15ccf35](https://github.com/JNZader/portfolio-2025/commits/15ccf350a4618003c87d4a3a42402ac39aecf0ab))
* **loading:** implement lazy loading and resource hints ([dd16e80](https://github.com/JNZader/portfolio-2025/commits/dd16e80b11cdc89314cc0c24167183578dce9bca))
* **scripts:** optimize third-party script loading ([18a7b57](https://github.com/JNZader/portfolio-2025/commits/18a7b57d6da2fc4de1cea97633a46c434aeac5af))

## [0.14.0](https://github.com/JNZader/portfolio-2025/compare/v0.13.0...v0.14.0) (2025-11-19)

## [0.13.0](https://github.com/JNZader/portfolio-2025/compare/v0.12.0...v0.13.0) (2025-11-19)


### Features

* **a11y:** add accessible Modal component and form announcements ([4e3cd38](https://github.com/JNZader/portfolio-2025/commits/4e3cd384d634752e565c0d7fa3cafd8cdff7e052))
* **a11y:** add FocusTrap component and useKeyboardNav hook ([8710691](https://github.com/JNZader/portfolio-2025/commits/8710691aa53a07edc743185b644c931843e655a4))
* **a11y:** add skip navigation and screen reader announcements ([db3f577](https://github.com/JNZader/portfolio-2025/commits/db3f577f2f22443a2f354ebc9c6d318dc06f2bde))
* **theme:** add error color, improve contrast and brand primary color ([e93c394](https://github.com/JNZader/portfolio-2025/commits/e93c394a57ad9e3d8b36fba8578f5fa6332a1042))
* **ui:** add active indicator, focus states and theme toggle placeholder in Header ([4faa73d](https://github.com/JNZader/portfolio-2025/commits/4faa73d5895cbc8d012b1feafaa7093bcb908730))
* **ui:** add visual improvements and fix style consistency ([fd1a1a4](https://github.com/JNZader/portfolio-2025/commits/fd1a1a4d5d9dabcafdfcb26977850e96a10c8f0c))
* **ux:** add skeleton loading state for projects page ([b2d9712](https://github.com/JNZader/portfolio-2025/commits/b2d9712bd1fd997629036b3397ce9e76dd0aa9cd))
* **ux:** add skeleton loading state for projects page ([d82220a](https://github.com/JNZader/portfolio-2025/commits/d82220aa77074e1baca34912af0c14ee184b7dd7))


### Bug Fixes

* **a11y:** increase icon button touch targets to 44px for WCAG compliance ([1c445b3](https://github.com/JNZader/portfolio-2025/commits/1c445b3083dff582b0c99513405839464f3c46d5))
* **deps:** replace deprecated lucide brand icons with react-icons ([1568010](https://github.com/JNZader/portfolio-2025/commits/15680106a861a50ad11f0fc0fdf2c7fb0bd4f7e2))
* **ui:** replace hardcoded colors and add active indicator in MobileMenu ([66679df](https://github.com/JNZader/portfolio-2025/commits/66679df990af6184a0d5844b14e038ddc9ca7250))


### Performance Improvements

* **ui:** optimize CustomCursor with RAF throttling and will-change ([ee5d4e8](https://github.com/JNZader/portfolio-2025/commits/ee5d4e8207c2005aadb98336d14258346f104392))
* **ui:** optimize ProjectCard images, actions, transitions and typography ([6ad2d0e](https://github.com/JNZader/portfolio-2025/commits/6ad2d0e2f95779e7f193fc9c302ef743ce5340b7))


### Code Refactoring

* **ui:** standardize Tailwind color classes in FormField component ([37fa3f1](https://github.com/JNZader/portfolio-2025/commits/37fa3f1e2d3c413cbef4a6f1df915939284d3986))

## [0.12.0](https://github.com/JNZader/portfolio-2025/compare/v0.11.0...v0.12.0) (2025-11-19)


### Features

* **gdpr:** add API routes and complete integration ([405f208](https://github.com/JNZader/portfolio-2025/commits/405f208cbad18885279c32686eb292aac0c348c7))
* **gdpr:** add consent tracking to subscriber schema ([34065af](https://github.com/JNZader/portfolio-2025/commits/34065afd38219af28c7b71e52f3deee8d0263d37))
* **gdpr:** add cookie consent banner ([8f1c230](https://github.com/JNZader/portfolio-2025/commits/8f1c230610af461af33cdab3f9c2aa9f5ebf14e0))
* **gdpr:** add data management services ([a731111](https://github.com/JNZader/portfolio-2025/commits/a7311112d256d5a18121e12334d66ca41e5f181e))
* **gdpr:** add email verification and security improvements ([47ad21a](https://github.com/JNZader/portfolio-2025/commits/47ad21adbba6e375b68dd14472558cfe829719b3))
* **gdpr:** add privacy policy and data request pages ([a0da276](https://github.com/JNZader/portfolio-2025/commits/a0da276fc42256ba69a21d02722fc04c4426c918))

## [0.11.0](https://github.com/JNZader/portfolio-2025/compare/v0.10.0...v0.11.0) (2025-11-18)


### Features

* **newsletter:** add double opt-in email templates ([546b3f5](https://github.com/JNZader/portfolio-2025/commits/546b3f5817f98c375ca748c7b6608de0766bd22b))
* **newsletter:** add subscribe action and confirmation API ([4ec8ff3](https://github.com/JNZader/portfolio-2025/commits/4ec8ff365d00034e34beae8ea049f9392e411f3d))
* **newsletter:** add Supabase PostgreSQL and Prisma ORM setup ([3121ab4](https://github.com/JNZader/portfolio-2025/commits/3121ab49a5713c5045077bf88b83e1ce483935e1))
* **newsletter:** add unsubscribe API and form component ([dc31435](https://github.com/JNZader/portfolio-2025/commits/dc31435783f0bcb948fba9299b9d2b617b39cde4))
* **newsletter:** add validation schemas and rate limiting ([9c75305](https://github.com/JNZader/portfolio-2025/commits/9c75305b9b60732065e9b88b88f0b95802543272))
* **newsletter:** complete newsletter integration with double opt-in ([4ee6862](https://github.com/JNZader/portfolio-2025/commits/4ee686242021ae4db7326ab52b9a3b5ed1299e1c))

## [0.10.0](https://github.com/JNZader/portfolio-2025/compare/v0.9.0...v0.10.0) (2025-11-13)


### Features

* **contact:** add advanced email validation and anti-scraping protection ([638d438](https://github.com/JNZader/portfolio-2025/commits/638d4382e0cd846938ed4423a89f3b6135bb7d2b))
* **contact:** add contact page and toast notifications ([0166ef0](https://github.com/JNZader/portfolio-2025/commits/0166ef07a6ed7525684a460e27bc32cbd4f138ba))
* **contact:** add email templates for contact form ([cdc1911](https://github.com/JNZader/portfolio-2025/commits/cdc191118dcbae3fdbfb044e0f6dd7217ce804d0))
* **contact:** add server action and form components ([be768f2](https://github.com/JNZader/portfolio-2025/commits/be768f21a13ed05dc8e8e5ffab2c1d963f6ae3ef))
* **contact:** add validation schemas and email infrastructure ([3562146](https://github.com/JNZader/portfolio-2025/commits/3562146354b9cf11627daf101ec696b4614ddf86))

## [0.9.0](https://github.com/JNZader/portfolio-2025/compare/v0.8.0...v0.9.0) (2025-11-12)


### Features

* **blog:** add custom Giscus theme with CSS variables ([cf3ede3](https://github.com/JNZader/portfolio-2025/commits/cf3ede3914fe98fe725dc6affc211a2d0c747700))
* **blog:** add Giscus comments component ([791dca4](https://github.com/JNZader/portfolio-2025/commits/791dca4209a7d18658106061516193ca29f37705))
* **blog:** integrate comments in blog posts ([305857d](https://github.com/JNZader/portfolio-2025/commits/305857d1d1a9793e101bff113a693a2e9c97f297))
* **blog:** integrate comments in blog posts ([2a6433d](https://github.com/JNZader/portfolio-2025/commits/2a6433d2286bb651f8bc12ea49c5b737572cc85a))
* **data:** add Sanity seed script and remove hardcoded projects ([4ff2785](https://github.com/JNZader/portfolio-2025/commits/4ff2785ebef44afc5b00da74a84e3331c50a1f7b))

## [0.8.0](https://github.com/JNZader/portfolio-2025/compare/v0.7.0...v0.8.0) (2025-11-12)


### Features

* **search:** add GROQ search queries ([a166b90](https://github.com/JNZader/portfolio-2025/commits/a166b90b08cab8ba8a708bfb1fb71794b9664055))
* **search:** add search stats and highlighted results ([cfe8d65](https://github.com/JNZader/portfolio-2025/commits/cfe8d65691996ddc4eab68a1671727edfa1d8254))
* **search:** add SearchInput component and search helpers ([dfa4a3d](https://github.com/JNZader/portfolio-2025/commits/dfa4a3d0656b00d96a8dec0109b95434228e791c))
* **search:** integrate full-text search in blog page ([a86cc17](https://github.com/JNZader/portfolio-2025/commits/a86cc17fa191e9f1270710323ec63f6006567e6e))

## [0.7.0](https://github.com/JNZader/portfolio-2025/compare/v0.6.0...v0.7.0) (2025-11-11)


### Features

* **blog:** add complete individual post page ([cd4436b](https://github.com/JNZader/portfolio-2025/commits/cd4436becd328f035bf361940acad32eab1d5f51))
* **blog:** add Portable Text renderer with custom components ([d4739f2](https://github.com/JNZader/portfolio-2025/commits/d4739f2dbd60650583e97d4fdea5afa888f66626))
* **blog:** add Portable Text support and blog queries ([81e851f](https://github.com/JNZader/portfolio-2025/commits/81e851f4dea3f3d16eaa3e5c28d09bbd78217641))
* **blog:** add Share buttons and Post header ([edc5cae](https://github.com/JNZader/portfolio-2025/commits/edc5cae113f32b08f0426dad80a86df59e836928))
* **blog:** add Table of Contents and Related Posts ([9c62e0a](https://github.com/JNZader/portfolio-2025/commits/9c62e0a9742c988013fcd16ab0f2e3476416c842))
* **blog:** add Table of Contents generator and CodeBlock ([7c345a3](https://github.com/JNZader/portfolio-2025/commits/7c345a38a64ea925a9330788be6a1dbf5cd3633e))


### Bug Fixes

* **blog:** prevent build failure with dummy Sanity credentials ([f937b7f](https://github.com/JNZader/portfolio-2025/commits/f937b7f456aeb809cd1d1a24bbac9b1acd268906))

## [0.6.0](https://github.com/JNZader/portfolio-2025/compare/v0.5.2...v0.6.0) (2025-11-11)


### Features

* **blog:** add CategoryFilter and Pagination components ([f512b66](https://github.com/JNZader/portfolio-2025/commits/f512b66a9349b250ffd3a6c3d49fb3ed464949f1))
* **blog:** add loading/error states and navigation ([48b6d38](https://github.com/JNZader/portfolio-2025/commits/48b6d38db204dacf87e588ae545df734f2ff52e4))
* **blog:** add main blog page with filtering and pagination ([b75dfbd](https://github.com/JNZader/portfolio-2025/commits/b75dfbddb218dc7e5840de5094ab2e246c58d233))
* **blog:** add PostCard and PostGrid components ([e241e26](https://github.com/JNZader/portfolio-2025/commits/e241e26c7bf32d6ba4843746f462fd4865756910))
* **blog:** add Sanity queries and blog helpers ([27eb20c](https://github.com/JNZader/portfolio-2025/commits/27eb20cd55810ce940853716e00e40bf7ccc080d))

### [0.5.2](https://github.com/JNZader/portfolio-2025/compare/v0.5.1...v0.5.2) (2025-11-11)


### Bug Fixes

* **github:** add optional chaining for undefined topics array ([fde4c27](https://github.com/JNZader/portfolio-2025/commits/fde4c2754fa9a374a4247ff108cecb5bc66ae2a7))

### [0.5.1](https://github.com/JNZader/portfolio-2025/compare/v0.5.0...v0.5.1) (2025-11-11)


### Features

* **cms:** improve GitHub API, enhance Sanity Studio, and update docs ([8ef5ee3](https://github.com/JNZader/portfolio-2025/commits/8ef5ee356397fc556ee3db79a10d04a70f9cc29b))

## [0.5.0](https://github.com/JNZader/portfolio-2025/compare/v0.4.0...v0.5.0) (2025-11-11)


### Features

* **cms:** add GROQ queries and TypeScript types ([8a52f13](https://github.com/JNZader/portfolio-2025/commits/8a52f13e0a40ec870647e8c407fa7e5e4480f10e))
* **cms:** add Sanity content schemas ([277abea](https://github.com/JNZader/portfolio-2025/commits/277abea14560d5d20a8b0618833b55993a93ac75))
* **cms:** add Sanity image URL builder ([c432a2a](https://github.com/JNZader/portfolio-2025/commits/c432a2a91b0fa6133b108b166215bd248e952134))
* **cms:** configure Sanity Studio in Next.js ([e9cc239](https://github.com/JNZader/portfolio-2025/commits/e9cc239964a9900c5786d1265c0e5dfdfefa2c8f))
* **cms:** setup Sanity CMS configuration ([985b365](https://github.com/JNZader/portfolio-2025/commits/985b36567e08a0207d0d7466d25b6b1627ed5992))
* **github:** add GitHub API client with Octokit ([6d045c0](https://github.com/JNZader/portfolio-2025/commits/6d045c07d0b05c3b5e08a1c18464554d9201108c))
* **github:** add in-memory cache for GitHub API ([77c4419](https://github.com/JNZader/portfolio-2025/commits/77c44196c248dab28a310537d56e68f5fdebad7e))
* **projects:** add interactive search and filtering ([c22009b](https://github.com/JNZader/portfolio-2025/commits/c22009b904e7e4f95daaa6fcabc0f2c00b3698bc))


### Bug Fixes

* **build:** resolve production build errors ([d7ab85c](https://github.com/JNZader/portfolio-2025/commits/d7ab85cd1dd32ccf8eae4194ea4bb4d3411a0c35))

## [0.4.0](https://github.com/JNZader/portfolio-2025/compare/v0.3.0...v0.4.0) (2025-11-11)


### Features

* **design:** add shadcn/ui CSS variables to globals.css ([7706e83](https://github.com/JNZader/portfolio-2025/commits/7706e83187266dbfa0ed3eca0e89b2947bf17a94))
* **design:** add ThemeProvider with next-themes ([dfbde21](https://github.com/JNZader/portfolio-2025/commits/dfbde2191e2ee1210e32d1280160adf72317aa50))
* **design:** create design system documentation page ([bae79fe](https://github.com/JNZader/portfolio-2025/commits/bae79fe07bbd38801d4011c8937b9f1c59be0818))
* **header:** add theme toggle button ([313a089](https://github.com/JNZader/portfolio-2025/commits/313a0892f0c83405d5ae4df204e71a06fa185221))
* **layout:** integrate ThemeProvider in root layout ([e1855f5](https://github.com/JNZader/portfolio-2025/commits/e1855f5c0b42a3843ad503cc881cce851b372aa8))
* **ui:** install Input, Card, and Badge components ([79e1dbb](https://github.com/JNZader/portfolio-2025/commits/79e1dbbddee8148f647e5f89d3cc67b891154cc9))

## [0.3.0](https://github.com/JNZader/portfolio-2025/compare/v0.2.0...v0.3.0) (2025-11-10)


### Features

* **types:** add advanced TypeScript types ([8fa63b9](https://github.com/JNZader/portfolio-2025/commits/8fa63b9987cadbdd1dce1aa520535c49b3798b35))
* **utils:** add formatting utilities ([9cde194](https://github.com/JNZader/portfolio-2025/commits/9cde194447da4ee7466a19b68c08d1e28d6fbced))
* **utils:** add string manipulation utilities ([fcd8f42](https://github.com/JNZader/portfolio-2025/commits/fcd8f42875a4260c4bb53939f7fb18edbdab6bd2))
* **utils:** add type guard utilities ([07b5f79](https://github.com/JNZader/portfolio-2025/commits/07b5f79a9e44dba34d9c770f97c483054bd23d2d))
* **utils:** update barrel exports and add global constants ([ad2b179](https://github.com/JNZader/portfolio-2025/commits/ad2b179756cd57775325daf58bef7c352fd08ac8))


### Code Refactoring

* **lib:** migrate utils to folder structure ([60bc087](https://github.com/JNZader/portfolio-2025/commits/60bc0879dc44cd1981183f804bad991d42fc0ff3))

## [0.2.0](https://github.com/JNZader/portfolio-2025/compare/v0.1.0...v0.2.0) (2025-11-10)


### Features

* complete iteration 01 - base components ([52dfd2b](https://github.com/JNZader/portfolio-2025/commits/52dfd2b520ca6ccb07f06465e8c43f217cd8b7d0))
* complete iteration 01 - base components ([8df6c1b](https://github.com/JNZader/portfolio-2025/commits/8df6c1b4f218832ab03a61941bd903735e5c84d5))
* **components:** add Button and HeroSection components ([5840aed](https://github.com/JNZader/portfolio-2025/commits/5840aed6959f3e39eb48c6445b4df12704e6a629))
* **config:** configure tailwind CSS 4 with PostCSS ([925338d](https://github.com/JNZader/portfolio-2025/commits/925338de76294743557e263f422a13267f20fbd7))
* **content:** update metadata and implement homepage ([9930915](https://github.com/JNZader/portfolio-2025/commits/99309151dbae461fa38b0463ea1a9427f7ca44b0))
* **layout:** add Footer component ([488ae08](https://github.com/JNZader/portfolio-2025/commits/488ae085c03ece9d9aa10cc590e165ec6fde0893))
* **layout:** add Header with responsive navigation ([3daa3d0](https://github.com/JNZader/portfolio-2025/commits/3daa3d0df49974d20086be1dcc0ee2a69a50d91a))
* **layout:** update root layout with Header and Footer ([cec3cba](https://github.com/JNZader/portfolio-2025/commits/cec3cbaeb6416dcc7618c95e760fb2c494cf9896))
* **lib:** add utilities and shadcn configuration ([245a6e2](https://github.com/JNZader/portfolio-2025/commits/245a6e2f1f7a25fbc8800e91c24e07944df7456e))
* **pages:** create all main pages ([7a8813a](https://github.com/JNZader/portfolio-2025/commits/7a8813a9c1562cc304004d3b0c5cafb2a40947b7))
* **ui:** add base UI components ([40ee438](https://github.com/JNZader/portfolio-2025/commits/40ee4384f2152adbab23105e0fd7cc5ce7e42327))


### Bug Fixes

* **components:** replace CSS custom properties with Tailwind utilities ([2a60f02](https://github.com/JNZader/portfolio-2025/commits/2a60f022369fbc81f9ec3551d4f8a527fb192549))
* **ui:** improve base UI components ([ff110a4](https://github.com/JNZader/portfolio-2025/commits/ff110a4da92294edc344891af161e990fdf3d643))

## 0.1.0 (2025-11-07)


### Features

* complete iteration 00 - setup environment ([9b25f05](https://github.com/JNZader/portfolio-2025/commits/9b25f05ee9d149cd8c343cf55218fb78cb13d9e2))
* **git:** configure Git hooks with Husky and Commitlint ([6f4c2a2](https://github.com/JNZader/portfolio-2025/commits/6f4c2a22b2f6d2c1ff01226cac059e54cec7ac8f))
* **setup:** configure Biome 2.3.2 for linting and formatting ([a843fa3](https://github.com/JNZader/portfolio-2025/commits/a843fa31b5e4b8189dc973edb8a5dca8f365a264))
* **setup:** configure environment variables ([540cf25](https://github.com/JNZader/portfolio-2025/commits/540cf25a0e530f5e4a8e82a7da8d364df131d2a6))
* **setup:** configure strict TypeScript 5.9 ([e314da4](https://github.com/JNZader/portfolio-2025/commits/e314da4091e057ddafd28038b4b8d3551384b7c3))
* **setup:** configure Tailwind CSS 4.1 ([e6ff059](https://github.com/JNZader/portfolio-2025/commits/e6ff059f7d8a5ecd482917f99ee96faee571ef23))
* **setup:** create initial pages and layout ([94cc451](https://github.com/JNZader/portfolio-2025/commits/94cc4513484eb89626e3593dfa420ecf7bcb64d5))
* **setup:** initialize Next.js 16 project with App Router ([953cdfc](https://github.com/JNZader/portfolio-2025/commits/953cdfc46f9e3aef1a22b3d5367fb9dbe369b0c7))
* **setup:** update package.json with Biome scripts ([e21d1e8](https://github.com/JNZader/portfolio-2025/commits/e21d1e8209d157c1efc2b282025a447cd567b4ce))
