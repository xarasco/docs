import { FunctionComponent, useEffect, useState, useRef } from 'react';
import classNames from 'classnames';

import throttle from 'lodash.throttle';
import { heading } from '../util/generateToc';

import styles from './Toc.module.scss';

interface TocProps {
  headings: heading[];
}

interface locatedHeading extends heading {
  y: number;
  active?: boolean | null;
}

const Toc: FunctionComponent<TocProps> = ({ headings }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const onScrollThrottled = useRef(
    throttle((locatedHeadings: locatedHeading[]) => {
      const y = window.scrollY;
      const foundIndex = locatedHeadings.findIndex(
        (heading) => heading.y < y + 1,
      );
      const active =
        foundIndex === -1 ? 0 : locatedHeadings.length - foundIndex - 1;
      setActiveIndex(active);
    }, 150),
  );

  useEffect(() => {
    const locatedHeadings = headings
      .slice()
      .reverse()
      .map((heading) => {
        const element = document.getElementById(heading.id);

        return {
          ...heading,
          y: element ? element.offsetTop : Infinity,
          active: false,
        };
      });

    const onScroll = (): void => {
      onScrollThrottled.current(locatedHeadings);
    };

    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [headings]);

  if (headings == null || headings.length === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.onThisPage}>On this page</div>
      {headings
        .filter((heading) => heading.level < 5)
        .map((heading, idx) => (
          <a href={`#${heading.id}`} key={heading.id} className={styles.link}>
            <div
              className={classNames(styles.item, {
                [styles.topLevel]: heading.level <= 2,
                [styles.active]: idx === activeIndex,
              })}
              style={{
                marginLeft: Math.max(
                  (heading.level - 2) * (15 - heading.level),
                  0,
                ),
              }}
            >
              {heading.level > 3 ? (
                <span style={{ color: 'lightgrey' }}>• </span>
              ) : null}
              {heading.text}
            </div>
          </a>
        ))}
    </div>
  );
};

export default Toc;
